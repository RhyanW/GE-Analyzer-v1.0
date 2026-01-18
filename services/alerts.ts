import { PriceAlert, AlertType, AlertCategory, CompletedFlip } from '../types';

const STORAGE_KEY = 'osrs_price_alerts';
const SETTINGS_KEY = 'osrs_alert_settings';
const HISTORY_KEY = 'osrs_flip_history';

export interface AlertSettings {
    enableSound: boolean;
    webhookUrl: string;
}

export const getAlertSettings = (): AlertSettings => {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : { enableSound: true, webhookUrl: '' };
};

export const saveAlertSettings = (settings: AlertSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const getAlerts = (): PriceAlert[] => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveAlerts = (alerts: PriceAlert[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
    // Dispatch a custom event to notify other components
    window.dispatchEvent(new Event('priceAlertsUpdated'));
};

export const addAlert = (alert: Omit<PriceAlert, 'createdAt' | 'isNotified'>) => {
    const alerts = getAlerts();
    const newAlert: PriceAlert = {
        ...alert,
        isNotified: false,
        createdAt: Date.now(),
        sparklineData: []
    };
    saveAlerts([...alerts, newAlert]);
};

export const updateAlertSparkline = (itemId: number, price: number) => {
    const alerts = getAlerts();
    let changed = false;
    alerts.forEach(a => {
        if (a.id === itemId && !a.isNotified) {
            if (!a.sparklineData) a.sparklineData = [];
            a.sparklineData.push(price);
            if (a.sparklineData.length > 20) a.sparklineData.shift();
            changed = true;
        }
    });
    if (changed) saveAlerts(alerts);
};

export const removeAlert = (itemId: number, targetPrice: number) => {
    const alerts = getAlerts();
    saveAlerts(alerts.filter(a => !(a.id === itemId && a.targetPrice === targetPrice)));
};

// Flip History Management
export const getFlipHistory = (): CompletedFlip[] => {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
};

export const saveFlipHistory = (history: CompletedFlip[]) => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    window.dispatchEvent(new CustomEvent('flipHistoryUpdated'));
};

export const addCompletedFlip = (flip: Omit<CompletedFlip, 'timestamp'>) => {
    const history = getFlipHistory();
    const newFlip: CompletedFlip = { ...flip, timestamp: Date.now() };
    saveFlipHistory([newFlip, ...history].slice(0, 100)); // Keep last 100 flips
};

export const clearFlipHistory = () => {
    saveFlipHistory([]);
};

export const markAsNotified = (itemId: number, targetPrice: number) => {
    const alerts = getAlerts();
    const index = alerts.findIndex(a => a.id === itemId && a.targetPrice === targetPrice);
    if (index !== -1) {
        alerts[index].isNotified = true;
        saveAlerts(alerts);
    }
};

export const clearNotified = () => {
    const alerts = getAlerts();
    saveAlerts(alerts.filter(a => !a.isNotified));
};

export const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const sendNotification = (title: string, body: string) => {
    const settings = getAlertSettings();

    if (Notification.permission === 'granted') {
        new Notification(title, {
            body,
            icon: 'https://oldschool.runescape.wiki/images/Bank_interface.png'
        });
    }

    if (settings.enableSound) {
        playTriggerSound();
    }

    if (settings.webhookUrl) {
        triggerWebhook(settings.webhookUrl, title, body);
    }
};

const playTriggerSound = () => {
    // OSRS GE sound or similar chime
    const audio = new Audio('https://www.soundboard.com/handler/DownLoadTrack.ashx?cliptoken=35064_1603593'); // GE Pin Entry or similar chime
    audio.volume = 0.5;
    audio.play().catch(e => console.error("Sound play failed:", e));
};

const triggerWebhook = async (url: string, title: string, body: string) => {
    try {
        await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: `**${title}**\n${body}`
            })
        });
    } catch (e) {
        console.error("Webhook failed:", e);
    }
};
