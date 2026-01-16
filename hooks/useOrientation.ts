import { useState, useEffect } from 'react';

export type Orientation = 'portrait' | 'landscape';

export function useOrientation() {
    const [orientation, setOrientation] = useState<Orientation>(
        typeof window !== 'undefined' && window.innerHeight < window.innerWidth
            ? 'landscape'
            : 'portrait'
    );

    useEffect(() => {
        const handleResize = () => {
            setOrientation(window.innerHeight < window.innerWidth ? 'landscape' : 'portrait');
        };

        window.addEventListener('resize', handleResize);
        // Initial check
        handleResize();

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return orientation;
}
