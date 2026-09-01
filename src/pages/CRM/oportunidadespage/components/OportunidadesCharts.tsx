import React from 'react';
import ReactECharts from 'echarts-for-react';

interface OportunidadesChartsProps {
  columns: Record<string, any>;
  columnOrder: string[];
  selectedUser: string;
  selectedTag: string;
  selectedSector: string;
}

const COLORS = ['#0ea5e9', '#10B981', '#f97316', '#8b5cf6', '#EF4444', '#F59E0B', '#06b6d4'];

const COLOR_MAP: Record<string, string> = {
  'bg-primary': '#00236f',
  'bg-status-pp': '#10B981',
  'bg-status-qp': '#F59E0B',
  'bg-status-ip': '#3B82F6',
  'bg-status-hp': '#EF4444',
  'bg-status-na': '#9CA3AF',
  'bg-slate-500': '#64748b',
  'bg-red-500': '#ef4444',
  'bg-orange-500': '#f97316',
  'bg-amber-500': '#f59e0b',
  'bg-yellow-500': '#eab308',
  'bg-lime-500': '#84cc16',
  'bg-green-500': '#22c55e',
  'bg-emerald-500': '#10b981',
  'bg-teal-500': '#14b8a6',
  'bg-cyan-500': '#06b6d4',
  'bg-sky-500': '#0ea5e9',
  'bg-blue-500': '#3b82f6',
  'bg-indigo-500': '#6366f1',
  'bg-violet-500': '#8b5cf6',
  'bg-purple-500': '#a855f7',
  'bg-fuchsia-500': '#d946ef',
  'bg-pink-500': '#ec4899',
  'bg-rose-500': '#f43f5e',
};

const OportunidadesCharts: React.FC<OportunidadesChartsProps> = ({ 
  columns, 
  columnOrder, 
  selectedUser, 
  selectedTag, 
  selectedSector 
}) => {
  // Procesar datos para gráficos
  const stageData = columnOrder.map((colId, index) => {
    const col = columns[colId];
    
    // Filtrar items
    const filteredItems = col.items.filter((item: any) => {
      if (selectedUser !== 'all' && item.responsible?.id?.toString() !== selectedUser) return false;
      if (selectedTag !== 'all') {
        const etiquetas = Array.isArray(item.etiquetas) ? item.etiquetas : [];
        const hasTag = etiquetas.some((t: any) => {
          const name = typeof t === 'string' ? t : t.nombre;
          return name?.toLowerCase() === selectedTag.toLowerCase();
        });
        if (!hasTag) return false;
      }
      if (selectedSector !== 'all' && item.organizacion_perfil?.industria !== selectedSector) return false;
      return true;
    });

    const totalValueOriginal = filteredItems.reduce((acc: number, item: any) => {
      const num = parseFloat((item.value || '').replace(/[^0-9.-]+/g, ""));
      return acc + (isNaN(num) ? 0 : num);
    }, 0);

    let totalMercado = 0;
    let totalCap = 0;
    let totalUtilidad = 0;

    filteredItems.forEach((item: any) => {
      try {
        const mp = JSON.parse(item.mercado_potencial || '{}');
        const mercado = parseFloat(String(mp.venta_usd_anio || 0).replace(/,/g, '')) || 0;
        const prob = parseFloat(item.probabilidad || 0) || 0;
        const cap = mercado * (prob / 100);
        const margen = parseFloat(String(mp.margen_bruto_porcentaje || 0).replace(/,/g, '')) || 0;
        const utilidad = cap * (margen / 100);

        totalMercado += mercado;
        totalCap += cap;
        totalUtilidad += utilidad;
      } catch (e) {
        // Ignorar
      }
    });

    const colorHex = COLOR_MAP[col.colorClass] || COLORS[index % COLORS.length];

    return {
      name: col.title,
      count: filteredItems.length,
      valueOriginal: totalValueOriginal,
      itemStyle: { color: colorHex },
      mercado: totalMercado,
      cap: totalCap,
      utilidad: totalUtilidad
    };
  });

  const totalOportunidades = stageData.reduce((acc, curr) => acc + curr.count, 0);
  const totalMonetario = stageData.reduce((acc, curr) => acc + curr.valueOriginal, 0);

  const totalMercado = stageData.reduce((acc, curr) => acc + curr.mercado, 0);
  const totalCap = stageData.reduce((acc, curr) => acc + curr.cap, 0);
  const totalUtilidad = stageData.reduce((acc, curr) => acc + curr.utilidad, 0);

  const formatNumber = (val: number, decimals: number = 0) => {
    if (isNaN(val) || val === null || val === undefined) return '0';
    const intlStr = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(val);
    const parts = intlStr.split(',');
    let withApostrophe = intlStr;
    if (parts.length > 2) {
      const lastPart = parts.pop();
      withApostrophe = parts.join("'") + ',' + lastPart;
    }
    return withApostrophe;
  };

  const formatUSD = (val: number) => {
    return `USD ${formatNumber(val, 0)}`;
  };
  
  const formatUSD2Decimals = (val: number) => {
    return formatNumber(val, 2);
  };

  // --- Gráficos Originales ---
  const barOptionOriginal = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const data = params[0].data;
        return `${params[0].name}<br/>Monto: ${formatUSD(data.value)}<br/>Cantidad: ${data.countValue} ops`;
      }
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: stageData.map(d => d.name),
        axisTick: { alignWithLabel: true }
      }
    ],
    yAxis: [
      { 
        type: 'value',
        axisLabel: {
          formatter: (value: number) => {
            if (value >= 1000) return `$${value / 1000}k`;
            return `$${value}`;
          }
        }
      }
    ],
    series: [
      {
        name: 'Valor',
        type: 'bar',
        barWidth: '60%',
        label: {
          show: true,
          position: 'top',
          formatter: (params: any) => {
            if (!params.data.value) return '';
            return formatUSD(params.data.value);
          },
          fontSize: 12,
          fontWeight: 'bold',
          color: '#64748b'
        },
        data: stageData.map(d => ({ 
          value: d.valueOriginal, 
          countValue: d.count,
          itemStyle: d.itemStyle 
        }))
      }
    ]
  };

  const pieOptionOriginal = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}: ${params.value} oportunidades (${params.percent}%)`
    },
    legend: {
      top: '5%',
      left: 'center'
    },
    series: [
      {
        name: 'Cantidad por Etapa',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#fff',
          borderWidth: 2
        },
        label: {
          show: true,
          position: 'inside',
          formatter: '{c}',
          fontSize: 14,
          fontWeight: 'bold',
          color: '#ffffff'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: false
        },
        data: stageData.filter(d => d.count > 0).map(d => ({ name: d.name, value: d.count, itemStyle: d.itemStyle }))
      }
    ]
  };

  // --- Nuevos Gráficos (Mercado Potencial) ---
  const chart1Option = {
    title: { text: 'Captación Anual del Potencial / Mercado Potencial', left: 'center' },
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: any) => formatNumber(Number(value), 2)
    },
    legend: { data: ['Mercado Potencial, USD', 'CAP, USD'], bottom: 0 },
    grid: { left: '3%', right: '4%', bottom: '15%', top: '25%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: stageData.map(d => d.name),
      axisLabel: { interval: 0, rotate: 45, width: 90, overflow: 'truncate' } 
    },
    yAxis: { 
      type: 'value', 
      name: 'USD/año',
      axisLabel: { formatter: (val: number) => formatNumber(val, 0) }
    },
    series: [
      {
        name: 'Mercado Potencial, USD',
        type: 'bar',
        itemStyle: { color: '#3b82f6' },
        label: { show: false },
        data: stageData.map(d => d.mercado)
      },
      {
        name: 'CAP, USD',
        type: 'bar',
        itemStyle: { color: '#ef4444' },
        label: { show: false },
        data: stageData.map(d => d.cap)
      }
    ]
  };

  const chart2Option = {
    title: { text: 'Contribución en base al Mercado Potencial', left: 'center' },
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: any) => formatNumber(Number(value), 2)
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '25%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: [''],
      axisLabel: { show: false },
      axisTick: { show: false }
    },
    yAxis: { 
      type: 'value', 
      name: 'USD/año',
      axisLabel: { formatter: (val: number) => formatNumber(val, 0) }
    },
    series: [
      {
        name: 'Total Mercado Potencial',
        type: 'bar',
        barWidth: '30%',
        itemStyle: { color: '#3b82f6' },
        label: { show: true, position: 'top', formatter: (p: any) => formatUSD2Decimals(p.value) },
        data: [totalMercado]
      },
      {
        name: 'Total Utilidad Bruta',
        type: 'bar',
        barWidth: '30%',
        itemStyle: { color: '#991b1b' }, 
        label: { show: true, position: 'top', formatter: (p: any) => formatUSD2Decimals(p.value) },
        data: [totalUtilidad]
      }
    ]
  };

  const pieOptionNew = {
    title: { text: 'CAP/Mercado Potencial', left: 'center' },
    tooltip: { 
      trigger: 'item', 
      formatter: (params: any) => `${params.name}: ${formatNumber(params.value, 2)} (${params.percent}%)`
    },
    series: [
      {
        type: 'pie',
        radius: ['0%', '60%'],
        center: ['50%', '55%'],
        label: { position: 'inside', formatter: '{d}%' },
        data: [
          { value: Math.max(0, totalMercado - totalCap), name: 'Mercado Potencial Restante', itemStyle: { color: '#2563eb' } },
          { value: totalCap, name: 'CAP', itemStyle: { color: '#dc2626' } }
        ]
      }
    ]
  };

  const chart4Option = {
    title: { text: 'Contribución en base al CAP', left: 'center' },
    tooltip: { 
      trigger: 'axis', 
      axisPointer: { type: 'shadow' },
      valueFormatter: (value: any) => formatNumber(Number(value), 2)
    },
    grid: { left: '3%', right: '4%', bottom: '10%', top: '15%', containLabel: true },
    xAxis: { 
      type: 'category', 
      data: [''],
      axisLabel: { show: false },
      axisTick: { show: false }
    },
    yAxis: { 
      type: 'value', 
      axisLabel: { formatter: (val: number) => formatNumber(val, 0) },
      max: totalCap > 0 ? undefined : 100
    },
    series: [
      {
        name: 'Total del CAP en Dólares',
        type: 'bar',
        barWidth: '30%',
        itemStyle: { color: '#2563eb' },
        label: { show: true, position: 'top', formatter: (p: any) => formatUSD2Decimals(p.value) },
        data: [totalCap]
      },
      {
        name: 'Total del CAP por el Margen Bruto',
        type: 'bar',
        barWidth: '30%',
        itemStyle: { color: '#b91c1c' },
        label: { show: true, position: 'top', formatter: (p: any) => formatUSD2Decimals(p.value) },
        data: [totalUtilidad]
      }
    ]
  };

  return (
    <div className="p-0 h-full flex flex-col overflow-hidden animate-in fade-in duration-300">
      <div className="flex-1 overflow-y-auto">
        
        {/* Estadísticas Top */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-surface border-b border-r border-border-subtle p-8 flex flex-col items-center justify-center">
            <h3 className="text-on-surface-variant text-[14px] font-bold uppercase tracking-wider mb-2">Total Oportunidades</h3>
            <p className="text-[36px] font-display font-bold text-primary">{totalOportunidades}</p>
          </div>
          <div className="bg-surface border-b border-border-subtle p-8 flex flex-col items-center justify-center">
            <h3 className="text-on-surface-variant text-[14px] font-bold uppercase tracking-wider mb-2">Valor Total</h3>
            <p className="text-[36px] font-display font-bold text-status-hp">{formatUSD(totalMonetario)}</p>
          </div>
        </div>

        {/* Gráficos Originales */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-surface border-b border-r border-border-subtle p-8 min-h-[400px] flex flex-col">
            <h3 className="text-on-surface text-[16px] font-bold mb-4">Valor por Etapa</h3>
            <div className="flex-1 min-h-[300px]">
              <ReactECharts option={barOptionOriginal} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
          <div className="bg-surface border-b border-border-subtle p-8 min-h-[400px] flex flex-col">
            <h3 className="text-on-surface text-[16px] font-bold mb-4">Cantidad por Etapa</h3>
            <div className="flex-1 min-h-[300px]">
               <ReactECharts option={pieOptionOriginal} style={{ height: '100%', width: '100%' }} />
            </div>
          </div>
        </div>

        {/* Separador */}
        <div className="bg-surface-muted p-4 border-b border-border-subtle text-center">
          <h2 className="text-[16px] font-bold text-on-surface uppercase tracking-wider">Análisis de Mercado Potencial y CAP</h2>
        </div>

        {/* Nuevos Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="bg-surface border-b border-r border-border-subtle p-8 min-h-[400px] flex flex-col">
            <ReactECharts option={chart1Option} style={{ height: '100%', minHeight: '350px', width: '100%' }} />
          </div>
          <div className="bg-surface border-b border-border-subtle p-8 min-h-[400px] flex flex-col">
            <ReactECharts option={chart2Option} style={{ height: '100%', minHeight: '350px', width: '100%' }} />
          </div>
          <div className="bg-surface border-r border-border-subtle p-8 min-h-[400px] flex flex-col">
            <ReactECharts option={pieOptionNew} style={{ height: '100%', minHeight: '350px', width: '100%' }} />
          </div>
          <div className="bg-surface p-8 min-h-[400px] flex flex-col">
            <ReactECharts option={chart4Option} style={{ height: '100%', minHeight: '350px', width: '100%' }} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default OportunidadesCharts;
