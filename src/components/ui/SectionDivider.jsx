import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * SectionDivider — An animated circuit-board-style divider
 * between sections. Glows and pulses when it scrolls into view.
 */
const SectionDivider = ({ className = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });

    return (
        <div ref={ref} className={`relative w-full py-8 flex items-center justify-center overflow-hidden ${className}`}>
            {/* Main horizontal line */}
            <motion.div
                className="relative w-full max-w-4xl flex items-center"
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.8 }}
            >
                {/* Left line */}
                <motion.div
                    className="flex-1 h-[1px] origin-left"
                    style={{ backgroundColor: 'var(--color-border-strong)' }}
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                />

                {/* Center node */}
                <div className="relative mx-4 flex items-center justify-center">
                    {/* Outer pulse ring — CSS animation */}
                    <div
                        className="absolute w-8 h-8 border border-red/30"
                        style={{
                            borderRadius: '0px',
                            animation: isInView ? 'divider-pulse 3s ease-in-out infinite' : 'none',
                        }}
                    />
                    {/* Inner diamond */}
                    <motion.div
                        className="w-3 h-3 border-2"
                        style={{
                            borderColor: 'var(--color-red)',
                            transform: 'rotate(45deg)',
                        }}
                        animate={isInView ? {
                            boxShadow: ['0 0 0px var(--color-red)', '0 0 12px var(--color-red)', '0 0 0px var(--color-red)'],
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                </div>

                {/* Right line */}
                <motion.div
                    className="flex-1 h-[1px] origin-right"
                    style={{ backgroundColor: 'var(--color-border-strong)' }}
                    initial={{ scaleX: 0 }}
                    animate={isInView ? { scaleX: 1 } : {}}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                />
            </motion.div>

            {/* Traveling light pulse — CSS animation */}
            <div
                className="absolute h-[1px] w-16"
                style={{
                    background: 'linear-gradient(90deg, transparent, var(--color-red), transparent)',
                    top: '50%',
                    animation: isInView ? 'divider-travel 5s linear infinite' : 'none',
                }}
            />

            <style>{`
                @keyframes divider-pulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.8); opacity: 0; }
                }
                @keyframes divider-travel {
                    0% { transform: translateX(-50vw); opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { transform: translateX(50vw); opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default SectionDivider;
