import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { DECK_META, SLIDES_META } from './slideData.js';
import { SLIDES } from './slides/Slides.jsx';
import './presentation.css';

const SLIDE_WIDTH = 1280;
const SLIDE_HEIGHT = 720;
const TOOLBAR_HEIGHT = 48;
const FULLSCREEN_IDLE_MS = 2500;
const COMPACT_MEDIA_QUERY = '(max-width: 899px)';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

const getIsCompactViewport = () => {
  if (typeof window === 'undefined') return false;
  if (typeof window.matchMedia === 'function') {
    return window.matchMedia(COMPACT_MEDIA_QUERY).matches;
  }
  return window.innerWidth < 900;
};

const shouldIgnoreSwipe = (target, boundaryEl) => {
  if (!(target instanceof Element)) return false;
  if (target.closest('[data-no-swipe="true"]')) return true;
  let node = target;
  while (node && node !== boundaryEl) {
    if (node instanceof HTMLElement) {
      const overflowX = window.getComputedStyle(node).overflowX;
      if (
        (overflowX === 'auto' || overflowX === 'scroll') &&
        node.scrollWidth > node.clientWidth + 1
      ) {
        return true;
      }
    }
    node = node.parentElement;
  }
  return false;
};

const formatMMSS = (totalSeconds) => {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const formatTargetCue = (targetSec) => {
  if (!targetSec || targetSec <= 0) return 'Q&A / Ref';
  return `${targetSec}s`;
};

const parseSlideIndexFromHash = (totalSlides) => {
  if (typeof window === 'undefined') return 0;
  const match = /^#slide-(\d+)$/i.exec(window.location.hash.trim());
  if (!match) return 0;
  const parsed = Number.parseInt(match[1], 10);
  if (Number.isNaN(parsed)) return 0;
  return clamp(parsed - 1, 0, Math.max(0, totalSlides - 1));
};

const computeInitialScale = () => {
  if (typeof window === 'undefined') return 0.8;
  const padX = window.innerWidth < 640 ? 16 : 36;
  const padY = window.innerHeight < 560 ? 16 : 24;
  const availW = Math.max(200, window.innerWidth - padX);
  const availH = Math.max(120, window.innerHeight - TOOLBAR_HEIGHT - padY);
  return clamp(Math.min(availW / SLIDE_WIDTH, availH / SLIDE_HEIGHT), 0.15, 3);
};

const isEditableTarget = (target) => {
  if (!target || !(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.isContentEditable) return true;
  return Boolean(target.closest('[contenteditable="true"]'));
};

/* ── Consistent 1.75px Stroke Inline Vector Icons (Zero Emojis) ── */

const iconStyle = (size) => ({ width: size, height: size, flexShrink: 0 });

function IconArrowLeft({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconStyle(size)}
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function IconChevronLeft({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconStyle(size)}
      aria-hidden="true"
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function IconChevronRight({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconStyle(size)}
      aria-hidden="true"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function IconGrid({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconStyle(size)}
      aria-hidden="true"
    >
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconNotes({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconStyle(size)}
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="13" y2="17" />
    </svg>
  );
}

function IconPrint({ size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconStyle(size)}
      aria-hidden="true"
    >
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" rx="1" />
    </svg>
  );
}

function IconFullscreen({ isFullscreen, size = 15 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconStyle(size)}
      aria-hidden="true"
    >
      {isFullscreen ? (
        <>
          <path d="M8 3v3a2 2 0 0 1-2 2H3" />
          <path d="M21 8h-3a2 2 0 0 1-2-2V3" />
          <path d="M3 16h3a2 2 0 0 1 2 2v3" />
          <path d="M16 21v-3a2 2 0 0 1 2-2h3" />
        </>
      ) : (
        <>
          <path d="M8 3H5a2 2 0 0 0-2 2v3" />
          <path d="M21 8V5a2 2 0 0 0-2-2h-3" />
          <path d="M3 16v3a2 2 0 0 0 2 2h3" />
          <path d="M16 21h3a2 2 0 0 0 2-2v-3" />
        </>
      )}
    </svg>
  );
}

function IconReset({ size = 13 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconStyle(size)}
      aria-hidden="true"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IconClose({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={iconStyle(size)}
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export default function PresentationPage() {
  const totalSlides = SLIDES.length || SLIDES_META?.length || DECK_META?.totalSlides || 13;
  const maxMinutes = DECK_META?.maxMinutes || 6;
  const maxTimerSeconds = maxMinutes * 60;
  const warningSeconds = Math.max(0, maxTimerSeconds - 60);

  const prefersReducedMotion = useReducedMotion();

  const rootRef = useRef(null);
  const stageRef = useRef(null);
  const touchStartRef = useRef(null);
  const overviewModalRef = useRef(null);
  const overviewTriggerRef = useRef(null);
  const compactOverviewTriggerRef = useRef(null);
  const lastFocusedBeforeModalRef = useRef(null);

  const [navState, setNavState] = useState(() => ({
    index: parseSlideIndexFromHash(totalSlides),
    direction: 1,
  }));
  const [isCompactViewport, setIsCompactViewport] = useState(getIsCompactViewport);
  const [scale, setScale] = useState(computeInitialScale);
  const [showOverview, setShowOverview] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [toolbarIdle, setToolbarIdle] = useState(false);

  // 6:00 rehearsal timer (StrictMode-safe, drift-free elapsed tracking)
  const [timerState, setTimerState] = useState({
    running: false,
    baseMs: 0,
    startedAt: null,
  });
  const [nowMs, setNowMs] = useState(() => Date.now());

  const timerRunning = timerState.running;
  const elapsedMs =
    timerState.running && timerState.startedAt !== null
      ? timerState.baseMs + Math.max(0, nowMs - timerState.startedAt)
      : timerState.baseMs;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);

  const currentIndex = clamp(navState.index, 0, Math.max(0, totalSlides - 1));
  const direction = navState.direction;

  const goToSlide = useCallback(
    (nextIndex) => {
      setNavState((prev) => {
        const clamped = clamp(nextIndex, 0, totalSlides - 1);
        if (clamped === prev.index) return prev;
        return {
          index: clamped,
          direction: clamped >= prev.index ? 1 : -1,
        };
      });
    },
    [totalSlides]
  );

  const goNext = useCallback(() => {
    setNavState((prev) => {
      if (prev.index >= totalSlides - 1) return prev;
      return { index: prev.index + 1, direction: 1 };
    });
  }, [totalSlides]);

  const goPrev = useCallback(() => {
    setNavState((prev) => {
      if (prev.index <= 0) return prev;
      return { index: prev.index - 1, direction: -1 };
    });
  }, []);

  const openOverview = useCallback(() => {
    if (typeof document !== 'undefined') {
      lastFocusedBeforeModalRef.current = document.activeElement;
    }
    setShowOverview(true);
  }, []);

  const closeOverview = useCallback(() => {
    setShowOverview(false);
    const fallbackTrigger = isCompactViewport
      ? compactOverviewTriggerRef.current
      : overviewTriggerRef.current;
    const restoreTarget = lastFocusedBeforeModalRef.current || fallbackTrigger;
    lastFocusedBeforeModalRef.current = null;
    if (restoreTarget && typeof restoreTarget.focus === 'function') {
      window.requestAnimationFrame(() => {
        restoreTarget.focus();
      });
    }
  }, [isCompactViewport]);

  const toggleOverview = useCallback(() => {
    setShowOverview((prev) => {
      if (prev) {
        const fallbackTrigger = isCompactViewport
          ? compactOverviewTriggerRef.current
          : overviewTriggerRef.current;
        const restoreTarget = lastFocusedBeforeModalRef.current || fallbackTrigger;
        lastFocusedBeforeModalRef.current = null;
        if (restoreTarget && typeof restoreTarget.focus === 'function') {
          window.requestAnimationFrame(() => {
            restoreTarget.focus();
          });
        }
        return false;
      }
      if (typeof document !== 'undefined') {
        lastFocusedBeforeModalRef.current = document.activeElement;
      }
      return true;
    });
  }, [isCompactViewport]);

  const toggleTimer = useCallback(() => {
    const now = Date.now();
    setNowMs(now);
    setTimerState((prev) => {
      if (prev.running) {
        const delta = prev.startedAt !== null ? Math.max(0, now - prev.startedAt) : 0;
        return {
          running: false,
          baseMs: prev.baseMs + delta,
          startedAt: null,
        };
      }
      return {
        running: true,
        baseMs: prev.baseMs,
        startedAt: now,
      };
    });
  }, []);

  const resetTimer = useCallback(() => {
    setTimerState({ running: false, baseMs: 0, startedAt: null });
    setNowMs(Date.now());
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return;
    if (document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    } else {
      const target = rootRef.current || document.documentElement;
      target.requestFullscreen?.().catch(() => {});
    }
  }, []);

  const triggerPrint = useCallback(() => {
    if (typeof window !== 'undefined' && typeof window.print === 'function') {
      window.print();
    }
  }, []);

  // Update document.title dynamically from DECK_META
  useEffect(() => {
    const previousTitle = document.title;
    const indexNo = DECK_META?.indexNo || '25688';
    const regNo = DECK_META?.regNo || '112219';
    document.title = `ITC 4671 — Index ${indexNo} | Reg ${regNo}`;
    return () => {
      document.title = previousTitle;
    };
  }, []);

  // Sync active slide to URL hash (#slide-N) while preserving router history state
  useEffect(() => {
    const targetHash = `#slide-${currentIndex + 1}`;
    if (window.location.hash !== targetHash) {
      window.history.replaceState(window.history.state, '', targetHash);
    }
  }, [currentIndex]);

  // Listen for external hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseSlideIndexFromHash(totalSlides);
      goToSlide(parsed);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [totalSlides, goToSlide]);

  // Track fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Unobtrusive toolbar auto-dim in fullscreen when idle
  useEffect(() => {
    if (!isFullscreen || showNotes || showOverview) {
      setToolbarIdle(false);
      return undefined;
    }

    let timeoutId = window.setTimeout(() => setToolbarIdle(true), FULLSCREEN_IDLE_MS);

    const handleActivity = () => {
      setToolbarIdle(false);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setToolbarIdle(true), FULLSCREEN_IDLE_MS);
    };

    window.addEventListener('pointermove', handleActivity, { passive: true });
    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('pointermove', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, [isFullscreen, showNotes, showOverview]);

  // Sync compact (< 900px) fluid viewport state
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const syncCompact = () => setIsCompactViewport(getIsCompactViewport());
    syncCompact();

    if (typeof window.matchMedia === 'function') {
      const mql = window.matchMedia(COMPACT_MEDIA_QUERY);
      if (typeof mql.addEventListener === 'function') {
        mql.addEventListener('change', syncCompact);
        return () => mql.removeEventListener('change', syncCompact);
      }
      if (typeof mql.addListener === 'function') {
        mql.addListener(syncCompact);
        return () => mql.removeListener(syncCompact);
      }
    }

    window.addEventListener('resize', syncCompact);
    return () => window.removeEventListener('resize', syncCompact);
  }, []);

  // Reset vertical scroll to top when switching slides on compact mobile/tablet viewports
  useEffect(() => {
    if (!isCompactViewport) return;
    const stageEl = stageRef.current;
    if (stageEl) {
      stageEl.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [currentIndex, isCompactViewport]);

  // Exact 16:9 ResizeObserver scaling on stage container (desktop >= 900px only)
  useEffect(() => {
    if (isCompactViewport) return undefined;
    const stageEl = stageRef.current;
    if (!stageEl) return undefined;

    const updateScale = () => {
      const rect = stageEl.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;
      const padX = isFullscreen ? 16 : rect.width < 640 ? 16 : 36;
      const padY = isFullscreen ? 14 : rect.height < 520 ? 14 : 24;
      const availW = Math.max(160, rect.width - padX);
      const availH = Math.max(90, rect.height - padY);
      const nextScale = clamp(Math.min(availW / SLIDE_WIDTH, availH / SLIDE_HEIGHT), 0.15, 3);
      setScale(nextScale);
    };

    updateScale();

    if (typeof ResizeObserver !== 'undefined') {
      const observer = new ResizeObserver(updateScale);
      observer.observe(stageEl);
      return () => observer.disconnect();
    }

    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [isFullscreen, isCompactViewport]);

  // Rehearsal timer tick
  useEffect(() => {
    if (!timerRunning) return undefined;
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 250);
    return () => window.clearInterval(intervalId);
  }, [timerRunning]);

  // Overview modal focus management & Tab focus trap (WCAG / React a11y)
  useEffect(() => {
    if (!showOverview) return undefined;
    const modalEl = overviewModalRef.current;
    if (!modalEl) return undefined;

    // Move initial focus to active slide card (or first focusable element)
    const activeCard = modalEl.querySelector('[data-overview-active="true"]');
    const focusables = Array.from(modalEl.querySelectorAll(FOCUSABLE_SELECTOR));
    const initialTarget = activeCard || focusables[0];
    if (initialTarget && typeof initialTarget.focus === 'function') {
      window.requestAnimationFrame(() => initialTarget.focus());
    }

    const handleTrapKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const nodes = Array.from(modalEl.querySelectorAll(FOCUSABLE_SELECTOR));
      if (nodes.length === 0) {
        event.preventDefault();
        return;
      }
      const first = nodes[0];
      const last = nodes[nodes.length - 1];
      const active = document.activeElement;

      if (event.shiftKey) {
        if (active === first || !modalEl.contains(active)) {
          event.preventDefault();
          last.focus();
        }
      } else if (active === last || !modalEl.contains(active)) {
        event.preventDefault();
        first.focus();
      }
    };

    modalEl.addEventListener('keydown', handleTrapKeyDown);
    return () => modalEl.removeEventListener('keydown', handleTrapKeyDown);
  }, [showOverview]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey || event.metaKey || event.altKey) return;
      if (isEditableTarget(event.target)) return;

      const key = event.key;

      if (key === 'Escape') {
        if (showOverview) {
          event.preventDefault();
          closeOverview();
        } else if (showNotes) {
          event.preventDefault();
          setShowNotes(false);
        }
        return;
      }

      if (key === 'g' || key === 'G') {
        event.preventDefault();
        toggleOverview();
        return;
      }

      if (key === 'n' || key === 'N') {
        event.preventDefault();
        setShowNotes((prev) => !prev);
        return;
      }

      if (key === 't' || key === 'T') {
        event.preventDefault();
        toggleTimer();
        return;
      }

      if (key === 'f' || key === 'F') {
        event.preventDefault();
        toggleFullscreen();
        return;
      }

      if (key === 'p' || key === 'P') {
        event.preventDefault();
        triggerPrint();
        return;
      }

      // Pause slide navigation shortcuts while the overview modal is open
      if (showOverview) return;

      if (key === 'ArrowRight' || key === ' ' || key === 'PageDown') {
        event.preventDefault();
        goNext();
      } else if (key === 'ArrowLeft' || key === 'PageUp') {
        event.preventDefault();
        goPrev();
      } else if (key === 'Home') {
        event.preventDefault();
        goToSlide(0);
      } else if (key === 'End') {
        event.preventDefault();
        goToSlide(totalSlides - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showOverview,
    showNotes,
    closeOverview,
    toggleOverview,
    goNext,
    goPrev,
    goToSlide,
    toggleTimer,
    toggleFullscreen,
    triggerPrint,
    totalSlides,
  ]);

  // Touch swipe navigation for mobile/tablet review (respects [data-no-swipe] & scrollable boxes)
  const handleTouchStart = useCallback(
    (event) => {
      if (showOverview || event.touches.length !== 1) {
        touchStartRef.current = null;
        return;
      }
      if (shouldIgnoreSwipe(event.target, stageRef.current)) {
        touchStartRef.current = null;
        return;
      }
      const touch = event.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },
    [showOverview]
  );

  const handleTouchEnd = useCallback(
    (event) => {
      const start = touchStartRef.current;
      touchStartRef.current = null;
      if (!start || showOverview || event.changedTouches.length !== 1) return;
      const touch = event.changedTouches[0];
      const dx = touch.clientX - start.x;
      const dy = touch.clientY - start.y;
      const elapsed = Date.now() - start.time;

      if (elapsed > 650) return;
      if (Math.abs(dx) < 56 || Math.abs(dx) <= Math.abs(dy) * 1.5) return;

      if (dx < 0) {
        goNext();
      } else {
        goPrev();
      }
    },
    [goNext, goPrev, showOverview]
  );

  // Slide metadata & pacing calculations
  const activeMeta = useMemo(() => {
    const found = SLIDES_META?.[currentIndex];
    if (found) return found;
    return {
      id: currentIndex + 1,
      section: 'Presentation',
      title: `Slide ${currentIndex + 1}`,
      targetSec: 0,
      speakerNotes: 'No speaker notes available for this slide.',
      qaDefense: [],
    };
  }, [currentIndex]);

  const pacingSummary = useMemo(() => {
    const list = Array.isArray(SLIDES_META) ? SLIDES_META : [];
    let totalSpokenSec = 0;
    let cumulativeSec = 0;
    list.forEach((item, idx) => {
      const sec = Number(item?.targetSec) || 0;
      totalSpokenSec += sec;
      if (idx <= currentIndex) {
        cumulativeSec += sec;
      }
    });
    return { totalSpokenSec, cumulativeSec };
  }, [currentIndex]);

  const ActiveSlideComponent = SLIDES[currentIndex] || null;
  const qaDefenseList = Array.isArray(activeMeta.qaDefense) ? activeMeta.qaDefense : [];

  const timerStatusClass =
    elapsedSeconds >= maxTimerSeconds
      ? 'present-timer present-timer--crimson'
      : elapsedSeconds >= warningSeconds
        ? 'present-timer present-timer--amber'
        : 'present-timer';

  const paceFillClass =
    elapsedSeconds >= maxTimerSeconds
      ? 'present-notes-pace-fill present-notes-pace-fill--crimson'
      : elapsedSeconds >= warningSeconds
        ? 'present-notes-pace-fill present-notes-pace-fill--amber'
        : 'present-notes-pace-fill';

  const elapsedPercent = clamp((elapsedSeconds / maxTimerSeconds) * 100, 0, 100);
  const targetPercent = clamp((pacingSummary.cumulativeSec / maxTimerSeconds) * 100, 0, 100);

  const scaledWidth = Math.round(SLIDE_WIDTH * scale);
  const scaledHeight = Math.round(SLIDE_HEIGHT * scale);

  const slideVariants = useMemo(() => {
    if (prefersReducedMotion) {
      return {
        enter: { opacity: 0, x: 0 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 0 },
      };
    }
    return {
      enter: (dir) => ({ opacity: 0, x: dir > 0 ? 24 : -24 }),
      center: { opacity: 1, x: 0 },
      exit: (dir) => ({ opacity: 0, x: dir > 0 ? -24 : 24 }),
    };
  }, [prefersReducedMotion]);

  const slideTransition = useMemo(
    () =>
      prefersReducedMotion
        ? { duration: 0.08 }
        : { duration: 0.2, ease: [0.22, 1, 0.36, 1] },
    [prefersReducedMotion]
  );

  return (
    <div
      ref={rootRef}
      className={`present-root ${isFullscreen ? 'present-root--fullscreen' : ''}`}
    >
      {/* Dedicated Concise Screen-Reader Announcer (Avoids Dumping Entire Slide DOM) */}
      <div className="present-sr-only" aria-live="polite" aria-atomic="true">
        Slide {currentIndex + 1} of {totalSlides}: {activeMeta.title}
      </div>

      {/* Main Centered 16:9 Slide Theater Stage */}
      <main
        ref={stageRef}
        className="present-stage"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="present-stage-box"
          style={
            isCompactViewport
              ? undefined
              : { width: `${scaledWidth}px`, height: `${scaledHeight}px` }
          }
        >
          <div
            className="present-scale-layer"
            style={isCompactViewport ? undefined : { transform: `scale(${scale})` }}
          >
            <AnimatePresence mode="wait" initial={false} custom={direction}>
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={slideTransition}
                className="present-motion-slot"
              >
                {ActiveSlideComponent ? (
                  <ActiveSlideComponent
                    slideNumber={currentIndex + 1}
                    totalSlides={totalSlides}
                  />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Collapsible Speaker Notes & Q&A Defense Drawer (N) */}
      <AnimatePresence initial={false}>
        {showNotes && (
          <motion.aside
            key="speaker-notes"
            className="present-notes-drawer"
            initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { height: 'auto', opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.08 : 0.2, ease: 'easeOut' }}
            aria-label="Speaker Notes and Q&A Defense Cues"
          >
            <div className="present-notes-inner">
              <div className="present-notes-header">
                <div className="present-notes-meta">
                  <span className="present-notes-kicker">
                    Slide {String(currentIndex + 1).padStart(2, '0')} · {activeMeta.section}
                    {activeMeta.guideRef ? ` (${activeMeta.guideRef})` : ''}
                  </span>
                  <span className="present-notes-title">{activeMeta.title}</span>
                  <span className="present-notes-pace">
                    Target {formatTargetCue(activeMeta.targetSec)}
                    {pacingSummary.totalSpokenSec > 0
                      ? ` · Pace ${formatMMSS(pacingSummary.cumulativeSec)} / ${formatMMSS(maxTimerSeconds)}`
                      : ''}
                  </span>
                  <div
                    className="present-notes-pace-track"
                    title={`Elapsed ${formatMMSS(elapsedSeconds)} vs Target ${formatMMSS(pacingSummary.cumulativeSec)}`}
                    aria-hidden="true"
                  >
                    <div
                      className={paceFillClass}
                      style={{ width: `${elapsedPercent}%` }}
                    />
                    <div
                      className="present-notes-pace-target"
                      style={{ left: `${targetPercent}%` }}
                    />
                  </div>
                </div>

                <div className="present-notes-header-actions">
                  <div
                    className={`${timerStatusClass} present-notes-mobile-timer`}
                    role="timer"
                    aria-label="6-minute rehearsal timer"
                  >
                    <button
                      type="button"
                      className="present-timer-toggle"
                      onClick={toggleTimer}
                      aria-label={timerRunning ? 'Pause rehearsal timer' : 'Start rehearsal timer'}
                    >
                      <span
                        className={`present-timer-indicator ${
                          timerRunning ? 'present-timer-indicator--running' : ''
                        }`}
                        aria-hidden="true"
                      />
                      <span>{formatMMSS(elapsedSeconds)}</span>
                      <span className="present-timer-limit">/ {formatMMSS(maxTimerSeconds)}</span>
                    </button>
                    <button
                      type="button"
                      className="present-timer-reset"
                      onClick={resetTimer}
                      aria-label="Reset rehearsal timer"
                    >
                      <IconReset size={13} />
                    </button>
                  </div>

                  <button
                    type="button"
                    className="present-btn present-btn--icon present-notes-close"
                    onClick={() => setShowNotes(false)}
                    title="Close speaker notes (Esc)"
                    aria-label="Close speaker notes"
                  >
                    <IconClose size={15} />
                  </button>
                </div>
              </div>

              <div
                className={`present-notes-grid ${
                  qaDefenseList.length === 0 ? 'present-notes-grid--single' : ''
                }`}
              >
                <div>
                  <div className="present-notes-col-label">Spoken Script (6:00 Talk)</div>
                  <p className="present-notes-text present-scroll">
                    {activeMeta.speakerNotes}
                  </p>
                </div>

                {qaDefenseList.length > 0 && (
                  <div className="present-notes-qa">
                    <div className="present-notes-col-label">Panel Q&amp;A Defense Cues</div>
                    <ul className="present-notes-qa-list present-scroll">
                      {qaDefenseList.map((cue, idx) => (
                        <li key={`${currentIndex}-qa-${idx}`} className="present-notes-qa-item">
                          <span className="present-notes-qa-bullet">Q{idx + 1}</span>
                          <span>{cue}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Bottom Presenter Toolbar (Auto-Dims Unobtrusively in Fullscreen) */}
      <nav
        className={`present-toolbar ${toolbarIdle ? 'present-toolbar--idle' : ''}`}
        aria-label="Presentation controls"
      >
        {/* Left: Back to Portfolio, Deck Label, Slide Grid */}
        <div className="present-toolbar-left">
          <Link
            to="/"
            className="present-btn"
            title="Return to Portfolio"
            aria-label="Back to Portfolio"
          >
            <IconArrowLeft size={14} />
            <span className="present-btn-label-desktop">Portfolio</span>
          </Link>

          <span className="present-toolbar-divider" aria-hidden="true" />

          <span className="present-deck-label" title={DECK_META?.title}>
            ITC 4671
          </span>

          <button
            ref={overviewTriggerRef}
            type="button"
            className={`present-btn present-overview-trigger ${
              showOverview ? 'present-btn--active' : ''
            }`}
            onClick={() => (showOverview ? closeOverview() : openOverview())}
            title="Slide overview grid (G)"
            aria-label="Toggle slide overview grid"
            aria-pressed={showOverview}
          >
            <IconGrid size={14} />
            <span className="present-btn-label-desktop">Overview</span>
            <kbd className="present-kbd">G</kbd>
          </button>
        </div>

        {/* Center: Prev, Progress Segments, Slide Counter, Next */}
        <div className="present-toolbar-center">
          <button
            type="button"
            className="present-btn present-btn--icon"
            onClick={goPrev}
            disabled={currentIndex <= 0}
            title="Previous slide (Left Arrow)"
            aria-label="Previous slide"
          >
            <IconChevronLeft size={16} />
          </button>

          <div className="present-progress-group">
            <div className="present-dots" role="tablist" aria-label="Slide progress">
              {Array.from({ length: totalSlides }).map((_, idx) => {
                const meta = SLIDES_META?.[idx];
                const isActive = idx === currentIndex;
                const isVisited = idx < currentIndex;
                return (
                  <button
                    key={meta?.slug ?? meta?.id ?? idx}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-label={`Go to slide ${idx + 1}: ${meta?.title || ''}`}
                    title={`${String(idx + 1).padStart(2, '0')}. ${meta?.title || `Slide ${idx + 1}`}`}
                    className={`present-dot-btn ${
                      isActive
                        ? 'present-dot-btn--active'
                        : isVisited
                          ? 'present-dot-btn--visited'
                          : ''
                    }`}
                    onClick={() => goToSlide(idx)}
                  >
                    <span className="present-dot-bar" />
                  </button>
                );
              })}
            </div>

            <span className="present-slide-counter" aria-live="off">
              Slide {currentIndex + 1}{' '}
              <span className="present-slide-counter-muted">/ {totalSlides}</span>
            </span>
          </div>

          <button
            ref={compactOverviewTriggerRef}
            type="button"
            className={`present-btn present-slide-counter-btn ${
              showOverview ? 'present-btn--active' : ''
            }`}
            onClick={() => (showOverview ? closeOverview() : openOverview())}
            aria-label={`Slide ${currentIndex + 1} of ${totalSlides} — open slide overview`}
            aria-pressed={showOverview}
          >
            <span>
              {currentIndex + 1} <span className="present-slide-counter-muted">/ {totalSlides}</span>
            </span>
          </button>

          <button
            type="button"
            className="present-btn present-btn--icon"
            onClick={goNext}
            disabled={currentIndex >= totalSlides - 1}
            title="Next slide (Right Arrow / Space)"
            aria-label="Next slide"
          >
            <IconChevronRight size={16} />
          </button>
        </div>

        {/* Right: 6:00 Rehearsal Timer, Speaker Notes, Print/PDF, Fullscreen */}
        <div className="present-toolbar-right">
          <div
            className={`${timerStatusClass} present-toolbar-timer`}
            role="timer"
            aria-label="6-minute rehearsal timer"
          >
            <button
              type="button"
              className="present-timer-toggle"
              onClick={toggleTimer}
              title={
                timerRunning
                  ? 'Pause 6-minute rehearsal timer (T)'
                  : 'Start 6-minute rehearsal timer (T)'
              }
              aria-label={timerRunning ? 'Pause rehearsal timer' : 'Start rehearsal timer'}
            >
              <span
                className={`present-timer-indicator ${
                  timerRunning ? 'present-timer-indicator--running' : ''
                }`}
                aria-hidden="true"
              />
              <span>{formatMMSS(elapsedSeconds)}</span>
              <span className="present-timer-limit">/ {formatMMSS(maxTimerSeconds)}</span>
            </button>
            <button
              type="button"
              className="present-timer-reset"
              onClick={resetTimer}
              title="Reset rehearsal timer"
              aria-label="Reset rehearsal timer"
            >
              <IconReset size={12} />
            </button>
          </div>

          <button
            type="button"
            className={`present-btn ${showNotes ? 'present-btn--active' : ''}`}
            onClick={() => setShowNotes((prev) => !prev)}
            title="Toggle speaker notes & Q&A cues (N)"
            aria-label="Toggle speaker notes and Q&A cues"
            aria-pressed={showNotes}
          >
            <IconNotes size={14} />
            <span className="present-btn-label-desktop">Notes</span>
            <kbd className="present-kbd">N</kbd>
          </button>

          <button
            type="button"
            className="present-btn present-btn--icon present-btn-print"
            onClick={triggerPrint}
            title="Export full deck to PDF / Print (P)"
            aria-label="Export full deck to PDF or print"
          >
            <IconPrint size={14} />
          </button>

          <button
            type="button"
            className={`present-btn present-btn--icon present-btn-fullscreen ${
              isFullscreen ? 'present-btn--active' : ''
            }`}
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen (F)' : 'Enter fullscreen (F)'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
            aria-pressed={isFullscreen}
          >
            <IconFullscreen isFullscreen={isFullscreen} size={14} />
          </button>
        </div>
      </nav>

      {/* Slide Overview Grid Modal (G) — Accessible Focus-Trapped Q&A Quick Jump */}
      <AnimatePresence>
        {showOverview && (
          <motion.div
            key="overview-modal"
            className="present-overview-backdrop"
            role="dialog"
            aria-modal="true"
            aria-labelledby="present-overview-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0.08 : 0.16 }}
            onClick={(event) => {
              if (event.target === event.currentTarget) {
                closeOverview();
              }
            }}
          >
            <motion.div
              ref={overviewModalRef}
              className="present-overview-modal"
              initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
              transition={{ duration: prefersReducedMotion ? 0.08 : 0.16 }}
            >
              <div className="present-overview-header">
                <div>
                  <h2 id="present-overview-title" className="present-overview-heading">
                    Slide Overview — Q&amp;A Quick Jump
                  </h2>
                  <p className="present-overview-sub">
                    {totalSlides} slides · Spoken target:{' '}
                    {formatMMSS(pacingSummary.totalSpokenSec)} /{' '}
                    {formatMMSS(maxTimerSeconds)} (+ 14:00 Q&amp;A) · Index No:{' '}
                    {DECK_META?.indexNo || '25688'} | Reg No:{' '}
                    {DECK_META?.regNo || '112219'}
                  </p>
                </div>
                <button
                  type="button"
                  className="present-btn present-btn--icon present-overview-close"
                  onClick={closeOverview}
                  title="Close overview (Esc)"
                  aria-label="Close slide overview"
                >
                  <IconClose size={15} />
                </button>
              </div>

              <div className="present-overview-grid present-scroll">
                {Array.from({ length: totalSlides }).map((_, idx) => {
                  const meta = SLIDES_META?.[idx] || {
                    id: idx + 1,
                    section: 'Slide',
                    title: `Slide ${idx + 1}`,
                    targetSec: 0,
                  };
                  const isActive = idx === currentIndex;

                  return (
                    <button
                      key={meta.slug ?? meta.id ?? idx}
                      type="button"
                      data-overview-active={isActive ? 'true' : undefined}
                      className={`present-overview-card ${
                        isActive ? 'present-overview-card--active' : ''
                      }`}
                      onClick={() => {
                        goToSlide(idx);
                        closeOverview();
                      }}
                    >
                      <div className="present-overview-card-top">
                        <span className="present-overview-num">
                          {String(idx + 1).padStart(2, '0')}
                        </span>
                        <span className="present-overview-time">
                          {isActive ? 'Current · ' : ''}
                          {formatTargetCue(meta.targetSec)}
                        </span>
                      </div>

                      <div>
                        <div className="present-overview-section">
                          {meta.section}
                          {meta.guideRef ? ` · ${meta.guideRef}` : ''}
                        </div>
                        <div className="present-overview-card-title">{meta.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="present-overview-footer">
                <div className="present-shortcuts-list">
                  <span className="present-shortcut-item">
                    <kbd className="present-kbd">←</kbd>
                    <kbd className="present-kbd">→</kbd>
                    <span>Navigate</span>
                  </span>
                  <span className="present-shortcut-item">
                    <kbd className="present-kbd">G</kbd>
                    <span>Overview</span>
                  </span>
                  <span className="present-shortcut-item">
                    <kbd className="present-kbd">N</kbd>
                    <span>Notes</span>
                  </span>
                  <span className="present-shortcut-item">
                    <kbd className="present-kbd">T</kbd>
                    <span>Timer</span>
                  </span>
                  <span className="present-shortcut-item">
                    <kbd className="present-kbd">P</kbd>
                    <span>PDF</span>
                  </span>
                  <span className="present-shortcut-item">
                    <kbd className="present-kbd">F</kbd>
                    <span>Fullscreen</span>
                  </span>
                  <span className="present-shortcut-item">
                    <kbd className="present-kbd">Esc</kbd>
                    <span>Close</span>
                  </span>
                </div>
                <span>Click any slide card to jump immediately</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Deck Print / PDF Export Container (Hidden on Screen, Rendered in @media print) */}
      <div className="present-print-deck" aria-hidden="true">
        {SLIDES.map((SlideComponent, idx) => {
          const meta = SLIDES_META?.[idx];
          return (
            <div key={meta?.slug ?? meta?.id ?? idx} className="present-print-page">
              <SlideComponent slideNumber={idx + 1} totalSlides={totalSlides} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
