import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { lockScroll, unlockScroll } from '../../lib/scrollLock';
import { hasSinhalaScript } from '../../lib/parseMobileChatMessage';
import ChatMessageContent from './ChatMessageContent';
import MobileChatMessage from './MobileChatMessage';

const MHOC_ICON = '/naruto-icon.svg';
const SESSION_STORAGE_KEY = 'mhoc_chat_messages_v1';
const MAX_INPUT_LENGTH = 2000;
const REQUEST_TIMEOUT_MS = 45000;

const FRIENDLY_ERROR = "I'm having trouble responding right now. Please try again in a moment.";
const OFFLINE_ERROR = 'You appear to be offline. Check your connection and try again.';
const TIMEOUT_ERROR = 'The request timed out. Please try again.';
const STOPPED_ERROR = 'Response stopped before completion.';

const SUGGESTIONS = [
  "What's your tech stack?",
  'Tell me about your projects.',
  'Who are you, MHOC?',
  'Are you open to work?',
];

const WELCOME_TEXT =
  "INITIATING SYSTEM... Hello! I am MHOC, Oshadha's AI Assistant. How can I help you today?";

const createMessage = (role, text, extra = {}) => ({
  id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  role,
  text,
  timestamp: Date.now(),
  ...extra,
});

const createInitialMessages = () => [
  {
    id: 'welcome-1',
    role: 'bot',
    text: WELCOME_TEXT,
    timestamp: Date.now(),
  },
];

const loadStoredMessages = () => {
  if (typeof window === 'undefined') return createInitialMessages();
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return createInitialMessages();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return createInitialMessages();
    const valid = parsed.filter(
      (msg) =>
        msg &&
        (msg.role === 'user' || msg.role === 'bot') &&
        typeof msg.text === 'string' &&
        msg.text.trim().length > 0 &&
        !msg.isError
    );
    return valid.length > 0 ? valid : createInitialMessages();
  } catch {
    return createInitialMessages();
  }
};

const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
};

const buildChatMessages = (history) => {
  const clean = history.filter(
    (msg) =>
      msg &&
      !msg.isError &&
      typeof msg.text === 'string' &&
      msg.text.trim().length > 0 &&
      !msg.text.startsWith('ERROR:') &&
      msg.text !== FRIENDLY_ERROR
  );

  // Collapse consecutive user turns (e.g. from earlier failed turns) so the API never receives back-to-back user messages.
  const paired = [];
  for (const msg of clean) {
    const role = msg.role === 'user' ? 'user' : 'assistant';
    const prev = paired[paired.length - 1];
    if (role === 'user' && prev?.role === 'user') {
      paired[paired.length - 1] = { role, content: msg.text };
    } else {
      paired.push({ role, content: msg.text });
    }
  }
  return paired;
};

const parseApiError = async (response) => {
  try {
    const data = await response.json();
    return data?.error || JSON.stringify(data);
  } catch {
    return response.statusText || 'Unknown error';
  }
};

// Chat requests go through our own /api/chat proxy; the provider (Groq/Gemini) is chosen server-side.
const streamChat = async (history, onChunk, signal) => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: buildChatMessages(history) }),
    signal,
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error('Streaming is not supported in this browser.');
  }

  const decoder = new TextDecoder();

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value, { stream: true });
      if (text) onChunk(text);
    }
    const trailing = decoder.decode();
    if (trailing) onChunk(trailing);
  } finally {
    reader.releaseLock?.();
  }
};

function MhocAvatarBadge({ size = 'sm' }) {
  const boxClass = size === 'md' ? 'w-8 h-8 rounded-lg' : 'w-5 h-5 rounded-md';
  const imgClass = size === 'md' ? 'w-4 h-4' : 'w-3.5 h-3.5';

  return (
    <span
      aria-hidden="true"
      className={`${boxClass} bg-[#161616] border border-[var(--color-border)] flex items-center justify-center shrink-0`}
    >
      <img
        src={MHOC_ICON}
        alt=""
        className={`${imgClass} object-contain brightness-0 invert opacity-95`}
      />
    </span>
  );
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 768 : false
  );
  const [messages, setMessages] = useState(loadStoredMessages);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [showJumpToLatest, setShowJumpToLatest] = useState(false);
  const [viewportMetrics, setViewportMetrics] = useState(null);

  const messagesContainerRef = useRef(null);
  const isNearBottomRef = useRef(true);
  const pendingUserScrollRef = useRef(false);
  const prevIsOpenRef = useRef(false);
  const inFlightRef = useRef(false);
  const abortControllerRef = useRef(null);
  const abortReasonRef = useRef(null);
  const requestEpochRef = useRef(0);

  const mobileTriggerRef = useRef(null);
  const mobileCloseBtnRef = useRef(null);
  const mobileTextareaRef = useRef(null);
  const pushedHistoryRef = useRef(false);
  const shouldRestoreFocusRef = useRef(false);

  const isBusy = isTyping || isStreaming;

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTo({ top: container.scrollHeight, behavior });
  }, []);

  const abortActiveRequest = useCallback((reason = 'cleanup') => {
    if (!abortControllerRef.current) return;
    abortReasonRef.current = reason;
    abortControllerRef.current.abort();
  }, []);

  const closeChat = useCallback(() => {
    abortActiveRequest('cleanup');
    if (isMobileViewport) {
      shouldRestoreFocusRef.current = true;
    }
    setIsOpen(false);
    if (
      isMobileViewport &&
      pushedHistoryRef.current &&
      typeof window !== 'undefined' &&
      window.history.state?.mhocChatOpen
    ) {
      pushedHistoryRef.current = false;
      window.history.back();
    }
  }, [abortActiveRequest, isMobileViewport]);

  const handleStop = useCallback(() => {
    abortActiveRequest('user');
  }, [abortActiveRequest]);

  const handleClear = useCallback(() => {
    requestEpochRef.current += 1;
    abortActiveRequest('cleanup');
    inFlightRef.current = false;
    isNearBottomRef.current = true;
    setShowJumpToLatest(false);
    setIsTyping(false);
    setIsStreaming(false);
    setMessages(createInitialMessages());
    setInput('');
    if (typeof window !== 'undefined') {
      try {
        window.sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // Ignore storage errors in restricted environments.
      }
    }
  }, [abortActiveRequest]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const persistable = messages
        .filter((msg) => !msg.isError)
        .map(({ id, role, text, timestamp, isInterrupted }) => ({
          id,
          role,
          text,
          timestamp,
          ...(isInterrupted ? { isInterrupted: true } : {}),
        }));
      if (persistable.length > 0) {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(persistable));
      }
    } catch {
      // Ignore storage quota / privacy mode errors.
    }
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobileViewport || !isOpen) return;
    lockScroll('mobile-chat');
    return () => {
      unlockScroll('mobile-chat');
    };
  }, [isOpen, isMobileViewport]);

  // Track visualViewport so the mobile dialog fits cleanly above the virtual keyboard.
  useEffect(() => {
    if (!isMobileViewport || !isOpen || typeof window === 'undefined') {
      setViewportMetrics(null);
      return;
    }

    const vv = window.visualViewport;
    if (!vv) {
      setViewportMetrics({ height: window.innerHeight, top: 0 });
      return;
    }

    const updateViewport = () => {
      setViewportMetrics({
        height: Math.round(vv.height),
        top: Math.max(0, Math.round(vv.offsetTop)),
      });
      if (isNearBottomRef.current) {
        requestAnimationFrame(() => scrollToBottom('auto'));
      }
    };

    updateViewport();
    vv.addEventListener('resize', updateViewport);
    vv.addEventListener('scroll', updateViewport);
    window.addEventListener('resize', updateViewport);

    return () => {
      vv.removeEventListener('resize', updateViewport);
      vv.removeEventListener('scroll', updateViewport);
      window.removeEventListener('resize', updateViewport);
    };
  }, [isMobileViewport, isOpen, scrollToBottom]);

  // Escape key closes the chat dialog/drawer.
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeChat();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeChat]);

  // Android / browser Back button closes the mobile chat instead of leaving the site.
  useEffect(() => {
    if (!isMobileViewport || !isOpen || typeof window === 'undefined') return;

    if (!pushedHistoryRef.current) {
      const nextState = { ...(window.history.state || {}), mhocChatOpen: true };
      window.history.pushState(nextState, '');
      pushedHistoryRef.current = true;
    }

    const handlePopState = () => {
      if (!pushedHistoryRef.current) return;
      pushedHistoryRef.current = false;
      abortActiveRequest('cleanup');
      shouldRestoreFocusRef.current = true;
      setIsOpen(false);
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isMobileViewport, isOpen, abortActiveRequest]);

  // Focus management on mobile open & close.
  useEffect(() => {
    if (!isMobileViewport) return;

    if (isOpen) {
      const id = requestAnimationFrame(() => {
        mobileCloseBtnRef.current?.focus({ preventScroll: true });
      });
      return () => cancelAnimationFrame(id);
    }

    if (shouldRestoreFocusRef.current) {
      shouldRestoreFocusRef.current = false;
      const id = requestAnimationFrame(() => {
        mobileTriggerRef.current?.focus({ preventScroll: true });
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isOpen, isMobileViewport]);

  // Abort any in-flight request on unmount.
  useEffect(() => {
    return () => {
      abortReasonRef.current = 'cleanup';
      abortControllerRef.current?.abort();
      pushedHistoryRef.current = false;
    };
  }, []);

  // Auto-resize mobile textarea cleanly up to 120px.
  useEffect(() => {
    const el = mobileTextareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [input, isOpen, isMobileViewport]);

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const nearBottom = distanceFromBottom < 80;
    isNearBottomRef.current = nearBottom;
    const hasOverflow = container.scrollHeight > container.clientHeight + 40;
    setShowJumpToLatest(!nearBottom && hasOverflow);
  };

  useEffect(() => {
    if (!isOpen) {
      prevIsOpenRef.current = false;
      return;
    }

    const justOpened = !prevIsOpenRef.current;
    prevIsOpenRef.current = true;

    if (justOpened || pendingUserScrollRef.current) {
      pendingUserScrollRef.current = false;
      isNearBottomRef.current = true;
      setShowJumpToLatest(false);
      scrollToBottom(justOpened ? 'auto' : 'smooth');
      return;
    }

    if (isNearBottomRef.current) {
      scrollToBottom(isStreaming ? 'auto' : 'smooth');
    }
  }, [messages, isOpen, isTyping, isStreaming, isMobileViewport, scrollToBottom]);

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

      if (isOpen && !isMobileViewport) {
        wrapper.style.paddingRight = '384px';
        header.style.right = '384px';
      } else {
        wrapper.style.paddingRight = '0px';
        header.style.right = '0px';
      }
    }
  }, [isOpen, isMobileViewport]);

  const sendRequest = async (trimmedMsg, baseMessages) => {
    if (inFlightRef.current || isBusy) return;
    inFlightRef.current = true;

    const epoch = requestEpochRef.current;
    const controller = new AbortController();
    abortControllerRef.current = controller;
    abortReasonRef.current = null;

    pendingUserScrollRef.current = true;
    setMessages(baseMessages);

    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      inFlightRef.current = false;
      abortControllerRef.current = null;
      setMessages((prev) => [
        ...prev,
        createMessage('bot', OFFLINE_ERROR, {
          isError: true,
          retryPrompt: trimmedMsg,
        }),
      ]);
      return;
    }

    setIsTyping(true);
    setIsStreaming(false);

    const timeoutId = setTimeout(() => {
      abortReasonRef.current = 'timeout';
      controller.abort();
    }, REQUEST_TIMEOUT_MS);

    let botStarted = false;

    try {
      await streamChat(
        baseMessages,
        (chunk) => {
          if (requestEpochRef.current !== epoch) return;

          if (!botStarted) {
            botStarted = true;
            setIsTyping(false);
            setIsStreaming(true);
            setMessages((prev) => [...prev, createMessage('bot', chunk)]);
            return;
          }

          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role !== 'bot') return prev;
            updated[updated.length - 1] = { ...last, text: last.text + chunk };
            return updated;
          });
        },
        controller.signal
      );

      if (requestEpochRef.current !== epoch) return;

      if (!botStarted) {
        setMessages((prev) => [
          ...prev,
          createMessage('bot', FRIENDLY_ERROR, {
            isError: true,
            retryPrompt: trimmedMsg,
          }),
        ]);
      }
    } catch (error) {
      if (requestEpochRef.current !== epoch) return;

      if (error?.name === 'AbortError') {
        const reason = abortReasonRef.current;

        if (botStarted) {
          setMessages((prev) => {
            const updated = [...prev];
            const last = updated[updated.length - 1];
            if (last?.role !== 'bot') return prev;
            updated[updated.length - 1] = {
              ...last,
              isInterrupted: true,
              ...(reason === 'timeout'
                ? { isError: true, retryPrompt: trimmedMsg }
                : {}),
            };
            return updated;
          });
        } else if (reason === 'user') {
          setMessages((prev) => [
            ...prev,
            createMessage('bot', STOPPED_ERROR, {
              isInterrupted: true,
              isError: true,
              retryPrompt: trimmedMsg,
            }),
          ]);
        } else if (reason === 'timeout') {
          setMessages((prev) => [
            ...prev,
            createMessage('bot', TIMEOUT_ERROR, {
              isError: true,
              retryPrompt: trimmedMsg,
            }),
          ]);
        }
        return;
      }

      console.error('AI Error:', error);
      const isOffline = typeof navigator !== 'undefined' && navigator.onLine === false;
      const errorText = isOffline ? OFFLINE_ERROR : FRIENDLY_ERROR;

      if (botStarted) {
        setMessages((prev) => {
          const updated = [...prev];
          const last = updated[updated.length - 1];
          if (last?.role === 'bot') {
            updated[updated.length - 1] = { ...last, isInterrupted: true };
          }
          return [
            ...updated,
            createMessage('bot', errorText, {
              isError: true,
              retryPrompt: trimmedMsg,
            }),
          ];
        });
      } else {
        setMessages((prev) => [
          ...prev,
          createMessage('bot', errorText, {
            isError: true,
            retryPrompt: trimmedMsg,
          }),
        ]);
      }
    } finally {
      clearTimeout(timeoutId);
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
        abortReasonRef.current = null;
      }
      inFlightRef.current = false;
      if (requestEpochRef.current === epoch) {
        setIsTyping(false);
        setIsStreaming(false);
      }
    }
  };

  const handleSend = async (e, forcedInput = null) => {
    if (e) e.preventDefault();
    if (inFlightRef.current || isBusy) return;

    const rawMsg = forcedInput ?? input;
    const trimmedMsg = rawMsg.trim();
    if (!trimmedMsg) return;

    if (forcedInput === null) {
      setInput('');
    }

    const nextMessages = [...messages, createMessage('user', trimmedMsg)];
    await sendRequest(trimmedMsg, nextMessages);
  };

  const handleRetry = async (errorMsgId, retryPrompt) => {
    if (inFlightRef.current || isBusy || !retryPrompt?.trim()) return;
    const trimmedPrompt = retryPrompt.trim();

    const filtered = messages.filter((msg) => msg.id !== errorMsgId);
    const last = filtered[filtered.length - 1];
    const nextMessages =
      last?.role === 'user' && last.text === trimmedPrompt
        ? filtered
        : [...filtered, createMessage('user', trimmedPrompt)];

    await sendRequest(trimmedPrompt, nextMessages);
  };

  const handleTextareaKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleJumpToLatest = () => {
    isNearBottomRef.current = true;
    setShowJumpToLatest(false);
    scrollToBottom('smooth');
  };

  const hasSuccessfulBotReply = messages.some(
    (msg, idx) => idx > 0 && msg.role === 'bot' && !msg.isError
  );
  const showMobileSuggestions = !isBusy && (messages.length === 1 || !hasSuccessfulBotReply);

  if (isMobileViewport) {
    return (
      <>
        <AnimatePresence>
          {!isOpen && (
            <div className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] inset-x-0 z-40 flex justify-center pointer-events-none">
              <motion.button
                ref={mobileTriggerRef}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                onClick={() => {
                  setIsOpen(true);
                  setShowTooltip(false);
                }}
                data-mhoc-mobile-pill
                aria-label="Ask MHOC"
                aria-expanded={isOpen}
                aria-haspopup="dialog"
                className="pointer-events-auto min-h-[44px] flex items-center gap-2 rounded-none bg-primary text-accent px-4 py-2 border-2 border-red shadow-[-4px_4px_0px_var(--color-red)] active:translate-y-[1px] active:scale-[0.97] active:shadow-[-2px_2px_0px_var(--color-red)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red transition-transform"
              >
                <div className="w-5 h-5 shrink-0 flex items-center justify-center" aria-hidden="true">
                  <img
                    src={MHOC_ICON}
                    alt=""
                    aria-hidden="true"
                    className="mhoc-tab-icon w-full h-full object-contain brightness-0 invert opacity-90"
                  />
                  <span
                    aria-hidden="true"
                    className="mhoc-tab-icon-light hidden w-full h-full bg-red opacity-90"
                    style={{
                      WebkitMaskImage: `url(${MHOC_ICON})`,
                      maskImage: `url(${MHOC_ICON})`,
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                    }}
                  />
                </div>
                <span className="font-mono text-xs font-bold tracking-wider text-accent uppercase">
                  Ask MHOC
                </span>
                <span className="w-2 h-2 rounded-full bg-red animate-pulse shrink-0" aria-hidden="true" />
              </motion.button>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="MHOC System Assistant"
              data-lenis-prevent
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              style={
                viewportMetrics
                  ? {
                      height: `${viewportMetrics.height}px`,
                      top: `${viewportMetrics.top}px`,
                    }
                  : undefined
              }
              className="fixed inset-x-0 top-0 z-[10050] h-[100dvh] w-full bg-primary text-accent flex flex-col overflow-hidden overscroll-contain pointer-events-auto font-sans pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)]"
            >
              {/* Mobile Header */}
              <header className="px-3.5 py-2.5 flex items-center justify-between gap-2 border-b border-[color:color-mix(in_srgb,var(--color-accent)_14%,transparent)] shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <MhocAvatarBadge size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="text-[15px] font-semibold tracking-tight text-accent truncate leading-tight">
                        MHOC
                      </h2>
                      <span
                        className="w-2 h-2 rounded-full bg-red animate-pulse shrink-0"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="text-[11px] font-mono text-muted truncate leading-tight uppercase tracking-wider">
                      {isTyping ? 'Thinking...' : isStreaming ? 'Responding...' : 'SYS · ONLINE'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={handleClear}
                    className="min-w-[44px] min-h-[44px] px-2.5 inline-flex items-center justify-center rounded-lg text-xs font-medium text-muted active:text-accent active:bg-[color:color-mix(in_srgb,var(--color-accent)_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red transition-colors"
                  >
                    Clear
                  </button>
                  <button
                    ref={mobileCloseBtnRef}
                    type="button"
                    onClick={closeChat}
                    aria-label="Close chat"
                    className="min-w-[44px] min-h-[44px] inline-flex items-center justify-center rounded-lg text-muted active:text-accent active:bg-[color:color-mix(in_srgb,var(--color-accent)_8%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red transition-colors"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </header>

              {/* Conversation Feed Wrapper */}
              <div className="relative flex-1 min-h-0 flex flex-col">
                <div
                  ref={messagesContainerRef}
                  onScroll={handleMessagesScroll}
                  data-lenis-prevent
                  role="log"
                  aria-live="polite"
                  aria-busy={isBusy}
                  aria-label="Conversation messages"
                  className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-3.5 py-4 flex flex-col gap-4"
                >
                  {messages.length === 1 && messages[0].role === 'bot' ? (
                    <div className="w-full min-w-0 flex flex-col items-start">
                      <div className="w-full max-w-[94%] border-l-2 border-red bg-[var(--color-surface)] px-3.5 py-3 shadow-[4px_4px_0px_var(--color-border-strong)]">
                        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-[color:color-mix(in_srgb,var(--color-accent)_10%,transparent)]">
                          <MhocAvatarBadge size="sm" />
                          <span className="text-xs font-bold tracking-tight text-accent">
                            MHOC
                          </span>
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-[color:color-mix(in_srgb,var(--color-accent)_8%,transparent)] text-accent border border-[color:color-mix(in_srgb,var(--color-accent)_16%,transparent)]">
                            SYS
                          </span>
                        </div>

                        <p className="text-[15px] leading-relaxed text-light">
                          <span className="sr-only">MHOC SYS replied: </span>
                          Hello! I&apos;m MHOC. Ask about Oshadha&apos;s projects, tech stack, experience, or contact details.
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((msg, idx) => {
                      const timeLabel = formatMessageTime(msg.timestamp);
                      if (msg.role === 'user') {
                        const sinhala = hasSinhalaScript(msg.text);
                        return (
                          <div
                            key={msg.id || idx}
                            className="w-full min-w-0 flex flex-col items-end gap-1"
                          >
                            <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-muted">
                              <span>You</span>
                              {timeLabel && (
                                <>
                                  <span aria-hidden="true">·</span>
                                  <time dateTime={new Date(msg.timestamp).toISOString()}>
                                    {timeLabel}
                                  </time>
                                </>
                              )}
                            </div>
                            <div
                              className={`max-w-[85%] min-w-0 rounded-2xl rounded-br-sm bg-accent text-primary px-3.5 py-2.5 shadow-sm text-[15px] whitespace-pre-wrap [overflow-wrap:anywhere] ${
                                sinhala ? 'leading-[1.75]' : 'leading-relaxed'
                              }`}
                            >
                              <span className="sr-only">You said: </span>
                              {msg.text}
                            </div>
                          </div>
                        );
                      }

                      const isMsgStreaming =
                        isStreaming && idx === messages.length - 1 && !msg.isError;
                      const statusTag = msg.isError
                        ? 'Error'
                        : msg.isInterrupted
                          ? 'Stopped'
                          : isMsgStreaming
                            ? 'Typing...'
                            : 'SYS';

                      return (
                        <div
                          key={msg.id || idx}
                          className="w-full min-w-0 flex flex-col items-start"
                        >
                          <div className="w-full max-w-[94%] min-w-0 border-l-2 border-red bg-[var(--color-surface)] px-3.5 py-3 shadow-[4px_4px_0px_var(--color-border-strong)]">
                            <div className="flex items-center justify-between gap-2 mb-2 pb-1.5 border-b border-[color:color-mix(in_srgb,var(--color-accent)_10%,transparent)]">
                              <div className="flex items-center gap-2 min-w-0">
                                <MhocAvatarBadge size="sm" />
                                <span className="text-xs font-bold tracking-tight text-accent">
                                  MHOC
                                </span>
                                <span
                                  className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider ${
                                    msg.isError
                                      ? 'bg-[color:color-mix(in_srgb,var(--color-red)_15%,transparent)] text-accent border border-[color:color-mix(in_srgb,var(--color-red)_55%,transparent)]'
                                      : msg.isInterrupted
                                        ? 'bg-[color:color-mix(in_srgb,var(--color-accent)_8%,transparent)] text-muted border border-[var(--color-border)]'
                                        : 'bg-[color:color-mix(in_srgb,var(--color-accent)_8%,transparent)] text-accent border border-[color:color-mix(in_srgb,var(--color-accent)_16%,transparent)]'
                                  }`}
                                >
                                  {statusTag}
                                </span>
                              </div>
                              {timeLabel && (
                                <time
                                  dateTime={new Date(msg.timestamp).toISOString()}
                                  className="text-[11px] text-muted shrink-0"
                                >
                                  {timeLabel}
                                </time>
                              )}
                            </div>

                            <div className="text-[15px] text-light min-w-0">
                              <span className="sr-only">MHOC SYS replied: </span>
                              <MobileChatMessage
                                text={msg.text}
                                isStreaming={isMsgStreaming}
                                isError={Boolean(msg.isError)}
                              />
                            </div>

                            {msg.isError && msg.retryPrompt && (
                              <div className="mt-3 pt-2 border-t border-[color:color-mix(in_srgb,var(--color-accent)_10%,transparent)] flex items-center">
                                <button
                                  type="button"
                                  onClick={() => handleRetry(msg.id, msg.retryPrompt)}
                                  disabled={isBusy}
                                  className="min-h-[40px] inline-flex items-center gap-1.5 rounded-lg border border-[var(--color-border-strong)] bg-primary px-3 py-1.5 text-xs font-semibold text-accent active:scale-95 disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red transition-transform"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    aria-hidden="true"
                                  >
                                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                    <path d="M3 3v5h5" />
                                  </svg>
                                  <span>Retry</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}

                  {isTyping && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="w-full min-w-0 flex flex-col items-start"
                    >
                      <div className="max-w-[85%] border-l-2 border-red bg-[var(--color-surface)] px-3.5 py-3 shadow-[4px_4px_0px_var(--color-border-strong)]">
                        <div className="flex items-center gap-2 mb-2">
                          <MhocAvatarBadge size="sm" />
                          <span className="text-xs font-bold tracking-tight text-accent">MHOC</span>
                          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider bg-[color:color-mix(in_srgb,var(--color-accent)_8%,transparent)] text-muted border border-[color:color-mix(in_srgb,var(--color-accent)_16%,transparent)]">
                            Typing...
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5" aria-hidden="true">
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-red animate-bounce"
                              style={{ animationDelay: '0ms' }}
                            />
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-red animate-bounce"
                              style={{ animationDelay: '150ms' }}
                            />
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-red animate-bounce"
                              style={{ animationDelay: '300ms' }}
                            />
                          </div>
                          <span className="text-xs text-muted">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Jump to latest pill when scrolled up */}
                <AnimatePresence>
                  {showJumpToLatest && (
                    <motion.button
                      type="button"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      onClick={handleJumpToLatest}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 min-h-[40px] inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-primary px-3.5 py-1.5 text-xs font-semibold text-accent shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red"
                    >
                      <span>Jump to latest</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <polyline points="19 12 12 19 5 12" />
                      </svg>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Quick Suggestions */}
              {showMobileSuggestions && (
                <div
                  aria-label="Suggested prompts"
                  className="px-3.5 pb-2.5 pt-1 flex flex-wrap gap-2 shrink-0 min-w-0"
                >
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleSend(null, s)}
                      className="min-h-[40px] max-w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-xs font-medium text-accent active:bg-accent active:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red transition-colors text-left"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Pinned Bottom Composer Bar */}
              <form
                onSubmit={handleSend}
                className="border-t border-[color:color-mix(in_srgb,var(--color-accent)_14%,transparent)] bg-primary px-3.5 py-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))] shrink-0"
              >
                <div className="flex items-end gap-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] pl-3.5 pr-1.5 py-1.5 focus-within:border-red focus-within:ring-1 focus-within:ring-red transition-colors">
                  <label htmlFor="mhoc-mobile-input" className="sr-only">
                    Ask MHOC a question
                  </label>
                  <textarea
                    ref={mobileTextareaRef}
                    id="mhoc-mobile-input"
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Ask MHOC..."
                    enterKeyHint="send"
                    maxLength={MAX_INPUT_LENGTH}
                    className="flex-1 min-w-0 max-h-[120px] resize-none overflow-y-auto bg-transparent py-2 text-[16px] leading-snug text-accent placeholder:text-muted focus:outline-none"
                  />
                  {input.length > 1600 && (
                    <span
                      aria-live="polite"
                      className="text-[10px] font-mono text-muted shrink-0 pb-2.5 px-1"
                    >
                      {input.length}/{MAX_INPUT_LENGTH}
                    </span>
                  )}
                  {isBusy ? (
                    <button
                      type="button"
                      onClick={handleStop}
                      aria-label="Stop generating"
                      className="min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center shrink-0 border border-[color:color-mix(in_srgb,var(--color-red)_55%,transparent)] bg-[color:color-mix(in_srgb,var(--color-red)_15%,transparent)] text-accent active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red transition-transform"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                      >
                        <rect x="6" y="6" width="12" height="12" rx="2" />
                      </svg>
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={!input.trim()}
                      aria-label="Send message"
                      className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center shrink-0 border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red ${
                        input.trim()
                          ? 'bg-accent border-accent text-primary active:scale-95'
                          : 'bg-[color:color-mix(in_srgb,var(--color-accent)_6%,transparent)] border-[color:color-mix(in_srgb,var(--color-accent)_14%,transparent)] text-muted opacity-70 cursor-not-allowed'
                      }`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="12" y1="19" x2="12" y2="5" />
                        <polyline points="5 12 12 5 19 12" />
                      </svg>
                    </button>
                  )}
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }

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
        data-mhoc-tab
        className={`absolute top-1/2 -translate-y-1/2 right-0 bg-primary border-y-2 border-l-2 border-border-strong flex flex-col items-center justify-center py-4 md:py-6 px-2 md:px-3 transition-all duration-300 z-40 hover:bg-red group pointer-events-auto ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100 shadow-[-4px_4px_0px_var(--color-border-strong)] hover:-translate-x-1 hover:shadow-[-8px_4px_0px_var(--color-border-strong)]'}`}
        title="Ask MHOC"
      >
        <div className="w-8 h-8 md:w-10 md:h-10 mb-3 md:mb-4 flex items-center justify-center group-hover:scale-105 transition-transform">
          <img
            src={MHOC_ICON}
            alt="MHOC"
            className="mhoc-tab-icon w-full h-full object-contain brightness-0 invert opacity-90"
          />
          <span
            aria-hidden="true"
            className="mhoc-tab-icon-light hidden w-full h-full bg-red opacity-90 group-hover:bg-white"
            style={{
              WebkitMaskImage: `url(${MHOC_ICON})`,
              maskImage: `url(${MHOC_ICON})`,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskPosition: 'center',
              maskPosition: 'center',
              WebkitMaskSize: 'contain',
              maskSize: 'contain',
            }}
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
              className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 flex flex-col gap-4 font-mono text-xs relative z-10 [font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,'Noto_Sans_Sinhala','Iskoola_Pota','Nirmala_UI',monospace]"
            >
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[92%] sm:max-w-[88%] p-3 min-w-0 ${
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

            {messages.length < 4 && !isBusy && (
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
                disabled={!input.trim() || isBusy}
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
