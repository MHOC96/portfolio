import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';


const COMMAND_OPTIONS = [
    { id: 'terminal', label: 'Open Terminal', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg> },
    { id: 'home', label: 'Go to Home', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg> },
    { id: 'skills', label: 'View Skills', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg> },
    { id: 'projects', label: 'View Projects', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg> },
    { id: 'education', label: 'Education', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg> },
    { id: 'contact', label: 'Contact Me', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> },
    { id: 'resume', label: 'Download Resume', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> },
    { id: 'theme', label: 'Toggle Theme', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg> }
];

const TerminalFeature = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { accentColor, setAccentColor } = useTheme();
    const [input, setInput] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const listRef = useRef(null);
    const inputRef = useRef(null);

    const filteredOptions = useMemo(() => {
        if (!input.trim()) return COMMAND_OPTIONS;
        const query = input.toLowerCase();
        return COMMAND_OPTIONS.filter(opt => 
            opt.id.toLowerCase().includes(query) || 
            opt.label.toLowerCase().includes(query)
        );
    }, [input]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [input]);

    const handleKeyDown = useCallback((e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            setIsOpen((prev) => !prev);
        }
    }, []);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        const handleOpenTerminal = () => {
            setIsOpen((prev) => !prev);
            setTimeout(() => {
                if (window.innerWidth >= 768) {
                    inputRef.current?.focus();
                }
            }, 100);
        };
        window.addEventListener('open-terminal', handleOpenTerminal);
        return () => window.removeEventListener('open-terminal', handleOpenTerminal);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const executeCommand = (cmdId) => {
        const navigateTo = (sectionId) => {
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth' });
                setTimeout(() => setIsOpen(false), 300);
            }
        };

        const SECTIONS = ['home', 'skills', 'projects', 'education', 'contact'];

        if (SECTIONS.includes(cmdId)) {
            navigateTo(cmdId);
        } else if (cmdId === 'terminal') {
            window.dispatchEvent(new CustomEvent('open-floating-terminal'));
            setIsOpen(false);
        } else if (cmdId === 'resume') {
            const resumeUrl = '/resume.pdf';
            window.open(resumeUrl, '_blank');
            setIsOpen(false);
        } else if (cmdId === 'theme') {
            const nextAccent = accentColor === 'red' ? 'green' : 'red';
            setAccentColor(nextAccent);
            setIsOpen(false);
        }

        setInput('');
    };

    const handleInputKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => Math.min(prev + 1, filteredOptions.length - 1));
            // scroll list down if needed
            const item = listRef.current?.children[selectedIndex + 1];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => Math.max(prev - 1, 0));
            const item = listRef.current?.children[selectedIndex - 1];
            item?.scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredOptions.length > 0) {
                executeCommand(filteredOptions[selectedIndex].id);
            } else if (input.trim() !== '') {
                executeCommand(input.trim().toLowerCase());
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div 
                    className="fixed inset-0 z-[110] flex items-start justify-center pt-[10vh] px-4 bg-primary/80 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setIsOpen(false) }}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="w-full max-w-2xl bg-secondary border-2 border-border-strong flex flex-col font-mono shadow-2xl relative"
                        style={{ boxShadow: '8px 8px 0px var(--color-border-strong)' }}
                    >
                        {/* Input Header */}
                        <div className="flex items-center px-4 py-4 border-b-2 border-border-strong gap-3 bg-primary/90 min-h-[60px]">
                            <span className={`${accentColor === 'green' ? 'text-green-500' : 'text-red'} font-bold`}>&gt;</span>
                            <input
                                ref={inputRef}
                                className="flex-1 bg-transparent border-none outline-none text-accent text-base lg:text-lg placeholder:text-muted/50"
                                placeholder="Search sections or run command..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                            />
                            <kbd className="hidden sm:inline-block px-2 py-1 text-[10px] font-mono border border-border-strong text-muted rounded-sm">ESC</kbd>
                        </div>

                        {/* Command Options View */}
                        <div className="flex flex-col max-h-[60vh] overflow-hidden">
                            {/* Command Options */}
                            <div className="flex-1 overflow-y-auto p-2 scrollbar-hide" ref={listRef}>
                                {filteredOptions.length > 0 ? (
                                    filteredOptions.map((opt, i) => {
                                        const isSelected = i === selectedIndex;
                                        return (
                                            <div 
                                                key={opt.id}
                                                className={`flex items-center gap-3 px-3 py-3 min-h-[48px] cursor-pointer transition-colors border-l-2 ${isSelected ? 'bg-border-strong/30 border-accent' : 'border-transparent hover:bg-border-strong/10'}`}
                                                onClick={() => executeCommand(opt.id)}
                                                onMouseEnter={() => setSelectedIndex(i)}
                                            >
                                                <div className={`text-muted ${isSelected ? 'text-accent' : ''}`}>
                                                    {opt.icon}
                                                </div>
                                                <span className={`text-sm tracking-wide ${isSelected ? 'text-accent' : 'text-muted'}`}>
                                                    {opt.label}
                                                </span>
                                                <span className="ml-auto text-[10px] text-muted/40 uppercase">
                                                    {opt.id}
                                                </span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="p-4 text-center text-muted text-sm italic">
                                        No matching commands or sections found. Press enter to run as terminal command.
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default TerminalFeature;
