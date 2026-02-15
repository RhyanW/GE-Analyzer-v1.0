import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { EquipableItem } from '../types';
import { searchItems } from '../services/bis';

interface ItemSelectorModalProps {
    isOpen: boolean;
    onClose: () => void;
    slot: string;
    onSelect: (item: EquipableItem) => void;
}

const ItemSelectorModal: React.FC<ItemSelectorModalProps> = ({ isOpen, onClose, slot, onSelect }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<EquipableItem[]>([]);

    useEffect(() => {
        if (isOpen) {
            setQuery('');
            // Load initial suggestions (e.g. top items for slot) or just empty
            searchItems(slot, '').then(items => setResults(items.slice(0, 20)));
        }
    }, [isOpen, slot]);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (isOpen) {
                searchItems(slot, query).then(items => setResults(items));
            }
        }, 300); // Debounce
        return () => clearTimeout(timeoutId);
    }, [query, isOpen, slot]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-osrs-panel border border-osrs-border rounded-lg shadow-2xl w-full max-w-md flex flex-col max-h-[80vh]">
                {/* Header */}
                <div className="p-4 border-b border-osrs-border/50 flex justify-between items-center bg-black/20">
                    <h3 className="text-osrs-gold font-fantasy text-lg tracking-wider uppercase">
                        Select {slot}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Search */}
                <div className="p-4 border-b border-osrs-border/30">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder={`Search ${slot}...`}
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-black/60 border border-osrs-border rounded p-2 pl-9 text-white focus:border-osrs-gold outline-none transition-colors"
                            autoFocus
                        />
                    </div>
                </div>

                {/* Results List */}
                <div className="flex-1 overflow-y-auto p-2 custom-scrollbar space-y-1">
                    {results.length === 0 ? (
                        <div className="text-center text-gray-500 py-8 italic">No items found</div>
                    ) : (
                        results.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => onSelect(item)}
                                className="w-full flex items-center gap-3 p-2 rounded hover:bg-white/10 transition-colors text-left group border border-transparent hover:border-white/5"
                            >
                                <div className="w-8 h-8 bg-black/40 rounded border border-white/10 flex items-center justify-center shrink-0">
                                    <img src={item.icon} alt="" className="w-full h-full object-contain" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-200 group-hover:text-osrs-gold truncate">
                                        {item.name}
                                    </div>
                                    <div className="text-xs text-yellow-600 font-mono">
                                        {item.wiki_price?.toLocaleString() ?? 'Unknown'} gp
                                    </div>
                                </div>
                                {/* Relevant stats preview? Maybe later */}
                            </button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemSelectorModal;
