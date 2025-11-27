import { FlipSettings, MarketResponseData, ParsedItem, StrategyType, WikiItemMapping, WikiLatestResponse, MembershipStatus, RiskLevel } from "../types";


const PROXY_URL = 'https://corsproxy.io/?';
const MAPPING_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';
const LATEST_PRICES_URL = 'https://prices.runescape.wiki/api/v1/osrs/latest';
const VOLUME_24H_URL = 'https://prices.runescape.wiki/api/v1/osrs/24h';
const NATURE_RUNE_ID = 561;

// In-memory cache
let mappingCache: WikiItemMapping[] | null = null;

/**
 * Fetches static item data (IDs, names, limits, alch values)
 */
const fetchItemMapping = async (): Promise<WikiItemMapping[]> => {
  if (mappingCache) return mappingCache;
  try {
    const response = await fetch(PROXY_URL + encodeURIComponent(MAPPING_URL));
    if (!response.ok) throw new Error("Failed to fetch item mapping");
    const data = await response.json();
    mappingCache = data;
    return data;
  } catch (error) {
    console.error("Mapping fetch error:", error);
    throw new Error("Could not load OSRS item database.");
  }
};

/**
 * Fetches real-time buy/sell prices
 */
const fetchLatestPrices = async (): Promise<WikiLatestResponse> => {
  try {
    const response = await fetch(PROXY_URL + encodeURIComponent(LATEST_PRICES_URL));
    if (!response.ok) throw new Error("Failed to fetch latest prices");
    return await response.json();
  } catch (error) {
    console.error("Price fetch error:", error);
    throw new Error("Could not load real-time prices.");
  }
};

/**
 * Fetches 24h volume data
 */
const fetch24hVolume = async (): Promise<any> => {
  try {
    const response = await fetch(PROXY_URL + encodeURIComponent(VOLUME_24H_URL));
    if (!response.ok) throw new Error("Failed to fetch 24h volume");
    return await response.json();
  } catch (error) {
    console.error("Volume fetch error:", error);
    return { data: {} }; // Return empty data on failure so app doesn't crash
  }
};

/**
 * Core Algorithm
 */
export const analyzeMarket = async (settings: FlipSettings): Promise<MarketResponseData> => {
  const [mapping, pricesData, volumeData] = await Promise.all([
    fetchItemMapping(),
    fetchLatestPrices(),
    fetch24hVolume()
  ]);
  const prices = pricesData.data;
  const volumes = volumeData.data;

  // 1. Determine Nature Rune Price (for Alch)
  const natureRunePrice = prices[NATURE_RUNE_ID]?.low || 200; // Fallback if api fails

  let candidates: ParsedItem[] = [];

  // 2. Filter & Calculate
  for (const item of mapping) {
    // Filter: Specific Item Name (check first for efficiency)
    if (settings.itemName && settings.itemName.trim() !== "") {
      if (!item.name.toLowerCase().includes(settings.itemName.toLowerCase())) continue;
    }

    const priceData = prices[item.id];

    // Basic Validity Checks
    if (!priceData) continue; // No trade data
    if (!item.limit) continue; // Unknown limit usually means untradeable or obscure

    // Filter: Price Age (Data Freshness)
    // Ignore prices older than 1 hour (3600 seconds)
    const now = Math.floor(Date.now() / 1000);
    const MAX_AGE = 3600;
    if (!priceData.highTime || !priceData.lowTime) continue;
    if ((now - priceData.highTime > MAX_AGE) || (now - priceData.lowTime > MAX_AGE)) continue;

    // Strategy Logic
    let buyPrice = 0;
    let sellPrice = 0;
    let profit = 0;
    let roi = 0;

    // Filter: Membership
    if (settings.membership === MembershipStatus.F2P && item.members) continue;

    // Filter: Budget (Must be able to buy at least 1)
    // We use 'high' as buy price for instant buying, 'low' for patient buying.
    // Conservative estimate: Buy at 'low' (ask), Sell at 'high' (bid)
    const currentBuyPrice = priceData.low;
    const currentSellPrice = priceData.high;

    if (!currentBuyPrice || !currentSellPrice) continue;
    // Skip budget check if budget is 0 or if searching for a specific item
    const isSpecificItemSearch = settings.itemName && settings.itemName.trim() !== "";
    if (!isSpecificItemSearch && settings.budget > 0 && currentBuyPrice > settings.budget) continue;

    if (settings.strategy === StrategyType.HIGH_ALCH) {
      if (!item.highalch) continue;

      buyPrice = currentSellPrice; // You usually insta-buy or buy mid for alching
      sellPrice = item.highalch;

      const cost = buyPrice + natureRunePrice;
      profit = sellPrice - cost;
      roi = (profit / cost) * 100;

    } else {
      // FLIPPING STRATEGY
      buyPrice = currentBuyPrice;
      sellPrice = currentSellPrice;

      // GE Tax: 1% capped at 5M
      const tax = Math.min(sellPrice * 0.01, 5000000);

      profit = (sellPrice - buyPrice) - tax;
      roi = (profit / buyPrice) * 100;

      // Filter: Suspicious Spread (Scam/Manipulation Protection)
      // If sell price is > 3x buy price, it's likely a scam or dead item
      if (sellPrice > buyPrice * 3) continue;
    }

    // Filter: Minimum Profit
    if (profit <= 0) continue;

    // Filter: Minimum ROI (relaxed for specific item searches)
    // Ignore items with < 1% ROI (unless High Alch, where volume matters more)
    if (!isSpecificItemSearch && settings.strategy === StrategyType.FLIPPING && roi < 1) continue;

    // Filter: Risk/Volume Heuristic (Approximation using Buy Limit)
    // Low Limit = High Risk (Illiquid). High Limit = Low Risk (Liquid)
    // Relaxed limits to find more items
    if (settings.risk === RiskLevel.LOW && item.limit < 500) continue;
    if (settings.risk === RiskLevel.MEDIUM && item.limit < 50) continue;
    // High risk accepts anything

    // Get Volume
    const volData = volumes[item.id];
    const volumeHigh = volData ? volData.highPriceVolume : 0;
    const volumeLow = volData ? volData.lowPriceVolume : 0;
    const volume24h = volumeHigh + volumeLow;

    // Calculate Hourly Profit
    const buyRate = volumeLow / 24;
    const sellRate = volumeHigh / 24;

    // We are limited by the slower of the two rates (buying or selling)
    const effectiveRate = Math.min(buyRate, sellRate);

    // We are also limited by the GE limit (per 4 hours, so limit/4 per hour)
    const geLimitHourly = item.limit > 0 ? item.limit / 4 : effectiveRate;

    // Budget Constraint: How many can we afford to buy?
    // If budget is 0 (no limit set), maxBuyable is Infinity
    const maxBuyableTotal = settings.budget > 0 ? Math.floor(settings.budget / buyPrice) : Infinity;

    // Effective Hourly Limit: Min of (Market Rate, GE Limit, Budget Capacity)
    // We assume you can turn over your budget once per hour as a baseline for "Hourly Profit"
    // This prevents showing 100M/hr profit on a 10M budget
    const actualHourlyRate = Math.min(effectiveRate, geLimitHourly, maxBuyableTotal);

    const hourlyProfit = profit * actualHourlyRate;

    // Potential Profit per 4h window (capped by budget)
    const potentialProfit = profit * Math.min(item.limit, maxBuyableTotal);

    // Add to candidates
    candidates.push({
      id: item.id,
      name: item.name,
      buy: buyPrice,
      sell: sellPrice,
      profit: Math.floor(profit),
      limit: item.limit,
      roi: roi,
      potentialProfit: potentialProfit,
      volume: volume24h,
      volumeHigh,
      volumeLow,
      hourlyProfit,
      buyRate,
      sellRate,
      guidePrice: item.value, // Wiki mapping provides this as 'value'
      trend: calculateTrend(currentBuyPrice, currentSellPrice, volData),
      description: generateDescription(item, profit, roi, settings.strategy, volume24h)
    });
  }

  // 3. Sort Results
  // Sort by Hourly Profit for robustness, falling back to potential profit
  candidates.sort((a, b) => (b.hourlyProfit || 0) - (a.hourlyProfit || 0));

  // 4. Slice to result count
  const topResults = candidates.slice(0, settings.resultCount);

  // 5. Generate Text Summary
  const summary = `Analyzed **${mapping.length}** items. Found **${candidates.length}** profitable opportunities based on your budget of ${settings.budget.toLocaleString()} GP. Top recommendation: **${topResults[0]?.name || 'None'}**.`;

  return {
    text: summary,
    parsedItems: topResults
  };
};

const generateDescription = (item: WikiItemMapping, profit: number, roi: number, strategy: StrategyType, volume: number): string => {
  const roundedProfit = Math.round(profit);
  if (strategy === StrategyType.HIGH_ALCH) {
    return `Alching ${item.name} yields ${roundedProfit.toLocaleString()}gp profit per cast. With a buy limit of ${item.limit}, you can potentially make ${(roundedProfit * item.limit).toLocaleString()}gp every 4 hours. ROI: ${roi.toFixed(1)}%.`;
  } else {
    return `${item.name} has a margin of ${roundedProfit.toLocaleString()}gp (after tax). It is a ${item.members ? 'Members' : 'F2P'} item with a buy limit of ${item.limit} and 24h volume of ${volume.toLocaleString()}. ROI: ${roi.toFixed(1)}%.`;
  }
};

const calculateTrend = (currentBuy: number, currentSell: number, volData: any): 'UP' | 'DOWN' | 'STABLE' => {
  if (!volData || !volData.avgHighPrice || !volData.avgLowPrice) return 'STABLE';

  const avgHigh = volData.avgHighPrice;
  const avgLow = volData.avgLowPrice;

  // Calculate percentage difference
  const highDiff = (currentSell - avgHigh) / avgHigh;
  const lowDiff = (currentBuy - avgLow) / avgLow;

  // Average the differences
  const avgDiff = (highDiff + lowDiff) / 2;

  // Thresholds (e.g., 3% change)
  const THRESHOLD = 0.03;

  if (avgDiff > THRESHOLD) return 'UP';
  if (avgDiff < -THRESHOLD) return 'DOWN';
  return 'STABLE';
};
