import React, { useState, useEffect } from 'react';
import { PlayerStats, SkillData } from '../types';
import { getPlayerStats } from '../services/osrs';
import { QUESTS, DIARIES, Quest, DiaryTask, Requirement } from '../services/questData';
import { Check, X, Search, Loader2, BookOpen, Map, ChevronDown, ChevronUp, Lock, Unlock } from 'lucide-react';

const QuestPlannerPage: React.FC = () => {
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState<PlayerStats | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'quests' | 'diaries'>('quests');
    const [expandedIds, setExpandedIds] = useState<number[]>([]);

    // Track completed quest names and diaries
    const [completedQuests, setCompletedQuests] = useState<string[]>([]);
    const [completedDiaries, setCompletedDiaries] = useState<number[]>([]);

    // Load progress when username changes (and has stats)
    useEffect(() => {
        if (!username) {
            setCompletedQuests([]);
            setCompletedDiaries([]);
            return;
        }

        const normalizedUser = username.toLowerCase();
        const savedQuests = localStorage.getItem(`quests_${normalizedUser}`);
        const savedDiaries = localStorage.getItem(`diaries_${normalizedUser}`);

        if (savedQuests) setCompletedQuests(JSON.parse(savedQuests));
        else setCompletedQuests([]); // Reset if new user

        if (savedDiaries) setCompletedDiaries(JSON.parse(savedDiaries));
        else setCompletedDiaries([]);

    }, [stats]); // Trigger on stats load (successful search) to ensure we have a valid confirmed user context? 
    // Actually, trigger on 'stats' is safer to ensure we are looking at a valid loaded profile, 
    // but the user might want to check boxes before loading stats?
    // Let's stick to: If stats are loaded, we assume the 'username' input is valid and we load that profile's local checklist.

    const saveData = (newQuests: string[], newDiaries: number[]) => {
        if (!username) return;
        const normalizedUser = username.toLowerCase();
        localStorage.setItem(`quests_${normalizedUser}`, JSON.stringify(newQuests));
        localStorage.setItem(`diaries_${normalizedUser}`, JSON.stringify(newDiaries));
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username) return;

        setLoading(true);
        setError(null);
        setStats(null);
        // We do separate the view state from the 'input' state usually, but here 'username' is the input.
        // It's fine for now.

        try {
            const data = await getPlayerStats(username);
            setStats(data);
        } catch (err) {
            setError('Player not found or HiScores API error.');
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (id: number) => {
        setExpandedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleQuestComplete = (name: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const newList = completedQuests.includes(name)
            ? completedQuests.filter(n => n !== name)
            : [...completedQuests, name];

        setCompletedQuests(newList);
        saveData(newList, completedDiaries);
    };

    const toggleDiaryComplete = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newList = completedDiaries.includes(id)
            ? completedDiaries.filter(i => i !== id)
            : [...completedDiaries, id];

        setCompletedDiaries(newList);
        saveData(completedQuests, newList);
    };

    const checkRequirement = (req: Requirement, stats: PlayerStats | null): { met: boolean; current?: number | string } => {
        // Quest Dependency Check
        if (req.type === 'Quest' && req.quest) {
            return {
                met: completedQuests.includes(req.quest),
                current: completedQuests.includes(req.quest) ? 'Completed' : 'Not Started'
            };
        }

        if (!stats) return { met: false };

        if (req.type === 'Skill' && req.skill && req.level) {
            const skillName = req.skill.toLowerCase();
            const playerLevel = (stats[skillName as keyof PlayerStats] as SkillData)?.level || 0;
            return { met: playerLevel >= req.level, current: playerLevel };
        }

        if (req.type === 'Combat' && req.combatLevel) {
            const attack = (stats.attack as SkillData).level;
            const strength = (stats.strength as SkillData).level;
            const defence = (stats.defence as SkillData).level;
            const hitpoints = (stats.hitpoints as SkillData).level;
            const prayer = (stats.prayer as SkillData).level;
            const ranged = (stats.ranged as SkillData).level;
            const magic = (stats.magic as SkillData).level;

            const base = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
            const melee = 0.325 * (attack + strength);
            const range = 0.325 * (Math.floor(ranged / 2) + ranged);
            const mage = 0.325 * (Math.floor(magic / 2) + magic);
            const combatLevel = Math.floor(base + Math.max(melee, range, mage));

            return { met: combatLevel >= req.combatLevel, current: combatLevel };
        }

        return { met: false, current: "Check In-Game" };
    };

    const getProgress = (requirements: Requirement[], stats: PlayerStats | null) => {
        // Handle 0-req quests (like Cook's Assistant) as auto-ready
        if (requirements.length === 0) return { metCount: 0, total: 0, ready: true };

        let metCount = 0;
        requirements.forEach(req => {
            if (checkRequirement(req, stats).met) metCount++;
        });

        return {
            metCount,
            total: requirements.length,
            ready: metCount === requirements.length
        };
    };

    return (
        <div className="w-full max-w-5xl mx-auto mb-10 text-white animate-fade-in">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-fantasy text-osrs-gold mb-2 drop-shadow-md">Quest & Diary Planner</h1>
                <p className="text-gray-400">Track your account progression against major unlocks.</p>
                {!stats && <p className="text-xs text-gray-500 mt-2 italic">Search a username to check stats requirements automatically.</p>}
            </div>

            {/* User Lookup */}
            <div className="bg-osrs-panel border-2 border-osrs-border rounded-lg p-6 mb-8 shadow-lg max-w-xl mx-auto">
                <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter OSRS Username"
                        className="flex-1 bg-black/30 border border-osrs-border rounded px-4 py-2 text-white focus:outline-none focus:border-osrs-gold"
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-osrs-gold text-black px-6 py-2 rounded font-bold hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Search />}
                    </button>
                </form>
                {error && <p className="text-red-500 text-sm mt-2 text-center">{error}</p>}
                {stats && <p className="text-green-400 text-sm mt-2 text-center">Stats loaded for <span className="font-bold text-white">{username}</span></p>}
            </div>

            {/* Tabs */}
            <div className="flex justify-center gap-4 mb-6">
                <button
                    onClick={() => setActiveTab('quests')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold border-t-2 border-x-2 transition-all ${activeTab === 'quests'
                        ? 'bg-osrs-panel border-osrs-gold text-osrs-gold scale-105'
                        : 'bg-black/40 border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <BookOpen size={20} /> Quests
                </button>
                <button
                    onClick={() => setActiveTab('diaries')}
                    className={`flex items-center gap-2 px-6 py-3 rounded-t-lg font-bold border-t-2 border-x-2 transition-all ${activeTab === 'diaries'
                        ? 'bg-osrs-panel border-osrs-gold text-osrs-gold scale-105'
                        : 'bg-black/40 border-transparent text-gray-500 hover:text-gray-300'
                        }`}
                >
                    <Map size={20} /> Diaries
                </button>
            </div>

            {/* Content List */}
            <div className="space-y-4">
                {activeTab === 'quests' ? (
                    QUESTS.map(quest => {
                        const progress = getProgress(quest.requirements, stats);
                        const isExpanded = expandedIds.includes(quest.id);
                        const isComplete = completedQuests.includes(quest.name);

                        return (
                            <div key={quest.id} className={`bg-osrs-panel border border-osrs-border rounded-lg overflow-hidden transition-all hover:border-osrs-gold/50 ${isComplete ? 'opacity-70' : ''}`}>
                                <div
                                    onClick={() => toggleExpand(quest.id)}
                                    className="p-4 flex items-center justify-between cursor-pointer bg-black/20 hover:bg-black/40"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            onClick={(e) => toggleQuestComplete(quest.name, e)}
                                            className={`p-2 rounded-full border cursor-pointer hover:scale-110 transition-transform ${isComplete ? 'bg-green-900 border-green-500' : (progress.ready ? 'bg-blue-900/30 border-blue-400' : 'bg-red-900/30 border-red-500')}`}
                                            title={isComplete ? "Mark as Incomplete" : "Mark as Complete"}
                                        >
                                            {isComplete ? <Check size={20} className="text-white" /> : (progress.ready ? <Unlock size={20} className="text-blue-400" /> : <Lock size={20} className="text-red-500" />)}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg leading-tight ${isComplete ? 'text-green-400 line-through' : 'text-osrs-yellow'}`}>{quest.name}</h3>
                                            <p className="text-xs text-gray-400 capitalize">{quest.difficulty} • {quest.length}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            {isComplete ? (
                                                <span className="text-sm font-bold text-green-500 uppercase">Completed</span>
                                            ) : (
                                                <p className={`text-sm font-bold ${progress.ready ? 'text-blue-400' : 'text-orange-400'}`}>
                                                    {progress.ready ? 'Ready to Start' : `${progress.metCount}/${progress.total} Reqs Met`}
                                                </p>
                                            )}
                                        </div>
                                        {isExpanded ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                                    </div>
                                </div>

                                {/* Details */}
                                {isExpanded && (
                                    <div className="p-4 border-t border-osrs-border/30 bg-black/40">
                                        {quest.requirements.length > 0 && (
                                            <>
                                                <h4 className="font-bold text-osrs-gold mb-3 text-sm uppercase tracking-wider">Requirements</h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                    {quest.requirements.map((req, idx) => {
                                                        const check = checkRequirement(req, stats);
                                                        const isSkill = req.type === 'Skill' || req.type === 'Combat';

                                                        return (
                                                            <div key={idx} className="flex items-center justify-between bg-black/30 p-2 rounded border border-gray-700/50">
                                                                <div className="flex items-center gap-2">
                                                                    {check.met ? (
                                                                        <Check size={14} className="text-green-500" />
                                                                    ) : (
                                                                        <X size={14} className="text-red-500" />
                                                                    )}
                                                                    <span className={`text-sm ${(isComplete || check.met) ? 'text-gray-400 line-through decoration-green-500/50' : 'text-white'}`}>
                                                                        {req.type === 'Skill' && `${req.level} ${req.skill?.charAt(0).toUpperCase()}${req.skill?.slice(1)}`}
                                                                        {req.type === 'Quest' && `Quest: ${req.quest}`}
                                                                        {req.type === 'Combat' && `Combat Level ${req.combatLevel}`}
                                                                    </span>
                                                                </div>
                                                                {isSkill && !check.met && (
                                                                    <span className="text-xs text-red-400 font-mono">
                                                                        {stats ? `Current: ${check.current}` : 'Needs Stats'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </>
                                        )}
                                        {quest.requirements.length === 0 && (
                                            <p className="text-sm text-green-400 italic mb-3">No Requirements - You can start this quest immediately!</p>
                                        )}

                                        {quest.rewards && (
                                            <>
                                                <h4 className="font-bold text-osrs-gold mt-4 mb-2 text-sm uppercase tracking-wider">Key Rewards</h4>
                                                <ul className="list-disc pl-5 text-sm text-gray-300">
                                                    {quest.rewards.map((r, i) => <li key={i}>{r}</li>)}
                                                </ul>
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    DIARIES.map(diary => {
                        const progress = getProgress(diary.requirements, stats);
                        const isExpanded = expandedIds.includes(diary.id);
                        const isComplete = completedDiaries.includes(diary.id);

                        return (
                            <div key={diary.id} className={`bg-osrs-panel border border-osrs-border rounded-lg overflow-hidden transition-all hover:border-osrs-gold/50 ${isComplete ? 'opacity-70' : ''}`}>
                                <div
                                    onClick={() => toggleExpand(diary.id)}
                                    className="p-4 flex items-center justify-between cursor-pointer bg-black/20 hover:bg-black/40"
                                >
                                    <div className="flex items-center gap-4">
                                        <div
                                            onClick={(e) => toggleDiaryComplete(diary.id, e)}
                                            className={`p-2 rounded-full border cursor-pointer hover:scale-110 transition-transform ${isComplete ? 'bg-green-900 border-green-500' : (progress.ready ? 'bg-blue-900/30 border-blue-400' : 'bg-red-900/30 border-red-500')}`}
                                        >
                                            {isComplete ? <Check size={20} className="text-white" /> : (progress.ready ? <Unlock size={20} className="text-blue-400" /> : <Lock size={20} className="text-red-500" />)}
                                        </div>
                                        <div>
                                            <h3 className={`font-bold text-lg ${isComplete ? 'text-green-400 line-through' : 'text-osrs-yellow'}`}>{diary.name}</h3>
                                            <p className="text-xs text-gray-400 capitalize">{diary.region} • {diary.tier}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-right hidden sm:block">
                                            {isComplete ? (
                                                <span className="text-sm font-bold text-green-500 uppercase">Completed</span>
                                            ) : (
                                                <p className={`text-sm font-bold ${progress.ready ? 'text-blue-400' : 'text-orange-400'}`}>
                                                    {progress.ready ? 'Ready to Start' : `${progress.metCount}/${progress.total} Reqs Met`}
                                                </p>
                                            )}
                                        </div>
                                        {isExpanded ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="p-4 border-t border-osrs-border/30 bg-black/40">
                                        <h4 className="font-bold text-osrs-gold mb-3 text-sm uppercase tracking-wider">Requirements</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            {diary.requirements.map((req, idx) => {
                                                const check = checkRequirement(req, stats);
                                                const isSkill = req.type === 'Skill' || req.type === 'Combat';
                                                const isQuest = req.type === 'Quest';

                                                return (
                                                    <div key={idx} className="flex items-center justify-between bg-black/30 p-2 rounded border border-gray-700/50">
                                                        <div className="flex items-center gap-2">
                                                            {check.met ? <Check size={14} className="text-green-500" /> : <X size={14} className="text-red-500" />}
                                                            <span className={`text-sm ${(isComplete || check.met) ? 'text-gray-400 line-through decoration-green-500/50' : 'text-white'}`}>
                                                                {req.type === 'Skill' && `${req.level} ${req.skill?.charAt(0).toUpperCase()}${req.skill?.slice(1)}`}
                                                                {req.type === 'Quest' && `Quest: ${req.quest}`}
                                                            </span>
                                                        </div>
                                                        {isSkill && !check.met && (
                                                            <span className="text-xs text-red-400 font-mono">
                                                                {stats ? `Current: ${check.current}` : 'Needs Stats'}
                                                            </span>
                                                        )}
                                                        {isQuest && !check.met && (
                                                            <span className="text-xs text-red-400 font-mono">
                                                                Not Completed
                                                            </span>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default QuestPlannerPage;
