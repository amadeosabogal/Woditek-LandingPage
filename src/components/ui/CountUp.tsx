import React, { useEffect, useState } from 'react';
import { useInView, prefersReducedMotion } from '../../hooks/useInView';

interface CountUpProps {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/** Número que cuenta desde 0 al entrar en pantalla. */
export const CountUp: React.FC<CountUpProps> = ({ to, duration = 1600, prefix = '', suffix = '', className = '' }) => {
  const [ref, inView] = useInView<HTMLSpanElement>({ threshold: 0.4 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (prefersReducedMotion()) {
      setValue(to);
      return;
    }

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      setValue(to * (1 - Math.pow(1 - progress, 4)));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {prefix}
      {Math.round(value).toLocaleString('en-US')}
      {suffix}
    </span>
  );
};
