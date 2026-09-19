import React from 'react';
import logoWhite from '../assets/logo.webp';
import logoBlack from '../assets/Recurso 18.webp';

interface LogoProps {
  className?: string;
  imgClassName?: string;
  showText?: boolean;
  iconOnly?: boolean;
  isScrolled?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', imgClassName = 'h-8 md:h-9 w-auto', isScrolled = false }) => {
  return (
    <div className={`flex items-center select-none ${className}`}>
      <img
        src={isScrolled ? logoBlack : logoWhite}
        alt="Woditek Logo"
        className={`${imgClassName} object-contain transition-transform duration-300 hover:scale-105`}
      />
    </div>
  );
};
