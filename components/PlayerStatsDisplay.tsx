import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, SkillData } from '../types';
import { Trophy, Clock, Star, X, ExternalLink, Calculator, Lock, Calendar, ChevronRight, Settings, Search, ChevronDown } from 'lucide-react';
import { getNextLevelXp, getXpForLevel, XP_RATES } from '../services/osrs';
import { SKILL_ACTIONS, SKILL_UNLOCKS, SKILL_PRESETS, WEAPON_DATA, getCombatLevel, UnlockCategory, POPULAR_GOALS, Goal } from '../services/skillData';

interface PlayerStatsDisplayProps {
    stats: PlayerStats;
    username: string;
    prices?: Record<number, { low: number; high: number }>;
}

const SKILL_NAMES: (keyof PlayerStats)[] = [
    'attack', 'hitpoints', 'mining',
    'strength', 'agility', 'smithing',
    'defence', 'herblore', 'fishing',
    'ranged', 'thieving', 'cooking',
    'prayer', 'crafting', 'firemaking',
    'magic', 'fletching', 'woodcutting',
    'runecraft', 'slayer', 'farming',
    'construction', 'hunter', 'sailing'
];

const COMBAT_SKILLS = ['attack', 'strength', 'defence', 'ranged', 'magic', 'hitpoints'];

const PlayerStatsDisplay: React.FC<PlayerStatsDisplayProps> = ({ stats, username, prices }) => {
    const [activeTab, setActiveTab] = useState<'skills' | 'goals'>('skills');
    const [selectedSkill, setSelectedSkill] = useState<keyof PlayerStats | null>(null);
    const [calcXpRate, setCalcXpRate] = useState<number>(50000);
    const [targetLevel, setTargetLevel] = useState<number>(99);
    const [maxHit, setMaxHit] = useState<number>(0);
    const [attackSpeed, setAttackSpeed] = useState<number>(4); // Ticks (4 = 2.4s)

    // Searchable Dropdown States
    const [methodSearch, setMethodSearch] = useState('');
    const [isMethodDropdownOpen, setIsMethodDropdownOpen] = useState(false);
    const [weaponSearch, setWeaponSearch] = useState('');
    const [isWeaponDropdownOpen, setIsWeaponDropdownOpen] = useState(false);

    // Combat Simulation State
    const [isSimMode, setIsSimMode] = useState(false);
    const [simStats, setSimStats] = useState<PlayerStats>(stats);

    const methodDropdownRef = useRef<HTMLDivElement>(null);
    const weaponDropdownRef = useRef<HTMLDivElement>(null);

    // Sync stats when they change (unless already simulating)
    useEffect(() => {
        setSimStats(stats);
    }, [stats]);

    const activeStats = isSimMode ? simStats : stats;
    const totalLevel = activeStats.overall.level; // Note: This won't update strictly unless we recalc total, but combat level is what matters
    const combatLevel = getCombatLevel(activeStats);
    const originalCombatLevel = getCombatLevel(stats);

    const updateSimLevel = (skill: keyof PlayerStats, change: number) => {
        setSimStats(prev => {
            const currentData = prev[skill] as SkillData;
            const newLevel = Math.min(99, Math.max(1, currentData.level + change));

            return {
                ...prev,
                [skill]: {
                    ...currentData,
                    level: newLevel,
                    xp: getXpForLevel(newLevel) // Auto update XP to min for that level
                }
            };
        });
    };

    useEffect(() => {
        if (selectedSkill) {
            setCalcXpRate(XP_RATES[selectedSkill] || 50000);
            setTargetLevel(99);
            setMaxHit(0);
            setAttackSpeed(4);
            setMethodSearch('');
            setWeaponSearch('');
        }
    }, [selectedSkill]);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (methodDropdownRef.current && !methodDropdownRef.current.contains(event.target as Node)) {
                setIsMethodDropdownOpen(false);
            }
            if (weaponDropdownRef.current && !weaponDropdownRef.current.contains(event.target as Node)) {
                setIsWeaponDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Auto-calculate XP rate when Max Hit changes for combat skills
    useEffect(() => {
        if (selectedSkill && COMBAT_SKILLS.includes(selectedSkill) && maxHit > 0) {
            // Formula: (Max Hit / 2) * 4 XP * (3600 / (Speed * 0.6)) * Accuracy(0.8)
            // Hitpoints is 1.33 XP per damage
            const xpPerDamage = selectedSkill === 'hitpoints' ? 1.33 : 4;
            const attacksPerHour = 3600 / (attackSpeed * 0.6);
            const estimatedXpRate = (maxHit / 2) * xpPerDamage * attacksPerHour * 0.8;
            setCalcXpRate(Math.floor(estimatedXpRate));
        }
    }, [maxHit, attackSpeed, selectedSkill]);

    const getSkillIconUrl = (skillName: string) => {
        const capitalized = skillName.charAt(0).toUpperCase() + skillName.slice(1);
        return `https://oldschool.runescape.wiki/images/${capitalized}_icon.png`;
    };

    const calculateProgress = (level: number, currentXp: number) => {
        if (level === 99) return 100;
        const startXp = getXpForLevel(level);
        const nextXp = getNextLevelXp(level);
        const diff = nextXp - startXp;
        const progress = currentXp - startXp;
        return Math.min(100, Math.max(0, (progress / diff) * 100));
    };

    const formatXp = (xp: number) => {
        if (xp >= 10000000) return (xp / 1000000).toFixed(1) + 'M';
        if (xp >= 10000) return (xp / 1000).toFixed(1) + 'k';
        return xp.toLocaleString();
    };

    const getProgressColor = (percent: number) => {
        const hue = (percent / 100) * 120;
        return `hsl(${hue}, 100%, 40%)`;
    };

    const getProgressStyle = (percent: number) => {
        return {
            width: `${percent}%`,
            backgroundColor: getProgressColor(percent)
        };
    };

    // Mock Heatmap Data Generator
    const generateHeatmapData = () => {
        return Array.from({ length: 30 }, (_, i) => ({
            day: i,
            intensity: Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0
        }));
    };

    const getTargetXp = (level: number) => {
        if (level > 126) return 200000000; // Cap at 200m
        return getXpForLevel(level);
    };

    const NON_COMBAT_MAGIC_METHODS = [
        'Splashing',
        'High Alchemy',
        'Plank Make',
        'String Jewellery',
        'Stun-Alch',
        'Enchant Bolts (Dragonstone)',
        'Enchant Bolts (Onyx)'
    ];

    const showCombatSettings = selectedSkill && COMBAT_SKILLS.includes(selectedSkill) &&
        !(selectedSkill === 'magic' && NON_COMBAT_MAGIC_METHODS.includes(methodSearch));

    return (
        <div className="flex flex-col gap-4">
            {/* Control Bar & Tabs */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-osrs-panel border border-osrs-border p-3 rounded-lg shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="flex bg-black/40 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setActiveTab('skills')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'skills' ? 'bg-osrs-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Skills
                        </button>
                        <button
                            onClick={() => setActiveTab('goals')}
                            className={`px-4 py-1.5 rounded-md text-sm font-bold transition-all ${activeTab === 'goals' ? 'bg-osrs-gold text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
                        >
                            Goals
                        </button>
                    </div>

                    <div className="text-xl font-bold text-white hidden md:block">
                        <span className="text-osrs-orange">Combat Level: </span>
                        <span className={`${isSimMode && combatLevel !== originalCombatLevel ? 'text-green-400' : 'text-white'}`}>
                            {combatLevel}
                        </span>
                        {isSimMode && combatLevel !== originalCombatLevel && (
                            <span className="text-xs text-gray-400 ml-2">(Original: {originalCombatLevel})</span>
                        )}
                    </div>
                </div>

                <button
                    onClick={() => setIsSimMode(!isSimMode)}
                    className={`
                        w-full md:w-auto flex items-center justify-center gap-2 px-3 py-1.5 rounded border text-sm font-bold transition-all
                        ${isSimMode
                            ? 'bg-red-900/50 border-red-500 text-red-200 hover:bg-red-900/70'
                            : 'bg-blue-900/30 border-blue-500/50 text-blue-200 hover:bg-blue-900/50'}
                    `}
                >
                    <Calculator size={16} />
                    {isSimMode ? 'Exit Simulation' : 'Simulation Mode'}
                </button>
            </div>

            {activeTab === 'skills' ? (
                <div className="grid grid-cols-3 gap-2 md:gap-3">
                    {SKILL_NAMES.map((skillKey) => {
                        const data = activeStats[skillKey] as SkillData;
                        const progress = calculateProgress(data.level, data.xp);
                        const isCombat = COMBAT_SKILLS.includes(skillKey as string);

                        return (
                            <div
                                key={skillKey}
                                onClick={() => setSelectedSkill(skillKey)}
                                className={`
                                relative cursor-pointer group bg-osrs-panel border border-osrs-border rounded transition-all hover:bg-[#383025] hover:border-osrs-gold overflow-hidden shadow-sm
                                aspect-square md:aspect-auto md:p-3
                                ${isSimMode && isCombat ? 'ring-1 ring-blue-500/50' : ''}
                            `}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none md:hidden" />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                                {/* MOBILE LAYOUT (Square, Centered) */}
                                <div className="flex flex-col items-center justify-center h-full w-full md:hidden p-1">
                                    {/* Level (Top Right) */}
                                    <div className={`absolute top-1 right-1.5 font-bold ${data.level === 99 ? 'text-osrs-gold' : 'text-white'} text-sm`}>
                                        {data.level}
                                    </div>
                                    {/* Icon */}
                                    <img
                                        src={getSkillIconUrl(skillKey)}
                                        alt={skillKey}
                                        className="w-8 h-8 object-contain drop-shadow-lg mb-1 z-10"
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                    />
                                    {/* Name */}
                                    <span className="capitalize text-osrs-yellow font-bold text-[10px] z-10 leading-tight">{skillKey}</span>
                                    {/* Progress Bar (Bottom Edge) */}
                                    <div className="absolute bottom-0 left-0 w-full h-1 bg-black/50">
                                        <div
                                            className="h-full transition-all duration-500"
                                            style={{ width: `${progress}%`, backgroundColor: data.level === 99 ? '#d4af37' : '#00ff00' }}
                                        />
                                    </div>

                                    {/* Sim Controls (Mobile Overlay) */}
                                    {isSimMode && isCombat && (
                                        <div className="absolute inset-x-0 bottom-6 flex justify-between px-1 z-20" onClick={(e) => e.stopPropagation()}>
                                            <button
                                                onClick={() => updateSimLevel(skillKey, -1)}
                                                className="w-5 h-5 bg-red-900/80 border border-red-500 text-white rounded flex items-center justify-center text-xs hover:bg-red-800"
                                            >-</button>
                                            <button
                                                onClick={() => updateSimLevel(skillKey, 1)}
                                                className="w-5 h-5 bg-green-900/80 border border-green-500 text-white rounded flex items-center justify-center text-xs hover:bg-green-800"
                                            >+</button>
                                        </div>
                                    )}
                                </div>


                                {/* DESKTOP LAYOUT (Rectangle, Detailed) */}
                                <div className="hidden md:flex flex-col gap-2 h-full justify-between relative">
                                    {/* Header Row */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <img
                                                src={getSkillIconUrl(skillKey)}
                                                alt={skillKey}
                                                className="w-6 h-6 object-contain"
                                                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                            <span className="capitalize text-osrs-yellow font-bold text-sm">{skillKey}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {isSimMode && isCombat && (
                                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                                    <button
                                                        onClick={() => updateSimLevel(skillKey, -1)}
                                                        className="w-5 h-5 bg-red-900/50 border border-red-500 text-white rounded flex items-center justify-center text-xs hover:bg-red-800"
                                                    >-</button>
                                                    <button
                                                        onClick={() => updateSimLevel(skillKey, 1)}
                                                        className="w-5 h-5 bg-green-900/50 border border-green-500 text-white rounded flex items-center justify-center text-xs hover:bg-green-800"
                                                    >+</button>
                                                </div>
                                            )}
                                            <span className={`text-lg font-bold ${data.level === 99 ? 'text-osrs-gold' : 'text-white'} ${isSimMode && data.level !== (stats[skillKey] as SkillData).level ? 'text-blue-300' : ''}`}>
                                                {data.level}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Progress Bar (Large) */}
                                    <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-osrs-border/50 shadow-inner">
                                        <div
                                            className="h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                                            style={getProgressStyle(progress)}
                                        />
                                    </div>

                                    {/* XP Row */}
                                    <div className="flex justify-between text-[10px] text-gray-400 mt-auto">
                                        <span>XP:</span>
                                        <span className="text-white font-mono">{formatXp(data.xp)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-300">
                    {POPULAR_GOALS.map((goal, i) => {
                        const allMet = goal.requirements.every(req => activeStats[req.skill].level >= req.level);
                        return (
                            <div key={i} className={`bg-osrs-panel border ${allMet ? 'border-green-500/50 bg-green-900/5' : 'border-osrs-border'} p-4 rounded-lg shadow-sm flex flex-col gap-3 transition-all`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-xl font-bold text-osrs-gold flex items-center gap-2">
                                            {goal.name}
                                            {allMet && <Trophy className="w-4 h-4 text-green-400" />}
                                        </h4>
                                        <p className="text-xs text-gray-400">{goal.description}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${goal.type === 'Quest' ? 'bg-blue-900/50 text-blue-300 border border-blue-500/30' : 'bg-purple-900/50 text-purple-300 border border-purple-500/30'}`}>
                                        {goal.type}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {goal.requirements.map((req, r) => {
                                        const currentLevel = activeStats[req.skill].level;
                                        const isMet = currentLevel >= req.level;
                                        return (
                                            <div key={r} className={`flex items-center gap-2 p-2 rounded border ${isMet ? 'bg-green-900/20 border-green-500/30' : 'bg-black/20 border-white/5 opacity-80'}`}>
                                                <img src={getSkillIconUrl(req.skill)} className="w-4 h-4" alt="" />
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between text-[10px]">
                                                        <span className="capitalize text-gray-400 truncate">{req.skill}</span>
                                                        <span className={isMet ? 'text-green-400 font-bold' : 'text-osrs-orange'}>
                                                            {currentLevel}/{req.level}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-black/40 h-1 rounded-full mt-1 overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${isMet ? 'bg-green-500' : 'bg-osrs-orange'}`}
                                                            style={{ width: `${Math.min(100, (currentLevel / req.level) * 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Advanced Skill Detail Modal */}
            {selectedSkill && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setSelectedSkill(null)}>
                    <div className="bg-[#1e1e1e] border border-osrs-gold rounded-lg p-6 max-w-5xl w-full shadow-2xl relative overflow-hidden flex flex-col gap-6 pt-12 md:pt-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://oldschool.runescape.wiki/images/Bank_interface.png')] bg-cover"></div>

                        <button
                            onClick={() => setSelectedSkill(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors z-20 bg-black/50 p-1 rounded-full hover:bg-red-500/50"
                        >
                            <X size={24} />
                        </button>

                        {/* Header Row */}
                        <div className="relative z-10 flex items-center gap-4 border-b border-osrs-border pb-4">
                            <img
                                src={getSkillIconUrl(selectedSkill)}
                                alt={selectedSkill}
                                className="w-16 h-16 object-contain drop-shadow-lg"
                            />
                            <div>
                                <h3 className="text-3xl font-fantasy text-osrs-gold capitalize">{selectedSkill}</h3>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="bg-osrs-bg px-2 py-0.5 rounded border border-osrs-border text-white">Level {(stats[selectedSkill] as SkillData).level}</span>
                                    <span className="text-gray-400">
                                        Rank: {(stats[selectedSkill] as SkillData).rank === -1 ? 'Unranked' : (stats[selectedSkill] as SkillData).rank.toLocaleString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">

                            {/* Section 1: Current Level & XP Heatmap */}
                            <div className="flex flex-col gap-4">
                                <div className="bg-black/30 p-4 rounded border border-osrs-border/50 h-full">
                                    <h4 className="text-osrs-orange font-bold mb-4 flex items-center gap-2">
                                        <Star size={16} /> Level Progress
                                    </h4>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                        <div className="bg-osrs-bg/50 p-2 rounded border border-white/5">
                                            <div className="text-xs text-gray-400">Current XP</div>
                                            <div className="text-white font-mono text-lg">{(stats[selectedSkill] as SkillData).xp.toLocaleString()}</div>
                                        </div>
                                        <div className="bg-osrs-bg/50 p-2 rounded border border-white/5">
                                            <div className="text-xs text-gray-400">Next Level</div>
                                            <div className="text-white font-mono text-lg">
                                                {(stats[selectedSkill] as SkillData).level < 99
                                                    ? getNextLevelXp((stats[selectedSkill] as SkillData).level).toLocaleString()
                                                    : 'MAX'}
                                            </div>
                                        </div>
                                        <div className="bg-osrs-bg/50 p-2 rounded border border-white/5 col-span-2">
                                            <div className="flex justify-between items-end mb-1">
                                                <div className="text-xs text-gray-400">Remaining XP</div>
                                                <div className="text-osrs-yellow font-mono">
                                                    {(stats[selectedSkill] as SkillData).level < 99
                                                        ? (getNextLevelXp((stats[selectedSkill] as SkillData).level) - (stats[selectedSkill] as SkillData).xp).toLocaleString()
                                                        : '0'}
                                                </div>
                                            </div>
                                            <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-white/10">
                                                <div
                                                    className="h-full transition-all duration-500"
                                                    style={getProgressStyle(calculateProgress((stats[selectedSkill] as SkillData).level, (stats[selectedSkill] as SkillData).xp))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Next Unlocks Section */}
                            <div className="bg-black/30 p-4 rounded border border-osrs-border/50">
                                <h4 className="text-osrs-gold font-bold mb-3 flex items-center gap-2">
                                    <Lock size={16} /> Upcoming Unlocks
                                </h4>
                                <div className="flex flex-col gap-2">
                                    {(SKILL_UNLOCKS[selectedSkill] || [])
                                        .filter(u => u.level > (stats[selectedSkill] as SkillData).level)
                                        .sort((a, b) => a.level - b.level)
                                        .slice(0, 3)
                                        .map((unlock, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-black/40 p-2 rounded border border-white/5">
                                                <div className="flex flex-col items-center justify-center bg-osrs-panel border border-osrs-border w-10 h-10 rounded shrink-0">
                                                    <span className="text-white font-bold text-sm">{unlock.level}</span>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-200">{unlock.description}</p>
                                                    <span className="text-[10px] text-osrs-gold uppercase tracking-wider bg-osrs-gold/10 px-1.5 py-0.5 rounded border border-osrs-gold/20">
                                                        {unlock.category}
                                                    </span>
                                                </div>
                                                <div className="text-right">
                                                    <span className="text-[10px] text-gray-500 block">XP Left</span>
                                                    <span className="text-xs text-gray-400 font-mono">
                                                        {(getXpForLevel(unlock.level) - (stats[selectedSkill] as SkillData).xp).toLocaleString()}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    {!(SKILL_UNLOCKS[selectedSkill] || []).some(u => u.level > (stats[selectedSkill] as SkillData).level) && (
                                        <div className="text-gray-500 text-sm italic text-center py-4">No specific unlocks tracked for future levels.</div>
                                    )}
                                </div>
                            </div>

                            {/* Section 2: Time to 99 Calculator */}
                            <div className="flex flex-col gap-4">
                                <div className="bg-black/30 p-4 rounded border border-osrs-border/50 h-full">
                                    <h4 className="text-osrs-orange font-bold mb-4 flex items-center gap-2">
                                        <Calculator size={16} /> Time to Level Calculator
                                    </h4>

                                    <div className="space-y-4">
                                        {/* Target Level Input */}
                                        <div className="flex gap-4">
                                            <div className="flex-1">
                                                <label className="text-xs text-gray-400 block mb-1">Target Level</label>
                                                <input
                                                    type="number"
                                                    min="1" max="126"
                                                    value={targetLevel}
                                                    onChange={(e) => setTargetLevel(Number(e.target.value))}
                                                    className="w-full bg-osrs-bg border border-osrs-border rounded px-3 py-2 text-white font-mono focus:border-osrs-gold outline-none"
                                                />
                                            </div>
                                            {SKILL_PRESETS[selectedSkill] && (
                                                <div className="flex-1 relative" ref={methodDropdownRef}>
                                                    <label className="text-xs text-gray-400 block mb-1">Method Preset</label>
                                                    <div
                                                        className="relative"
                                                        onClick={() => setIsMethodDropdownOpen(!isMethodDropdownOpen)}
                                                    >
                                                        <input
                                                            type="text"
                                                            value={methodSearch}
                                                            onChange={(e) => {
                                                                setMethodSearch(e.target.value);
                                                                setIsMethodDropdownOpen(true);
                                                            }}
                                                            placeholder="Search method..."
                                                            className="w-full bg-osrs-bg border border-osrs-border rounded px-3 py-2 text-white text-sm focus:border-osrs-gold outline-none pr-8"
                                                        />
                                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                                    </div>

                                                    {isMethodDropdownOpen && (
                                                        <div className="absolute top-full left-0 right-0 mt-1 bg-osrs-bg border border-osrs-border rounded shadow-xl z-50 max-h-48 overflow-y-auto">
                                                            {SKILL_PRESETS[selectedSkill]!
                                                                .filter(preset => preset.name.toLowerCase().includes(methodSearch.toLowerCase()))
                                                                .map((preset, i) => (
                                                                    <div
                                                                        key={i}
                                                                        onClick={() => {
                                                                            setCalcXpRate(preset.xpRate);
                                                                            setMethodSearch(preset.name);
                                                                            setIsMethodDropdownOpen(false);
                                                                        }}
                                                                        className="px-3 py-2 hover:bg-osrs-panel cursor-pointer text-sm text-gray-300 hover:text-white border-b border-white/5 last:border-0"
                                                                    >
                                                                        <div className="font-bold">{preset.name}</div>
                                                                        <div className="text-xs text-osrs-gold">{preset.xpRate.toLocaleString()} XP/hr</div>
                                                                    </div>
                                                                ))
                                                            }
                                                            {SKILL_PRESETS[selectedSkill]!.filter(preset => preset.name.toLowerCase().includes(methodSearch.toLowerCase())).length === 0 && (
                                                                <div className="px-3 py-2 text-xs text-gray-500 italic">No methods found</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Combat Stats Input */}
                                        {showCombatSettings && (
                                            <div className="bg-osrs-bg/30 p-3 rounded border border-white/5 space-y-3">
                                                <div className="flex items-center gap-2 text-xs text-osrs-yellow font-bold">
                                                    <Settings size={12} /> Combat Settings
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="flex-1">
                                                        <label className="text-xs text-gray-400 block mb-1">Max Hit</label>
                                                        <input
                                                            type="number"
                                                            value={maxHit}
                                                            onChange={(e) => setMaxHit(Number(e.target.value))}
                                                            placeholder="0"
                                                            className="w-full bg-osrs-bg border border-osrs-border rounded px-3 py-2 text-white font-mono focus:border-osrs-gold outline-none"
                                                        />
                                                    </div>
                                                    <div className="flex-1 relative" ref={weaponDropdownRef}>
                                                        <label className="text-xs text-gray-400 block mb-1">Weapon</label>
                                                        <div
                                                            className="relative"
                                                            onClick={() => setIsWeaponDropdownOpen(!isWeaponDropdownOpen)}
                                                        >
                                                            <input
                                                                type="text"
                                                                value={weaponSearch}
                                                                onChange={(e) => {
                                                                    setWeaponSearch(e.target.value);
                                                                    setIsWeaponDropdownOpen(true);
                                                                }}
                                                                placeholder="Search weapon..."
                                                                className="w-full bg-osrs-bg border border-osrs-border rounded px-3 py-2 text-white text-sm focus:border-osrs-gold outline-none pr-8"
                                                            />
                                                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                                                        </div>

                                                        {isWeaponDropdownOpen && (
                                                            <div className="absolute top-full left-0 right-0 mt-1 bg-osrs-bg border border-osrs-border rounded shadow-xl z-50 max-h-48 overflow-y-auto">
                                                                {WEAPON_DATA
                                                                    .filter(w => {
                                                                        const matchesSearch = w.name.toLowerCase().includes(weaponSearch.toLowerCase());
                                                                        let matchesCategory = true;
                                                                        if (selectedSkill === 'ranged') matchesCategory = w.category === 'Ranged';
                                                                        else if (selectedSkill === 'magic') matchesCategory = w.category === 'Magic';
                                                                        else if (['attack', 'strength', 'defence'].includes(selectedSkill as string)) matchesCategory = w.category === 'Melee';
                                                                        return matchesSearch && matchesCategory;
                                                                    })
                                                                    .map((w, i) => (
                                                                        <div
                                                                            key={i}
                                                                            onClick={() => {
                                                                                setAttackSpeed(w.speed);
                                                                                setWeaponSearch(w.name);
                                                                                setIsWeaponDropdownOpen(false);
                                                                            }}
                                                                            className="px-3 py-2 hover:bg-osrs-panel cursor-pointer text-sm text-gray-300 hover:text-white border-b border-white/5 last:border-0 flex justify-between items-center"
                                                                        >
                                                                            <span>{w.name}</span>
                                                                            <span className="text-xs text-osrs-gold bg-black/50 px-1.5 py-0.5 rounded">{w.speed} ticks</span>
                                                                        </div>
                                                                    ))
                                                                }
                                                                {WEAPON_DATA.filter(w => {
                                                                    const matchesSearch = w.name.toLowerCase().includes(weaponSearch.toLowerCase());
                                                                    let matchesCategory = true;
                                                                    if (selectedSkill === 'ranged') matchesCategory = w.category === 'Ranged';
                                                                    else if (selectedSkill === 'magic') matchesCategory = w.category === 'Magic';
                                                                    else if (['attack', 'strength', 'defence'].includes(selectedSkill as string)) matchesCategory = w.category === 'Melee';
                                                                    return matchesSearch && matchesCategory;
                                                                }).length === 0 && (
                                                                        <div className="px-3 py-2 text-xs text-gray-500 italic">No weapons found</div>
                                                                    )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="text-[10px] text-gray-500 italic flex justify-between">
                                                    <span>*Estimates XP/hr based on continuous combat.</span>
                                                    {attackSpeed > 0 && <span className="text-osrs-yellow">Speed: {attackSpeed} ticks ({attackSpeed * 0.6}s)</span>}
                                                </div>
                                            </div>
                                        )}

                                        {/* XP Rate Input */}
                                        <div>
                                            <label className="text-xs text-gray-400 block mb-1">XP Rate (XP/hr)</label>
                                            <input
                                                type="number"
                                                value={calcXpRate}
                                                onChange={(e) => setCalcXpRate(Number(e.target.value))}
                                                className="w-full bg-osrs-bg border border-osrs-border rounded px-3 py-2 text-white font-mono focus:border-osrs-gold outline-none"
                                            />
                                        </div>

                                        {/* Results */}
                                        <div className="bg-osrs-bg/30 p-3 rounded border border-white/5 space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-300">XP Needed:</span>
                                                <span className="text-white font-mono font-bold">
                                                    {(getTargetXp(targetLevel) - (stats[selectedSkill] as SkillData).xp > 0
                                                        ? getTargetXp(targetLevel) - (stats[selectedSkill] as SkillData).xp
                                                        : 0).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm border-b border-white/5 pb-2">
                                                <span className="text-gray-300">Time to Goal:</span>
                                                <span className="text-osrs-gold font-mono font-bold">
                                                    {calcXpRate > 0
                                                        ? Math.max(0, (getTargetXp(targetLevel) - (stats[selectedSkill] as SkillData).xp) / calcXpRate).toFixed(1)
                                                        : '∞'} hours
                                                </span>
                                            </div>

                                            {/* Real-time Cost Calculation */}
                                            {(() => {
                                                const currentMethod = SKILL_PRESETS[selectedSkill!]?.find(p => p.name === methodSearch);

                                                // Common metrics
                                                const xpNeeded = Math.max(0, getTargetXp(targetLevel) - (stats[selectedSkill!] as SkillData).xp);

                                                if (currentMethod?.requirements) {
                                                    if (!prices) {
                                                        return (
                                                            <div className="flex items-center gap-2 justify-center py-2 text-xs text-gray-500 animate-pulse">
                                                                <Clock size={12} /> Loading live prices...
                                                            </div>
                                                        );
                                                    }

                                                    let costPerAction = 0;
                                                    let missingData = false;

                                                    currentMethod.requirements.forEach(req => {
                                                        const p = prices[req.id];
                                                        if (!p) {
                                                            missingData = true;
                                                            return;
                                                        }
                                                        const buyPrice = p.high || p.low || 0;
                                                        const sellPrice = p.low || p.high || 0;
                                                        if (req.type === 'input') costPerAction += buyPrice * req.qty;
                                                        else costPerAction -= sellPrice * req.qty;
                                                    });

                                                    if (missingData) {
                                                        return (
                                                            <div className="text-xs text-red-400 text-center py-1">
                                                                Price data unavailable for this method.
                                                            </div>
                                                        );
                                                    }

                                                    const gpPerXp = currentMethod.xpPerAction ? costPerAction / currentMethod.xpPerAction : 0;
                                                    const totalCost = (gpPerXp * xpNeeded);

                                                    return (
                                                        <div className="space-y-2 pt-1">
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-gray-300">GP / XP:</span>
                                                                <span className={`font-mono font-bold ${gpPerXp > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                                    {gpPerXp > 0 ? '+' : ''}{gpPerXp.toFixed(2)} gp
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center text-sm">
                                                                <span className="text-gray-300">Total Cost:</span>
                                                                <span className={`font-mono font-bold ${totalCost > 0 ? 'text-red-400' : 'text-green-400'}`}>
                                                                    {totalCost > 0 ? '+' : ''}{Math.abs(totalCost) >= 1000000
                                                                        ? (totalCost / 1000000).toFixed(2) + 'M'
                                                                        : Math.floor(totalCost).toLocaleString()} gp
                                                                </span>
                                                            </div>
                                                        </div>
                                                    );
                                                } else if (currentMethod?.xpPerAction) {
                                                    return (
                                                        <div className="flex justify-between items-center text-xs pt-1 text-gray-400">
                                                            <span>Actions Required:</span>
                                                            <span className="text-white font-mono">{Math.ceil(xpNeeded / currentMethod.xpPerAction).toLocaleString()}</span>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            })()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Wiki Link Footer */}
                        <div className="relative z-10 flex justify-end">
                            <a
                                href={`https://oldschool.runescape.wiki/w/Pay-to-play_${selectedSkill}_training`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-osrs-orange hover:text-white transition-colors text-sm"
                            >
                                View full guide on OSRS Wiki <ExternalLink size={12} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PlayerStatsDisplay;
