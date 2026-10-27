import React, { useState } from 'react';
import {
  Rocket,
  Globe,
  ShoppingCart,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Cloud,
  Headphones,
  ChevronDown,
} from 'lucide-react';
import { FadeIn } from './FadeIn';
import { SectionHeading } from './ui/SectionHeading';
import { SpotlightCard } from './ui/SpotlightCard';
import { WhatsAppIcon } from './ui/Icons';
import { trackPlanClick, trackCustomEnterpriseClick } from '../utils/analytics';

interface WebPlan {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  deliveryTime: string;
  pricePEN: string;
  priceUSD: string;
  icon: React.ElementType;
  description: string;
  whatsappMessage: string;
  features: string[];
}

interface WebPlansProps {
  onOpenContact?: (planName?: string) => void;
}

const VISIBLE_FEATURES = 5;

const PILLARS = [
  {
    icon: ShieldCheck,
    title: 'Sin mensualidades ocultas',
    text: 'El sitio web y código son 100% tuyos. No pagarás cuotas mensuales forzosas de mantenimiento de plataforma.',
  },
  {
    icon: Cloud,
    title: 'Dominio y hosting gratis',
    text: 'Tu proyecto incluye dominio .com y hosting SSD de alta velocidad con certificado SSL HTTPS por 1 año completo.',
  },
  {
    icon: Zap,
    title: 'Carga ultrarrápida y SEO',
    text: 'Desarrollado con estándares web modernos para cargar en menos de 2 segundos y conseguir mejor posición en Google.',
  },
  {
    icon: Headphones,
    title: 'Soporte y garantía real',
    text: 'Atención directa con nuestro equipo técnico de ingeniería. Garantía incluida ante cualquier bug o consulta.',
  },
];

export const WebPlans: React.FC<WebPlansProps> = () => {
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const plans: WebPlan[] = [
    {
      id: 'landing',
      name: 'Landing Express',
      tagline: 'Para profesionales y campañas',
      badge: 'Rápido Retorno',
      isPopular: false,
      deliveryTime: '3 a 5 días hábiles',
      pricePEN: '890',
      priceUSD: '240',
      icon: Rocket,
      description: 'Página web de una sola sección diseñada para captar prospectos y convertir visitas en clientes de inmediato.',
      whatsappMessage: 'Hola Woditek, me interesa cotizar el Plan Landing Express (S/ 890). ¿Podrían brindarme más información para mi negocio?',
      features: [
        'Diseño One-Page exclusivo y 100% responsivo (Móvil y PC)',
        'Botón directo y flotante a WhatsApp integrado',
        'Formulario de contacto para captura y registro de prospectos',
        'Dominio .com y Hosting SSD de alta velocidad x 1 año',
        'Certificado de seguridad SSL (HTTPS) con candado verde',
        'Optimización de carga ultrarrápida y SEO On-Page básico',
        'Integración con Google Analytics y Pixel de Meta (Facebook/IG)',
        'Garantía técnica y soporte post-lanzamiento por 3 meses'
      ]
    },
    {
      id: 'corporativa',
      name: 'Web Corporativa Pro',
      tagline: 'Para empresas, pymes y marcas',
      badge: 'MÁS POPULAR',
      isPopular: true,
      deliveryTime: '7 a 12 días hábiles',
      pricePEN: '1,890',
      priceUSD: '510',
      icon: Globe,
      description: 'Sitio web profesional multipágina que consolida la autoridad de tu empresa, transmite confianza y atrae clientes constantemente.',
      whatsappMessage: 'Hola Woditek, me interesa cotizar el Plan Web Corporativa Pro (S/ 1,890). ¿Podríamos coordinar una propuesta para mi empresa?',
      features: [
        'Todo lo del Plan Landing Express incluido',
        'Hasta 5 a 7 páginas internas (Inicio, Nosotros, Servicios, Casos, Contacto)',
        'Diseño UX/UI exclusivo adaptado al manual de tu marca',
        'Panel autogestionable intuitivo para editar textos y fotografías',
        'Hasta 5 cuentas de correos corporativos (@tuempresa.com)',
        'Optimización SEO On-Page avanzada para posicionar en Google',
        'Integración con Google Maps interactivo y redes sociales',
        'Hosting Cloud empresarial con copias de seguridad automáticas',
        'Soporte técnico prioritario y garantía técnica por 6 meses'
      ]
    },
    {
      id: 'ecommerce',
      name: 'E-commerce & Tienda',
      tagline: 'Para comercio, retail y ventas 24/7',
      badge: 'Máxima Potencia',
      isPopular: false,
      deliveryTime: '15 a 20 días hábiles',
      pricePEN: '3,490',
      priceUSD: '940',
      icon: ShoppingCart,
      description: 'Tienda virtual 100% operativa las 24 horas con carrito de compras, catálogo autogestionable y cobros en línea con pasarelas seguras.',
      whatsappMessage: 'Hola Woditek, me interesa cotizar el Plan E-commerce y Tienda Online (S/ 3,490). Deseo asesoría para vender mis productos en línea.',
      features: [
        'Todo lo del Plan Web Corporativa Pro incluido',
        'Catálogo de productos ilimitado con categorías, variantes y filtros',
        'Pasarelas de pago 100% integradas (Culqi, Mercado Pago, Yape, Plin y Tarjetas)',
        'Carrito de compras dinámico y checkout optimizado sin fricciones',
        'Panel administrativo para gestión de ventas, pedidos, stock y clientes',
        'Alertas automáticas de nuevas compras a tu WhatsApp y Correo',
        'Módulo de cupones de descuento, ofertas y promociones',
        'Capacitación guiada por videollamada para ti y tu equipo',
        'Soporte VIP preferencial y garantía técnica por 1 año'
      ]
    }
  ];

  return (
    <section id="planes" className="relative py-16 sm:py-24 md:py-32 bg-ink-900 overflow-hidden">
      <div className="absolute top-0 inset-x-0 hairline"></div>
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/15 rounded-pill blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-cyan-500/10 rounded-pill blur-[120px] pointer-events-none"></div>
      <div className="absolute inset-0 grid-fade opacity-60 pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <SectionHeading
          title={
            <>
              Planes de <span className="text-gradient">desarrollo web</span>
            </>
          }
          description="Soluciones digitales creadas con código limpio, alta velocidad y diseño estratégico para acelerar tus ventas. Sin pagos mensuales obligatorios."
        />

        {/* Currency Switcher */}
        <FadeIn delay={100}>
          <div className="flex items-center justify-center mt-8 mb-14">
            <div className="inline-flex items-center p-1.5 bg-ink-950/90 border border-white/10 rounded-pill shadow-2xl backdrop-blur-md" role="group" aria-label="Moneda">
              {(['PEN', 'USD'] as const).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => setCurrency(code)}
                  aria-pressed={currency === code}
                  className={`px-5 py-2 rounded-pill text-xs md:text-sm font-heading font-black uppercase tracking-wider transition-all duration-300 ${
                    currency === code
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {code === 'PEN' ? 'Soles (S/)' : 'Dólares ($)'}
                </button>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-6 items-stretch mb-20">
          {plans.map((plan, i) => {
            const IconComponent = plan.icon;
            const priceDisplay = currency === 'PEN' ? `S/ ${plan.pricePEN}` : `$ ${plan.priceUSD}`;
            const whatsappUrl = `https://wa.me/51953095173?text=${encodeURIComponent(plan.whatsappMessage)}`;
            const isExpanded = Boolean(expanded[plan.id]);
            const shownFeatures = isExpanded ? plan.features : plan.features.slice(0, VISIBLE_FEATURES);
            const hiddenCount = plan.features.length - VISIBLE_FEATURES;

            return (
              <FadeIn key={plan.id} delay={i * 120} className={plan.isPopular ? 'lg:-translate-y-4' : ''}>
                <div
                  className={`relative h-full rounded-3xl ${
                    plan.isPopular
                      ? 'p-[1.5px] bg-gradient-to-b from-blue-400 via-blue-600 to-cyan-400 shadow-[0_0_60px_rgba(37,99,235,0.35)]'
                      : ''
                  }`}
                >
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-heading font-black text-xs uppercase px-4 py-1.5 rounded-pill tracking-wider shadow-lg flex items-center gap-1.5 whitespace-nowrap z-20">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      {plan.badge}
                    </div>
                  )}

                  <SpotlightCard
                    className={`group flex flex-col h-full rounded-3xl transition-transform duration-500 hover:-translate-y-1 ${
                      plan.isPopular ? 'bg-ink-900' : 'bg-ink-950/70 border border-white/10 backdrop-blur-sm'
                    }`}
                  >
                    <div className="relative z-10 flex flex-col h-full">
                      {/* Cabecera */}
                      <div className="p-7 md:p-8 pb-6 border-b border-white/10">
                        <div className="flex items-center justify-between mb-5">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                              plan.isPopular
                                ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white shadow-[0_8px_24px_-6px_rgba(34,211,238,0.5)]'
                                : 'bg-white/5 border border-white/10 text-blue-300'
                            }`}
                          >
                            <IconComponent className="w-6 h-6" />
                          </div>
                          {!plan.isPopular && plan.badge && (
                            <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-300 bg-white/5 px-3 py-1 rounded-pill border border-white/10">
                              {plan.badge}
                            </span>
                          )}
                        </div>

                        <h3 className="font-heading text-2xl font-black text-white mb-1">{plan.name}</h3>
                        <p className="text-xs uppercase font-bold tracking-wider text-cyan-300 mb-4">{plan.tagline}</p>
                        <p className="text-sm text-slate-400 leading-relaxed min-h-[84px]">{plan.description}</p>

                        <div className="mt-6 pt-6 border-t border-white/10 flex items-baseline gap-2">
                          <span key={currency} className="animate-fade-up font-heading text-4xl md:text-5xl font-black text-white tracking-tight tabular-nums">
                            {priceDisplay}
                          </span>
                          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">/ pago único</span>
                        </div>

                        <div className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-400/20 px-3 py-1.5 rounded-pill">
                          <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                          <span>Entrega estimada: {plan.deliveryTime}</span>
                        </div>
                      </div>

                      {/* Características */}
                      <div className="p-7 md:p-8 pt-6 flex-grow flex flex-col justify-between">
                        <div>
                          <p className="text-xs uppercase font-heading font-black tracking-widest text-slate-400 mb-4">
                            ¿Qué incluye este plan?
                          </p>
                          <ul className="space-y-3">
                            {shownFeatures.map((feature) => (
                              <li key={feature} className="flex items-start text-sm text-slate-300 leading-snug">
                                <CheckCircle2
                                  className={`w-4 h-4 mr-2.5 mt-0.5 shrink-0 ${plan.isPopular ? 'text-cyan-400' : 'text-emerald-400'}`}
                                />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                          {hiddenCount > 0 && (
                            <button
                              type="button"
                              onClick={() => setExpanded((prev) => ({ ...prev, [plan.id]: !isExpanded }))}
                              aria-expanded={isExpanded}
                              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-blue-300 hover:text-blue-200 transition-colors"
                            >
                              {isExpanded ? 'Ver menos' : `Ver ${hiddenCount} características más`}
                              <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                            </button>
                          )}
                        </div>

                        {/* CTAs */}
                        <div className="mt-8 pt-6 border-t border-white/10">
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              const currentPrice = currency === 'PEN' ? plan.pricePEN : plan.priceUSD;
                              trackPlanClick(plan.name, currentPrice, currency);
                            }}
                            className={`glow-button w-full py-4 px-6 rounded-pill font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-sm flex items-center justify-center gap-2.5 transition-all group/cta ${
                              plan.isPopular
                                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_25px_rgba(37,99,235,0.45)] hover:shadow-[0_0_35px_rgba(37,99,235,0.65)]'
                                : 'bg-white/5 border border-white/20 hover:bg-white hover:text-ink-950 text-white'
                            }`}
                          >
                            <WhatsAppIcon className="w-5 h-5" />
                            <span>Elegir {plan.name}</span>
                            <ArrowRight className="w-4 h-4 transform group-hover/cta:translate-x-1 transition-transform" />
                          </a>

                        </div>
                      </div>
                    </div>
                  </SpotlightCard>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Pilares de confianza */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-14">
          {PILLARS.map((pillar, i) => {
            const Icon = pillar.icon;
            return (
              <FadeIn key={pillar.title} delay={i * 100}>
                <div className="h-full rounded-3xl border border-white/10 bg-ink-950/60 p-6 hover:border-blue-400/40 transition-colors">
                  <div className="w-10 h-10 mb-4 rounded-xl bg-blue-500/15 border border-blue-400/20 text-blue-300 flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading text-base font-extrabold text-white mb-2">{pillar.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{pillar.text}</p>
                </div>
              </FadeIn>
            );
          })}
        </div>

        {/* Proyecto a medida */}
        <FadeIn>
          <div className="relative overflow-hidden rounded-3xl border border-blue-400/30 bg-gradient-to-r from-blue-950/80 via-ink-900 to-blue-950/80 p-8 md:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/15 rounded-pill blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
              <div className="text-center lg:text-left max-w-2xl">
                <h3 className="font-heading text-2xl md:text-3xl font-black text-white mb-4 leading-tight">
                  ¿Necesitas un sistema personalizado o desarrollo especial?
                </h3>
                <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                  Si tu negocio requiere flujos a medida, panel con roles de usuario, facturación electrónica, conexión a APIs o un software ERP/CRM completo, diseñamos y construimos la solución exacta que necesitas.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full lg:w-auto">
                <a
                  href="https://wa.me/51953095173?text=Hola%20Woditek,%20necesito%20cotizar%20un%20proyecto%20o%20software%20a%20medida%20para%20mi%20empresa"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackCustomEnterpriseClick()}
                  className="glow-button bg-blue-600 hover:bg-blue-500 text-white font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-sm px-8 py-4 rounded-pill flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(37,99,235,0.45)] transition-colors whitespace-nowrap"
                >
                  <WhatsAppIcon className="w-5 h-5" />
                  <span>Cotizar a medida</span>
                </a>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
