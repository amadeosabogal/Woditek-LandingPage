import React from 'react';

type SpotlightCardProps = React.HTMLAttributes<HTMLDivElement>;

/** Tarjeta cuyo borde y fondo se iluminan siguiendo el cursor (ver .spotlight-card en index.css). */
export const SpotlightCard: React.FC<SpotlightCardProps> = ({ children, className = '', onMouseMove, ...rest }) => {
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`);
    onMouseMove?.(e);
  };

  return (
    <div {...rest} onMouseMove={handleMove} className={`spotlight-card ${className}`}>
      {children}
    </div>
  );
};
