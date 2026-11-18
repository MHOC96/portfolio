const activeLocks = new Set();

const notifyScrollLock = (locked) => {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent('app:scroll-lock', { detail: { locked } }));
};

/**
 * Acquire a named scroll lock so overlapping overlays/modals do not unlock
 * document scrolling prematurely when one of them closes.
 */
export function lockScroll(id = 'default') {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  activeLocks.add(id);
  if (activeLocks.size > 0) {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    notifyScrollLock(true);
  }
}

/**
 * Release a named scroll lock and restore scrolling only when no locks remain.
 */
export function unlockScroll(id = 'default') {
  if (typeof document === 'undefined' || typeof window === 'undefined') return;
  const removed = activeLocks.delete(id);
  if (removed && activeLocks.size === 0) {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    notifyScrollLock(false);
  }
}

/**
 * Check whether any scroll lock is currently active.
 */
export function isScrollLocked() {
  return activeLocks.size > 0;
}
