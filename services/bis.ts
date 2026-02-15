
import { EquipableItem, EquipmentStats, SlotType, CombatStyle, BisResult, AttackType, CombatFocus } from '../types';
import { fetchLatestPrices } from './market';
import { calculateMaxHit } from './combat';

const BASE_URL = 'https://raw.githubusercontent.com/0xNeffarion/osrsreboxed-db/master/docs/items-json-slot/';

const SLOTS_TO_FETCH = [
    'head', 'cape', 'neck', 'ammo', 'weapon', 'shield', 'body', 'legs', 'hands', 'feet', 'ring', '2h'
];

// Cache for the transformed items
let cachedItems: EquipableItem[] | null = null;

import { CUSTOM_ITEMS } from './customItems';

export const fetchEquipableItems = async (): Promise<EquipableItem[]> => {
    if (cachedItems) return cachedItems;

    try {
        const fetchPromises = SLOTS_TO_FETCH.map(slot =>
            fetch(`${BASE_URL}items-${slot}.json`)
                .then(res => {
                    if (!res.ok) {
                        console.warn(`Failed to fetch items for slot: ${slot} (${res.status})`);
                        return {};
                    }
                    return res.json();
                })
                .catch(err => {
                    console.error(`Error fetching items for slot: ${slot}`, err);
                    return {};
                })
        );

        const results = await Promise.all(fetchPromises);

        // Merge all results into a single object
        const mergedData: Record<string, any> = {};

        results.forEach(slotData => {
            Object.assign(mergedData, slotData);
        });

        // 1. Transform basic items
        const transformedItems = Object.values(mergedData).map(transformOsrsBoxItem);

        // 2. Append Custom Items (Patching)
        // We put custom items LAST so they might override if we deduplicated, 
        // but since IDs are unique, we just append.

        const allItems = [...transformedItems, ...CUSTOM_ITEMS];
        console.log(`[BiS] Loaded ${allItems.length} items (${CUSTOM_ITEMS.length} custom).`);

        cachedItems = allItems;
        return allItems;
    } catch (error) {
        console.error("BiS Data Fetch Error:", error);
        return [];
    }
};

const transformOsrsBoxItem = (raw: any): EquipableItem => {
    return {
        id: raw.id,
        name: raw.name,
        slot: raw.equipment?.slot || 'unknown',
        is2h: raw.equipment?.slot === '2h' || raw.is_two_handed,
        stats: raw.equipment || EMPTY_STATS,
        wiki_url: raw.wiki_url,
        members: raw.members,
        tradeable: raw.tradeable_on_ge,
        equipable_by_player: raw.equipable_by_player,
        requirements: raw.equipment?.requirements,
        icon: `https://static.runelite.net/cache/item/icon/${raw.id}.png`,
        attack_speed: raw.weapon?.attack_speed // Extract speed (ticks)
    };
};

const EMPTY_STATS: EquipmentStats = {
    attack_stab: 0, attack_slash: 0, attack_crush: 0, attack_magic: 0, attack_ranged: 0,
    defence_stab: 0, defence_slash: 0, defence_crush: 0, defence_magic: 0, defence_ranged: 0,
    melee_strength: 0, ranged_strength: 0, magic_damage: 0, prayer: 0
};

export const calculateBestInSlot = async (
    style: CombatStyle,
    budget: number,
    playerStats?: any,
    attackType: AttackType = AttackType.SLASH,
    focus: CombatFocus = CombatFocus.OFFENSE,
    isMembers: boolean = true,
    unlockedItems: number[] = []
): Promise<BisResult> => {
    // ... (fetching logic remains same, skipping for brevity in replacement if possible, but context is tight)
    // 1. Fetch Data
    const [equipableItems, pricesData] = await Promise.all([
        fetchEquipableItems(),
        fetchLatestPrices()
    ]);
    const prices = pricesData.data;

    // 2. Filter Candidates
    console.log(`[BiS] Fetched ${equipableItems.length} equipable items.`);
    const unlockedSet = new Set(unlockedItems);
    const candidates = equipableItems.filter(item => {
        if (!isMembers && item.members) return false;
        if (!item.tradeable && !unlockedSet.has(item.id)) return false;
        if (!item.equipable_by_player) return false;
        if (!prices[item.id] && !unlockedSet.has(item.id)) return false;
        if (playerStats && item.requirements) {
            for (const [skill, level] of Object.entries(item.requirements)) {
                if (playerStats[skill] && playerStats[skill].level < level) return false;
            }
        }
        return true;
    });

    candidates.forEach(i => {
        if (unlockedSet.has(i.id)) {
            i.wiki_price = 0;
        } else if (prices[i.id]) {
            // Only overwrite if we actually have a price from the API
            i.wiki_price = prices[i.id].high;
        }
        // else keep existing i.wiki_price (from customItems or cache)
    });

    // 3. Define Stat Weighting
    const getScore = (item: EquipableItem): number => {
        const s = item.stats;

        // Defence Focus
        if (focus === CombatFocus.DEFENCE) {
            let defenceScore = 0;
            switch (attackType) {
                case AttackType.STAB: defenceScore = s.defence_stab; break;
                case AttackType.SLASH: defenceScore = s.defence_slash; break;
                case AttackType.CRUSH: defenceScore = s.defence_crush; break;
                case AttackType.MAGIC: defenceScore = s.defence_magic; break;
                case AttackType.RANGED: defenceScore = s.defence_ranged; break;
            }
            switch (style) {
                case CombatStyle.MELEE: return (defenceScore * 4) + s.melee_strength;
                case CombatStyle.RANGED: return (defenceScore * 4) + s.ranged_strength;
                case CombatStyle.MAGIC: return (defenceScore * 4) + s.magic_damage;
                default: return defenceScore;
            }
        }

        // Offense Focus (Default)
        let rawScore = 0;
        switch (style) {
            case CombatStyle.MELEE:
                let attackBonus = 0;
                switch (attackType) {
                    case AttackType.STAB: attackBonus = s.attack_stab; break;
                    case AttackType.SLASH: attackBonus = s.attack_slash; break;
                    case AttackType.CRUSH: attackBonus = s.attack_crush; break;
                    default: attackBonus = (s.attack_stab + s.attack_slash + s.attack_crush) / 3;
                }
                rawScore = (s.melee_strength * 4) + attackBonus;
                break;
            case CombatStyle.RANGED:
                rawScore = (s.ranged_strength * 4) + s.attack_ranged;
                break;
            case CombatStyle.MAGIC:
                rawScore = (s.magic_damage * 20) + s.attack_magic;
                break;
            default:
                return 0;
        }

        // Apply Speed Scaling for Weapons (DPS heuristic)
        // Normalize to 4-tick speed.
        if (item.attack_speed && item.attack_speed > 0) {
            return rawScore * (4 / item.attack_speed);
        }

        return rawScore;
    };

    // 4. Initialize State
    const targetSlots = [
        SlotType.HEAD, SlotType.CAPE, SlotType.NECK, SlotType.AMMO,
        SlotType.WEAPON, SlotType.BODY, SlotType.SHIELD,
        SlotType.LEGS, SlotType.HANDS, SlotType.FEET, SlotType.RING
    ];

    let currentGear: Record<string, EquipableItem | null> = {};
    targetSlots.forEach(s => currentGear[s] = null);

    let currentCost = 0;
    let remainingBudget = budget;
    let changed = true;

    // Group candidates
    const itemsBySlot: Record<string, EquipableItem[]> = {};
    for (const item of candidates) {
        if (!item.slot) continue;
        const slotKey = item.slot;

        // Normalize 2h slot to weapon group for potential lookup
        if (slotKey === '2h') {
            if (!itemsBySlot['weapon']) itemsBySlot['weapon'] = [];
            itemsBySlot['weapon'].push(item);
        } else {
            if (!itemsBySlot[slotKey]) itemsBySlot[slotKey] = [];
            itemsBySlot[slotKey].push(item);
        }
    }

    // Main Loop
    while (changed) {
        changed = false;
        let bestUpgrade: { item: EquipableItem, costDiff: number, is2h: boolean } | null = null;
        let maxEfficiency = -1; // Stats gained per GP

        // Check normal slots
        for (const slot of targetSlots) {
            // Logic:
            // If checking WEAPON: look at all weapons (1h and 2h)
            // If checking SHIELD: look at shields. IF current weapon is 2h, we can't equip shield unless we downgrade weapon.
            //    (For MVP greedy: Skip shield upgrades if 2h weapon is currently equipped)

            if (slot === SlotType.SHIELD) {
                const currentWeapon = currentGear[SlotType.WEAPON];
                if (currentWeapon && currentWeapon.is2h) continue;
            }

            const potentialItems = itemsBySlot[slot] || [];
            if (slot === SlotType.WEAPON) {
                // itemsBySlot['weapon'] contains both 1h and 2h due to pre-processing
                // pass
            }

            const currentItem = currentGear[slot];
            const currentScore = currentItem ? getScore(currentItem) : 0;
            const currentItemPrice = currentItem ? (currentItem.wiki_price || 0) : 0;

            for (const cand of potentialItems) {
                const is2h = cand.is2h || cand.slot === '2h';
                let priceDiff = (cand.wiki_price || 0) - currentItemPrice;
                let scoreDiff = getScore(cand) - currentScore;

                // Interaction: 2H Weapon vs Shield
                if (slot === SlotType.WEAPON && is2h) {
                    const currentShield = currentGear[SlotType.SHIELD];
                    if (currentShield) {
                        // If we swap to 2h, we must unequip shield
                        // Refund shield cost
                        priceDiff -= (currentShield.wiki_price || 0);
                        // Lose shield stats
                        scoreDiff -= getScore(currentShield);
                    }
                }

                // Interaction: 1H Weapon vs 2H Weapon
                // If we are swapping FROM a 2H weapon TO a 1H weapon?
                // The loop handles picking a weapon. If we pick a 1h, we just unequip the 2h.
                // We gain the ability to use a shield, but the shield slot loop handles adding a shield later.
                // So no special penalty here.

                if (scoreDiff <= 0) continue; // Not an upgrade

                // Efficiency = Stats per GP.
                // If priceDiff <= 0 (it's cheaper/free), efficiency is infinite (MAX_VALUE)

                if (priceDiff > remainingBudget) continue; // Cannot afford

                const efficiency = priceDiff <= 0 ? Number.MAX_VALUE : scoreDiff / priceDiff;

                if (efficiency > maxEfficiency) {
                    maxEfficiency = efficiency;
                    bestUpgrade = { item: cand, costDiff: priceDiff, is2h };
                }
            }
        }

        if (bestUpgrade) {
            const newItem = bestUpgrade.item;
            const targetSlot = (newItem.slot === '2h') ? SlotType.WEAPON : newItem.slot as SlotType;

            // Apply
            currentGear[targetSlot] = newItem;
            remainingBudget -= bestUpgrade.costDiff;
            currentCost += bestUpgrade.costDiff;

            // Side effects
            if (bestUpgrade.is2h) {
                // Force unequip shield if any
                if (currentGear[SlotType.SHIELD]) {
                    // We already accounted for cost refund in costDiff!
                    // Just null it out
                    currentGear[SlotType.SHIELD] = null;
                }
            }

            changed = true;
        }
    }

    // 5. Compute Totals using shared helper
    return calculateSetStats(currentGear, style, attackType, playerStats, remainingBudget);
};

/**
 * Calculates total stats, cost, and max hit for a specific set of gear.
 * Useful for manual swaps or re-calculating after changes.
 */
export const calculateSetStats = (
    items: Record<string, EquipableItem | null>,
    style: CombatStyle,
    attackType: AttackType,
    playerStats?: any,
    remainingBudget: number = 0
): BisResult => {
    let currentCost = 0;
    const totalStats: EquipmentStats = { ...EMPTY_STATS };

    Object.values(items).forEach(item => {
        if (!item) return;

        // Sum stats
        (Object.keys(EMPTY_STATS) as Array<keyof EquipmentStats>).forEach(key => {
            totalStats[key] += (item.stats[key] || 0);
        });

        // Sum cost (only if it has a price and isn't "owned"/free)
        // Note: In the main logic, we set wiki_price to 0 for owned items.
        // If this is called from UI with fresh items, we might need to handle logic there.
        // For now, assume item.wiki_price is correct.
        currentCost += (item.wiki_price || 0);
    });

    const maxHit = calculateMaxHit(totalStats, style, attackType, playerStats);

    return {
        items,
        totalStats,
        totalCost: currentCost,
        remainingBudget,
        maxHit
    };
};

/**
 * Searches the loaded item cache for items matching the slot and query.
 */
/**
 * Searches the loaded item cache for items matching the slot and query.
 */
export const searchItems = async (slot: string, query: string): Promise<EquipableItem[]> => {
    // Ensure items are loaded
    const [allItems, pricesData] = await Promise.all([
        fetchEquipableItems(),
        fetchLatestPrices()
    ]);

    const prices = pricesData.data;
    const lowerQuery = query.toLowerCase();

    return allItems.filter(item => {
        // Name match first for speed
        if (!item.name.toLowerCase().includes(lowerQuery)) return false;

        // Slot match
        if (slot === 'all') return true;

        if (item.slot === slot) return true;

        // Weapon/2h handling
        if (slot === SlotType.WEAPON && (item.slot === '2h' || item.is2h)) return true;
        if (slot === '2h' && item.slot === SlotType.WEAPON) return false;

        return false;
    }).map(item => {
        const itemWithPrice = { ...item };
        if (prices[item.id]) {
            itemWithPrice.wiki_price = prices[item.id].high;
        }
        return itemWithPrice;
    }).slice(0, 50);
};
