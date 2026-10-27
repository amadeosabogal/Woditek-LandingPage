import React from 'react';
import { Search, PenTool, Braces, Rocket } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FadeIn } from '../FadeIn';
import { SectionHeading } from '../ui/SectionHeading';
import { SpotlightCard } from '../ui/SpotlightCard';
import { useInView } from '../../hooks/useInView';

interface Step {
  icon: LucideIcon;
  title: string;
  text: string;
}

const STEPS: Step[] = [
  { icon: Search, title: 'Analizamos', text: 'Entendemos tu negocio, necesidades y procesos actuales.' },
  { icon: PenTool, title: 'Diseñamos', text: 'Definimos la solución y diseñamos la experiencia del sistema.' },
  { icon: Braces, title: 'Desarrollamos', text: 'Construimos y probamos el software con altos estándares.' },
  { icon: Rocket, title: 'Implementamos', text: 'Ponemos el sistema en funcionamiento y brindamos soporte.' },
];

export const Process: React.FC = () => {
  const [ref, inView] = useInView<HTMLDivElement>({ threshold: 0.15 });

  return (
    <section id="how-we-work" className="relative py-16 sm:py-24 md:py-32 bg-ink-950 overflow-hidden">
      <div className="absolute top-0 inset-x-0 hairline"></div>
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[48rem] h-64 bg-blue-600/10 rounded-pill blur-[120px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <SectionHeading
          title={
            <>
              Del primer contacto a tu sistema <span className="text-gradient">en marcha</span>
            </>
          }
          className="mb-16 md:mb-20"
        />

        <div ref={ref} className="relative">
          {/* Línea de progreso: vertical en pantallas chicas, horizontal en xl */}
          <div className="absolute left-7 top-7 bottom-7 w-px bg-white/10 xl:hidden"></div>
          <div className="hidden xl:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-white/10"></div>
          {inView && (
            <>
              <div
                className="absolute left-7 top-7 bottom-7 w-px origin-top bg-gradient-to-b from-blue-500 to-cyan-300 animate-grow-y xl:hidden"
                style={{ animationDuration: '2s' }}
              ></div>
              <div
                className="hidden xl:block absolute top-7 left-[12.5%] right-[12.5%] h-px origin-left bg-gradient-to-r from-blue-500 to-cyan-300 animate-grow-x"
                style={{ animationDuration: '2s' }}
              ></div>
            </>
          )}

          <ol className="grid grid-cols-1 xl:grid-cols-4 gap-8 xl:gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <li key={step.title} className="relative pl-20 xl:pl-0 xl:pt-20">
                  <div className="absolute left-0 top-0 xl:left-1/2 xl:-translate-x-1/2 w-14 h-14 rounded-pill bg-ink-900 border-2 border-blue-400/60 text-blue-300 flex items-center justify-center font-heading font-black text-lg shadow-[0_0_28px_rgba(59,130,246,0.35)]">
                    {`0${i + 1}`}
                  </div>
                  <FadeIn delay={i * 140} className="h-full">
                    <SpotlightCard className="group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-ink-900 p-7 xl:text-center transition-transform duration-500 hover:-translate-y-1">
                      <span
                        aria-hidden="true"
                        className="absolute -top-4 right-3 font-heading font-black text-[7rem] leading-none text-white/[0.03] select-none"
                      >
                        {`0${i + 1}`}
                      </span>
                      <div className="relative z-10">
                        <div className="w-12 h-12 mb-5 xl:mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center group-hover:rotate-6 transition-transform duration-500">
                          <Icon className="w-6 h-6" />
                        </div>
                        <h3 className="font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-white text-lg mb-3">
                          {step.title}
                        </h3>
                        <p className="text-slate-400 leading-relaxed">{step.text}</p>
                      </div>
                    </SpotlightCard>
                  </FadeIn>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};
