import React, { useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  ChartColumn,
  Settings,
  Check,
  MessageCircle,
} from 'lucide-react';
import { CountUp } from './ui/CountUp';
import { prefersReducedMotion } from '../hooks/useInView';

// Panel de muestra decorativo para el hero: datos ficticios, animado "en vivo".
const bars = [38, 52, 44, 66, 58, 74, 62, 86, 70, 92, 80, 100];

const orderPool = [
  { id: 'Pedido #1045', meta: 'Delivery', status: 'Nuevo', tone: 'text-cyan-300 bg-cyan-500/15' },
  { id: 'Pedido #1044', meta: 'Mesa 7', status: 'En cocina', tone: 'text-amber-300 bg-amber-500/15' },
  { id: 'Pedido #1043', meta: 'Mesa 1', status: 'Listo', tone: 'text-emerald-300 bg-emerald-500/15' },
  { id: 'Pedido #1042', meta: 'Mesa 4', status: 'Pagado', tone: 'text-blue-300 bg-blue-500/15' },
  { id: 'Pedido #1041', meta: 'Delivery', status: 'En camino', tone: 'text-violet-300 bg-violet-500/15' },
  { id: 'Pedido #1040', meta: 'Mesa 2', status: 'Pagado', tone: 'text-blue-300 bg-blue-500/15' },
];

const sidebarIcons = [LayoutDashboard, ShoppingCart, Users, ChartColumn, Settings];

export const HeroDashboard: React.FC = () => {
  const tiltRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);

  // Un pedido nuevo entra cada pocos segundos
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const id = setInterval(() => setTick((t) => t + 1), 3600);
    return () => clearInterval(id);
  }, []);

  const visibleOrders = [0, 1, 2].map((i) => orderPool[(orderPool.length * 10 - tick + i) % orderPool.length]);

  // Inclinación 3D suave según el cursor (solo con mouse y sin "reducir movimiento")
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (prefersReducedMotion() || !tiltRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    tiltRef.current.style.transform = `perspective(1200px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg)`;
  };
  const handleLeave = () => {
    if (tiltRef.current) tiltRef.current.style.transform = 'perspective(1200px) rotateY(0deg) rotateX(0deg)';
  };

  return (
    <div
      className="relative w-full max-w-2xl mx-auto xl:max-w-none"
      aria-hidden="true"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="absolute -inset-6 bg-blue-600/25 blur-3xl rounded-pill pointer-events-none"></div>

      <div ref={tiltRef} className="relative transition-transform duration-300 ease-out will-change-transform">
        <div className="relative bg-ink-800 border border-white/10 rounded-2xl overflow-hidden shadow-[0_30px_80px_-20px_rgba(37,99,235,0.5)]">
          {/* Barra de ventana */}
          <div className="flex items-center gap-2 px-4 py-3 bg-ink-950 border-b border-white/10">
            <span className="w-2.5 h-2.5 rounded-pill bg-red-400/80"></span>
            <span className="w-2.5 h-2.5 rounded-pill bg-amber-400/80"></span>
            <span className="w-2.5 h-2.5 rounded-pill bg-emerald-400/80"></span>
            <div className="ml-3 px-3 py-1 rounded-pill bg-white/5 text-[11px] text-slate-400 tracking-wide">
              panel.tuempresa.com
            </div>
            <div className="ml-auto hidden sm:flex items-center gap-2 text-[10px] font-semibold text-emerald-300">
              <span className="relative flex w-2 h-2">
                <span className="absolute inset-0 rounded-pill bg-emerald-400 animate-pulse-ring"></span>
                <span className="relative w-2 h-2 rounded-pill bg-emerald-400"></span>
              </span>
              En vivo
            </div>
          </div>

          <div className="flex">
            {/* Barra lateral */}
            <div className="hidden sm:flex flex-col items-center gap-3 py-5 px-3 border-r border-white/10 bg-ink-900">
              {sidebarIcons.map((Icon, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                    i === 0 ? 'bg-blue-600 text-white shadow-[0_0_18px_rgba(37,99,235,0.6)]' : 'text-slate-500'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>

            {/* Contenido */}
            <div className="flex-1 p-4 sm:p-5 min-w-0">
              <p className="text-white font-heading font-bold text-sm mb-4">Resumen del día</p>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 sm:p-3">
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mb-1 truncate">Ventas de hoy</p>
                  <p className="text-white font-heading font-black text-sm sm:text-lg leading-none">
                    <CountUp to={4280} prefix="S/ " duration={2200} />
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 sm:p-3">
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mb-1 truncate">Pedidos</p>
                  <p className="text-white font-heading font-black text-sm sm:text-lg leading-none">
                    <CountUp to={36} duration={1800} />
                  </p>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 sm:p-3">
                  <p className="text-[10px] sm:text-[11px] text-slate-400 mb-1 truncate">Clientes</p>
                  <p className="text-white font-heading font-black text-sm sm:text-lg leading-none">
                    <CountUp to={128} duration={2000} />
                  </p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 mb-4">
                <p className="text-[11px] text-slate-400 mb-3">Ventas de la semana</p>
                <div className="flex items-end gap-1.5 sm:gap-2 h-24 sm:h-28">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className={`flex-1 rounded-t-sm origin-bottom animate-grow-y ${
                        i === bars.length - 1 ? 'bg-gradient-to-t from-blue-600 to-cyan-400' : 'bg-blue-500/35'
                      }`}
                      style={{ height: `${h}%`, animationDelay: `${500 + i * 70}ms` }}
                    ></div>
                  ))}
                </div>
              </div>

              <ul className="space-y-2 min-h-[132px]">
                {visibleOrders.map((order) => (
                  <li
                    key={order.id}
                    className="animate-fade-up flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-xs text-white font-semibold truncate">{order.id}</p>
                      <p className="text-[10px] text-slate-400">{order.meta}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-pill ${order.tone}`}>{order.status}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Tarjetas flotantes */}
        <div className="hidden sm:flex absolute -top-5 -right-3 xl:-right-6 items-center gap-3 bg-ink-700/95 backdrop-blur border border-white/10 rounded-xl px-4 py-3 shadow-2xl animate-float">
          <span className="w-8 h-8 rounded-pill bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xs text-white font-semibold">Cotización aprobada</p>
            <p className="text-[10px] text-slate-400">Hace 2 min</p>
          </div>
        </div>

        <div
          className="hidden sm:flex absolute -bottom-5 -left-3 xl:-left-6 items-center gap-3 bg-ink-700/95 backdrop-blur border border-white/10 rounded-xl px-4 py-3 shadow-2xl animate-float"
          style={{ animationDelay: '-3s' }}
        >
          <span className="w-8 h-8 rounded-pill bg-[#25D366]/20 text-[#25D366] flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </span>
          <div>
            <p className="text-xs text-white font-semibold">Aviso enviado por WhatsApp</p>
            <p className="text-[10px] text-slate-400">Automático</p>
          </div>
        </div>
      </div>
    </div>
  );
};
