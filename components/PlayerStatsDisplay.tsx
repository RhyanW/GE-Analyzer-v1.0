import React, { useState, useEffect, useRef } from 'react';
import { PlayerStats, SkillData } from '../types';
import { Trophy, Clock, Star, X, ExternalLink, Calculator, Lock, Calendar, ChevronRight, Settings, Search, ChevronDown } from 'lucide-react';
import { getNextLevelXp, getXpForLevel, XP_RATES } from '../services/osrs';
import { SKILL_ACTIONS, SKILL_UNLOCKS, SKILL_PRESETS, WEAPON_DATA, getCombatLevel, UnlockCategory } from '../services/skillData';

interface PlayerStatsDisplayProps {
    stats: PlayerStats;
    username: string;
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

const PlayerStatsDisplay: React.FC<PlayerStatsDisplayProps> = ({ stats, username }) => {
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

    const methodDropdownRef = useRef<HTMLDivElement>(null);
    const weaponDropdownRef = useRef<HTMLDivElement>(null);

    const totalLevel = stats.overall.level;
    const combatLevel = getCombatLevel(stats);

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

    return (
        <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {SKILL_NAMES.map((skillKey) => {
                    const data = stats[skillKey] as SkillData;
                    const progress = calculateProgress(data.level, data.xp);

                    return (
                        <div
                            key={skillKey}
                            onClick={() => setSelectedSkill(skillKey)}
                            className="bg-osrs-bg border border-osrs-border p-3 rounded hover:border-osrs-gold transition-colors group relative flex flex-col gap-2 cursor-pointer hover:bg-osrs-bg/80"
                        >
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
                                <span className={`text-lg font-bold ${data.level === 99 ? 'text-osrs-gold' : 'text-white'}`}>
                                    {data.level}
                                </span>
                            </div>

                            <div className="w-full bg-black/50 h-2 rounded-full overflow-hidden border border-osrs-border/50">
                                <div
                                    className="h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,0,0,0.3)]"
                                    style={getProgressStyle(progress)}
                                />
                            </div>

                            <div className="text-[10px] text-gray-400 flex flex-col gap-1">
                                <div className="flex justify-between">
                                    <span>XP:</span>
                                    <span className="text-white">{formatXp(data.xp)}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Advanced Skill Detail Modal */}
            {
                selectedSkill && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setSelectedSkill(null)}>
                        <div className="bg-osrs-panel border-2 border-osrs-gold rounded-lg p-6 max-w-5xl w-full shadow-2xl relative overflow-hidden flex flex-col gap-6 pt-12 md:pt-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
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

                                        {/* Heatmap (Mock) */}
                                        <div>
                                            <h5 className="text-xs text-gray-400 mb-2 flex items-center gap-1">
                                                <Calendar size={12} /> Recent Activity (Mock)
                                            </h5>
                                            <div className="flex gap-1 flex-wrap">
                                                {generateHeatmapData().map((d, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-3 h-3 rounded-sm"
                                                        style={{
                                                            backgroundColor: d.intensity === 0 ? '#1f2937' : `rgba(34, 197, 94, ${d.intensity * 0.25})`
                                                        }}
                                                        title={`Day ${d.day}: ${d.intensity} activity`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
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
                                            {COMBAT_SKILLS.includes(selectedSkill) && (
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
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-300">XP Needed:</span>
                                                    <span className="text-white font-bold">
                                                        {(getTargetXp(targetLevel) - (stats[selectedSkill] as SkillData).xp > 0
                                                            ? getTargetXp(targetLevel) - (stats[selectedSkill] as SkillData).xp
                                                            : 0).toLocaleString()}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center border-t border-white/10 pt-2">
                                                    <span className="text-osrs-yellow">Hours to Lvl {targetLevel}:</span>
                                                    <span className="text-osrs-green font-bold text-xl">
                                                        {calcXpRate > 0
                                                            ? Math.max(0, (getTargetXp(targetLevel) - (stats[selectedSkill] as SkillData).xp) / calcXpRate).toFixed(1)
                                                            : '∞'}
                                                    </span>
                                                </div>
                                                {SKILL_PRESETS[selectedSkill] && methodSearch && (
                                                    <div className="flex justify-between items-center border-t border-white/10 pt-2">
                                                        <span className="text-osrs-yellow">
                                                            {['attack', 'strength', 'defence', 'ranged', 'magic', 'hitpoints', 'slayer'].includes(selectedSkill)
                                                                ? 'Kills Required:'
                                                                : 'Actions Required:'}
                                                        </span>
                                                        <span className="text-white font-bold text-xl">
                                                            {(() => {
                                                                const preset = SKILL_PRESETS[selectedSkill]!.find(p => p.name === methodSearch);
                                                                if (!preset || !preset.xpPerAction) return '-';
                                                                const remainingXp = Math.max(0, getTargetXp(targetLevel) - (stats[selectedSkill] as SkillData).xp);
                                                                return Math.ceil(remainingXp / preset.xpPerAction).toLocaleString();
                                                            })()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Upcoming Unlocks */}
                            <div className="relative z-10">
                                <div className="bg-black/30 p-4 rounded border border-osrs-border/50">
                                    <h4 className="text-osrs-orange font-bold mb-4 flex items-center gap-2">
                                        <Lock size={16} /> Upcoming Unlocks
                                    </h4>

                                    {SKILL_UNLOCKS[selectedSkill] ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {(['Item', 'Quest', 'Other'] as UnlockCategory[]).map(category => {
                                                const categoryUnlocks = SKILL_UNLOCKS[selectedSkill]!
                                                    .filter(u => u.category === category && u.level > (stats[selectedSkill] as SkillData).level)
                                                    .sort((a, b) => a.level - b.level);

                                                if (categoryUnlocks.length === 0) return null;

                                                return (
                                                    <div key={category} className="bg-osrs-bg/30 rounded p-3 border border-white/5">
                                                        <h5 className="text-osrs-yellow font-bold text-sm mb-2 border-b border-white/10 pb-1">
                                                            {category === 'Other' ? 'Abilities & Other' : `${category}s`}
                                                        </h5>
                                                        <ul className="space-y-2">
                                                            {categoryUnlocks.map((unlock, i) => (
                                                                <li key={i} className="text-sm flex justify-between items-start gap-2">
                                                                    <span className="text-gray-300">{unlock.description}</span>
                                                                    <span className="text-xs bg-black/50 px-1.5 py-0.5 rounded text-osrs-gold border border-osrs-border/30 whitespace-nowrap">
                                                                        Lvl {unlock.level}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                );
                                            })}
                                            {SKILL_UNLOCKS[selectedSkill]!.filter(u => u.level > (stats[selectedSkill] as SkillData).level).length === 0 && (
                                                <div className="col-span-3 text-center text-gray-500 italic py-4">
                                                    No major upcoming unlocks found.
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 italic py-4">
                                            No unlock data available for this skill.
                                        </div>
                                    )}
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
