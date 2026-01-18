import React, { useEffect, useState, useMemo } from 'react';
import { getAlerts, removeAlert, clearNotified, getAlertSettings, saveAlertSettings, AlertSettings, getFlipHistory, addCompletedFlip, clearFlipHistory } from '../services/alerts';
import { PriceAlert, WikiPriceData, AlertCategory, CompletedFlip } from '../types';
import { Bell, ChevronRight, ChevronLeft, X, Trash2, Search, Settings, Volume2, VolumeX, Link, Filter, TrendingUp, History, Download, Coins, DollarSign, Calculator, ShieldCheck, Target, Clock, ArrowRight } from 'lucide-react';

const formatCompactGP = (gp: number) => {
    if (gp >= 1000000000) return (gp / 1000000000).toFixed(2).replace(/\.00$/, '') + 'B';
    if (gp >= 1000000) return (gp / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
    if (gp >= 10000) return (gp / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
    return gp.toLocaleString();
};

const AlertSidebar: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
    const [alerts, setAlerts] = useState<PriceAlert[]>([]);
    const [history, setHistory] = useState<CompletedFlip[]>([]);
    const [prices, setPrices] = useState<Record<string, WikiPriceData>>({});
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<AlertCategory | 'All'>('All');
    const [showSettings, setShowSettings] = useState(false);
    const [settings, setSettings] = useState<AlertSettings>(getAlertSettings());
    const [monitorStatus, setMonitorStatus] = useState<{ activeCount: number, lastCheck: Date | null }>({ activeCount: 0, lastCheck: null });
    const [prevAlertCount, setPrevAlertCount] = useState(0);

    const refreshAlerts = () => {
        const newAlerts = getAlerts();
        setAlerts(newAlerts);
        setHistory(getFlipHistory());

        // Auto-pop logic: if alert count increased, open sidebar
        if (newAlerts.length > prevAlertCount) {
            setIsOpen(true);
            setActiveTab('active');
        }
        setPrevAlertCount(newAlerts.length);
    };

    const handleToggleSidebar = () => setIsOpen(!isOpen);

    useEffect(() => {
        window.dispatchEvent(new CustomEvent('sidebarState', { detail: { isOpen } }));
    }, [isOpen]);

    useEffect(() => {
        const initialAlerts = getAlerts();
        setAlerts(initialAlerts);
        setHistory(getFlipHistory());
        setPrevAlertCount(initialAlerts.length);

        window.addEventListener('priceAlertsUpdated', refreshAlerts);
        window.addEventListener('flipHistoryUpdated', refreshAlerts);

        const handlePriceUpdate = (e: any) => {
            setPrices(e.detail);
        };
        window.addEventListener('priceUpdate', handlePriceUpdate);

        const handleMonitorStatus = (e: any) => setMonitorStatus(e.detail);
        window.addEventListener('priceMonitorStatus', handleMonitorStatus);

        return () => {
            window.removeEventListener('priceAlertsUpdated', refreshAlerts);
            window.removeEventListener('flipHistoryUpdated', refreshAlerts);
            window.removeEventListener('priceUpdate', handlePriceUpdate);
            window.removeEventListener('priceMonitorStatus', handleMonitorStatus);
        };
    }, [prevAlertCount]);

    const filteredAlerts = useMemo(() => {
        return alerts.filter(alert => {
            const matchesSearch = alert.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = selectedCategory === 'All' || alert.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });
    }, [alerts, searchQuery, selectedCategory]);

    const activeAlerts = filteredAlerts.filter(a => !a.isNotified);
    const notifiedAlerts = filteredAlerts.filter(a => a.isNotified);

    const calculateProgress = (alert: PriceAlert) => {
        const priceData = prices[alert.id];
        if (!priceData) return 0;

        const currentPrice = alert.priceType === 'buy' ? priceData.high : priceData.low;
        if (!currentPrice) return 0;

        const totalRange = alert.targetPrice - alert.initialPrice;
        if (totalRange === 0) return (currentPrice >= alert.targetPrice) ? 100 : 0;

        const currentDiff = currentPrice - alert.initialPrice;
        const progress = (currentDiff / totalRange) * 100;

        return Math.min(100, Math.max(0, progress));
    };

    const getCurrentPrice = (alert: PriceAlert) => {
        const priceData = prices[alert.id];
        return alert.priceType === 'buy' ? priceData?.high : priceData?.low;
    };

    const calculateProfit = (alert: PriceAlert) => {
        if (!alert.isTrackingFlip || !alert.purchasePrice || !alert.quantity) return null;

        const current = getCurrentPrice(alert);
        if (!current) return null;

        // GE Tax calculation: 2% capped at 5M, exempt if < 50 GP
        let tax = 0;
        if (current >= 50) {
            tax = Math.min(Math.floor(current * 0.02), 5000000);
        }

        const netSalePrice = current - tax;
        const totalProfit = (netSalePrice - alert.purchasePrice) * alert.quantity;
        const roi = ((netSalePrice - alert.purchasePrice) / alert.purchasePrice) * 100;
        const breakEven = Math.ceil(alert.purchasePrice / 0.98); // Approximation including tax

        return { totalProfit, roi, breakEven, current };
    };

    const calculateDistance = (alert: PriceAlert) => {
        const current = getCurrentPrice(alert);
        if (!current) return null;

        const gpDiff = alert.targetPrice - current;
        const percentDiff = (gpDiff / current) * 100;

        // Is it "Hot"? within 1.0%
        const isHot = Math.abs(percentDiff) < 1.0;

        return { gpDiff, percentDiff, isHot };
    };

    const handleMarkAsSold = (alert: PriceAlert) => {
        const stats = calculateProfit(alert);
        if (!stats) return;

        addCompletedFlip({
            id: alert.id,
            name: alert.name,
            purchasePrice: alert.purchasePrice!,
            sellPrice: stats.current,
            quantity: alert.quantity!,
            profit: Math.floor(stats.totalProfit),
            roi: stats.roi
        });

        removeAlert(alert.id, alert.targetPrice);
    };

    const sessionProfit = useMemo(() => {
        return history.reduce((sum, flip) => sum + flip.profit, 0);
    }, [history]);

    const handleToggleSound = () => {
        const newSettings = { ...settings, enableSound: !settings.enableSound };
        setSettings(newSettings);
        saveAlertSettings(newSettings);
    };

    const handleWebhookChange = (val: string) => {
        const newSettings = { ...settings, webhookUrl: val };
        setSettings(newSettings);
        saveAlertSettings(newSettings);
    };

    if (alerts.length === 0 && history.length === 0) return null;

    return (
        <div className={`fixed right-0 top-[80px] bottom-0 z-40 flex transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%-40px)]'}`}>
            {/* Toggle Handle */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-10 flex flex-col items-center pt-8 bg-osrs-panel border-l-2 border-y-2 border-osrs-gold rounded-l-xl shadow-2xl group ${notifiedAlerts.length > 0 ? 'animate-pulse' : ''}`}
            >
                {isOpen ? (
                    <ChevronRight className="text-osrs-gold group-hover:scale-125 transition-transform" />
                ) : (
                    <>
                        <ChevronLeft className="text-osrs-gold group-hover:scale-125 transition-transform" />
                        <div className="relative mt-4">
                            <Bell className={`w-5 h-5 ${notifiedAlerts.length > 0 ? 'text-green-500 animate-bounce' : 'text-gray-500'}`} />
                            {alerts.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold px-1 rounded-full border border-black min-w-[14px]">
                                    {alerts.length}
                                </span>
                            )}
                        </div>
                        <div className="[writing-mode:vertical-lr] text-osrs-gold font-fantasy text-sm font-bold mt-6 uppercase tracking-[0.15em] drop-shadow-sm">
                            Market Watch
                        </div>
                    </>
                )}
            </button>

            {/* Sidebar Content */}
            <div className={`w-[320px] bg-osrs-bg border-l-2 border-osrs-gold flex flex-col shadow-2xl relative overflow-hidden`}>
                {/* Parchment Overlay Pattern */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/parchment.png')]" />

                {/* Header */}
                <div className="p-4 bg-osrs-panel border-b-2 border-osrs-gold flex items-center justify-between relative z-10">
                    <h3 className="text-osrs-gold font-fantasy text-lg flex items-center gap-2">
                        <Bell size={18} /> Market Watch
                    </h3>
                    <div className="flex items-center gap-2">
                        {!showSettings && (
                            <>
                                <button
                                    onClick={() => setActiveTab('active')}
                                    className={`p-1.5 rounded transition-colors ${activeTab === 'active' ? 'bg-osrs-gold text-black' : 'text-gray-500 hover:text-white'}`}
                                    title="Active Alerts"
                                >
                                    <TrendingUp size={16} />
                                </button>
                                <button
                                    onClick={() => setActiveTab('history')}
                                    className={`p-1.5 rounded transition-colors ${activeTab === 'history' ? 'bg-osrs-gold text-black' : 'text-gray-500 hover:text-white'}`}
                                    title="Flip History"
                                >
                                    <History size={16} />
                                </button>
                            </>
                        )}
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className={`p-1.5 rounded transition-colors ${showSettings ? 'bg-osrs-gold text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Settings size={16} />
                        </button>
                        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {showSettings ? (
                    <div className="flex-1 p-4 space-y-6 animate-in fade-in slide-in-from-right-4 duration-200">
                        <div className="space-y-4">
                            <h4 className="text-osrs-yellow font-bold text-sm border-b border-osrs-border pb-1">Alert Settings</h4>

                            <div className="flex justify-between items-center p-3 bg-black/40 rounded border border-white/5">
                                <div className="flex items-center gap-2">
                                    {settings.enableSound ? <Volume2 size={16} className="text-osrs-gold" /> : <VolumeX size={16} className="text-gray-500" />}
                                    <span className="text-sm font-bold">OSRS Sound Alerts</span>
                                </div>
                                <button
                                    onClick={handleToggleSound}
                                    className={`w-12 h-6 rounded-full relative transition-colors ${settings.enableSound ? 'bg-osrs-gold' : 'bg-gray-700'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.enableSound ? 'right-1' : 'left-1'}`} />
                                </button>
                            </div>

                            <div className="space-y-2 p-3 bg-black/40 rounded border border-white/5">
                                <div className="flex items-center gap-2 text-osrs-gold">
                                    <Link size={18} />
                                    <span className="text-sm font-bold">Discord/Webhook URL</span>
                                </div>
                                <input
                                    type="text"
                                    value={settings.webhookUrl}
                                    onChange={(e) => handleWebhookChange(e.target.value)}
                                    placeholder="https://discord.com/api/webhooks/..."
                                    className="w-full bg-black/60 border border-osrs-border rounded px-3 py-2 text-xs text-gray-300 outline-none focus:border-osrs-gold font-mono"
                                />
                                <p className="text-[10px] text-gray-500 italic">Sent when alerts trigger even if tab is backgrounded.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setShowSettings(false)}
                            className="w-full py-2 bg-osrs-border border border-osrs-gold/30 text-osrs-gold font-bold text-xs rounded hover:bg-osrs-gold hover:text-black transition-all"
                        >
                            Back to Alerts
                        </button>
                    </div>
                ) : activeTab === 'active' ? (
                    <>
                        {/* Search & Filters */}
                        <div className="p-3 bg-black/20 border-b border-osrs-border/30 space-y-3">
                            <div className="relative">
                                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-500" size={12} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search active watches..."
                                    className="w-full bg-black/40 border border-osrs-border rounded pl-8 pr-2 py-1.5 text-[11px] outline-none focus:border-osrs-gold"
                                />
                            </div>
                            <div className="flex gap-1 overflow-x-auto custom-scrollbar pb-1">
                                {['All', ...Object.values(AlertCategory)].map(cat => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat as any)}
                                        className={`px-3 py-1.5 rounded text-[11px] font-bold whitespace-nowrap transition-all border ${selectedCategory === cat ? 'bg-osrs-gold text-black border-osrs-gold' : 'border-white/5 text-gray-500 hover:text-white hover:bg-white/5'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Alerts List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                            {activeAlerts.length === 0 && searchQuery && (
                                <div className="text-center py-8 text-gray-600 italic text-xs">No items match "{searchQuery}"</div>
                            )}

                            {activeAlerts.length > 0 && (
                                <div className="space-y-4">
                                    <p className="text-[10px] text-osrs-orange uppercase font-bold tracking-widest px-1">Active Tracker</p>
                                    {activeAlerts.map((alert, i) => {
                                        const progress = calculateProgress(alert);
                                        const current = getCurrentPrice(alert);
                                        const profitStats = calculateProfit(alert);
                                        const distance = calculateDistance(alert);

                                        return (
                                            <div key={i} className={`bg-osrs-card border-2 rounded-lg overflow-hidden group transition-all shadow-xl relative ${distance?.isHot ? 'border-osrs-gold animate-pulse-slow shadow-osrs-gold/20' : alert.isTrackingFlip ? 'border-osrs-yellow/40 hover:border-osrs-yellow' : 'border-osrs-border hover:border-osrs-gold/50'}`}>
                                                {distance?.isHot && (
                                                    <div className="absolute top-0 right-0 p-1.5 bg-osrs-gold text-black text-[8px] font-bold uppercase tracking-widest rounded-bl z-20">
                                                        Near Target
                                                    </div>
                                                )}
                                                <div className="p-3.5 space-y-3.5">
                                                    <div className="flex justify-between items-start gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                                <p className="text-osrs-yellow font-bold text-sm leading-tight truncate" title={alert.name}>{alert.name}</p>
                                                                {alert.isTrackingFlip && (
                                                                    <span className="text-[9px] px-1 py-0.5 rounded bg-osrs-gold/20 text-osrs-gold border border-osrs-gold/30 flex items-center gap-0.5 font-bold">
                                                                        <DollarSign size={8} /> FLIP
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-1">
                                                                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider whitespace-nowrap">{alert.priceType} • {alert.alertType}</p>
                                                                {distance && (
                                                                    <div className={`flex items-center gap-1 text-[10px] font-bold font-mono ${distance.percentDiff > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                                        <Target size={10} />
                                                                        <span>{distance.percentDiff.toFixed(1)}%</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                                            {alert.isTrackingFlip && (
                                                                <button
                                                                    onClick={() => handleMarkAsSold(alert)}
                                                                    className="text-white hover:bg-green-600 p-1.5 bg-green-500 rounded shadow-sm transition-colors"
                                                                    title="Finalize Flip"
                                                                >
                                                                    <ShieldCheck size={14} />
                                                                </button>
                                                            )}
                                                            <button
                                                                onClick={() => removeAlert(alert.id, alert.targetPrice)}
                                                                className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-500/10 rounded transition-colors"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Price Grid: START | NOW | GOAL */}
                                                    <div className="grid grid-cols-[1fr_1.5fr_1fr] gap-0 bg-black/40 rounded border border-osrs-border/30 overflow-hidden">
                                                        <div className="text-center py-2 bg-black/20 border-r border-osrs-border/20">
                                                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter mb-0.5">Start</p>
                                                            <p className="text-[10px] font-mono text-gray-400" title={alert.initialPrice.toLocaleString()}>{formatCompactGP(alert.initialPrice)}</p>
                                                        </div>
                                                        <div className="text-center py-2 px-1 bg-osrs-gold/5">
                                                            <p className="text-[8px] text-osrs-gold font-bold uppercase tracking-tighter mb-0.5 flex items-center justify-center gap-1">
                                                                <Clock size={8} /> Now
                                                            </p>
                                                            <p className="text-xs font-mono text-white font-bold" title={current?.toLocaleString()}>{current ? formatCompactGP(current) : '...'}</p>
                                                        </div>
                                                        <div className="text-center py-2 bg-black/20 border-l border-osrs-border/20">
                                                            <p className="text-[8px] text-gray-500 font-bold uppercase tracking-tighter mb-0.5">Goal</p>
                                                            <p className="text-[10px] font-mono text-osrs-gold font-bold" title={alert.targetPrice.toLocaleString()}>{formatCompactGP(alert.targetPrice)}</p>
                                                        </div>
                                                    </div>

                                                    {/* Profit Tracking UI */}
                                                    {profitStats && (
                                                        <div className="bg-osrs-panel/60 rounded p-2.5 border border-osrs-gold/10 space-y-1.5 shadow-inner">
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-1 text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                                                                    <Coins size={10} className="text-osrs-gold" />
                                                                    <span>Live Profit</span>
                                                                </div>
                                                                <span className={`text-xs font-mono font-bold ${profitStats.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {profitStats.totalProfit >= 0 ? '+' : ''}{Math.floor(profitStats.totalProfit).toLocaleString()}
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center border-t border-osrs-border/10 pt-1.5">
                                                                <span className="text-[9px] text-gray-500 font-bold">ROI: <span className={profitStats.roi >= 0 ? 'text-green-500/80' : 'text-red-500/80'}>{profitStats.roi.toFixed(1)}%</span></span>
                                                                <span className="text-[9px] text-gray-600 italic font-mono">B.E. {formatCompactGP(profitStats.breakEven)}</span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    {/* Progress Bar Container */}
                                                    <div className="space-y-1.5">
                                                        <div className="h-2 w-full bg-black/60 rounded-full border border-osrs-border relative overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-1000 ${alert.condition === 'above' ? 'bg-gradient-to-r from-osrs-gold to-green-500' : 'bg-gradient-to-r from-osrs-gold to-red-500'}`}
                                                                style={{ width: `${progress}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Triggered Alerts */}
                            {notifiedAlerts.length > 0 && (
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center px-1">
                                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Recently Triggered</p>
                                        <button onClick={clearNotified} className="text-[9px] text-osrs-orange hover:underline font-bold">Clear</button>
                                    </div>
                                    {notifiedAlerts.map((alert, i) => (
                                        <div key={i} className="bg-black/20 border border-osrs-border/30 p-2 rounded-lg flex justify-between items-center opacity-70 grayscale hover:grayscale-0 transition-all border-l-2 border-l-green-500">
                                            <div className="flex items-center gap-2">
                                                <div className="text-green-500"><Bell size={12} className="fill-current" /></div>
                                                <div>
                                                    <p className="text-gray-300 font-bold text-[11px] leading-tight">{alert.name}</p>
                                                    <p className="text-[9px] text-gray-500">{alert.targetPrice.toLocaleString()} GP Hit</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => removeAlert(alert.id, alert.targetPrice)}
                                                className="text-gray-600 hover:text-red-400 p-1"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                        <div className="space-y-4">
                            <div className="flex justify-between items-end px-1">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Flip Ledger</p>
                                    <p className="text-xl font-fantasy text-osrs-gold">+{sessionProfit.toLocaleString()}<span className="text-xs ml-1">GP</span></p>
                                </div>
                                <button
                                    onClick={clearFlipHistory}
                                    className="p-1 px-2 mb-1 rounded bg-red-500/10 text-red-400 text-[10px] font-bold border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                >
                                    RESET
                                </button>
                            </div>

                            {history.length === 0 ? (
                                <div className="text-center py-12 text-gray-600 italic text-xs border-y border-white/5">
                                    Your flip ledger is currently empty.<br />Log buys and mark them as sold to see metrics!
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {history.map((flip, i) => (
                                        <div key={i} className="bg-osrs-card border border-osrs-border/30 rounded-lg p-4 space-y-3 shadow-md">
                                            <div className="flex justify-between items-start">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-osrs-yellow font-bold text-sm leading-tight truncate">{flip.name}</p>
                                                    <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500 font-mono">
                                                        <span>{flip.quantity.toLocaleString()} x {flip.purchasePrice.toLocaleString()}</span>
                                                        <ArrowRight size={10} className="text-gray-700" />
                                                        <span className="text-white">{flip.sellPrice.toLocaleString()}</span>
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <p className={`text-sm font-bold font-mono ${flip.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                                        {flip.profit >= 0 ? '+' : ''}{Math.floor(flip.profit).toLocaleString()}
                                                    </p>
                                                    <div className="px-1.5 py-0.5 rounded bg-black/40 border border-osrs-border inline-block mt-1">
                                                        <p className="text-[10px] text-osrs-orange font-bold font-mono">{flip.roi.toFixed(1)}% ROI</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-gray-500 flex justify-between uppercase font-bold border-t border-osrs-border/20 pt-2">
                                                <span className="flex items-center gap-1.5">
                                                    <Clock size={10} />
                                                    {new Date(flip.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                                <span className="text-osrs-gold">Flip Verified</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="p-3 bg-black/40 border-t border-osrs-gold/20 flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="animate-pulse w-1.5 h-1.5 bg-green-500 rounded-full" />
                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">GE Stream Connected</span>
                            </div>
                            {monitorStatus.lastCheck && (
                                <div className="flex items-center gap-2 border-l border-white/10 pl-3">
                                    <div className="relative">
                                        <Bell className="w-2.5 h-2.5 text-osrs-gold" />
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[6px] w-2 h-2 rounded-full flex items-center justify-center font-bold">
                                            {monitorStatus.activeCount}
                                        </span>
                                    </div>
                                    <span className="text-[9px] text-gray-400 font-bold uppercase tracking-tighter">
                                        Monitor: {monitorStatus.lastCheck.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {settings.enableSound ? <Volume2 size={10} className="text-osrs-gold" /> : <VolumeX size={10} className="text-gray-400" />}
                            <span className="text-[8px] text-gray-400 font-bold">{settings.enableSound ? 'SOUND ON' : 'MUTED'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default AlertSidebar;
