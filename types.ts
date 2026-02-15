export enum MembershipStatus {
  F2P = 'Free to Play',
  P2P = 'Pay to Play (Member)'
}

export enum RiskLevel {
  LOW = 'Low Risk (High Volume, Low Margin)',
  MEDIUM = 'Medium Risk (Balanced)',
  HIGH = 'High Risk (Volatile, High Margin)'
}

export enum StrategyType {
  FLIPPING = 'Merch / Flip',
  HIGH_ALCH = 'High Alchemy',
  PLAYER_LOOKUP = 'Player Lookup'
}

export enum AlertType {
  PRICE = 'Price Level',
  STOP_LOSS = 'Stop Loss',
  VOLUME = 'Volume Spike',
  PROFIT = 'Profit Target'
}

export enum AlertCategory {
  FLIPPING = 'Flipping',
  INVESTMENT = 'Investment',
  PANIC_SELL = 'Panic Sell',
  MISC = 'Misc'
}

export interface FlipSettings {
  budget: number;
  membership: MembershipStatus;
  risk: RiskLevel;
  strategy: StrategyType;
  itemName?: string;
  username?: string;
  resultCount: number;
}

export interface ParsedItem {
  id: number;
  name: string;
  buy: number;
  sell: number;
  profit: number;
  limit: number; // GE Buy Limit per 4 hours
  description?: string;
  trend?: 'UP' | 'DOWN' | 'STABLE'; // Recent price trend
  roi?: number;
  potentialProfit?: number; // profit * limit
  volume?: number; // Total 24h volume
  volumeHigh?: number; // Volume at high price (approx. aggressive buys)
  volumeLow?: number; // Volume at low price (approx. aggressive sells)
  hourlyProfit?: number; // Estimated profit per hour based on volume and limit
  buyRate?: number; // Estimated items bought per hour
  sellRate?: number; // Estimated items sold per hour
  guidePrice?: number; // Official GE Guide Price
}

export interface MarketResponseData {
  text: string; // General summary
  parsedItems: ParsedItem[];
}

export interface SkillData {
  rank: number;
  level: number;
  xp: number;
}

export interface PlayerStats {
  overall: SkillData;
  attack: SkillData;
  defence: SkillData;
  strength: SkillData;
  hitpoints: SkillData;
  ranged: SkillData;
  prayer: SkillData;
  magic: SkillData;
  cooking: SkillData;
  woodcutting: SkillData;
  fletching: SkillData;
  fishing: SkillData;
  firemaking: SkillData;
  crafting: SkillData;
  smithing: SkillData;
  mining: SkillData;
  herblore: SkillData;
  agility: SkillData;
  thieving: SkillData;
  slayer: SkillData;
  farming: SkillData;
  runecraft: SkillData;
  hunter: SkillData;
  construction: SkillData;
  sailing?: SkillData;
}

export interface PriceHistoryPoint {
  timestamp: number;
  avgHighPrice: number | null;
  avgLowPrice: number | null;
  volume: number;
  highPriceVolume?: number;
  lowPriceVolume?: number;
}

// Wiki API Types
export interface WikiItemMapping {
  id: number;
  name: string;
  members: boolean;
  limit?: number;
  value?: number; // Store price
  highalch?: number;
  lowalch?: number;
  icon?: string;
}

export interface WikiPriceData {
  high: number;
  highTime: number;
  low: number;
  lowTime: number;
}

export interface WikiLatestResponse {
  data: Record<string, WikiPriceData>;
}

export interface Wiki24hData {
  avgHighPrice: number | null;
  highPriceVolume: number;
  avgLowPrice: number | null;
  lowPriceVolume: number;
}

export interface Wiki24hResponse {
  data: Record<string, Wiki24hData>;
  timestamp: number;
}

export interface PriceAlert {
  id: number;
  name: string;
  targetPrice: number;
  initialPrice: number;
  priceType: 'buy' | 'sell';
  condition: 'above' | 'below';
  alertType: AlertType;
  category: AlertCategory;
  isNotified: boolean;
  createdAt: number;
  sparklineData?: number[]; // Recent price points
  linkedAlertId?: number; // For Profit Target pairs

  // Flip Tracking
  isTrackingFlip?: boolean;
  purchasePrice?: number;
  quantity?: number;
}

export interface CompletedFlip {
  id: number;
  name: string;
  purchasePrice: number;
  sellPrice: number;
  quantity: number;
  profit: number;
  roi: number;
  timestamp: number;
}

// Best in Slot Types

export enum CombatStyle {
  MELEE = 'Melee',
  RANGED = 'Ranged',
  MAGIC = 'Magic'
}

export enum AttackType {
  STAB = 'Stab',
  SLASH = 'Slash',
  CRUSH = 'Crush',
  MAGIC = 'Magic',
  RANGED = 'Ranged'
}

export enum CombatFocus {
  OFFENSE = 'Offense',
  DEFENCE = 'Defence'
}

export enum SlotType {
  HEAD = 'head',
  CAPE = 'cape',
  NECK = 'neck',
  AMMO = 'ammo',
  WEAPON = 'weapon',
  BODY = 'body',
  SHIELD = 'shield',
  LEGS = 'legs',
  HANDS = 'hands',
  FEET = 'feet',
  RING = 'ring',
  TWO_HANDED = '2h'
}

export interface EquipmentStats {
  attack_stab: number;
  attack_slash: number;
  attack_crush: number;
  attack_magic: number;
  attack_ranged: number;
  defence_stab: number;
  defence_slash: number;
  defence_crush: number;
  defence_magic: number;
  defence_ranged: number;
  melee_strength: number;
  ranged_strength: number;
  magic_damage: number;
  prayer: number;
}

export interface EquipableItem {
  id: number;
  name: string;
  slot: string;
  is2h?: boolean;
  stats: EquipmentStats;
  wiki_price?: number;
  wiki_url?: string;
  release_date?: string;
  requirements?: Record<string, number>;
  members: boolean;
  tradeable: boolean;
  equipable_by_player: boolean;
  icon?: string;
  attack_speed?: number; // Ticks (0.6s)
}

export interface BisSettings {
  combatStyle: CombatStyle;
  budget: number;
  statsFilter: Partial<EquipmentStats>;
}

export interface BisResult {
  items: Record<string, EquipableItem | null>;
  totalStats: EquipmentStats;
  totalCost: number;
  remainingBudget: number;
  maxHit: number;
}