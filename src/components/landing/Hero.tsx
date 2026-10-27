import React, { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { FadeIn } from '../FadeIn';
import { HeroDashboard } from '../HeroDashboard';

const ROTATING_WORDS = ['restaurantes', 'clínicas', 'barberías', 'comercios', 'empresas'];

interface HeroProps {
  onContact: () => void;
  scrollTo: (id: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onContact, scrollTo }) => {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setWordIndex((i) => (i + 1) % ROTATING_WORDS.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center pt-28 pb-24 md:pt-32 md:pb-28 overflow-hidden bg-ink-950">
      {/* Fondo: cuadrícula + luces que se desplazan lentamente */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 grid-fade"></div>
        <div className="absolute -top-40 -left-32 w-[34rem] h-[34rem] bg-blue-600/25 rounded-pill blur-[120px] animate-blob"></div>
        <div className="absolute top-1/3 right-0 w-[30rem] h-[30rem] bg-cyan-500/15 rounded-pill blur-[130px] animate-blob" style={{ animationDelay: '-6s' }}></div>
        <div className="absolute bottom-0 left-1/3 w-[28rem] h-[28rem] bg-indigo-600/20 rounded-pill blur-[140px] animate-blob" style={{ animationDelay: '-12s' }}></div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink-950 to-transparent"></div>
      </div>

      <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-16 relative z-10 grid xl:grid-cols-[1.15fr_1fr] gap-14 xl:gap-12 items-center">
        <div className="min-w-0">
          <FadeIn delay={100} duration={1000}>
            <h1 className="font-heading font-black uppercase leading-[0.95] [font-variation-settings:'wdth'_125] mb-6 text-white tracking-tight [font-size:clamp(1.6rem,7.2vw,3.75rem)] xl:[font-size:clamp(2.75rem,3.7vw,3.75rem)]">
              Transformamos tus ideas en<br />
              <span className="text-gradient-animated animate-shimmer">software</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed mb-3">
              Creamos sistemas de gestión, páginas web y automatizaciones a medida para tu negocio. Tú te quedas con el 100% del código.
            </p>
            <p className="text-sm sm:text-base text-slate-400 mb-8 h-7 flex items-center gap-2">
              Soluciones para
              <span key={wordIndex} className="animate-fade-up font-heading font-bold text-cyan-300">
                {ROTATING_WORDS[wordIndex]}
              </span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button
                onClick={onContact}
                className="glow-button group inline-flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white px-5 sm:px-8 py-4 rounded-pill font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-sm sm:text-base whitespace-nowrap shadow-[0_0_30px_rgba(37,99,235,0.5)] hover:shadow-[0_0_44px_rgba(37,99,235,0.7)] transition-all"
              >
                Cotizar mi proyecto
                <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollTo('planes')}
                className="inline-flex items-center justify-center bg-white/5 backdrop-blur border border-white/20 text-white hover:bg-white hover:text-ink-950 px-8 py-4 rounded-pill font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-sm sm:text-base transition-colors"
              >
                Ver planes web
              </button>
            </div>
            <ul className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Código 100% tuyo</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Soporte directo por WhatsApp</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" /> Webs desde 3 días hábiles</li>
            </ul>
          </FadeIn>
        </div>

        <FadeIn delay={300} duration={1000} className="min-w-0">
          <HeroDashboard />
        </FadeIn>
      </div>
    </section>
  );
};
