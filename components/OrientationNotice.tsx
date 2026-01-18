import React from 'react';
import { useOrientation } from '../hooks/useOrientation';
import { Smartphone } from 'lucide-react';

const OrientationNotice: React.FC = () => {
    const { orientation, isMobile } = useOrientation();

    if (!isMobile || orientation === 'landscape') return null;

    return (
        <div className="md:hidden flex items-center justify-center gap-3 p-3 bg-osrs-gold/10 border border-osrs-gold/30 rounded-lg animate-pulse mb-4">
            <div className="p-2 bg-osrs-gold/20 rounded-full">
                <Smartphone className="w-5 h-5 text-osrs-gold rotate-90" />
            </div>
            <div className="text-left">
                <p className="text-osrs-gold font-bold text-xs">Better in Landscape</p>
                <p className="text-gray-400 text-[10px]">Rotate your device for a detailed view</p>
            </div>
        </div>
    );
};

export default OrientationNotice;
