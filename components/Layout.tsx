import React, { ReactNode } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Coins, Anchor, BookOpen, Home, Bell, Trash2, X } from 'lucide-react';
import ImmersiveOrientationNotice from './ImmersiveOrientationNotice';
import PriceAlertMonitor from './PriceAlertMonitor';
import AlertSidebar from './AlertSidebar';
import { getAlerts, removeAlert, clearNotified, requestNotificationPermission } from '../services/alerts';
import { PriceAlert } from '../types';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-osrs-bg text-gray-200 font-body flex flex-col items-center">
      <ImmersiveOrientationNotice />
      {/* Header */}
      <header className="w-full bg-osrs-panel border-b-2 border-osrs-gold shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">

            {/* Logo / Brand */}
            <Link to="/" className="flex items-center gap-3 group hover:opacity-90 transition-opacity">
              <div className="p-2 bg-osrs-border rounded-full border border-osrs-gold group-hover:bg-osrs-gold group-hover:text-black transition-colors">
                <Anchor className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-fantasy text-osrs-yellow drop-shadow-md">
                  OSRS Master Suite
                </h1>
                <p className="text-[10px] text-osrs-orange tracking-widest uppercase hidden md:block">
                  Efficiency & Market Tools
                </p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex items-center gap-1 bg-black/30 rounded-full p-1 border border-osrs-border/50">
              <NavLink
                to="/"
                end
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive
                    ? 'bg-osrs-gold text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'}`
                }
              >
                <Home size={16} /> <span className="hidden sm:inline">Home</span>
              </NavLink>

              <NavLink
                to="/flipper"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive
                    ? 'bg-osrs-gold text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'}`
                }
              >
                <Coins size={16} /> <span className="hidden sm:inline">Flipper</span>
              </NavLink>

              <NavLink
                to="/alchemy"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive
                    ? 'bg-osrs-gold text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'}`
                }
              >
                <span className="text-lg leading-none">✨</span> <span className="hidden sm:inline">Alchemy</span>
              </NavLink>

              <NavLink
                to="/skills"
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all ${isActive
                    ? 'bg-osrs-gold text-black shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'}`
                }
              >
                <span className="text-lg leading-none">📊</span> <span className="hidden sm:inline">Skills</span>
              </NavLink>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-[1800px] p-4 md:p-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="w-full bg-black/50 p-6 text-center text-gray-500 text-sm border-t border-osrs-border">
        <p>© {new Date().getFullYear()} OSRS Master Suite. Not affiliated with Jagex.</p>
        <p className="mt-2 text-xs">
          Prices sourced directly from the OSRS Wiki Real-time API. Margins include estimated GE Tax.
        </p>
      </footer>
      {/* Layout Elements */}
      <PriceAlertMonitor />
      <AlertSidebar />

    </div>
  );
};

export default Layout;