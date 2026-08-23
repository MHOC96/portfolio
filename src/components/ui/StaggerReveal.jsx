import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * StaggerReveal — Wraps a list of children and staggers their
 * entrance animations as they scroll into view.
 * 
 * Props:
 *  - staggerDelay: delay between each child (default 0.08)
 *  - direction: 'up' | 'down' | 'left' | 'right' (default 'up')
 *  - className: wrapper class
 *  - once: only animate once (default true)
 *  - children: elements to stagger
 */
const containerVariants = (staggerDelay) => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: staggerDelay,
            delayChildren: 0.1,
        },
    },
});

const directionMap = {
    up: { y: 60, x: 0 },
    down: { y: -60, x: 0 },
    left: { y: 0, x: 60 },
    right: { y: 0, x: -60 },
};

const itemVariants = (direction) => ({
    hidden: {
        opacity: 0,
        ...directionMap[direction],
        scale: 0.98,
        filter: 'blur(12px)',
        skewY: (direction === 'up' || direction === 'down') ? 2 : 0,
        skewX: (direction === 'left' || direction === 'right') ? 2 : 0,
    },
    visible: {
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        filter: 'blur(0px)',
        skewY: 0,
        skewX: 0,
        transition: {
            duration: 0.8,
            ease: [0.25, 1, 0.35, 1],
        },
    },
});

const StaggerReveal = ({
    children,
    staggerDelay = 0.08,
    direction = 'up',
    className = '',
    once = true,
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once, amount: 0.15 });

    return (
        <motion.div
            ref={ref}
            className={className}
            variants={containerVariants(staggerDelay)}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
        >
            {Array.isArray(children) ? (
                children.map((child, i) => (
                    <motion.div key={i} variants={itemVariants(direction)}>
                        {child}
                    </motion.div>
                ))
            ) : (
                <motion.div variants={itemVariants(direction)}>
                    {children}
                </motion.div>
            )}
        </motion.div>
    );
};

export default StaggerReveal;
