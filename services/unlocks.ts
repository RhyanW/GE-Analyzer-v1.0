import { SlotType } from '../types';

export interface UnlockDefinition {
    id: number;
    name: string;
    slot: SlotType;
    icon: string;
    wiki_url?: string;
}

export const UNLOCKS: UnlockDefinition[] = [
    // Capes
    { id: 6570, name: 'Fire Cape', slot: SlotType.CAPE, icon: 'https://static.runelite.net/cache/item/icon/6570.png' },
    { id: 21295, name: 'Infernal Cape', slot: SlotType.CAPE, icon: 'https://static.runelite.net/cache/item/icon/21295.png' },
    { id: 21795, name: 'Imbued God Cape', slot: SlotType.CAPE, icon: 'https://static.runelite.net/cache/item/icon/21795.png' },
    { id: 2412, name: 'Saradomin Cape', slot: SlotType.CAPE, icon: 'https://static.runelite.net/cache/item/icon/2412.png' }, // God cape standard

    // Bodies
    { id: 10551, name: 'Fighter Torso', slot: SlotType.BODY, icon: 'https://static.runelite.net/cache/item/icon/10551.png' },

    // Shields
    { id: 8850, name: 'Rune Defender', slot: SlotType.SHIELD, icon: 'https://static.runelite.net/cache/item/icon/8850.png' },
    { id: 12954, name: 'Dragon Defender', slot: SlotType.SHIELD, icon: 'https://static.runelite.net/cache/item/icon/12954.png' },

    // Gloves
    { id: 7462, name: 'Barrows Gloves', slot: SlotType.HANDS, icon: 'https://static.runelite.net/cache/item/icon/7462.png' },

    // Void
    { id: 8839, name: 'Void Knight Top', slot: SlotType.BODY, icon: 'https://static.runelite.net/cache/item/icon/8839.png' },
    { id: 8840, name: 'Void Knight Robe', slot: SlotType.LEGS, icon: 'https://static.runelite.net/cache/item/icon/8840.png' },
    { id: 8842, name: 'Void Knight Gloves', slot: SlotType.HANDS, icon: 'https://static.runelite.net/cache/item/icon/8842.png' },
    { id: 11665, name: 'Void Melee Helm', slot: SlotType.HEAD, icon: 'https://static.runelite.net/cache/item/icon/11665.png' },
    { id: 11664, name: 'Void Ranger Helm', slot: SlotType.HEAD, icon: 'https://static.runelite.net/cache/item/icon/11664.png' },
    { id: 11663, name: 'Void Mage Helm', slot: SlotType.HEAD, icon: 'https://static.runelite.net/cache/item/icon/11663.png' }
];
