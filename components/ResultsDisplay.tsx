import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MarketResponseData, StrategyType, PlayerStats, ParsedItem, PriceHistoryPoint, AlertType, AlertCategory, MembershipStatus, RiskLevel, WikiPriceData, PriceAlert } from '../types';
import { getNextLevelXp, getItemPriceHistory } from '../services/osrs';
import { fetchLatestPrices } from '../services/market';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Brush, ComposedChart, Line, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Coins, Box, Filter, XCircle, Sparkles, RefreshCw, Clock, Loader2, ArrowRight, Info, LayoutGrid, List, AlertOctagon, X, Globe, LineChart, Calculator, ArrowUpDown, Plus, ArrowUp, ArrowDown, GripVertical, Maximize2, CircleDot, Bell, BellOff, ExternalLink, RefreshCcw, ShieldCheck, Zap } from 'lucide-react';
import OrientationNotice from './OrientationNotice';
import { addAlert, getAlerts } from '../services/alerts';

interface ResultsDisplayProps {
  data: MarketResponseData;
  strategy: StrategyType;
  isRefreshing?: boolean;
  autoRefresh?: boolean;
  lastUpdated?: Date | null;
  playerStats?: PlayerStats | null;
}

type ViewMode = 'grid' | 'list';
type SortField = 'recommended' | 'profit' | 'hourly' | 'roi' | 'limit' | 'volume' | 'buy' | 'sell' | 'name' | 'buyRate' | 'sellRate';

interface SortCriterion {
  field: SortField;
  desc: boolean;
}

/**
 * Helper component to display OSRS Item Icons from the Wiki
 */
/**
 * Helper component to display OSRS Item Icons
 * Tries multiple sources:
 * 1. Runelite Static Cache (ID-based, most reliable)
 * 2. OSRS Wiki (Name-based, good fallback)
 */
const ItemIcon = ({ name, id, size = "sm" }: { name: string, id?: number, size?: "sm" | "lg" }) => {
  const [error, setError] = useState(false);
  const [useWiki, setUseWiki] = useState(false);

  const imageUrl = useMemo(() => {
    // 1. Try Runelite Static Cache first if we have an ID (very reliable)
    if (id && !useWiki) {
      return `https://static.runelite.net/cache/item/icon/${id}.png`;
    }

    // 2. Fallback to Wiki Name-based
    let cleanName = name.trim();
    if (cleanName.length > 0) {
      cleanName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
    }
    const filename = cleanName.replace(/\s+/g, '_');
    return `https://oldschool.runescape.wiki/images/${filename}.png`;
  }, [name, id, useWiki]);

  const sizeClass = size === "lg" ? "w-16 h-16" : "w-8 h-8";

  const handleError = () => {
    if (!useWiki && id) {
      // If Runelite failed, try Wiki
      setUseWiki(true);
    } else {
      // If both failed, show placeholder
      setError(true);
    }
  };

  if (error) {
    return (
      <div className={`${sizeClass} bg-black/30 rounded border border-osrs-border/50 flex items-center justify-center flex-shrink-0`}>
        <Box className={size === "lg" ? "w-8 h-8 text-gray-600" : "w-4 h-4 text-gray-600"} />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={name}
      className={`${sizeClass} object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] flex-shrink-0`}
      onError={handleError}
      loading="lazy"
    />
  );
};

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  data,
  strategy,
  isRefreshing = false,
  autoRefresh = false,
  lastUpdated,
  playerStats
}) => {
  const isAlch = strategy === StrategyType.HIGH_ALCH;

  // Filter State
  const [minLimit, setMinLimit] = useState<number>(0);
  const [minProfit, setMinProfit] = useState<number | ''>('');
  const [maxProfit, setMaxProfit] = useState<string>(''); // Empty string = no max

  // Sort State
  const [sortCriteria, setSortCriteria] = useState<SortCriterion[]>([{ field: 'recommended', desc: true }]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const handleDrop = (index: number) => {
    if (draggedIndex === null || draggedIndex === index) return;

    const newCriteria = [...sortCriteria];
    const [draggedItem] = newCriteria.splice(draggedIndex, 1);
    newCriteria.splice(index, 0, draggedItem);

    setSortCriteria(newCriteria);
    setDraggedIndex(null);
  };

  // View State
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  // Modal State
  const [selectedItem, setSelectedItem] = useState<ParsedItem | null>(null);

  // Chart State (Modal)
  const [chartData, setChartData] = useState<PriceHistoryPoint[]>([]);
  const [loadingChart, setLoadingChart] = useState(false);
  const [zoomState, setZoomState] = useState<{ startIndex: number; endIndex: number } | null>(null);
  const [timeframe, setTimeframe] = useState<'5m' | '1h' | '6h'>('6h');
  const [timeRange, setTimeRange] = useState<'All' | 'Year' | 'Quarter' | 'Month' | 'Week' | 'Day' | '12h' | '6h' | '2h' | '1h' | '30m'>('2h');
  const [isExpanded, setIsExpanded] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true);
  const [alertingItem, setAlertingItem] = useState<ParsedItem | null>(null);
  const [targetAlertPrice, setTargetAlertPrice] = useState<number>(0);
  const [alertCondition, setAlertCondition] = useState<'above' | 'below'>('above');
  const [alertPriceType, setAlertPriceType] = useState<'buy' | 'sell'>('sell');
  const [alertType, setAlertType] = useState<AlertType>(AlertType.PRICE);
  const [alertCategory, setAlertCategory] = useState<AlertCategory>(AlertCategory.FLIPPING);

  // Flip Tracking State
  const [isLogBuy, setIsLogBuy] = useState(false);
  const [purchasePrice, setPurchasePrice] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // For highlighting
  const [activeAlertIds, setActiveAlertIds] = useState<number[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    const refreshActiveAlerts = () => {
      const alerts = getAlerts();
      setActiveAlerts(alerts.filter(a => !a.isNotified));
      setActiveAlertIds(alerts.filter(a => !a.isNotified).map(a => a.id));
    };
    refreshActiveAlerts();
    window.addEventListener('priceAlertsUpdated', refreshActiveAlerts);
    return () => window.removeEventListener('priceAlertsUpdated', refreshActiveAlerts);
  }, []);


  // Fetch chart data when item or timeRange selection changes
  useEffect(() => {
    if (selectedItem) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';

      setLoadingChart(true);


      // Map timeRange to appropriate API timestep
      let targetTimestep: '5m' | '1h' | '6h' | '24h' = '6h';
      if (['30m', '1h', '2h', '6h', '12h', 'Day'].includes(timeRange)) targetTimestep = '5m';
      else if (timeRange === 'Week') targetTimestep = '1h';
      else if (timeRange === 'Month' || timeRange === 'Quarter') targetTimestep = '6h';
      else if (timeRange === 'Year' || timeRange === 'All') targetTimestep = '24h';

      setTimeframe(targetTimestep);

      getItemPriceHistory(selectedItem.id, targetTimestep)
        .then(data => {
          // Calculate cutoff for filtering
          const now = Math.floor(Date.now() / 1000);
          let cutoff = 0;
          if (timeRange === '30m') cutoff = now - 30 * 60;
          else if (timeRange === '1h') cutoff = now - 60 * 60;
          else if (timeRange === '2h') cutoff = now - 2 * 3600;
          else if (timeRange === '6h') cutoff = now - 6 * 3600;
          else if (timeRange === '12h') cutoff = now - 12 * 3600;
          else if (timeRange === 'Day') cutoff = now - 24 * 3600;
          else if (timeRange === 'Week') cutoff = now - 7 * 24 * 3600;
          else if (timeRange === 'Month') cutoff = now - 30 * 24 * 3600;
          else if (timeRange === 'Quarter') cutoff = now - 90 * 24 * 3600;
          else if (timeRange === 'Year') cutoff = now - 365 * 24 * 3600;

          // Sanitize data: Keep prices as null if not present to allow line bridging (connectNulls)
          const sanitizedData = data
            .filter(d => cutoff === 0 || d.timestamp >= cutoff)
            .map(d => ({
              ...d,
              avgHighPrice: (d.avgHighPrice && d.avgHighPrice > 0) ? d.avgHighPrice : null,
              avgLowPrice: (d.avgLowPrice && d.avgLowPrice > 0) ? d.avgLowPrice : null,
              highPriceVolume: d.highPriceVolume ?? 0,
              lowPriceVolume: d.lowPriceVolume ?? 0,
              volume: (d.highPriceVolume ?? 0) + (d.lowPriceVolume ?? 0)
            }))
            // Filter out points where NO data exists at all
            .filter(d => d.avgHighPrice !== null || d.avgLowPrice !== null || d.volume > 0);

          setChartData(sanitizedData);
          setLoadingChart(false);
          setZoomState({ startIndex: 0, endIndex: sanitizedData.length - 1 });
        })
        .catch(err => console.error(err));
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedItem, timeRange]);

  // Filter & Sort Logic


  const displayedItems = useMemo(() => {
    // 1. Filter
    let items = data.parsedItems.filter(item => {
      const passLimit = (item.limit || 0) >= minLimit;
      const passMinProfit = minProfit === '' ? true : item.profit >= minProfit;
      return passLimit && passMinProfit;
    });

    // 2. Sort
    items.sort((a, b) => {
      for (const criterion of sortCriteria) {
        if (criterion.field === 'recommended') continue; // Skip recommended if it's in the list (it's default order)

        let valA: number | string = 0;
        let valB: number | string = 0;

        switch (criterion.field) {
          case 'profit':
            valA = a.profit;
            valB = b.profit;
            break;
          case 'hourly':
            valA = a.hourlyProfit || 0;
            valB = b.hourlyProfit || 0;
            break;
          case 'roi':
            valA = a.roi || 0;
            valB = b.roi || 0;
            break;
          case 'limit':
            valA = a.limit;
            valB = b.limit;
            break;
          case 'volume':
            valA = a.volume || 0;
            valB = b.volume || 0;
            break;
          case 'buy':
            valA = a.buy;
            valB = b.buy;
            break;
          case 'sell':
            valA = a.sell;
            valB = b.sell;
            break;
          case 'buyRate':
            valA = a.buyRate || 0;
            valB = b.buyRate || 0;
            break;
          case 'sellRate':
            valA = a.sellRate || 0;
            valB = b.sellRate || 0;
            break;
          case 'name':
            valA = a.name;
            valB = b.name;
            break;
        }

        if (valA === valB) continue; // Move to next criterion if equal

        if (criterion.field === 'name') {
          return criterion.desc
            ? (valB as string).localeCompare(valA as string)
            : (valA as string).localeCompare(valB as string);
        }

        // Numeric Sort
        return criterion.desc
          ? (valB as number) - (valA as number)
          : (valA as number) - (valB as number);
      }
      return 0; // All criteria equal
    });

    return items;
  }, [data.parsedItems, minLimit, minProfit, sortCriteria]);

  /* Chart Statistics Calculation */
  const chartStats = useMemo(() => {
    if (chartData.length === 0) return null;

    // Only calculate stats for visible data range
    const visibleData = zoomState
      ? chartData.slice(zoomState.startIndex, zoomState.endIndex + 1)
      : chartData;
    if (visibleData.length === 0) return null;

    const highPrices = visibleData.map(d => d.avgHighPrice).filter((p): p is number => p !== null);
    const lowPrices = visibleData.map(d => d.avgLowPrice).filter((p): p is number => p !== null);

    const overallHigh = highPrices.length > 0 ? Math.max(...highPrices) : 0;
    const overallLow = lowPrices.length > 0 ? Math.min(...lowPrices) : 0;

    const buyingHigh = highPrices.length > 0 ? highPrices[highPrices.length - 1] : 0;
    const buyingLow = highPrices.length > 0 ? Math.min(...highPrices) : 0;

    const sellingHigh = lowPrices.length > 0 ? Math.max(...lowPrices) : 0;
    const sellingLow = lowPrices.length > 0 ? lowPrices[lowPrices.length - 1] : 0;

    return {
      overallHigh,
      overallLow,
      buyingHigh,
      buyingLow,
      sellingHigh,
      sellingLow
    };
  }, [chartData, zoomState]);

  const visiblePointCount = zoomState ? zoomState.endIndex - zoomState.startIndex + 1 : chartData.length;
  const shouldRenderDots = showMarkers && visiblePointCount < 100;

  // Calculate dynamic Y-axis domain
  const chartYDomain = useMemo(() => {
    if (!chartData || chartData.length === 0) return ['auto', 'auto'];

    const visibleData = zoomState
      ? chartData.slice(zoomState.startIndex, zoomState.endIndex + 1)
      : chartData;

    let min = Infinity;
    let max = -Infinity;

    visibleData.forEach(d => {
      if (d.avgHighPrice) { min = Math.min(min, d.avgHighPrice); max = Math.max(max, d.avgHighPrice); }
      if (d.avgLowPrice) { min = Math.min(min, d.avgLowPrice); max = Math.max(max, d.avgLowPrice); }
    });

    if (min === Infinity || max === -Infinity) return ['auto', 'auto'];

    const padding = (max - min) * 0.05; // 5% padding
    return [Math.floor(min - padding), Math.ceil(max + padding)];
  }, [chartData, zoomState]);

  // Helper for Max Profit check
  const maxProfitNum = maxProfit === '' ? Infinity : Number(maxProfit);

  // Helper format number
  const formatK = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'm';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  };

  // XP Calculation helper
  const getLevelingStats = (limit: number) => {
    if (!playerStats) return null;

    const xpPerCast = 65;
    const currentLevel = playerStats.magic.level;
    const currentXp = playerStats.magic.xp;
    const nextLevelXp = getNextLevelXp(currentLevel);

    if (nextLevelXp === 0) return { text: "Maxed!", subtext: "Level 99 achieved" };

    const xpNeeded = nextLevelXp - currentXp;
    const physicalLimitPerHour = 1200;
    const geLimitPerHour = limit > 0 ? limit / 4 : physicalLimitPerHour;
    const effectiveSpeedPerHour = Math.min(physicalLimitPerHour, geLimitPerHour);
    const hoursToLevel = xpNeeded / (effectiveSpeedPerHour * xpPerCast);

    return {
      xpNeeded,
      hoursToLevel: hoursToLevel.toFixed(1),
      isGeLimited: geLimitPerHour < physicalLimitPerHour && limit > 0,
      nextLevel: currentLevel + 1,
      effectiveSpeedPerHour
    };
  };

  const getTrendIcon = (trend?: 'UP' | 'DOWN' | 'STABLE') => {
    if (!trend) return null;
    if (trend === 'UP') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (trend === 'DOWN') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  /* Scroll Zoom Handler */
  const handleWheel = (e: React.WheelEvent, dataLength: number) => {
    // Prevent default window scroll when hovering the chart
    // Note: This often requires a ref and adding a non-passive listener,
    // but for React synthetic events we can try updating zoom state.
    // If the chart captures the pointer events, this fires.

    if (!zoomState) return;

    const ZOOM_SPEED = Math.max(1, Math.floor(dataLength * 0.05)); // Zoom 5% of visible range
    const MIN_ZOOM_WINDOW = 10;

    const currentWindowSize = zoomState.endIndex - zoomState.startIndex;
    const direction = Math.sign(e.deltaY);

    let newStartIndex = zoomState.startIndex;
    let newEndIndex = zoomState.endIndex;

    if (direction < 0) {
      // Zoom In
      if (currentWindowSize > MIN_ZOOM_WINDOW) {
        const moveAmount = Math.ceil(ZOOM_SPEED / 2);
        newStartIndex = Math.min(zoomState.startIndex + moveAmount, zoomState.endIndex - MIN_ZOOM_WINDOW);
        newEndIndex = Math.max(zoomState.endIndex - moveAmount, newStartIndex + MIN_ZOOM_WINDOW);
      }
    } else {
      // Zoom Out
      const moveAmount = Math.ceil(ZOOM_SPEED / 2);
      newStartIndex = Math.max(0, zoomState.startIndex - moveAmount);
      newEndIndex = Math.min(dataLength - 1, zoomState.endIndex + moveAmount);
    }

    if (newStartIndex !== zoomState.startIndex || newEndIndex !== zoomState.endIndex) {
      setZoomState({ startIndex: newStartIndex, endIndex: newEndIndex });
    }
  };

  const handleQuickPreset = (preset: 'break-even' | 'roi-3' | 'stop-loss') => {
    if (!alertingItem) return;

    const currentFlip = activeAlerts.find(a => a.id === alertingItem.id && a.isTrackingFlip);
    const effectivePurchasePrice = currentFlip?.purchasePrice || alertingItem.buy;

    switch (preset) {
      case 'break-even':
        setTargetAlertPrice(effectivePurchasePrice);
        setAlertCondition('above');
        setAlertPriceType('sell');
        break;
      case 'roi-3':
        setTargetAlertPrice(Math.round(effectivePurchasePrice * 1.03));
        setAlertCondition('above');
        setAlertPriceType('sell');
        break;
      case 'stop-loss':
        setTargetAlertPrice(Math.round(effectivePurchasePrice * 0.95)); // 5% stop loss
        setAlertCondition('below');
        setAlertPriceType('sell');
        break;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      {/* Refreshing Overlay/Indicator - Keeping this as a secondary visual hint */}
      {isRefreshing && (
        <div className="absolute top-2 right-2 z-50 bg-black/80 text-osrs-gold px-3 py-1 rounded-full flex items-center gap-2 text-xs border border-osrs-gold shadow-lg animate-pulse">
          <Loader2 className="w-3 h-3 animate-spin" /> Refreshing Data...
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-osrs-panel border-2 border-osrs-border rounded-lg p-4 shadow-lg flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-4">
          {/* Last Updated / Status */}
          {isRefreshing ? (
            <div className="flex items-center gap-2 text-sm text-osrs-gold animate-pulse font-bold">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Market Data...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Clock className="w-4 h-4" />
              <span>
                Last Updated: <span className="text-osrs-gold font-mono">{lastUpdated ? lastUpdated.toLocaleTimeString() : 'Just now'}</span>
              </span>
            </div>
          )}

          {playerStats && isAlch && (
            <div className="group relative flex items-center gap-2 text-sm bg-black/30 px-3 py-1 rounded-full border border-purple-900/50 cursor-help">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-purple-200">Lvl {playerStats.magic.level} Magic</span>

              {/* Tooltip for Status Bar */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover:block w-56 p-3 bg-black/95 border border-purple-500 rounded-lg text-xs text-gray-200 shadow-xl z-50 pointer-events-none">
                <div className="font-bold text-purple-300 mb-1">OSRS HiScores Data</div>
                <p>Using your current level to calculate XP remaining and time to next level.</p>
                <div className="mt-1 pt-1 border-t border-purple-900/50 flex justify-between text-[10px] text-gray-400">
                  <span>Current XP:</span>
                  <span className="font-mono">{playerStats.magic.xp.toLocaleString()}</span>
                </div>
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/95 border-b border-r border-purple-500 rotate-45"></div>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Recommended Sort Explanation - Only show if using Recommended sort */}

      {/* Filter & Sort Controls */}
      {data.parsedItems.length > 0 && (
        <div className={`bg-osrs-panel border-2 border-osrs-border rounded-lg p-4 shadow-lg transition-opacity duration-300 ${isRefreshing ? 'opacity-70 pointer-events-none' : 'opacity-100'}`}>
          <div className="flex flex-col md:flex-row items-center justify-between mb-4 border-b border-osrs-border pb-2 gap-4">
            <div className="flex items-center gap-2">
              <Filter className="text-osrs-gold w-5 h-5" />
              <h3 className="text-osrs-gold font-fantasy text-lg">Filter & Sort</h3>
            </div>

            <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="flex bg-black/30 rounded p-1 border border-osrs-border">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'grid' ? 'bg-osrs-border text-osrs-gold' : 'text-gray-500 hover:text-gray-300'}`}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded transition-colors ${viewMode === 'list' ? 'bg-osrs-border text-osrs-gold' : 'text-gray-500 hover:text-gray-300'}`}
                  title="List View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-gray-500">
                Showing {displayedItems.length} of {data.parsedItems.length} items
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Min GE Limit */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 uppercase font-bold">Min GE Limit</label>
              <input
                type="number"
                value={minLimit}
                onChange={(e) => setMinLimit(Number(e.target.value))}
                className="bg-black/30 border border-osrs-border rounded px-3 py-2 text-white text-sm focus:border-osrs-gold outline-none"
                placeholder="e.g. 1000"
              />
            </div>

            {/* Min Profit */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 uppercase font-bold">Min Profit (GP)</label>
              <input
                type="number"
                value={minProfit}
                onChange={(e) => setMinProfit(e.target.value === '' ? '' : Number(e.target.value))}
                className="bg-black/30 border border-osrs-border rounded px-3 py-2 text-white text-sm focus:border-osrs-gold outline-none"
                placeholder="e.g. 100"
              />
            </div>

            {/* Max Profit */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-400 uppercase font-bold">Max Profit (Filter)</label>
              <input
                type="number"
                value={maxProfit}
                onChange={(e) => setMaxProfit(e.target.value)}
                className="bg-black/30 border border-osrs-border rounded px-3 py-2 text-white text-sm focus:border-osrs-gold outline-none focus:bg-black/50 transition-colors"
                placeholder="Highlight items > this amount"
              />
            </div>

            {/* Sort Control */}
            <div className="flex flex-col gap-1 col-span-1 sm:col-span-2 md:col-span-4 lg:col-span-1">
              <label className="text-xs text-gray-400 uppercase font-bold">Sort By</label>
              <div className="flex flex-col gap-2">
                {/* Add Sort Dropdown */}
                <div className="relative group/sort">
                  <select
                    onChange={(e) => {
                      const field = e.target.value as SortField;
                      if (field && !sortCriteria.some(c => c.field === field)) {
                        setSortCriteria([...sortCriteria.filter(c => c.field !== 'recommended'), { field, desc: true }]);
                      }
                      e.target.value = ""; // Reset select
                    }}
                    className="w-full bg-black/30 border border-osrs-border rounded px-3 py-2 text-white text-sm focus:border-osrs-gold outline-none appearance-none cursor-pointer"
                    defaultValue=""
                  >
                    <option value="" disabled>+ Add Sort Criterion</option>
                    <option value="hourly" className="bg-osrs-panel text-gray-200">Hourly Profit</option>
                    <option value="profit" className="bg-osrs-panel text-gray-200">Profit (Per Item)</option>
                    <option value="roi" className="bg-osrs-panel text-gray-200">ROI %</option>
                    <option value="limit" className="bg-osrs-panel text-gray-200">GE Limit</option>
                    <option value="volume" className="bg-osrs-panel text-gray-200">24h Volume</option>
                    <option value="buyRate" className="bg-osrs-panel text-gray-200">Buy Rate</option>
                    <option value="sellRate" className="bg-osrs-panel text-gray-200">Sell Rate</option>
                    <option value="buy" className="bg-osrs-panel text-gray-200">Buy Price</option>
                    <option value="sell" className="bg-osrs-panel text-gray-200">Sell Price</option>
                    <option value="name" className="bg-osrs-panel text-gray-200">Name</option>
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>

                {/* Active Sort Chips */}
                <div className="flex flex-wrap gap-2">
                  {sortCriteria.map((criterion, idx) => (
                    <div
                      key={idx}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(idx)}
                      className={`flex items-center gap-1 bg-osrs-gold/20 border border-osrs-gold/50 rounded px-2 py-1 text-xs text-osrs-gold cursor-move ${draggedIndex === idx ? 'opacity-50' : 'opacity-100'} transition-opacity`}
                    >
                      <GripVertical className="w-3 h-3 text-osrs-gold/50 mr-1" />
                      <span className="font-bold">
                        {criterion.field === 'recommended' ? 'Recommended' :
                          criterion.field === 'hourly' ? 'Hourly' :
                            criterion.field === 'buyRate' ? 'Buy Rate' :
                              criterion.field === 'sellRate' ? 'Sell Rate' :
                                criterion.field === 'profit' ? 'Profit (Item)' :
                                  criterion.field.charAt(0).toUpperCase() + criterion.field.slice(1)}
                      </span>
                      <button
                        onClick={() => {
                          const newCriteria = [...sortCriteria];
                          newCriteria[idx].desc = !newCriteria[idx].desc;
                          setSortCriteria(newCriteria);
                        }}
                        className="hover:text-white transition-colors"
                        title={criterion.desc ? "Descending" : "Ascending"}
                      >
                        {criterion.desc ? <ArrowDown className="w-3 h-3" /> : <ArrowUp className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => {
                          const newCriteria = sortCriteria.filter((_, i) => i !== idx);
                          if (newCriteria.length === 0) {
                            setSortCriteria([{ field: 'recommended', desc: true }]);
                          } else {
                            setSortCriteria(newCriteria);
                          }
                        }}
                        className="hover:text-red-400 transition-colors ml-1"
                        title="Remove"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Analysis */}
      {data.aiAnalysis && (
        <div className={`bg-black/40 border border-purple-500/50 rounded-lg p-6 shadow-[0_0_15px_rgba(168,85,247,0.15)] transition-opacity duration-300 ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="text-lg font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-300">
              Market Analysis
            </h3>
          </div>
          <p className="text-purple-100/90 leading-relaxed text-sm italic border-l-2 border-purple-500/30 pl-4">
            "{data.aiAnalysis}"
          </p>
        </div>
      )}

      {/* Help / Explanation Section */}
      <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6 text-sm text-gray-300">
        <h4 className="text-blue-400 font-bold mb-2 flex items-center gap-2">
          <Info className="w-4 h-4" /> How calculations work
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-bold text-white mb-1">Risk Appetite:</p>
            <ul className="list-disc list-inside text-xs space-y-1 text-gray-400">
              <li><span className="text-green-400 font-bold">Low Risk:</span> High Liquidity Only (GE Limit &ge; 500 OR Daily Vol &ge; 2,000) AND ROI &le; 5%.</li>
              <li><span className="text-yellow-400 font-bold">Medium Risk:</span> Moderate Liquidity (Limit &ge; 50 OR Daily Vol &ge; 500).</li>
              <li><span className="text-red-400 font-bold">High Risk:</span> No restrictions. Includes low-volume & high-volatility items.</li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-white mb-1">Recommended Sort (Hourly Profit):</p>
            <p className="text-xs text-gray-400 mb-1">
              Calculated as <span className="text-osrs-gold">Profit/Item &times; Valid Volume</span>.
            </p>
            <p className="text-xs text-gray-400">
              "Valid Volume" is the <u>lowest</u> of:
            </p>
            <ul className="list-disc list-inside text-xs space-y-1 text-gray-400 ml-2">
              <li>Your Budget Capacity (buying power).</li>
              <li>GE Limit (per 4 hours).</li>
              <li>Effective Market Rate (30% of actual trade volume).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* No Items Fallback */}
      {displayedItems.length === 0 && data.parsedItems.length > 0 && (
        <div className="bg-osrs-panel border border-osrs-border rounded-lg p-8 text-center text-gray-500">
          <XCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No items match your filters.</p>
          <button
            onClick={() => { setMinLimit(0); setMinProfit(''); setMaxProfit(''); }}
            className="text-osrs-gold text-sm hover:underline mt-2"
          >
            Clear Filters
          </button>
        </div>
      )}



      {/* Detailed Trade Cards Section */}
      {displayedItems.length > 0 && (
        <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'flex flex-col'} gap-4 transition-opacity duration-300 ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
          {displayedItems.map((item, idx) => {
            const isOverMax = item.profit > maxProfitNum;
            const rawMargin = item.sell - item.buy;
            const impliedCost = rawMargin - item.profit;
            const hasImpliedCost = impliedCost > 0;
            const potentialXp = item.limit * 65;
            const levelingInfo = (isAlch && playerStats) ? getLevelingStats(item.limit) : null;
            const trendIcon = getTrendIcon(item.trend);

            return (
              <div
                key={idx}
                onClick={() => setSelectedItem(item)}
                className={`
                  bg-osrs-panel border rounded-lg p-4 relative group transition-all cursor-pointer flex flex-col h-full
                  ${isOverMax ? 'opacity-50 grayscale hover:grayscale-0 hover:opacity-100 border-dashed border-gray-600' :
                    (isAlch ? 'border-purple-900 hover:border-purple-500' : 'border-osrs-border hover:border-osrs-gold shadow-sm hover:shadow-md')}
                `}
              >
                {/* Outlier Badge */}
                {isOverMax && (
                  <div className="absolute -top-3 right-4 bg-gray-700 text-gray-200 text-[10px] px-2 py-0.5 rounded-full border border-gray-500 flex items-center gap-1 shadow-md z-10">
                    <AlertOctagon className="w-3 h-3" /> High Outlier
                  </div>
                )}

                {/* Header Row */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="mt-1 flex-shrink-0">
                      <ItemIcon name={item.name} id={item.id} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-fantasy text-osrs-yellow leading-tight truncate md:whitespace-normal group-hover:text-osrs-gold transition-colors" title={item.name}>
                        {item.name}
                      </h3>
                      {/* Trend Indicator Mobile/Grid */}
                      {trendIcon && (
                        <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-0.5">
                          {trendIcon}
                          <span className="font-mono">{item.trend}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <div className="flex items-center gap-1.5 self-end">
                      {activeAlerts.find(a => a.id === item.id && a.isTrackingFlip) && (
                        <div className="flex items-center gap-1 bg-black/40 border border-osrs-yellow/30 px-1.5 py-0.5 rounded shadow-sm" title="Active Flip Tracking">
                          <Coins size={10} className="text-osrs-gold animate-bounce" />
                          <span className="text-[8px] text-osrs-yellow font-bold tracking-tighter">ACTIVE</span>
                        </div>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setAlertingItem(item);
                          setTargetAlertPrice(item.sell);
                          setAlertCondition('above');
                          setAlertPriceType('sell');
                          setAlertType(AlertType.PRICE);
                          setAlertCategory(AlertCategory.FLIPPING);
                          setIsLogBuy(false);
                          setPurchasePrice(item.buy);
                          setQuantity(item.limit || 1);
                        }}
                        className={`p-1 px-1.5 rounded border transition-all flex items-center gap-1 text-[9px] font-bold ${activeAlertIds.includes(item.id) ? 'bg-osrs-gold text-black border-osrs-gold shadow-lg shadow-osrs-gold/10' : 'border-osrs-gold/40 text-osrs-gold hover:bg-osrs-gold hover:text-black'}`}
                      >
                        <Bell size={10} className={activeAlertIds.includes(item.id) ? 'fill-current' : ''} />
                        Alert
                      </button>
                    </div>

                    <span className={`text-[10px] font-mono font-bold px-1.5 py-1 rounded border whitespace-nowrap shadow-sm ${isAlch ? 'text-purple-300 bg-purple-900/30 border-purple-800/50' : (item.roi < 0 ? 'text-rose-500 bg-rose-950/30 border-rose-900/40' : 'text-emerald-500 bg-emerald-950/30 border-emerald-900/40')}`}>
                      ROI: {item.roi?.toFixed(1) || '0.0'}%
                    </span>
                  </div>
                </div>


                {/* Content Layout */}
                <div className={`flex-1 ${viewMode === 'list' ? 'flex flex-col md:flex-row gap-4' : 'flex flex-col gap-2'}`}>

                  {/* Left Column (Stats) */}
                  <div className={`flex-1 ${viewMode === 'list' ? 'min-w-[200px]' : ''}`}>
                    <div className="flex items-center justify-between text-sm mb-3 px-2 py-1 bg-black/20 rounded border border-osrs-border/10">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Box className="w-3 h-3" />
                        <span className="text-xs uppercase">GE Limit</span>
                      </div>
                      <span className="font-mono text-osrs-orange">
                        {item.limit ? item.limit.toLocaleString() : 'Unknown'} / 4h
                      </span>
                    </div>

                    <div className="flex flex-col gap-1 mb-3 px-2 py-1 bg-black/20 rounded border border-osrs-border/10">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1 text-gray-400">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-xs uppercase">24h Vol</span>
                        </div>
                        <span className="font-mono text-blue-300">
                          {item.volume ? formatK(item.volume) : '?'}
                        </span>
                      </div>
                      {/* Volume Split */}
                      {/* Volume Split & Rates */}
                      {(item.volumeHigh !== undefined && item.volumeLow !== undefined) && (
                        <div className="flex flex-col gap-1 border-t border-gray-700/50 pt-1 mt-1">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span title="High Price Volume (Aggressive Buys)" className="text-green-400/90">Vol H: {formatK(item.volumeHigh)}</span>
                            <span title="Low Price Volume (Aggressive Sells)" className="text-red-400/90">Vol L: {formatK(item.volumeLow)}</span>
                          </div>
                          {(item.buyRate !== undefined && item.sellRate !== undefined) && (
                            <div className="flex justify-between text-[10px] font-mono bg-black/20 rounded px-1">
                              <span title="Est. Buy Rate (items/hr)" className="text-gray-300">Buy: <span className="text-white">{Math.round(item.buyRate).toLocaleString()}</span>/hr</span>
                              <span title="Est. Sell Rate (items/hr)" className="text-gray-300">Sell: <span className="text-white">{Math.round(item.sellRate).toLocaleString()}</span>/hr</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="bg-black/30 p-2 rounded mb-3 space-y-1 text-xs font-mono text-gray-300 border border-osrs-border/10">
                      <div className="flex justify-between">
                        <span className="text-gray-500">{isAlch ? 'High Alch' : 'Sell Price'}</span>
                        <span>{item.sell.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">- {isAlch ? 'Buy Price' : 'Buy Price'}</span>
                        <span className="text-red-400">-{item.buy.toLocaleString()}</span>
                      </div>
                      {hasImpliedCost && (
                        <div className="flex justify-between border-b border-gray-700 pb-1">
                          <span className="text-gray-500">- {isAlch ? 'Nat Rune' : 'GE Tax (2%)'}</span>
                          <span className="text-red-400">-{impliedCost.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 font-bold">
                        <span className="text-osrs-gold uppercase text-[10px] tracking-tighter">= Margin</span>
                        <span className={item.profit < 0 ? 'text-rose-500' : 'text-emerald-400'}>
                          {item.profit < 0 ? '-' : ''}{Math.abs(item.profit).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column (Leveling & Totals) */}
                  <div className={`flex-1 flex flex-col justify-between ${viewMode === 'list' ? 'border-l border-osrs-border/20 pl-4' : ''}`}>

                    {levelingInfo && (
                      <div className="group/tooltip relative mb-3 bg-purple-900/20 border border-purple-900/50 rounded p-2 text-xs cursor-help">
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 hidden group-hover/tooltip:block w-64 p-3 bg-black/95 border border-osrs-gold rounded-lg text-xs text-gray-200 shadow-xl z-50 pointer-events-none">
                          <p className="font-bold text-osrs-gold mb-2">Efficiency Calculation</p>
                          <ul className="space-y-1 list-disc pl-3 text-gray-300">
                            <li><strong className="text-white">XP/Cast:</strong> 65 Magic XP</li>
                            <li><strong className="text-white">Max Speed:</strong> ~1,200 casts/hr</li>
                            <li><strong className="text-white">Effective Speed:</strong> {Math.floor(levelingInfo.effectiveSpeedPerHour).toLocaleString()} casts/hr</li>
                          </ul>
                          <p className="mt-2 text-gray-400 italic text-[10px]">
                            Time is determined by the slower of your casting speed or the GE Buy Limit for this item.
                          </p>
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black/95 border-b border-r border-osrs-gold rotate-45"></div>
                        </div>

                        <div className="flex items-center justify-between mb-1">
                          <span className="text-purple-300 font-bold flex items-center gap-1">
                            <ArrowRight className="w-3 h-3" /> Lvl {levelingInfo.nextLevel}
                          </span>
                          <span className="text-gray-400">{levelingInfo.xpNeeded.toLocaleString()} XP left</span>
                        </div>
                        <div className="text-gray-300">
                          Time: <span className="text-white font-bold">{levelingInfo.hoursToLevel} hrs</span>
                        </div>
                        {levelingInfo.isGeLimited && (
                          <div className="text-[10px] text-red-400 mt-1 italic flex items-center gap-1">
                            <Info className="w-3 h-3" /> Slowed by GE Limit ({item.limit / 4}/hr)
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`border-t pt-3 flex items-center justify-between mt-auto ${isAlch ? 'bg-purple-900/20 border-purple-900' : 'bg-osrs-panel/50 border-osrs-border'}`}>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-osrs-gold">
                          <Coins className="w-4 h-4" />
                          <span className="text-xs font-bold uppercase">{isAlch ? 'Net Profit' : 'Profit'}</span>
                        </div>

                        <div className="flex flex-col mt-1">
                          {item.hourlyProfit && (
                            <span className="text-[10px] text-osrs-gold font-bold">
                              Est. {formatK(item.hourlyProfit)} / hr
                            </span>
                          )}
                          {item.limit > 0 && (
                            <span className="text-[10px] text-gray-500">
                              Max: {formatK(item.profit * item.limit)} / 4h
                            </span>
                          )}
                          {isAlch && item.limit > 0 && (
                            <div className="flex items-center gap-1 text-[10px] text-purple-400">
                              <Sparkles className="w-3 h-3" />
                              <span>+{potentialXp.toLocaleString()} XP/4h</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <span className={`text-lg font-bold font-mono ${item.profit < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                        {item.profit < 0 ? '-' : ''}{Math.abs(item.profit).toLocaleString()} gp
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedItem && createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div
            className="bg-osrs-bg border-y-2 lg:border-2 border-osrs-gold rounded-none lg:rounded-lg shadow-2xl w-screen h-screen lg:w-auto lg:h-auto lg:max-w-[70vw] lg:max-h-[90vh] flex flex-col relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-osrs-border bg-osrs-panel flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ItemIcon name={selectedItem.name} id={selectedItem.id} size="lg" />
                <div>
                  <h2 className="text-2xl font-fantasy text-osrs-gold">{selectedItem.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${isAlch ? 'text-purple-300 border-purple-800' : 'text-green-500 border-green-900'}`}>
                      {isAlch ? 'High Alchemy Strategy' : 'Flipping Strategy'}
                    </span>
                    {selectedItem.trend && (
                      <span className="text-[10px] font-mono flex items-center gap-1 text-gray-400 bg-black/30 px-2 py-0.5 rounded border border-gray-700">
                        {getTrendIcon(selectedItem.trend)} {selectedItem.trend} Trend
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedItem(null)} className="text-gray-400 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto custom-scrollbar">
              {/* Primary Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-black/30 p-3 rounded border border-osrs-border/30 text-center">
                  <span className="text-xs text-gray-400 block mb-1">Buy Price</span>
                  <span className="text-lg font-mono text-white">{selectedItem.buy.toLocaleString()}</span>
                  {selectedItem.guidePrice && (
                    <div className="text-[10px] text-gray-500 mt-1 border-t border-gray-700 pt-1" title="Official GE Guide Price">
                      GE: {formatK(selectedItem.guidePrice)}
                    </div>
                  )}
                </div>
                <div className="bg-black/30 p-3 rounded border border-osrs-border/30 text-center">
                  <span className="text-xs text-gray-400 block mb-1">{isAlch ? 'High Alch' : 'Sell Price'}</span>
                  <span className="text-lg font-mono text-white">{selectedItem.sell.toLocaleString()}</span>
                </div>
                <div className="bg-black/30 p-3 rounded border border-osrs-border/30 text-center relative overflow-hidden">
                  <div className={`absolute top-0 left-0 w-1 h-full ${selectedItem.profit > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-gray-400 block mb-1">Margin</span>
                  <span className={`text-lg font-mono font-bold ${selectedItem.profit > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {selectedItem.profit.toLocaleString()}
                  </span>
                  {selectedItem.hourlyProfit && (
                    <span className="block text-[10px] text-osrs-gold mt-1">
                      ~{formatK(selectedItem.hourlyProfit)}/hr
                    </span>
                  )}
                </div>
                <div className="bg-black/30 p-3 rounded border border-osrs-border/30 text-center">
                  <span className="text-xs text-gray-400 block mb-1">Limit (4h)</span>
                  <span className="text-lg font-mono text-osrs-orange">
                    {selectedItem.limit > 0 ? selectedItem.limit.toLocaleString() : '?'}
                  </span>
                </div>
                <div className="bg-black/30 p-3 rounded border border-osrs-border/30 text-center col-span-2 sm:col-span-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-400">24h Volume & Rates</span>
                    <span className="text-lg font-mono text-blue-300">
                      {selectedItem.volume ? selectedItem.volume.toLocaleString() : '?'}
                    </span>
                  </div>

                  {(selectedItem.volumeHigh !== undefined && selectedItem.volumeLow !== undefined) && (
                    <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-black/20 p-2 rounded">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-500 uppercase text-[10px]">Buying Side</span>
                        <span className="text-green-400" title="High Price Volume">Vol: {formatK(selectedItem.volumeHigh)}</span>
                        {selectedItem.sellRate && <span className="text-gray-300">Est. Sell Rate: {Math.round(selectedItem.sellRate).toLocaleString()}/hr</span>}
                      </div>
                      <div className="flex flex-col gap-1 border-l border-gray-700 pl-4">
                        <span className="text-gray-500 uppercase text-[10px]">Selling Side</span>
                        <span className="text-red-400" title="Low Price Volume">Vol: {formatK(selectedItem.volumeLow)}</span>
                        {selectedItem.buyRate && <span className="text-gray-300">Est. Buy Rate: {Math.round(selectedItem.buyRate).toLocaleString()}/hr</span>}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profit Breakdown */}
              <div className="mb-6 bg-black/20 p-3 rounded border border-osrs-border/50 font-mono text-sm">
                <div className="flex justify-between border-b border-gray-700 pb-2 mb-2">
                  <span className="text-gray-400 flex items-center gap-1"><Calculator className="w-3 h-3" /> Breakdown</span>
                  <span className="text-gray-400">Amount</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-300">{isAlch ? 'High Alch Value' : 'Sell Price'}</span>
                  <span className="text-white">{selectedItem.sell.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">- Buy Price</span>
                  <span className="text-red-400">-{selectedItem.buy.toLocaleString()}</span>
                </div>
                {(() => {
                  const modalRawMargin = selectedItem.sell - selectedItem.buy;
                  const modalImpliedCost = modalRawMargin - selectedItem.profit;
                  const modalHasImpliedCost = modalImpliedCost > 0;

                  if (modalHasImpliedCost) {
                    return (
                      <div className="flex justify-between">
                        <span className="text-gray-400">- {isAlch ? 'Nature Rune Cost' : 'GE Tax (1%)'}</span>
                        <span className="text-red-400">-{modalImpliedCost.toLocaleString()}</span>
                      </div>
                    );
                  }
                  return null;
                })()}
                <div className="flex justify-between border-t border-gray-700 pt-2 mt-2 font-bold">
                  <span className="text-osrs-gold">Net Profit</span>
                  <span className={selectedItem.profit < 0 ? 'text-rose-500' : 'text-emerald-400'}>
                    {selectedItem.profit < 0 ? '-' : ''}{Math.abs(selectedItem.profit).toLocaleString()} gp
                  </span>
                </div>
              </div>

              {/* Price History Chart */}
              <div className="mb-6 bg-black/30 rounded border border-osrs-border p-4">
                <div className="flex flex-col lg:flex-row justify-between lg:items-center mb-4 gap-4">
                  <h3 className="text-osrs-gold font-fantasy text-lg flex items-center gap-2">
                    <LineChart className="w-5 h-5" /> Price & Volume History
                  </h3>

                  <div className="flex items-center gap-2 flex-wrap lg:flex-nowrap">
                    <div className="flex flex-wrap gap-1 md:gap-2 bg-black/50 rounded p-1 border border-osrs-border/50">
                      {(['All', 'Year', 'Quarter', 'Month', 'Week', 'Day', '12h', '6h', '2h', '1h', '30m'] as const).map((range) => (
                        <button
                          key={range}
                          onClick={() => setTimeRange(range)}
                          className={`px-3 py-1 text-[10px] font-bold rounded transition-colors ${timeRange === range ? 'bg-osrs-gold text-black' : 'text-gray-400 hover:text-white'}`}
                        >
                          {range}
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-2 ml-auto lg:ml-0 bg-black/30 p-1 rounded border border-white/5">
                      <button
                        onClick={() => setShowMarkers(!showMarkers)}
                        className={`p-1.5 rounded transition-colors ${showMarkers ? 'text-osrs-gold bg-black/50' : 'text-gray-400 hover:text-white hover:bg-black/50'}`}
                        title={showMarkers ? "Hide Markers" : "Show Markers"}
                      >
                        <CircleDot className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => setIsExpanded(true)}
                        className="p-1.5 text-gray-400 hover:text-osrs-gold hover:bg-black/50 rounded transition-colors"
                        title="Expand Chart"
                      >
                        <Maximize2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {loadingChart ? (
                  <div className="h-64 flex items-center justify-center text-gray-500 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Fetching market history...
                  </div>
                ) : chartData.length > 0 ? (
                  <div className="flex flex-col gap-2 min-h-0 min-w-0" onWheel={(e) => handleWheel(e, chartData.length)}>
                    <div className="h-64 w-full min-w-0 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={chartData} syncId="priceVolumeSync" margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3e3529" vertical={false} opacity={0.5} />
                          <XAxis
                            dataKey="timestamp"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            hide
                          />
                          <YAxis
                            yAxisId="price"
                            domain={chartYDomain}
                            stroke="#f59e0b"
                            fontSize={10}
                            tickFormatter={(val) => `${formatK(val)}`}
                            orientation="right"
                            width={45}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                // Access the raw data object from the first payload item
                                const data = payload[0].payload;
                                return (
                                  <div className="bg-osrs-bg border border-osrs-gold p-2 text-xs text-white shadow-xl">
                                    <p className="font-bold mb-1 border-b border-gray-700 pb-1">{new Date(label * 1000).toLocaleString()}</p>

                                    <div className="flex items-center gap-2 mb-1">
                                      <div className="w-2 h-2 rounded-full bg-[#f59e0b]"></div>
                                      <span className="text-gray-300">Offer Price (High):</span>
                                      <span className="font-mono">{data.avgHighPrice?.toLocaleString()} GP</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-[#3b82f6]"></div>
                                      <span className="text-gray-300">Request Price (Low):</span>
                                      <span className="font-mono">{data.avgLowPrice?.toLocaleString()} GP</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line
                            yAxisId="price"
                            type="monotone"
                            dataKey="avgHighPrice"
                            stroke="#f59e0b"
                            strokeWidth={3}
                            dot={shouldRenderDots ? { r: 4, fill: '#f59e0b', strokeWidth: 0 } : false}
                            connectNulls={true}
                            activeDot={{ r: 6, fill: '#f59e0b', stroke: '#fff', strokeWidth: 2 }}
                            isAnimationActive={false}
                          />
                          <Line
                            yAxisId="price"
                            type="monotone"
                            dataKey="avgLowPrice"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            dot={shouldRenderDots ? { r: 4, fill: '#3b82f6', strokeWidth: 0 } : false}
                            connectNulls={true}
                            activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }}
                            isAnimationActive={false}
                          />


                          {selectedItem.guidePrice && (
                            <ReferenceLine
                              yAxisId="price"
                              y={selectedItem.guidePrice}
                              stroke="#6b7280"
                              strokeDasharray="3 3"
                            />
                          )}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="h-40 w-full min-w-0 min-h-0 bg-osrs-bg">
                      <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <ComposedChart data={chartData} syncId="priceVolumeSync" margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3e3529" vertical={false} opacity={0.5} />
                          <XAxis
                            dataKey="timestamp"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(unixTime) => {
                              const date = new Date(unixTime * 1000);
                              if (timeRange === '2h' || timeRange === '6h' || timeRange === '12h' || timeRange === 'Day') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                            }}
                            stroke="#6b7280"
                            fontSize={10}
                          />
                          <YAxis
                            yAxisId="volume"
                            domain={[0, 'auto']}
                            orientation="right"
                            stroke="#6b7280"
                            fontSize={10}
                            tickFormatter={(val) => formatK(val)}
                            width={45}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#111', borderColor: '#d4af37', color: '#fff', fontSize: '12px' }}
                            labelFormatter={(unixTime) => new Date(unixTime * 1000).toLocaleString()}
                            formatter={(value: number, name: string) => {
                              if (name === 'highPriceVolume') return [value.toLocaleString(), 'Buy Volume'];
                              if (name === 'lowPriceVolume') return [value.toLocaleString(), 'Sell Volume'];
                              return [value, name];
                            }}
                          />
                          <Bar yAxisId="volume" dataKey="highPriceVolume" name="Buy Volume" stackId="a" fill="#f59e0b" opacity={0.8} isAnimationActive={false} />
                          <Bar yAxisId="volume" dataKey="lowPriceVolume" name="Sell Volume" stackId="a" fill="#3b82f6" opacity={0.8} isAnimationActive={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Stats Summary Table */}
                    {chartStats ? (
                      <div className="bg-black/40 border border-osrs-border/30 rounded-lg overflow-hidden shadow-inner">
                        <div className="grid grid-cols-3 text-center border-b border-osrs-border/30">
                          <div className="p-3 border-r border-osrs-border/30">
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Overall High</span>
                            <span className="text-sm font-mono text-white">{chartStats.overallHigh.toLocaleString()}</span>
                          </div>
                          <div className="p-3 border-r border-osrs-border/30">
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Buying High</span>
                            <span className="text-sm font-mono text-white">{chartStats.buyingHigh.toLocaleString()}</span>
                          </div>
                          <div className="p-3">
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Selling High</span>
                            <span className="text-sm font-mono text-white">{chartStats.sellingHigh.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 text-center">
                          <div className="p-3 border-r border-osrs-border/30">
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Overall Low</span>
                            <span className="text-sm font-mono text-white font-bold text-osrs-orange">{chartStats.overallLow.toLocaleString()}</span>
                          </div>
                          <div className="p-3 border-r border-osrs-border/30">
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Buying Low</span>
                            <span className="text-sm font-mono text-white font-bold text-osrs-orange">{chartStats.buyingLow.toLocaleString()}</span>
                          </div>
                          <div className="p-3">
                            <span className="text-[10px] text-gray-500 uppercase block mb-1">Selling Low</span>
                            <span className="text-sm font-mono text-white font-bold text-osrs-orange">{chartStats.sellingLow.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 p-4">No statistical data available for the current range.</div>
                    )}
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center text-gray-500 italic">
                    No historical price data found for this item.
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-6">
                <h3 className="text-osrs-gold font-fantasy text-lg mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5" /> Analysis
                </h3>
                <div className="bg-black/20 p-4 rounded border border-osrs-border text-gray-300 leading-relaxed text-sm">
                  {selectedItem.description ? (
                    <p>{selectedItem.description}</p>
                  ) : (
                    <p className="italic text-gray-500">No detailed analysis provided for this item.</p>
                  )}
                </div>
              </div>

              {/* External Links */}
              <h3 className="text-osrs-gold font-fantasy text-lg mb-3">External Tools</h3>
              <div className="flex flex-wrap gap-3">
                <a
                  href={`https://oldschool.runescape.wiki/w/${selectedItem.name.replace(/\s+/g, '_')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#2e1a14] hover:bg-[#3f241c] border border-[#5d3822] rounded text-[#d6bd96] font-bold transition-colors"
                >
                  <Globe className="w-4 h-4" /> OSRS Wiki
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-osrs-border bg-black/40 text-xs text-gray-500 text-center">
              Prices are estimates based on {timeframe === '5m' ? '5-minute' : '6-hour'} Wiki data intervals. Always verify before trading.
            </div>
          </div>
        </div>
        , document.body)}

      {/* Expanded Chart Modal */}
      {isExpanded && selectedItem && createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-2 md:p-4 bg-black/95 backdrop-blur-md animate-in fade-in zoom-in duration-200" style={{ zIndex: 2100 }}>
          <div className="bg-[#1e1e1e] border border-osrs-gold rounded-lg shadow-2xl w-full h-full max-w-[98vw] max-h-[95vh] flex flex-col overflow-hidden">
            {/* Header - Two Tiered on Mobile */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between p-3 md:p-4 border-b border-osrs-border bg-osrs-border/30 shrink-0 gap-3">
              {/* Row 1/Left: Item Identity */}
              <div className="flex items-center justify-between lg:justify-start gap-2 md:gap-3 min-w-0">
                <div className="flex items-center gap-2 md:gap-3 min-w-0">
                  <ItemIcon name={selectedItem.name} id={selectedItem.id} size="sm" />
                  <h3 className="text-osrs-gold font-bold text-sm md:text-xl tracking-wide truncate">
                    {selectedItem.name}
                    <span className="text-gray-400 text-xs md:text-lg font-sans hidden md:inline ml-2 opacity-50">
                      | Price & Volume Analysis
                    </span>
                  </h3>
                </div>
                {/* Mobile-only Close button in top row */}
                <button
                  onClick={() => setIsExpanded(false)}
                  className="lg:hidden p-1.5 hover:bg-white/10 rounded-full transition-colors text-gray-400"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Row 2/Right: Controls */}
              <div className="flex items-center justify-between lg:justify-end gap-2 md:gap-4 shrink-0">
                <div className="flex flex-wrap gap-1 md:gap-2 bg-black/50 rounded p-1 border border-osrs-border/50">
                  {(['All', 'Year', 'Quarter', 'Month', 'Week', 'Day', '12h', '6h', '2h', '1h', '30m'] as const).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`px-2 md:px-3 py-1 text-[10px] md:text-xs font-bold rounded transition-colors whitespace-nowrap ${timeRange === range ? 'bg-osrs-gold text-black' : 'text-gray-400 hover:text-white'}`}
                    >
                      {range}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 md:gap-2 border-l border-white/10 pl-2 md:pl-4">
                  <button
                    onClick={() => setShowMarkers(!showMarkers)}
                    className={`p-1.5 md:p-2 rounded-full transition-colors ${showMarkers ? 'text-osrs-gold bg-white/10' : 'text-gray-400 hover:text-white hover:bg-white/10'}`}
                    title="Toggle Data Points"
                  >
                    <CircleDot className="w-4 h-4 md:w-6 md:h-6" />
                  </button>

                  <button
                    onClick={() => setIsExpanded(false)}
                    className="hidden lg:flex p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
                  >
                    <X className="w-5 h-5 md:w-8 md:h-8" />
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 md:p-6 flex flex-col gap-4 overflow-hidden bg-osrs-bg" onWheel={(e) => handleWheel(e, chartData.length)}>
              {loadingChart ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-osrs-gold bg-osrs-panel rounded border border-osrs-border/30">
                  <Loader2 className="w-12 h-12 animate-spin opacity-50" />
                  <p className="font-fantasy text-xl animate-pulse">Consulting the Grand Exchange Archives...</p>
                </div>
              ) : chartData.length > 0 ? (
                <>
                  {/* Top: Price Chart */}
                  <div className="flex-[3] w-full min-h-[250px] min-w-0 min-h-0 bg-osrs-panel rounded border border-osrs-border/30 p-2 relative">
                    <div className="absolute top-2 left-2 z-10 bg-black/60 px-2 py-0.5 rounded text-osrs-gold text-[10px] font-bold border border-osrs-gold/30">Price History</div>
                    <div className="w-full h-full min-w-0 min-h-0">
                      <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <ComposedChart data={chartData} syncId="expandedSync">
                          <defs>
                            <linearGradient id="colorHighExp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3e3529" vertical={false} opacity={0.3} />
                          <XAxis dataKey="timestamp" type="number" domain={['dataMin', 'dataMax']} hide />
                          <YAxis
                            yAxisId="price"
                            domain={chartYDomain}
                            stroke="#f59e0b"
                            fontSize={10}
                            tickFormatter={(val) => `${formatK(val)}`}
                            orientation="right"
                            tick={{ fill: '#9ca3af' }}
                            width={45}
                          />
                          <Tooltip
                            content={({ active, payload, label }) => {
                              if (active && payload && payload.length) {
                                const d = payload[0].payload;
                                return (
                                  <div className="bg-osrs-bg border border-osrs-gold p-2 text-[10px] md:text-sm text-white shadow-xl min-w-[150px]">
                                    <p className="font-bold mb-1 border-b border-gray-700 pb-1 text-osrs-gold">{new Date(label * 1000).toLocaleString()}</p>
                                    <div className="flex justify-between gap-4">
                                      <span className="text-gray-300">Offer:</span>
                                      <span className="font-mono text-[#f59e0b]">{d.avgHighPrice?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                      <span className="text-gray-300">Request:</span>
                                      <span className="font-mono text-[#3b82f6]">{d.avgLowPrice?.toLocaleString()}</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Line
                            yAxisId="price"
                            type="monotone"
                            dataKey="avgHighPrice"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={showMarkers ? { r: 3, fill: '#f59e0b' } : false}
                            connectNulls={true}
                            isAnimationActive={false}
                          />
                          <Line
                            yAxisId="price"
                            type="monotone"
                            dataKey="avgLowPrice"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={showMarkers ? { r: 3, fill: '#3b82f6' } : false}
                            connectNulls={true}
                            isAnimationActive={false}
                          />
                          {selectedItem.guidePrice && (
                            <ReferenceLine yAxisId="price" y={selectedItem.guidePrice} stroke="#6b7280" strokeDasharray="3 3" />
                          )}
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Bottom: Volume Chart */}
                  <div className="flex-1 w-full min-h-[150px] min-w-0 min-h-0 bg-osrs-panel rounded border border-osrs-border/30 p-2 relative">
                    <div className="absolute top-2 left-2 z-10 bg-black/60 px-2 py-0.5 rounded text-blue-400 text-[10px] font-bold border border-blue-400/30">Volume History</div>
                    <div className="w-full h-full min-w-0 min-h-0">
                      <ResponsiveContainer width="100%" height="100%" debounce={100}>
                        <ComposedChart data={chartData} syncId="expandedSync" margin={{ bottom: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3e3529" vertical={false} opacity={0.3} />
                          <XAxis
                            dataKey="timestamp"
                            type="number"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(unixTime) => {
                              const date = new Date(unixTime * 1000);
                              if (timeRange === '2h' || timeRange === '6h' || timeRange === 'Day') return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                              return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
                            }}
                            stroke="#6b7280"
                            fontSize={9}
                          />
                          <YAxis yAxisId="volume" domain={[0, 'auto']} orientation="right" stroke="#6b7280" fontSize={9} tickFormatter={formatK} width={45} />
                          <Bar yAxisId="volume" dataKey="highPriceVolume" name="Buy" stackId="a" fill="#f59e0b" opacity={0.8} isAnimationActive={false} />
                          <Bar yAxisId="volume" dataKey="lowPriceVolume" name="Sell" stackId="a" fill="#3b82f6" opacity={0.8} isAnimationActive={false} />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 italic bg-osrs-panel rounded border border-osrs-border/30">
                  No historical data available for this timeframe.
                </div>
              )}
            </div>
          </div>
        </div>
        , document.body)}

      {/* Main Text Content */}
      <div className={`bg-osrs-panel border border-osrs-border rounded-lg p-6 shadow-xl transition-opacity duration-300 ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
        <p className="text-gray-300 leading-relaxed italic">
          {data.text}
        </p>
      </div>

      {/* Price Alert Modal */}
      {alertingItem && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-osrs-panel border-2 border-osrs-gold rounded-lg w-full max-w-sm shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-osrs-border p-4 flex justify-between items-center border-b border-osrs-gold/30">
              <h3 className="text-osrs-gold font-bold text-xl flex items-center gap-2">
                <Bell size={20} /> Set Price Alert
              </h3>
              <button onClick={() => setAlertingItem(null)} className="text-gray-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3">
                <ItemIcon name={alertingItem.name} id={alertingItem.id} />
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-osrs-gold leading-tight">{alertingItem.name}</h2>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">ID: {alertingItem.id}</p>
                    {alertingItem.volume < 1000 && (
                      <div className="flex items-center gap-1 text-osrs-orange animate-pulse">
                        <AlertTriangle size={10} />
                        <span className="text-[9px] font-bold uppercase">Low Volume Warning</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Alert when price is</label>
                <div className="flex bg-black/40 p-1 rounded border border-white/10">
                  <button
                    onClick={() => setAlertCondition('above')}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${alertCondition === 'above' ? 'bg-osrs-gold text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Above or Equal
                  </button>
                  <button
                    onClick={() => setAlertCondition('below')}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${alertCondition === 'below' ? 'bg-osrs-gold text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Below or Equal
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">On Price Type</label>
                <div className="flex bg-black/40 p-1 rounded border border-white/10">
                  <button
                    onClick={() => {
                      setAlertPriceType('buy');
                      setTargetAlertPrice(alertingItem.buy);
                    }}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${alertPriceType === 'buy' ? 'bg-osrs-gold text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Buy (Offer)
                  </button>
                  <button
                    onClick={() => {
                      setAlertPriceType('sell');
                      setTargetAlertPrice(alertingItem.sell);
                    }}
                    className={`flex-1 py-1.5 rounded text-xs font-bold transition-all ${alertPriceType === 'sell' ? 'bg-osrs-gold text-black' : 'text-gray-400 hover:text-white'}`}
                  >
                    Sell (Request)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Quick-Set Presets</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => handleQuickPreset('break-even')}
                    className="bg-osrs-panel border border-osrs-border/50 text-[10px] py-1.5 rounded hover:bg-osrs-gold hover:text-black hover:border-osrs-gold transition-all font-bold font-mono"
                  >
                    BREAK-EVEN
                  </button>
                  <button
                    onClick={() => handleQuickPreset('roi-3')}
                    className="bg-osrs-panel border border-osrs-border/50 text-[10px] py-1.5 rounded hover:bg-osrs-gold hover:text-black hover:border-osrs-gold transition-all font-bold font-mono"
                  >
                    3% ROI
                  </button>
                  <button
                    onClick={() => handleQuickPreset('stop-loss')}
                    className="bg-osrs-panel border border-osrs-border/50 text-[10px] py-1.5 rounded hover:bg-red-500 hover:text-white hover:border-red-500 transition-all font-bold font-mono"
                  >
                    STOP LOSS
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Alert Type / Category</label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={alertType}
                    onChange={(e) => setAlertType(e.target.value as AlertType)}
                    className="bg-black/50 border border-osrs-border rounded px-2 py-1.5 text-[11px] text-white outline-none focus:border-osrs-gold"
                  >
                    {Object.values(AlertType).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <select
                    value={alertCategory}
                    onChange={(e) => setAlertCategory(e.target.value as AlertCategory)}
                    className="bg-black/50 border border-osrs-border rounded px-2 py-1.5 text-[11px] text-white outline-none focus:border-osrs-gold"
                  >
                    {Object.values(AlertCategory).map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-osrs-border/30">
                <div
                  onClick={() => setIsLogBuy(!isLogBuy)}
                  className="flex justify-between items-center cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isLogBuy ? 'bg-osrs-gold border-osrs-gold' : 'border-osrs-border group-hover:border-osrs-gold/50'}`}>
                      {isLogBuy && <ShieldCheck size={12} className="text-black" />}
                    </div>
                    <span className="text-xs font-bold text-gray-300">Log this as a Buy (Active Flip)</span>
                  </div>
                </div>

                {isLogBuy && (
                  <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-top-2 duration-200">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">Purchase Price</label>
                      <input
                        type="number"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(Number(e.target.value))}
                        className="w-full bg-black/50 border border-osrs-border rounded px-2 py-1.5 text-xs text-white outline-none focus:border-osrs-gold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-500 uppercase font-bold">Quantity</label>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="w-full bg-black/50 border border-osrs-border rounded px-2 py-1.5 text-xs text-white outline-none focus:border-osrs-gold"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs text-gray-400 uppercase font-bold tracking-wider">Target Price (GP)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={targetAlertPrice}
                    onChange={(e) => setTargetAlertPrice(Number(e.target.value))}
                    className="w-full bg-black/50 border border-osrs-border rounded px-4 py-2 text-white font-mono focus:border-osrs-gold outline-none"
                    placeholder="Enter price..."
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-osrs-orange font-bold pointer-events-none">
                    GP
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setTargetAlertPrice(prev => prev + 1000)}
                    className="bg-black/40 border border-white/5 text-[10px] px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  >+1k</button>
                  <button
                    onClick={() => setTargetAlertPrice(prev => prev + 10000)}
                    className="bg-black/40 border border-white/5 text-[10px] px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  >+10k</button>
                  <button
                    onClick={() => setTargetAlertPrice(prev => prev + 100000)}
                    className="bg-black/40 border border-white/5 text-[10px] px-2 py-1 rounded hover:bg-white/10 transition-colors"
                  >+100k</button>
                  <button
                    onClick={() => setTargetAlertPrice(prev => Math.max(0, prev - 1000))}
                    className="bg-black/40 border border-white/5 text-[10px] px-2 py-1 rounded hover:bg-white/10 transition-colors ml-auto"
                  >-1k</button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-osrs-border border-t border-osrs-gold/20 flex gap-3">
              <button
                onClick={() => setAlertingItem(null)}
                className="flex-1 py-2 rounded border border-white/10 text-gray-400 font-bold text-sm hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  addAlert({
                    id: alertingItem.id,
                    name: alertingItem.name,
                    targetPrice: targetAlertPrice,
                    initialPrice: alertPriceType === 'buy' ? alertingItem.buy : alertingItem.sell,
                    priceType: alertPriceType,
                    condition: alertCondition,
                    alertType: alertType,
                    category: alertCategory,
                    isTrackingFlip: isLogBuy,
                    purchasePrice: isLogBuy ? purchasePrice : undefined,
                    quantity: isLogBuy ? quantity : undefined
                  });
                  setAlertingItem(null);
                }}
                className="flex-1 py-2 rounded bg-osrs-gold text-black font-bold text-sm hover:brightness-110 shadow-lg transition-all"
              >
                Set Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
