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