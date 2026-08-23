import { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const HEADER_OFFSET_CLASS = 'top-16';
const VIEWPORT_HEIGHT_CLASS = 'h-[calc(100vh-4rem)]';

/**
 * HorizontalScroll — converts vertical scroll into horizontal movement.
 * The container is pinned (sticky) while scrolling through panelCount panels.
 * Each child panel should be 100% of the sticky viewport width.
 */
const HorizontalScroll = ({ children, panelCount = 3 }) => {
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    mass: 0.5,
  });

  const x = useTransform(
    smoothProgress,
    [0, 1],
    ['0%', `-${(panelCount - 1) * 100}%`]
  );

  return (
    <section
      ref={containerRef}
      style={{ height: `${panelCount * 100}vh` }}
      className="relative w-full max-w-full overflow-x-clip"
    >
      <div className={`sticky ${HEADER_OFFSET_CLASS} ${VIEWPORT_HEIGHT_CLASS} overflow-hidden w-full max-w-full`}>
        <motion.div style={{ x }} className="flex h-full w-full">
          {children}
        </motion.div>
      </div>
    </section>
  );
};

export default HorizontalScroll;
