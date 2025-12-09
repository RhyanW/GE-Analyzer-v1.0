import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, User, Loader2, AlertCircle } from 'lucide-react';
import PlayerStatsDisplay from '../components/PlayerStatsDisplay';
import { getPlayerStats } from '../services/osrs';
import { PlayerStats } from '../types';

const SkillAnalyzerPage: React.FC = () => {
    const location = useLocation();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Auto-search if username passed in state
    useEffect(() => {
        if (location.state && location.state.username) {
            const initialUser = location.state.username;
            setUsername(initialUser);
            handleLookup(initialUser);
        }
    }, [location.state]);

    const handleLookup = async (userToSearch: string) => {
        if (!userToSearch.trim()) return;

        setLoading(true);
        setError(null);
        setStats(null);

        try {
            const data = await getPlayerStats(userToSearch);
            setStats(data);
        } catch (err: any) {
            console.error("Stats lookup failed:", err);
            setError(err.message || "Failed to load player stats. User might not exist or API is down.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleLookup(username);
    };

    return (
        <div className="animate-fade-in w-full max-w-7xl mx-auto">
            <div className="mb-6 text-center">
                <h2 className="text-3xl font-fantasy text-osrs-gold mb-2">Skill Analyzer</h2>
                <p className="text-gray-400 text-sm">Track progress, calculate efficiency, and view unlocks.</p>
            </div>

            {/* Simple Search Form */}
            <div className="max-w-xl mx-auto mb-8">
                <form onSubmit={handleSubmit} className="relative flex shadow-lg">
                    <div className="relative flex-grow">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-black/40 border border-osrs-border border-r-0 rounded-l px-4 py-3 pl-10 text-white focus:outline-none focus:border-osrs-gold transition-colors"
                            placeholder="Enter OSRS Username..."
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !username.trim()}
                        className="bg-osrs-gold text-black font-bold px-6 py-2 rounded-r hover:bg-yellow-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                        Lookup
                    </button>
                </form>
            </div>

            {error && (
                <div className="max-w-2xl mx-auto bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-lg flex items-center gap-3 mb-8">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Lookup Failed</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {stats && (
                <div className="animate-slide-up">
                    <PlayerStatsDisplay stats={stats} username={username} />
                </div>
            )}

            {!stats && !loading && !error && (
                <div className="text-center text-gray-500 mt-12 italic">
                    Enter a username above to view detailed skill statistics, tooltips, and calculators.
                </div>
            )}
        </div>
    );
};

export default SkillAnalyzerPage;
