import React, { useEffect, useState } from 'react';
import { getAlerts, markAsNotified, sendNotification, updateAlertSparkline } from '../services/alerts';
import { fetchLatestPrices } from '../services/market';
import { Bell } from 'lucide-react';
import { AlertType } from '../types';

const PriceAlertMonitor: React.FC = () => {
    const [activeCount, setActiveCount] = useState(0);
    const [lastCheck, setLastCheck] = useState<Date | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Broadcast status whenever it changes
    useEffect(() => {
        window.dispatchEvent(new CustomEvent('priceMonitorStatus', {
            detail: { activeCount, lastCheck }
        }));
    }, [activeCount, lastCheck]);

    const checkPrices = async () => {
        const alerts = getAlerts().filter(a => !a.isNotified);
        if (alerts.length === 0) {
            setActiveCount(0);
            return;
        }

        setActiveCount(alerts.length);
        setLastCheck(new Date());

        try {
            const pricesResponse = await fetchLatestPrices();
            const prices = pricesResponse.data;

            // Broadcast current prices for the sidebar to use
            window.dispatchEvent(new CustomEvent('priceUpdate', { detail: prices }));

            alerts.forEach(alert => {
                const itemPrice = prices[alert.id];
                if (!itemPrice) return;

                // Update sparkline data
                const livePrice = alert.priceType === 'buy' ? itemPrice.high : itemPrice.low;
                if (livePrice) {
                    updateAlertSparkline(alert.id, livePrice);
                }

                // For Buy alerts, we check the 'high' price (what users are buying at)
                // For Sell alerts, we check the 'low' price (what users are selling at)
                const currentPrice = alert.priceType === 'buy' ? itemPrice.high : itemPrice.low;

                if (!currentPrice) return;

                let triggered = false;

                // Advanced Logic based on AlertType
                if (alert.alertType === AlertType.STOP_LOSS) {
                    // Stop loss is usually "Below or Equal" for a long position (selling)
                    if (currentPrice <= alert.targetPrice) triggered = true;
                } else {
                    // Standard Price Level logic
                    if (alert.condition === 'above' && currentPrice >= alert.targetPrice) triggered = true;
                    else if (alert.condition === 'below' && currentPrice <= alert.targetPrice) triggered = true;
                }

                if (triggered) {
                    const alertTitle = alert.alertType === AlertType.STOP_LOSS ? '🚨 STOP LOSS TRIGGERED!' : 'Target Price Met!';
                    sendNotification(
                        alertTitle,
                        `${alert.name} (${alert.priceType}) is now ${currentPrice.toLocaleString()} GP (Target: ${alert.targetPrice.toLocaleString()})`
                    );
                    markAsNotified(alert.id, alert.targetPrice);
                }
            });
        } catch (error) {
            console.error('Failed to check prices for alerts:', error);
        }
    };

    useEffect(() => {
        // Initial check
        checkPrices();

        // Check every 60 seconds
        const interval = setInterval(checkPrices, 60000);

        // Listen for updates from other tabs/components
        window.addEventListener('priceAlertsUpdated', checkPrices);

        // Listen for sidebar toggle to hide floating UI
        const handleSidebarState = (e: any) => setIsSidebarOpen(e.detail.isOpen);
        window.addEventListener('sidebarState', handleSidebarState);

        return () => {
            clearInterval(interval);
            window.removeEventListener('priceAlertsUpdated', checkPrices);
            window.removeEventListener('sidebarState', handleSidebarState);
        };
    }, []);

    if (activeCount === 0 || isSidebarOpen) return null;

    return (
        <div className="fixed bottom-4 right-14 z-[100] bg-black/80 border border-osrs-gold rounded-lg p-3 shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="relative">
                <Bell className="w-5 h-5 text-osrs-gold animate-swing" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                    {activeCount}
                </span>
            </div>
            <div className="text-xs">
                <p className="text-osrs-yellow font-bold">Price Monitor Active</p>
                <p className="text-gray-400 text-[10px]">
                    Last check: {lastCheck?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) || 'Starting...'}
                </p>
            </div>
        </div>
    );
};

export default PriceAlertMonitor;
