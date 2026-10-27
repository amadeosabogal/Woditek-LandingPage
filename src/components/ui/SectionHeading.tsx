import React from 'react';
import { FadeIn } from '../FadeIn';

interface SectionHeadingProps {
  title: React.ReactNode;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  title,
  description,
  align = 'center',
  className = '',
}) => (
  <FadeIn className={`${align === 'center' ? 'text-center mx-auto' : ''} max-w-3xl ${className}`}>
    <h2 className="font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-white leading-[1.05] tracking-tight [font-size:clamp(1.55rem,6.4vw,3rem)]">
      {title}
    </h2>
    {description && <p className="mt-5 text-base sm:text-lg text-slate-400 leading-relaxed">{description}</p>}
  </FadeIn>
);
