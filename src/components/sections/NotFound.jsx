import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

const BOOT_LINES = [
  'INITIATING_SYSTEM_LOOKUP...',
  'SCANNING_ROUTE_TABLE...',
  'RESOLVING_PATH: [NULL]',
  'ERR_CODE: 0x404 — PAGE_NOT_FOUND',
  'RECOMMENDATION: RETURN_TO_HOME_BASE',
];

const NotFound = () => {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    if (visibleLines >= BOOT_LINES.length) return;
    const timer = setTimeout(() => setVisibleLines(v => v + 1), 280);
    return () => clearTimeout(timer);
  }, [visibleLines]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-primary text-accent font-mono px-6">
      {/* Decorative corner brackets */}
      <div className="fixed top-4 left-4 text-accent/20 text-xs tracking-widest uppercase">SYS::ERR</div>
      <div className="fixed top-4 right-4 text-red/30 text-xs tracking-widest font-bold animate-pulse">CRITICAL</div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl"
      >
        {/* Giant 404 Display */}
        <div className="mb-8">
          <div
            className="text-[120px] md:text-[160px] font-black leading-none tracking-tighter select-none"
            style={{ color: 'var(--color-red)', textShadow: '6px 6px 0px var(--color-accent)' }}
          >
            404
          </div>
          <div className="text-sm md:text-base uppercase tracking-[0.4em] text-muted mt-2">
            PAGE_NOT_FOUND
          </div>
        </div>

        {/* Terminal Boot Log */}
        <div
          className="border-2 p-4 mb-8 bg-secondary/30"
          style={{ borderColor: 'var(--color-accent)', boxShadow: '4px 4px 0px var(--color-accent)' }}
        >
          <div className="text-[10px] uppercase tracking-widest text-muted mb-3 border-b border-border-strong pb-2">
            SYSTEM_LOG — ROUTE_RESOLVER_v2.4
          </div>
          <div className="space-y-1.5 text-[12px]">
            {BOOT_LINES.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={i === BOOT_LINES.length - 1 ? 'text-red font-bold' : 'text-muted'}
              >
                <span className="text-accent/50 mr-2">[{String(i).padStart(2, '0')}]</span>
                {line}
              </motion.div>
            ))}
            {visibleLines < BOOT_LINES.length && (
              <span className="inline-block w-2 h-4 bg-accent animate-pulse" />
            )}
          </div>
        </div>

        {/* Action Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-3 font-bold text-xs tracking-widest uppercase px-6 py-3 border-2 transition-all"
          style={{
            borderColor: 'var(--color-accent)',
            color: 'var(--color-accent)',
            boxShadow: '4px 4px 0px var(--color-accent)',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translate(2px, 2px)';
            e.currentTarget.style.boxShadow = '2px 2px 0px var(--color-accent)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translate(0,0)';
            e.currentTarget.style.boxShadow = '4px 4px 0px var(--color-accent)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          RETURN_TO_HOME_BASE
        </Link>
      </motion.div>
    </div>
  );
};

export default NotFound;
