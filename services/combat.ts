import { AttackType, CombatStyle, EquipmentStats, PlayerStats } from "../types";

// Base interface for calculation inputs
interface CalcInput {
    stats: EquipmentStats;
    playerStats?: any; // strict typing for PlayerStats if possible
    style: CombatStyle;
    attackType: AttackType;
}

/**
 * Calculates the Maximum Hit based on stats, gear, and combat style.
 * Formulas sourced from OSRS Wiki.
 */
export const calculateMaxHit = (
    stats: EquipmentStats,
    style: CombatStyle,
    attackType: AttackType,
    playerStats?: any
): number => {
    // Default to level 99 if no player stats provided
    const levels = {
        strength: playerStats?.strength?.level || 99,
        ranged: playerStats?.ranged?.level || 99,
        magic: playerStats?.magic?.level || 99,
    };

    // TODO: Add support for Prayers and Potions in a future update
    // For now, we assume base levels (unboosted, no prayer) to show raw gear potential
    // or maybe we should assume standard boosts (Super Combat / Ranging Potion + Piety/Rigour)
    // for a "Best in Slot" tool? 
    // Let's stick to BASE levels for now to avoid confusion, or maybe add a "Boosted" toggle later.

    if (style === CombatStyle.MELEE) {
        return calculateMeleeMaxHit(levels.strength, stats.melee_strength, attackType);
    } else if (style === CombatStyle.RANGED) {
        return calculateRangedMaxHit(levels.ranged, stats.ranged_strength, attackType);
    } else if (style === CombatStyle.MAGIC) {
        return calculateMagicMaxHit(levels.magic, stats.magic_damage, attackType);
    }

    return 0;
};

const calculateMeleeMaxHit = (strLevel: number, strBonus: number, attackType: AttackType): number => {
    // Effective Strength
    // Effective Str = Floor((Level + Boost) * Prayer) + Style + 8
    // Assuming Controlled for now (+1) or Aggressive (+3). Let's use Aggressive (+3) for max hit calc.
    const styleBonus = 3;
    let effectiveStr = Math.floor(strLevel) + styleBonus + 8;

    // Max Hit = Floor(0.5 + Effective Str * (Str Bonus + 64) / 640)
    const maxHit = Math.floor(0.5 + (effectiveStr * (strBonus + 64)) / 640);
    return maxHit;
};

const calculateRangedMaxHit = (rangeLevel: number, rangeStr: number, attackType: AttackType): number => {
    // Effective Ranged Strength
    // Similar to Melee: Floor((Level + Boost) * Prayer) + Style + 8
    // Accurate (+3) used for max hit usually.
    const styleBonus = 3;
    let effectiveRangeStr = Math.floor(rangeLevel) + styleBonus + 8;

    // Max Hit = Floor(0.5 + Effective Range Str * (Range Str + 64) / 640)
    const maxHit = Math.floor(0.5 + (effectiveRangeStr * (rangeStr + 64)) / 640);
    return maxHit;
};

const calculateMagicMaxHit = (magicLevel: number, magicDmg: number, attackType: AttackType): number => {
    // Magic is complex. Base max hit depends on spell.
    // Powered staves (Trident, etc) depend on magic level.
    // For general BiS, without a selected spell, we can't show a TRUE max hit.
    // But if we assume a powered staff (common for high level PvM), we can estimate.

    // Trident of the Swamp formula: Floor(Level / 3) - 2
    // Sang: Floor(Level / 3) - 1
    // Shadow: Floor(Level / 3) + 1 (plus massive multiplier)

    // For now, let's just return 0 for Magic effectively, or maybe calculation for a standard spell like Fire Surge (24)
    // Let's return the Max Hit of Fire Surge (standard max) boosted by dmg %

    const baseSpellMax = 24; // Fire Surge
    const multiplier = 1 + (magicDmg / 100);

    return Math.floor(baseSpellMax * multiplier);
};
