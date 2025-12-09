import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FlipForm from '../components/FlipForm';
import ResultsDisplay from '../components/ResultsDisplay';
import { analyzeMarket } from '../services/market';
import { FlipSettings, MarketResponseData, StrategyType } from '../types';
import { Activity } from 'lucide-react';

const GEFlipperPage: React.FC = () => {
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [data, setData] = useState<MarketResponseData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [lastStrategy, setLastStrategy] = useState<StrategyType>(StrategyType.FLIPPING);
    const [currentSettings, setCurrentSettings] = useState<FlipSettings | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    // Auto-refresh is always on (5 minutes)
    const autoRefresh = true;

    const handleSearch = async (settings: FlipSettings) => {
        // If Player Lookup is selected, redirect to Skill Analyzer
        if (settings.strategy === StrategyType.PLAYER_LOOKUP) {
            navigate('/skills', { state: { username: settings.username } });
            return;
        }

        setLoading(true);
        setError(null);
        setLastStrategy(settings.strategy);
        setCurrentSettings(settings);
        setLastUpdated(null);
        setData(null);

        try {
            const marketResult = await analyzeMarket(settings);
            setData(marketResult);
            setLastUpdated(new Date());
        } catch (err: any) {
            console.error("Error during search:", err);
            setError(err.message || "Failed to fetch market data.");
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

    const isBusy = isRefreshing || (loading && !!data);

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto">
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-fantasy text-osrs-gold mb-2">Grand Exchange Flipper</h2>
                <p className="text-gray-400 text-sm">Automated market analysis and margin checking.</p>
            </div>

            <FlipForm
                onSearch={handleSearch}
                isLoading={loading || isRefreshing}
                hideStrategySelector={true}
                initialStrategy={StrategyType.FLIPPING}
            />

            {error && (
                <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg text-center animate-pulse mb-8">
                    <p className="font-bold">Market Analysis Failed</p>
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {/* Initial Loading State */}
            {loading && !data && (
                <div className="text-center py-20 animate-pulse">
                    <Activity className="w-16 h-16 text-osrs-gold mx-auto mb-4 animate-bounce" />
                    <h3 className="text-xl font-fantasy text-osrs-gold">Scanning Markets...</h3>
                    <p className="text-gray-500 text-sm mt-2">Analyzing 3,000+ Items from Wiki API</p>
                </div>
            )}

            {data && (
                <ResultsDisplay
                    data={data}
                    strategy={lastStrategy}
                    isRefreshing={isBusy}
                    autoRefresh={autoRefresh}
                    lastUpdated={lastUpdated}
                    playerStats={null} // Flipper page doesn't show inline stats anymore
                />
            )}
        </div>
    );
};

export default GEFlipperPage;
