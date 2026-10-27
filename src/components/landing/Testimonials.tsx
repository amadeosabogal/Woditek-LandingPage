import React from 'react';
import { Quote, Star } from 'lucide-react';
import { FadeIn } from '../FadeIn';
import { SectionHeading } from '../ui/SectionHeading';
import { SpotlightCard } from '../ui/SpotlightCard';

const TESTIMONIALS = [
  {
    name: 'María Fernández',
    stars: 5,
    text: 'Woditek nos ayudó a digitalizar nuestros procesos y mejorar la gestión del negocio. Ahora todo nuestro equipo trabaja de forma mucho más eficiente.',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    name: 'Carlos Gómez',
    stars: 5,
    text: 'El sistema a medida que desarrollaron se adaptó perfectamente a nuestra barbería. Las reservas y la caja cuadran a la perfección cada día.',
    gradient: 'from-cyan-400 to-blue-500',
  },
  {
    name: 'Ana López',
    stars: 4,
    text: 'Increíble el nivel de detalle y el soporte post-implementación. Transformaron completamente la forma en que manejamos nuestro inventario y ventas online.',
    gradient: 'from-indigo-500 to-violet-500',
  },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

export const Testimonials: React.FC = () => (
  <section id="testimonials" className="relative py-16 sm:py-24 md:py-32 bg-ink-950 overflow-hidden">
    <div className="absolute top-0 inset-x-0 hairline"></div>
    <div className="absolute top-1/3 -right-32 w-[30rem] h-[30rem] bg-indigo-600/15 rounded-pill blur-[130px] pointer-events-none"></div>

    <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
      <SectionHeading
        title={
          <>
            Lo que dicen <span className="text-gradient">nuestros clientes</span>
          </>
        }
        className="mb-14 md:mb-16"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {TESTIMONIALS.map((t, i) => (
          <FadeIn key={t.name} delay={i * 120}>
            <SpotlightCard className="group h-full rounded-3xl border border-white/10 bg-ink-900 p-8 transition-transform duration-500 hover:-translate-y-1">
              <div className="relative z-10 flex flex-col h-full">
                <Quote className="w-9 h-9 text-blue-400/40 mb-5" />
                <div className="flex gap-1 mb-5 text-amber-400" aria-label={`${t.stars} de 5 estrellas`}>
                  {[0, 1, 2, 3, 4].map((s) => (
                    <Star key={s} className={`w-4 h-4 ${s < t.stars ? 'fill-current' : 'text-white/15'}`} />
                  ))}
                </div>
                <p className="font-heading text-base leading-relaxed text-slate-200 mb-8">“{t.text}”</p>
                <div className="mt-auto flex items-center gap-3 pt-6 border-t border-white/10">
                  <div
                    className={`w-11 h-11 rounded-pill bg-gradient-to-br ${t.gradient} flex items-center justify-center text-sm font-heading font-black text-white`}
                    aria-hidden="true"
                  >
                    {initials(t.name)}
                  </div>
                  <div>
                    <p className="font-heading font-bold text-white text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">Cliente de Woditek</p>
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </FadeIn>
        ))}
      </div>
    </div>
  </section>
);
