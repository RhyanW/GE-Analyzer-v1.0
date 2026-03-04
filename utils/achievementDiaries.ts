import { PlayerStats } from '../services/osrs';

export interface SkillRequirements {
    attack?: number;
    defence?: number;
    strength?: number;
    hitpoints?: number;
    ranged?: number;
    prayer?: number;
    magic?: number;
    cooking?: number;
    woodcutting?: number;
    fletching?: number;
    fishing?: number;
    firemaking?: number;
    crafting?: number;
    smithing?: number;
    mining?: number;
    herblore?: number;
    agility?: number;
    thieving?: number;
    slayer?: number;
    farming?: number;
    runecraft?: number;
    hunter?: number;
    construction?: number;
}

export type DiaryTier = 'Easy' | 'Medium' | 'Hard' | 'Elite';

export interface DiaryRequirements {
    tier: DiaryTier;
    skills: SkillRequirements;
}

export interface RegionDiary {
    region: string;
    tiers: DiaryRequirements[];
}

// Complete OSRS Achievement Diary Skill Requirements
export const achievementDiaries: RegionDiary[] = [
    {
        region: 'Ardougne',
        tiers: [
            { tier: 'Easy', skills: { thieving: 5 } },
            { tier: 'Medium', skills: { agility: 39, thieving: 38, farming: 31, strength: 38, magic: 51 } },
            { tier: 'Hard', skills: { agility: 56, cooking: 53, crafting: 50, farming: 70, fletching: 5, hunter: 59, magic: 66, mining: 52, runecraft: 54, smithing: 68, thieving: 72, woodcutting: 50 } },
            { tier: 'Elite', skills: { agility: 90, cooking: 91, crafting: 35, farming: 85, firemaking: 50, fletching: 81, magic: 94, runecraft: 65, smithing: 91, thieving: 82, woodcutting: 75 } }
        ]
    },
    {
        region: 'Desert',
        tiers: [
            { tier: 'Easy', skills: { hunter: 5, thieving: 21 } },
            { tier: 'Medium', skills: { agility: 30, crafting: 20, firemaking: 20, hunter: 47, magic: 21, mining: 37, slayer: 22, smithing: 20, thieving: 25 } },
            { tier: 'Hard', skills: { agility: 50, fletching: 10, magic: 68, slayer: 65, smithing: 68, thieving: 53, woodcutting: 35 } },
            { tier: 'Elite', skills: { agility: 85, construction: 78, cooking: 85, crafting: 61, firemaking: 60, fletching: 95, magic: 94, prayer: 85, runecraft: 49, slayer: 93, smithing: 10, thieving: 91 } }
        ]
    },
    {
        region: 'Falador',
        tiers: [
            { tier: 'Easy', skills: { agility: 5, construction: 16, mining: 10, smithing: 13 } },
            { tier: 'Medium', skills: { agility: 42, cooking: 20, crafting: 40, defence: 10, farming: 23, firemaking: 49, magic: 37, mining: 42, prayer: 10, ranged: 19, slayer: 12, thieving: 40, woodcutting: 30 } },
            { tier: 'Hard', skills: { agility: 59, crafting: 31, defence: 50, farming: 71, fishing: 53, herblore: 52, mining: 60, prayer: 70, runecraft: 56, slayer: 72, thieving: 58, woodcutting: 71 } },
            { tier: 'Elite', skills: { agility: 80, farming: 91, herblore: 81, runecraft: 88, woodcutting: 75 } }
        ]
    },
    {
        region: 'Fremennik',
        tiers: [
            { tier: 'Easy', skills: { crafting: 23, firemaking: 15, hunter: 11, mining: 20, smithing: 20, thieving: 5, woodcutting: 15 } },
            { tier: 'Medium', skills: { agility: 35, crafting: 46, defence: 30, farming: 33, hunter: 27, mining: 40, slayer: 47, smithing: 50, thieving: 42, woodcutting: 56 } },
            { tier: 'Hard', skills: { agility: 60, crafting: 61, defence: 40, firemaking: 49, herblore: 66, hunter: 55, magic: 72, mining: 70, smithing: 60, thieving: 75, woodcutting: 56 } },
            { tier: 'Elite', skills: { agility: 80, crafting: 80, fletching: 81, hitpoints: 70, ranged: 70, runecraft: 82, slayer: 83, strength: 70 } }
        ]
    },
    {
        region: 'Kandarin',
        tiers: [
            { tier: 'Easy', skills: { agility: 20, farming: 13, fishing: 16 } },
            { tier: 'Medium', skills: { agility: 36, cooking: 43, farming: 26, fishing: 46, fletching: 50, herblore: 48, magic: 56, mining: 30, ranged: 40, strength: 22, thieving: 47 } },
            { tier: 'Hard', skills: { agility: 60, construction: 50, crafting: 10, defence: 70, firemaking: 65, fishing: 70, fletching: 70, magic: 56, ranged: 70, smithing: 75, strength: 50, woodcutting: 60 } },
            { tier: 'Elite', skills: { agility: 60, cooking: 80, farming: 85, firemaking: 85, fishing: 38, fletching: 85, herblore: 86, magic: 87, smithing: 90 } }
        ]
    },
    {
        region: 'Karamja',
        tiers: [
            { tier: 'Easy', skills: { agility: 15, mining: 40 } },
            { tier: 'Medium', skills: { agility: 36, farming: 16, fishing: 65, hunter: 41, mining: 40, woodcutting: 50 } },
            { tier: 'Hard', skills: { agility: 53, cooking: 30, magic: 59, ranged: 42, runecraft: 44, slayer: 50, smithing: 40, thieving: 50, woodcutting: 34 } },
            { tier: 'Elite', skills: { farming: 72, herblore: 87, runecraft: 91 } }
        ]
    },
    {
        region: 'Kourend & Kebos',
        tiers: [
            { tier: 'Easy', skills: { construction: 25, fishing: 20, hunter: 12, mining: 15, thieving: 25 } },
            { tier: 'Medium', skills: { agility: 49, crafting: 30, farming: 65, firemaking: 50, fishing: 43, hunter: 53, mining: 42, woodcutting: 50 } },
            { tier: 'Hard', skills: { farming: 74, magic: 66, mining: 65, slayer: 65, smithing: 70, thieving: 49, woodcutting: 60 } },
            { tier: 'Elite', skills: { cooking: 84, crafting: 77, farming: 85, fishing: 82, fletching: 40, runecraft: 77, slayer: 95, woodcutting: 90 } }
        ]
    },
    {
        region: 'Lumbridge & Draynor',
        tiers: [
            { tier: 'Easy', skills: { agility: 10, firemaking: 15, mining: 15, runecraft: 5, woodcutting: 15 } },
            { tier: 'Medium', skills: { agility: 20, crafting: 38, fishing: 30, hunter: 50, magic: 31, ranged: 50, strength: 19, thieving: 38 } },
            { tier: 'Hard', skills: { agility: 46, crafting: 70, farming: 63, firemaking: 65, magic: 60, prayer: 52, runecraft: 59, woodcutting: 57 } },
            { tier: 'Elite', skills: { agility: 70, runecraft: 76, smithing: 88, thieving: 78, woodcutting: 75 } }
        ]
    },
    {
        region: 'Morytania',
        tiers: [
            { tier: 'Easy', skills: { cooking: 12, crafting: 15, runecraft: 15, slayer: 15 } },
            { tier: 'Medium', skills: { agility: 42, construction: 50, cooking: 40, farming: 36, fishing: 50, herblore: 22, hunter: 29, slayer: 42, smithing: 50, woodcutting: 45 } },
            { tier: 'Hard', skills: { agility: 71, construction: 50, defence: 70, farming: 53, firemaking: 50, magic: 66, mining: 55, prayer: 70, slayer: 58, smithing: 50, thieving: 72, woodcutting: 50 } },
            { tier: 'Elite', skills: { attack: 70, crafting: 84, defence: 70, firemaking: 80, fishing: 96, magic: 83, ranged: 70, runecraft: 91, slayer: 85, strength: 70 } }
        ]
    },
    {
        region: 'Western Provinces',
        tiers: [
            { tier: 'Easy', skills: { fletching: 20, hunter: 9, mining: 15, ranged: 30 } },
            { tier: 'Medium', skills: { agility: 37, construction: 31, cooking: 42, farming: 30, firemaking: 35, fishing: 46, hunter: 31, mining: 40, woodcutting: 35 } },
            { tier: 'Hard', skills: { construction: 65, cooking: 70, farming: 68, firemaking: 65, fishing: 62, fletching: 5, hunter: 69, magic: 64, mining: 70, ranged: 70, smithing: 68, thieving: 75, woodcutting: 50 } },
            { tier: 'Elite', skills: { agility: 85, defence: 42, farming: 75, fletching: 85, hitpoints: 42, magic: 42, prayer: 42, ranged: 42, slayer: 93, strength: 42, thieving: 85 } }
        ]
    },
    {
        region: 'Wilderness',
        tiers: [
            { tier: 'Easy', skills: { agility: 15, magic: 21, mining: 15 } },
            { tier: 'Medium', skills: { agility: 60, magic: 60, mining: 55, slayer: 50, smithing: 50, woodcutting: 61 } },
            { tier: 'Hard', skills: { agility: 64, fishing: 53, hunter: 67, magic: 66, slayer: 68, smithing: 75 } },
            { tier: 'Elite', skills: { agility: 60, cooking: 90, firemaking: 75, fishing: 85, magic: 96, mining: 85, slayer: 83, smithing: 90, thieving: 84, woodcutting: 75 } }
        ]
    },
    {
        region: 'Varrock',
        tiers: [
            { tier: 'Easy', skills: { agility: 13, crafting: 8, fishing: 20, mining: 15, runecraft: 9, thieving: 5, woodcutting: 15 } },
            { tier: 'Medium', skills: { agility: 30, crafting: 36, farming: 30, firemaking: 40, herblore: 10, magic: 25, thieving: 25 } },
            { tier: 'Hard', skills: { agility: 51, construction: 50, farming: 68, firemaking: 60, hunter: 66, magic: 54, prayer: 52, runecraft: 44, thieving: 53, woodcutting: 60 } },
            { tier: 'Elite', skills: { agility: 48, cooking: 89, crafting: 66, fletching: 81, herblore: 90, magic: 86, runecraft: 78, smithing: 89 } }
        ]
    }
];

export const checkSkillRequirements = (playerStats: PlayerStats, requirements: SkillRequirements): { meets: boolean, missing: Record<string, number> } => {
    const missing: Record<string, number> = {};
    let meets = true;

    for (const [skill, requiredLevel] of Object.entries(requirements)) {
        // Ignore non-standard skills that might be logged accidentally from the data like "bonesToPeaches"
        const skillData = (playerStats as any)[skill];

        if (skillData && typeof skillData === 'object' && 'level' in skillData) {
            if (skillData.level < requiredLevel) {
                meets = false;
                missing[skill] = requiredLevel;
            }
        } else {
            // Handle skills not directly tracked in standard PlayerStats (like quest variables if we had them)
            // For simplicity, we assume missing skills are standard skills we failed to parse
        }
    }

    return { meets, missing };
};
