import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

/**
 * TextReveal - Awwwards-style text reveal animation.
 * Splits text into lines/words and reveals them sequentially via a mask.
 */
const TextReveal = ({ 
  text, 
  className = "", 
  delay = 0, 
  stagger = 0.04, 
  duration = 0.8 
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  // Split text by spaces, but preserve the space character
  const words = text.split(' ').map(word => word + '\u00A0');

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: stagger, delayChildren: delay * i },
    }),
  };

  const child = {
    hidden: {
      opacity: 0,
      y: '100%',
      rotateZ: 5,
    },
    visible: {
      opacity: 1,
      y: '0%',
      rotateZ: 0,
      transition: {
        type: 'spring',
        damping: 20,
        stiffness: 100,
        duration: duration,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      style={{ display: 'flex', flexWrap: 'wrap', overflow: 'hidden' }}
      variants={container}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className={className}
    >
      {words.map((word, index) => (
        <span key={index} style={{ overflow: 'hidden', display: 'inline-flex' }}>
          <motion.span variants={child} style={{ display: 'inline-block' }}>
            {word}
          </motion.span>
        </span>
      ))}
    </motion.div>
  );
};

export default TextReveal;
