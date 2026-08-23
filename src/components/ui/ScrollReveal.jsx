import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * ScrollReveal — safe 3D-ish entrance using opacity, y, blur, and skew.
 * Upgraded to a more dynamic, modern reveal.
 */
const ScrollReveal = ({
    children,
    delay = 0,
    className = '',
    once = true,
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, amount: 0.15 });

    return (
        <div ref={ref} className={className}>
            <motion.div
                initial={{ opacity: 0, y: 60, scale: 0.98, filter: 'blur(12px)', skewY: 2 }}
                animate={
                    isInView
                        ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', skewY: 0 }
                        : { opacity: 0, y: 60, scale: 0.98, filter: 'blur(12px)', skewY: 2 }
                }
                transition={{
                    duration: 0.8,
                    delay,
                    ease: [0.25, 1, 0.35, 1], // Snappy cubic bezier
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};

export default ScrollReveal;
