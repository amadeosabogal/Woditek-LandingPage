import React from 'react';
import { ArrowRight } from 'lucide-react';
import { FadeIn } from '../FadeIn';
import { useInView } from '../../hooks/useInView';
import teamPhoto from '../../assets/hero-business.webp';

interface FinalCtaProps {
  onContact: () => void;
}

export const FinalCta: React.FC<FinalCtaProps> = ({ onContact }) => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.2 });

  return (
    <section className="relative py-20 md:py-28 bg-ink-950 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <FadeIn>
          <div
            ref={ref}
            className="relative overflow-hidden rounded-[2rem] border border-blue-400/20 shadow-[0_40px_100px_-30px_rgba(37,99,235,0.55)]"
          >
            <img
              src={teamPhoto}
              alt=""
              loading="lazy"
              decoding="async"
              className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[2400ms] ease-out ${
                inView ? 'scale-100' : 'scale-110'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-ink-950/95 via-blue-950/90 to-blue-700/80"></div>
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-cyan-400/25 rounded-pill blur-3xl animate-blob pointer-events-none"></div>
            <div className="absolute inset-0 grid-fade opacity-60 pointer-events-none"></div>

            <div className="relative px-6 py-14 sm:px-12 sm:py-20 lg:px-16 lg:py-24 max-w-4xl">
              <h2 className="font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-white leading-[1.05] tracking-tight mb-5 [font-size:clamp(1.55rem,6.4vw,3rem)]">
                Empecemos tu proyecto <span className="text-gradient">hoy</span>
              </h2>
              <p className="text-base sm:text-lg text-blue-100/90 leading-relaxed mb-9 max-w-xl">
                Cuéntanos qué necesitas y te respondemos con una propuesta a tu medida, sin compromiso.
              </p>
              <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4">
                <button
                  onClick={onContact}
                  className="glow-button group inline-flex items-center justify-center gap-3 whitespace-nowrap bg-white text-ink-950 hover:bg-cyan-100 px-8 py-4 rounded-pill font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-sm sm:text-base transition-colors"
                >
                  Cotizar mi proyecto
                  <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
