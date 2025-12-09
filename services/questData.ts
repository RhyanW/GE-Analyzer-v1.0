
export interface Requirement {
    type: 'Skill' | 'Quest' | 'Item' | 'Combat';
    skill?: string;
    level?: number;
    quest?: string; // Name of prerequisite quest
    item?: string;
    combatLevel?: number;
}

export interface Quest {
    id: number;
    name: string;
    difficulty: 'Novice' | 'Intermediate' | 'Experienced' | 'Master' | 'Grandmaster';
    length: 'Short' | 'Medium' | 'Long' | 'Very Long';
    qp: number;
    requirements: Requirement[];
    rewards?: string[];
}

export interface DiaryTask {
    id: number;
    name: string;
    tier: 'Easy' | 'Medium' | 'Hard' | 'Elite';
    region: string;
    requirements: Requirement[];
}

// Mock Data - Comprehensive List
// Note: IDs 1-99 Reserved for High Profile / Special Logic Quests
// IDs 300+ Reserved for Subquests
// IDs 1000+ for General Bulk Import

export const QUESTS: Quest[] = [
    // --- Special / High Profile Quests (Handcrafted) ---
    {
        id: 1,
        name: "Cook's Assistant",
        difficulty: "Novice",
        length: "Short",
        qp: 1,
        requirements: [],
        rewards: ["300 Cooking XP"]
    },
    {
        id: 2,
        name: "Dragon Slayer I",
        difficulty: "Experienced",
        length: "Long",
        qp: 2,
        requirements: [
            { type: "Skill", skill: "crafting", level: 8 },
            { type: "Quest", quest: "Goblin Diplomacy" },
            { type: "Quest", quest: "Shield of Arrav" },
            { type: "Quest", quest: "Romeo and Juliet" }, // Technically not req but listed in older guides sometimes? No, simplified reqs.
            { type: "Combat", combatLevel: 30 }
        ],
        rewards: ["18,650 Strength XP", "18,650 Defence XP"]
    },
    {
        id: 4,
        name: "Desert Treasure I",
        difficulty: "Master",
        length: "Long",
        qp: 3,
        requirements: [
            { type: "Skill", skill: "thieving", level: 53 },
            { type: "Skill", skill: "firemaking", level: 50 },
            { type: "Skill", skill: "slayer", level: 10 },
            { type: "Skill", skill: "magic", level: 50 },
            { type: "Quest", quest: "The Dig Site" },
            { type: "Quest", quest: "Temple of Ikov" },
            { type: "Quest", quest: "The Tourist Trap" },
            { type: "Quest", quest: "Troll Stronghold" },
            { type: "Quest", quest: "Priest in Peril" },
            { type: "Quest", quest: "Waterfall Quest" }
        ],
        rewards: ["Ancient Magicks"]
    },
    {
        id: 5,
        name: "Dragon Slayer II",
        difficulty: "Grandmaster",
        length: "Very Long",
        qp: 5,
        requirements: [
            { type: "Skill", skill: "magic", level: 75 },
            { type: "Skill", skill: "smithing", level: 70 },
            { type: "Skill", skill: "mining", level: 68 },
            { type: "Skill", skill: "crafting", level: 62 },
            { type: "Skill", skill: "agility", level: 60 },
            { type: "Skill", skill: "thieving", level: 60 },
            { type: "Skill", skill: "construction", level: 50 },
            { type: "Skill", skill: "hitpoints", level: 50 },
            { type: "Quest", quest: "Legends' Quest" },
            { type: "Quest", quest: "Dream Mentor" },
            { type: "Quest", quest: "A Tail of Two Cats" },
            { type: "Quest", quest: "Animal Magnetism" },
            { type: "Quest", quest: "Ghosts Ahoy" },
            { type: "Quest", quest: "Bone Voyage" },
            { type: "Quest", quest: "Client of Kourend" }
        ],
        rewards: ["Myth's Guild", "Ava's Assembler"]
    },
    // --- Recipe for Disaster Subquests ---
    {
        id: 301,
        name: "RFD: Another Cook's Quest",
        difficulty: "Novice",
        length: "Short",
        qp: 1,
        requirements: [
            { type: "Skill", skill: "cooking", level: 10 },
            { type: "Quest", quest: "Cook's Assistant" }
        ],
        rewards: ["Access to RFD Chest"]
    },
    {
        id: 302,
        name: "RFD: Dwarf",
        difficulty: "Novice",
        length: "Short",
        qp: 1,
        requirements: [
            { type: "Quest", quest: "Fishing Contest" }
        ],
        rewards: ["1,000 Cooking XP", "1,000 Slayer XP"]
    },
    {
        id: 303,
        name: "RFD: Goblin",
        difficulty: "Novice",
        length: "Short",
        qp: 1,
        requirements: [
            { type: "Quest", quest: "Goblin Diplomacy" }
        ],
        rewards: ["1,000 Cooking XP", "1,000 Crafting XP", "1,000 Farming XP"]
    },
    {
        id: 304,
        name: "RFD: Pirate Pete",
        difficulty: "Intermediate",
        length: "Short",
        qp: 1,
        requirements: [
            { type: "Skill", skill: "cooking", level: 31 }
        ],
        rewards: ["1,000 Cooking XP", "1,000 Fishing XP", "1,000 Smithing XP", "1,000 Crafting XP"]
    },
    {
        id: 305,
        name: "RFD: Lumbridge Guide",
        difficulty: "Novice",
        length: "Short",
        qp: 1,
        requirements: [
            { type: "Skill", skill: "cooking", level: 40 },
            { type: "Quest", quest: "Big Chompy Bird Hunting" },
            { type: "Quest", quest: "Biohazard" },
            { type: "Quest", quest: "Demon Slayer" },
            { type: "Quest", quest: "Murder Mystery" },
            { type: "Quest", quest: "Nature Spirit" },
            { type: "Quest", quest: "Priest in Peril" },
            { type: "Quest", quest: "Restless Ghost" },
            { type: "Quest", quest: "Witch's House" }
        ],
        rewards: ["2,500 Cooking XP", "2,500 Magic XP"]
    },
    {
        id: 306,
        name: "RFD: Evil Dave",
        difficulty: "Intermediate",
        length: "Medium",
        qp: 1,
        requirements: [
            { type: "Skill", skill: "cooking", level: 25 },
            { type: "Quest", quest: "Gertrude's Cat" },
            { type: "Quest", quest: "Shadow of the Storm" }
        ],
        rewards: ["7,000 Cooking XP"]
    },
    {
        id: 307,
        name: "RFD: Skrach Uglogwee",
        difficulty: "Intermediate",
        length: "Short",
        qp: 1,
        requirements: [
            { type: "Skill", skill: "cooking", level: 41 },
            { type: "Skill", skill: "firemaking", level: 20 },
            { type: "Quest", quest: "Big Chompy Bird Hunting" }
        ],
        rewards: ["1,500 Cooking XP", "1,500 Woodcutting XP", "1,500 Ranged XP", "1,500 Crafting XP"]
    },
    {
        id: 308,
        name: "RFD: Sir Amik Varze",
        difficulty: "Experienced",
        length: "Medium",
        qp: 1,
        requirements: [
            { type: "Quest", quest: "Lost City" },
            { type: "Quest", quest: "Legends' Quest" }
        ],
        rewards: ["4,000 Cooking XP", "4,000 Hitpoints XP"]
    },
    {
        id: 309,
        name: "RFD: King Awowogei",
        difficulty: "Experienced",
        length: "Long",
        qp: 1,
        requirements: [
            { type: "Skill", skill: "cooking", level: 70 },
            { type: "Skill", skill: "agility", level: 48 },
            { type: "Quest", quest: "Monkey Madness I" }
        ],
        rewards: ["10,000 Cooking XP", "10,000 Agility XP"]
    },
    {
        id: 310,
        name: "RFD: The Culinaromancer",
        difficulty: "Master",
        length: "Short",
        qp: 1,
        requirements: [
            { type: "Quest", quest: "RFD: Another Cook's Quest" },
            { type: "Quest", quest: "RFD: Dwarf" },
            { type: "Quest", quest: "RFD: Goblin" },
            { type: "Quest", quest: "RFD: Pirate Pete" },
            { type: "Quest", quest: "RFD: Lumbridge Guide" },
            { type: "Quest", quest: "RFD: Evil Dave" },
            { type: "Quest", quest: "RFD: Skrach Uglogwee" },
            { type: "Quest", quest: "RFD: Sir Amik Varze" },
            { type: "Quest", quest: "RFD: King Awowogei" },
            { type: "Quest", quest: "Desert Treasure I" },
            { type: "Quest", quest: "Horror from the Deep" }
        ],
        rewards: ["Barrows Gloves", "20,000 Cooking XP"]
    },

    // --- Imported & General Quests ---
    { id: 1001, name: "Animal Magnetism", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "slayer", level: 18 }, { type: "Skill", skill: "crafting", level: 19 }, { type: "Skill", skill: "ranged", level: 30 }, { type: "Skill", skill: "woodcutting", level: 35 }, { type: "Quest", quest: "Ernest the Chicken" }, { type: "Quest", quest: "Restless Ghost" }, { type: "Quest", quest: "Priest in Peril" }] },
    { id: 1002, name: "Another Slice of H.A.M.", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "attack", level: 15 }, { type: "Skill", skill: "prayer", level: 25 }, { type: "Quest", quest: "Death to the Dorgeshuun" }, { type: "Quest", quest: "The Dig Site" }] },
    { id: 1003, name: "Between a Rock...", difficulty: "Experienced", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "defence", level: 30 }, { type: "Skill", skill: "mining", level: 40 }, { type: "Skill", skill: "smithing", level: 50 }, { type: "Quest", quest: "Dwarf Cannon" }, { type: "Quest", quest: "Fishing Contest" }] },
    { id: 1004, name: "Big Chompy Bird Hunting", difficulty: "Intermediate", length: "Short", qp: 2, requirements: [{ type: "Skill", skill: "fletching", level: 5 }, { type: "Skill", skill: "cooking", level: 30 }, { type: "Skill", skill: "ranged", level: 30 }] },
    { id: 1005, name: "Biohazard", difficulty: "Novice", length: "Short", qp: 3, requirements: [{ type: "Quest", quest: "Plague City" }] },
    { id: 1006, name: "Black Knights' Fortress", difficulty: "Novice", length: "Short", qp: 3, requirements: [{ type: "Quest", quest: "QP: 12" }] },
    { id: 1007, name: "Cabin Fever", difficulty: "Experienced", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "agility", level: 42 }, { type: "Skill", skill: "crafting", level: 45 }, { type: "Skill", skill: "smithing", level: 50 }, { type: "Skill", skill: "ranged", level: 40 }, { type: "Quest", quest: "Pirate's Treasure" }, { type: "Quest", quest: "Rum Deal" }] },
    { id: 1008, name: "Clock Tower", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1009, name: "Cold War", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "hunter", level: 10 }, { type: "Skill", skill: "agility", level: 30 }, { type: "Skill", skill: "crafting", level: 30 }, { type: "Skill", skill: "construction", level: 34 }, { type: "Skill", skill: "thieving", level: 15 }] },
    { id: 1010, name: "Contact!", difficulty: "Master", length: "Short", qp: 1, requirements: [{ type: "Quest", quest: "Prince Ali Rescue" }, { type: "Quest", quest: "Icthlarin's Little Helper" }] },
    { id: 1011, name: "Creature of Fenkenstrain", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "crafting", level: 20 }, { type: "Skill", skill: "thieving", level: 25 }, { type: "Quest", quest: "Priest in Peril" }, { type: "Quest", quest: "The Restless Ghost" }] },
    { id: 1012, name: "Darkness of Hallowvale", difficulty: "Experienced", length: "Long", qp: 2, requirements: [{ type: "Skill", skill: "construction", level: 5 }, { type: "Skill", skill: "mining", level: 20 }, { type: "Skill", skill: "thieving", level: 22 }, { type: "Skill", skill: "agility", level: 26 }, { type: "Skill", skill: "crafting", level: 32 }, { type: "Skill", skill: "magic", level: 33 }, { type: "Skill", skill: "strength", level: 40 }, { type: "Quest", quest: "In Aid of the Myreque" }] },
    { id: 1013, name: "Death Plateau", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1014, name: "Death to the Dorgeshuun", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "agility", level: 23 }, { type: "Skill", skill: "thieving", level: 23 }, { type: "Quest", quest: "The Lost Tribe" }] },
    { id: 1015, name: "Demon Slayer", difficulty: "Novice", length: "Short", qp: 3, requirements: [] },
    { id: 1017, name: "Devious Minds", difficulty: "Experienced", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "smithing", level: 65 }, { type: "Skill", skill: "runecraft", level: 50 }, { type: "Skill", skill: "fletching", level: 50 }, { type: "Quest", quest: "Wanted!" }, { type: "Quest", quest: "Troll Stronghold" }, { type: "Quest", quest: "Doric's Quest" }, { type: "Quest", quest: "Enter the Abyss" }] },
    { id: 1018, name: "The Dig Site", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "agility", level: 10 }, { type: "Skill", skill: "herblore", level: 10 }, { type: "Skill", skill: "thieving", level: 25 }] },
    { id: 1019, name: "Doric's Quest", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1021, name: "Dream Mentor", difficulty: "Master", length: "Short", qp: 2, requirements: [{ type: "Skill", skill: "combat", level: 85 }, { type: "Quest", quest: "Lunar Diplomacy" }, { type: "Quest", quest: "Eadgar's Ruse" }] },
    { id: 1022, name: "Druidic Ritual", difficulty: "Novice", length: "Short", qp: 4, requirements: [] },
    { id: 1023, name: "Dwarf Cannon", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1024, name: "Eadgar's Ruse", difficulty: "Experienced", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "agility", level: 44 }, { type: "Skill", skill: "herblore", level: 31 }, { type: "Quest", quest: "Druidic Ritual" }, { type: "Quest", quest: "Troll Stronghold" }] },
    { id: 1025, name: "Eagles' Peak", difficulty: "Novice", length: "Short", qp: 2, requirements: [{ type: "Skill", skill: "hunter", level: 27 }] },
    { id: 1026, name: "Elemental Workshop I", difficulty: "Novice", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "mining", level: 20 }, { type: "Skill", skill: "smithing", level: 20 }, { type: "Skill", skill: "crafting", level: 20 }] },
    { id: 1027, name: "Elemental Workshop II", difficulty: "Intermediate", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "magic", level: 20 }, { type: "Skill", skill: "smithing", level: 30 }, { type: "Quest", quest: "Elemental Workshop I" }] },
    { id: 1028, name: "Enakhra's Lament", difficulty: "Experienced", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "crafting", level: 50 }, { type: "Skill", skill: "firemaking", level: 45 }, { type: "Skill", skill: "prayer", level: 43 }, { type: "Skill", skill: "magic", level: 39 }] },
    { id: 1029, name: "Enlightened Journey", difficulty: "Intermediate", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "farming", level: 30 }, { type: "Skill", skill: "firemaking", level: 20 }, { type: "Skill", skill: "crafting", level: 36 }] },
    { id: 1030, name: "Ernest the Chicken", difficulty: "Novice", length: "Short", qp: 4, requirements: [] },
    { id: 1031, name: "The Eyes of Glouphrie", difficulty: "Intermediate", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "construction", level: 5 }, { type: "Skill", skill: "magic", level: 46 }, { type: "Quest", quest: "The Grand Tree" }] },
    { id: 1032, name: "Fairytale I - Growing Pains", difficulty: "Experienced", length: "Medium", qp: 2, requirements: [{ type: "Quest", quest: "Lost City" }, { type: "Quest", quest: "Nature Spirit" }] },
    { id: 1033, name: "Fairytale II - Cure a Queen", difficulty: "Experienced", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "thieving", level: 40 }, { type: "Skill", skill: "farming", level: 49 }, { type: "Skill", skill: "herblore", level: 57 }, { type: "Quest", quest: "Fairytale I - Growing Pains" }] },
    { id: 1034, name: "Family Crest", difficulty: "Experienced", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "mining", level: 40 }, { type: "Skill", skill: "smithing", level: 40 }, { type: "Skill", skill: "magic", level: 59 }, { type: "Skill", skill: "crafting", level: 40 }] },
    { id: 1035, name: "The Feud", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "thieving", level: 30 }] },
    { id: 1036, name: "Fight Arena", difficulty: "Experienced", length: "Short", qp: 2, requirements: [] },
    { id: 1037, name: "Fishing Contest", difficulty: "Novice", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "fishing", level: 10 }] },
    { id: 1038, name: "Forgettable Tale...", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "cooking", level: 22 }, { type: "Skill", skill: "farming", level: 17 }, { type: "Quest", quest: "The Giant Dwarf" }, { type: "Quest", quest: "Fishing Contest" }] },
    { id: 1039, name: "The Fremennik Isles", difficulty: "Experienced", length: "Long", qp: 1, requirements: [{ type: "Skill", skill: "construction", level: 20 }, { type: "Skill", skill: "agility", level: 40 }, { type: "Quest", quest: "The Fremennik Trials" }] },
    { id: 1040, name: "The Fremennik Trials", difficulty: "Intermediate", length: "Long", qp: 3, requirements: [{ type: "Skill", skill: "fletching", level: 25 }, { type: "Skill", skill: "woodcutting", level: 40 }, { type: "Skill", skill: "crafting", level: 40 }] },
    { id: 1041, name: "Garden of Tranquility", difficulty: "Intermediate", length: "Long", qp: 2, requirements: [{ type: "Skill", skill: "farming", level: 25 }, { type: "Quest", quest: "Creature of Fenkenstrain" }] },
    { id: 1042, name: "Gertrude's Cat", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1043, name: "Ghosts Ahoy", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "agility", level: 25 }, { type: "Skill", skill: "cooking", level: 20 }, { type: "Quest", quest: "Priest in Peril" }, { type: "Quest", quest: "The Restless Ghost" }] },
    { id: 1044, name: "The Giant Dwarf", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "crafting", level: 12 }, { type: "Skill", skill: "firemaking", level: 16 }, { type: "Skill", skill: "magic", level: 33 }, { type: "Skill", skill: "thieving", level: 14 }] },
    { id: 1045, name: "Goblin Diplomacy", difficulty: "Novice", length: "Short", qp: 5, requirements: [] },
    { id: 1046, name: "The Golem", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "crafting", level: 20 }, { type: "Skill", skill: "thieving", level: 25 }] },
    { id: 1047, name: "The Grand Tree", difficulty: "Experienced", length: "Medium", qp: 5, requirements: [{ type: "Skill", skill: "agility", level: 25 }] },
    { id: 1048, name: "The Great Brain Robbery", difficulty: "Experienced", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "crafting", level: 16 }, { type: "Skill", skill: "construction", level: 30 }, { type: "Skill", skill: "prayer", level: 50 }, { type: "Quest", quest: "Creature of Fenkenstrain" }] },
    { id: 1049, name: "Grim Tales", difficulty: "Master", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "farming", level: 45 }, { type: "Skill", skill: "herblore", level: 52 }, { type: "Skill", skill: "thieving", level: 58 }, { type: "Skill", skill: "agility", level: 59 }, { type: "Skill", skill: "woodcutting", level: 71 }, { type: "Quest", quest: "Witch's House" }] },
    { id: 1050, name: "Haunted Mine", difficulty: "Experienced", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "agility", level: 15 }, { type: "Skill", skill: "crafting", level: 35 }, { type: "Quest", quest: "Priest in Peril" }] },
    { id: 1051, name: "Hazeel Cult", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1052, name: "Heroes' Quest", difficulty: "Experienced", length: "Long", qp: 1, requirements: [{ type: "Skill", skill: "cooking", level: 55 }, { type: "Skill", skill: "fishing", level: 53 }, { type: "Skill", skill: "herblore", level: 25 }, { type: "Skill", skill: "mining", level: 50 }, { type: "Quest", quest: "Shield of Arrav" }, { type: "Quest", quest: "Lost City" }, { type: "Quest", quest: "Merlin's Crystal" }, { type: "Quest", quest: "Dragon Slayer I" }, { type: "Quest", quest: "Druidic Ritual" }] },
    { id: 1053, name: "Holy Grail", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "attack", level: 20 }, { type: "Quest", quest: "Merlin's Crystal" }] },
    { id: 1054, name: "Horror from the Deep", difficulty: "Experienced", length: "Short", qp: 2, requirements: [{ type: "Skill", skill: "agility", level: 35 }, { type: "Quest", quest: "Barcrawl" }] },
    { id: 1055, name: "Icthlarin's Little Helper", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Quest", quest: "Gertrude's Cat" }] },
    { id: 1056, name: "Imp Catcher", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1057, name: "In Aid of the Myreque", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "crafting", level: 25 }, { type: "Skill", skill: "mining", level: 15 }, { type: "Skill", skill: "magic", level: 7 }, { type: "Quest", quest: "In Search of the Myreque" }] },
    { id: 1058, name: "In Search of the Myreque", difficulty: "Intermediate", length: "Short", qp: 2, requirements: [{ type: "Skill", skill: "agility", level: 25 }, { type: "Quest", quest: "Nature Spirit" }] },
    { id: 1059, name: "Jungle Potion", difficulty: "Novice", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "herblore", level: 3 }, { type: "Quest", quest: "Druidic Ritual" }] },
    { id: 1060, name: "King's Ransom", difficulty: "Experienced", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "magic", level: 45 }, { type: "Skill", skill: "defence", level: 65 }, { type: "Quest", quest: "Black Knights' Fortress" }, { type: "Quest", quest: "Holy Grail" }, { type: "Quest", quest: "Murder Mystery" }, { type: "Quest", quest: "One Small Favour" }] },
    { id: 1061, name: "The Knight's Sword", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "mining", level: 10 }] },
    { id: 1062, name: "Legends' Quest", difficulty: "Master", length: "Long", qp: 4, requirements: [{ type: "Skill", skill: "agility", level: 50 }, { type: "Skill", skill: "crafting", level: 50 }, { type: "Skill", skill: "herblore", level: 45 }, { type: "Skill", skill: "magic", level: 56 }, { type: "Skill", skill: "mining", level: 52 }, { type: "Skill", skill: "prayer", level: 42 }, { type: "Skill", skill: "smithing", level: 50 }, { type: "Skill", skill: "strength", level: 50 }, { type: "Skill", skill: "thieving", level: 50 }, { type: "Skill", skill: "woodcutting", level: 50 }, { type: "Quest", quest: "Heroes' Quest" }, { type: "Quest", quest: "Family Crest" }, { type: "Quest", quest: "Shilo Village" }, { type: "Quest", quest: "Underground Pass" }, { type: "Quest", quest: "Waterfall Quest" }] },
    { id: 1063, name: "Lost City", difficulty: "Experienced", length: "Short", qp: 3, requirements: [{ type: "Skill", skill: "crafting", level: 31 }, { type: "Skill", skill: "woodcutting", level: 36 }] },
    { id: 1064, name: "The Lost Tribe", difficulty: "Intermediate", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "agility", level: 13 }, { type: "Skill", skill: "thieving", level: 13 }, { type: "Skill", skill: "mining", level: 17 }, { type: "Quest", quest: "Goblin Diplomacy" }, { type: "Quest", quest: "Rune Mysteries" }] },
    { id: 1065, name: "Lunar Diplomacy", difficulty: "Experienced", length: "Long", qp: 2, requirements: [{ type: "Skill", skill: "crafting", level: 61 }, { type: "Skill", skill: "defence", level: 40 }, { type: "Skill", skill: "firemaking", level: 49 }, { type: "Skill", skill: "herblore", level: 5 }, { type: "Skill", skill: "magic", level: 65 }, { type: "Skill", skill: "mining", level: 60 }, { type: "Skill", skill: "woodcutting", level: 55 }, { type: "Quest", quest: "The Fremennik Trials" }, { type: "Quest", quest: "Lost City" }, { type: "Quest", quest: "Shilo Village" }] },
    { id: 1066, name: "Making History", difficulty: "Intermediate", length: "Short", qp: 3, requirements: [{ type: "Quest", quest: "Priest in Peril" }, { type: "Quest", quest: "The Restless Ghost" }] },
    { id: 1067, name: "Merlin's Crystal", difficulty: "Intermediate", length: "Medium", qp: 6, requirements: [{ type: "Skill", skill: "attack", level: 20 }] },
    { id: 1068, name: "Monkey Madness I", difficulty: "Master", length: "Long", qp: 3, requirements: [{ type: "Quest", quest: "The Grand Tree" }, { type: "Quest", quest: "Tree Gnome Village" }] },
    { id: 1069, name: "Monk's Friend", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1070, name: "Mountain Daughter", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "agility", level: 20 }] },
    { id: 1071, name: "Mourning's End Part I", difficulty: "Master", length: "Long", qp: 2, requirements: [{ type: "Skill", skill: "ranged", level: 60 }, { type: "Skill", skill: "thieving", level: 50 }, { type: "Quest", quest: "Big Chompy Bird Hunting" }, { type: "Quest", quest: "Roving Elves" }, { type: "Quest", quest: "Sheep Herder" }] },
    { id: 1072, name: "Mourning's End Part II", difficulty: "Grandmaster", length: "Long", qp: 2, requirements: [{ type: "Quest", quest: "Mourning's End Part I" }] },
    { id: 1073, name: "Murder Mystery", difficulty: "Novice", length: "Short", qp: 3, requirements: [] },
    { id: 1074, name: "My Arm's Big Adventure", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "woodcutting", level: 10 }, { type: "Skill", skill: "farming", level: 29 }, { type: "Quest", quest: "Eadgar's Ruse" }, { type: "Quest", quest: "The Feud" }, { type: "Quest", quest: "Jungle Potion" }] },
    { id: 1075, name: "Nature Spirit", difficulty: "Novice", length: "Short", qp: 2, requirements: [{ type: "Skill", skill: "crafting", level: 18 }, { type: "Quest", quest: "Priest in Peril" }, { type: "Quest", quest: "The Restless Ghost" }] },
    { id: 1076, name: "Observatory Quest", difficulty: "Novice", length: "Short", qp: 2, requirements: [{ type: "Skill", skill: "crafting", level: 10 }] },
    { id: 1077, name: "Olaf's Quest", difficulty: "Intermediate", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "firemaking", level: 40 }, { type: "Skill", skill: "woodcutting", level: 50 }, { type: "Quest", quest: "The Fremennik Trials" }] },
    { id: 1078, name: "One Small Favour", difficulty: "Experienced", length: "Very Long", qp: 2, requirements: [{ type: "Skill", skill: "agility", level: 36 }, { type: "Skill", skill: "crafting", level: 25 }, { type: "Skill", skill: "herblore", level: 18 }, { type: "Skill", skill: "smithing", level: 25 }, { type: "Quest", quest: "Rune Mysteries" }, { type: "Quest", quest: "Shilo Village" }] },
    { id: 1079, name: "Pirate's Treasure", difficulty: "Novice", length: "Short", qp: 2, requirements: [] },
    { id: 1080, name: "Plague City", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1081, name: "Priest in Peril", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1082, name: "Prince Ali Rescue", difficulty: "Novice", length: "Short", qp: 3, requirements: [] },
    { id: 1083, name: "Ratcatchers", difficulty: "Intermediate", length: "Long", qp: 2, requirements: [{ type: "Quest", quest: "Icthlarin's Little Helper" }] },
    { id: 1085, name: "Recruitment Drive", difficulty: "Novice", length: "Short", qp: 1, requirements: [{ type: "Quest", quest: "Black Knights' Fortress" }, { type: "Quest", quest: "Druidic Ritual" }] },
    { id: 1086, name: "Regicide", difficulty: "Master", length: "Long", qp: 3, requirements: [{ type: "Skill", skill: "agility", level: 56 }, { type: "Skill", skill: "crafting", level: 10 }, { type: "Quest", quest: "Underground Pass" }] },
    { id: 1087, name: "The Restless Ghost", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1088, name: "Romeo and Juliet", difficulty: "Novice", length: "Short", qp: 5, requirements: [] },
    { id: 1089, name: "Roving Elves", difficulty: "Master", length: "Short", qp: 1, requirements: [{ type: "Quest", quest: "Regicide" }, { type: "Quest", quest: "Waterfall Quest" }] },
    { id: 1090, name: "Royal Trouble", difficulty: "Experienced", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "agility", level: 40 }, { type: "Skill", skill: "slayer", level: 40 }, { type: "Quest", quest: "Throne of Miscellania" }] },
    { id: 1091, name: "Rum Deal", difficulty: "Experienced", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "crafting", level: 42 }, { type: "Skill", skill: "fishing", level: 50 }, { type: "Skill", skill: "farming", level: 40 }, { type: "Skill", skill: "prayer", level: 47 }, { type: "Skill", skill: "slayer", level: 42 }, { type: "Quest", quest: "Zogre Flesh Eaters" }, { type: "Quest", quest: "Priest in Peril" }] },
    { id: 1092, name: "Rune Mysteries", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1093, name: "Scorpion Catcher", difficulty: "Intermediate", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "prayer", level: 31 }] },
    { id: 1094, name: "Sea Slug", difficulty: "Intermediate", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "firemaking", level: 30 }] },
    { id: 1095, name: "Shades of Mort'ton", difficulty: "Intermediate", length: "Short", qp: 3, requirements: [{ type: "Skill", skill: "crafting", level: 20 }, { type: "Skill", skill: "herblore", level: 15 }, { type: "Skill", skill: "firemaking", level: 5 }, { type: "Quest", quest: "Priest in Peril" }] },
    { id: 1096, name: "Shadow of the Storm", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "crafting", level: 30 }, { type: "Quest", quest: "Demon Slayer" }, { type: "Quest", quest: "The Golem" }] },
    { id: 1097, name: "Sheep Herder", difficulty: "Novice", length: "Short", qp: 4, requirements: [] },
    { id: 1098, name: "Sheep Shearer", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1099, name: "Shield of Arrav", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1100, name: "Shilo Village", difficulty: "Experienced", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "crafting", level: 20 }, { type: "Skill", skill: "agility", level: 32 }, { type: "Quest", quest: "Jungle Potion" }] },
    { id: 1101, name: "The Slug Menace", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "crafting", level: 30 }, { type: "Skill", skill: "runecraft", level: 30 }, { type: "Skill", skill: "slayer", level: 30 }, { type: "Skill", skill: "thieving", level: 30 }, { type: "Quest", quest: "Sea Slug" }, { type: "Quest", quest: "Wanted!" }] },
    { id: 1102, name: "A Soul's Bane", difficulty: "Novice", length: "Medium", qp: 1, requirements: [] },
    { id: 1103, name: "Spirits of the Elid", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "magic", level: 33 }, { type: "Skill", skill: "ranged", level: 37 }, { type: "Skill", skill: "mining", level: 37 }, { type: "Skill", skill: "thieving", level: 37 }] },
    { id: 1104, name: "Swan Song", difficulty: "Master", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "magic", level: 66 }, { type: "Skill", skill: "cooking", level: 62 }, { type: "Skill", skill: "fishing", level: 62 }, { type: "Skill", skill: "smithing", level: 45 }, { type: "Skill", skill: "firemaking", level: 42 }, { type: "Skill", skill: "crafting", level: 40 }, { type: "Quest", quest: "One Small Favour" }, { type: "Quest", quest: "Garden of Tranquility" }] },
    { id: 1105, name: "Tai Bwo Wannai Trio", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "agility", level: 15 }, { type: "Skill", skill: "firemaking", level: 30 }, { type: "Skill", skill: "cooking", level: 30 }, { type: "Skill", skill: "fishing", level: 5 }, { type: "Quest", quest: "Jungle Potion" }] },
    { id: 1106, name: "A Tail of Two Cats", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Quest", quest: "Icthlarin's Little Helper" }] },
    { id: 1107, name: "Tears of Guthix", difficulty: "Intermediate", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "firemaking", level: 49 }, { type: "Skill", skill: "crafting", level: 20 }, { type: "Skill", skill: "mining", level: 20 }] },
    { id: 1108, name: "Temple of Ikov", difficulty: "Experienced", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "thieving", level: 42 }, { type: "Skill", skill: "ranged", level: 40 }] },
    { id: 1109, name: "Throne of Miscellania", difficulty: "Experienced", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "woodcutting", level: 45 }, { type: "Skill", skill: "farming", level: 10 }, { type: "Skill", skill: "herblore", level: 35 }, { type: "Skill", skill: "mining", level: 30 }, { type: "Skill", skill: "fishing", level: 35 }, { type: "Quest", quest: "The Fremennik Trials" }, { type: "Quest", quest: "Heroes' Quest" }] },
    { id: 1110, name: "The Tourist Trap", difficulty: "Intermediate", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "fletching", level: 10 }, { type: "Skill", skill: "smithing", level: 20 }] },
    { id: 1111, name: "Tower of Life", difficulty: "Novice", length: "Short", qp: 2, requirements: [{ type: "Skill", skill: "construction", level: 10 }] },
    { id: 1112, name: "Tree Gnome Village", difficulty: "Intermediate", length: "Short", qp: 2, requirements: [] },
    { id: 1113, name: "Tribal Totem", difficulty: "Intermediate", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "thieving", level: 21 }] },
    { id: 1114, name: "Troll Romance", difficulty: "Experienced", length: "Medium", qp: 2, requirements: [{ type: "Skill", skill: "agility", level: 28 }, { type: "Quest", quest: "Troll Stronghold" }] },
    { id: 1115, name: "Troll Stronghold", difficulty: "Experienced", length: "Short", qp: 1, requirements: [{ type: "Skill", skill: "agility", level: 15 }, { type: "Quest", quest: "Death Plateau" }] },
    { id: 1116, name: "Underground Pass", difficulty: "Experienced", length: "Long", qp: 5, requirements: [{ type: "Skill", skill: "ranged", level: 25 }, { type: "Quest", quest: "Biohazard" }] },
    { id: 1117, name: "Vampire Slayer", difficulty: "Novice", length: "Short", qp: 3, requirements: [] },
    { id: 1118, name: "Wanted!", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Quest", quest: "Recruitment Drive" }, { type: "Quest", quest: "The Lost Tribe" }, { type: "Quest", quest: "Priest in Peril" }] },
    { id: 1119, name: "Watchtower", difficulty: "Experienced", length: "Long", qp: 4, requirements: [{ type: "Skill", skill: "magic", level: 14 }, { type: "Skill", skill: "thieving", level: 15 }, { type: "Skill", skill: "agility", level: 25 }, { type: "Skill", skill: "herblore", level: 14 }, { type: "Skill", skill: "mining", level: 40 }] },
    { id: 1120, name: "Waterfall Quest", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [] },
    { id: 1121, name: "What Lies Below", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "runecraft", level: 35 }] },
    { id: 1122, name: "Witch's House", difficulty: "Intermediate", length: "Short", qp: 4, requirements: [] },
    { id: 1123, name: "Witch's Potion", difficulty: "Novice", length: "Short", qp: 1, requirements: [] },
    { id: 1124, name: "Zogre Flesh Eaters", difficulty: "Intermediate", length: "Medium", qp: 1, requirements: [{ type: "Skill", skill: "smithing", level: 4 }, { type: "Skill", skill: "herblore", level: 8 }, { type: "Skill", skill: "strength", level: 20 }, { type: "Skill", skill: "fletching", level: 30 }, { type: "Skill", skill: "ranged", level: 30 }, { type: "Quest", quest: "Big Chompy Bird Hunting" }, { type: "Quest", quest: "Jungle Potion" }] },

    // Modern Quests (Manual Additions for Completeness)
    { id: 1200, name: "Song of the Elves", difficulty: "Grandmaster", length: "Very Long", qp: 4, requirements: [{ type: "Skill", skill: "agility", level: 70 }, { type: "Skill", skill: "construction", level: 70 }, { type: "Skill", skill: "farming", level: 70 }, { type: "Skill", skill: "herblore", level: 70 }, { type: "Skill", skill: "hunter", level: 70 }, { type: "Skill", skill: "mining", level: 70 }, { type: "Skill", skill: "smithing", level: 70 }, { type: "Skill", skill: "woodcutting", level: 70 }, { type: "Quest", quest: "Mourning's End Part II" }] },
    { id: 1201, name: "Sins of the Father", difficulty: "Master", length: "Long", qp: 2, requirements: [{ type: "Skill", skill: "woodcutting", level: 62 }, { type: "Skill", skill: "fletching", level: 60 }, { type: "Skill", skill: "crafting", level: 56 }, { type: "Skill", skill: "magic", level: 52 }, { type: "Skill", skill: "slayer", level: 50 }, { type: "Quest", quest: "A Taste of Hope" }, { type: "Quest", quest: "Vampire Slayer" }] },
    { id: 1202, name: "Monkey Madness II", difficulty: "Grandmaster", length: "Very Long", qp: 4, requirements: [{ type: "Skill", skill: "slayer", level: 69 }, { type: "Skill", skill: "crafting", level: 70 }, { type: "Skill", skill: "hunter", level: 60 }, { type: "Skill", skill: "agility", level: 55 }, { type: "Skill", skill: "thieving", level: 55 }, { type: "Skill", skill: "firemaking", level: 60 }, { type: "Quest", quest: "Monkey Madness I" }, { type: "Quest", quest: "Enlightened Journey" }] },

];

// Mock Data - Ardougne Diary (Preserved)
export const DIARIES: DiaryTask[] = [
    {
        id: 101,
        name: "Ardougne Easy",
        region: "Ardougne",
        tier: "Easy",
        requirements: [
            { type: "Skill", skill: "thieving", level: 5 },
            { type: "Quest", quest: "Rune Mysteries" },
            { type: "Quest", quest: "Biohazard" }
        ]
    },
    {
        id: 102,
        name: "Ardougne Medium",
        region: "Ardougne",
        tier: "Medium",
        requirements: [
            { type: "Skill", skill: "agility", level: 39 },
            { type: "Skill", skill: "thieving", level: 38 },
            { type: "Skill", skill: "farming", level: 36 },
            { type: "Skill", skill: "firemaking", level: 50 },
            { type: "Skill", skill: "magic", level: 51 },
            { type: "Quest", quest: "Underground Pass" },
            { type: "Quest", quest: "Watchtower" },
            { type: "Quest", quest: "The Hand in the Sand" }
        ]
    },
    {
        id: 103,
        name: "Ardougne Hard",
        region: "Ardougne",
        tier: "Hard",
        requirements: [
            { type: "Skill", skill: "agility", level: 65 },
            { type: "Skill", skill: "thieving", level: 72 },
            { type: "Skill", skill: "farming", level: 70 },
            { type: "Skill", skill: "hunter", level: 59 },
            { type: "Skill", skill: "magic", level: 66 },
            { type: "Skill", skill: "smithing", level: 68 },
            { type: "Skill", skill: "mining", level: 52 },
            { type: "Quest", quest: "Monkey Madness I" },
            { type: "Quest", quest: "Legends' Quest" },
            { type: "Quest", quest: "Mourning's End Part I" }
        ]
    },
    {
        id: 104,
        name: "Ardougne Elite",
        region: "Ardougne",
        tier: "Elite",
        requirements: [
            { type: "Skill", skill: "agility", level: 90 },
            { type: "Skill", skill: "thieving", level: 82 },
            { type: "Skill", skill: "farming", level: 85 },
            { type: "Skill", skill: "fishing", level: 81 },
            { type: "Skill", skill: "cooking", level: 91 },
            { type: "Skill", skill: "fletching", level: 69 },
            { type: "Quest", quest: "Desert Treasure I" },
            { type: "Quest", quest: "Mourning's End Part II" }
        ]
    }
];
