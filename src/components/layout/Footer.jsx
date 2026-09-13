import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary py-12" style={{ borderTop: '1px solid var(--color-border-strong)' }} itemScope itemType="https://schema.org/WPFooter">
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

            <address style={{ fontStyle: 'normal' }}>
              <div className="flex items-center gap-4">
                <a href="https://github.com/MHOC96" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-red transition-colors" aria-label="Oshadha Canchana on GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </a>
                <a href="https://www.linkedin.com/in/oshadha-canchana/" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-red transition-colors" aria-label="Oshadha Canchana on LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="square" strokeLinejoin="miter">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                  </svg>
                </a>
                <a href="https://wa.me/94701246602" target="_blank" rel="noopener noreferrer" className="text-muted hover:text-red transition-colors" aria-label="Contact Oshadha Canchana on WhatsApp">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
                  </svg>
                </a>
              </div>
            </address>
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