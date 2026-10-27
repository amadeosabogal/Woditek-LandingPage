import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Building2, Activity, Dumbbell, Hotel, PawPrint, Scissors, Utensils, CheckCircle2 } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { FadeIn } from '../FadeIn';
import { SectionHeading } from '../ui/SectionHeading';

type Tone = 'ok' | 'warn' | 'info';

interface Sector {
  id: string;
  label: string;
  icon: LucideIcon;
  /** Subdominio de la demo en vivo; null si es a medida (sin demo). */
  demo: string | null;
  domain: string;
  blurb: string;
  features: string[];
  kpis: { label: string; value: string }[];
  rows: { title: string; meta: string; status: string; tone: Tone }[];
  spark: number[];
}

// Datos de ejemplo ficticios, solo para ilustrar cada sistema
const SECTORS: Sector[] = [
  {
    id: 'restaurantes',
    label: 'Restaurantes',
    icon: Utensils,
    demo: 'restaurante',
    domain: 'restaurante.woditek.com',
    blurb: 'Pedidos, mesas, cocina, inventario y caja en un solo sistema.',
    features: ['Comandas directo a cocina', 'Control de mesas y delivery', 'Inventario de insumos', 'Cierre de caja diario'],
    kpis: [{ label: 'Ventas hoy', value: 'S/ 4,280' }, { label: 'Mesas activas', value: '12' }, { label: 'Pedidos', value: '36' }],
    rows: [
      { title: 'Mesa 4', meta: '3 platos', status: 'Listo', tone: 'ok' },
      { title: 'Delivery #1041', meta: 'Av. Arequipa', status: 'En cocina', tone: 'warn' },
      { title: 'Mesa 2', meta: '2 platos', status: 'Pagado', tone: 'info' },
    ],
    spark: [20, 34, 28, 46, 40, 62, 55, 78],
  },
  {
    id: 'barberias',
    label: 'Barberías',
    icon: Scissors,
    demo: 'barberia',
    domain: 'barberia.woditek.com',
    blurb: 'Clientes, citas, servicios, trabajadores y caja.',
    features: ['Agenda de citas', 'Comisiones por barbero', 'Historial de clientes', 'Caja y servicios'],
    kpis: [{ label: 'Citas hoy', value: '18' }, { label: 'Caja', value: 'S/ 1,150' }, { label: 'Barberos', value: '5' }],
    rows: [
      { title: '10:00 · Corte + barba', meta: 'Carlos', status: 'Confirmada', tone: 'ok' },
      { title: '10:45 · Corte clásico', meta: 'Luis', status: 'En curso', tone: 'warn' },
      { title: '11:30 · Perfilado', meta: 'Disponible', status: 'Libre', tone: 'info' },
    ],
    spark: [30, 24, 40, 36, 52, 48, 66, 60],
  },
  {
    id: 'clinicas',
    label: 'Clínicas',
    icon: Activity,
    demo: 'dentista',
    domain: 'dentista.woditek.com',
    blurb: 'Pacientes, citas, historiales y gestión administrativa.',
    features: ['Historia clínica digital', 'Agenda por especialista', 'Recordatorios de cita', 'Pagos y presupuestos'],
    kpis: [{ label: 'Citas hoy', value: '24' }, { label: 'Pacientes', value: '312' }, { label: 'Por cobrar', value: '6' }],
    rows: [
      { title: '09:00 · Limpieza dental', meta: 'Dr. Rojas', status: 'Atendida', tone: 'ok' },
      { title: '10:30 · Ortodoncia', meta: 'Dra. Vega', status: 'En espera', tone: 'warn' },
      { title: '11:15 · Consulta general', meta: 'Dr. Rojas', status: 'Confirmada', tone: 'info' },
    ],
    spark: [18, 26, 34, 30, 44, 50, 46, 64],
  },
  {
    id: 'gimnasios',
    label: 'Gimnasios',
    icon: Dumbbell,
    demo: 'gimnasio',
    domain: 'gimnasio.woditek.com',
    blurb: 'Membresías, asistencia, planes y pagos.',
    features: ['Control de membresías', 'Asistencia de socios', 'Planes y renovaciones', 'Cobros y vencimientos'],
    kpis: [{ label: 'Socios activos', value: '245' }, { label: 'Asistencias', value: '87' }, { label: 'Por vencer', value: '14' }],
    rows: [
      { title: 'Plan trimestral', meta: 'Ana R.', status: 'Al día', tone: 'ok' },
      { title: 'Plan mensual', meta: 'Vence en 3 días', status: 'Por vencer', tone: 'warn' },
      { title: 'Plan anual', meta: 'Luis M.', status: 'Renovado', tone: 'info' },
    ],
    spark: [40, 36, 48, 44, 56, 52, 68, 74],
  },
  {
    id: 'hoteles',
    label: 'Hoteles',
    icon: Hotel,
    demo: 'hotel',
    domain: 'hotel.woditek.com',
    blurb: 'Reservas, habitaciones, check-in y facturación.',
    features: ['Calendario de reservas', 'Estado de habitaciones', 'Check-in y check-out', 'Facturación'],
    kpis: [{ label: 'Ocupación', value: '78%' }, { label: 'Llegadas hoy', value: '9' }, { label: 'Libres', value: '11' }],
    rows: [
      { title: 'Hab. 204 · Doble', meta: 'Llegada 14:00', status: 'Check-in', tone: 'ok' },
      { title: 'Hab. 110 · Simple', meta: 'Housekeeping', status: 'Limpieza', tone: 'warn' },
      { title: 'Hab. 301 · Suite', meta: '2 noches', status: 'Reservada', tone: 'info' },
    ],
    spark: [28, 44, 38, 54, 60, 52, 70, 76],
  },
  {
    id: 'veterinaria',
    label: 'Veterinaria',
    icon: PawPrint,
    demo: 'veterinaria',
    domain: 'veterinaria.woditek.com',
    blurb: 'Mascotas, citas, historial clínico y vacunas.',
    features: ['Ficha por mascota', 'Carnet de vacunas', 'Citas y recordatorios', 'Venta de productos'],
    kpis: [{ label: 'Citas hoy', value: '15' }, { label: 'Mascotas', value: '640' }, { label: 'Vacunas por vencer', value: '12' }],
    rows: [
      { title: 'Firulais · Vacuna', meta: 'Dra. Vega', status: 'Atendido', tone: 'ok' },
      { title: 'Michi · Control', meta: '11:00', status: 'En espera', tone: 'warn' },
      { title: 'Rocky · Baño', meta: '12:30', status: 'Confirmada', tone: 'info' },
    ],
    spark: [16, 30, 26, 42, 38, 54, 50, 62],
  },
  {
    id: 'empresas',
    label: 'Empresas',
    icon: Building2,
    demo: null,
    domain: 'sistema.tuempresa.com',
    blurb: 'Procesos internos, usuarios, reportes y dashboards.',
    features: ['ERP y módulos a medida', 'Roles y permisos', 'Dashboards e indicadores', 'Integraciones con tus sistemas'],
    kpis: [{ label: 'Procesos automáticos', value: '24' }, { label: 'Usuarios', value: '48' }, { label: 'Reportes', value: '120' }],
    rows: [
      { title: 'Aprobación de compra', meta: 'Gerencia', status: 'Pendiente', tone: 'warn' },
      { title: 'Reporte mensual', meta: 'Automático', status: 'Generado', tone: 'ok' },
      { title: 'Alta de usuario', meta: 'Contabilidad', status: 'Completado', tone: 'info' },
    ],
    spark: [24, 32, 44, 40, 58, 66, 62, 82],
  },
];

const TONES: Record<Tone, string> = {
  ok: 'text-emerald-300 bg-emerald-500/15',
  warn: 'text-amber-300 bg-amber-500/15',
  info: 'text-blue-300 bg-blue-500/15',
};

const AUTOPLAY_MS = 6000;

const SectorMock: React.FC<{ sector: Sector }> = ({ sector }) => {
  const max = Math.max(...sector.spark);
  const points = sector.spark.map((v, i) => `${(i / (sector.spark.length - 1)) * 100},${40 - (v / max) * 34}`).join(' ');

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-blue-600/20 blur-3xl rounded-pill pointer-events-none"></div>
      <div className="relative bg-ink-800 border border-white/10 rounded-2xl overflow-hidden shadow-[0_24px_70px_-24px_rgba(37,99,235,0.5)]">
        <div className="flex items-center gap-2 px-4 py-3 bg-ink-950 border-b border-white/10">
          <span className="w-2.5 h-2.5 rounded-pill bg-red-400/80"></span>
          <span className="w-2.5 h-2.5 rounded-pill bg-amber-400/80"></span>
          <span className="w-2.5 h-2.5 rounded-pill bg-emerald-400/80"></span>
          <div className="ml-3 px-3 py-1 rounded-pill bg-white/5 text-[11px] text-slate-400 truncate">{sector.domain}</div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
            {sector.kpis.map((kpi, i) => (
              <div
                key={kpi.label}
                className="animate-fade-up bg-white/5 border border-white/10 rounded-lg p-2.5 sm:p-3"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <p className="text-[10px] sm:text-[11px] text-slate-400 mb-1 truncate">{kpi.label}</p>
                <p className="text-white font-heading font-black text-sm sm:text-lg leading-none">{kpi.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-lg p-3 sm:p-4 mb-4">
            <p className="text-[11px] text-slate-400 mb-2">Actividad</p>
            <svg viewBox="0 0 100 44" className="w-full h-20 sm:h-24" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <linearGradient id={`area-${sector.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <polygon points={`0,44 ${points} 100,44`} fill={`url(#area-${sector.id})`} className="animate-fade-up" style={{ animationDelay: '500ms' }} />
              <polyline
                points={points}
                fill="none"
                stroke="#22d3ee"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                pathLength={1}
                strokeDasharray="1"
                className="animate-draw"
              />
            </svg>
          </div>

          <ul className="space-y-2">
            {sector.rows.map((row, i) => (
              <li
                key={row.title}
                className="animate-fade-up flex items-center justify-between bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                style={{ animationDelay: `${300 + i * 90}ms` }}
              >
                <div className="min-w-0">
                  <p className="text-xs text-white font-semibold truncate">{row.title}</p>
                  <p className="text-[10px] text-slate-400 truncate">{row.meta}</p>
                </div>
                <span className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-pill ${TONES[row.tone]}`}>{row.status}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

const PREVIEW_W = 1280;
const PREVIEW_H = 800;

/** Vista previa en vivo de la demo: en gris hasta que el cursor pasa por encima. */
const DemoPreview: React.FC<{ sector: Sector }> = ({ sector }) => {
  const boxRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const update = () => setScale(el.clientWidth / PREVIEW_W);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-4 bg-blue-600/20 blur-3xl rounded-pill pointer-events-none"></div>
      <a
        href={`https://${sector.demo}.woditek.com`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Abrir demo de ${sector.label}`}
        className="group relative block bg-ink-800 border border-white/10 rounded-2xl overflow-hidden shadow-[0_24px_70px_-24px_rgba(37,99,235,0.5)]"
      >
        <div className="flex items-center gap-2 px-4 py-3 bg-ink-950 border-b border-white/10">
          <span className="w-2.5 h-2.5 rounded-pill bg-red-400/80"></span>
          <span className="w-2.5 h-2.5 rounded-pill bg-amber-400/80"></span>
          <span className="w-2.5 h-2.5 rounded-pill bg-emerald-400/80"></span>
          <div className="ml-3 px-3 py-1 rounded-pill bg-white/5 text-[11px] text-slate-400 truncate">{sector.domain}</div>
          <ArrowUpRight className="ml-auto w-4 h-4 text-slate-500 group-hover:text-cyan-300 transition-colors" />
        </div>

        <div ref={boxRef} className="relative w-full bg-white overflow-hidden" style={{ aspectRatio: `${PREVIEW_W} / ${PREVIEW_H}` }}>
          {!loaded && <div className="absolute inset-0 bg-slate-200 animate-pulse"></div>}
          <iframe
            src={`https://${sector.demo}.woditek.com`}
            title={`Vista previa de ${sector.label}`}
            loading="lazy"
            tabIndex={-1}
            onLoad={() => setLoaded(true)}
            className="absolute top-0 left-0 border-0 origin-top-left pointer-events-none grayscale brightness-110 transition-[filter] duration-500 group-hover:grayscale-0 group-hover:brightness-100"
            style={{ width: PREVIEW_W + 24, height: PREVIEW_H, transform: `scale(${scale})` }}
          ></iframe>
        </div>
      </a>
    </div>
  );
};

interface SectorsProps {
  onContact: () => void;
}

export const Sectors: React.FC<SectorsProps> = ({ onContact }) => {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const sector = SECTORS[active];
  const Icon = sector.icon;

  // Rota solo hasta que la persona elige un rubro
  useEffect(() => {
    if (!autoplay) return;
    const id = setTimeout(() => setActive((a) => (a + 1) % SECTORS.length), AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [active, autoplay]);

  const select = (i: number) => {
    setAutoplay(false);
    setActive(i);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
      e.preventDefault();
      select((active + 1) % SECTORS.length);
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
      e.preventDefault();
      select((active - 1 + SECTORS.length) % SECTORS.length);
    }
  };

  return (
    <section id="sectors" className="relative py-16 sm:py-24 md:py-32 bg-ink-900 overflow-hidden">
      <div className="absolute top-0 inset-x-0 hairline"></div>
      <div className="absolute inset-0 grid-fade opacity-70 pointer-events-none"></div>
      <div className="absolute top-1/2 -right-40 w-[34rem] h-[34rem] bg-blue-600/15 rounded-pill blur-[130px] pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 md:px-8 lg:px-16">
        <SectionHeading
          title={
            <>
              ¿Podrían hacer algo así para mi negocio? <span className="text-gradient">Sí, podemos.</span>
            </>
          }
          description="Mira cómo se ve un sistema Woditek en cada rubro y abre la demo en vivo."
          className="mb-12 md:mb-14"
        />

        <FadeIn>
          <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8">
            {/* Pestañas */}
            <div
              role="tablist"
              aria-label="Rubros"
              aria-orientation="vertical"
              onKeyDown={onKeyDown}
              className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0 pb-1"
            >
              {SECTORS.map((s, i) => {
                const TabIcon = s.icon;
                const isActive = i === active;
                return (
                  <button
                    key={s.id}
                    role="tab"
                    id={`tab-${s.id}`}
                    aria-selected={isActive}
                    aria-controls="sector-panel"
                    tabIndex={isActive ? 0 : -1}
                    onClick={() => select(i)}
                    className={`relative shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border text-left transition-all overflow-hidden ${
                      isActive
                        ? 'bg-blue-600/15 border-blue-400/40 text-white'
                        : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-white hover:bg-white/[0.06]'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isActive ? 'bg-gradient-to-br from-blue-500 to-cyan-400 text-white' : 'bg-white/5 text-slate-400'
                      }`}
                    >
                      <TabIcon className="w-4 h-4" />
                    </span>
                    <span className="font-heading font-bold text-sm whitespace-nowrap">{s.label}</span>
                    {isActive && autoplay && (
                      <span
                        key={`bar-${active}`}
                        className="absolute left-0 bottom-0 h-0.5 w-full origin-left bg-cyan-300 animate-grow-x"
                        style={{ animationDuration: `${AUTOPLAY_MS}ms`, animationTimingFunction: 'linear' }}
                      ></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Panel */}
            <div
              role="tabpanel"
              id="sector-panel"
              aria-labelledby={`tab-${sector.id}`}
              className="rounded-3xl border border-white/10 bg-ink-950/60 backdrop-blur p-6 md:p-8 lg:p-10"
            >
              <div key={sector.id} className="flex flex-col gap-8 lg:gap-10">
                <div className="animate-fade-up">
                  <div className="w-14 h-14 mb-5 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 text-white flex items-center justify-center shadow-[0_8px_24px_-6px_rgba(34,211,238,0.5)]">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-heading text-2xl md:text-3xl font-extrabold text-white mb-3">{sector.label}</h3>
                  <p className="text-slate-300 mb-6">{sector.blurb}</p>
                  <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-8 max-w-2xl">
                    {sector.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-cyan-400" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap gap-3">
                    {sector.demo && (
                      <a
                        href={`https://${sector.demo}.woditek.com`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glow-button inline-flex items-center justify-center gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-pill text-sm font-heading font-black uppercase [font-variation-settings:'wdth'_125] transition-colors"
                      >
                        Ver demo en vivo <ArrowUpRight className="w-4 h-4" />
                      </a>
                    )}
                    {!sector.demo && (
                      <button
                        onClick={onContact}
                        className="glow-button inline-flex items-center justify-center gap-2 whitespace-nowrap bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-pill text-sm font-heading font-black uppercase [font-variation-settings:'wdth'_125] transition-colors"
                      >
                        Cotizar sistema a medida <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {sector.demo ? <DemoPreview sector={sector} /> : <SectorMock sector={sector} />}
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Y también: colegios, ópticas, zapaterías, car wash, concesionarios, licorerías, agencias de viaje y más.
          </p>
        </FadeIn>
      </div>
    </section>
  );
};
