import { useEffect, useRef, useState } from 'react';

interface UseInViewOptions {
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
}

/** Devuelve [ref, inView]: true cuando el elemento entra al viewport. */
export function useInView<T extends Element = HTMLDivElement>({
  once = true,
  threshold = 0.2,
  rootMargin = '0px',
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [once, threshold, rootMargin]);

  return [ref, inView] as const;
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
