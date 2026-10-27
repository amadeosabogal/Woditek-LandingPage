import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FadeIn } from '../FadeIn';
import { SectionHeading } from '../ui/SectionHeading';

const FAQS = [
  { q: '¿Cuánto cuesta desarrollar un software a medida?', a: 'Nuestros proyectos son inversiones diseñadas para multiplicar tu rentabilidad. El costo se adapta al tamaño de tu visión y a los objetivos de tu empresa. Contáctanos para una asesoría gratuita y diseñaremos una propuesta a tu medida sin compromiso.' },
  { q: '¿Qué incluye el hosting y dominio en los planes web?', a: 'Todos nuestros planes de desarrollo web incluyen el registro de tu dominio (.com) y el hosting SSD de alta velocidad por 1 año completo, además del certificado de seguridad SSL para que tu sitio sea 100% seguro (HTTPS).' },
  { q: '¿Cómo es la modalidad de pago para los proyectos web?', a: 'Trabajamos con un esquema transparente: 50% de anticipo inicial al arrancar el diseño y desarrollo, y el 50% restante únicamente al finalizar el proyecto tras tu completa conformidad y puesta en marcha.' },
  { q: '¿Pueden adaptar el sistema a nuestros procesos?', a: '¡Absolutamente! No te obligamos a adaptarte a un software rígido. Construimos una plataforma exclusiva que se amolda milimétricamente a tu forma de trabajar, automatizando tus tareas para que tu equipo sea mucho más productivo.' },
  { q: '¿El sistema funciona desde celular?', a: 'Sí. Todo lo que construimos es 100% responsivo. Podrás gestionar tu negocio, revisar reportes y controlar tus operaciones desde cualquier dispositivo: computadora, tablet o smartphone, en cualquier parte del mundo.' },
  { q: '¿Pueden integrar otros servicios?', a: 'Por supuesto. Conectamos tu nuevo sistema con tus herramientas favoritas (pasarelas de pago, facturación electrónica, WhatsApp, redes sociales) para centralizar absolutamente toda tu operación en un solo lugar.' },
];

export const Faq: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section id="faq" className="relative py-16 sm:py-24 md:py-32 bg-ink-900 overflow-hidden">
      <div className="absolute top-0 inset-x-0 hairline"></div>
      <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-blue-600/15 rounded-pill blur-[130px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16 grid lg:grid-cols-[0.8fr_1.2fr] gap-12 lg:gap-16">
        <div className="lg:sticky lg:top-28 self-start">
          <SectionHeading
            align="left"
            title={
              <>
                Resolvemos <span className="text-gradient">tus dudas</span>
              </>
            }
            description="Lo que más nos preguntan antes de empezar un proyecto."
          />
        </div>

        <FadeIn delay={100}>
          <div className="space-y-3">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className={`rounded-2xl border transition-colors duration-300 overflow-hidden ${
                    isOpen ? 'border-blue-400/40 bg-blue-500/[0.06]' : 'border-white/10 bg-ink-950/60 hover:border-white/20'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between gap-4 p-5 sm:p-6 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/60 rounded-2xl"
                  >
                    <span className="font-heading text-base sm:text-lg font-bold text-white">{faq.q}</span>
                    <span
                      className={`shrink-0 w-8 h-8 rounded-pill flex items-center justify-center border transition-all duration-300 ${
                        isOpen ? 'bg-blue-600 border-blue-500 text-white rotate-180' : 'border-white/15 text-slate-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-5 sm:px-6 pb-6 text-slate-400 leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
