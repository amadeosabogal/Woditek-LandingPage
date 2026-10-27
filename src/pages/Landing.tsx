import React, { useState, useEffect } from 'react';
import { WebPlans } from '../components/WebPlans';
import { initAnalytics, trackLeadSubmission } from '../utils/analytics';
import { ScrollProgress } from '../components/ui/ScrollProgress';
import { Navbar } from '../components/landing/Navbar';
import { Hero } from '../components/landing/Hero';
import { StatsBand } from '../components/landing/StatsBand';
import { Services } from '../components/landing/Services';
import { Sectors } from '../components/landing/Sectors';
import { WhyUs } from '../components/landing/WhyUs';
import { Process } from '../components/landing/Process';
import { Testimonials } from '../components/landing/Testimonials';
import { Faq } from '../components/landing/Faq';
import { FinalCta } from '../components/landing/FinalCta';
import { Footer } from '../components/landing/Footer';
import { ContactModal } from '../components/landing/ContactModal';
import type { LeadFormData } from '../components/landing/ContactModal';
import { FloatingWhatsApp } from '../components/landing/FloatingWhatsApp';

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState<LeadFormData>({ name: '', email: '', phone: '', details: '' });
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
        trackLeadSubmission({ name: formData.name, email: formData.email });
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

  // Abre el modal prellenando el plan seleccionado
  const handleOpenContactWithPlan = (planName?: string) => {
    if (planName) {
      setFormData(prev => ({
        ...prev,
        details: `Hola Woditek, deseo recibir información y cotizar el ${planName} para mi negocio.`
      }));
    }
    setIsContactModalOpen(true);
  };

  useEffect(() => {
    initAnalytics();
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
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

  const openContact = () => setIsContactModalOpen(true);

  return (
    <div className="min-h-screen bg-ink-950 font-heading text-slate-300">
      <ScrollProgress />

      <Navbar
        isScrolled={isScrolled}
        isMenuOpen={isMobileMenuOpen}
        onOpenMenu={() => setIsMobileMenuOpen(true)}
        onCloseMenu={() => setIsMobileMenuOpen(false)}
        onContact={openContact}
        scrollTo={scrollTo}
      />

      <main>
        <Hero onContact={openContact} scrollTo={scrollTo} />
        <StatsBand />
        <Services scrollTo={scrollTo} />
        <Sectors onContact={openContact} />
        <WebPlans onOpenContact={handleOpenContactWithPlan} />
        <WhyUs />
        <Process />
        <Testimonials />
        <Faq />
        <FinalCta onContact={openContact} />
      </main>

      <Footer scrollTo={scrollTo} />

      <ContactModal
        isOpen={isContactModalOpen}
        isSubmitting={isSubmitting}
        isSuccess={isSuccess}
        formData={formData}
        onChange={setFormData}
        onSubmit={handleLeadSubmit}
        onClose={handleCloseModal}
      />

      <FloatingWhatsApp />
    </div>
  );
}
