import React, { useState } from 'react';
import { Sword, Shield, Calculator, Loader2, Coins, User } from 'lucide-react';
import { CombatStyle, BisResult, SlotType, EquipableItem, AttackType, CombatFocus } from '../types';
import { getPlayerStats, PlayerStats } from '../services/osrs';
import { calculateBestInSlot } from '../services/bis';
import { parseGP } from '../utils/format';
import { UNLOCKS } from '../services/unlocks';
import ItemSelectorModal from '../components/ItemSelectorModal';
import { calculateSetStats } from '../services/bis';

const SlotDisplay = ({
    slot,
    item,
    icon,
    combatStyle,
    attackType,
    focus,
    onClick
}: {
    slot: string,
    item: EquipableItem | null,
    icon: string,
    combatStyle?: CombatStyle,
    attackType?: AttackType,
    focus?: CombatFocus,
    onClick?: () => void
}) => {
    // Helper to determine if a stat is relevant
    const isRelevant = (statKey: string) => {
        if (!combatStyle) return true; // Show all if no context
        if (statKey === 'prayer') return true;

        if (focus === CombatFocus.DEFENCE) {
            return statKey.startsWith('defence_');
        }

        switch (combatStyle) {
            case CombatStyle.MELEE:
                return statKey === 'melee_strength' || (attackType && statKey === `attack_${attackType.toLowerCase()}`);
            case CombatStyle.RANGED:
                return statKey === 'ranged_strength' || statKey === 'attack_ranged';
            case CombatStyle.MAGIC:
                return statKey === 'magic_damage' || statKey === 'attack_magic';
            default:
                return false;
        }
    };

    return (
        <div className="flex flex-col items-center group relative">
            <div
                onClick={onClick}
                className={`w-[3.75rem] h-[3.75rem] rounded-lg border-2 flex items-center justify-center mb-0.5 transition-all relative overflow-hidden cursor-pointer hover:brightness-110 active:scale-95 ${item
                    ? 'bg-osrs-panel border-osrs-gold shadow-[0_0_15px_rgba(255,215,0,0.3)]'
                    : 'bg-black/20 border-white/10'
                    }`}>
                {item ? (
                    <div className="w-full h-full p-0.5 flex items-center justify-center overflow-hidden">
                        {item.icon ? (
                            <img src={item.icon} alt={item.name} className="w-full h-full object-contain object-center drop-shadow-md" />
                        ) : (
                            <div className="text-xl">{icon}</div>
                        )}
                    </div>
                ) : (
                    <span className="text-xl opacity-20 grayscale">{icon}</span>
                )}
            </div>

            <span className={`text-[10px] font-bold text-center max-w-[100px] truncate px-1 py-0 rounded ${item ? 'bg-black/60 text-white' : 'text-transparent'}`}>
                {item ? item.name : 'Empty'}
            </span>
            {item && (
                <span className="text-[9px] text-yellow-400 font-mono bg-black/80 px-1 py-0 rounded mt-0.5 border border-white/5">
                    {item.wiki_price?.toLocaleString()} gp
                </span>
            )}

            {/* HOVER TOOLTIP */}
            {item && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-black/95 border border-osrs-gold rounded p-2 z-[100] hidden group-hover:block pointer-events-none shadow-xl">
                    <h4 className="text-osrs-gold text-xs font-bold border-b border-white/20 pb-1 mb-1">{item.name}</h4>
                    <div className="space-y-0.5 text-[10px]">
                        {Object.entries(item.stats).map(([key, val]) => {
                            // Ensure 'val' is a number and not 0 to prevent React errors and hide empty stats
                            if (typeof val !== 'number' || val === 0) return null;

                            const relevant = isRelevant(key);
                            // Format key for display (e.g. melee_strength -> Melee Str)
                            const label = key.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())
                                .replace('Melee Strength', 'Str Bonus')
                                .replace('Ranged Strength', 'Ranged Str')
                                .replace('Magic Damage', 'Magic Dmg')
                                .replace('Attack ', 'Att: ')
                                .replace('Defence ', 'Def: ');

                            return (
                                <div key={key} className={`flex justify-between ${relevant ? 'text-white font-bold' : 'text-gray-500'}`}>
                                    <span>{label}</span>
                                    <span className={val > 0 ? 'text-green-400' : 'text-red-400'}>{val > 0 ? '+' : ''}{val}</span>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-1 pt-1 border-t border-white/10 text-[9px] text-yellow-500 text-right">
                        {item.wiki_price === 0 ? 'Unlocked (Free)' : `Price: ${item.wiki_price?.toLocaleString()} gp`}
                    </div>
                </div>
            )}
        </div>
    );
};

const StatRow = ({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) => (
    <div className="flex justify-between items-center">
        <span className={`${highlight ? 'text-white font-bold' : 'text-gray-400'}`}>{label}</span>
        <span className={`font-mono ${highlight ? 'text-osrs-gold font-bold' : 'text-white'}`}>{value}</span>
    </div>
);

const BestInSlotPage: React.FC = () => {
    const [combatStyle, setCombatStyle] = useState<CombatStyle>(CombatStyle.MELEE);
    const [attackType, setAttackType] = useState<AttackType>(AttackType.SLASH);
    const [focus, setFocus] = useState<CombatFocus>(CombatFocus.OFFENSE);
    const [budget, setBudget] = useState<number>(10000000); // 10M default
    const [budgetInput, setBudgetInput] = useState<string>('10,000,000');
    const [username, setUsername] = useState<string>('');

    // New Filters
    const [isMembers, setIsMembers] = useState<boolean>(true);
    const [unlockedItems, setUnlockedItems] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<BisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<PlayerStats | null>(null);

    // Auto-update attack type when style changes
    React.useEffect(() => {
        if (combatStyle === CombatStyle.RANGED) setAttackType(AttackType.RANGED);
        if (combatStyle === CombatStyle.MAGIC) setAttackType(AttackType.MAGIC);
        if (combatStyle === CombatStyle.MELEE && (attackType === AttackType.RANGED || attackType === AttackType.MAGIC)) {
            setAttackType(AttackType.SLASH); // Reset to slash for melee default
        }
    }, [combatStyle]);

    // Parse budget input when it changes
    React.useEffect(() => {
        const val = parseGP(budgetInput);
        // Only update if valid and different to prevent loops/resets
        if (val !== budget) {
            setBudget(val);
        }
    }, [budgetInput]);

    // Manual Swap State
    const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
    const [swapSlot, setSwapSlot] = useState<string>('');

    const handleSlotClick = (slot: string) => {
        if (!result) return;
        setSwapSlot(slot);
        setIsSwapModalOpen(true);
    };

    const handleItemSelect = (item: EquipableItem) => {
        if (!result) return;

        // 1. Update items
        const newItems = { ...result.items, [swapSlot]: item };

        // 2. Handle 2H logic
        const isNewItem2h = item.is2h || item.slot === '2h';

        if (isNewItem2h && swapSlot === SlotType.WEAPON) {
            // If equipping 2h weapon, remove shield
            newItems[SlotType.SHIELD] = null;
        }

        if (swapSlot === SlotType.SHIELD) {
            // If equipping shield, ensure we don't have a 2h weapon
            const weapon = newItems[SlotType.WEAPON];
            if (weapon && (weapon.is2h || weapon.slot === '2h')) {
                newItems[SlotType.WEAPON] = null;
            }
        }

        // 3. Recalculate stats
        const newResult = calculateSetStats(
            newItems,
            combatStyle,
            attackType,
            stats,
            0
        );

        // Update result preserving original budget if needed, but here we just update totals
        // For remaining budget, we can stick to the original logic:
        const newRemaining = budget - newResult.totalCost;

        setResult({
            ...newResult,
            remainingBudget: newRemaining
        });

        setIsSwapModalOpen(false);
    };

    const handleCalculate = async () => {
        setLoading(true);
        setError(null);
        setStats(null);

        if (!username.trim()) {
            setError("Username is required");
            setLoading(false);
            return;
        }

        try {
            let playerStats: PlayerStats | undefined;
            try {
                playerStats = await getPlayerStats(username);
                setStats(playerStats);
            } catch (e) {
                setError(`Could not find stats for user "${username}". Please check the spelling.`);
                setLoading(false);
                return;
            }

            const res = await calculateBestInSlot(combatStyle, budget, playerStats, attackType, focus, isMembers, unlockedItems);
            setResult(res);
        } catch (err) {
            console.error(err);
            setError("Failed to calculate Best in Slot. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(2) + 'B';
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toLocaleString();
    };

    const getSlotIcon = (slot: string) => {
        // Simple placeholders
        switch (slot) {
            case SlotType.HEAD: return '🧢';
            case SlotType.CAPE: return '🧣';
            case SlotType.NECK: return '📿';
            case SlotType.AMMO: return '🏹';
            case SlotType.WEAPON: return '⚔️';
            case SlotType.BODY: return '👕';
            case SlotType.SHIELD: return '🛡️';
            case SlotType.LEGS: return '👖';
            case SlotType.HANDS: return '🧤';
            case SlotType.FEET: return '👢';
            case SlotType.RING: return '💍';
            default: return '❓';
        }
    };

    return (
        <div className="max-w-[1600px] mx-auto p-4 space-y-6 animate-fade-in min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-osrs-panel border border-osrs-border p-4 rounded-lg shadow-lg relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Sword size={80} />
                </div>
                <h1 className="text-3xl font-fantasy text-osrs-yellow drop-shadow-md mb-1">
                    Best in Slot Optimizer
                </h1>
                <p className="text-osrs-light-gray max-w-2xl text-sm">
                    Calculate the most efficient gear setup for your budget. Our algorithm finds the best stat upgrades per gold piece spent.
                </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
                {/* Sidebar - Configuration */}
                <div className="w-full xl:w-80 bg-osrs-panel border border-osrs-border rounded-lg p-5 shadow-lg flex flex-col gap-4 shrink-0 h-fit">
                    <div>
                        <h2 className="text-xl text-osrs-gold font-fantasy text-center tracking-widest uppercase mb-1">Configuration</h2>

                        {/* Game Mode */}
                        <div className="flex justify-center gap-2 mb-6">
                            <button
                                onClick={() => setIsMembers(false)}
                                className={`px-3 py-1 text-xs font-bold uppercase border border-black rounded transition-all ${!isMembers ? 'bg-osrs-gold text-black' : 'bg-[#3e362f] text-gray-400'}`}
                            >
                                F2P
                            </button>
                            <button
                                onClick={() => setIsMembers(true)}
                                className={`px-3 py-1 text-xs font-bold uppercase border border-black rounded transition-all ${isMembers ? 'bg-osrs-gold text-black' : 'bg-[#3e362f] text-gray-400'}`}
                            >
                                Members
                            </button>
                        </div>

                        <div className="border-b border-white/10 mb-4"></div>

                        <h3 className="text-center text-xs text-osrs-light-gray mb-4 uppercase tracking-wider font-bold">Combat Style</h3>


                        {/* ATTACK */}
                        <div className="mb-4">
                            <h3 className="text-right text-osrs-lighter-gray font-bold text-sm mb-1 uppercase tracking-wider">Attack</h3>
                            <div className="flex justify-end gap-2">
                                {/* Melee Attack Types */}
                                {[
                                    { type: AttackType.STAB, icon: 'https://static.runelite.net/cache/item/icon/1207.png', label: 'Stab (Dagger)' },
                                    { type: AttackType.SLASH, icon: 'https://static.runelite.net/cache/item/icon/1325.png', label: 'Slash (Scimitar)' },
                                    { type: AttackType.CRUSH, icon: 'https://static.runelite.net/cache/item/icon/1339.png', label: 'Crush (Warhammer)' }
                                ].map((opt) => (
                                    <button
                                        key={opt.type}
                                        onClick={() => {
                                            setCombatStyle(CombatStyle.MELEE);
                                            setAttackType(opt.type);
                                            setFocus(CombatFocus.OFFENSE);
                                        }}
                                        className={`w-10 h-10 rounded border transition-all p-1 ${combatStyle === CombatStyle.MELEE && attackType === opt.type && focus === CombatFocus.OFFENSE
                                            ? 'bg-osrs-gold border-osrs-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                                            : 'bg-[#3e362f] border-black hover:bg-[#4a4138] hover:border-[#6a5f52] hover:brightness-110'
                                            }`}
                                        title={`Attack: ${opt.label}`}
                                    >
                                        <img src={opt.icon} alt={opt.label} className="w-full h-full object-contain" />
                                    </button>
                                ))}

                                {/* Ranged & Magic Attack */}
                                <button
                                    onClick={() => { setCombatStyle(CombatStyle.RANGED); setAttackType(AttackType.RANGED); setFocus(CombatFocus.OFFENSE); }}
                                    className={`w-10 h-10 rounded border transition-all p-1 ${combatStyle === CombatStyle.RANGED && focus === CombatFocus.OFFENSE
                                        ? 'bg-osrs-gold border-osrs-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                                        : 'bg-[#3e362f] border-black hover:bg-[#4a4138] hover:border-[#6a5f52] hover:brightness-110'
                                        }`}
                                    title="Ranged Attack (Bow)"
                                >
                                    <img src="https://static.runelite.net/cache/item/icon/861.png" alt="Ranged" className="w-full h-full object-contain" />
                                </button>
                                <button
                                    onClick={() => { setCombatStyle(CombatStyle.MAGIC); setAttackType(AttackType.MAGIC); setFocus(CombatFocus.OFFENSE); }}
                                    className={`w-10 h-10 rounded border transition-all p-1 ${combatStyle === CombatStyle.MAGIC && focus === CombatFocus.OFFENSE
                                        ? 'bg-osrs-gold border-osrs-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                                        : 'bg-[#3e362f] border-black hover:bg-[#4a4138] hover:border-[#6a5f52] hover:brightness-110'
                                        }`}
                                    title="Magic Attack (Staff)"
                                >
                                    <img src="https://static.runelite.net/cache/item/icon/1381.png" alt="Magic" className="w-full h-full object-contain" />
                                </button>
                            </div>
                        </div>

                        {/* DEFENCE */}
                        <div className="mb-4">
                            <h3 className="text-right text-osrs-lighter-gray font-bold text-sm mb-1 uppercase tracking-wider">Defence</h3>
                            <div className="flex justify-end gap-2">
                                {[
                                    { type: AttackType.STAB, icon: 'https://static.runelite.net/cache/item/icon/1207.png', label: 'Stab Defence' },
                                    { type: AttackType.SLASH, icon: 'https://static.runelite.net/cache/item/icon/1325.png', label: 'Slash Defence' },
                                    { type: AttackType.CRUSH, icon: 'https://static.runelite.net/cache/item/icon/1339.png', label: 'Crush Defence' }
                                ].map((opt) => (
                                    <button
                                        key={opt.type}
                                        onClick={() => {
                                            // For Defence, we just set Focus to Defence and Attack Type to what we want to defend against
                                            setFocus(CombatFocus.DEFENCE);
                                            setAttackType(opt.type);
                                            // Combat style matters less for defence calculation unless restricting items, default to melee for generic tank
                                            setCombatStyle(CombatStyle.MELEE);
                                        }}
                                        className={`w-10 h-10 rounded border transition-all p-1 ${focus === CombatFocus.DEFENCE && attackType === opt.type
                                            ? 'bg-osrs-gold border-osrs-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                                            : 'bg-[#3e362f] border-black hover:bg-[#4a4138] hover:border-[#6a5f52] hover:brightness-110'
                                            }`}
                                        title={opt.label}
                                    >
                                        <img src={opt.icon} alt={opt.label} className="w-full h-full object-contain" />
                                    </button>
                                ))}

                                <button
                                    onClick={() => { setFocus(CombatFocus.DEFENCE); setAttackType(AttackType.RANGED); setCombatStyle(CombatStyle.RANGED); }}
                                    className={`w-10 h-10 rounded border transition-all p-1 ${focus === CombatFocus.DEFENCE && attackType === AttackType.RANGED
                                        ? 'bg-osrs-gold border-osrs-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                                        : 'bg-[#3e362f] border-black hover:bg-[#4a4138] hover:border-[#6a5f52] hover:brightness-110'
                                        }`}
                                    title="Ranged Defence"
                                >
                                    <img src="https://static.runelite.net/cache/item/icon/861.png" alt="Ranged Defence" className="w-full h-full object-contain" />
                                </button>

                                <button
                                    onClick={() => { setFocus(CombatFocus.DEFENCE); setAttackType(AttackType.MAGIC); setCombatStyle(CombatStyle.MAGIC); }}
                                    className={`w-10 h-10 rounded border transition-all p-1 ${focus === CombatFocus.DEFENCE && attackType === AttackType.MAGIC
                                        ? 'bg-osrs-gold border-osrs-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                                        : 'bg-[#3e362f] border-black hover:bg-[#4a4138] hover:border-[#6a5f52] hover:brightness-110'
                                        }`}
                                    title="Magic Defence"
                                >
                                    <img src="https://static.runelite.net/cache/item/icon/1381.png" alt="Magic Defence" className="w-full h-full object-contain" />
                                </button>
                            </div>
                        </div>





                    </div>

                    {/* Budget */}
                    <div>
                        <label className="block text-osrs-gold text-xs font-bold mb-1 uppercase tracking-wider">
                            Budget (GP)
                        </label>
                        <div className="relative">
                            <span className="absolute left-3 top-2.5 text-osrs-lighter-gray">$</span>
                            <input
                                type="text"
                                value={budgetInput}
                                onChange={(e) => setBudgetInput(e.target.value)}
                                placeholder="e.g. 10m, 500k"
                                className="w-full bg-black/60 border border-osrs-border rounded p-2 pl-7 py-2 text-white font-mono focus:border-osrs-gold outline-none transition-colors"
                            />
                        </div>
                        <div className="flex justify-between gap-1 mt-2">
                            {[1000000, 10000000, 100000000, 1000000000].map((amt) => (
                                <button
                                    key={amt}
                                    onClick={() => {
                                        setBudget(amt);
                                        setBudgetInput(amt.toLocaleString());
                                    }}
                                    className={`px-2 py-1 text-[10px] font-bold uppercase border border-black rounded transition-all
                                        ${budget === amt
                                            ? 'bg-osrs-gold text-black border-osrs-gold shadow-[0_0_10px_rgba(255,215,0,0.3)]'
                                            : 'bg-[#3e362f] text-gray-200 hover:bg-[#4a4138] hover:border-[#6a5f52] hover:brightness-110'
                                        }`}
                                >
                                    {amt >= 1000000000 ? '1B' : amt >= 1000000 ? `${amt / 1000000}M` : amt}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Unlocks */}
                    <div>
                        <label className="block text-osrs-gold text-xs font-bold mb-2 uppercase tracking-wider mt-4">
                            Unlocks
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {UNLOCKS.map((item) => {
                                const isUnlocked = unlockedItems.includes(item.id);
                                return (
                                    <button
                                        key={item.id}
                                        onClick={() => {
                                            if (isUnlocked) {
                                                setUnlockedItems(prev => prev.filter(id => id !== item.id));
                                            } else {
                                                setUnlockedItems(prev => [...prev, item.id]);
                                            }
                                        }}
                                        className={`section-button aspect-square p-1 rounded border transition-all relative group
                                            ${isUnlocked
                                                ? 'bg-osrs-gold border-osrs-gold'
                                                : 'bg-[#3e362f] border-black opacity-60 hover:opacity-100'
                                            }`}
                                        title={item.name}
                                    >
                                        <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                                        {isUnlocked && (
                                            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-black shadow-sm"></div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Username */}
                    <div>
                        <label className="block text-osrs-gold text-xs font-bold mb-1 uppercase tracking-wider">
                            Username <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 text-osrs-lighter-gray" size={16} />
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    if (error === "Username is required") setError(null);
                                }}
                                placeholder="SourCitrix"
                                className={`w-full bg-black/60 border rounded p-2 pl-9 text-white focus:outline-none transition-colors ${error === "Username is required" ? "border-red-500" : "border-osrs-border focus:border-osrs-gold"
                                    }`}
                            />
                        </div>
                    </div>

                    <div className="mt-auto pt-4">
                        <button
                            onClick={handleCalculate}
                            disabled={loading}
                            className={`w-full py-3 bg-green-700 hover:bg-green-600 text-white font-bold rounded flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Calculator size={20} />}
                            Calculate
                        </button>
                    </div>

                    {/* Error Message */}
                    {
                        error && (
                            <div className="bg-red-900/50 border border-red-500 text-red-200 p-3 rounded text-center text-xs mt-2">
                                {error}
                            </div>
                        )
                    }
                </div >

                {/* Middle & Right Content */}
                {
                    !result ? (
                        /* Empty State */
                        <div className="flex-1 bg-black/20 border border-white/5 rounded-lg p-6 relative flex flex-col items-center justify-center min-h-[500px]">
                            <div className="text-center space-y-4 opacity-50">
                                <Shield size={64} className="mx-auto text-gray-600" />
                                <h3 className="text-xl font-fantasy text-gray-400">Ready to Optimize</h3>
                                <p className="max-w-md mx-auto text-gray-500">
                                    Configure your combat style and budget on the left, then click Calculate to see the best possible gear setup.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Middle: Recommended Setup */}
                            <div className="flex-1 bg-black/40 border border-osrs-border rounded-lg p-4 backdrop-blur-sm flex flex-col animate-fade-in-up min-w-[320px]">
                                <h2 className="text-osrs-gold font-fantasy text-xl border-b border-osrs-border/30 pb-2 mb-4 text-center">
                                    Recommended Setup
                                </h2>
                                <div className="flex-1 flex items-center justify-center">
                                    <div className="grid grid-cols-3 gap-2 max-w-[320px] mx-auto relative cursor-default">
                                        {/* Row 1: Head */}
                                        <div className="col-start-2">
                                            <SlotDisplay slot={SlotType.HEAD} item={result.items[SlotType.HEAD]} icon={getSlotIcon(SlotType.HEAD)} combatStyle={combatStyle} attackType={attackType} focus={focus} onClick={() => handleSlotClick(SlotType.HEAD)} />
                                        </div>

                                        {/* Row 2: Cape, Neck, Ammo */}
                                        <div className="col-start-1 text-right"><SlotDisplay slot={SlotType.CAPE} item={result.items[SlotType.CAPE]} icon={getSlotIcon(SlotType.CAPE)} combatStyle={combatStyle} attackType={attackType} focus={focus} onClick={() => handleSlotClick(SlotType.CAPE)} /></div>
                                        <div className="col-start-2"><SlotDisplay slot={SlotType.NECK} item={result.items[SlotType.NECK]} icon={getSlotIcon(SlotType.NECK)} combatStyle={combatStyle} attackType={attackType} focus={focus} onClick={() => handleSlotClick(SlotType.NECK)} /></div>
                                        <div className="col-start-3"><SlotDisplay slot={SlotType.AMMO} item={result.items[SlotType.AMMO]} icon={getSlotIcon(SlotType.AMMO)} combatStyle={combatStyle} attackType={attackType} focus={focus} onClick={() => handleSlotClick(SlotType.AMMO)} /></div>

                                        {/* Row 3: Weapon, Body, Shield */}
                                        <div className="col-start-1"><SlotDisplay slot={SlotType.WEAPON} item={result.items[SlotType.WEAPON]} icon={getSlotIcon(SlotType.WEAPON)} combatStyle={combatStyle} attackType={attackType} focus={focus} onClick={() => handleSlotClick(SlotType.WEAPON)} /></div>
                                        <div className="col-start-2"><SlotDisplay slot={SlotType.BODY} item={result.items[SlotType.BODY]} icon={getSlotIcon(SlotType.BODY)} combatStyle={combatStyle} attackType={attackType} focus={focus} onClick={() => handleSlotClick(SlotType.BODY)} /></div>
                                        <div className="col-start-3"><SlotDisplay slot={SlotType.SHIELD} item={result.items[SlotType.SHIELD]} icon={getSlotIcon(SlotType.SHIELD)} combatStyle={combatStyle} attackType={attackType} focus={focus} onClick={() => handleSlotClick(SlotType.SHIELD)} /></div>

                                        {/* Row 4: Legs */}
                                        <div className="col-start-2"><SlotDisplay slot={SlotType.LEGS} item={result.items[SlotType.LEGS]} icon={getSlotIcon(SlotType.LEGS)} combatStyle={combatStyle} attackType={attackType} focus={focus} onClick={() => handleSlotClick(SlotType.LEGS)} /></div>

                                        {/* Row 5: Hands, Feet, Ring */}
                                        <div className="col-start-1"><SlotDisplay slot={SlotType.HANDS} item={result.items[SlotType.HANDS]} icon={getSlotIcon(SlotType.HANDS)} combatStyle={combatStyle} attackType={attackType} focus={focus} onClick={() => handleSlotClick(SlotType.HANDS)} /></div>
                                        <div className="col-start-2"><SlotDisplay slot={SlotType.FEET} item={result.items[SlotType.FEET]} icon={getSlotIcon(SlotType.FEET)} combatStyle={combatStyle} attackType={attackType} focus={focus} onClick={() => handleSlotClick(SlotType.FEET)} /></div>
                                        <div className="col-start-3"><SlotDisplay slot={SlotType.RING} item={result.items[SlotType.RING]} icon={getSlotIcon(SlotType.RING)} combatStyle={combatStyle} attackType={attackType} focus={focus} onClick={() => handleSlotClick(SlotType.RING)} /></div>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Stats & Breakdown */}
                            <div className="w-full xl:w-80 space-y-4 shrink-0 animate-fade-in-right">
                                {/* Cost Summary */}
                                <div className="bg-osrs-panel border border-osrs-border rounded-lg p-5 shadow-lg">
                                    <h3 className="text-osrs-gold font-bold uppercase tracking-wider text-xs mb-4 border-b border-osrs-border/30 pb-2 flex items-center justify-between">
                                        <span>Investment</span>
                                        <span className="text-green-400">{((result.totalCost / (result.totalCost + result.remainingBudget)) * 100).toFixed(0)}% Utilized</span>
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Spent</span>
                                            <span className="text-lg text-yellow-400 font-mono font-bold">
                                                {formatNumber(result.totalCost)}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-400 text-sm">Remaining</span>
                                            <span className="text-green-400 font-mono">
                                                {formatNumber(result.remainingBudget)}
                                            </span>
                                        </div>
                                        <div className="h-1.5 bg-black rounded-full overflow-hidden mt-2 border border-white/10">
                                            <div
                                                className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-1000"
                                                style={{ width: `${Math.min(100, (result.totalCost / (result.totalCost + result.remainingBudget)) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Stats Summary */}
                                <div className="bg-osrs-panel border border-osrs-border rounded-lg p-4 shadow-lg flex flex-col gap-4">
                                    {/* Header */}
                                    <h3 className="text-osrs-gold font-bold uppercase tracking-wider text-xs border-b border-osrs-border/30 pb-2 flex justify-between items-center">
                                        <span>Combat Stats</span>
                                        {result.maxHit > 0 && (
                                            <span className="text-osrs-orange text-[10px] bg-red-900/40 px-2 py-0.5 rounded border border-red-500/30 font-mono">
                                                Max Hit: {result.maxHit}
                                            </span>
                                        )}
                                    </h3>

                                    {/* Attack Bonuses */}
                                    <div>
                                        <h4 className="text-osrs-lighter-gray text-[10px] uppercase font-bold mb-1 tracking-wide">Attack Bonuses</h4>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                            <StatRow label="Stab" value={result.totalStats.attack_stab} highlight={attackType === AttackType.STAB} />
                                            <StatRow label="Slash" value={result.totalStats.attack_slash} highlight={attackType === AttackType.SLASH} />
                                            <StatRow label="Crush" value={result.totalStats.attack_crush} highlight={attackType === AttackType.CRUSH} />
                                            <StatRow label="Magic" value={result.totalStats.attack_magic} highlight={attackType === AttackType.MAGIC} />
                                            <StatRow label="Ranged" value={result.totalStats.attack_ranged} highlight={attackType === AttackType.RANGED} />
                                        </div>
                                    </div>

                                    {/* Defence Bonuses */}
                                    <div>
                                        <h4 className="text-osrs-lighter-gray text-[10px] uppercase font-bold mb-1 tracking-wide">Defence Bonuses</h4>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                            <StatRow label="Stab" value={result.totalStats.defence_stab} highlight={focus === CombatFocus.DEFENCE} />
                                            <StatRow label="Slash" value={result.totalStats.defence_slash} highlight={focus === CombatFocus.DEFENCE} />
                                            <StatRow label="Crush" value={result.totalStats.defence_crush} highlight={focus === CombatFocus.DEFENCE} />
                                            <StatRow label="Magic" value={result.totalStats.defence_magic} highlight={focus === CombatFocus.DEFENCE} />
                                            <StatRow label="Ranged" value={result.totalStats.defence_ranged} highlight={focus === CombatFocus.DEFENCE} />
                                        </div>
                                    </div>

                                    {/* Other Bonuses */}
                                    <div>
                                        <h4 className="text-osrs-lighter-gray text-[10px] uppercase font-bold mb-1 tracking-wide">Other Bonuses</h4>
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                            <StatRow label="Melee Str" value={result.totalStats.melee_strength} highlight={combatStyle === CombatStyle.MELEE} />
                                            <StatRow label="Ranged Str" value={result.totalStats.ranged_strength} highlight={combatStyle === CombatStyle.RANGED} />
                                            <StatRow label="Magic Dmg" value={`${result.totalStats.magic_damage}%`} highlight={combatStyle === CombatStyle.MAGIC} />
                                            <StatRow label="Prayer" value={result.totalStats.prayer} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                }
            </div >

            <ItemSelectorModal
                isOpen={isSwapModalOpen}
                onClose={() => setIsSwapModalOpen(false)}
                slot={swapSlot}
                onSelect={handleItemSelect}
            />
        </div >
    );
};



export default BestInSlotPage;
