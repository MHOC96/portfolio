import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PORTFOLIO_SYSTEM_INSTRUCTION } from '../../data/buildPortfolioContext';
import ChatMessageContent from './ChatMessageContent';

const groqApiKey = import.meta.env.VITE_GROQ_API_KEY?.split(',')[0]?.trim();
const groqModel = import.meta.env.VITE_GROQ_MODEL?.trim() || 'openai/gpt-oss-120b';

const MHOC_ICON = '/naruto-icon.svg';

const buildGroqMessages = (history) => [
  { role: 'system', content: PORTFOLIO_SYSTEM_INSTRUCTION },
  ...history
    .filter((msg) => !msg.text.startsWith('ERROR:'))
    .map((msg) => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.text,
    })),
];

const parseGroqError = async (response) => {
  try {
    const data = await response.json();
    return data?.error?.message || JSON.stringify(data);
  } catch {
    return response.statusText || 'Unknown error';
  }
};

const streamGroqChat = async (history, onChunk) => {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${groqApiKey}`,
    },
    body: JSON.stringify({
      model: groqModel,
      messages: buildGroqMessages(history),
      temperature: 0.3,
      max_completion_tokens: 400,
      stream: true,
      reasoning_effort: 'low',
    }),
  });

  if (!response.ok) {
    throw new Error(await parseGroqError(response));
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Streaming is not supported in this browser.');
  }

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;

      const data = line.slice(6).trim();
      if (!data || data === '[DONE]') continue;

      try {
        const parsed = JSON.parse(data);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) onChunk(content);
      } catch {
        // Ignore malformed stream chunks.
      }
    }
  }
};

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'INITIATING SYSTEM... Hello! I am MHOC, Oshadha\'s AI Assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const messagesContainerRef = useRef(null);

  const SUGGESTIONS = [
    "What's your tech stack?",
    "Tell me about your projects.",
    "Who are you, MHOC?",
    "Are you open to work?"
  ];

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, isTyping]);

  useEffect(() => {
    const handleOpenMhoc = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-mhoc', handleOpenMhoc);
    return () => window.removeEventListener('open-mhoc', handleOpenMhoc);
  }, []);

  useEffect(() => {
    if (!sessionStorage.getItem('mhocTooltipShown')) {
      setShowTooltip(true);
      sessionStorage.setItem('mhocTooltipShown', 'true');
      
      const timer = setTimeout(() => setShowTooltip(false), 8000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    const wrapper = document.getElementById('main-portfolio-wrapper');
    const header = document.getElementById('main-header');
    
    if (wrapper && header) {
      wrapper.style.transition = 'padding-right 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      header.style.transition = 'right 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
      
      if (isOpen && window.innerWidth >= 768) {
        wrapper.style.paddingRight = '384px';
        header.style.right = '384px';
      } else {
        wrapper.style.paddingRight = '0px';
        header.style.right = '0px';
      }
    }
  }, [isOpen]);

  const handleSend = async (e, forcedInput = null) => {
    if (e) e.preventDefault();
    
    const userMsg = forcedInput || input;
    if (!userMsg.trim()) return;

    if (requestCount >= 4) {
      setMessages(prev => [...prev, { role: 'bot', text: "SYSTEM LIMIT REACHED: You've exhausted your requests (4/4). Let me rest." }]);
      return;
    }

    const nextMessages = [...messages, { role: 'user', text: userMsg }];
    setInput('');
    setMessages(nextMessages);
    setIsTyping(true);
    setRequestCount(prev => prev + 1);

    if (!groqApiKey) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'bot', text: "ERROR: Missing VITE_GROQ_API_KEY in .env file. I am operating without true intelligence right now." }]);
        setIsTyping(false);
      }, 1000);
      return;
    }

    try {
      let botStarted = false;

      await streamGroqChat(nextMessages, (chunk) => {
        if (!botStarted) {
          botStarted = true;
          setIsTyping(false);
          setMessages((prev) => [...prev, { role: 'bot', text: chunk }]);
          return;
        }

        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role !== 'bot') return prev;
          updated[updated.length - 1] = { ...last, text: last.text + chunk };
          return updated;
        });
      });

      if (!botStarted) {
        setMessages((prev) => [...prev, { role: 'bot', text: 'ERROR: Empty response from Groq.' }]);
      }
    } catch (error) {
      console.error('AI Error:', error);
      const detail = error?.message || 'Unknown error';
      setMessages(prev => [...prev, {
        role: 'bot',
        text: `ERROR: Communication link severed. (${detail})`
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed top-0 right-0 h-screen z-50 pointer-events-none">
      
      <AnimatePresence>
        {!isOpen && showTooltip && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: 1.5, duration: 0.5 }}
            className="absolute top-1/2 -translate-y-1/2 right-20 mr-2 pointer-events-none whitespace-nowrap hidden md:block"
          >
            <span className="font-mono text-[10px] sm:text-xs tracking-widest text-muted font-bold uppercase bg-primary px-2 py-1 border-2 border-border-strong shadow-[-4px_4px_0px_var(--color-border-strong)]">
              Interact with MHOC <span className="text-red ml-1">→</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>
 
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setShowTooltip(false);
        }}
        className={`absolute top-1/2 -translate-y-1/2 right-0 bg-primary border-y-2 border-l-2 border-border-strong flex flex-col items-center justify-center py-4 md:py-6 px-2 md:px-3 transition-all duration-300 z-40 hover:bg-red group pointer-events-auto ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100 shadow-[-4px_4px_0px_var(--color-border-strong)] hover:-translate-x-1 hover:shadow-[-8px_4px_0px_var(--color-border-strong)]'}`}
        title="Ask MHOC"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
          <img
            src={MHOC_ICON}
            alt="MHOC"
            className="w-full h-full object-contain brightness-0 invert opacity-90"
          />
        </div>
        <div 
          className="font-mono text-xs md:text-sm font-bold tracking-widest text-accent group-hover:text-white transition-colors uppercase"
          style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
        >
          Ask MHOC
        </div>
      </button>
 
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={
              typeof window !== 'undefined' && window.innerWidth < 768
                ? { duration: 0.25, ease: 'easeOut' }
                : { type: 'spring', damping: 25, stiffness: 150 }
            }
            className="absolute right-0 top-0 w-full sm:w-96 bg-primary border-l-2 border-border-strong flex flex-col shadow-none sm:shadow-[-12px_0px_0px_var(--color-border-strong)] overflow-hidden pointer-events-auto h-screen"
          >
            <div 
              className="absolute inset-0 pointer-events-none opacity-20 z-0" 
              style={{
                backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 4px, 3px 100%'
              }}
            />

            <div className="bg-border-strong text-primary p-4 flex justify-between items-center font-mono text-sm font-bold tracking-widest relative z-10 border-b-2 border-border-strong">
              <div className="flex items-center gap-2">
                <img
                  src={MHOC_ICON}
                  alt=""
                  aria-hidden="true"
                  className="w-5 h-5 object-contain brightness-0 invert opacity-90"
                />
                <span className="w-2 h-2 bg-red rounded-full animate-pulse shadow-[0_0_8px_var(--color-red)]"></span>
                <span>MHOC // ONLINE</span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-1.5 bg-red text-white hover:bg-primary hover:text-border-strong transition-all px-3 py-1 border-2 border-white hover:border-border-strong font-mono text-xs font-bold shadow-[-2px_2px_0px_white] hover:shadow-[-2px_2px_0px_var(--color-border-strong)]"
              >
                <span>CLOSE</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div
              ref={messagesContainerRef}
              data-lenis-prevent
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 flex flex-col gap-4 font-mono text-xs relative z-10"
            >
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[85%] p-3 ${
                      msg.role === 'user' 
                        ? 'bg-accent text-primary' 
                        : 'bg-red/10 border-l-2 border-red text-light shadow-[4px_4px_0px_var(--color-border-strong)]'
                    }`}
                  >
                    <div className="opacity-60 text-[10px] mb-1">{msg.role === 'user' ? 'USR_CMD>' : 'MHOC_SYS>'}</div>
                    {msg.role === 'bot' ? (
                      <ChatMessageContent text={msg.text} />
                    ) : (
                      <div className="leading-relaxed whitespace-pre-wrap break-words">{msg.text}</div>
                    )}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-3 bg-red/10 border-l-2 border-red text-light shadow-[4px_4px_0px_var(--color-border-strong)]">
                    <div className="opacity-60 text-[10px] mb-1">{"MHOC_SYS>"}</div>
                    <div className="flex items-center gap-1 h-4">
                      <span className="w-1.5 h-1.5 bg-red animate-bounce rounded-full" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-red animate-bounce rounded-full" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-1.5 h-1.5 bg-red animate-bounce rounded-full" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {requestCount < 4 && messages.length < 4 && !isTyping && (
              <div className="flex flex-wrap gap-2 px-4 pb-4 font-mono text-[10px] relative z-10 mt-auto">
                {SUGGESTIONS.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => handleSend(null, s)}
                    className="bg-primary border-2 border-border-strong text-muted px-2 py-1.5 md:hover:bg-red md:hover:text-white md:hover:border-red md:hover:-translate-y-0.5 md:hover:shadow-[2px_2px_0px_var(--color-red)] active:bg-red active:text-white active:border-red transition-all text-left"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSend} className="border-t-2 border-border-strong p-4 flex gap-2 bg-primary relative z-10 pb-6">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="EXECUTE COMMAND..."
                className="flex-1 bg-transparent border-2 border-border-strong p-3 font-mono text-xs text-light focus:outline-none focus:border-red focus:shadow-[2px_2px_0px_var(--color-red)] transition-all"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="bg-red text-primary px-5 font-mono text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-light hover:shadow-[4px_4px_0px_var(--color-border-strong)] transition-all border-2 border-transparent hover:border-border-strong"
              >
                SEND
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
