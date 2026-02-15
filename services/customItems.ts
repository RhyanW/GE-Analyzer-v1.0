import { EquipableItem, SlotType, EquipmentStats } from '../types';

// Helper to create empty stats
const createStats = (overrides: Partial<EquipmentStats>): EquipmentStats => ({
    attack_stab: 0,
    attack_slash: 0,
    attack_crush: 0,
    attack_magic: 0,
    attack_ranged: 0,
    defence_stab: 0,
    defence_slash: 0,
    defence_crush: 0,
    defence_magic: 0,
    defence_ranged: 0,
    melee_strength: 0,
    ranged_strength: 0,
    magic_damage: 0,
    prayer: 0,
    ...overrides
});

export const CUSTOM_ITEMS: EquipableItem[] = [
    // --- RINGS (DT2) ---
    {
        id: 28286, // Real ID
        name: "Bellator ring",
        wiki_url: "https://oldschool.runescape.wiki/w/Bellator_ring",
        slot: SlotType.RING,
        stats: createStats({
            attack_slash: 20,
            melee_strength: 6
        }),
        wiki_price: 45000000,
        icon: "https://oldschool.runescape.wiki/images/Bellator_ring.png",
        members: true,
        tradeable: true,
        equipable_by_player: true
    },
    {
        id: 28289, // Ultor vestige -> Ultor ring
        name: "Ultor ring",
        wiki_url: "https://oldschool.runescape.wiki/w/Ultor_ring",
        slot: SlotType.RING,
        stats: createStats({
            melee_strength: 12
        }),
        wiki_price: 180000000,
        icon: "https://oldschool.runescape.wiki/images/Ultor_ring.png",
        members: true,
        tradeable: true,
        equipable_by_player: true
    },
    {
        id: 28292,
        name: "Magus ring",
        wiki_url: "https://oldschool.runescape.wiki/w/Magus_ring",
        slot: SlotType.RING,
        stats: createStats({
            attack_magic: 15,
            magic_damage: 2
        }),
        wiki_price: 40000000,
        icon: "https://oldschool.runescape.wiki/images/Magus_ring.png",
        members: true,
        tradeable: true,
        equipable_by_player: true
    },
    {
        id: 28295,
        name: "Venator ring",
        wiki_url: "https://oldschool.runescape.wiki/w/Venator_ring",
        slot: SlotType.RING,
        stats: createStats({
            attack_ranged: 10,
            ranged_strength: 2
        }),
        wiki_price: 35000000,
        icon: "https://oldschool.runescape.wiki/images/Venator_ring.png",
        members: true,
        tradeable: true,
        equipable_by_player: true
    },

    // --- TORVA ---
    {
        id: 26382,
        name: "Torva full helm",
        wiki_url: "https://oldschool.runescape.wiki/w/Torva_full_helm",
        slot: SlotType.HEAD,
        stats: createStats({
            attack_stab: -5, attack_slash: -5, attack_crush: -5, attack_magic: -5, attack_ranged: -5,
            defence_stab: 59, defence_slash: 60, defence_crush: 62, defence_magic: -5, defence_ranged: 57,
            melee_strength: 8, prayer: 1
        }),
        wiki_price: 350000000,
        icon: "https://oldschool.runescape.wiki/images/Torva_full_helm.png",
        members: true,
        tradeable: true,
        equipable_by_player: true
    },
    {
        id: 26384,
        name: "Torva platebody",
        wiki_url: "https://oldschool.runescape.wiki/w/Torva_platebody",
        slot: SlotType.BODY,
        stats: createStats({
            attack_stab: -18, attack_slash: -18, attack_crush: -18, attack_magic: -30, attack_ranged: -14,
            defence_stab: 117, defence_slash: 111, defence_crush: 117, defence_magic: -18, defence_ranged: 142,
            melee_strength: 6, prayer: 1
        }),
        wiki_price: 900000000,
        icon: "https://oldschool.runescape.wiki/images/Torva_platebody.png",
        members: true,
        tradeable: true,
        equipable_by_player: true
    },
    {
        id: 26386,
        name: "Torva platelegs",
        wiki_url: "https://oldschool.runescape.wiki/w/Torva_platelegs",
        slot: SlotType.LEGS,
        stats: createStats({
            attack_stab: -24, attack_slash: -24, attack_crush: -24, attack_magic: -31, attack_ranged: -11,
            defence_stab: 102, defence_slash: 102, defence_crush: 102, defence_magic: -21, defence_ranged: 102,
            melee_strength: 4, prayer: 1
        }),
        wiki_price: 800000000,
        icon: "https://oldschool.runescape.wiki/images/Torva_platelegs.png",
        members: true,
        tradeable: true,
        equipable_by_player: true
    },

    // --- MASORI (f) ---
    {
        id: 27246,
        name: "Masori mask (f)",
        wiki_url: "https://oldschool.runescape.wiki/w/Masori_mask_(f)",
        slot: SlotType.HEAD,
        stats: createStats({
            attack_ranged: 12,
            defence_stab: 14, defence_slash: 12, defence_crush: 10, defence_magic: 10, defence_ranged: 10,
            ranged_strength: 2, prayer: 1
        }),
        wiki_price: 25000000,
        icon: "https://oldschool.runescape.wiki/images/Masori_mask_%28f%29.png",
        members: true,
        tradeable: true,
        equipable_by_player: true
    },
    {
        id: 27249,
        name: "Masori body (f)",
        wiki_url: "https://oldschool.runescape.wiki/w/Masori_body_(f)",
        slot: SlotType.BODY,
        stats: createStats({
            attack_ranged: 43,
            defence_stab: 70, defence_slash: 63, defence_crush: 74, defence_magic: 100, defence_ranged: 63,
            ranged_strength: 4, prayer: 1
        }),
        wiki_price: 180000000,
        icon: "https://oldschool.runescape.wiki/images/Masori_body_%28f%29.png",
        members: true,
        tradeable: true,
        equipable_by_player: true
    },
    {
        id: 27252,
        name: "Masori chaps (f)",
        wiki_url: "https://oldschool.runescape.wiki/w/Masori_chaps_(f)",
        slot: SlotType.LEGS,
        stats: createStats({
            attack_ranged: 27,
            defence_stab: 42, defence_slash: 37, defence_crush: 46, defence_magic: 50, defence_ranged: 40,
            ranged_strength: 2, prayer: 1
        }),
        wiki_price: 150000000,
        icon: "https://oldschool.runescape.wiki/images/Masori_chaps_%28f%29.png",
        members: true,
        tradeable: true,
        equipable_by_player: true
    },

    // --- WEAPONS ---
    {
        id: 26219,
        name: "Osmumten's fang",
        wiki_url: "https://oldschool.runescape.wiki/w/Osmumten%27s_fang",
        slot: SlotType.WEAPON,
        stats: createStats({
            attack_stab: 105, attack_slash: 75,
            melee_strength: 103,
            defence_stab: 0
        }),
        wiki_price: 25000000,
        icon: "https://oldschool.runescape.wiki/images/Osmumten%27s_fang.png",
        members: true,
        tradeable: true,
        equipable_by_player: true,
        attack_speed: 5,
        // Using "2h" logic or "1h"? Fang is 1h.
    },
    {
        id: 27690,
        name: "Voidwaker",
        wiki_url: "https://oldschool.runescape.wiki/w/Voidwaker",
        slot: SlotType.WEAPON,
        stats: createStats({
            attack_slash: 80, attack_stab: 80,
            melee_strength: 80,
            magic_damage: 0,
            prayer: 2
        }),
        wiki_price: 90000000,
        icon: "https://oldschool.runescape.wiki/images/Voidwaker.png",
        members: true,
        tradeable: true,
        equipable_by_player: true,
        attack_speed: 4
    },
    {
        id: 31248,
        name: "Belle's folly",
        wiki_url: "https://oldschool.runescape.wiki/w/Belle%27s_folly",
        slot: SlotType.WEAPON,
        stats: createStats({
            attack_stab: 100, attack_slash: 78,
            melee_strength: 102,
            defence_stab: 20, defence_slash: 15, defence_crush: -9
        }),
        wiki_price: 3500000,
        icon: "https://oldschool.runescape.wiki/images/Belle%27s_folly.png",
        members: true,
        tradeable: true,
        equipable_by_player: true,
        attack_speed: 5
    }
];
