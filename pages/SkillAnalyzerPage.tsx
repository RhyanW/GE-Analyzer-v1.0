import React, { useState, useEffect } from 'react';
import { PlayerStats } from '../types';
import { getPlayerStats } from '../services/osrs';
import { fetchLatestPrices } from '../services/market';
import PlayerStatsDisplay from '../components/PlayerStatsDisplay';
import { Search, Loader2, AlertTriangle, User } from 'lucide-react';

const SkillAnalyzerPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [prices, setPrices] = useState<any>(null);
    const [prevUsername, setPrevUsername] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Persist username and fetch prices
    useEffect(() => {
        const savedUser = localStorage.getItem('osrs_username');
        if (savedUser) {
            setUsername(savedUser);
            handleFetchStats(savedUser);
        }

        // Fetch prices for the calculator
        fetchLatestPrices().then(data => setPrices(data.data)).catch(err => console.error("Calc prices error:", err));
    }, []);

    const handleFetchStats = async (userToFetch: string) => {
        if (!userToFetch.trim()) return;

        setLoading(true);
        setError(null);
        setStats(null); // Clear previous stats while fetching

        try {
            const data = await getPlayerStats(userToFetch);
            setStats(data);
            setPrevUsername(userToFetch);
            localStorage.setItem('osrs_username', userToFetch);
        } catch (err: any) {
            console.error("Stats fetch error:", err);
            setError(err.message || "Failed to fetch player stats. Ensure the username is correct and the Highscores API is online.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleFetchStats(username);
    };

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto">
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-fantasy text-osrs-gold mb-2">OSRS Skill Analyzer</h2>
                <p className="text-gray-400 text-sm">Track XP, set goals, and calculate efficiency.</p>
            </div>

            {/* Search Bar */}
            <div className={`max-w-md mx-auto mb-8 transition-all duration-500 ${stats ? 'opacity-100' : 'scale-105'}`}>
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className={`w-5 h-5 ${loading ? 'text-osrs-gold animate-pulse' : 'text-gray-500'}`} />
                    </div>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter OSRS Username..."
                        className="w-full bg-black/40 border-2 border-osrs-border rounded-lg py-3 pl-10 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-osrs-gold focus:ring-1 focus:ring-osrs-gold transition-all"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !username.trim()}
                        className="absolute inset-y-0 right-0 px-4 text-gray-400 hover:text-osrs-gold disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-r-lg"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                </form>
                {/* Suggestions or History? Could go here */}
            </div>

            {/* Error Message */}
            {error && (
                <div className="max-w-md mx-auto mb-8 bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg flex items-center gap-3 animate-slide-up">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-sm">Error Fetching Stats</p>
                        <p className="text-xs opacity-80">{error}</p>
                    </div>
                </div>
            )}

            {/* Results Display */}
            {loading && !stats && (
                <div className="text-center py-20 animate-pulse">
                    <Loader2 className="w-12 h-12 text-osrs-gold mx-auto mb-4 animate-spin" />
                    <p className="text-gray-400">Consulting the Highscores...</p>
                </div>
            )}

            {!loading && !stats && !error && (
                <div className="text-center py-12 text-gray-500 italic max-w-lg mx-auto border border-dashed border-gray-700 rounded-lg bg-black/20">
                    <p>Enter a username above to view player statistics.</p>
                </div>
            )}

            {stats && prevUsername && (
                <div className="animate-slide-up">
                    <PlayerStatsDisplay stats={stats} username={prevUsername} prices={prices} />
                </div>
            )}
        </div>
    );
};

export default SkillAnalyzerPage;
