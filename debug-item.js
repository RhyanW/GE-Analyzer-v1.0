import fs from 'fs';

const MAPPING_URL = 'https://prices.runescape.wiki/api/v1/osrs/mapping';

async function checkItem() {
    console.log("Fetching mapping...");
    try {
        const response = await fetch(MAPPING_URL, {
            headers: { 'User-Agent': 'OSRS-Flipper-Debug/1.0' }
        });
        const data = await response.json();

        const item = data.find(i => i.name.toLowerCase() === 'dragon nails');

        if (item) {
            console.log("Found Item:", item);

            // Fetch Price
            const priceUrl = `https://prices.runescape.wiki/api/v1/osrs/latest?id=${item.id}`;
            const priceRes = await fetch(priceUrl, { headers: { 'User-Agent': 'OSRS-Flipper-Debug/1.0' } });
            const priceData = await priceRes.json();
            console.log("Price Data:", priceData.data[item.id]);

            // Fetch Volume
            const volUrl = `https://prices.runescape.wiki/api/v1/osrs/24h?id=${item.id}`;
            const volRes = await fetch(volUrl, { headers: { 'User-Agent': 'OSRS-Flipper-Debug/1.0' } });
            const volData = await volRes.json();
            console.log("Volume Data:", volData.data[item.id]);

        } else {
            console.log("Item 'Dragon Nails' not found.");
        }

    } catch (e) {
        console.error("Error:", e);
    }
}

checkItem();
