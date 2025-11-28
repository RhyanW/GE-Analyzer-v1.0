import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import FlipForm from './components/FlipForm';
import ResultsDisplay from './components/ResultsDisplay';
import PlayerStatsDisplay from './components/PlayerStatsDisplay';

import { analyzeMarket } from './services/market';
import { getPlayerStats } from './services/osrs';
import { FlipSettings, MarketResponseData, StrategyType, PlayerStats } from './types';
import { Activity } from 'lucide-react';

const App: React.FC = () => {
  const [loading, setLoading] = useState(false); // Initial full page load or manual refresh
  const [isRefreshing, setIsRefreshing] = useState(false); // Background refresh
  const [data, setData] = useState<MarketResponseData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastStrategy, setLastStrategy] = useState<StrategyType>(StrategyType.FLIPPING);

  // Stats State
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);

  // Refresh State
  const [currentSettings, setCurrentSettings] = useState<FlipSettings | null>(null);
  // Auto-refresh is now always on (5 minutes)
  const autoRefresh = true;
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const handleSearch = async (settings: FlipSettings) => {
    setLoading(true);
    setError(null);
    setPlayerStats(null); // Reset stats as username/context might change
    setLastStrategy(settings.strategy);
    setCurrentSettings(settings);
    setLastUpdated(null);

    try {
      // Create a safe promise for stats
      const statsPromise = (settings.username && settings.username.trim().length > 0)
        ? getPlayerStats(settings.username).catch((statsErr) => {
          console.warn("Stats fetch failed gracefully:", statsErr);
          return null;
        })
        : Promise.resolve(null);

      // Execute in parallel
      const [marketResult, statsResult] = await Promise.all([
        analyzeMarket(settings),
        statsPromise
      ]);

      setData(marketResult);

      if (statsResult) {
        setPlayerStats(statsResult);
      }

      setLastUpdated(new Date());

    } catch (err: any) {
      console.error("Error during search:", err);
      setError(err.message || "Failed to fetch market data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Auto Refresh Effect
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (autoRefresh && currentSettings && !loading) {
      intervalId = setInterval(async () => {
        setIsRefreshing(true);
        try {
          const result = await analyzeMarket(currentSettings);
          setData(result);
          setLastUpdated(new Date());
        } catch (err) {
          console.error("Auto-refresh failed:", err);
        } finally {
          setIsRefreshing(false);
        }
      }, 300000); // 5 minutes
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, currentSettings, loading]);

  // Combined busy state for ResultsDisplay
  const isBusy = isRefreshing || (loading && !!data);

  return (
    <Layout>
      <div className="container mx-auto px-4">


        <FlipForm onSearch={handleSearch} isLoading={loading || isRefreshing} />

        {error && (
          <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg text-center animate-pulse mb-8">
            <p className="font-bold">Market Analysis Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Initial Loading State (No Data) */}
        {loading && !data && (
          <div className="text-center py-20 animate-pulse">
            <Activity className="w-16 h-16 text-osrs-gold mx-auto mb-4 animate-bounce" />
            <h3 className="text-xl font-fantasy text-osrs-gold">Calculating Margins...</h3>
            <p className="text-gray-500 text-sm mt-2">Scanning 3,000+ Items from Wiki API</p>
          </div>
        )}

        {/* Show Stats ONLY if we have stats AND we are in Player Lookup mode OR we just looked up a user */}
        {playerStats && currentSettings?.username && (lastStrategy === StrategyType.PLAYER_LOOKUP || currentSettings.strategy === StrategyType.PLAYER_LOOKUP) && (
          <PlayerStatsDisplay stats={playerStats} username={currentSettings.username} />
        )}

        {/* Show Market Results ONLY if we have data AND we are NOT in Player Lookup mode */}
        {data && lastStrategy !== StrategyType.PLAYER_LOOKUP && (
          <ResultsDisplay
            data={data}
            strategy={lastStrategy}
            isRefreshing={isBusy} // Pass combined busy state
            autoRefresh={autoRefresh}
            lastUpdated={lastUpdated}
            playerStats={playerStats}
          />
        )}
      </div>
    </Layout>
  );
};

export default App;