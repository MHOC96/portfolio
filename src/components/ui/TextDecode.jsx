import { useState, useEffect, useRef } from 'react';
import { useInView } from 'framer-motion';

const CHARS = '01!@#$%^&*><{}[]ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * TextDecode — Text starts as random garbled characters and rapidly
 * "decrypts" into the real text when it scrolls into view.
 */
const TextDecode = ({
    text,
    className = '',
    style = {},
    speed = 30,         // ms per iteration
    stagger = 3,        // characters revealed per tick
    triggerOnView = true,
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, amount: 0.5 });
    const [displayText, setDisplayText] = useState(
        text.split('').map(c => c === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]).join('')
    );
    const [decoded, setDecoded] = useState(false);
    const iterationRef = useRef(0);

    useEffect(() => {
        if (!triggerOnView || !isInView || decoded) return;

        iterationRef.current = 0;

        const interval = setInterval(() => {
            setDisplayText(
                text.split('').map((char, idx) => {
                    if (char === ' ') return ' ';
                    if (idx < iterationRef.current) return text[idx];
                    return CHARS[Math.floor(Math.random() * CHARS.length)];
                }).join('')
            );

            iterationRef.current += 1 / stagger;

            if (iterationRef.current >= text.length + 1) {
                clearInterval(interval);
                setDisplayText(text);
                setDecoded(true);
            }
        }, speed);

        return () => clearInterval(interval);
    }, [isInView, text, speed, stagger, triggerOnView, decoded]);

    // Hover re-decode
    const handleMouseEnter = () => {
        if (!decoded) return;
        setDecoded(false);
        iterationRef.current = 0;

        const interval = setInterval(() => {
            setDisplayText(
                text.split('').map((char, idx) => {
                    if (char === ' ') return ' ';
                    if (idx < iterationRef.current) return text[idx];
                    return CHARS[Math.floor(Math.random() * CHARS.length)];
                }).join('')
            );

            iterationRef.current += 1 / 2; // faster on hover

            if (iterationRef.current >= text.length + 1) {
                clearInterval(interval);
                setDisplayText(text);
                setDecoded(true);
            }
        }, 25);
    };

    return (
        <span
            ref={ref}
            className={className}
            style={style}
            onMouseEnter={handleMouseEnter}
        >
            {displayText.split('').map((char, i) => (
                <span
                    key={i}
                    style={{
                        color: char !== text[i] && char !== ' '
                            ? 'var(--color-red)'
                            : undefined,
                        opacity: char !== text[i] && char !== ' ' ? 0.6 : 1,
                        transition: 'color 0.1s, opacity 0.1s',
                    }}
                >
                    {char}
                </span>
            ))}
        </span>
    );
};

export default TextDecode;
