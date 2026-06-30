import React from 'react';
import logoWhite from '../assets/logo.png';
import logoBlack from '../assets/Recurso 18.png';

interface LogoProps {
  className?: string;
  showText?: boolean;
  iconOnly?: boolean;
  isScrolled?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', isScrolled = false }) => {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src={isScrolled ? logoBlack : logoWhite}
        alt="Woditek Logo"
        className="h-8 md:h-9 w-auto object-contain transition-transform duration-300 hover:scale-105"
      />
    </div>
  );
};
