import React from 'react';

interface MarqueeProps {
  children: React.ReactNode;
  className?: string;
  /** Segundos que tarda en dar una vuelta completa. */
  duration?: number;
}

/** Carrusel infinito: el contenido se duplica para que el bucle sea continuo. */
export const Marquee: React.FC<MarqueeProps> = ({ children, className = '', duration = 40 }) => (
  <div className={`marquee-mask overflow-hidden ${className}`}>
    <div className="marquee-track flex w-max animate-marquee" style={{ animationDuration: `${duration}s` }}>
      <div className="flex shrink-0 items-center gap-4 pr-4">{children}</div>
      <div className="flex shrink-0 items-center gap-4 pr-4" aria-hidden="true">
        {children}
      </div>
    </div>
  </div>
);
