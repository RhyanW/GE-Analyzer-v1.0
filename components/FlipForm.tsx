import React, { useState, useEffect, useRef } from 'react';
import { MembershipStatus, RiskLevel, FlipSettings, StrategyType } from '../types';
import { Search, Loader2, RefreshCcw, TrendingUp, User, ListOrdered, X } from 'lucide-react';

interface FlipFormProps {
  onSearch: (settings: FlipSettings) => void;
  isLoading: boolean;
}

const FlipForm: React.FC<FlipFormProps> = ({ onSearch, isLoading }) => {
  const [budget, setBudget] = useState<number>(0);
  const [membership, setMembership] = useState<MembershipStatus>(MembershipStatus.P2P);
  const [risk, setRisk] = useState<RiskLevel>(RiskLevel.MEDIUM);
  const [strategy, setStrategy] = useState<StrategyType>(StrategyType.FLIPPING);
  const [itemName, setItemName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [resultCount, setResultCount] = useState<number>(100);

  // Autocomplete state
  const [itemSuggestions, setItemSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [allItems, setAllItems] = useState<string[]>([]);
  const autocompleteRef = useRef<HTMLDivElement>(null);

  // Fetch item list on mount
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch('https://corsproxy.io/?' + encodeURIComponent('https://prices.runescape.wiki/api/v1/osrs/mapping'));
        const data = await response.json();
        const names = data.map((item: any) => item.name).sort();
        setAllItems(names);
      } catch (error) {
        console.error('Failed to fetch item list:', error);
      }
    };
    fetchItems();
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions based on input
  const handleItemNameChange = (value: string) => {
    setItemName(value);
    if (value.length > 0) {
      const filtered = allItems
        .filter(item => item.toLowerCase().includes(value.toLowerCase()))
        .slice(0, 10);
      setItemSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const selectSuggestion = (suggestion: string) => {
    setItemName(suggestion);
    setShowSuggestions(false);
  };

  const [budgetError, setBudgetError] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (strategy !== StrategyType.PLAYER_LOOKUP && budget <= 0) {
      setBudgetError(true);
      return;
    }

    setBudgetError(false);
    onSearch({ budget, membership, risk, strategy, itemName, username, resultCount });
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B';
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="bg-osrs-panel border-2 border-osrs-border rounded-lg p-6 shadow-2xl max-w-6xl mx-auto mb-10 relative overflow-hidden">
      {/* Decorative Corner stones */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-osrs-gold"></div>
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-osrs-gold"></div>
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-osrs-gold"></div>
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-osrs-gold"></div>

      <h2 className="text-xl text-osrs-orange font-fantasy mb-6 border-b border-osrs-border pb-2">
        Configure Strategy
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Strategy Selection */}
        <div>
          <label className="block text-osrs-gold mb-2 font-bold">Strategy</label>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setStrategy(StrategyType.FLIPPING)}
              className={`flex items-center justify-center gap-2 p-3 rounded border transition-all ${strategy === StrategyType.FLIPPING
                ? 'bg-osrs-gold text-black border-white shadow-[0_0_10px_rgba(212,175,55,0.3)]'
                : 'bg-black/30 text-gray-400 border-osrs-border hover:border-gray-500'
                }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span className="font-bold">Merch / Flip</span>
            </button>
            <button
              type="button"
              onClick={() => setStrategy(StrategyType.HIGH_ALCH)}
              className={`flex items-center justify-center gap-2 p-3 rounded border transition-all ${strategy === StrategyType.HIGH_ALCH
                ? 'bg-purple-700 text-white border-white shadow-[0_0_10px_rgba(147,51,234,0.3)]'
                : 'bg-black/30 text-gray-400 border-osrs-border hover:border-gray-500'
                }`}
            >
              <RefreshCcw className="w-4 h-4" />
              <span className="font-bold">High Alchemy</span>
            </button>
            <button
              type="button"
              onClick={() => setStrategy(StrategyType.PLAYER_LOOKUP)}
              className={`flex items-center justify-center gap-2 p-3 rounded border transition-all ${strategy === StrategyType.PLAYER_LOOKUP
                ? 'bg-blue-700 text-white border-white shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-black/30 text-gray-400 border-osrs-border hover:border-gray-500'
                }`}
            >
              <User className="w-4 h-4" />
              <span className="font-bold">Player Lookup</span>
            </button>
          </div>
        </div>

        {strategy === StrategyType.PLAYER_LOOKUP ? (
          // PLAYER LOOKUP MODE
          <div>
            <label className="block text-osrs-gold mb-2 font-bold">
              OSRS Username
            </label>
            <div className="relative">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/30 border border-osrs-border rounded px-4 py-3 text-white focus:outline-none focus:border-osrs-gold transition-colors pl-10"
                placeholder="Enter username to lookup stats..."
                autoFocus
              />
              <User className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
            </div>
          </div>
        ) : (
          // MARKET MODES
          <>
            {/* Inputs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-osrs-gold mb-2 font-bold">
                  Specific Item <span className="text-gray-500 font-normal text-xs">(Optional)</span>
                </label>
                <div className="relative" ref={autocompleteRef}>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => handleItemNameChange(e.target.value)}
                    onFocus={() => itemName.length > 0 && itemSuggestions.length > 0 && setShowSuggestions(true)}
                    className="w-full bg-black/30 border border-osrs-border rounded px-4 py-3 text-white focus:outline-none focus:border-osrs-gold transition-colors pl-10 pr-10"
                    placeholder="e.g. Abyssal whip"
                    autoComplete="off"
                  />
                  <Search className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                  {itemName && (
                    <button
                      type="button"
                      onClick={() => {
                        setItemName('');
                        setShowSuggestions(false);
                      }}
                      className="absolute right-3 top-3 text-gray-500 hover:text-white transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}

                  {/* Autocomplete dropdown */}
                  {showSuggestions && itemSuggestions.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-osrs-panel border border-osrs-gold rounded-lg shadow-2xl max-h-60 overflow-y-auto">
                      {itemSuggestions.map((suggestion, idx) => (
                        <div
                          key={idx}
                          onClick={() => selectSuggestion(suggestion)}
                          className="px-4 py-2 text-white hover:bg-osrs-gold hover:text-black cursor-pointer transition-colors text-sm border-b border-osrs-border last:border-b-0"
                        >
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Username (Optional) */}
              <div>
                <label className="block text-osrs-gold mb-2 font-bold">
                  OSRS Name <span className="text-gray-500 font-normal text-xs">(For XP Calc)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-black/30 border border-osrs-border rounded px-4 py-3 text-white focus:outline-none focus:border-osrs-gold transition-colors pl-10"
                    placeholder="Username"
                  />
                  <User className="absolute left-3 top-3 text-gray-500 w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Budget Input */}
            <div>
              <label className="block text-osrs-gold mb-2 font-bold">
                Budget (GP) <span className="text-gray-500 font-normal">({formatNumber(budget)})</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={budget}
                  onChange={(e) => {
                    setBudget(Number(e.target.value));
                    if (Number(e.target.value) > 0) setBudgetError(false);
                  }}
                  className={`w-full bg-black/30 border rounded px-4 py-3 text-white focus:outline-none transition-colors ${budgetError ? 'border-red-500 focus:border-red-500' : 'border-osrs-border focus:border-osrs-gold'
                    }`}
                  placeholder="e.g. 1000000"
                />
                <div className="absolute right-3 top-3 text-osrs-gold font-fantasy text-sm">GP</div>
              </div>
              {budgetError && (
                <p className="text-red-500 text-xs mt-1 animate-pulse font-bold">
                  Please enter a budget greater than 0 to continue.
                </p>
              )}
              <div className="flex gap-2 mt-2 flex-wrap">
                {[1000000, 10000000, 100000000, 500000000, 1000000000].map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setBudget(prev => prev + amt)}
                    className="text-xs bg-osrs-border hover:bg-osrs-gold hover:text-black text-gray-300 px-3 py-1 rounded transition-colors"
                  >
                    +{formatNumber(amt)}
                  </button>
                ))}
              </div>
            </div>

            {/* Amount of Results Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-osrs-gold font-bold flex items-center gap-2">
                  <ListOrdered className="w-4 h-4" /> Results Amount
                </label>
                <span className="text-white font-mono bg-black/50 px-2 rounded border border-osrs-border">
                  {resultCount} Items
                </span>
              </div>
              <input
                type="range"
                min="3"
                max="500"
                step="1"
                value={resultCount}
                onChange={(e) => setResultCount(Number(e.target.value))}
                className="w-full h-2 bg-black/50 rounded-lg appearance-none cursor-pointer accent-osrs-gold border border-osrs-border"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>3</span>
                <span>500</span>
              </div>
            </div>

            {/* Membership Toggle & Risk */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-osrs-gold mb-2 font-bold">Membership Status</label>
                <div className="flex bg-black/30 rounded p-1 border border-osrs-border">
                  <button
                    type="button"
                    onClick={() => setMembership(MembershipStatus.F2P)}
                    className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${membership === MembershipStatus.F2P
                      ? 'bg-osrs-border text-white'
                      : 'text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    F2P
                  </button>
                  <button
                    type="button"
                    onClick={() => setMembership(MembershipStatus.P2P)}
                    className={`flex-1 py-2 text-sm font-bold rounded transition-colors ${membership === MembershipStatus.P2P
                      ? 'bg-osrs-gold text-black'
                      : 'text-gray-500 hover:text-gray-300'
                      }`}
                  >
                    Member
                  </button>
                </div>
              </div>

              {/* Risk Level */}
              <div>
                <label className="block text-osrs-gold mb-2 font-bold">
                  {strategy === StrategyType.HIGH_ALCH ? 'Volume Preference' : 'Risk Appetite'}
                </label>
                <select
                  value={risk}
                  onChange={(e) => setRisk(e.target.value as RiskLevel)}
                  className="w-full bg-black/30 border border-osrs-border rounded px-4 py-2.5 text-white focus:outline-none focus:border-osrs-gold"
                >
                  {Object.values(RiskLevel).map((level) => (
                    <option key={level} value={level} className="bg-osrs-panel">
                      {level}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-4 mt-4 font-fantasy text-lg uppercase tracking-wider rounded border border-osrs-gold shadow-lg flex items-center justify-center gap-2 transition-all ${isLoading
            ? 'bg-osrs-border cursor-not-allowed opacity-70'
            : 'bg-gradient-to-b from-osrs-gold to-orange-600 text-black hover:brightness-110 active:scale-[0.98]'
            }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" /> {strategy === StrategyType.PLAYER_LOOKUP ? 'Fetching Stats...' : 'Analyzing Market...'}
            </>
          ) : (
            <>
              {strategy === StrategyType.PLAYER_LOOKUP ? <User className="w-5 h-5" /> : <Search className="w-5 h-5" />}
              {strategy === StrategyType.PLAYER_LOOKUP ? 'Lookup Stats' : 'Analyze Market'}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default FlipForm;