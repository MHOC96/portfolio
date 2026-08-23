import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

const AnimatedBackground = () => {
    const bgRef = useRef(null);
    const { isLowPerf } = useTheme();
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768 || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0));
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const disableAnimations = isLowPerf || isMobile;

    useEffect(() => {
        if (disableAnimations) return;

        let rafId;
        const handleMouseMove = (e) => {
            if (!bgRef.current) return;
            // Throttle mouse moves to browser painting cycles to reduce style recalculation overhead
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
                if (bgRef.current) {
                    bgRef.current.style.setProperty('--mouse-x', `${e.clientX}px`);
                    bgRef.current.style.setProperty('--mouse-y', `${e.clientY}px`);
                }
            });
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        return () => {
            if (rafId) cancelAnimationFrame(rafId);
            window.removeEventListener('mousemove', handleMouseMove);
        };
    }, [disableAnimations]);

    return (
        <div ref={bgRef} className="fixed inset-0 -z-20 overflow-hidden pointer-events-none bg-primary">
            {/* Subtle Grain overlay */}
            <div className="absolute inset-0 opacity-[0.04] grain-bg mix-blend-overlay"></div>

            {/* Static Very Faint Background Grid — uses CSS variable via border color */}
            <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage: `
                        linear-gradient(to right, var(--color-accent) 1px, transparent 1px),
                        linear-gradient(to bottom, var(--color-accent) 1px, transparent 1px)
                    `,
                    backgroundSize: '80px 80px',
                }}
            />

            {/* Cyberpunk Gradient Accents */}
            {!disableAnimations && (
                <div 
                    className="absolute top-0 left-0 w-[40vw] h-[40vw] rounded-full mix-blend-screen opacity-[0.07] pointer-events-none blur-[100px]"
                    style={{
                        background: 'radial-gradient(circle, rgba(255,51,51,1) 0%, rgba(128,0,128,0.8) 50%, rgba(0,0,0,0) 100%)',
                        transform: `translate(calc(var(--mouse-x, 50vw) - 50%), calc(var(--mouse-y, 50vh) - 50%))`,
                        transition: 'transform 1.5s cubic-bezier(0.2, 0.8, 0.2, 1)'
                    }}
                />
            )}

            {!disableAnimations && (
                /* Interactive Glowing Grid layer that follows the mouse */
                <div
                    className="absolute inset-0 opacity-[0.35]"
                    style={{
                        backgroundImage: `
                            linear-gradient(to right, var(--color-accent) 1px, transparent 1px),
                            linear-gradient(to bottom, var(--color-accent) 1px, transparent 1px)
                        `,
                        backgroundSize: '80px 80px',
                        maskImage: 'radial-gradient(250px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), black 0%, transparent 100%)',
                        WebkitMaskImage: 'radial-gradient(250px circle at var(--mouse-x, 50vw) var(--mouse-y, 50vh), black 0%, transparent 100%)'
                    }}
                />
            )}
        </div>
    );
};

export default AnimatedBackground;
