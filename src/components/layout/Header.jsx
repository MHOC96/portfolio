import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import MagneticWrapper from '../ui/MagneticWrapper.jsx';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const headerVariants = {
    initial: { y: -100 },
    animate: { y: 0, transition: { type: 'spring', stiffness: 100, damping: 20 } },
  };

  const resumeUrl = import.meta.env.VITE_RESUME_URL || '/resume.pdf';

  return (
    <motion.header
      id="main-header"
      className={`fixed top-0 left-0 right-0 transition-all duration-500 z-50 ${scrolled
          ? 'py-2'
          : 'bg-transparent py-4'
        }`}
      style={scrolled ? {
        backgroundColor: 'var(--color-primary)',
        borderBottom: '2px solid var(--color-border-strong)',
      } : {}}
      variants={headerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="w-full px-4 md:px-10 flex items-center justify-between h-16 relative">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => {
            const element = document.getElementById('home');
            if (element) element.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <div
            className="flex items-center justify-center w-10 h-10 border-2"
            style={{
              background: 'var(--color-red)',
              borderColor: 'var(--color-border-strong)',
              borderRadius: '0px',
              boxShadow: '4px 4px 0px var(--color-border-strong)',
              transform: 'translate(-2px, -2px)',
            }}
          >
            <span className="text-sm font-black tracking-tight text-white font-mono">OC</span>
          </div>
          <div className="hidden lg:block">
            <span className="font-mono text-[10px] tracking-[0.5em] text-accent uppercase font-bold">
              DEVELOPER PORTFOLIO
            </span>
          </div>
        </motion.div>

        {/* Desktop Nav Actions */}
        <div className="hidden md:flex items-center gap-1.5 lg:gap-3 ml-auto">
          {/* Music Player Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-music-player'))}
            className="hidden lg:flex items-center justify-center w-8 h-8 border-2 border-border-strong text-muted hover:border-accent hover:text-accent transition-all duration-300"
            style={{ backgroundColor: 'var(--color-primary)', boxShadow: '3px 3px 0px var(--color-border-strong)' }}
            title="Music Player"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </button>

          {/* Command Palette / Search Bar */}
          <div
            className="hidden lg:flex items-center gap-2 px-3 py-1.5 border-2 border-border-strong text-muted hover:border-accent hover:text-accent transition-all duration-300 cursor-text group mr-2"
            style={{ backgroundColor: 'var(--color-primary)', boxShadow: '4px 4px 0px var(--color-border-strong)' }}
            onClick={() => window.dispatchEvent(new CustomEvent('open-terminal'))}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:text-red transition-colors"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <span className="text-[10px] font-mono tracking-widest uppercase opacity-70">Terminal...</span>
            <kbd className="ml-4 px-1.5 py-0.5 text-[9px] font-mono border border-border-strong text-accent opacity-60">⌘K</kbd>
          </div>

          {/* Separate Resume Button */}
          <MagneticWrapper strength={0.4}>
            <motion.a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="px-3 lg:px-4 py-1.5 bg-red text-white font-mono text-[9px] lg:text-[10px] font-bold tracking-widest uppercase border-2 border-accent hover:translate-y-[-2px] hover:shadow-[4px 4px 0px_var(--color-accent)] transition-all duration-200"
              style={{
                backgroundColor: 'var(--color-red)',
                borderColor: 'var(--color-accent)',
                boxShadow: scrolled ? '2px 2px 0px var(--color-accent)' : '3px 3px 0px var(--color-accent)',
              }}
            >
              RESUME
            </motion.a>
          </MagneticWrapper>

          <ThemeToggle />
        </div>

        {/* Mobile Nav */}
        <div className="flex md:hidden items-center gap-3 ml-auto">
          <ThemeToggle />
          
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-music-player'))}
            className="text-muted p-2 focus:outline-none z-[70] border-2 border-border-strong hover:text-accent"
            style={{ boxShadow: '2px 2px 0px var(--color-border-strong)', backgroundColor: 'var(--color-primary)' }}
            title="Music Player"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>
          </button>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-accent p-2 focus:outline-none z-[70] border-2 border-border-strong"
            style={{ boxShadow: '2px 2px 0px var(--color-border-strong)', backgroundColor: 'var(--color-primary)' }}
            onClick={() => window.dispatchEvent(new CustomEvent('open-terminal'))}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
