
import { analyzeMarket } from './services/market';
import { MembershipStatus, RiskLevel, StrategyType } from './types';

async function debugItem() {
    const settings = {
        budget: 1000000000,
        membership: MembershipStatus.P2P,
        risk: RiskLevel.MEDIUM,
        strategy: StrategyType.FLIPPING,
        itemName: 'Contract of oathplate acquisition',
        resultCount: 10
    };

    try {
        const result = await analyzeMarket(settings);
        console.log("Found Items:", result.parsedItems.length);
        result.parsedItems.forEach(item => {
            console.log(`Item: ${item.name}`);
            console.log(`- Limit: ${item.limit}`);
            console.log(`- 24h Volume: ${item.volume}`);
            console.log(`- ROI: ${item.roi?.toFixed(2)}%`);
            console.log(`- Profit: ${item.profit}`);
        });
    } catch (e) {
        console.error(e);
    }
}

debugItem();
