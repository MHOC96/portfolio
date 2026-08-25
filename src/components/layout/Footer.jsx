import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary py-12" style={{ borderTop: '1px solid var(--color-border-strong)' }}>
      <div className="container-custom">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 md:mb-0"
          >
            <div className="flex items-center mb-4 gap-3">
              <div
                className="flex items-center justify-center w-10 h-10 border-2"
                style={{
                  background: 'var(--color-red)',
                  borderColor: 'var(--color-border-strong)',
                  boxShadow: '4px 4px 0px var(--color-border-strong)',
                }}
              >
                <span className="text-[9px] font-black tracking-tighter text-white font-mono">MHOC</span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.5em] text-accent uppercase font-bold">DEVELOPER PORTFOLIO</span>
            </div>
            <p className="text-muted text-[10px] font-mono uppercase tracking-widest border-2 w-fit px-2 py-1 border-border-strong">
              Backend & AI Engineer
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col md:flex-row items-center gap-6 md:ml-auto"
          >
            <div className="flex space-x-6">
              <a href="#home" className="text-muted hover:text-light transition-colors uppercase tracking-widest text-[10px] font-mono">HOME</a>
              <a href="#projects" className="text-muted hover:text-light transition-colors uppercase tracking-widest text-[10px] font-mono">PROJECTS</a>
              <a href="#skills" className="text-muted hover:text-light transition-colors uppercase tracking-widest text-[10px] font-mono">SKILLS</a>
              <a href="#contact" className="text-muted hover:text-light transition-colors uppercase tracking-widest text-[10px] font-mono">CONTACT</a>
            </div>

            <div className="h-4 w-px bg-border-strong hidden md:block"></div>

            <div className="flex items-center gap-4">
              <a href="https://github.com/MHOC96" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-red transition-colors" aria-label="GitHub">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
              <a href="https://www.linkedin.com/in/oshadha-canchana/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-red transition-colors" aria-label="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
            </div>
          </motion.div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row items-center justify-between" style={{ borderTop: '2px solid var(--color-border-strong)' }}>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-sm font-mono tracking-widest uppercase text-muted mb-4 md:mb-0"
          >
            © {currentYear} Oshadha Canchana. All rights reserved.
          </motion.p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;