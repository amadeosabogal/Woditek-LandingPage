import React, { useState, useEffect } from 'react';
import { Logo } from './components/Logo';
import { TypewriterTitle } from './components/TypewriterTitle';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

import heroBg from './assets/hero.png';
import imgDesarrolloMedida from './assets/desarrollo_medida.png';
import imgAppsMovilesWeb from './assets/apps_moviles_web.png';
import imgSistemasGestion from './assets/sistemas_gestion.png';
import imgMantenimientoSoporte from './assets/mantenimiento_soporte.png';
import imgConsultoriaTecnologica from './assets/consultoria_tecnologica.png';
import imgProgramacion from './assets/programacion.png';
import imgFlujo from './assets/flujo.png';
import {
  CheckCircle,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Key,
  Cpu,
  ShieldCheck,
  Activity,
  Phone,
  MapPin,
  Clock
} from 'lucide-react';

interface ContactForm {
  name: string;
  email: string;
  company: string;
  phone: string;
  country: string;
  message: string;
  privacyAccepted: boolean;
}

interface FormErrors {
  name?: string;
  email?: string;
  company?: string;
  phone?: string;
  country?: string;
  message?: string;
  privacyAccepted?: string;
}

export default function App() {
  // Estado para el menú móvil
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Ref y estados para el carrusel de servicios 3D cóncavo
  const servicesCarouselRef = React.useRef<HTMLDivElement>(null);
  const [rotationIndex, setRotationIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [spacing, setSpacing] = useState(440);
  const [zStep, setZStep] = useState(10);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffsetIndex, setDragOffsetIndex] = useState(0);

  const dragStartRef = React.useRef<number | null>(null);
  const isDraggingRef = React.useRef(false);

  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      if (width >= 1024) {
        setSpacing(440); // Espaciado ampliado para eliminar el solape de esquinas completamente
        setZStep(10);    // Proyección Z reducida al mínimo
      } else if (width >= 768) {
        setSpacing(390);
        setZStep(8);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handlePrevClick = () => {
    if (isMobile) {
      if (servicesCarouselRef.current) {
        servicesCarouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
      }
    } else {
      setRotationIndex(prev => prev - 1);
    }
  };

  const handleNextClick = () => {
    if (isMobile) {
      if (servicesCarouselRef.current) {
        servicesCarouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      }
    } else {
      setRotationIndex(prev => prev + 1);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isMobile) return;
    dragStartRef.current = e.clientX;
    isDraggingRef.current = true;
    setIsDragging(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (err) {
      // Ignorar errores de captura
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || dragStartRef.current === null) return;
    const clientX = e.clientX;
    const deltaX = clientX - dragStartRef.current;
    
    // Mapeo 1:1 de distancia de arrastre a índice del carrusel
    const indexShift = deltaX / spacing;
    setDragOffsetIndex(indexShift);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || dragStartRef.current === null) return;
    isDraggingRef.current = false;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (err) {
      // Ignorar errores de liberación
    }

    const clientX = e.clientX;
    const deltaX = clientX - dragStartRef.current;
    dragStartRef.current = null;

    const indexShift = deltaX / spacing;
    const threshold = 0.25; // Umbral de 25% de arrastre
    
    if (indexShift > threshold) {
      setRotationIndex(prev => prev - 1);
    } else if (indexShift < -threshold) {
      setRotationIndex(prev => prev + 1);
    }
    
    setDragOffsetIndex(0);
  };

  const handleCardClick = (idx: number) => {
    const activeIndex = ((rotationIndex % 5) + 5) % 5;
    if (idx === activeIndex) return;
    
    let diff = idx - activeIndex;
    if (diff > 2) diff -= 5;
    if (diff < -2) diff += 5;
    setRotationIndex(prev => prev + diff);
  };

  const services = [
    {
      title: "Desarrollo a Medida",
      description: "Creación de soluciones tecnológicas desde cero, diseñadas específicamente para los procesos únicos de cada cliente (a diferencia del software genérico).",
      image: imgDesarrolloMedida,
    },
    {
      title: "Aplicaciones Móviles y Web",
      description: "Construcción de plataformas accesibles desde cualquier dispositivo, incluyendo iOS, Android y navegadores de internet.",
      image: imgAppsMovilesWeb,
    },
    {
      title: "Sistemas de Gestión (ERP/CRM)",
      description: "Desarrollo de plataformas internas para que las empresas automaticen y controlen sus ventas, inventarios, recursos humanos o finanzas.",
      image: imgSistemasGestion,
    },
    {
      title: "Mantenimiento y Soporte",
      description: "Actualización constante, corrección de errores y mejoras de seguridad para garantizar que los programas funcionen sin interrupciones.",
      image: imgMantenimientoSoporte,
    },
    {
      title: "Consultoría Tecnológica",
      description: "Asesoramiento experto para guiar la transformación digital de un negocio y elegir las mejores herramientas tecnológicas.",
      image: imgConsultoriaTecnologica,
    },
  ];


  // Estado del formulario de contacto
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    company: '',
    phone: '',
    country: 'Perú',
    message: '',
    privacyAccepted: false
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  // Estados para el efecto de escritura (typewriter) en el Hero
  const [typedTitle, setTypedTitle] = useState('');
  const [typedSubtitle, setTypedSubtitle] = useState('');
  const [isTitleFinished, setIsTitleFinished] = useState(false);
  const [isSubtitleFinished, setIsSubtitleFinished] = useState(false);

  useEffect(() => {
    const titleText = "TRANSFORMAMOS TU IDEA EN SOFTWARE INTELIGENTE";
    const subtitleText = "Productividad, Control y Crecimiento";

    let titleIndex = 0;
    let subtitleIndex = 0;

    // Iniciamos con un pequeño delay para una entrada suave
    const startTimeout = setTimeout(() => {
      const titleInterval = setInterval(() => {
        if (titleIndex < titleText.length) {
          setTypedTitle(titleText.substring(0, titleIndex + 1));
          titleIndex++;
        } else {
          clearInterval(titleInterval);
          setIsTitleFinished(true);

          const subtitleInterval = setInterval(() => {
            if (subtitleIndex < subtitleText.length) {
              setTypedSubtitle(subtitleText.substring(0, subtitleIndex + 1));
              subtitleIndex++;
            } else {
              clearInterval(subtitleInterval);
              setIsSubtitleFinished(true);
            }
          }, 30); // velocidad del subtítulo
        }
      }, 40); // velocidad del título
    }, 500);

    return () => {
      clearTimeout(startTimeout);
    };
  }, []);

  // Refs for aligning the height of the two manifesto sections
  const manifesto1Ref = React.useRef<HTMLDivElement>(null);
  const manifesto2Ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const adjustHeights = () => {
      const el1 = manifesto1Ref.current;
      const el2 = manifesto2Ref.current;
      if (!el1 || !el2) return;

      // Reset heights to auto to get the natural content height
      el1.style.height = 'auto';
      el2.style.height = 'auto';

      if (window.innerWidth >= 1024) {
        // We only align on desktop/large screens (lg breakpoint matches 1024px in Tailwind)
        const height1 = el1.getBoundingClientRect().height;
        const height2 = el2.getBoundingClientRect().height;
        const maxHeight = Math.max(height1, height2);

        el1.style.height = `${maxHeight}px`;
        el2.style.height = `${maxHeight}px`;
      }
    };

    // Run layout height adjustment
    adjustHeights();

    window.addEventListener('resize', adjustHeights);
    
    // Check after content renders and fonts load to avoid race conditions
    const timer = setTimeout(adjustHeights, 300);

    return () => {
      window.removeEventListener('resize', adjustHeights);
      clearTimeout(timer);
    };
  }, []);

  // Animaciones premium con GSAP y ScrollTrigger
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animación suave de la cuadrícula de perspectiva 3D del Hero
      gsap.fromTo(".wireframe-grid",
        { opacity: 0, transform: "rotateX(60deg) translateZ(-100px)" },
        { opacity: 0.45, transform: "rotateX(60deg) translateZ(0px)", duration: 2.2, ease: "power2.out", delay: 0.4 }
      );

      // Desvanecimiento y zoom suave para la sección de Manifiesto 1 (Texto e Imagen)
      gsap.fromTo(".manifesto-img",
        { scale: 1.12, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".manifesto-1-section",
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );

      gsap.fromTo(".manifesto-text",
        { x: 40, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".manifesto-1-section",
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Revelación escalonada de las tarjetas en Nuestra Propuesta
      gsap.fromTo(".propuesta-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#propuesta",
            start: "top 78%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Desvanecimiento y escala para la imagen de Nosotros (Manifiesto 2)
      gsap.fromTo(".nosotros-img",
        { scale: 1.12, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#nosotros",
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Deslizamiento desde la izquierda para Nosotros (Manifiesto 2)
      gsap.fromTo(".nosotros-text",
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#nosotros",
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Desvanecimiento y elevación en la sección de Servicios
      gsap.fromTo(".servicios-header",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#servicios",
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );

      gsap.fromTo(".servicios-carousel-container",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#servicios",
            start: "top 72%",
            toggleActions: "play none none reverse"
          }
        }
      );

      // Animación en cascada de los campos del formulario de Contacto
      gsap.fromTo(".contacto-header",
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#contacto",
            start: "top 85%",
            toggleActions: "play none none reverse"
          }
        }
      );

      gsap.fromTo(".contacto-form-group",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: "#contacto",
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        }
      );
    });

    return () => ctx.revert();
  }, []);


  // Efecto para scroll activo (cambiar estilo de la cabecera en scroll)
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Manejo del formulario de contacto
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
      if (formErrors[name as keyof FormErrors]) {
        setFormErrors(prev => ({ ...prev, [name]: undefined }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      if (formErrors[name as keyof FormErrors]) {
        setFormErrors(prev => ({ ...prev, [name]: undefined }));
      }
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    if (!formData.name.trim()) errors.name = 'El nombre es obligatorio.';
    if (!formData.email.trim()) {
      errors.email = 'El correo es obligatorio.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'El correo electrónico no es válido.';
    }
    if (!formData.privacyAccepted) {
      errors.privacyAccepted = 'Debes aceptar las políticas de privacidad y uso de datos.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleClearForm = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      country: 'Perú',
      message: '',
      privacyAccepted: false
    });
    setFormErrors({});
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitSuccess(true);
      setFormData({
        name: '',
        email: '',
        company: '',
        phone: '',
        country: 'Perú',
        message: '',
        privacyAccepted: false
      });
      setTimeout(() => setIsSubmitSuccess(false), 5000);
    }, 1500);
  };





  return (
    <div className="min-h-screen relative text-slate-100 selection:bg-woditek-electric selection:text-white overflow-x-hidden bg-[#02040a]">

      {/* Luces y Nebulosas de fondo */}
      <div className="absolute top-[8%] left-[-15%] ambient-glow animate-pulse-slow"></div>
      <div className="absolute top-[35%] right-[-10%] ambient-glow opacity-80" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[18%] left-[5%] ambient-glow opacity-70 animate-pulse-slow"></div>

      {/* Capas de Estrellas Parpadeantes */}
      <div className="stars-container"></div>
      <div className="stars-container-slow"></div>

      {/* Cabecera / Navegación */}
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-100 ${isScrolled
        ? 'bg-white border-b border-slate-200 py-4 shadow-md text-slate-800'
        : 'bg-transparent border-b border-transparent py-4 text-white'
        }`}>
        <div className="w-full px-10 md:px-20 lg:px-24 flex items-center justify-between">
          {/* Logo a la izquierda */}
          <a href="#hero" className="focus:outline-none">
            <Logo isScrolled={isScrolled} />
          </a>

          {/* Menú de Escritorio */}
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex items-center gap-8 text-base font-medium tracking-wide">
              <a href="#hero" className={`transition-colors duration-50 font-light ${isScrolled ? 'hover:text-woditek-electric' : 'hover:text-woditek-blueBrilliant'}`}>Home</a>
              <a href="#nosotros" className={`transition-colors duration-50 font-light ${isScrolled ? 'hover:text-woditek-electric' : 'hover:text-woditek-blueBrilliant'}`}>Nosotros</a>
              <a href="#propuesta" className={`transition-colors duration-50 font-light ${isScrolled ? 'hover:text-woditek-electric' : 'hover:text-woditek-blueBrilliant'}`}>Propuesta</a>
              <a href="#servicios" className={`transition-colors duration-50 font-light ${isScrolled ? 'hover:text-woditek-electric' : 'hover:text-woditek-blueBrilliant'}`}>Servicios</a>
              <a href="#contacto" className={`transition-colors duration-50 font-light ${isScrolled ? 'hover:text-woditek-electric' : 'hover:text-woditek-blueBrilliant'}`}>Contacto</a>
            </nav>
          </div>

          {/* Botón Menú Móvil */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-1 transition-colors duration-200 ${isScrolled ? 'text-slate-800 hover:text-woditek-electric' : 'text-white hover:text-woditek-blueBrilliant'}`}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Menú Desplegable Móvil */}
        <div className={`md:hidden fixed inset-x-0 top-[73px] transition-all duration-300 overflow-hidden ${isScrolled
          ? 'bg-white/95 border-b border-slate-200 text-slate-800'
          : 'bg-woditek-dark/95 border-b border-woditek-electric/20 text-slate-100'
          } ${isMobileMenuOpen ? 'max-h-[340px] opacity-100' : 'max-h-0 opacity-0'
          }`}>
          <div className="px-6 py-6 flex flex-col gap-5 text-base tracking-wide font-medium">
            <a href="#hero" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors duration-200 ${isScrolled ? 'hover:text-woditek-electric' : 'hover:text-woditek-blueBrilliant'}`}>Home</a>
            <a href="#nosotros" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors duration-200 ${isScrolled ? 'hover:text-woditek-electric' : 'hover:text-woditek-blueBrilliant'}`}>Nosotros</a>
            <a href="#propuesta" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors duration-200 ${isScrolled ? 'hover:text-woditek-electric' : 'hover:text-woditek-blueBrilliant'}`}>Propuesta</a>
            <a href="#servicios" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors duration-200 ${isScrolled ? 'hover:text-woditek-electric' : 'hover:text-woditek-blueBrilliant'}`}>Servicios</a>
            <a href="#contacto" onClick={() => setIsMobileMenuOpen(false)} className={`transition-colors duration-200 ${isScrolled ? 'hover:text-woditek-electric' : 'hover:text-woditek-blueBrilliant'}`}>Contacto</a>
            <a
              href="#contacto"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-center py-2.5 bg-[#3162fa] hover:bg-blue-700 rounded-lg text-sm font-semibold tracking-wider text-white transition-colors duration-200"
            >
              INICIAR PROYECTO
            </a>
          </div>
        </div>
      </header>

      <section
        id="hero"
        className="relative min-h-screen flex flex-col justify-center pt-28 overflow-hidden"
        style={{
          backgroundImage: `url(${heroBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Gradiente izquierdo para asegurar la legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#02040a]/95 via-[#02040a]/65 to-transparent z-0 pointer-events-none"></div>

        {/* Luz difusa central */}
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] bg-[#0047FF]/10 blur-[100px] pointer-events-none z-0"></div>

        <div className="w-full px-10 md:px-20 lg:px-24 relative z-10 flex flex-col items-start mt-6">
          <div className="max-w-5xl w-full text-left flex flex-col items-start justify-center">
            {/* Título con efecto Typewriter */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-sans font-bold text-white mb-6 leading-tight max-w-4xl text-left uppercase">
              <span>{typedTitle}</span>
              {!isTitleFinished && (
                <span className="inline-block w-[3px] md:w-[5px] h-[0.85em] ml-1.5 bg-[#00d1ff] align-middle animate-pulse shadow-[0_0_8px_rgba(0,209,255,0.8)]"></span>
              )}
              <span className="opacity-0">{"TRANSFORMA TU IDEA EN SOFTWARE INTELIGENTE".substring(typedTitle.length)}</span>
            </h1>

            {/* Subtítulo con efecto Typewriter */}
            <p className="text-xl md:text-2xl text-white max-w-2xl mb-10 leading-relaxed font-light text-left">
              <span>{typedSubtitle}</span>
              {isTitleFinished && !isSubtitleFinished && (
                <span className="inline-block w-[2px] md:w-[3px] h-[0.85em] ml-1 bg-[#3162fa] align-middle animate-pulse shadow-[0_0_6px_rgba(49,98,250,0.8)]"></span>
              )}
              <span className="opacity-0">{"Productividad, Control y Crecimiento".substring(typedSubtitle.length)}</span>
            </p>

            {/* Botón de Acción con Fade In suave */}
            <div className={`transition-all duration-1000 ease-out transform ${isSubtitleFinished ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
              }`}>
              <a
                href="#contacto"
                className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[#3162fa] rounded-lg text-sm font-medium tracking-wide text-white hover:bg-[#1a4cd6] transition-colors duration-300"
              >
                <span>CONTACTANOS</span>
              </a>
            </div>
          </div>
        </div>

        {/* 3D Perspective Grid */}
        <div className="perspective-container">
          <div className="wireframe-grid"></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[120px] bg-gradient-to-t from-woditek-electric/10 to-transparent blur-xl pointer-events-none"></div>
        </div>
      </section>

      {/* Sección de Propuesta de Valor / Manifiesto */}
      <section className="relative z-10 bg-white overflow-hidden manifesto-1-section">
        <div ref={manifesto1Ref} className="grid grid-cols-1 lg:grid-cols-12 items-stretch w-full">
          {/* Imagen a la izquierda (pegada a los bordes izquierdo, superior e inferior) */}
          <div className="lg:col-span-5 relative w-full h-[240px] lg:h-auto overflow-hidden lg:order-1 order-2">
            <img
              src={imgProgramacion}
              alt="Programación Woditek"
              className="absolute inset-0 w-full h-full object-cover manifesto-img"
            />
            {/* Degradado solo al lado derecho (blanco) hacia la izquierda (transparente) para integrarse con la sección */}
            <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white via-white/30 to-transparent pointer-events-none z-10"></div>
          </div>

          {/* Texto a la derecha (alineado en tamaños y padding con la sección Nosotros) */}
          <div className="lg:col-span-7 w-full text-left py-20 px-10 md:px-20 lg:pl-16 lg:pr-24 lg:order-2 order-1 flex flex-col justify-center manifesto-text">
            <TypewriterTitle 
              text="No vendemos horas de código, entregamos soluciones de negocio" 
              className="text-3xl md:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-slate-950 mb-6 leading-[1.1] uppercase"
              cursorColor="#3162fa"
            />
            <p className="text-xl md:text-2xl text-slate-800 max-w-2xl mb-10 leading-relaxed font-light text-left">
              Reducimos la incertidumbre, eliminamos la fricción y aceleramos el retorno de inversión mediante software a la medida.
            </p>
          </div>
        </div>
      </section>

      {/* Sección de Nuestra Propuesta */}
      <section
        id="propuesta"
        className="py-24 relative z-10 px-6 bg-[#02040a] border-b border-slate-900"
      >
        {/* Arco de iluminación superior personalizado (Difuminado) */}
        <div className="absolute inset-x-0 top-0 h-[480px] md:h-[580px] overflow-hidden pointer-events-none z-0 select-none">
          {/* Capa 1: Resplandor ambiental azul profundo */}
          <svg
            className="absolute top-0 left-0 w-full h-full opacity-45 blur-[120px]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="propuestaBaseGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#3162fa" stopOpacity="0.8" />
                <stop offset="60%" stopColor="#3162fa" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#3162fa" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M 0,0 Q 50,200 100,0 Z" fill="url(#propuestaBaseGlow)" />
          </svg>

          {/* Capa 2: Resplandor central celeste/cyan intenso */}
          <svg
            className="absolute top-0 left-0 w-full h-[85%] opacity-55 blur-[85px]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="propuestaCoreGlow" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00d1ff" stopOpacity="0.9" />
                <stop offset="50%" stopColor="#3162fa" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#3162fa" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M 0,0 Q 50,200 100,0 Z" fill="url(#propuestaCoreGlow)" />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          {/* Cabecera de la sección */}
          <div className="text-center mb-16">
            <TypewriterTitle 
              text="Por qué elegir software a medida con Woditek" 
              className="text-3xl md:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-white mb-6 leading-[1.1] uppercase"
              cursorColor="#00d1ff"
            />
            <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-10 leading-relaxed font-light text-center md:mx-auto font-sans">
              Creamos soluciones de software de alto impacto alineadas con la visión de tu negocio, con total transparencia, control and altos estándares de ingeniería.
            </p>
          </div>

          {/* Grid de 4 pilares */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Pilar 1: Propiedad Absoluta */}
            <div className="bg-[#0a0e1a]/60 border border-slate-800/80 p-8 rounded-2xl hover:border-[#3162fa]/30 transition-all duration-300 hover:shadow-[0_0_25px_rgba(49,98,250,0.1)] hover:-translate-y-1 group propuesta-card">
              <div className="w-12 h-12 rounded-xl bg-[#3162fa]/10 flex items-center justify-center text-[#3162fa] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Key size={24} />
              </div>
              <h3 className="text-lg font-sans font-semibold text-white mb-3 tracking-wide">
                Propiedad Absoluta
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-sans font-light">
                Eres dueño 100% de tu software. Cero costos de licenciamiento obligatorio por usuario y sin dependencias tecnológicas o de terceros.
              </p>
            </div>

            {/* Pilar 2: Diseño Adaptado */}
            <div className="bg-[#0a0e1a]/60 border border-slate-800/80 p-8 rounded-2xl hover:border-[#3162fa]/30 transition-all duration-300 hover:shadow-[0_0_25px_rgba(49,98,250,0.1)] hover:-translate-y-1 group propuesta-card">
              <div className="w-12 h-12 rounded-xl bg-[#3162fa]/10 flex items-center justify-center text-[#3162fa] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Cpu size={24} />
              </div>
              <h3 className="text-lg font-sans font-semibold text-white mb-3 tracking-wide">
                Diseño Adaptado
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-sans font-light">
                Tu software se adapta a tus flujos y procesos empresariales, no al revés. Optimizamos y automatizamos tareas críticas para tu productividad.
              </p>
            </div>

            {/* Pilar 3: Escalabilidad y Seguridad */}
            <div className="bg-[#0a0e1a]/60 border border-slate-800/80 p-8 rounded-2xl hover:border-[#3162fa]/30 transition-all duration-300 hover:shadow-[0_0_25px_rgba(49,98,250,0.1)] hover:-translate-y-1 group propuesta-card">
              <div className="w-12 h-12 rounded-xl bg-[#3162fa]/10 flex items-center justify-center text-[#3162fa] mb-6 group-hover:scale-110 transition-transform duration-300">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-sans font-semibold text-white mb-3 tracking-wide">
                Seguridad y Escalabilidad
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-sans font-light">
                Arquitectura moderna y código limpio diseñado bajo estrictos estándares de ciberseguridad, preparado para soportar el crecimiento de tu negocio.
              </p>
            </div>

            {/* Pilar 4: Soporte y Evolución */}
            <div className="bg-[#0a0e1a]/60 border border-slate-800/80 p-8 rounded-2xl hover:border-[#3162fa]/30 transition-all duration-300 hover:shadow-[0_0_25px_rgba(49,98,250,0.1)] hover:-translate-y-1 group propuesta-card">
              <div className="w-12 h-12 rounded-xl bg-[#3162fa]/10 flex items-center justify-center text-[#3162fa] mb-6 group-hover:scale-110 transition-transform duration-300">
                <Activity size={24} />
              </div>
              <h3 className="text-lg font-sans font-semibold text-white mb-3 tracking-wide">
                Soporte y Evolución
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed font-sans font-light">
                Soporte continuo y mantenimiento evolutivo garantizados. Tu plataforma evoluciona al mismo ritmo que lo hacen las demandas de tu mercado.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Sección de Propuesta de Valor / Nosotros */}
      <section id="nosotros" className="relative z-10 bg-white overflow-hidden manifesto-2-section border-b border-slate-200">
        <div ref={manifesto2Ref} className="grid grid-cols-1 lg:grid-cols-12 items-stretch w-full">
          {/* Texto a la izquierda */}
          <div className="lg:col-span-7 w-full text-left py-20 px-10 md:px-20 lg:pl-24 lg:pr-16 lg:order-1 order-1 flex flex-col justify-center nosotros-text">
            <TypewriterTitle 
              text="Transformamos flujos complejos en sistemas simples." 
              className="text-3xl md:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-slate-950 mb-6 leading-[1.1] uppercase"
              cursorColor="#3162fa"
            />
            <p className="text-xl md:text-2xl text-slate-800 max-w-2xl mb-10 leading-relaxed font-light text-left">
              Desarrollamos soluciones a medida que mitigan fallas, aceleran procesos y escalan al ritmo de tu negocio.
            </p>
          </div>

          {/* Imagen a la derecha */}
          <div className="lg:col-span-5 relative w-full h-[240px] lg:h-auto overflow-hidden lg:order-2 order-2">
            <img
              src={imgFlujo}
              alt="Flujo de Desarrollo Woditek"
              className="absolute inset-0 w-full h-full object-cover nosotros-img"
            />
            {/* Degradado solo al lado izquierdo (blanco) hacia la derecha (transparente) */}
            <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white via-white/30 to-transparent pointer-events-none z-10"></div>
          </div>
        </div>
      </section>

      {/* Sección de Servicios / Capacidades */}
      <section
        id="servicios"
        className="py-24 relative z-10 px-6 bg-[#f8fafd]"
      >
        <div className="max-w-6xl mx-auto">
          {/* Cabecera de sección */}
          <div className="text-center mb-16 servicios-header">
            <TypewriterTitle 
              text="Nuestros Servicios" 
              className="text-3xl md:text-5xl lg:text-6xl font-sans font-extrabold tracking-tight text-slate-950 mb-6 leading-[1.1] uppercase"
              cursorColor="#3162fa"
            />
            <p className="text-xl md:text-2xl text-slate-800 max-w-2xl mb-10 leading-relaxed font-light text-center md:mx-auto">
              Diseñamos soluciones tecnológicas a medida con un enfoque de ingeniería moderno y arquitectura robusta para impulsar tu negocio.
            </p>
          </div>

          {/* Contenedor relativo del carrusel */}
          <div className="relative w-full px-4 md:px-0 servicios-carousel-container select-none">
            {/* Control de navegación izquierdo */}
            <button
              onClick={handlePrevClick}
              className="group absolute left-0 top-1/2 -translate-y-1/2 translate-x-2 md:-translate-x-12 lg:-translate-x-20 z-20 w-12 h-12 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-[#3162fa]/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(49,98,250,0.3)] hover:scale-105"
              aria-label="Ver servicios anteriores"
            >
              <ChevronLeft size={22} className="transition-transform duration-300 group-hover:-translate-x-1" />
            </button>

            {isMobile ? (
              /* Carrusel Desplazable (Mobile Fallback) */
              <div
                ref={servicesCarouselRef}
                className="flex gap-8 overflow-x-auto scrollbar-none snap-x snap-mandatory scroll-smooth pb-8"
              >
                {services.map((service, idx) => (
                  <div key={idx} className="flex-none w-[290px] sm:w-[320px] snap-center snap-always">
                    <div className="bg-white border border-slate-200 rounded-2xl flex flex-col justify-between min-h-[480px] h-full shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-slate-300/80 overflow-hidden">
                      <div className="w-full">
                        <div className="w-full aspect-video overflow-hidden bg-slate-50 border-b border-slate-100">
                          <img
                            src={service.image}
                            alt={service.title}
                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                          />
                        </div>
                        <div className="p-6 text-center">
                          <h3 className="text-xl font-sans font-light text-slate-900 mb-3 tracking-wide">
                            {service.title}
                          </h3>
                          <p className="text-slate-500 text-sm leading-relaxed font-sans font-light">
                            {service.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Escena Cóncava 3D Real (Tablet & Desktop) - Estilo Anfiteatro */
              <div 
                className="carousel-3d-scene"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <div className="carousel-3d-container">
                  {services.map((service, idx) => {
                    const currentPosition = rotationIndex - dragOffsetIndex;

                    let offset = idx - currentPosition;
                    // Bucle infinito: mantener el offset en el rango [-2.5, 2.5]
                    offset = ((offset + 2.5) % 5);
                    if (offset < 0) offset += 5;
                    offset -= 2.5;

                    const absOffset = Math.abs(offset);
                    const isActive = absOffset < 0.5;

                    const tx = offset * spacing;
                    const rotY = -offset * 15; // Rotación hacia adentro (cóncava)
                    const tz = absOffset * zStep; // Los extremos avanzan en Z (hacia el usuario)
                    
                    const cardStyle = {
                      transform: `translateX(${tx}px) rotateY(${rotY}deg) translateZ(${tz}px)`,
                      opacity: absOffset > 2.0 ? 0 : (absOffset > 1.5 ? (2.0 - absOffset) * 2 : 1),
                      filter: 'none',
                      cursor: isActive ? 'default' : 'pointer',
                      zIndex: isActive ? 10 : (absOffset > 1.5 ? 2 : 5),
                      transition: isDragging ? 'none' : 'transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.6s, filter 0.6s',
                    } as React.CSSProperties;

                    return (
                      <div 
                        key={idx}
                        className={`carousel-3d-card rounded-2xl transition-all duration-300 ${
                          isActive 
                            ? 'shadow-[0_15px_35px_rgba(49,98,250,0.15)] scale-[1.03]' 
                            : 'scale-95'
                        }`}
                        style={cardStyle}
                        onClick={() => handleCardClick(idx)}
                      >
                        <div className="bg-white border border-slate-200/80 rounded-2xl flex flex-col justify-between min-h-[480px] h-full shadow-sm overflow-hidden select-none">
                          <div className="w-full pointer-events-none">
                            <div className="w-full aspect-video overflow-hidden bg-slate-50 border-b border-slate-100">
                              <img
                                src={service.image}
                                alt={service.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="p-6 text-center">
                              <h3 className="text-xl font-sans font-light text-slate-900 mb-3 tracking-wide">
                                {service.title}
                              </h3>
                              <p className="text-slate-500 text-sm leading-relaxed font-sans font-light">
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Control de navegación derecho */}
            <button
              onClick={handleNextClick}
              className="group absolute right-0 top-1/2 -translate-y-1/2 -translate-x-2 md:translate-x-12 lg:translate-x-20 z-20 w-12 h-12 rounded-full bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-[#3162fa]/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 shadow-md hover:shadow-[0_0_15px_rgba(49,98,250,0.3)] hover:scale-105"
              aria-label="Ver siguientes servicios"
            >
              <ChevronRight size={22} className="transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>



      {/* 5. Contacto */}
      <section
        id="contacto"
        className="py-24 relative z-10 px-6 bg-[#f8fafd] text-slate-800 border-t border-slate-200"
      >
        {/* Soft light blue ambient glow in background */}
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-sky-200/20 blur-[120px] pointer-events-none z-0"></div>

        <div className="max-w-4xl mx-auto relative z-10 text-left">
          {/* Cabecera del Contacto */}
          <div className="mb-6 contacto-header">
            <TypewriterTitle 
              text="Contáctanos" 
              className="text-3xl md:text-5xl font-sans font-extrabold tracking-tight text-[#3162fa] uppercase"
              cursorColor="#3162fa"
            />
          </div>

          {/* Información de Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 w-full">
            <div className="flex flex-col items-center text-center gap-3 p-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#3162fa]/10 rounded-full flex items-center justify-center text-[#3162fa]">
                <Phone size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Teléfono</h4>
                <p className="text-slate-600 font-medium">907030003</p>
              </div>
            </div>
            
            <div className="flex flex-col items-center text-center gap-3 p-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#3162fa]/10 rounded-full flex items-center justify-center text-[#3162fa]">
                <MapPin size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Domicilio Fiscal</h4>
                <p className="text-slate-600 text-xs leading-relaxed">CAL.GERMAN SCHEREIBER NRO. 276 URB. SANTA ANA<br/>LIMA - LIMA - SAN ISIDRO</p>
              </div>
            </div>

            <div className="flex flex-col items-center text-center gap-3 p-6 bg-white border border-slate-200/60 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#3162fa]/10 rounded-full flex items-center justify-center text-[#3162fa]">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Horario de Atención</h4>
                <p className="text-slate-600 font-medium">Lun - Vie &bull; 8am - 6pm</p>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div className="border-b border-slate-200/80 mb-10 w-full"></div>

          {isSubmitSuccess ? (
            <div className="text-center py-16 bg-white/60 backdrop-blur-md rounded-2xl border border-slate-200/80 shadow-sm max-w-xl mx-auto p-8">
              <div className="w-16 h-16 bg-[#3162fa]/10 border border-[#3162fa]/35 rounded-full flex items-center justify-center mx-auto mb-6 text-[#3162fa] animate-bounce">
                <CheckCircle size={32} />
              </div>
              <h3 className="text-2xl font-bold text-slate-950 mb-3">¡Mensaje Recibido!</h3>
              <p className="text-slate-600 text-base font-light">
                Gracias por ponerte en contacto. Nos comunicaremos contigo en las próximas horas para coordinar una sesión estratégica.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="w-full flex flex-col gap-8">
              {/* Grid de dos columnas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                {/* Columna 1 */}
                <div className="flex flex-col gap-8 contacto-form-group">
                  {/* Nombres y Apellidos */}
                  <div className="flex flex-col gap-1 text-left relative">
                    <label htmlFor="name" className="text-xs font-semibold text-slate-400 tracking-wider">
                      Nombres y Apellidos *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder=""
                      className={`w-full py-2 bg-transparent border-b text-slate-800 focus:outline-none focus:border-[#3162fa] transition-colors ${formErrors.name ? 'border-red-500' : 'border-slate-300'
                        }`}
                    />
                    {formErrors.name && (
                      <span className="text-[10px] text-red-500 font-medium absolute -bottom-5 left-0">
                        {formErrors.name}
                      </span>
                    )}
                  </div>

                  {/* Empresa */}
                  <div className="flex flex-col gap-1 text-left">
                    <label htmlFor="company" className="text-xs font-semibold text-slate-400 tracking-wider">
                      Empresa
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder=""
                      className="w-full py-2 bg-transparent border-b border-slate-300 text-slate-800 focus:outline-none focus:border-[#3162fa] transition-colors"
                    />
                  </div>

                  {/* Celular */}
                  <div className="flex flex-col gap-1 text-left">
                    <label htmlFor="phone" className="text-xs font-semibold text-slate-400 tracking-wider">
                      PE +51 Celular
                    </label>
                    <div className="flex items-center gap-2 border-b border-slate-300 focus-within:border-[#3162fa] transition-colors">
                      <span className="text-sm font-medium text-slate-400 pb-2">PE +51</span>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder=""
                        className="w-full pb-2 bg-transparent text-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Columna 2 */}
                <div className="flex flex-col gap-8 contacto-form-group">
                  {/* País */}
                  <div className="flex flex-col gap-1 text-left relative">
                    <label htmlFor="country" className="text-xs font-semibold text-slate-400 tracking-wider">
                      País
                    </label>
                    <div className="relative w-full border-b border-slate-300 focus-within:border-[#3162fa] transition-colors">
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        className="w-full py-2 pr-8 bg-transparent text-slate-800 focus:outline-none appearance-none font-medium cursor-pointer"
                      >
                        <option value="Perú">Perú</option>
                        <option value="Colombia">Colombia</option>
                        <option value="Chile">Chile</option>
                        <option value="Argentina">Argentina</option>
                        <option value="México">México</option>
                        <option value="España">España</option>
                        <option value="Estados Unidos">Estados Unidos</option>
                        <option value="Otro">Otro</option>
                      </select>
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        ▼
                      </span>
                    </div>
                  </div>

                  {/* Correo */}
                  <div className="flex flex-col gap-1 text-left relative">
                    <label htmlFor="email" className="text-xs font-semibold text-slate-400 tracking-wider">
                      Correo *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder=""
                      className={`w-full py-2 bg-transparent border-b text-slate-800 focus:outline-none focus:border-[#3162fa] transition-colors ${formErrors.email ? 'border-red-500' : 'border-slate-300'
                        }`}
                    />
                    {formErrors.email && (
                      <span className="text-[10px] text-red-500 font-medium absolute -bottom-5 left-0">
                        {formErrors.email}
                      </span>
                    )}
                  </div>

                  {/* Mensaje */}
                  <div className="flex flex-col gap-1 text-left">
                    <label htmlFor="message" className="text-xs font-semibold text-slate-400 tracking-wider">
                      Mensaje
                    </label>
                    <input
                      type="text"
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder=""
                      className="w-full py-2 bg-transparent border-b border-slate-300 text-slate-800 focus:outline-none focus:border-[#3162fa] transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Checkbox Acepto políticas */}
              <div className="flex flex-col gap-2 mt-4 text-left relative contacto-form-group">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    name="privacyAccepted"
                    checked={formData.privacyAccepted}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded text-[#3162fa] focus:ring-[#3162fa] border-slate-300 cursor-pointer"
                  />
                  <span className="text-xs font-medium text-slate-500">
                    Acepto las <a href="#contacto" className="text-[#3162fa] underline hover:text-blue-700">Políticas de privacidad y uso de datos</a>
                  </span>
                </label>
                {formErrors.privacyAccepted && (
                  <span className="text-[10px] text-red-500 font-medium absolute -bottom-5 left-0">
                    {formErrors.privacyAccepted}
                  </span>
                )}
              </div>

              {/* Botonera inferior: Limpiar y Enviar */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-8 pt-6 border-t border-slate-200/80 contacto-form-group">
                {/* Limpiar formulario */}
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors py-2"
                >
                  <Trash2 size={16} />
                  <span>Limpiar formulario</span>
                </button>

                {/* Enviar Mensaje */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-10 py-3 bg-[#3162fa] border border-[#3162fa] rounded-full text-xs font-bold tracking-wider text-white hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                      <span>ENVIANDO...</span>
                    </>
                  ) : (
                    <span>ENVIAR MENSAJE</span>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* Pie de Página */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6 relative z-10 text-center text-xs text-slate-500 font-light">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo />

          <div className="flex gap-8 text-[11px] tracking-wider text-slate-400 font-semibold uppercase">
            <a href="#hero" className="hover:text-white transition-colors duration-200">Home</a>
            <a href="#nosotros" className="hover:text-white transition-colors duration-200 font-sans">Nosotros</a>
            <a href="#propuesta" className="hover:text-white transition-colors duration-200 font-sans">Propuesta</a>
            <a href="#servicios" className="hover:text-white transition-colors duration-200 font-sans">Servicios</a>
            <a href="#contacto" className="hover:text-white transition-colors duration-200 font-sans">Contacto</a>
          </div>

          <div className="text-[11px] tracking-wide text-slate-600">
            © {new Date().getFullYear()} Woditek. Todos los derechos reservados.
          </div>
        </div>
      </footer>

    </div>
  );
}
