import React from 'react';
import { FadeIn } from '../FadeIn';
import { CountUp } from '../ui/CountUp';
import { Marquee } from '../ui/Marquee';

// Datos tomados de lo que ya afirma la página (rubros con demo, código propio, plan Landing Express, hosting incluido)
const STATS = [
  { to: 14, suffix: '+', label: 'Rubros con sistema listo' },
  { to: 100, suffix: '%', label: 'del código es tuyo' },
  { to: 3, suffix: ' días', label: 'hábiles para tu web express' },
  { to: 1, suffix: ' año', label: 'de dominio y hosting incluido' },
];

const INTEGRATIONS = [
  'WhatsApp',
  'Yape',
  'Plin',
  'Culqi',
  'Mercado Pago',
  'Facturación electrónica',
  'Google Analytics',
  'Meta Pixel',
  'Google Maps',
  'APIs REST',
  'Redes sociales',
  'Certificado SSL',
];

export const StatsBand: React.FC = () => (
  <section className="relative z-20 -mt-14 sm:-mt-16 pb-6 bg-ink-950">
    <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
      <FadeIn>
        <div className="grid grid-cols-2 lg:grid-cols-4 bg-ink-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-[0_20px_60px_-20px_rgba(37,99,235,0.35)] overflow-hidden">
          {STATS.map((stat, i) => (
            <div
              key={stat.label}
              className={`p-6 sm:p-8 text-center ${i % 2 === 1 ? 'border-l border-white/10' : ''} ${
                i >= 2 ? 'border-t border-white/10 lg:border-t-0' : ''
              } ${i > 0 ? 'lg:border-l lg:border-white/10' : ''}`}
            >
              <p className="font-heading font-black text-3xl sm:text-5xl text-gradient leading-none mb-2">
                <CountUp to={stat.to} suffix={stat.suffix} />
              </p>
              <p className="text-xs sm:text-sm text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </FadeIn>

      <FadeIn delay={150}>
        <p className="mt-12 mb-5 text-center text-xs font-heading font-bold uppercase tracking-[0.25em] text-slate-500">
          Integramos con las herramientas que ya usas
        </p>
        <Marquee duration={45}>
          {INTEGRATIONS.map((name) => (
            <span
              key={name}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-pill border border-white/10 bg-white/[0.03] text-sm text-slate-300 whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-pill bg-cyan-400"></span>
              {name}
            </span>
          ))}
        </Marquee>
      </FadeIn>
    </div>
  </section>
);
