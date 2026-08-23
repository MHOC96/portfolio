import { useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

/**
 * CursorBubble — A smooth, performance-optimized bubble that follows the mouse cursor.
 * It uses MotionValues to bypass React re-renders on mousemove.
 */
const CursorBubble = () => {
    const { isLowPerf } = useTheme();
    const [isHovering, setIsHovering] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [cursorText, setCursorText] = useState('');

    // Bypasses React state updates on mouse move to eliminate render lag
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Spring configurations for inertia/inertia lag
    const smoothX = useSpring(mouseX, { stiffness: 600, damping: 30, mass: 0.4 });
    const smoothY = useSpring(mouseY, { stiffness: 600, damping: 30, mass: 0.4 });

    useEffect(() => {
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        if (isTouchDevice) return;

        setIsVisible(true);

        const isInteractive = (el) => {
            if (!el) return { hover: false, text: '' };
            let node = el;
            while (node && node !== document.body) {
                if (node.hasAttribute('data-cursor-text')) {
                    return { hover: true, text: node.getAttribute('data-cursor-text') };
                }
                const tag = node.tagName;
                if (tag === 'A' || tag === 'BUTTON' || tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return { hover: true, text: '' };
                if (node.getAttribute('role') === 'button') return { hover: true, text: '' };
                if (node.classList && (
                    node.classList.contains('glitch-hover') ||
                    node.classList.contains('nothing-btn') ||
                    node.classList.contains('magnetic-btn') ||
                    node.classList.contains('cursor-pointer') ||
                    node.classList.contains('social-icon')
                )) return { hover: true, text: '' };
                node = node.parentElement;
            }
            return { hover: false, text: '' };
        };

        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
            const { hover, text } = isInteractive(e.target);
            setIsHovering(hover);
            setCursorText(text);
        };

        const handleMouseLeave = () => {
            mouseX.set(-100);
            mouseY.set(-100);
            setIsHovering(false);
            setCursorText('');
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.documentElement.addEventListener('mouseleave', handleMouseLeave, { passive: true });

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            document.documentElement.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, [mouseX, mouseY]);

    if (isLowPerf || !isVisible) return null;

    const bubbleSize = cursorText ? 80 : (isHovering ? 48 : 20);

    return (
        /* Main dot cursor */
        <motion.div
            className="fixed top-0 left-0 z-[99999] pointer-events-none mix-blend-difference flex items-center justify-center overflow-hidden"
            style={{
                x: smoothX,
                y: smoothY,
                width: bubbleSize,
                height: bubbleSize,
                translateX: '-50%',
                translateY: '-50%',
                borderRadius: '50%',
                backgroundColor: (isHovering && !cursorText) ? 'rgba(245,245,245,0.15)' : 'rgba(245,245,245,0.9)',
                border: (isHovering && !cursorText) ? '1px solid rgba(245,245,245,0.6)' : 'none',
            }}
        >
            {cursorText && (
                <span className="text-[10px] font-bold text-black tracking-widest whitespace-nowrap">
                    {cursorText}
                </span>
            )}
        </motion.div>
    );
};

export default CursorBubble;
