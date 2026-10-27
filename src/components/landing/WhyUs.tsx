import React from 'react';
import { Maximize, Cpu, Layout, Settings, ShieldCheck, Headphones } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FadeIn } from '../FadeIn';
import { SectionHeading } from '../ui/SectionHeading';
import { SpotlightCard } from '../ui/SpotlightCard';
import { useInView } from '../../hooks/useInView';
import productShot from '../../assets/hero.webp';

const BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  {
    icon: Settings,
    title: 'Soluciones a medida',
    text: 'No adaptamos tu negocio a un software genérico. Creamos sistemas que se ajustan perfectamente a tu forma de trabajar.',
  },
  {
    icon: Layout,
    title: 'Diseño intuitivo',
    text: 'Sistemas fáciles de utilizar para tu equipo. Minimizamos la curva de aprendizaje con interfaces claras y modernas.',
  },
  {
    icon: Maximize,
    title: 'Escalable',
    text: 'Tu sistema puede crecer junto con tu empresa. Diseñamos bases sólidas listas para integrar nuevas funcionalidades en el futuro.',
  },
  {
    icon: Cpu,
    title: 'Tecnología moderna',
    text: 'Utilizamos herramientas actuales para desarrollar soluciones eficientes, seguras y de alto rendimiento.',
  },
];

export const WhyUs: React.FC = () => {
  const [bannerRef, bannerInView] = useInView<HTMLDivElement>({ threshold: 0.25 });

  return (
    <section id="why-choose-us" className="relative py-16 sm:py-24 md:py-32 bg-ink-900 overflow-hidden">
      <div className="absolute top-0 inset-x-0 hairline"></div>
      <div className="absolute -top-24 -left-24 w-[30rem] h-[30rem] bg-blue-600/15 rounded-pill blur-[130px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <SectionHeading
          title={
            <>
              ¿Por qué elegir <span className="text-gradient">Woditek</span>?
            </>
          }
          className="mb-14 md:mb-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-5 mb-10 md:mb-14">
          {BENEFITS.map((benefit, i) => {
            const Icon = benefit.icon;
            return (
              <FadeIn key={benefit.title} delay={i * 100}>
                <SpotlightCard className="group h-full rounded-3xl border border-white/10 bg-ink-950/70 p-7 transition-transform duration-500 hover:-translate-y-1">
                  <div className="relative z-10">
                    <div className="w-12 h-12 mb-6 rounded-2xl bg-blue-500/15 border border-blue-400/20 text-blue-300 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-blue-500 group-hover:to-cyan-400 group-hover:text-white transition-all duration-500">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-heading text-lg font-extrabold text-white mb-3">{benefit.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{benefit.text}</p>
                  </div>
                </SpotlightCard>
              </FadeIn>
            );
          })}
        </div>

        {/* Banner con foto de producto */}
        <FadeIn>
          <div
            ref={bannerRef}
            className="relative overflow-hidden rounded-3xl border border-white/10 bg-ink-950 shadow-[0_30px_80px_-30px_rgba(37,99,235,0.4)]"
          >
            <img
              src={productShot}
              alt="Panel de gestión de Woditek en laptop y celular"
              loading="lazy"
              decoding="async"
              className={`w-full h-64 sm:h-80 lg:h-[26rem] object-cover object-right transition-transform duration-[2200ms] ease-out ${
                bannerInView ? 'scale-100' : 'scale-110'
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-ink-950/70 to-transparent lg:via-ink-950/40"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent lg:hidden"></div>

            <div className="absolute inset-0 flex items-end lg:items-center p-6 sm:p-10 lg:p-14">
              <div className="max-w-md">
                <h3 className="font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-white text-xl sm:text-2xl lg:text-3xl leading-tight mb-4">
                  Tu negocio en la <span className="text-gradient">palma de tu mano</span>
                </h3>
                <p className="hidden sm:block text-slate-300 mb-6">
                  Gestiona ventas, clientes y reportes desde la computadora, la tablet o el celular, en cualquier parte.
                </p>
                <div className="hidden sm:flex flex-wrap gap-3 mb-6">
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-pill bg-white/10 backdrop-blur border border-white/15 text-xs font-semibold text-white">
                    <ShieldCheck className="w-4 h-4 text-cyan-300" /> Código 100% tuyo
                  </span>
                  <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-pill bg-white/10 backdrop-blur border border-white/15 text-xs font-semibold text-white">
                    <Headphones className="w-4 h-4 text-cyan-300" /> Soporte directo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
