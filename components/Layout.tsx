import React, { ReactNode } from 'react';
import { Coins, Anchor } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-osrs-bg text-gray-200 font-body flex flex-col items-center">
      {/* Header */}
      <header className="w-full bg-osrs-panel border-b-2 border-osrs-gold p-4 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-osrs-border rounded-full border border-osrs-gold">
              <Coins className="w-8 h-8 text-osrs-gold" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-fantasy text-osrs-yellow drop-shadow-md">
                Grand Exchange Analyzer
              </h1>
              <p className="text-xs text-osrs-orange tracking-widest uppercase">
                Algorithmic Market Tool
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-sm text-gray-400">
            <span>Market Data: <span className="text-green-500 font-bold">OSRS Wiki API</span></span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1800px] p-4 md:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-black/50 p-6 text-center text-gray-500 text-sm border-t border-osrs-border">
        <p>© {new Date().getFullYear()} OSRS GE Analyzer. Not affiliated with Jagex.</p>
        <p className="mt-2 text-xs">
          Prices sourced directly from the OSRS Wiki Real-time API. Margins include estimated GE Tax.
        </p>
      </footer>
    </div>
  );
};

export default Layout;