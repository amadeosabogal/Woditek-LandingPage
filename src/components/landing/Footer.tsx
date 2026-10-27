import React from 'react';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Logo } from '../Logo';
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from '../ui/Icons';
import { NAV_LINKS } from './Navbar';

interface FooterProps {
  scrollTo: (id: string) => void;
}

const SERVICES = ['Software a medida', 'Desarrollo web', 'Automatización', 'Inteligencia Artificial', 'Integraciones', 'Dashboards'];

const SOCIALS = [
  { href: 'https://www.instagram.com/woditek.pe/', label: 'Instagram', Icon: InstagramIcon, hover: 'hover:bg-gradient-to-br hover:from-pink-500 hover:to-orange-400' },
  { href: 'https://www.tiktok.com/@woditek', label: 'TikTok', Icon: TikTokIcon, hover: 'hover:bg-black' },
  { href: 'https://wa.me/51953095173', label: 'WhatsApp', Icon: WhatsAppIcon, hover: 'hover:bg-[#25D366]' },
];

export const Footer: React.FC<FooterProps> = ({ scrollTo }) => (
  <footer id="contact" className="relative bg-ink-950 pt-20 pb-8 overflow-hidden">
    <div className="absolute top-0 inset-x-0 hairline"></div>
    <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[50rem] h-80 bg-blue-600/15 rounded-pill blur-[130px] pointer-events-none"></div>

    <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] gap-10 lg:gap-12 mb-14">
        <div>
          <Logo imgClassName="h-9 w-auto" />
          <p className="mt-5 text-sm text-slate-400 leading-relaxed max-w-xs">
            Somos una agencia dedicada al diseño y desarrollo de soluciones tecnológicas innovadoras, creadas para llevar tu negocio al siguiente nivel digital.
          </p>
          <div className="mt-6 flex gap-3">
            {SOCIALS.map(({ href, label, Icon, hover }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={`w-10 h-10 rounded-pill border border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-transparent flex items-center justify-center transition-all hover:-translate-y-0.5 ${hover}`}
              >
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-heading font-bold text-white text-sm uppercase tracking-widest mb-5">Navegación</h4>
          <ul className="space-y-3 text-sm">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <button onClick={() => scrollTo(link.id)} className="text-slate-400 hover:text-white transition-colors">
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold text-white text-sm uppercase tracking-widest mb-5">Servicios</h4>
          <ul className="space-y-3 text-sm">
            {SERVICES.map((service) => (
              <li key={service}>
                <button onClick={() => scrollTo('services')} className="text-slate-400 hover:text-white transition-colors">
                  {service}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-heading font-bold text-white text-sm uppercase tracking-widest mb-5">Contáctanos</h4>
          <ul className="space-y-4 text-sm text-slate-400">
            <li className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <a href="mailto:soporte@woditek.com" className="hover:text-white transition-colors">soporte@woditek.com</a>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <a href="https://wa.me/51953095173" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">+51 953 095 173</a>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
              <span>CAL.GERMAN SCHEREIBER NRO. 276<br />URB. SANTA ANA<br />LIMA - LIMA - SAN ISIDRO</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="hairline mb-6"></div>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Woditek. Todos los derechos reservados.</p>
        <p>Hecho en Lima, Perú</p>
      </div>
    </div>
  </footer>
);
