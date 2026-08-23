import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * GlitchText — A text component that plays a chromatic aberration
 * glitch animation when it scrolls into view or when hovered.
 * Uses CSS pseudo-elements for the RGB split effect.
 */
const GlitchText = ({
    children,
    as: Tag = 'span',
    className = '',
    style = {},
    enableHover = true,
    enableReveal = true,
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const [isGlitching, setIsGlitching] = useState(false);

    const text = typeof children === 'string' ? children : '';

    const handleMouseEnter = () => {
        if (!enableHover) return;
        setIsGlitching(true);
        setTimeout(() => setIsGlitching(false), 400);
    };

    const shouldAnimate = (enableReveal && isInView) || isGlitching;

    return (
        <span
            ref={ref}
            className={`glitch-text-wrapper ${shouldAnimate ? 'glitch-active' : ''} ${className}`}
            style={{ ...style, position: 'relative', display: 'inline-block' }}
            onMouseEnter={handleMouseEnter}
            data-text={text}
        >
            <Tag
                className={className}
                style={{ ...style, position: 'relative', zIndex: 1 }}
                data-text={text}
            >
                {children}
            </Tag>
        </span>
    );
};

export default GlitchText;
