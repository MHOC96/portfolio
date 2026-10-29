import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RESUME_OPTIONS, openResumeUrl } from '../../data/resumeLinks';

const ResumePicker = ({ forceOpen = false, onClose }) => {
  const [isOpen, setIsOpen] = useState(forceOpen);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (forceOpen) setIsOpen(true);
  }, [forceOpen]);

  useEffect(() => {
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-resume-picker', handleOpen);
    return () => window.removeEventListener('open-resume-picker', handleOpen);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, close]);

  const handlePick = (url) => {
    openResumeUrl(url);
    close();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="resume-picker-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close resume picker"
            onClick={close}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md bg-primary border-2 border-border-strong shadow-[8px_8px_0px_var(--color-border-strong)] font-mono"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border-strong bg-secondary">
              <div>
                <p className="text-[10px] text-red uppercase tracking-widest mb-0.5">// RESUME.SELECT</p>
                <h2 id="resume-picker-title" className="text-sm font-bold text-accent uppercase tracking-wider">
                  Choose your focus
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                className="p-1.5 text-muted hover:text-red border-2 border-transparent hover:border-border-strong transition-colors"
                aria-label="Close"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="p-4 flex flex-col gap-3">
              {RESUME_OPTIONS.length === 0 ? (
                <p className="text-xs text-muted uppercase tracking-wide">
                  Resume links are not configured. Set VITE_RESUME_BACKEND_URL and VITE_RESUME_AI_URL in your environment.
                </p>
              ) : (
                RESUME_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handlePick(option.url)}
                    className="text-left p-4 border-2 border-border-strong bg-secondary hover:border-red hover:shadow-[4px_4px_0px_var(--color-red)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all group"
                  >
                    <span className="block text-sm font-bold text-accent uppercase tracking-wider group-hover:text-red">
                      {option.label}
                    </span>
                    <span className="block text-[10px] text-muted mt-1 uppercase tracking-wide">{option.description}</span>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ResumePicker;

export const openResumePicker = () => {
  window.dispatchEvent(new CustomEvent('open-resume-picker'));
};
