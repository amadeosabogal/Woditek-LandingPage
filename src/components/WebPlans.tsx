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
  Layers,
  Check,
  HelpCircle
} from 'lucide-react';
import { FadeIn } from './FadeIn';
import { trackPlanClick, trackCustomEnterpriseClick } from '../utils/analytics';

const WhatsAppIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

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

export const WebPlans: React.FC<WebPlansProps> = ({ onOpenContact }) => {
  const [currency, setCurrency] = useState<'PEN' | 'USD'>('PEN');

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
      badge: 'MÁS POPULAR ⭐',
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
    <section id="planes" className="py-24 md:py-32 bg-[#0c121f] text-white relative overflow-hidden">
      {/* Decorative ambient glowing orbs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full px-4 md:px-8 lg:px-16 max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <p className="font-serif italic text-xl md:text-2xl text-blue-400 mb-3">
              Inversión transparente y resultados reales
            </p>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-black uppercase [font-variation-settings:'wdth'_125] text-white mb-6 tracking-tight">
              Planes de Desarrollo Web
            </h2>
            <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              Soluciones digitales creadas con código limpio, alta velocidad y diseño estratégico para acelerar tus ventas. Sin pagos mensuales obligatorios.
            </p>

            {/* Currency Switcher */}
            <div className="flex items-center justify-center mt-8">
              <div className="inline-flex items-center p-1.5 bg-slate-900/90 border border-slate-700/80 rounded-full shadow-2xl backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setCurrency('PEN')}
                  className={`px-5 py-2 rounded-full text-xs md:text-sm font-heading font-black uppercase tracking-wider transition-all duration-300 ${
                    currency === 'PEN'
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Soles (PEN S/.)
                </button>
                <button
                  type="button"
                  onClick={() => setCurrency('USD')}
                  className={`px-5 py-2 rounded-full text-xs md:text-sm font-heading font-black uppercase tracking-wider transition-all duration-300 ${
                    currency === 'USD'
                      ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.6)]'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Dólares (USD $)
                </button>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Pricing Cards Grid */}
        <FadeIn delay={200}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mb-20">
            {plans.map((plan) => {
              const IconComponent = plan.icon;
              const priceDisplay = currency === 'PEN' ? `S/ ${plan.pricePEN}` : `$ ${plan.priceUSD}`;
              const whatsappUrl = `https://wa.me/51953095173?text=${encodeURIComponent(plan.whatsappMessage)}`;

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col rounded-sm transition-all duration-300 ${
                    plan.isPopular
                      ? 'bg-gradient-to-b from-[#131d35] via-[#0f172a] to-[#0c121f] border-2 border-blue-500 shadow-[0_0_50px_rgba(49,98,250,0.25)] lg:-translate-y-4 hover:lg:-translate-y-6'
                      : 'bg-slate-900/70 border border-slate-800 hover:border-slate-700 shadow-xl hover:-translate-y-2 backdrop-blur-sm'
                  }`}
                >
                  {/* Popular Floating Badge */}
                  {plan.isPopular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-heading font-black text-xs uppercase px-4 py-1.5 rounded-full tracking-wider shadow-lg flex items-center gap-1.5 whitespace-nowrap z-20">
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      {plan.badge}
                    </div>
                  )}

                  {/* Top Header Card */}
                  <div className="p-8 pb-6 border-b border-slate-800/80">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 rounded-sm flex items-center justify-center ${
                        plan.isPopular ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-800 text-blue-400'
                      }`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      {!plan.isPopular && plan.badge && (
                        <span className="text-[11px] font-heading font-bold uppercase tracking-wider text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                          {plan.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs uppercase font-bold tracking-wider text-blue-400 mb-4">
                      {plan.tagline}
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>

                    {/* Price Block */}
                    <div className="mt-6 pt-6 border-t border-slate-800 flex items-baseline gap-2">
                      <span className="font-heading text-4xl md:text-5xl font-black uppercase text-white tracking-tight">
                        {priceDisplay}
                      </span>
                      <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">
                        / pago único
                      </span>
                    </div>

                    {/* Delivery Time Badge */}
                    <div className="mt-4 inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-3 py-1.5 rounded-sm">
                      <Clock className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                      <span>Entrega estimada: {plan.deliveryTime}</span>
                    </div>
                  </div>

                  {/* Features List */}
                  <div className="p-8 pt-6 flex-grow flex flex-col justify-between">
                    <div>
                      <p className="text-xs uppercase font-heading font-black tracking-widest text-slate-400 mb-4">
                        ¿Qué incluye este plan?
                      </p>
                      <ul className="space-y-3.5">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm text-slate-300 leading-snug">
                            <CheckCircle2 className={`w-4 h-4 mr-2.5 mt-0.5 shrink-0 ${
                              plan.isPopular ? 'text-blue-400' : 'text-emerald-400'
                            }`} />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTAs */}
                    <div className="mt-8 pt-6 border-t border-slate-800">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => {
                          const currentPrice = currency === 'PEN' ? plan.pricePEN : plan.priceUSD;
                          trackPlanClick(plan.name, currentPrice, currency);
                        }}
                        className={`w-full py-4 px-6 rounded-sm font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-sm md:text-base flex items-center justify-center gap-2.5 transition-all shadow-md group ${
                          plan.isPopular
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] hover:shadow-[0_0_35px_rgba(37,99,235,0.6)]'
                            : 'bg-transparent border-2 border-slate-600 hover:border-white text-white hover:bg-white hover:text-[#0c121f]'
                        }`}
                      >
                        <WhatsAppIcon className="w-5 h-5 fill-current text-white group-hover:scale-110 transition-transform" />
                        <span>Elegir {plan.name}</span>
                        <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform ml-1" />
                      </a>

                      {/* Secondary Link for contact modal */}
                      {onOpenContact && (
                        <div className="text-center mt-3">
                          <button
                            type="button"
                            onClick={() => onOpenContact(plan.name)}
                            className="text-xs text-slate-400 hover:text-blue-400 transition-colors underline-offset-4 hover:underline"
                          >
                            ¿Prefieres enviar un formulario? Haz clic aquí
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </FadeIn>

        {/* Four Trust Pillars / Guarantee Strip */}
        <FadeIn delay={300}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-sm hover:border-blue-500/40 transition-colors">
              <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-sm flex items-center justify-center mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-heading text-lg font-black uppercase [font-variation-settings:'wdth'_125] text-white mb-2">
                Sin Mensualidades Ocultas
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                El sitio web y código son 100% tuyos. No pagarás cuotas mensuales forzosas de mantenimiento de plataforma.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-sm hover:border-blue-500/40 transition-colors">
              <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-sm flex items-center justify-center mb-4">
                <Cloud className="w-5 h-5" />
              </div>
              <h4 className="font-heading text-lg font-black uppercase [font-variation-settings:'wdth'_125] text-white mb-2">
                Dominio y Hosting Gratis
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tu proyecto incluye dominio .com y hosting SSD de alta velocidad con certificado SSL HTTPS por 1 año completo.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-sm hover:border-blue-500/40 transition-colors">
              <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-sm flex items-center justify-center mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-heading text-lg font-black uppercase [font-variation-settings:'wdth'_125] text-white mb-2">
                Carga Ultrarrápida y SEO
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Desarrollado con estándares web modernos para cargar en menos de 2 segundos y conseguir mejor posición en Google.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-sm hover:border-blue-500/40 transition-colors">
              <div className="w-10 h-10 bg-blue-600/20 text-blue-400 rounded-sm flex items-center justify-center mb-4">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="font-heading text-lg font-black uppercase [font-variation-settings:'wdth'_125] text-white mb-2">
                Soporte y Garantía Real
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Atención directa con nuestro equipo técnico de ingeniería. Garantía incluida ante cualquier bug o consulta.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Custom Project / Enterprise Banner */}
        <FadeIn delay={400}>
          <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-blue-950/80 border-2 border-blue-500/40 rounded-sm p-8 md:p-12 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 relative z-10">
              <div className="text-center lg:text-left max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border border-blue-500/30">
                  <Layers className="w-3.5 h-3.5" />
                  Software y Sistemas a Medida
                </div>
                <h3 className="font-heading text-2xl md:text-3xl lg:text-4xl font-black uppercase [font-variation-settings:'wdth'_125] text-white mb-4">
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
                  className="bg-blue-600 hover:bg-blue-500 text-white font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-sm md:text-base px-8 py-4 rounded-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all whitespace-nowrap"
                >
                  <WhatsAppIcon className="w-5 h-5 fill-current" />
                  <span>Cotizar a Medida</span>
                </a>
                {onOpenContact && (
                  <button
                    type="button"
                    onClick={() => onOpenContact('Software / Proyecto Web a Medida')}
                    className="bg-transparent border-2 border-slate-500 hover:border-white text-white hover:bg-white hover:text-[#0c121f] font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-sm md:text-base px-8 py-4 rounded-sm transition-colors whitespace-nowrap"
                  >
                    Abrir Formulario
                  </button>
                )}
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
};
