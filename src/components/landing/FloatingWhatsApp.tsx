import React from 'react';
import { WhatsAppIcon } from '../ui/Icons';
import { trackFloatingWhatsAppClick } from '../../utils/analytics';

export const FloatingWhatsApp: React.FC = () => (
  <a
    href="https://wa.me/51953095173?text=Hola%20Woditek,%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios"
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => trackFloatingWhatsAppClick()}
    aria-label="Contactar por WhatsApp"
    className="group fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 flex items-center"
  >
    <span className="hidden sm:block mr-3 px-4 py-2 rounded-pill bg-ink-800/95 backdrop-blur border border-white/10 text-sm font-semibold text-white shadow-xl opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 pointer-events-none whitespace-nowrap">
      Escríbenos por WhatsApp
    </span>
    <span className="relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16">
      <span className="absolute inset-0 rounded-pill bg-[#25D366] animate-pulse-ring"></span>
      <span className="relative flex items-center justify-center w-full h-full rounded-pill bg-[#25D366] text-white shadow-[0_8px_28px_rgba(37,211,102,0.45)] group-hover:scale-110 transition-transform duration-300">
        <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8" />
      </span>
    </span>
  </a>
);
