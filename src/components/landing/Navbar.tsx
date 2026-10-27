import React, { useEffect, useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '../Logo';
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from '../ui/Icons';

export const NAV_LINKS = [
  { id: 'services', label: 'Servicios' },
  { id: 'sectors', label: 'Sectores' },
  { id: 'how-we-work', label: 'Proceso' },
  { id: 'planes', label: 'Planes' },
  { id: 'testimonials', label: 'Testimonios' },
  { id: 'faq', label: 'Preguntas' },
];

interface NavbarProps {
  isScrolled: boolean;
  isMenuOpen: boolean;
  onOpenMenu: () => void;
  onCloseMenu: () => void;
  onContact: () => void;
  scrollTo: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isScrolled, isMenuOpen, onOpenMenu, onCloseMenu, onContact, scrollTo }) => {
  const [activeId, setActiveId] = useState<string>('');

  // Resalta en el menú la sección que se está viendo
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    const hero = document.getElementById('home');
    if (hero) observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Cierra el menú móvil con Escape
  useEffect(() => {
    if (!isMenuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCloseMenu();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMenuOpen, onCloseMenu]);

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 border-b ${
          isScrolled
            ? 'py-2.5 bg-ink-950/80 backdrop-blur-xl border-white/10 shadow-[0_8px_30px_rgba(0,0,0,0.35)]'
            : 'py-5 bg-transparent border-transparent'
        }`}
      >
        <div className="max-w-[1600px] mx-auto px-4 md:px-8 lg:px-16 flex items-center justify-between gap-6">
          <button onClick={() => scrollTo('home')} aria-label="Ir al inicio" className="shrink-0">
            <Logo imgClassName="h-7 md:h-8 w-auto" />
          </button>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Principal">
            {NAV_LINKS.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollTo(link.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-pill transition-colors ${
                  activeId === link.id ? 'text-white bg-white/10' : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={onContact}
              className="glow-button inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 sm:px-6 py-2.5 rounded-pill text-sm font-heading font-black uppercase [font-variation-settings:'wdth'_125] shadow-[0_0_24px_rgba(37,99,235,0.45)] transition-colors whitespace-nowrap"
            >
              <span className="sm:hidden">Cotizar</span>
              <span className="hidden sm:inline">Cotizar proyecto</span>
              <ArrowRight className="w-4 h-4 hidden sm:block" />
            </button>
            <button
              onClick={onOpenMenu}
              aria-label="Abrir menú"
              className="lg:hidden w-10 h-10 inline-flex items-center justify-center rounded-pill border border-white/15 text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Menú móvil a pantalla completa */}
      <div
        className={`fixed inset-0 z-[55] bg-ink-950 text-white overflow-y-auto transition-opacity duration-500 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="absolute -top-32 -right-24 w-96 h-96 bg-blue-600/25 rounded-pill blur-[110px] pointer-events-none"></div>
        <div className="absolute bottom-0 -left-24 w-96 h-96 bg-cyan-500/10 rounded-pill blur-[110px] pointer-events-none"></div>

        <div className="relative max-w-3xl mx-auto min-h-full flex flex-col px-6 py-5">
          <div className="flex items-center justify-between">
            <Logo imgClassName="h-7 w-auto" />
            <button
              onClick={onCloseMenu}
              aria-label="Cerrar menú"
              className="w-10 h-10 inline-flex items-center justify-center rounded-pill border border-white/15 hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <ul className="flex-1 flex flex-col justify-center py-10 divide-y divide-white/10">
            {[{ id: 'home', label: 'Inicio' }, ...NAV_LINKS].map((link, i) => (
              <li
                key={link.id}
                className="transition-all duration-500"
                style={{
                  transitionDelay: isMenuOpen ? `${120 + i * 60}ms` : '0ms',
                  opacity: isMenuOpen ? 1 : 0,
                  transform: isMenuOpen ? 'translateY(0)' : 'translateY(16px)',
                }}
              >
                <button
                  onClick={() => {
                    onCloseMenu();
                    scrollTo(link.id);
                  }}
                  className="group w-full flex items-center gap-4 py-4 text-left"
                >
                  <span className="text-xs font-heading font-bold text-blue-400 tabular-nums">0{i + 1}</span>
                  <span className="flex-1 font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-2xl sm:text-3xl group-hover:text-blue-300 transition-colors">
                    {link.label}
                  </span>
                  <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-blue-300 group-hover:translate-x-1 transition-all" />
                </button>
              </li>
            ))}
          </ul>

          <div className="pb-4 space-y-5">
            <button
              onClick={() => {
                onCloseMenu();
                onContact();
              }}
              className="glow-button w-full bg-blue-600 hover:bg-blue-500 text-white py-4 rounded-pill font-heading font-black uppercase [font-variation-settings:'wdth'_125] shadow-[0_0_30px_rgba(37,99,235,0.45)]"
            >
              Cotizar mi proyecto
            </button>
            <div className="flex items-center justify-center gap-3">
              {[
                { href: 'https://wa.me/51953095173', label: 'WhatsApp', Icon: WhatsAppIcon },
                { href: 'https://www.instagram.com/woditek.pe/', label: 'Instagram', Icon: InstagramIcon },
                { href: 'https://www.tiktok.com/@woditek', label: 'TikTok', Icon: TikTokIcon },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-11 h-11 inline-flex items-center justify-center rounded-pill border border-white/15 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
