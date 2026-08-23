import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Loader = ({ onComplete }) => {
  const [phase, setPhase] = useState('loading');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Sophisticated physics-based progress counter
    const duration = 1200;
    const startTime = performance.now();
    
    const animateProgress = (time) => {
      const elapsed = time - startTime;
      const p = Math.min(elapsed / duration, 1);
      // Expo ease out for the counter
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setProgress(Math.floor(ease * 100));
      
      if (p < 1) {
        requestAnimationFrame(animateProgress);
      }
    };
    requestAnimationFrame(animateProgress);

    // Timings for the choreography
    // 0.0s - 1.2s: Line draws and counter hits 100%
    // 1.0s - 2.0s: Text elegantly slides out from the mask
    // 3.0s: Trigger exit sequence
    const timer1 = setTimeout(() => {
      setPhase('exit');
    }, 3200);

    const timer2 = setTimeout(() => {
      onComplete();
    }, 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [onComplete]);

  // Emil Kowalski signature easing curve
  const customEase = [0.76, 0, 0.24, 1];

  return (
    <AnimatePresence>
      {phase !== 'done' && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#050505] overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.1,
            filter: "blur(20px)",
            transition: { duration: 0.8, ease: customEase } 
          }}
        >
          {/* Organic Noise Overlay for premium texture */}
          <div 
            className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-screen" 
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}
          />
          
          {/* Very subtle ambient glow in the center */}
          <div className="absolute inset-0 pointer-events-none opacity-40"
               style={{ backgroundImage: 'radial-gradient(circle at center, #1a1a1a 0%, #050505 70%)' }} />

          <div className="relative flex flex-col justify-center w-full max-w-screen-2xl px-6 md:px-12 lg:px-24">
            
            {/* TOP HALF: Name & Percentage */}
            <div className="overflow-hidden pb-4 w-full flex justify-between items-end" style={{ perspective: "1000px" }}>
              <motion.div
                initial={{ y: "150%", rotateX: -40, opacity: 0, filter: "blur(10px)" }}
                animate={phase === 'exit' ? { y: "-100%", opacity: 0, filter: "blur(10px)" } : { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: phase === 'exit' ? 0 : 0.8, duration: 1.2, ease: customEase }}
                className="text-white font-black text-[clamp(3rem,12vw,12rem)] tracking-tighter leading-none uppercase origin-bottom"
                style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
              >
                Oshadha
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={phase === 'exit' ? { opacity: 0, y: "-100%" } : { opacity: 1, y: 0 }}
                transition={{ delay: phase === 'exit' ? 0.1 : 1.2, duration: 0.8, ease: customEase }}
                className="text-[#ff3333] font-mono text-2xl md:text-4xl lg:text-5xl font-light tracking-widest pb-2 md:pb-4"
              >
                {progress}%
              </motion.div>
            </div>

            {/* CENTRAL DIVIDER: The Laser Line */}
            <div className="relative w-full h-[1px] bg-[#222222]">
              <motion.div 
                initial={{ scaleX: 0, originX: 0 }}
                animate={phase === 'exit' ? { scaleX: 0, originX: 1, opacity: 0 } : { scaleX: 1, opacity: 1 }}
                transition={{ duration: phase === 'exit' ? 0.6 : 1.5, ease: customEase }}
                className="absolute inset-0 h-full bg-gradient-to-r from-[#ff3333] via-white to-[#ff3333] shadow-[0_0_15px_rgba(255,51,51,0.8)]"
              />
            </div>

            {/* BOTTOM HALF: Roles & Metadata */}
            <div className="overflow-hidden pt-4 w-full flex justify-between items-start" style={{ perspective: "1000px" }}>
              <motion.div
                initial={{ y: "-150%", rotateX: 40, opacity: 0, filter: "blur(10px)" }}
                animate={phase === 'exit' ? { y: "100%", opacity: 0, filter: "blur(10px)" } : { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)" }}
                transition={{ delay: phase === 'exit' ? 0.05 : 0.9, duration: 1.2, ease: customEase }}
                className="text-[#888888] font-medium text-xs md:text-sm lg:text-lg tracking-[0.2em] md:tracking-[0.4em] uppercase origin-top"
              >
                Backend Developer <span className="text-[#ff3333] px-2">&bull;</span> AI Engineer
              </motion.div>
              
              <motion.div
                initial={{ y: "-150%", opacity: 0 }}
                animate={phase === 'exit' ? { opacity: 0, y: "100%" } : { opacity: 1, y: 0 }}
                transition={{ delay: phase === 'exit' ? 0.15 : 1.3, duration: 1.0, ease: customEase }}
                className="text-[#555555] font-mono text-[10px] md:text-xs tracking-widest text-right"
              >
                PORTFOLIO <br className="md:hidden" />
                <span className="hidden md:inline"> // </span> 
                INIT
              </motion.div>
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Loader;
