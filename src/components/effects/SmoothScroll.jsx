import { useEffect } from 'react';
import Lenis from 'lenis';
import { isScrollLocked } from '../../lib/scrollLock';

export default function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    if (isScrollLocked()) {
      lenis.stop();
    }

    const handleScrollLock = (event) => {
      if (event.detail?.locked) {
        lenis.stop();
      } else {
        lenis.start();
      }
    };

    window.addEventListener('app:scroll-lock', handleScrollLock);

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('app:scroll-lock', handleScrollLock);
      lenis.destroy();
    };
  }, []);

  return null;
}
