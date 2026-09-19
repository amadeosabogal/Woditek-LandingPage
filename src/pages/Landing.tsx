import React, { useState, useEffect } from 'react';
import { Logo } from '../components/Logo';
import { FadeIn } from '../components/FadeIn';
import {
  Phone,
  Mail,
  Briefcase,
  Headphones,
  Cloud,
  Menu,
  X,
  ChevronRight,
  ChevronDown,
  MapPin,
  Monitor,
  Globe,
  Zap,
  Bot,
  Link2,
  BarChart,
  ArrowRight,
  CheckCircle2,
  Settings,
  Layout,
  Maximize,
  Cpu,
  Utensils,
  Scissors,
  Activity,
  Store,
  Building2,
  Quote,
  Star,
  Check
} from 'lucide-react';

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
);
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
);
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 2.22-1.15 4.35-2.85 5.72-1.8 1.45-4.23 2-6.49 1.5-2.31-.5-4.29-2.02-5.18-4.21-.92-2.27-.63-4.99.78-7.01 1.34-1.94 3.65-3.07 5.99-3.13v4.11c-1.32.06-2.58.74-3.35 1.83-.8 1.1-.1 2.14.61 2.9.61.64 1.52.92 2.38.83 1.05-.09 2.05-.72 2.58-1.64.44-.76.62-1.66.52-2.55-.02-6.57-.01-13.14-.02-19.71z"/></svg>
);

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', details: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const API_BASE = import.meta.env.VITE_API_ADMIN || 'http://localhost:3001/admin';
      const response = await fetch(`${API_BASE}/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setIsSuccess(true);
      } else {
        alert('Ocurrió un error al enviar tu mensaje. Intenta de nuevo.');
      }
    } catch (error) {
      console.error(error);
      alert('Error al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Resetea el form al cerrar el modal
  const handleCloseModal = () => {
    setIsContactModalOpen(false);
    setTimeout(() => {
      setIsSuccess(false);
      setFormData({ name: '', email: '', phone: '', details: '' });
    }, 300); // Dar tiempo a la animación de cierre
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-heading text-slate-800">


      {/* Main Navigation */}
      <nav className={`fixed w-full z-40 transition-all duration-500 ease-in-out bg-transparent py-5 px-4 md:px-8 lg:px-16 ${isScrolled ? '-translate-y-full opacity-0' : 'translate-y-0 opacity-100'}`}>
        <div className="w-full grid grid-cols-3 items-center">
          {/* Left: Menu Toggle */}
          <div className="flex justify-start items-center">
            <button
              className="text-white flex items-center space-x-1 sm:space-x-2 hover:text-blue-400 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 sm:w-7 sm:h-7" />
              <span className="hidden sm:inline font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-sm tracking-widest">Menú</span>
            </button>
          </div>

          {/* Center: Logo */}
          <div className="flex justify-center items-center cursor-pointer" onClick={() => scrollTo('home')}>
            <Logo className="scale-75 sm:scale-100" isScrolled={false} />
          </div>

          {/* Right: Contact Button */}
          <div className="flex justify-end items-center">
            <button onClick={() => setIsContactModalOpen(true)} className="hidden sm:inline-flex bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0c121f] px-6 py-2 text-sm font-heading font-black uppercase [font-variation-settings:'wdth'_125] transition-colors whitespace-nowrap">
              Contáctanos
            </button>
          </div>
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      <div className={`fixed inset-0 bg-blue-600 z-50 flex flex-col text-white overflow-y-auto transition-opacity duration-500 ease-in-out ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        {/* Top Bar inside Overlay */}
        <div className="w-full grid grid-cols-3 items-center py-5 px-4 md:px-8 lg:px-16 shrink-0">
          <div className="flex justify-start">
            <button
              className="flex items-center space-x-2 hover:text-blue-200 transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
              <span className="hidden sm:inline font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-sm tracking-widest">Cerrar</span>
            </button>
          </div>
          <div className="flex justify-center cursor-pointer" onClick={() => scrollTo('home')}>
            {/* White Logo on Blue Background */}
            <Logo isScrolled={false} />
          </div>
          <div className="flex justify-end">
            {/* Empty to preserve grid centering */}
          </div>
        </div>

        {/* Menu Content */}
        <div className={`flex-grow flex flex-col justify-center items-center w-full px-4 md:px-8 lg:px-16 py-12 md:py-20 transition-all duration-700 delay-200 ease-out transform ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`}>
          {/* Navigation Links */}
          <div className="w-full md:w-auto flex flex-col items-center space-y-4 md:space-y-6">
            <button onClick={() => { setIsMobileMenuOpen(false); scrollTo('home'); }} className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase [font-variation-settings:'wdth'_125] hover:text-blue-200 transition-colors leading-none">Inicio</button>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollTo('why-choose-us'); }} className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase [font-variation-settings:'wdth'_125] hover:text-blue-200 transition-colors leading-none">Beneficios</button>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollTo('services'); }} className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase [font-variation-settings:'wdth'_125] hover:text-blue-200 transition-colors leading-none">Servicios</button>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollTo('how-we-work'); }} className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase [font-variation-settings:'wdth'_125] hover:text-blue-200 transition-colors leading-none">Proceso</button>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollTo('adaptability'); }} className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase [font-variation-settings:'wdth'_125] hover:text-blue-200 transition-colors leading-none">Adaptabilidad</button>
            <button onClick={() => { setIsMobileMenuOpen(false); scrollTo('testimonials'); }} className="text-center font-heading text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black uppercase [font-variation-settings:'wdth'_125] hover:text-blue-200 transition-colors leading-none">Testimonios</button>
            <div className="pt-6 w-full flex justify-center">
              <button onClick={() => { setIsMobileMenuOpen(false); setIsContactModalOpen(true); }} className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 sm:px-10 sm:py-4 font-heading text-xl sm:text-2xl md:text-3xl font-black uppercase [font-variation-settings:'wdth'_125] transition-colors rounded-sm shadow-sm w-full sm:w-auto">
                Contáctanos
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center pt-24 overflow-hidden bg-[#0c121f]">
        <div className="absolute inset-0 z-0">
          <img src="/ChatGPT Image 18 sept 2026, 11_30_18.png" alt="Business IT Solutions Desktop" className="hidden md:block w-full h-full object-cover object-right" />
          <img src="/Gemini_Generated_Image_a1af2ka1af2ka1af.jpg" alt="Business IT Solutions Mobile" className="block md:hidden w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c121f] via-[#0c121f]/90 to-transparent md:bg-gradient-to-r md:from-[#0c121f] md:via-[#0c121f]/90 md:to-transparent bg-gradient-to-t from-[#0c121f] via-[#0c121f]/80 to-transparent"></div>
        </div>

        <div className="w-full px-4 md:px-8 lg:px-16 relative z-10 flex flex-col items-center sm:items-start text-center sm:text-left mt-10 md:mt-0">
          <div className="max-w-2xl flex flex-col items-center sm:items-start w-full">
            <FadeIn delay={100} duration={1000}>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-6xl lg:text-[5.5rem] font-black uppercase leading-[0.9] [font-variation-settings:'wdth'_125] mb-6 sm:mb-8 text-white w-full tracking-tight">
              Transformamos tus ideas en<br />
              <span className="text-blue-400">software</span>
            </h1>
            <div className="flex flex-col sm:flex-row justify-center sm:justify-start space-y-4 sm:space-y-0 sm:space-x-4 w-full">
              <button onClick={() => scrollTo('services')} className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0c121f] px-10 py-4 font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-lg transition-colors flex items-center justify-center shadow-sm w-full sm:w-auto">
                Saber más
              </button>
              <button onClick={() => setIsContactModalOpen(true)} className="sm:hidden bg-blue-600 border-2 border-blue-600 text-white hover:bg-blue-700 px-10 py-4 font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-lg transition-colors flex items-center justify-center shadow-sm w-full">
                Contáctanos
              </button>
            </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 bg-slate-50 relative">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <FadeIn><div className="text-center mb-20">
            <p className="font-serif italic text-xl text-blue-600 mb-4">Lo que hacemos</p>
            <h2 className="font-heading text-4xl md:text-5xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-6">Nuestros Servicios</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Soluciones digitales diseñadas para las necesidades de tu negocio.</p>
          </div></FadeIn>

          <FadeIn delay={200}><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {/* Card 1: Software a medida */}
            <div className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-10"></div>
              <div className="w-full h-56 overflow-hidden relative shrink-0">
                <img loading="lazy" src="/service_software.jpg" alt="Software a medida" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <h3 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-4">Software a medida</h3>
                <p className="text-slate-600 mb-8 font-medium">Sistemas diseñados específicamente para tu negocio.</p>
                <p className="text-sm text-slate-500 mb-6">Creamos sistemas web personalizados desde cero, adaptados a los procesos y necesidades específicas de cada empresa.</p>
                <ul className="space-y-3 mt-auto">
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> ERP y módulos empresariales</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> CRM y Sistemas de ventas</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Gestión de inventarios</li>
                </ul>
              </div>
            </div>

            {/* Card 2: Desarrollo Web */}
            <div className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-10"></div>
              <div className="w-full h-56 overflow-hidden relative shrink-0">
                <img loading="lazy" src="/service_web.jpg" alt="Desarrollo Web" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <h3 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-4">Desarrollo web</h3>
                <p className="text-slate-600 mb-8 font-medium">Sitios web modernos que representan tu marca.</p>
                <p className="text-sm text-slate-500 mb-6">Diseñamos sitios rápidos y adaptados a dispositivos móviles para fortalecer la presencia digital de tu empresa.</p>
                <ul className="space-y-3 mt-auto">
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Landing pages</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Catálogos digitales</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Sitios web empresariales</li>
                </ul>
              </div>
            </div>

            {/* Card 3: Automatización */}
            <div className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-10"></div>
              <div className="w-full h-56 overflow-hidden relative shrink-0">
                <img loading="lazy" src="/service_automation.jpg" alt="Automatización" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <h3 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-4">Automatización</h3>
                <p className="text-slate-600 mb-8 font-medium">Menos tareas manuales, más eficiencia.</p>
                <p className="text-sm text-slate-500 mb-6">Convertimos tareas repetitivas en procesos digitales para reducir trabajo manual.</p>
                <ul className="space-y-3 mt-auto">
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Flujos de aprobación</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Notificaciones y alertas</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Generación de reportes</li>
                </ul>
              </div>
            </div>

            {/* Card 4: IA */}
            <div className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-10"></div>
              <div className="w-full h-56 overflow-hidden relative shrink-0">
                <img loading="lazy" src="/service_ai.jpg" alt="Inteligencia Artificial" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <h3 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-4">Inteligencia Artificial</h3>
                <p className="text-slate-600 mb-8 font-medium">IA aplicada a procesos reales de negocio.</p>
                <p className="text-sm text-slate-500 mb-6">Integramos herramientas de IA en los procesos de tu empresa para mejorar la atención, análisis y automatización.</p>
                <ul className="space-y-3 mt-auto">
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Chatbots empresariales</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Análisis de información</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Asistentes virtuales</li>
                </ul>
              </div>
            </div>

            {/* Card 5: Integraciones */}
            <div className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-10"></div>
              <div className="w-full h-56 overflow-hidden relative shrink-0">
                <img loading="lazy" src="/service_integration.jpg" alt="Integraciones" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <h3 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-4">Integraciones</h3>
                <p className="text-slate-600 mb-8 font-medium">Conectamos tus sistemas y herramientas.</p>
                <p className="text-sm text-slate-500 mb-6">Hacemos que la información fluya automáticamente entre diferentes plataformas y bases de datos.</p>
                <ul className="space-y-3 mt-auto">
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> APIs REST</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Sistemas de pago</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Integración con WhatsApp</li>
                </ul>
              </div>
            </div>

            {/* Card 6: Dashboards */}
            <div className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 z-10"></div>
              <div className="w-full h-56 overflow-hidden relative shrink-0">
                <img loading="lazy" src="/service_dashboard.jpg" alt="Dashboards" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-transparent transition-colors duration-500"></div>
              </div>
              <div className="p-8 md:p-10 flex flex-col flex-grow">
                <h3 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-4">Dashboards</h3>
                <p className="text-slate-600 mb-8 font-medium">Convierte tus datos en decisiones.</p>
                <p className="text-sm text-slate-500 mb-6">Transformamos los datos de tu negocio en información visual para facilitar el seguimiento de indicadores.</p>
                <ul className="space-y-3 mt-auto">
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> KPIs e Indicadores</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Gráficos interactivos</li>
                  <li className="flex items-start text-sm text-slate-700"><CheckCircle2 className="w-4 h-4 text-blue-600 mr-2 mt-0.5 shrink-0"/> Paneles administrativos</li>
                </ul>
              </div>
            </div>
          </div>
          </FadeIn>

          {/* CTA Section */}
          <div className="bg-[#0c121f] text-white p-12 md:p-16 text-center max-w-4xl mx-auto border-t-4 border-blue-600 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>
            <h3 className="font-heading text-3xl md:text-4xl font-black uppercase [font-variation-settings:'wdth'_125] mb-6 relative z-10">¿Tienes un proceso que quieres digitalizar?</h3>
            <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto relative z-10">Cuéntanos qué necesitas y diseñamos una solución para tu negocio.</p>
            <button onClick={() => setIsContactModalOpen(true)} className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#0c121f] px-10 py-4 font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-lg transition-colors inline-flex items-center justify-center shadow-sm relative z-10">
              Hablemos de tu proyecto <ArrowRight className="ml-3 w-5 h-5" />
            </button>
          </div>
        </div>
      </section>


      {/* 3. ¿Por qué elegir Woditek? */}
      <section id="why-choose-us" className="py-24 bg-white">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-serif italic text-xl text-blue-600 mb-4">Beneficios</p>
            <h2 className="font-heading text-4xl md:text-5xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900">¿Por qué elegir Woditek?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="flex flex-col items-start p-8 bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Settings className="w-7 h-7" />
              </div>
              <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-3">Soluciones a medida</h4>
              <p className="text-slate-600 leading-relaxed">No adaptamos tu negocio a un software genérico. Creamos sistemas que se ajustan perfectamente a tu forma de trabajar.</p>
            </div>
            
            <div className="flex flex-col items-start p-8 bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Layout className="w-7 h-7" />
              </div>
              <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-3">Diseño intuitivo</h4>
              <p className="text-slate-600 leading-relaxed">Sistemas fáciles de utilizar para tu equipo. Minimizamos la curva de aprendizaje con interfaces claras y modernas.</p>
            </div>

            <div className="flex flex-col items-start p-8 bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Maximize className="w-7 h-7" />
              </div>
              <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-3">Escalable</h4>
              <p className="text-slate-600 leading-relaxed">Tu sistema puede crecer junto con tu empresa. Diseñamos bases sólidas listas para integrar nuevas funcionalidades en el futuro.</p>
            </div>

            <div className="flex flex-col items-start p-8 bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow group">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <Cpu className="w-7 h-7" />
              </div>
              <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-3">Tecnología moderna</h4>
              <p className="text-slate-600 leading-relaxed">Utilizamos herramientas actuales para desarrollar soluciones eficientes, seguras y de alto rendimiento.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Nuestro proceso */}
      <section id="how-we-work" className="py-24 bg-[#0c121f] text-white relative overflow-hidden">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-7xl mx-auto relative z-10">
          <FadeIn><div className="text-center mb-20">
            <p className="font-serif italic text-xl text-blue-400 mb-4">Cómo trabajamos</p>
            <h2 className="font-heading text-4xl md:text-5xl font-black uppercase [font-variation-settings:'wdth'_125]">Nuestro proceso</h2>
          </div></FadeIn>

          <FadeIn delay={200}><div className="relative">
            {/* Line connector for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-slate-800 -translate-y-1/2 z-0"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-3xl font-black mb-6 shadow-[0_0_30px_rgba(37,99,235,0.3)]">01</div>
                <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] mb-3">Analizamos</h4>
                <p className="text-slate-400">Entendemos tu negocio, necesidades y procesos actuales.</p>
              </div>
              
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center text-3xl font-black mb-6">02</div>
                <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] mb-3">Diseñamos</h4>
                <p className="text-slate-400">Definimos la solución y diseñamos la experiencia del sistema.</p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center text-3xl font-black mb-6">03</div>
                <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] mb-3">Desarrollamos</h4>
                <p className="text-slate-400">Construimos y probamos el software con altos estándares.</p>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-slate-800 border-2 border-slate-700 rounded-full flex items-center justify-center text-3xl font-black mb-6">04</div>
                <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] mb-3">Implementamos</h4>
                <p className="text-slate-400">Ponemos el sistema en funcionamiento y brindamos soporte.</p>
              </div>
            </div>
          </div>
          </FadeIn>
        </div>
      </section>

      {/* 5. Soluciones para diferentes negocios */}
      <section id="adaptability" className="py-24 bg-slate-50 relative">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <p className="font-serif italic text-xl text-blue-600 mb-4">Adaptabilidad</p>
            <h2 className="font-heading text-4xl md:text-5xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-6">Soluciones para diferentes negocios</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">"Podrían desarrollar algo así para mi negocio." - Sí, podemos.</p>
          </div>

          <FadeIn delay={200}><div className="flex flex-wrap justify-center gap-6">
              <div className="bg-white p-8 border-l-4 border-blue-600 shadow-sm hover:shadow-xl transition-all w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                <div className="flex items-center mb-4">
                  <Utensils className="w-6 h-6 text-blue-600 mr-3" />
                  <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900">Restaurantes</h4>
                </div>
                <p className="text-slate-600 font-medium">Pedidos, mesas, cocina, inventario y caja.</p>
              </div>
  
              <div className="bg-white p-8 border-l-4 border-blue-600 shadow-sm hover:shadow-xl transition-all w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                <div className="flex items-center mb-4">
                  <Scissors className="w-6 h-6 text-blue-600 mr-3" />
                  <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900">Barberías</h4>
                </div>
                <p className="text-slate-600 font-medium">Clientes, citas, servicios, trabajadores y caja.</p>
              </div>
  
              <div className="bg-white p-8 border-l-4 border-blue-600 shadow-sm hover:shadow-xl transition-all w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                <div className="flex items-center mb-4">
                  <Activity className="w-6 h-6 text-blue-600 mr-3" />
                  <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900">Clínicas</h4>
                </div>
                <p className="text-slate-600 font-medium">Pacientes, citas, historiales y gestión administrativa.</p>
              </div>
  
              <div className="bg-white p-8 border-l-4 border-blue-600 shadow-sm hover:shadow-xl transition-all w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                <div className="flex items-center mb-4">
                  <Store className="w-6 h-6 text-blue-600 mr-3" />
                  <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900">Comercios</h4>
                </div>
                <p className="text-slate-600 font-medium">Ventas, inventario, clientes y reportes.</p>
              </div>
  
              <div className="bg-white p-8 border-l-4 border-blue-600 shadow-sm hover:shadow-xl transition-all w-full md:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]">
                <div className="flex items-center mb-4">
                  <Building2 className="w-6 h-6 text-blue-600 mr-3" />
                  <h4 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900">Empresas</h4>
                </div>
                <p className="text-slate-600 font-medium">Procesos internos, usuarios, reportes y dashboards.</p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* 6. Testimonios */}
      <section id="testimonials" className="py-24 bg-blue-600 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-800 rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <Quote className="w-12 h-12 mx-auto mb-6 text-blue-300 opacity-50" />
            <h2 className="font-heading text-4xl md:text-5xl font-black uppercase [font-variation-settings:'wdth'_125] mb-6">Lo que dicen nuestros clientes</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-[#0c121f]/40 p-8 rounded-sm backdrop-blur-sm border border-blue-500/30 flex flex-col justify-between hover:border-blue-400/50 transition-colors">
              <div>
                <div className="flex space-x-1 mb-4 text-amber-400">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <p className="font-serif italic text-lg leading-relaxed mb-6 text-blue-50">
                  "Woditek nos ayudó a digitalizar nuestros procesos y mejorar la gestión del negocio. Ahora todo nuestro equipo trabaja de forma mucho más eficiente."
                </p>
              </div>
              <div className="flex items-center">
                <img loading="lazy" src="https://i.pravatar.cc/150?img=32" alt="María Fernández" className="w-12 h-12 rounded-full mr-4 border-2 border-blue-400 object-cover" />
                <div>
                  <h4 className="font-heading font-bold uppercase tracking-wider text-sm">María Fernández</h4>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-[#0c121f]/40 p-8 rounded-sm backdrop-blur-sm border border-blue-500/30 flex flex-col justify-between hover:border-blue-400/50 transition-colors">
              <div>
                <div className="flex space-x-1 mb-4 text-amber-400">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <p className="font-serif italic text-lg leading-relaxed mb-6 text-blue-50">
                  "El sistema a medida que desarrollaron se adaptó perfectamente a nuestra barbería. Las reservas y la caja cuadran a la perfección cada día."
                </p>
              </div>
              <div className="flex items-center">
                <img loading="lazy" src="https://i.pravatar.cc/150?img=11" alt="Carlos Gómez" className="w-12 h-12 rounded-full mr-4 border-2 border-blue-400 object-cover" />
                <div>
                  <h4 className="font-heading font-bold uppercase tracking-wider text-sm">Carlos Gómez</h4>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-[#0c121f]/40 p-8 rounded-sm backdrop-blur-sm border border-blue-500/30 flex flex-col justify-between hover:border-blue-400/50 transition-colors">
              <div>
                <div className="flex space-x-1 mb-4 text-amber-400">
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current" />
                  <Star className="w-5 h-5 fill-current text-blue-300/30" />
                </div>
                <p className="font-serif italic text-lg leading-relaxed mb-6 text-blue-50">
                  "Increíble el nivel de detalle y el soporte post-implementación. Transformaron completamente la forma en que manejamos nuestro inventario y ventas online."
                </p>
              </div>
              <div className="flex items-center">
                <img loading="lazy" src="https://i.pravatar.cc/150?img=5" alt="Ana López" className="w-12 h-12 rounded-full mr-4 border-2 border-blue-400 object-cover" />
                <div>
                  <h4 className="font-heading font-bold uppercase tracking-wider text-sm">Ana López</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 9. Preguntas frecuentes */}
      <section className="py-24 bg-white relative">
        <div className="w-full px-4 md:px-8 lg:px-16 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-heading text-4xl md:text-5xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-6">Preguntas frecuentes</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "¿Cuánto cuesta desarrollar un software a medida?", a: "Depende de las funcionalidades, cantidad de usuarios, integraciones y complejidad del proyecto." },
              { q: "¿Pueden adaptar el sistema a nuestros procesos?", a: "Sí. El software se desarrolla de acuerdo con las necesidades específicas de cada negocio." },
              { q: "¿El sistema funciona desde celular?", a: "Sí, dependiendo del proyecto podemos desarrollar interfaces adaptadas para computadoras, tablets y dispositivos móviles." },
              { q: "¿Pueden integrar otros servicios?", a: "Sí. Podemos conectar el sistema con APIs y servicios externos según las necesidades del proyecto." }
            ].map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-sm overflow-hidden bg-slate-50">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-100 transition-colors focus:outline-none"
                >
                  <span className="font-heading text-xl font-bold uppercase [font-variation-settings:'wdth'_100] text-slate-900">{faq.q}</span>
                  <ChevronDown className={`w-6 h-6 text-blue-600 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`} />
                </button>
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${openFaq === idx ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="p-6 pt-0 text-slate-600 font-medium">
                    {faq.a}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-50 pt-20 pb-10 border-t border-slate-200">
        <div className="w-full px-4 md:px-8 lg:px-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16 items-center">
            {/* Left: Info & Socials */}
            <div className="text-left">
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Somos una agencia dedicada al diseño y desarrollo de soluciones tecnológicas innovadoras, creadas para llevar tu negocio al siguiente nivel digital.
              </p>
              <div className="flex space-x-4">
                <a href="https://www.instagram.com/woditek.pe/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-blue-600 hover:text-white transition-colors rounded-full"><InstagramIcon className="w-5 h-5" /></a>
                <a href="https://www.tiktok.com/@woditek" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-black hover:text-white transition-colors rounded-full"><TikTokIcon className="w-5 h-5" /></a>
                <a href="https://wa.me/51953095173" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-slate-200 flex items-center justify-center text-slate-600 hover:bg-green-500 hover:text-white transition-colors rounded-full"><WhatsAppIcon className="w-5 h-5" /></a>
              </div>
            </div>

            {/* Center: Big Logo */}
            <div className="flex justify-center">
              <Logo isScrolled={true} imgClassName="h-20 md:h-28 lg:h-32 w-auto" />
            </div>

            {/* Right: Contact */}
            <div className="md:text-right flex flex-col md:items-end">
              <h4 className="font-bold text-slate-900 mb-6 text-left md:text-right w-full">Contáctanos</h4>
              <ul className="space-y-4 text-sm text-slate-600">
                <li className="flex items-start md:justify-end">
                  <Mail className="w-5 h-5 text-blue-600 mr-3 mt-0.5 md:hidden shrink-0" />
                  <span>soporte@woditek.com</span>
                  <Mail className="w-5 h-5 text-blue-600 ml-3 mt-0.5 hidden md:block shrink-0" />
                </li>
                <li className="flex items-start md:justify-end">
                  <Phone className="w-5 h-5 text-blue-600 mr-3 mt-0.5 md:hidden shrink-0" />
                  <a href="https://wa.me/51953095173" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">+51 953 095 173</a>
                  <Phone className="w-5 h-5 text-blue-600 ml-3 mt-0.5 hidden md:block shrink-0" />
                </li>
                <li className="flex items-start md:justify-end text-left md:text-right">
                  <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0 md:hidden" />
                  <span>CAL.GERMAN SCHEREIBER NRO. 276<br />URB. SANTA ANA<br />LIMA - LIMA - SAN ISIDRO</span>
                  <MapPin className="w-5 h-5 text-blue-600 ml-3 mt-0.5 shrink-0 hidden md:block" />
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Woditek. Todos los derechos reservados.
          </div>
        </div>
      </footer>
      {/* Contact Modal */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={handleCloseModal}
          ></div>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg relative z-10 overflow-y-auto max-h-[90vh] animate-in fade-in zoom-in duration-300">
            <div className="p-6 md:p-8">
              {isSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                    <Check size={40} className="font-bold" />
                  </div>
                  <h3 className="font-heading text-3xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900 mb-4">
                    ¡Mensaje Enviado!
                  </h3>
                  <p className="text-slate-600 mb-8 text-lg px-4">
                    Gracias por contactarnos. Nos comunicaremos contigo muy pronto para hacer realidad tu proyecto.
                  </p>
                  <button 
                    onClick={handleCloseModal}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-lg py-4 rounded-lg shadow-md hover:shadow-lg transition-all"
                  >
                    Entendido
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-heading text-2xl font-black uppercase [font-variation-settings:'wdth'_125] text-slate-900">
                      Cuéntanos tu proyecto
                    </h3>
                    <button 
                      onClick={handleCloseModal}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <form className="space-y-4" onSubmit={handleLeadSubmit}>
                    <div>
                      <label htmlFor="name" className="block text-sm font-semibold text-slate-700 mb-1">Nombre completo</label>
                      <input type="text" id="name" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none" placeholder="Tu nombre" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} disabled={isSubmitting} />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1">Correo electrónico</label>
                      <input type="email" id="email" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none" placeholder="tucorreo@ejemplo.com" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} disabled={isSubmitting} />
                    </div>
                    <div>
                      <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-1">Celular / WhatsApp</label>
                      <input type="tel" id="phone" className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none" placeholder="+51 999 999 999" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} disabled={isSubmitting} />
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-slate-700 mb-1">Detalles del proyecto</label>
                      <textarea id="message" rows={4} required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/20 transition-all outline-none resize-none" placeholder="¿Qué solución digital tienes en mente?" value={formData.details} onChange={(e) => setFormData({...formData, details: e.target.value})} disabled={isSubmitting}></textarea>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-heading font-black uppercase [font-variation-settings:'wdth'_125] text-lg py-4 rounded-lg shadow-md hover:shadow-lg transition-all mt-4 disabled:bg-slate-400 flex justify-center items-center gap-2">
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                          Enviando...
                        </>
                      ) : 'Enviar Mensaje'}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Floating Button */}
      <a 
        href="https://wa.me/51953095173?text=Hola%20Woditek,%20quiero%20m%C3%A1s%20informaci%C3%B3n%20sobre%20sus%20servicios" 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white shadow-[0_4px_14px_0_rgba(37,211,102,0.39)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.23)] hover:scale-110 hover:-translate-y-1 transition-all duration-300 flex items-center justify-center group"
        style={{ width: '60px', height: '60px', borderRadius: '50%' }}
        aria-label="Contactar por WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="w-8 h-8 md:w-10 md:h-10 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.888-.788-1.489-1.761-1.663-2.06-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
        </svg>
      </a>
    </div>
  );
}
