import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useOrientation } from '../hooks/useOrientation';

const ImmersiveOrientationNotice: React.FC = () => {
    const { orientation, isMobile } = useOrientation();
    const [mounted, setMounted] = useState(false);
    const [isBlocked, setIsBlocked] = useState(false);

    useEffect(() => {
        setMounted(true);

        const checkState = () => {
            // Check if any modal is active by looking for common modal indicators
            // 1. overflow: hidden on body
            // 2. Presence of a fixed backdrop
            const hasHiddenOverflow = document.body.style.overflow === 'hidden';
            const hasOverlay = !!document.querySelector('.fixed.bg-black') || !!document.querySelector('.backdrop-blur-md');

            const showing = isMobile && (hasHiddenOverflow || hasOverlay) && orientation === 'portrait';
            setIsBlocked(showing);

            // Force hide body if we are blocking, to prevent weird scrolling of the banner
            if (showing) {
                document.body.setAttribute('data-orientation-locked', 'true');
            } else {
                document.body.removeAttribute('data-orientation-locked');
            }
        };

        const interval = setInterval(checkState, 200); // Fast check
        return () => {
            setMounted(false);
            clearInterval(interval);
        };
    }, [orientation]);

    if (!isBlocked || !mounted) return null;

    const content = (
        <div
            className="md:hidden flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                width: '100vw',
                height: '100vh',
                zIndex: 999999,
                backgroundColor: '#111111'
            }}
        >
            <div className="relative w-24 h-48 border-4 border-osrs-gold rounded-[2rem] p-2 mb-8 animate-orientation-rotate">
                {/* Phone Notch/Speaker */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-8 h-1 bg-osrs-gold/30 rounded-full"></div>
                {/* Phone Screen Shine */}
                <div className="w-full h-full bg-osrs-gold/5 rounded-2xl flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-osrs-gold/20 rounded-full animate-ping"></div>
                </div>
            </div>

            <h2 className="text-osrs-gold font-fantasy text-2xl mb-4 tracking-wider animate-pulse uppercase">
                Rotate Your Device
            </h2>
            <p className="text-gray-400 text-sm max-w-[250px] leading-relaxed">
                This view requires more screen space. Please turn your device sideways to continue.
            </p>

            {/* CSS for the specific rotation animation */}
            <style>{`
                @keyframes orientation-rotate {
                    0%, 10% { transform: rotate(0deg); }
                    40%, 60% { transform: rotate(-90deg); }
                    90%, 100% { transform: rotate(0deg); }
                }
                .animate-orientation-rotate {
                    animation: orientation-rotate 3s ease-in-out infinite;
                }
                /* Extra insurance to prevent page banner from slipping through */
                header, nav {
                    opacity: ${isBlocked ? '0' : '1'} !important;
                    pointer-events: ${isBlocked ? 'none' : 'auto'} !important;
                }
            `}</style>
        </div>
    );

    // Use a portal to render at document root to escape any parent CSS stacking contexts/z-index issues
    return createPortal(content, document.body);
};

export default ImmersiveOrientationNotice;
