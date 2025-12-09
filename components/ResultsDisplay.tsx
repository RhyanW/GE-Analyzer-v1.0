
import React, { useState, useMemo, useEffect } from 'react';
import { MarketResponseData, StrategyType, PlayerStats, ParsedItem, PriceHistoryPoint } from '../types';
import { getNextLevelXp, getItemPriceHistory } from '../services/osrs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area, Brush } from 'recharts';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Coins, Box, Filter, XCircle, Sparkles, RefreshCw, Clock, Loader2, ArrowRight, Info, LayoutGrid, List, AlertOctagon, X, Globe, LineChart, Calculator, ArrowUpDown, Plus, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

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
  const [minProfit, setMinProfit] = useState<number>(0);
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

  // Fetch chart data when item is selected
  useEffect(() => {
    if (selectedItem) {
      // Lock body scroll
      document.body.style.overflow = 'hidden';

      setLoadingChart(true);
      setChartData([]);
      try {
        getItemPriceHistory(selectedItem.id)
          .then(data => {
            setChartData(data);
            setZoomState({ startIndex: 0, endIndex: data.length - 1 });
          })
          .catch(err => console.error(err))
          .finally(() => setLoadingChart(false));
      } catch (e) {
        console.warn("Chart data fetch skipped or failed", e);
        setLoadingChart(false);
      }
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to ensure scroll is restored if component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedItem]);

  // Filter & Sort Logic
  const displayedItems = useMemo(() => {
    // 1. Filter
    let items = data.parsedItems.filter(item => {
      const passLimit = item.limit >= minLimit;
      const passMinProfit = item.profit >= minProfit;
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

  const handleWheel = (e: React.WheelEvent) => {
    if (!zoomState || chartData.length === 0) return;

    e.preventDefault();
    e.stopPropagation();

    const { startIndex, endIndex } = zoomState;
    const currentRange = endIndex - startIndex;
    const zoomFactor = 0.1; // 10% zoom per scroll
    const zoomAmount = Math.max(1, Math.round(currentRange * zoomFactor));

    let newStart = startIndex;
    let newEnd = endIndex;

    if (e.deltaY < 0) {
      // Zoom In
      newStart = startIndex + zoomAmount;
      newEnd = endIndex - zoomAmount;
    } else {
      // Zoom Out
      newStart = startIndex - zoomAmount;
      newEnd = endIndex + zoomAmount;
    }

    // Clamp values
    if (newStart < 0) newStart = 0;
    if (newEnd >= chartData.length) newEnd = chartData.length - 1;

    // Minimum range check (e.g., at least 5 points)
    if (newEnd - newStart < 5) {
      // If we hit min range, try to keep centered but don't shrink further
      const center = Math.floor((startIndex + endIndex) / 2);
      newStart = center - 2;
      newEnd = center + 3;
      if (newStart < 0) { newStart = 0; newEnd = 5; }
      if (newEnd >= chartData.length) { newEnd = chartData.length - 1; newStart = newEnd - 5; }
    }

    setZoomState({ startIndex: newStart, endIndex: newEnd });
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
      {sortCriteria.some(c => c.field === 'recommended') && (
        <div className="bg-black/40 border border-osrs-border/50 rounded-lg p-4 text-sm flex items-start gap-4">
          <div className="bg-osrs-gold/10 p-2 rounded-full border border-osrs-gold/30 shrink-0">
            <Calculator className="w-5 h-5 text-osrs-gold" />
          </div>
          <div className="space-y-1">
            <h4 className="text-osrs-gold font-bold">How is "Recommended" Calculated?</h4>
            <p className="text-gray-400">
              The AI Score evaluates every item based on a weighted formula to find the safest and most profitable flips:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2 mt-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                <span className="font-bold text-white">ROI Priority:</span> Favors higher margins.
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span className="font-bold text-white">Volume Check:</span> Ensures liquidity for quick trades.
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <span className="font-bold text-white">Stability:</span> Avoids highly volatile "crash" items.
              </div>
            </div>
          </div>
        </div>
      )}

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
                onChange={(e) => setMinProfit(Number(e.target.value))}
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

      {/* No Items Fallback */}
      {displayedItems.length === 0 && data.parsedItems.length > 0 && (
        <div className="bg-osrs-panel border border-osrs-border rounded-lg p-8 text-center text-gray-500">
          <XCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p>No items match your filters.</p>
          <button
            onClick={() => { setMinLimit(0); setMinProfit(0); setMaxProfit(''); }}
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
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="mt-1 flex-shrink-0">
                      <ItemIcon name={item.name} id={item.id} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-fantasy text-osrs-yellow leading-tight break-words" title={item.name}>
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
                  <span className={`text-xs font-mono font-bold px-2 py-1 rounded border whitespace-nowrap ml-2 flex-shrink-0 ${isAlch ? 'text-purple-300 bg-purple-900/30 border-purple-800' : 'text-green-500 bg-green-900/30 border-green-900/50'}`}>
                    ROI: {item.roi?.toFixed(1) || '0.0'}%
                  </span>
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
                          <span className="text-gray-500">- {isAlch ? 'Nat Rune' : 'GE Tax (1%)'}</span>
                          <span className="text-red-400">-{impliedCost.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-1 font-bold">
                        <span className="text-osrs-gold">= Margin</span>
                        <span className="text-green-400">{item.profit.toLocaleString()}</span>
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
                      <span className="text-lg font-bold text-green-400 font-mono">
                        {item.profit.toLocaleString()} gp
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div
            className="bg-osrs-panel border-2 border-osrs-gold rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-osrs-border bg-black/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <ItemIcon name={selectedItem.name} id={selectedItem.id} size="lg" />
                <div>
                  <h2 className="text-2xl font-fantasy text-osrs-yellow">{selectedItem.name}</h2>
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
                  <span className="text-green-400">{selectedItem.profit.toLocaleString()} gp</span>
                </div>
              </div>

              {/* Price History Chart */}
              <div className="mb-6 bg-black/30 rounded border border-osrs-border p-4">
                <h3 className="text-osrs-gold font-fantasy text-lg mb-4 flex items-center gap-2">
                  <LineChart className="w-5 h-5" /> Price History (Avg High - 6h)
                </h3>

                {loadingChart ? (
                  <div className="h-48 flex items-center justify-center text-gray-500 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading historical data...
                  </div>
                ) : chartData.length > 0 ? (
                  <div className="h-48 w-full" onWheel={handleWheel}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#d4af37" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#3e3529" vertical={false} />
                        <XAxis
                          dataKey="timestamp"
                          type="number"
                          domain={['dataMin', 'dataMax']}
                          tickFormatter={(unixTime) => new Date(unixTime * 1000).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                          stroke="#6b7280"
                          fontSize={10}
                        />
                        <YAxis
                          domain={['auto', 'auto']}
                          stroke="#6b7280"
                          fontSize={10}
                          tickFormatter={(val) => `${formatK(val)}`}
                        />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1e1e1e', borderColor: '#d4af37', color: '#fff' }}
                          labelFormatter={(unixTime) => new Date(unixTime * 1000).toLocaleDateString() + ' ' + new Date(unixTime * 1000).toLocaleTimeString()}
                          formatter={(value: number) => [value.toLocaleString() + ' GP', 'Avg High Price']}
                        />
                        <Area type="monotone" dataKey="avgHighPrice" stroke="#d4af37" fillOpacity={1} fill="url(#colorPrice)" />
                        <Brush
                          dataKey="timestamp"
                          height={30}
                          stroke="#d4af37"
                          fill="#1e1e1e"
                          tickFormatter={(unixTime) => new Date(unixTime * 1000).toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}
                          startIndex={zoomState?.startIndex}
                          endIndex={zoomState?.endIndex}
                          onChange={(newIndex) => {
                            if (newIndex && typeof newIndex.startIndex === 'number' && typeof newIndex.endIndex === 'number') {
                              setZoomState({ startIndex: newIndex.startIndex, endIndex: newIndex.endIndex });
                            }
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
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
              Prices are estimates based on search data. Always verify before trading.
            </div>
          </div>
        </div>
      )}



      {/* Main Text Content */}
      <div className={`bg-osrs-panel border border-osrs-border rounded-lg p-6 shadow-xl transition-opacity duration-300 ${isRefreshing ? 'opacity-70' : 'opacity-100'}`}>
        <p className="text-gray-300 leading-relaxed">
          {data.text}
        </p>
      </div>

      {/* Warning */}

    </div>
  );
};

export default ResultsDisplay;
