import { PlayerStats } from '../types';

export interface SkillAction {
    name: string;
    xp: number;
}

export type UnlockCategory = 'Item' | 'Quest' | 'Ability' | 'Other';

export interface SkillUnlock {
    level: number;
    description: string;
    category: UnlockCategory;
}

export interface ItemRequirement {
    id: number;
    qty: number;
    type: 'input' | 'output';
}

export interface SkillPreset {
    name: string;
    xpRate: number;
    xpPerAction?: number;
    requirements?: ItemRequirement[];
}

export interface WeaponData {
    name: string;
    speed: number;
    category: 'Melee' | 'Ranged' | 'Magic';
}

export const SKILL_ACTIONS: Partial<Record<keyof PlayerStats, SkillAction>> = {
    attack: { name: 'Damage Dealt (4 XP/dmg)', xp: 4 },
    strength: { name: 'Damage Dealt (4 XP/dmg)', xp: 4 },
    defence: { name: 'Damage Dealt (4 XP/dmg)', xp: 4 },
    hitpoints: { name: 'Damage Dealt (1.33 XP/dmg)', xp: 1.33 },
    ranged: { name: 'Damage Dealt (4 XP/dmg)', xp: 4 },
    prayer: { name: 'Dragon Bones', xp: 72 },
    magic: { name: 'High Level Alchemy', xp: 65 },
    cooking: { name: 'Sharks', xp: 210 },
    woodcutting: { name: 'Teak Logs', xp: 85 },
    fletching: { name: 'Magic Longbows', xp: 91.5 },
    fishing: { name: 'Barbarian Fishing', xp: 110 },
    firemaking: { name: 'Magic Logs', xp: 303.8 },
    crafting: { name: 'Green D\'hide Bodies', xp: 186 },
    smithing: { name: 'Gold Bars (Blast Furnace)', xp: 56.2 },
    mining: { name: 'Iron Ore', xp: 35 },
    herblore: { name: 'Prayer Potions', xp: 87.5 },
    agility: { name: 'Ardougne Rooftop Laps', xp: 793 },
    thieving: { name: 'Ardougne Knights', xp: 84.3 },
    slayer: { name: 'Monster HP (1 XP/HP)', xp: 1 },
    farming: { name: 'Magic Trees', xp: 13768 },
    runecraft: { name: 'Soul Runes', xp: 220 },
    hunter: { name: 'Red Chinchompas', xp: 265 },
    construction: { name: 'Oak Larders', xp: 480 },
    sailing: { name: 'Knots Tied', xp: 50 } // Mock
};

export const SKILL_UNLOCKS: Partial<Record<keyof PlayerStats, SkillUnlock[]>> = {
    attack: [
        { level: 1, description: 'Iron Weapons', category: 'Item' },
        { level: 5, description: 'Steel Weapons', category: 'Item' },
        { level: 10, description: 'Black Weapons', category: 'Item' },
        { level: 20, description: 'Mithril Weapons', category: 'Item' },
        { level: 30, description: 'Adamant Weapons', category: 'Item' },
        { level: 40, description: 'Rune Weapons', category: 'Item' },
        { level: 50, description: 'Granite Weapons', category: 'Item' },
        { level: 60, description: 'Dragon Weapons', category: 'Item' },
        { level: 65, description: 'Leaf-bladed Weapons', category: 'Item' },
        { level: 70, description: 'Abyssal Whip', category: 'Item' },
        { level: 70, description: 'Abyssal Dagger', category: 'Item' },
        { level: 70, description: 'Saradomin Sword', category: 'Item' },
        { level: 75, description: 'Godswords', category: 'Item' },
        { level: 75, description: 'Staff of the Dead', category: 'Item' },
        { level: 75, description: 'Arclight', category: 'Item' },
        { level: 80, description: 'Ghrazi Rapier', category: 'Item' },
        { level: 80, description: 'Scythe of Vitur', category: 'Item' },
        { level: 80, description: 'Blade of Saeldor', category: 'Item' },
        { level: 80, description: 'Inquisitor\'s Mace', category: 'Item' },
        { level: 82, description: 'Osmumten\'s Fang', category: 'Item' }
    ],
    defence: [
        { level: 1, description: 'Iron Armour', category: 'Item' },
        { level: 5, description: 'Steel Armour', category: 'Item' },
        { level: 10, description: 'Black Armour', category: 'Item' },
        { level: 20, description: 'Mithril Armour', category: 'Item' },
        { level: 30, description: 'Adamant Armour', category: 'Item' },
        { level: 40, description: 'Rune Armour', category: 'Item' },
        { level: 40, description: 'Dragonhide Body (Green)', category: 'Item' },
        { level: 45, description: 'Berserker Helm', category: 'Item' },
        { level: 50, description: 'Granite Armour', category: 'Item' },
        { level: 60, description: 'Dragon Armour', category: 'Item' },
        { level: 65, description: 'Bandos Armour', category: 'Item' },
        { level: 70, description: 'Barrows Equipment', category: 'Item' },
        { level: 70, description: 'Armadyl Armour', category: 'Item' },
        { level: 70, description: 'Crystal Armour', category: 'Item' },
        { level: 75, description: 'Primordial Boots', category: 'Item' },
        { level: 75, description: 'Pegasian Boots', category: 'Item' },
        { level: 75, description: 'Eternal Boots', category: 'Item' },
        { level: 75, description: 'Ancestral Robes', category: 'Item' },
        { level: 75, description: 'Justiciar Armour', category: 'Item' },
        { level: 75, description: 'Dinh\'s Bulwark', category: 'Item' },
        { level: 75, description: 'Elysian Spirit Shield', category: 'Item' },
        { level: 80, description: 'Torva Armour', category: 'Item' },
        { level: 80, description: 'Masori Armour', category: 'Item' }
    ],
    strength: [
        { level: 50, description: 'Granite Maul', category: 'Item' },
        { level: 60, description: 'Dragon Scimitar', category: 'Item' },
        { level: 60, description: 'Dragon Warhammer', category: 'Item' },
        { level: 60, description: 'Toktz-xil-ak', category: 'Item' },
        { level: 60, description: 'Tzhaar-ket-om', category: 'Item' },
        { level: 65, description: 'Dragon Defender', category: 'Item' },
        { level: 70, description: 'Abyssal Bludgeon', category: 'Item' },
        { level: 75, description: 'Elder Maul', category: 'Item' },
        { level: 80, description: 'Godsword Special Attacks', category: 'Ability' }
    ],
    ranged: [
        { level: 1, description: 'Shortbow/Longbow', category: 'Item' },
        { level: 5, description: 'Oak Shortbow/Longbow', category: 'Item' },
        { level: 20, description: 'Willow Shortbow/Longbow', category: 'Item' },
        { level: 20, description: 'Mithril Crossbow', category: 'Item' },
        { level: 30, description: 'Maple Shortbow/Longbow', category: 'Item' },
        { level: 30, description: 'Adamant Crossbow', category: 'Item' },
        { level: 40, description: 'Yew Shortbow/Longbow', category: 'Item' },
        { level: 40, description: 'Rune Crossbow', category: 'Item' },
        { level: 40, description: 'God D\'hide', category: 'Item' },
        { level: 50, description: 'Magic Shortbow', category: 'Item' },
        { level: 50, description: 'Magic Longbow', category: 'Item' },
        { level: 50, description: 'Hunter\'s Sunlight Crossbow', category: 'Item' },
        { level: 60, description: 'Dragon Crossbow', category: 'Item' },
        { level: 60, description: 'Dark Bow', category: 'Item' },
        { level: 61, description: 'Rune Crossbow', category: 'Item' },
        { level: 65, description: 'Heavy Ballista', category: 'Item' },
        { level: 70, description: 'Armadyl Crossbow', category: 'Item' },
        { level: 70, description: 'Karil\'s Crossbow', category: 'Item' },
        { level: 70, description: 'Crystal Bow', category: 'Item' },
        { level: 75, description: 'Toxic Blowpipe', category: 'Item' },
        { level: 75, description: 'Twisted Bow', category: 'Item' },
        { level: 80, description: 'Masori Armour', category: 'Item' },
        { level: 80, description: 'Zaryte Crossbow', category: 'Item' },
        { level: 80, description: 'Venator Bow', category: 'Item' },
        { level: 80, description: 'Bow of Faerdhinen', category: 'Item' }
    ],
    prayer: [
        { level: 1, description: 'Thick Skin', category: 'Ability' },
        { level: 4, description: 'Burst of Strength', category: 'Ability' },
        { level: 7, description: 'Clarity of Thought', category: 'Ability' },
        { level: 8, description: 'Sharp Eye', category: 'Ability' },
        { level: 9, description: 'Mystic Will', category: 'Ability' },
        { level: 10, description: 'Rock Skin', category: 'Ability' },
        { level: 13, description: 'Superhuman Strength', category: 'Ability' },
        { level: 16, description: 'Improved Reflexes', category: 'Ability' },
        { level: 19, description: 'Rapid Restore', category: 'Ability' },
        { level: 22, description: 'Rapid Heal', category: 'Ability' },
        { level: 25, description: 'Protect Item', category: 'Ability' },
        { level: 37, description: 'Protect from Magic', category: 'Ability' },
        { level: 40, description: 'Protect from Missiles', category: 'Ability' },
        { level: 43, description: 'Protect from Melee', category: 'Ability' },
        { level: 52, description: 'Smite', category: 'Ability' },
        { level: 60, description: 'Chivalry', category: 'Ability' },
        { level: 70, description: 'Piety', category: 'Ability' },
        { level: 74, description: 'Rigour', category: 'Ability' },
        { level: 77, description: 'Augury', category: 'Ability' }
    ],
    magic: [
        { level: 1, description: 'Wind Strike', category: 'Ability' },
        { level: 13, description: 'Fire Strike', category: 'Ability' },
        { level: 17, description: 'Wind Bolt', category: 'Ability' },
        { level: 25, description: 'Varrock Teleport', category: 'Ability' },
        { level: 30, description: 'Mystic Staves', category: 'Item' },
        { level: 35, description: 'Fire Bolt', category: 'Ability' },
        { level: 40, description: 'Mystic Robes', category: 'Item' },
        { level: 41, description: 'Wind Blast', category: 'Ability' },
        { level: 50, description: 'Iban\'s Staff', category: 'Item' },
        { level: 50, description: 'Smoke Rush', category: 'Ability' },
        { level: 55, description: 'High Level Alchemy', category: 'Ability' },
        { level: 59, description: 'Fire Blast', category: 'Ability' },
        { level: 60, description: 'God Capes', category: 'Item' },
        { level: 62, description: 'Wind Wave', category: 'Ability' },
        { level: 70, description: 'Ahrim\'s Robes', category: 'Item' },
        { level: 70, description: 'Ice Burst', category: 'Ability' },
        { level: 75, description: 'Trident of the Seas', category: 'Item' },
        { level: 75, description: 'Staff of the Dead', category: 'Item' },
        { level: 75, description: 'Fire Wave', category: 'Ability' },
        { level: 75, description: 'Kodai Wand', category: 'Item' },
        { level: 80, description: 'Charge', category: 'Ability' },
        { level: 81, description: 'Wind Surge', category: 'Ability' },
        { level: 82, description: 'Ice Blitz', category: 'Ability' },
        { level: 85, description: 'Tele Block', category: 'Ability' },
        { level: 87, description: 'Trident of the Swamp', category: 'Item' },
        { level: 94, description: 'Ice Barrage', category: 'Ability' },
        { level: 95, description: 'Fire Surge', category: 'Ability' }
    ],
    cooking: [
        { level: 1, description: 'Shrimps', category: 'Item' },
        { level: 15, description: 'Trout', category: 'Item' },
        { level: 25, description: 'Salmon', category: 'Item' },
        { level: 30, description: 'Tuna', category: 'Item' },
        { level: 40, description: 'Lobster', category: 'Item' },
        { level: 50, description: 'Swordfish', category: 'Item' },
        { level: 62, description: 'Monkfish', category: 'Item' },
        { level: 76, description: 'Sharks', category: 'Item' },
        { level: 80, description: 'Sea Turtle', category: 'Item' },
        { level: 84, description: 'Anglerfish', category: 'Item' },
        { level: 90, description: 'Dark Crabs', category: 'Item' }
    ],
    woodcutting: [
        { level: 1, description: 'Iron Axe', category: 'Item' },
        { level: 6, description: 'Steel Axe', category: 'Item' },
        { level: 15, description: 'Oak Trees', category: 'Other' },
        { level: 21, description: 'Mithril Axe', category: 'Item' },
        { level: 30, description: 'Willow Trees', category: 'Other' },
        { level: 31, description: 'Adamant Axe', category: 'Item' },
        { level: 41, description: 'Rune Axe', category: 'Item' },
        { level: 45, description: 'Maple Trees', category: 'Other' },
        { level: 60, description: 'Yew Trees', category: 'Other' },
        { level: 61, description: 'Dragon Axe', category: 'Item' },
        { level: 75, description: 'Magic Trees', category: 'Other' },
        { level: 90, description: 'Redwood Trees', category: 'Other' }
    ],
    fishing: [
        { level: 1, description: 'Shrimps', category: 'Item' },
        { level: 20, description: 'Trout', category: 'Item' },
        { level: 30, description: 'Salmon', category: 'Item' },
        { level: 35, description: 'Tuna', category: 'Item' },
        { level: 40, description: 'Lobster', category: 'Item' },
        { level: 50, description: 'Swordfish', category: 'Item' },
        { level: 62, description: 'Monkfish', category: 'Item' },
        { level: 76, description: 'Sharks', category: 'Item' },
        { level: 82, description: 'Anglerfish', category: 'Item' },
        { level: 85, description: 'Dark Crabs', category: 'Item' }
    ],
    mining: [
        { level: 1, description: 'Iron Pickaxe', category: 'Item' },
        { level: 6, description: 'Steel Pickaxe', category: 'Item' },
        { level: 15, description: 'Iron Ore', category: 'Item' },
        { level: 21, description: 'Mithril Pickaxe', category: 'Item' },
        { level: 30, description: 'Coal', category: 'Item' },
        { level: 31, description: 'Adamant Pickaxe', category: 'Item' },
        { level: 40, description: 'Gold Ore', category: 'Item' },
        { level: 41, description: 'Rune Pickaxe', category: 'Item' },
        { level: 55, description: 'Mithril Ore', category: 'Item' },
        { level: 61, description: 'Dragon Pickaxe', category: 'Item' },
        { level: 70, description: 'Adamantite Ore', category: 'Item' },
        { level: 85, description: 'Runite Ore', category: 'Item' },
        { level: 92, description: 'Amethyst', category: 'Item' }
    ],
    smithing: [
        { level: 1, description: 'Bronze Items', category: 'Item' },
        { level: 15, description: 'Iron Items', category: 'Item' },
        { level: 30, description: 'Steel Items', category: 'Item' },
        { level: 40, description: 'Gold Items', category: 'Item' },
        { level: 50, description: 'Mithril Items', category: 'Item' },
        { level: 60, description: 'Adamant Items', category: 'Item' },
        { level: 70, description: 'Rune Items', category: 'Item' },
        { level: 70, description: 'Crystal Equipment', category: 'Item' },
        { level: 75, description: 'Dragonfire Shield', category: 'Item' },
        { level: 85, description: 'Rune Items (Full Set)', category: 'Item' },
        { level: 90, description: 'Torva Armour', category: 'Item' },
        { level: 99, description: 'Smithing Cape', category: 'Item' }
    ],
    herblore: [
        { level: 3, description: 'Attack Potion', category: 'Item' },
        { level: 26, description: 'Energy Potion', category: 'Item' },
        { level: 38, description: 'Prayer Potion', category: 'Item' },
        { level: 45, description: 'Super Attack', category: 'Item' },
        { level: 55, description: 'Super Strength', category: 'Item' },
        { level: 63, description: 'Super Restore', category: 'Item' },
        { level: 66, description: 'Super Defence', category: 'Item' },
        { level: 72, description: 'Ranging Potion', category: 'Item' },
        { level: 81, description: 'Sara Brew', category: 'Item' },
        { level: 90, description: 'Super Combat', category: 'Item' }
    ],
    agility: [
        { level: 10, description: 'Draynor Rooftop', category: 'Other' },
        { level: 20, description: 'Al Kharid Rooftop', category: 'Other' },
        { level: 30, description: 'Varrock Rooftop', category: 'Other' },
        { level: 40, description: 'Canifis Rooftop', category: 'Other' },
        { level: 50, description: 'Falador Rooftop', category: 'Other' },
        { level: 60, description: 'Seers\' Village Rooftop', category: 'Other' },
        { level: 70, description: 'Pollnivneach Rooftop', category: 'Other' },
        { level: 80, description: 'Rellekka Rooftop', category: 'Other' },
        { level: 90, description: 'Ardougne Rooftop', category: 'Other' }
    ],
    thieving: [
        { level: 5, description: 'Cake Stall', category: 'Other' },
        { level: 25, description: 'Fruit Stall', category: 'Other' },
        { level: 38, description: 'Master Farmer', category: 'Other' },
        { level: 55, description: 'Ardougne Knights', category: 'Other' },
        { level: 70, description: 'Paladins', category: 'Other' },
        { level: 80, description: 'Heroes', category: 'Other' },
        { level: 85, description: 'Elves', category: 'Other' }
    ],
    slayer: [
        { level: 15, description: 'Banshees', category: 'Other' },
        { level: 40, description: 'Basilisks', category: 'Other' },
        { level: 55, description: 'Broad Bolts', category: 'Item' },
        { level: 58, description: 'Cave Horrors (Black Mask)', category: 'Other' },
        { level: 60, description: 'Aberrant Spectres', category: 'Other' },
        { level: 65, description: 'Dust Devils', category: 'Other' },
        { level: 70, description: 'Kurasks', category: 'Other' },
        { level: 72, description: 'Skeletal Wyverns', category: 'Other' },
        { level: 75, description: 'Gargoyles', category: 'Other' },
        { level: 80, description: 'Nechryaels', category: 'Other' },
        { level: 85, description: 'Abyssal Demons (Whip)', category: 'Other' },
        { level: 87, description: 'Kraken', category: 'Other' },
        { level: 91, description: 'Cerberus', category: 'Other' },
        { level: 93, description: 'Thermonuclear Smoke Devil', category: 'Other' },
        { level: 95, description: 'Hydra', category: 'Other' }
    ],
    farming: [
        { level: 15, description: 'Oak Trees', category: 'Other' },
        { level: 30, description: 'Willow Trees', category: 'Other' },
        { level: 32, description: 'Ranarr Weed', category: 'Other' },
        { level: 38, description: 'Toadflax', category: 'Other' },
        { level: 45, description: 'Maple Trees', category: 'Other' },
        { level: 60, description: 'Yew Trees', category: 'Other' },
        { level: 62, description: 'Snapdragon', category: 'Other' },
        { level: 75, description: 'Magic Trees', category: 'Other' },
        { level: 85, description: 'Torstol', category: 'Other' }
    ],
    runecraft: [
        { level: 1, description: 'Air Runes', category: 'Item' },
        { level: 5, description: 'Water Runes', category: 'Item' },
        { level: 9, description: 'Earth Runes', category: 'Item' },
        { level: 14, description: 'Fire Runes', category: 'Item' },
        { level: 27, description: 'Cosmic Runes', category: 'Item' },
        { level: 44, description: 'Nature Runes', category: 'Item' },
        { level: 54, description: 'Law Runes', category: 'Item' },
        { level: 65, description: 'Death Runes', category: 'Item' },
        { level: 77, description: 'Blood Runes', category: 'Item' },
        { level: 90, description: 'Soul Runes', category: 'Item' },
        { level: 95, description: 'Wrath Runes', category: 'Item' }
    ],
    hunter: [
        { level: 1, description: 'Polar Kebbit', category: 'Other' },
        { level: 9, description: 'Copper Longtail', category: 'Other' },
        { level: 29, description: 'Swamp Lizard', category: 'Other' },
        { level: 43, description: 'Spotted Kebbit', category: 'Other' },
        { level: 53, description: 'Chinchompas', category: 'Other' },
        { level: 63, description: 'Red Chinchompas', category: 'Other' },
        { level: 73, description: 'Black Chinchompas', category: 'Other' },
        { level: 80, description: 'Herbiboar', category: 'Other' }
    ],
    construction: [
        { level: 1, description: 'Parlour', category: 'Other' },
        { level: 10, description: 'Kitchen', category: 'Other' },
        { level: 20, description: 'Bedroom', category: 'Other' },
        { level: 30, description: 'Combat Room', category: 'Other' },
        { level: 40, description: 'Study', category: 'Other' },
        { level: 50, description: 'Portal Chamber', category: 'Other' },
        { level: 65, description: 'Superior Garden', category: 'Other' },
        { level: 80, description: 'Achievement Gallery', category: 'Other' },
        { level: 90, description: 'Spirit Tree/Fairy Ring', category: 'Other' }
    ]
};

export const SKILL_PRESETS: Partial<Record<keyof PlayerStats, SkillPreset[]>> = {
    attack: [
        { name: 'Sand Crabs (AFK)', xpRate: 40000, xpPerAction: 240 }, // 60 HP * 4
        { name: 'Ammonite Crabs', xpRate: 50000, xpPerAction: 400 }, // 100 HP * 4
        { name: 'Gemstone Crabs', xpRate: 55000, xpPerAction: 480 }, // 120 HP * 4
        { name: 'Nightmare Zone (Mid)', xpRate: 75000, xpPerAction: 240 }, // Avg
        { name: 'Nightmare Zone (High)', xpRate: 110000, xpPerAction: 300 }, // Avg
        { name: 'Sulphur Naguas', xpRate: 120000, xpPerAction: 400 },
        { name: 'Scurrius', xpRate: 90000, xpPerAction: 2000 },
        { name: 'Araxxor', xpRate: 60000, xpPerAction: 2400 },
        { name: 'Vorkath', xpRate: 45000, xpPerAction: 3000 },
        { name: 'Abyssal Demons', xpRate: 35000, xpPerAction: 600 },
        { name: 'Black Demons', xpRate: 30000, xpPerAction: 680 },
        { name: 'Bloodveld', xpRate: 35000, xpPerAction: 480 },
        { name: 'Dagannoths', xpRate: 40000, xpPerAction: 280 },
        { name: 'Fire Giants', xpRate: 35000, xpPerAction: 440 },
        { name: 'Gargoyles', xpRate: 30000, xpPerAction: 420 },
        { name: 'Greater Demons', xpRate: 30000, xpPerAction: 348 },
        { name: 'Hellhounds', xpRate: 35000, xpPerAction: 464 },
        { name: 'Kalphites', xpRate: 40000, xpPerAction: 360 },
        { name: 'Nechryael', xpRate: 30000, xpPerAction: 420 }
    ],
    strength: [
        { name: 'Sand Crabs (AFK)', xpRate: 45000, xpPerAction: 240 },
        { name: 'Ammonite Crabs', xpRate: 55000, xpPerAction: 400 },
        { name: 'Gemstone Crabs', xpRate: 60000, xpPerAction: 480 },
        { name: 'Nightmare Zone (Mid)', xpRate: 80000, xpPerAction: 240 },
        { name: 'Nightmare Zone (High)', xpRate: 120000, xpPerAction: 300 },
        { name: 'Sulphur Naguas', xpRate: 130000, xpPerAction: 400 },
        { name: 'Scurrius', xpRate: 100000, xpPerAction: 2000 },
        { name: 'Araxxor', xpRate: 65000, xpPerAction: 2400 },
        { name: 'Vorkath', xpRate: 50000, xpPerAction: 3000 },
        { name: 'Abyssal Demons', xpRate: 40000, xpPerAction: 600 },
        { name: 'Black Demons', xpRate: 35000, xpPerAction: 680 },
        { name: 'Bloodveld', xpRate: 40000, xpPerAction: 480 },
        { name: 'Dagannoths', xpRate: 45000, xpPerAction: 280 },
        { name: 'Fire Giants', xpRate: 40000, xpPerAction: 440 },
        { name: 'Gargoyles', xpRate: 35000, xpPerAction: 420 },
        { name: 'Greater Demons', xpRate: 35000, xpPerAction: 348 },
        { name: 'Hellhounds', xpRate: 40000, xpPerAction: 464 },
        { name: 'Kalphites', xpRate: 45000, xpPerAction: 360 },
        { name: 'Nechryael', xpRate: 35000, xpPerAction: 420 }
    ],
    defence: [
        { name: 'Sand Crabs (AFK)', xpRate: 40000, xpPerAction: 240 },
        { name: 'Ammonite Crabs', xpRate: 50000, xpPerAction: 400 },
        { name: 'Gemstone Crabs', xpRate: 55000, xpPerAction: 480 },
        { name: 'Nightmare Zone (Mid)', xpRate: 75000, xpPerAction: 240 },
        { name: 'Nightmare Zone (High)', xpRate: 110000, xpPerAction: 300 },
        { name: 'Sulphur Naguas', xpRate: 120000, xpPerAction: 400 },
        { name: 'Scurrius', xpRate: 90000, xpPerAction: 2000 },
        { name: 'Araxxor', xpRate: 60000, xpPerAction: 2400 },
        { name: 'Vorkath', xpRate: 45000, xpPerAction: 3000 },
        { name: 'Abyssal Demons', xpRate: 35000, xpPerAction: 600 },
        { name: 'Black Demons', xpRate: 30000, xpPerAction: 680 },
        { name: 'Bloodveld', xpRate: 35000, xpPerAction: 480 },
        { name: 'Dagannoths', xpRate: 40000, xpPerAction: 280 },
        { name: 'Fire Giants', xpRate: 35000, xpPerAction: 440 },
        { name: 'Gargoyles', xpRate: 30000, xpPerAction: 420 },
        { name: 'Greater Demons', xpRate: 30000, xpPerAction: 348 },
        { name: 'Hellhounds', xpRate: 35000, xpPerAction: 464 },
        { name: 'Kalphites', xpRate: 40000, xpPerAction: 360 },
        { name: 'Nechryael', xpRate: 30000, xpPerAction: 420 }
    ],
    ranged: [
        { name: 'Sand Crabs (Mith Darts)', xpRate: 45000, xpPerAction: 240 },
        { name: 'Ammonite Crabs', xpRate: 55000, xpPerAction: 400 },
        { name: 'Nightmare Zone (Blowpipe)', xpRate: 90000, xpPerAction: 240 },
        { name: 'Chinchompas (Grey)', xpRate: 180000, xpPerAction: 150 }, // Multi-target avg
        { name: 'Chinchompas (Red)', xpRate: 250000, xpPerAction: 200 }, // Multi-target avg
        { name: 'Chinchompas (Black)', xpRate: 400000, xpPerAction: 250 }, // Multi-target avg
        { name: 'Maniacal Monkeys', xpRate: 350000, xpPerAction: 300 }, // Multi-target avg
        { name: 'Vorkath', xpRate: 60000, xpPerAction: 3000 },
        { name: 'Hydra', xpRate: 50000, xpPerAction: 4400 },
        { name: 'Zulrah', xpRate: 45000, xpPerAction: 2000 },
        { name: 'Leviathan', xpRate: 55000, xpPerAction: 3600 },
        { name: 'Kree\'arra', xpRate: 40000, xpPerAction: 1020 },
        { name: 'Commander Zilyana', xpRate: 40000, xpPerAction: 1020 }
    ],
    magic: [
        { name: 'Splashing', xpRate: 13000, xpPerAction: 11.5 },
        { name: 'High Alchemy', xpRate: 65000, xpPerAction: 65 },
        { name: 'Bursting Dust Devils', xpRate: 110000, xpPerAction: 250 }, // Multi-target avg
        { name: 'Barraging Dust Devils', xpRate: 140000, xpPerAction: 300 }, // Multi-target avg
        { name: 'Bursting Nechryaels', xpRate: 180000, xpPerAction: 350 }, // Multi-target avg
        { name: 'Barraging Nechryaels', xpRate: 220000, xpPerAction: 400 }, // Multi-target avg
        { name: 'Barraging Maniacal Monkeys', xpRate: 250000, xpPerAction: 450 }, // Multi-target avg
        { name: 'Plank Make', xpRate: 90000, xpPerAction: 90 },
        { name: 'String Jewellery', xpRate: 130000, xpPerAction: 83 },
        { name: 'Stun-Alch', xpRate: 180000, xpPerAction: 180 },
        { name: 'Enchant Bolts (Dragonstone)', xpRate: 150000, xpPerAction: 78 },
        { name: 'Enchant Bolts (Onyx)', xpRate: 200000, xpPerAction: 97 }
    ],
    prayer: [
        { name: 'Big Bones (Gilded Altar)', xpRate: 50000, xpPerAction: 52.5, requirements: [{ id: 532, qty: 1, type: 'input' }] },
        { name: 'Dragon Bones (Gilded Altar)', xpRate: 250000, xpPerAction: 252, requirements: [{ id: 536, qty: 1, type: 'input' }] },
        { name: 'Dragon Bones (Chaos Altar)', xpRate: 500000, xpPerAction: 504, requirements: [{ id: 536, qty: 1, type: 'input' }] }, // Effective XP
        { name: 'Superior Dragon Bones (Gilded)', xpRate: 400000, xpPerAction: 525, requirements: [{ id: 22124, qty: 1, type: 'input' }] },
        { name: 'Superior Dragon Bones (Chaos)', xpRate: 800000, xpPerAction: 1050 }, // Effective XP
        { name: 'Wyrm Bones', xpRate: 150000, xpPerAction: 175 },
        { name: 'Hydra Bones', xpRate: 350000, xpPerAction: 385 },
        { name: 'Dagannoth Bones', xpRate: 300000, xpPerAction: 437.5, requirements: [{ id: 6729, qty: 1, type: 'input' }] },
        { name: 'Lava Dragon Bones', xpRate: 280000, xpPerAction: 297.5 },
        { name: 'Ensouled Dragon Heads', xpRate: 350000, xpPerAction: 1560 }
    ],
    cooking: [
        { name: 'Wines', xpRate: 480000, xpPerAction: 200 },
        { name: 'Karambwans (1-tick)', xpRate: 900000, xpPerAction: 190 },
        { name: 'Karambwans (AFK)', xpRate: 250000, xpPerAction: 190 },
        { name: 'Sharks', xpRate: 280000, xpPerAction: 210, requirements: [{ id: 383, qty: 1, type: 'input' }, { id: 385, qty: 1, type: 'output' }] },
        { name: 'Anglerfish', xpRate: 320000, xpPerAction: 230 },
        { name: 'Dark Crabs', xpRate: 350000, xpPerAction: 215 },
        { name: 'Manta Rays', xpRate: 300000, xpPerAction: 216 }
    ],
    woodcutting: [
        { name: 'Normal Trees', xpRate: 15000, xpPerAction: 25 },
        { name: 'Oak Trees', xpRate: 40000, xpPerAction: 37.5 },
        { name: 'Willows', xpRate: 50000, xpPerAction: 67.5 },
        { name: 'Teaks (2-tick)', xpRate: 190000, xpPerAction: 85 },
        { name: 'Teaks (AFK)', xpRate: 70000, xpPerAction: 85 },
        { name: 'Maples', xpRate: 50000, xpPerAction: 100 },
        { name: 'Mahogany (2-tick)', xpRate: 130000, xpPerAction: 125 },
        { name: 'Yews', xpRate: 40000, xpPerAction: 175 },
        { name: 'Magic Trees', xpRate: 35000, xpPerAction: 250 },
        { name: 'Redwoods', xpRate: 65000, xpPerAction: 380 },
        { name: 'Sulliusceps', xpRate: 100000, xpPerAction: 127 },
        { name: 'Blisterwood', xpRate: 75000, xpPerAction: 76 }
    ],
    fishing: [
        { name: 'Barbarian Fishing (3-tick)', xpRate: 110000, xpPerAction: 70 }, // Avg
        { name: 'Barbarian Fishing (AFK)', xpRate: 60000, xpPerAction: 70 }, // Avg
        { name: 'Monkfish', xpRate: 35000, xpPerAction: 120 },
        { name: 'Karambwans', xpRate: 35000, xpPerAction: 50 }, // Spot moving
        { name: 'Anglerfish', xpRate: 20000, xpPerAction: 120 },
        { name: 'Dark Crabs', xpRate: 40000, xpPerAction: 130 },
        { name: 'Sacred Eels', xpRate: 25000, xpPerAction: 105 },
        { name: 'Infernal Eels', xpRate: 35000, xpPerAction: 95 },
        { name: 'Tempoross', xpRate: 70000, xpPerAction: 800 }, // Reward pool avg
        { name: 'Drift Net', xpRate: 80000, xpPerAction: 770 }, // Avg per catch
        { name: 'Minnows', xpRate: 45000, xpPerAction: 26 }
    ],
    firemaking: [
        { name: 'Wintertodt', xpRate: 280000, xpPerAction: 5000 }, // Game end
        { name: 'Maple Logs', xpRate: 150000, xpPerAction: 135 },
        { name: 'Yew Logs', xpRate: 250000, xpPerAction: 202.5 },
        { name: 'Magic Logs', xpRate: 350000, xpPerAction: 303.8 },
        { name: 'Redwood Logs', xpRate: 450000, xpPerAction: 350 }
    ],
    crafting: [
        { name: 'Glassblowing (Lantern Lenses)', xpRate: 120000, xpPerAction: 55 },
        { name: 'Glassblowing (Light Orbs)', xpRate: 150000, xpPerAction: 70 },
        { name: 'Green D\'hide Bodies', xpRate: 300000, xpPerAction: 186 },
        { name: 'Blue D\'hide Bodies', xpRate: 350000, xpPerAction: 210 },
        { name: 'Black D\'hide Bodies', xpRate: 420000, xpPerAction: 258 },
        { name: 'Battlestaves (Air)', xpRate: 330000, xpPerAction: 137.5 },
        { name: 'Amethyst Dart Tips', xpRate: 160000, xpPerAction: 60 },
        { name: 'Cutting Diamonds', xpRate: 130000, xpPerAction: 107.5 },
        { name: 'Cutting Rubies', xpRate: 110000, xpPerAction: 85 }
    ],
    smithing: [
        { name: 'Blast Furnace (Gold)', xpRate: 350000, xpPerAction: 56.2, requirements: [{ id: 444, qty: 1, type: 'input' }, { id: 2357, qty: 1, type: 'output' }] },
        { name: 'Blast Furnace (Mithril)', xpRate: 100000, xpPerAction: 30 },
        { name: 'Blast Furnace (Adamant)', xpRate: 90000, xpPerAction: 37.5 },
        { name: 'Blast Furnace (Runite)', xpRate: 100000, xpPerAction: 50 },
        { name: 'Giants\' Foundry', xpRate: 200000, xpPerAction: 10000 }, // Per sword avg
        { name: 'Platebodies (Mithril)', xpRate: 180000, xpPerAction: 250 },
        { name: 'Platebodies (Adamant)', xpRate: 220000, xpPerAction: 312.5 },
        { name: 'Dart Tips (Mithril)', xpRate: 50000, xpPerAction: 50 },
        { name: 'Cannonballs', xpRate: 15000, xpPerAction: 25.6 }
    ],
    mining: [
        { name: 'Motherlode Mine', xpRate: 40000, xpPerAction: 60 },
        { name: 'Iron Ore (Power)', xpRate: 70000, xpPerAction: 35 },
        { name: 'Granite (3-tick)', xpRate: 110000, xpPerAction: 75 },
        { name: 'Volcanic Mine', xpRate: 85000, xpPerAction: 2000 }, // Per game
        { name: 'Amethyst', xpRate: 22000, xpPerAction: 240 },
        { name: 'Gem Rocks', xpRate: 55000, xpPerAction: 65 },
        { name: 'Blast Mine', xpRate: 75000, xpPerAction: 300 }, // Avg
        { name: 'Shooting Stars', xpRate: 25000, xpPerAction: 100 } // Avg
    ],
    herblore: [
        { name: 'Prayer Potions', xpRate: 220000, xpPerAction: 87.5, requirements: [{ id: 258, qty: 1, type: 'input' }, { id: 231, qty: 1, type: 'input' }, { id: 227, qty: 1, type: 'input' }, { id: 139, qty: 1, type: 'output' }] },
        { name: 'Super Attack', xpRate: 200000, xpPerAction: 100 },
        { name: 'Super Strength', xpRate: 230000, xpPerAction: 125 },
        { name: 'Super Defence', xpRate: 260000, xpPerAction: 150 },
        { name: 'Super Combat Potions', xpRate: 320000, xpPerAction: 150 },
        { name: 'Saradomin Brews', xpRate: 400000, xpPerAction: 180 },
        { name: 'Super Restores', xpRate: 350000, xpPerAction: 142.5 },
        { name: 'Anti-Venom+', xpRate: 450000, xpPerAction: 125 },
        { name: 'Cleaning Herbs (Auto)', xpRate: 50000, xpPerAction: 10 } // Avg
    ],
    agility: [
        { name: 'Rooftops (Draynor)', xpRate: 9000, xpPerAction: 120 },
        { name: 'Rooftops (Canifis)', xpRate: 18000, xpPerAction: 240 }, // Marks farming
        { name: 'Rooftops (Seers)', xpRate: 55000, xpPerAction: 570 },
        { name: 'Rooftops (Pollnivneach)', xpRate: 50000, xpPerAction: 890 },
        { name: 'Rooftops (Rellekka)', xpRate: 52000, xpPerAction: 780 },
        { name: 'Rooftops (Ardougne)', xpRate: 62000, xpPerAction: 793 },
        { name: 'Hallowed Sepulchre (Floor 3)', xpRate: 50000, xpPerAction: 1000 }, // Avg
        { name: 'Hallowed Sepulchre (Floor 4)', xpRate: 65000, xpPerAction: 1500 }, // Avg
        { name: 'Hallowed Sepulchre (Floor 5)', xpRate: 90000, xpPerAction: 2500 }, // Avg
        { name: 'Prifddinas Course', xpRate: 65000, xpPerAction: 1337 } // Full lap
    ],
    thieving: [
        { name: 'Ardougne Knights', xpRate: 250000, xpPerAction: 84.3 },
        { name: 'Pyramid Plunder', xpRate: 220000, xpPerAction: 4000 }, // Per room avg
        { name: 'Blackjack Menaphites', xpRate: 260000, xpPerAction: 137.5 },
        { name: 'Master Farmers', xpRate: 120000, xpPerAction: 43 },
        { name: 'Elves', xpRate: 160000, xpPerAction: 353 },
        { name: 'Vyres', xpRate: 140000, xpPerAction: 306.9 },
        { name: 'Dorgesh-Kaan Rich Chests', xpRate: 200000, xpPerAction: 650 },
        { name: 'Fruit Stalls', xpRate: 40000, xpPerAction: 28.5 }
    ],
    slayer: [
        { name: 'Duradel (Efficient)', xpRate: 35000, xpPerAction: 300 }, // Avg
        { name: 'Konar (Money)', xpRate: 25000, xpPerAction: 250 }, // Avg
        { name: 'Wilderness Slayer', xpRate: 30000, xpPerAction: 280 }, // Avg
        { name: 'Boss Slayer', xpRate: 18000, xpPerAction: 1500 }, // Avg
        { name: 'Barrage Tasks', xpRate: 60000, xpPerAction: 280 }, // Avg
        { name: 'Cannon Tasks', xpRate: 45000, xpPerAction: 200 } // Avg
    ],
    farming: [
        { name: 'Tree Run (Magic/Palm)', xpRate: 150000, xpPerAction: 13768 }, // Per tree avg
        { name: 'Tree Run (Yew/Papaya)', xpRate: 100000, xpPerAction: 7000 }, // Per tree avg
        { name: 'Fruit Tree Run', xpRate: 80000, xpPerAction: 10000 }, // Avg
        { name: 'Tithe Farm', xpRate: 100000, xpPerAction: 100 }, // Per fruit
        { name: 'Herb Run', xpRate: 15000, xpPerAction: 200 }, // Per patch avg
        { name: 'Mahogany Trees', xpRate: 45000, xpPerAction: 15720 }, // Per tree
        { name: 'Calquat Tree', xpRate: 12000, xpPerAction: 12096 }, // Per tree
        { name: 'Hespori', xpRate: 12000, xpPerAction: 12600 }
    ],
    runecraft: [
        { name: 'Guardians of the Rift', xpRate: 55000, xpPerAction: 400 }, // Avg
        { name: 'ZMI Altar', xpRate: 50000, xpPerAction: 1500 }, // Per lap avg
        { name: 'Lava Runes', xpRate: 70000, xpPerAction: 10.5 }, // Per essence
        { name: 'Blood Runes', xpRate: 38000, xpPerAction: 23.8 }, // Per essence
        { name: 'Soul Runes', xpRate: 45000, xpPerAction: 29.7 }, // Per essence
        { name: 'Wrath Runes', xpRate: 30000, xpPerAction: 52.5 }, // Per essence
        { name: 'Astral Runes', xpRate: 33000, xpPerAction: 8.7 } // Per essence
    ],
    hunter: [
        { name: 'Birdhouses', xpRate: 4000, xpPerAction: 280 }, // Per house
        { name: 'Red Chinchompas', xpRate: 160000, xpPerAction: 265 },
        { name: 'Black Chinchompas', xpRate: 220000, xpPerAction: 315 },
        { name: 'Herbiboar', xpRate: 130000, xpPerAction: 2000 }, // Avg
        { name: 'Maniacal Monkeys', xpRate: 100000, xpPerAction: 1000 },
        { name: 'Drift Net', xpRate: 120000, xpPerAction: 770 }, // Avg
        { name: 'Salamanders (Black)', xpRate: 100000, xpPerAction: 300 }
    ],

    construction: [
        { name: 'Oak Larders', xpRate: 450000, xpPerAction: 480 },
        { name: 'Oak Dungeon Doors', xpRate: 550000, xpPerAction: 600 },
        { name: 'Mahogany Tables', xpRate: 900000, xpPerAction: 840 },
        { name: 'Mahogany Benches', xpRate: 1100000, xpPerAction: 840 },
        { name: 'Teak Benches', xpRate: 700000, xpPerAction: 540 },
        { name: 'Mythical Capes', xpRate: 400000, xpPerAction: 370 }
    ]
};

export const WEAPON_DATA: WeaponData[] = [
    // --- MELEE ---
    // Daggers (4 tick)
    { name: 'Bronze Dagger', speed: 4, category: 'Melee' },
    { name: 'Iron Dagger', speed: 4, category: 'Melee' },
    { name: 'Steel Dagger', speed: 4, category: 'Melee' },
    { name: 'Black Dagger', speed: 4, category: 'Melee' },
    { name: 'Mithril Dagger', speed: 4, category: 'Melee' },
    { name: 'Adamant Dagger', speed: 4, category: 'Melee' },
    { name: 'Rune Dagger', speed: 4, category: 'Melee' },
    { name: 'Dragon Dagger', speed: 4, category: 'Melee' },
    { name: 'Abyssal Dagger', speed: 4, category: 'Melee' },

    // Scimitars (4 tick)
    { name: 'Bronze Scimitar', speed: 4, category: 'Melee' },
    { name: 'Iron Scimitar', speed: 4, category: 'Melee' },
    { name: 'Steel Scimitar', speed: 4, category: 'Melee' },
    { name: 'Black Scimitar', speed: 4, category: 'Melee' },
    { name: 'Mithril Scimitar', speed: 4, category: 'Melee' },
    { name: 'Adamant Scimitar', speed: 4, category: 'Melee' },
    { name: 'Rune Scimitar', speed: 4, category: 'Melee' },
    { name: 'Dragon Scimitar', speed: 4, category: 'Melee' },

    // Longswords (5 tick)
    { name: 'Bronze Longsword', speed: 5, category: 'Melee' },
    { name: 'Iron Longsword', speed: 5, category: 'Melee' },
    { name: 'Steel Longsword', speed: 5, category: 'Melee' },
    { name: 'Black Longsword', speed: 5, category: 'Melee' },
    { name: 'Mithril Longsword', speed: 5, category: 'Melee' },
    { name: 'Adamant Longsword', speed: 5, category: 'Melee' },
    { name: 'Rune Longsword', speed: 5, category: 'Melee' },
    { name: 'Dragon Longsword', speed: 5, category: 'Melee' },

    // Maces (4 tick)
    { name: 'Bronze Mace', speed: 4, category: 'Melee' },
    { name: 'Iron Mace', speed: 4, category: 'Melee' },
    { name: 'Steel Mace', speed: 4, category: 'Melee' },
    { name: 'Black Mace', speed: 4, category: 'Melee' },
    { name: 'Mithril Mace', speed: 4, category: 'Melee' },
    { name: 'Adamant Mace', speed: 4, category: 'Melee' },
    { name: 'Rune Mace', speed: 4, category: 'Melee' },
    { name: 'Dragon Mace', speed: 4, category: 'Melee' },
    { name: 'Inquisitor\'s Mace', speed: 4, category: 'Melee' },

    // Battleaxes (6 tick)
    { name: 'Rune Battleaxe', speed: 6, category: 'Melee' },
    { name: 'Dragon Battleaxe', speed: 6, category: 'Melee' },
    { name: 'Leaf-bladed Battleaxe', speed: 6, category: 'Melee' },
    { name: 'Zombie Axe', speed: 5, category: 'Melee' },

    // Warhammers (6 tick)
    { name: 'Rune Warhammer', speed: 6, category: 'Melee' },
    { name: 'Dragon Warhammer', speed: 6, category: 'Melee' },

    // 2h Swords (7 tick)
    { name: 'Rune 2h Sword', speed: 7, category: 'Melee' },
    { name: 'Dragon 2h Sword', speed: 7, category: 'Melee' },
    { name: 'Colossal Blade', speed: 7, category: 'Melee' },
    { name: 'Godsword (Any)', speed: 6, category: 'Melee' },

    // Spears/Hastae
    { name: 'Dragon Spear', speed: 5, category: 'Melee' },
    { name: 'Zamorakian Hasta', speed: 4, category: 'Melee' },
    { name: 'Ghrazi Rapier', speed: 4, category: 'Melee' },
    { name: 'Osmumten\'s Fang', speed: 5, category: 'Melee' },

    // High Tier / Special Melee
    { name: 'Abyssal Whip', speed: 4, category: 'Melee' },
    { name: 'Abyssal Tentacle', speed: 4, category: 'Melee' },
    { name: 'Blade of Saeldor', speed: 4, category: 'Melee' },
    { name: 'Scythe of Vitur', speed: 5, category: 'Melee' },
    { name: 'Soulreaper Axe', speed: 5, category: 'Melee' },
    { name: 'Elder Maul', speed: 6, category: 'Melee' },
    { name: 'Saradomin Sword', speed: 4, category: 'Melee' },
    { name: 'Arclight', speed: 4, category: 'Melee' },
    { name: 'Darklight', speed: 4, category: 'Melee' },
    { name: 'Voidwaker', speed: 4, category: 'Melee' },
    { name: 'Granite Maul', speed: 7, category: 'Melee' },
    { name: 'Barrelchest Anchor', speed: 6, category: 'Melee' },
    { name: 'Dharok\'s Greataxe', speed: 7, category: 'Melee' },
    { name: 'Verac\'s Flail', speed: 5, category: 'Melee' },
    { name: 'Torag\'s Hammers', speed: 5, category: 'Melee' },
    { name: 'Guthan\'s Warspear', speed: 5, category: 'Melee' },
    { name: 'Toktz-xil-ak (Obsidian Sword)', speed: 4, category: 'Melee' },
    { name: 'Tzhaar-ket-om (Obsidian Maul)', speed: 7, category: 'Melee' },

    // --- RANGED (Rapid speeds) ---
    // Shortbows (3 tick)
    { name: 'Shortbow', speed: 3, category: 'Ranged' },
    { name: 'Oak Shortbow', speed: 3, category: 'Ranged' },
    { name: 'Willow Shortbow', speed: 3, category: 'Ranged' },
    { name: 'Maple Shortbow', speed: 3, category: 'Ranged' },
    { name: 'Yew Shortbow', speed: 3, category: 'Ranged' },
    { name: 'Magic Shortbow', speed: 3, category: 'Ranged' },
    { name: 'Magic Shortbow (i)', speed: 3, category: 'Ranged' },
    { name: '3rd Age Bow', speed: 3, category: 'Ranged' },

    // Longbows (4 tick)
    { name: 'Longbow', speed: 4, category: 'Ranged' },
    { name: 'Oak Longbow', speed: 4, category: 'Ranged' },
    { name: 'Willow Longbow', speed: 4, category: 'Ranged' },
    { name: 'Maple Longbow', speed: 4, category: 'Ranged' },
    { name: 'Yew Longbow', speed: 4, category: 'Ranged' },
    { name: 'Magic Longbow', speed: 4, category: 'Ranged' },
    { name: 'Dark Bow', speed: 8, category: 'Ranged' },

    // Crossbows (5 tick)
    { name: 'Bronze Crossbow', speed: 5, category: 'Ranged' },
    { name: 'Iron Crossbow', speed: 5, category: 'Ranged' },
    { name: 'Steel Crossbow', speed: 5, category: 'Ranged' },
    { name: 'Mithril Crossbow', speed: 5, category: 'Ranged' },
    { name: 'Adamant Crossbow', speed: 5, category: 'Ranged' },
    { name: 'Rune Crossbow', speed: 5, category: 'Ranged' },
    { name: 'Dragon Crossbow', speed: 5, category: 'Ranged' },
    { name: 'Armadyl Crossbow', speed: 5, category: 'Ranged' },
    { name: 'Zaryte Crossbow', speed: 5, category: 'Ranged' },
    { name: 'Dragon Hunter Crossbow', speed: 5, category: 'Ranged' },
    { name: 'Hunter\'s Sunlight Crossbow', speed: 3, category: 'Ranged' },

    // Thrown (2 tick)
    { name: 'Bronze Knife', speed: 2, category: 'Ranged' },
    { name: 'Iron Knife', speed: 2, category: 'Ranged' },
    { name: 'Steel Knife', speed: 2, category: 'Ranged' },
    { name: 'Black Knife', speed: 2, category: 'Ranged' },
    { name: 'Mithril Knife', speed: 2, category: 'Ranged' },
    { name: 'Adamant Knife', speed: 2, category: 'Ranged' },
    { name: 'Rune Knife', speed: 2, category: 'Ranged' },
    { name: 'Dragon Knife', speed: 2, category: 'Ranged' },
    { name: 'Bronze Dart', speed: 2, category: 'Ranged' },
    { name: 'Iron Dart', speed: 2, category: 'Ranged' },
    { name: 'Steel Dart', speed: 2, category: 'Ranged' },
    { name: 'Mithril Dart', speed: 2, category: 'Ranged' },
    { name: 'Adamant Dart', speed: 2, category: 'Ranged' },
    { name: 'Rune Dart', speed: 2, category: 'Ranged' },
    { name: 'Dragon Dart', speed: 2, category: 'Ranged' },
    { name: 'Amethyst Dart', speed: 2, category: 'Ranged' },

    // Special Ranged
    { name: 'Toxic Blowpipe', speed: 2, category: 'Ranged' },
    { name: 'Twisted Bow', speed: 5, category: 'Ranged' },
    { name: 'Bow of Faerdhinen', speed: 4, category: 'Ranged' },
    { name: 'Crystal Bow', speed: 4, category: 'Ranged' },
    { name: 'Karil\'s Crossbow', speed: 3, category: 'Ranged' },
    { name: 'Chinchompas', speed: 3, category: 'Ranged' },
    { name: 'Red Chinchompas', speed: 3, category: 'Ranged' },
    { name: 'Black Chinchompas', speed: 3, category: 'Ranged' },
    { name: 'Venator Bow', speed: 4, category: 'Ranged' },
    { name: 'Craw\'s Bow', speed: 3, category: 'Ranged' },
    { name: 'Webweaver Bow', speed: 3, category: 'Ranged' },

    // --- MAGIC ---
    // Standard Spells (5 tick)
    { name: 'Staff of Air', speed: 5, category: 'Magic' },
    { name: 'Staff of Water', speed: 5, category: 'Magic' },
    { name: 'Staff of Earth', speed: 5, category: 'Magic' },
    { name: 'Staff of Fire', speed: 5, category: 'Magic' },
    { name: 'Air Battlestaff', speed: 5, category: 'Magic' },
    { name: 'Water Battlestaff', speed: 5, category: 'Magic' },
    { name: 'Earth Battlestaff', speed: 5, category: 'Magic' },
    { name: 'Fire Battlestaff', speed: 5, category: 'Magic' },
    { name: 'Lava Battlestaff', speed: 5, category: 'Magic' },
    { name: 'Mud Battlestaff', speed: 5, category: 'Magic' },
    { name: 'Steam Battlestaff', speed: 5, category: 'Magic' },
    { name: 'Smoke Battlestaff', speed: 5, category: 'Magic' },
    { name: 'Mist Battlestaff', speed: 5, category: 'Magic' },
    { name: 'Dust Battlestaff', speed: 5, category: 'Magic' },
    { name: 'Mystic Air Staff', speed: 5, category: 'Magic' },
    { name: 'Mystic Water Staff', speed: 5, category: 'Magic' },
    { name: 'Mystic Earth Staff', speed: 5, category: 'Magic' },
    { name: 'Mystic Fire Staff', speed: 5, category: 'Magic' },
    { name: 'Mystic Lava Staff', speed: 5, category: 'Magic' },
    { name: 'Mystic Mud Staff', speed: 5, category: 'Magic' },
    { name: 'Mystic Steam Staff', speed: 5, category: 'Magic' },
    { name: 'Mystic Smoke Staff', speed: 5, category: 'Magic' },
    { name: 'Mystic Mist Staff', speed: 5, category: 'Magic' },
    { name: 'Mystic Dust Staff', speed: 5, category: 'Magic' },
    { name: 'Ancient Staff', speed: 5, category: 'Magic' },
    { name: 'Master Wand', speed: 5, category: 'Magic' },
    { name: 'Kodai Wand', speed: 5, category: 'Magic' },
    { name: 'Staff of the Dead', speed: 5, category: 'Magic' },
    { name: 'Toxic Staff of the Dead', speed: 5, category: 'Magic' },
    { name: 'Staff of Light', speed: 5, category: 'Magic' },
    { name: 'Staff of Balance', speed: 5, category: 'Magic' },
    { name: 'Iban\'s Staff', speed: 5, category: 'Magic' },
    { name: 'Slayer\'s Staff', speed: 5, category: 'Magic' },
    { name: 'Slayer\'s Staff (e)', speed: 5, category: 'Magic' },
    { name: 'Tumeken\'s Shadow', speed: 5, category: 'Magic' },
    { name: 'Nightmare Staff', speed: 5, category: 'Magic' },
    { name: 'Volatile Nightmare Staff', speed: 5, category: 'Magic' },
    { name: 'Eldritch Nightmare Staff', speed: 5, category: 'Magic' },
    { name: 'Zuriel\'s Staff', speed: 5, category: 'Magic' },
    { name: 'Void Knight Mace', speed: 5, category: 'Magic' },
    { name: 'Skull Sceptre (i)', speed: 5, category: 'Magic' },
    { name: 'Ahrim\'s Staff', speed: 5, category: 'Magic' },
    { name: 'Blue Moon Spear', speed: 5, category: 'Magic' },

    // Powered Staves (4 tick)
    { name: 'Trident of the Seas', speed: 4, category: 'Magic' },
    { name: 'Trident of the Swamp', speed: 4, category: 'Magic' },
    { name: 'Sanguinesti Staff', speed: 4, category: 'Magic' },
    { name: 'Warped Sceptre', speed: 4, category: 'Magic' },
    { name: 'Accursed Sceptre', speed: 4, category: 'Magic' },
    { name: 'Thammaron\'s Sceptre', speed: 4, category: 'Magic' },
    { name: 'Harmonised Nightmare Staff', speed: 4, category: 'Magic' }
];

export const getCombatLevel = (stats: PlayerStats): number => {
    const base = 0.25 * (stats.defence.level + stats.hitpoints.level + Math.floor(stats.prayer.level / 2));
    const melee = 0.325 * (stats.attack.level + stats.strength.level);
    const range = 0.325 * (Math.floor(stats.ranged.level / 2) + stats.ranged.level);
    const mage = 0.325 * (Math.floor(stats.magic.level / 2) + stats.magic.level);
    return Math.floor(base + Math.max(melee, range, mage));
};

export interface GoalRequirement {
    skill: keyof PlayerStats;
    level: number;
}

export interface Goal {
    name: string;
    description: string;
    requirements: GoalRequirement[];
    type: 'Quest' | 'Diary' | 'Combat';
}

export const POPULAR_GOALS: Goal[] = [
    {
        name: 'Recipe for Disaster (Barrows Gloves)',
        description: 'The ultimate glove upgrade for almost every build.',
        type: 'Quest',
        requirements: [
            { skill: 'cooking', level: 70 },
            { skill: 'agility', level: 48 },
            { skill: 'mining', level: 50 },
            { skill: 'fishing', level: 53 },
            { skill: 'thieving', level: 53 },
            { skill: 'herblore', level: 25 },
            { skill: 'magic', level: 59 },
            { skill: 'smithing', level: 40 },
            { skill: 'firemaking', level: 50 },
            { skill: 'ranged', level: 40 },
            { skill: 'crafting', level: 40 },
            { skill: 'slayer', level: 10 },
            { skill: 'fletching', level: 5 },
            { skill: 'woodcutting', level: 36 }
        ]
    },
    {
        name: 'Desert Treasure II (Ancient Curses)',
        description: 'Unlocks Ancient Curses and elite bossing.',
        type: 'Quest',
        requirements: [
            { skill: 'firemaking', level: 75 },
            { skill: 'magic', level: 75 },
            { skill: 'thieving', level: 70 },
            { skill: 'herblore', level: 62 },
            { skill: 'agility', level: 60 },
            { skill: 'mining', level: 60 },
            { skill: 'slayer', level: 60 }
        ]
    },
    {
        name: 'Song of the Elves (Prifddinas)',
        description: 'Unlocks the Elven city, Gauntlet, and Zalcano.',
        type: 'Quest',
        requirements: [
            { skill: 'agility', level: 70 },
            { skill: 'construction', level: 70 },
            { skill: 'farming', level: 70 },
            { skill: 'herblore', level: 70 },
            { skill: 'hunter', level: 70 },
            { skill: 'mining', level: 70 },
            { skill: 'smithing', level: 70 },
            { skill: 'woodcutting', level: 70 }
        ]
    },
    {
        name: 'Dragon Slayer II (Myth\'s Guild)',
        description: 'Unlocks Vorkath and the Ava\'s Assembler.',
        type: 'Quest',
        requirements: [
            { skill: 'magic', level: 75 },
            { skill: 'smithing', level: 70 },
            { skill: 'mining', level: 68 },
            { skill: 'crafting', level: 62 },
            { skill: 'agility', level: 60 },
            { skill: 'thieving', level: 60 },
            { skill: 'construction', level: 50 }
        ]
    },
    {
        name: 'Sins of the Father (Darkmeyre)',
        description: 'Unlocks Darkmeyer, Vyrewatch Sentinels, and Sepulchre floor 4/5.',
        type: 'Quest',
        requirements: [
            { skill: 'construction', level: 49 },
            { skill: 'crafting', level: 49 },
            { skill: 'fletching', level: 50 },
            { skill: 'herblore', level: 50 },
            { skill: 'magic', level: 49 },
            { skill: 'slayer', level: 50 },
            { skill: 'woodcutting', level: 62 }
        ]
    }
];
