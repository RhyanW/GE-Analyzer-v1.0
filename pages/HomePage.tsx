import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins, BookOpen, Activity } from 'lucide-react';

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-fade-in">
            <div className="text-center max-w-2xl px-4">
                <h2 className="text-4xl font-fantasy text-osrs-gold mb-4 drop-shadow-lg">
                    Welcome to the OSRS Master Suite
                </h2>
                <p className="text-gray-400 text-lg">
                    Your all-in-one companion for Old School RuneScape. Select a tool below to get started.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl px-4">
                {/* GE Flipper Card */}
                <div
                    onClick={() => navigate('/flipper')}
                    className="bg-osrs-panel border-2 border-osrs-border p-6 rounded-lg cursor-pointer hover:border-osrs-gold hover:shadow-[0_0_20px_rgba(255,215,0,0.15)] transition-all group flex flex-col items-center text-center"
                >
                    <div className="p-4 bg-osrs-bg border border-osrs-border rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <Coins className="w-12 h-12 text-osrs-gold" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">GE Flipper</h3>
                    <p className="text-gray-400 text-sm">
                        Real-time market analysis, margin checks, and high-frequency flipping tools.
                    </p>
                </div>

                {/* High Alch Card */}
                <div
                    onClick={() => navigate('/alchemy')}
                    className="bg-osrs-panel border-2 border-osrs-border p-6 rounded-lg cursor-pointer hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.25)] transition-all group flex flex-col items-center text-center"
                >
                    <div className="p-4 bg-osrs-bg border border-osrs-border rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <span className="text-4xl">✨</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">High Alchemy</h3>
                    <p className="text-gray-400 text-sm">
                        Find profitable alchables, calculate nature rune costs, and max magic XP.
                    </p>
                </div>


                {/* Quest Planner Card */}
                <div
                    onClick={() => navigate('/quests')}
                    className="bg-osrs-panel border-2 border-osrs-border p-6 rounded-lg cursor-pointer hover:border-green-400 hover:shadow-[0_0_20px_rgba(74,222,128,0.25)] transition-all group flex flex-col items-center text-center"
                >
                    <div className="p-4 bg-osrs-bg border border-osrs-border rounded-full mb-4 group-hover:scale-110 transition-transform">
                        <span className="text-4xl">📜</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Quest Planner</h3>
                    <p className="text-gray-400 text-sm">
                        Track your progress towards major Quests and Achievement Diaries.
                    </p>
                </div>

            </div>

            {/* Footer Info */}
            <div className="mt-8 flex gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><Activity size={12} /> Live GE Data</span>
                <span className="w-px h-3 bg-gray-700"></span>
                <span>Real-time Hiscores</span>
            </div>
        </div>
    );
};

export default HomePage;
