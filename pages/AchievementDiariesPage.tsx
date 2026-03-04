import React, { useState, useEffect } from 'react';
import { PlayerStats } from '../types';
import { getPlayerStats } from '../services/osrs';
import { achievementDiaries, checkSkillRequirements, RegionDiary } from '../utils/achievementDiaries';
import { Search, Loader2, AlertTriangle, User, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const DiaryTierCard: React.FC<{ tierReq: any, stats: any }> = ({ tierReq, stats }) => {
    const { meets, missing } = checkSkillRequirements(stats, tierReq.skills);
    const [isExpanded, setIsExpanded] = useState(!meets);

    const tierLower = tierReq.tier.toLowerCase();

    // Specific tier styling
    const tierBadgeColor = tierLower === 'easy' ? 'text-green-400'
        : tierLower === 'medium' ? 'text-blue-400'
            : tierLower === 'hard' ? 'text-purple-400'
                : 'text-yellow-400';

    const getTierBackground = () => {
        switch (tierLower) {
            case 'easy': return 'bg-green-900/40 border-green-700/60 text-green-400';
            case 'medium': return 'bg-blue-900/40 border-blue-700/60 text-blue-400';
            case 'hard': return 'bg-purple-900/40 border-purple-700/60 text-purple-400';
            case 'elite': return 'bg-yellow-900/40 border-yellow-700/60 text-yellow-500';
            default: return 'bg-green-900/30 border-green-700/50 text-green-400';
        }
    };

    const colorClass = getTierBackground();

    return (
        <div className={`border rounded-md p-3 transition-colors ${colorClass}`}>
            <div
                className="flex justify-between items-center cursor-pointer select-none"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2">
                    <span className={`text-base font-bold uppercase tracking-wider ${tierBadgeColor}`}>
                        {tierReq.tier}
                    </span>
                    {meets ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
                </div>
                <div className="opacity-70 hover:opacity-100 transition-opacity">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
            </div>

            {isExpanded && (
                <div className="mt-3 text-sm border-t border-black/20 pt-2 animate-fade-in">
                    {meets && <div className="text-green-300/80 italic mb-2 text-xs">Requirements met!</div>}
                    {!meets && <div className="text-red-300/80 italic mb-2 text-xs">Missing Requirements</div>}
                    <div className="grid grid-cols-2 gap-1.5 mt-1">
                        {Object.entries(tierReq.skills).map(([skill, reqLvl]) => {
                            const reqLevelNum = reqLvl as number;
                            const playerLvl = stats[skill]?.level || 1;
                            const skillMet = playerLvl >= reqLevelNum;

                            return (
                                <div key={skill} className={`text-xs bg-black/40 px-2 py-1.5 rounded flex justify-between items-center border ${skillMet ? 'text-green-300 border-green-900/50' : 'text-red-300 border-red-900/50'}`}>
                                    <span className="capitalize font-semibold">{skill}</span>
                                    <div className="flex items-center gap-1">
                                        <span className={skillMet ? 'text-green-400 font-mono' : 'text-red-400 font-mono'}>{playerLvl}</span>
                                        <span className="text-gray-500 text-[10px]">/</span>
                                        <span className="text-green-400 font-mono">{reqLevelNum}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const AchievementDiariesPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [prevUsername, setPrevUsername] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const savedUser = localStorage.getItem('osrs_username');
        if (savedUser) {
            setUsername(savedUser);
            handleFetchStats(savedUser);
        }
    }, []);

    const handleFetchStats = async (userToFetch: string) => {
        if (!userToFetch.trim()) return;

        setLoading(true);
        setError(null);
        setStats(null);

        try {
            const data = await getPlayerStats(userToFetch);
            setStats(data as any); // Types match structurally
            setPrevUsername(userToFetch);
            localStorage.setItem('osrs_username', userToFetch);
        } catch (err: any) {
            console.error("Stats fetch error:", err);
            setError(err.message || "Failed to fetch player stats. Ensure the username is correct.");
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
                <h2 className="text-3xl font-fantasy text-osrs-gold mb-2">Achievement Diaries</h2>
                <p className="text-gray-400 text-sm">Check your skill eligibility for all OSRS Achievement Diaries.</p>
            </div>

            {/* Search Bar */}
            <div className={`max - w - md mx - auto mb - 8 transition - all duration - 500 ${stats ? 'opacity-100' : 'scale-105'} `}>
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className={`w - 5 h - 5 ${loading ? 'text-osrs-gold animate-pulse' : 'text-gray-500'} `} />
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
            </div>

            {error && (
                <div className="max-w-md mx-auto mb-8 bg-red-900/30 border border-red-500 text-red-200 p-4 rounded-lg flex items-center gap-3 animate-slide-up">
                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                    <div>
                        <p className="font-bold text-sm">Error Fetching Stats</p>
                        <p className="text-xs opacity-80">{error}</p>
                    </div>
                </div>
            )}

            {loading && !stats && (
                <div className="text-center py-20 animate-pulse">
                    <Loader2 className="w-12 h-12 text-osrs-gold mx-auto mb-4 animate-spin" />
                    <p className="text-gray-400">Consulting the Highscores...</p>
                </div>
            )}

            {!loading && !stats && !error && (
                <div className="text-center py-12 text-gray-500 italic max-w-lg mx-auto border border-dashed border-gray-700 rounded-lg bg-black/20">
                    <p>Enter a username to check your diary eligibility.</p>
                </div>
            )}

            {stats && prevUsername && (
                <div className="animate-slide-up pb-12">
                    <div className="text-center mb-8">
                        <h3 className="text-xl text-white font-bold">Showing eligibility for: <span className="text-osrs-gold">{prevUsername}</span></h3>
                        <p className="text-gray-400 text-sm mt-1">Based on highest skill requirements per tier.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {achievementDiaries.map((diary: RegionDiary) => (
                            <div key={diary.region} className="bg-osrs-panel border border-osrs-border rounded-lg overflow-hidden flex flex-col shadow-lg shadow-black/50">
                                <div className="bg-black/60 px-4 py-3 border-b border-osrs-border flex items-center justify-between">
                                    <h4 className="font-bold text-white text-lg">{diary.region}</h4>
                                </div>
                                <div className="p-4 flex flex-col gap-3 flex-grow bg-black/20">
                                    {diary.tiers.map(tierReq => (
                                        <DiaryTierCard key={tierReq.tier} tierReq={tierReq} stats={stats} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AchievementDiariesPage;
