import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { PROJECTS_META } from '../../data/projectsMeta';

const formatProjectsOutput = () =>
  PROJECTS_META.map((project, index) => {
    const links = [
      project.liveLink ? `Live: ${project.liveLink}` : null,
      project.githubLink ? `GitHub: ${project.githubLink}` : null,
    ].filter(Boolean);

    return `${index + 1}. ${project.title}\n   - Tech: ${project.tech.join(', ')}\n   ${links.length ? `- ${links.join('\n   - ')}` : '- Links: none listed'}`;
  }).join('\n\n');

const MhocTerminalIcon = () => (
    <div className="w-12 h-12 border-2 border-red bg-red/10 flex items-center justify-center font-mono text-sm font-black text-red my-3">
        MHOC
    </div>
);

const FloatingTerminal = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const { accentColor, setAccentColor, isLowPerf, setIsLowPerf } = useTheme();
    const [input, setInput] = useState('');
    const [history, setHistory] = useState([
        { type: 'output', content: 'MHOC_OS Terminal [Version 2.0.1]\n(c) Oshadha Canchana. All rights reserved.\nType "help" for a list of available commands.' }
    ]);
    
    const scrollRef = useRef(null);
    const inputRef = useRef(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    useEffect(() => {
        if (isMaximized) {
            x.set(0);
            y.set(0);
        }
    }, [isMaximized, x, y]);

    useEffect(() => {
        const handleOpen = () => {
            setIsOpen(true);
            setIsMinimized(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        };
        window.addEventListener('open-floating-terminal', handleOpen);
        return () => window.removeEventListener('open-floating-terminal', handleOpen);
    }, []);

    useEffect(() => {
        if (!isMinimized && isOpen) {
            scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [history, isMinimized, isOpen]);

    useEffect(() => {
        if (isOpen && !isMinimized) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen, isMinimized]);

    const executeCommand = (cmd) => {
        const trimmed = cmd.trim();
        if (!trimmed) return;
        
        const newHistory = [...history, { type: 'input', content: trimmed }];
        const lowerCmd = trimmed.toLowerCase();

        if (lowerCmd === 'clear') {
            setHistory([]);
            setInput('');
            return;
        } else if (lowerCmd === 'exit') {
            setIsOpen(false);
            setInput('');
            return;
        } else if (lowerCmd === 'help') {
            newHistory.push({ type: 'output', content: 'AVAILABLE COMMANDS:\n  help     - Show this message\n  skills   - View developer skills\n  projects - View featured projects\n  date     - Show system date\n  status   - Show system status\n  theme    - Toggle accent color\n  fps      - Toggle high FPS/perf mode\n  whoami   - Current user info\n  mhoc     - Summon MHOC AI\n  clear    - Clear terminal output\n  exit     - Close terminal' });
        } else if (lowerCmd === 'skills') {
            newHistory.push({ 
                type: 'output', 
                content: 'OSHADHA\'S SKILLS:\n  [Languages]\n    - Python, Java, C#\n  [Frameworks]\n    - Django, FastAPI, Flask, Spring Boot\n  [AI Engineering]\n    - RAG, MCP, LangChain, LangGraph\n  [ML & Data]\n    - Scikit-Learn, Pandas, NumPy, Matplotlib, Seaborn\n  [DevOps & DB]\n    - Docker, Vercel, Railway, CI/CD, PostgreSQL, MySQL\n  [Frontend]\n    - HTML5, CSS3, JavaScript' 
            });
        } else if (lowerCmd === 'projects') {
            newHistory.push({
                type: 'output',
                content: `OSHADHA'S PROJECTS:\n\n${formatProjectsOutput()}`
            });
        } else if (lowerCmd === 'whoami') {
            newHistory.push({ type: 'output', content: 'MHOC96 / Oshadha Canchana\nRole: Backend Developer | Python Developer | AI Engineer\nLocation: Web\nStatus: Available for hire' });
        } else if (lowerCmd === 'mhoc' || lowerCmd === 'zoro') {
            window.dispatchEvent(new CustomEvent('open-mhoc'));
            newHistory.push({ 
                type: 'component', 
                content: (
                    <div className="flex flex-col gap-2 mt-2 mb-2 font-mono">
                        <MhocTerminalIcon />
                        <div className="text-red font-bold">MHOC AI ASSISTANT:</div>
                        <div className="text-accent italic">"Ready to help you explore Oshadha\'s portfolio."</div>
                        <div className="text-muted text-xs">[sys] initiating system link to MHOC assistant...</div>
                    </div>
                )
            });
        } else if (lowerCmd === 'date') {
            newHistory.push({ type: 'output', content: `CURRENT_SYSTEM_TIME: ${new Date().toLocaleString()}` });
        } else if (lowerCmd === 'status') {
            newHistory.push({ type: 'output', content: `[SYSTEM_STATUS_REPORT]\nUPTIME: 12h 43m 12s\nMEMORY: 1.4GB / 4.0GB [|||||-----]\nCPU: 12% LOAD\nALL SYSTEMS NOMINAL` });
        } else if (lowerCmd === 'theme') {
            const nextAccent = accentColor === 'red' ? 'green' : 'red';
            setAccentColor(nextAccent);
            newHistory.push({ type: 'output', content: `Accent theme switched to ${nextAccent.toUpperCase()}` });
        } else if (lowerCmd === 'fps' || lowerCmd === 'perf' || lowerCmd === 'performance') {
            const nextVal = !isLowPerf;
            setIsLowPerf(nextVal);
            newHistory.push({ 
                type: 'output', 
                content: nextVal 
                    ? 'HIGH FPS MODE: ON\n- Particles disabled\n- Interactive mouse-glow grid disabled\n- Click ripples disabled\nEnjoy maximum performance!'
                    : 'HIGH FPS MODE: OFF\n- All background particles and visual animations restored.' 
            });
        } else {
            newHistory.push({ type: 'output', content: `Command not found: "${trimmed}". Type "help" for commands.` });
        }

        setHistory(newHistory);
        setInput('');
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            executeCommand(input);
        }
    };

    if (!isOpen) return null;

    if (isMinimized) {
        return (
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-4 right-4 z-[9999]"
            >
                <button 
                    onClick={() => { setIsMinimized(false); setTimeout(() => inputRef.current?.focus(), 100); }}
                    className="flex items-center gap-2 bg-secondary border-2 border-border-strong px-4 py-2 hover:border-accent transition-colors font-mono shadow-[4px_4px_0px_var(--color-border-strong)]"
                >
                    <span className="text-accent font-bold">&gt;_</span>
                    <span className="text-accent text-sm">Terminal (Running)</span>
                </button>
            </motion.div>
        );
    }

    const modalVariants = {
        normal: { width: 'min(90vw, 600px)', height: '400px', top: 'auto', left: 'auto', bottom: '20vh', right: '5vw', opacity: 1, scale: 1 },
        maximized: { width: '100vw', height: '100vh', top: 0, left: 0, bottom: 'auto', right: 'auto', opacity: 1, scale: 1 }
    };

    return (
        <AnimatePresence>
            <motion.div 
                drag={!isMaximized}
                dragMomentum={false}
                dragConstraints={{ top: 0, bottom: typeof window !== 'undefined' ? window.innerHeight - 50 : 1000 }}
                dragElastic={0.1}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={isMaximized ? "maximized" : "normal"}
                variants={modalVariants}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                style={isMaximized ? { position: 'fixed' } : { x, y, position: 'fixed' }}
                className={`z-[9999] bg-secondary/95 backdrop-blur-md border-2 border-border-strong flex flex-col font-mono shadow-[8px_8px_0px_rgba(0,0,0,0.5)] overflow-hidden ${isMaximized ? 'border-0 rounded-none' : 'rounded-sm'}`}
            >
                {/* Window Controls Header */}
                <div 
                    className="flex items-center justify-between px-3 py-2 border-b-2 border-border-strong bg-primary select-none cursor-move"
                >
                    <div className="flex gap-2">
                        <span className="text-xs text-muted tracking-widest uppercase">MHOC_OS / Terminal</span>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={() => setIsMinimized(true)} className="text-muted hover:text-accent focus:outline-none">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        </button>
                        <button onClick={() => setIsMaximized(!isMaximized)} className="text-muted hover:text-green-500 focus:outline-none">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect></svg>
                        </button>
                        <button onClick={() => setIsOpen(false)} className="text-muted hover:text-red focus:outline-none">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                {/* Terminal Content */}
                <div className="flex-1 overflow-y-auto p-4 text-sm scrollbar-hide">
                    {history.map((line, i) => (
                        <div key={i} className="mb-2 break-words">
                            {line.type === 'input' ? (
                                <div className="flex text-muted">
                                    <span className="mr-2 text-accent">&gt;</span>
                                    <span className="text-accent">{line.content}</span>
                                </div>
                            ) : line.type === 'component' ? (
                                line.content
                            ) : (
                                <div className="text-muted leading-relaxed whitespace-pre-wrap">{line.content}</div>
                            )}
                        </div>
                    ))}
                    <div className="flex items-center gap-2 mt-2">
                        <span className="text-accent font-bold">&gt;</span>
                        <input
                            ref={inputRef}
                            className="flex-1 bg-transparent border-none outline-none text-accent font-mono caret-accent"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            spellCheck={false}
                            autoComplete="off"
                        />
                    </div>
                    <div ref={scrollRef} />
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default FloatingTerminal;
