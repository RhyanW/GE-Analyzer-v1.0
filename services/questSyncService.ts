export interface SyncedQuestData {
    username: string;
    completed_quests: string[];
    last_updated: number;
}

const API_BASE_URL = 'http://localhost:4000/api'; // Placeholder for local backend

export const fetchSyncedQuests = async (username: string): Promise<string[] | null> => {
    try {
        // In a real scenario, this fetches from the backend
        // const response = await fetch(`${API_BASE_URL}/player/${username}/quests`);
        // if (!response.ok) return null;
        // const data: SyncedQuestData = await response.json();
        // return data.completed_quests;

        // MOCK BEHAVIOR
        // Simulate a delay and return null to force 'local storage' fallback for now
        // Or simulate data if specific username is used for testing
        await new Promise(resolve => setTimeout(resolve, 500));

        if (username.toLowerCase() === 'synctest') {
            return ["Cook's Assistant", "Dragon Slayer I", "Recipe for Disaster"];
        }

        return null; // No synced data found
    } catch (error) {
        console.error("Failed to fetch synced quests:", error);
        return null;
    }
};
