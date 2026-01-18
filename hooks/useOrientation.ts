import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

export interface OrientationState {
    orientation: Orientation;
    isMobile: boolean;
}

export function useOrientation(): OrientationState {
    const checkIsMobile = () => {
        if (typeof navigator === 'undefined') return false;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    };

    const getOrientation = () => (window.innerHeight < window.innerWidth ? 'landscape' : 'portrait');

    const [state, setState] = useState<OrientationState>({
        orientation: typeof window !== 'undefined' ? getOrientation() : 'portrait',
        isMobile: checkIsMobile()
    });

    useEffect(() => {
        const handleResize = () => {
            setState({
                orientation: getOrientation(),
                isMobile: checkIsMobile()
            });
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        // Initial check
        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    return state;
}
