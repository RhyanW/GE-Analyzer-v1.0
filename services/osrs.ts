import { PriceHistoryPoint } from '../types';

/**
 * Service to interact with OSRS HiScores and calculate XP.
 * Uses CORS proxies to bypass restrictions for the client-side demo.
 */

export interface PlayerStats {
  magic: {
    rank: number;
    level: number;
    xp: number;
  };
}

// Cumulative XP required for each level (1-99+)
const XP_TABLE = [
  0, 0, 83, 174, 276, 388, 512, 650, 801, 969, 1154, 1358, 1584, 1833, 2107, 2411, 2746, 3115, 3523,
  3973, 4470, 5018, 5624, 6291, 7028, 7842, 8740, 9730, 10824, 12031, 13363, 14833, 16456, 18247,
  20224, 22406, 24815, 27473, 30408, 33648, 37224, 41171, 45529, 50339, 55649, 61512, 67983, 75127,
  83014, 91721, 101333, 111945, 123660, 136594, 150872, 166636, 184040, 203254, 224466, 247886,
  273742, 302288, 333804, 368599, 407015, 449428, 496254, 547953, 605032, 668051, 737627, 814445,
  899257, 992895, 1096278, 1210421, 1336443, 1475581, 1629200, 1798808, 1986068, 2192818, 2421087,
  2673114, 2951373, 3258594, 3597792, 3972294, 4385776, 4842295, 5346332, 5902831, 6517253, 7195629,
  7944614, 8771558, 9684577, 10692629, 11805606, 13034431
];

export const getXpForLevel = (level: number): number => {
  if (level >= 100) return 14391160; 
  return XP_TABLE[level];
};

export const getNextLevelXp = (currentLevel: number): number => {
  if (currentLevel >= 99) return 0;
  return XP_TABLE[currentLevel + 1];
};

/**
 * Parses the CSV response from OSRS API
 */
const parseStatsCsv = (csv: string): PlayerStats => {
    const lines = csv.split('\n');
    if (lines.length < 8) {
      // OSRS API returns a short string like "Page not found" if user doesn't exist
      throw new Error("Invalid response format from OSRS API");
    }

    // OSRS Lite API Order:
    // 0: Overall, 1: Attack, 2: Defence, 3: Strength, 4: Hitpoints, 
    // 5: Ranged, 6: Prayer, 7: Magic
    const magicLine = lines[7];
    const parts = magicLine.split(',');
    
    if (parts.length < 3) throw new Error("Could not parse Magic stats");

    const [rank, level, xp] = parts.map((val: string) => parseInt(val, 10));

    // If unranked, it might return -1
    if (level === -1) {
       return { magic: { rank: -1, level: 1, xp: 0 } };
    }

    return {
      magic: {
        rank,
        level,
        xp
      }
    };
};

export const getPlayerStats = async (username: string): Promise<PlayerStats> => {
  const encodedUser = encodeURIComponent(username);
  const targetUrl = `https://secure.runescape.com/m=hiscore_oldschool/index_lite.ws?player=${encodedUser}`;
  let lastError;

  // Attempt 1: corsproxy.io (Usually faster/more reliable for raw text)
  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl);
    
    if (response.ok) {
        const csv = await response.text();
        // Check for 404 text disguised as 200 OK from proxy
        if (csv.includes("404 - Page not found")) {
            throw new Error("User not found");
        }
        return parseStatsCsv(csv);
    }
  } catch (err) {
    console.warn("Primary proxy (corsproxy.io) failed, trying backup...", err);
    lastError = err;
  }

  // Attempt 2: allorigins.win (Backup)
  try {
     const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;
     const response = await fetch(proxyUrl);
     
     if (response.ok) {
        const data = await response.json();
        if (data.contents) {
            return parseStatsCsv(data.contents);
        }
     }
  } catch (err) {
    console.warn("Backup proxy (allorigins) failed", err);
    lastError = err;
  }

  throw lastError || new Error("Could not fetch OSRS stats. The Highscores API might be down or the username is incorrect.");
};

const PROXY_URL = 'https://corsproxy.io/?';

export const getItemPriceHistory = async (itemId: number): Promise<PriceHistoryPoint[]> => {
  const url = `https://prices.runescape.wiki/api/v1/osrs/timeseries?timestep=6h&id=${itemId}`;
  const proxyUrl = `${PROXY_URL}${encodeURIComponent(url)}`;
  
  try {
    const response = await fetch(proxyUrl);
    if (!response.ok) return [];
    
    const json = await response.json();
    if (!json.data) return [];
    
    return json.data.map((entry: any) => ({
      timestamp: entry.timestamp,
      avgHighPrice: entry.avgHighPrice,
      avgLowPrice: entry.avgLowPrice,
      volume: (entry.highPriceVolume || 0) + (entry.lowPriceVolume || 0)
    }));
  } catch (e) {
    console.error("Failed to fetch price history", e);
    return [];
  }
};
