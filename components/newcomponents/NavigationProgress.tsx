'use client';

import { useEffect, useRef, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Thin top progress bar that fires immediately when the pathname changes.
 * Works with Next.js App Router — no external library needed.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rafRef = useRef<number | null>(null);
  const prevPathRef = useRef(pathname + searchParams.toString());

  useEffect(() => {
    const current = pathname + searchParams.toString();

    // Only animate when the route actually changed
    if (current === prevPathRef.current) return;
    prevPathRef.current = current;

    // Clear any in-flight animation
    if (timerRef.current) clearTimeout(timerRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    // Start: snap to 10% immediately, then ease to 85%
    setProgress(10);
    setVisible(true);

    let current_progress = 10;
    const tick = () => {
      // Ease toward 85% — slows down as it approaches
      const remaining = 85 - current_progress;
      const increment = Math.max(0.5, remaining * 0.08);
      current_progress = Math.min(85, current_progress + increment);
      setProgress(current_progress);

      if (current_progress < 85) {
        timerRef.current = setTimeout(() => {
          rafRef.current = requestAnimationFrame(tick);
        }, 80);
      }
    };

    timerRef.current = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, 80);

    // Complete: jump to 100% then fade out
    const completeTimer = setTimeout(() => {
      setProgress(100);
      setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 300);
    }, 400);

    return () => {
      clearTimeout(completeTimer);
      if (timerRef.current) clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [pathname, searchParams]);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] h-[3px] pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="h-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.7)] transition-all"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '200ms' : '300ms',
          transitionTimingFunction: progress === 100 ? 'ease-out' : 'ease',
          opacity: visible ? 1 : 0,
          transitionProperty: 'width, opacity',
        }}
      />
    </div>
  );
}
