import { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

/**
 * MagneticWrapper — Wraps any element and makes it gently "pull"
 * towards the cursor when the mouse hovers near it.
 * Disables itself on mobile/touch devices to prevent layout breaks and optimize performance.
 */
const MagneticWrapper = ({ children, strength = 0.35, className = '' }) => {
    const ref = useRef(null);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [isMobile, setIsMobile] = useState(true);

    useEffect(() => {
        const checkMobile = () => {
            const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            setIsMobile(window.innerWidth < 768 || isTouch);
        };
        checkMobile();
    }, []);

    const handleMouseMove = (e) => {
        if (isMobile || !ref.current) return;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        const distX = (e.clientX - centerX) * strength;
        const distY = (e.clientY - centerY) * strength;
        setPos({ x: distX, y: distY });
    };

    const handleMouseLeave = () => {
        if (isMobile) return;
        setPos({ x: 0, y: 0 });
    };

    if (isMobile) {
        return <div className={`inline-block ${className}`}>{children}</div>;
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            animate={{ x: pos.x, y: pos.y }}
            transition={{ type: 'spring', stiffness: 350, damping: 15, mass: 0.5 }}
            className={`inline-block ${className}`}
        >
            {children}
        </motion.div>
    );
};

export default MagneticWrapper;
