import React from 'react';
import { ArrowRight, Braces, Globe, Workflow, BrainCircuit, Plug, ChartColumn } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FadeIn } from '../FadeIn';
import { SectionHeading } from '../ui/SectionHeading';
import { SpotlightCard } from '../ui/SpotlightCard';

interface Service {
  id: string;
  icon: LucideIcon;
  title: string;
  tagline: string;
  description?: string;
  features: string[];
  image: string;
  span: string;
  action?: 'plans';
}

const SERVICES: Service[] = [
  {
    id: 'software',
    icon: Braces,
    title: 'Software a medida',
    tagline: 'Sistemas diseñados específicamente para tu negocio.',
    description:
      'Creamos sistemas web personalizados desde cero, adaptados a los procesos y necesidades específicas de cada empresa.',
    features: ['ERP y módulos empresariales', 'CRM y sistemas de ventas', 'Gestión de inventarios'],
    image: '/service_software.webp',
    span: 'lg:col-span-4',
  },
  {
    id: 'web',
    icon: Globe,
    title: 'Desarrollo web',
    tagline: 'Sitios web modernos que representan tu marca.',
    features: ['Landing pages', 'Catálogos digitales', 'Sitios empresariales'],
    image: '/service_web.webp',
    span: 'lg:col-span-2',
    action: 'plans',
  },
  {
    id: 'automation',
    icon: Workflow,
    title: 'Automatización',
    tagline: 'Menos tareas manuales, más eficiencia.',
    features: ['Flujos de aprobación', 'Notificaciones y alertas', 'Generación de reportes'],
    image: '/service_automation.webp',
    span: 'lg:col-span-2',
  },
  {
    id: 'ai',
    icon: BrainCircuit,
    title: 'Inteligencia Artificial',
    tagline: 'IA aplicada a procesos reales de negocio.',
    features: ['Chatbots empresariales', 'Análisis de información', 'Asistentes virtuales'],
    image: '/service_ai.webp',
    span: 'lg:col-span-2',
  },
  {
    id: 'integrations',
    icon: Plug,
    title: 'Integraciones',
    tagline: 'Conectamos tus sistemas y herramientas.',
    features: ['APIs REST', 'Sistemas de pago', 'Integración con WhatsApp'],
    image: '/service_integration.webp',
    span: 'lg:col-span-2',
  },
  {
    id: 'dashboards',
    icon: ChartColumn,
    title: 'Dashboards',
    tagline: 'Convierte tus datos en decisiones.',
    description:
      'Transformamos los datos de tu negocio en información visual para facilitar el seguimiento de indicadores.',
    features: ['KPIs e indicadores', 'Gráficos interactivos', 'Paneles administrativos'],
    image: '/service_dashboard.webp',
    span: 'lg:col-span-6',
  },
];

interface ServicesProps {
  scrollTo: (id: string) => void;
}

export const Services: React.FC<ServicesProps> = ({ scrollTo }) => (
  <section id="services" className="relative py-16 sm:py-24 md:py-32 bg-ink-950 overflow-hidden">
    <div className="absolute top-0 inset-x-0 hairline"></div>
    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[50rem] h-72 bg-blue-600/10 rounded-pill blur-[120px] pointer-events-none"></div>

    <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
      <SectionHeading
        title={
          <>
            Todo lo que tu negocio necesita, <span className="text-gradient">en un solo equipo</span>
          </>
        }
        description="Soluciones digitales diseñadas para las necesidades de tu negocio."
        className="mb-14 md:mb-16"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5">
        {SERVICES.map((service, i) => {
          const Icon = service.icon;
          const isLarge = Boolean(service.description);
          return (
            <FadeIn key={service.id} delay={(i % 3) * 100} className={`${service.span} ${isLarge ? 'md:col-span-2' : ''}`}>
              <SpotlightCard className="group h-full overflow-hidden rounded-3xl border border-white/10 bg-ink-900 transition-transform duration-500 hover:-translate-y-1">
                <img
                  src={service.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 z-0 w-full h-full object-cover opacity-30 scale-105 group-hover:opacity-50 group-hover:scale-110 transition-all duration-700"
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-t from-ink-900 via-ink-900/85 to-ink-900/30"></div>

                <div className={`relative z-10 p-7 md:p-8 flex flex-col h-full ${isLarge ? 'md:min-h-[320px]' : 'md:min-h-[280px]'}`}>
                  <div className="w-12 h-12 mb-6 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(34,211,238,0.5)] group-hover:rotate-6 transition-transform duration-500">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-heading text-xl md:text-2xl font-extrabold text-white mb-2">{service.title}</h3>
                  <p className="text-slate-300 font-medium mb-2">{service.tagline}</p>
                  {service.description && (
                    <p className="text-sm text-slate-400 leading-relaxed max-w-md">{service.description}</p>
                  )}

                  <div className="mt-auto pt-6 flex flex-wrap gap-2">
                    {service.features.map((feature) => (
                      <span
                        key={feature}
                        className="text-xs px-3 py-1.5 rounded-pill bg-white/5 border border-white/10 text-slate-300"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {service.action === 'plans' && (
                    <button
                      onClick={() => scrollTo('planes')}
                      className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-cyan-300 hover:text-cyan-200 transition-colors self-start group/btn"
                    >
                      Ver planes y precios
                      <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </SpotlightCard>
            </FadeIn>
          );
        })}

      </div>
    </div>
  </section>
);
