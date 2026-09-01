import React, { useState, useMemo, useRef } from 'react';
import { apiFetch } from '../../../../services/api';
import { Workbook } from '@fortune-sheet/react';
import { useDialog } from '../../../../context/CRM/DialogContext';
import '@fortune-sheet/react/dist/index.css';

interface OportunidadesReporteProps {
  columns: Record<string, any>;
  columnOrder: string[];
  proyectoId: number;
  hasGoogleSheet?: boolean;
}

const OportunidadesReporte: React.FC<OportunidadesReporteProps> = ({ columns, columnOrder, proyectoId, hasGoogleSheet = false }) => {
  const [isExporting, setIsExporting] = useState(false);
  const workbookRef = useRef<any>(null);
  const dialog = useDialog();

  // Flatten items for the table
  const allItems = useMemo(() => {
    return columnOrder.flatMap(colId => {
      return columns[colId].items.map((item: any) => ({
        ...item,
        stageName: columns[colId].title
      }));
    });
  }, [columns, columnOrder]);

    const handleOpenInGoogleSheets = async (manualSpreadsheetId?: string) => {
    setIsExporting(true);
    try {
      // Extraer datos visuales de FortuneSheet si está disponible
      let formattingData: any[] = [];
      if (workbookRef.current) {
        try {
          const allSheets = workbookRef.current.getAllSheets();
          if (allSheets && allSheets.length > 0) {
            const dataMatrix = allSheets[0].data;
            if (dataMatrix && Array.isArray(dataMatrix)) {
              dataMatrix.forEach((row: any[], rIdx: number) => {
                if (!row) return;
                row.forEach((cell: any, cIdx: number) => {
                  if (cell && typeof cell === 'object' && (cell.bg || cell.fc || cell.bl || cell.it || cell.fs)) {
                    formattingData.push({
                      r: rIdx,
                      c: cIdx,
                      v: cell // En la matriz data, el elemento es el objeto de formato
                    });
                  }
                });
              });
            }
          }
        } catch (e) {
          console.warn('Could not extract formatting from Workbook', e);
        }
      }

      const payload: any = { 
        items: allItems, 
        proyecto_id: proyectoId,
        formatting: formattingData
      };
      if (manualSpreadsheetId) {
        payload.spreadsheetId = manualSpreadsheetId;
      }
      const data = await apiFetch('/api/sheets/export', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
      
      if (data.spreadsheetUrl) {
        window.open(data.spreadsheetUrl, '_blank');
      } else {
        dialog.alert({ 
          title: 'Error', 
          message: 'No se pudo abrir el Google Sheet. Revisa la consola para más detalles.' 
        });
      }
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error);
      dialog.alert({ 
        title: 'Error de conexión', 
        message: 'Error al conectar con el servidor.' 
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Funcionalidad Vincular Existente eliminada según requerimientos

  // Prepare data for FortuneSheet
  const sheetSettings = useMemo(() => {
    const celldata: any[] = [];
    const headers = [
      'Oportunidad', 'Organización', 'Contacto', 'Email Contacto', 
      'Mercado Potencial (USD)', 'CAP (%)', 'CAP (USD)', 'Margen Bruto (%)', 'Utilidad Bruta (USD)', 
      'Etapa', 'Prioridad', 'Responsable'
    ];
    
    // Add Headers
    headers.forEach((h, i) => {
      celldata.push({
        r: 0,
        c: i,
        v: h // Solo texto plano para los encabezados por seguridad
      });
    });

    // Add Rows
    allItems.forEach((item, rIdx) => {
      let mercado = 0;
      let prob = parseFloat(item.probabilidad || 0) || 0;
      let cap = 0;
      let margen = 0;
      let utilidad = 0;

      try {
        const mp = JSON.parse(item.mercado_potencial || '{}');
        mercado = parseFloat(String(mp.venta_usd_anio || 0).replace(/,/g, '')) || 0;
        cap = mercado * (prob / 100);
        margen = parseFloat(String(mp.margen_bruto_porcentaje || 0).replace(/,/g, '')) || 0;
        utilidad = cap * (margen / 100);
      } catch (e) {}

      const row = [
        item.product || '',
        item.name || '',
        item.contactName || '',
        item.email || '',
        mercado ? Number(mercado).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00',
        `${prob}%`,
        cap ? Number(cap).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00',
        `${margen}%`,
        utilidad ? Number(utilidad).toLocaleString('en-US', {minimumFractionDigits: 2}) : '0.00',
        item.stageName || '',
        item.stars ? item.stars.toString() + ' estrellas' : '',
        item.responsible?.name || ''
      ];

      row.forEach((val, cIdx) => {
        if (val !== null && val !== undefined && val !== '') {
          celldata.push({
            r: rIdx + 1,
            c: cIdx,
            v: String(val) // Solo texto plano para evitar crashes de parseo
          });
        }
      });
    });

    return [{
      name: 'Reporte',
      id: 'sheet_01',
      status: 1,
      row: Math.max(84, allItems.length + 10),
      column: Math.max(18, headers.length),
      defaultRowHeight: 28, 
      defaultColWidth: 160, 
      celldata: celldata
    }];
  }, [allItems]);

  if (allItems.length === 0) {
    return (
      <div className="flex flex-col h-full bg-surface animate-in fade-in duration-300">
        <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted">
          <div>
            <h2 className="text-[16px] font-bold text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">table_chart</span>
              Reporte de Oportunidades
            </h2>
            <p className="text-[12px] text-on-surface-variant">Vista detallada estilo hoja de cálculo interactiva</p>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center text-on-surface-variant p-8">
          No hay oportunidades en este proyecto.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-surface animate-in fade-in duration-300" style={{ height: 'calc(100vh - 120px)' }}>
      <div className="p-4 border-b border-border-subtle flex justify-between items-center bg-surface-muted">
        <div>
          <h2 className="text-[16px] font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">table_chart</span>
            Reporte de Oportunidades
          </h2>
          <p className="text-[12px] text-on-surface-variant">Vista detallada estilo hoja de cálculo interactiva</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleOpenInGoogleSheets()}
            disabled={isExporting}
            className="flex items-center gap-2 bg-[#0F9D58] hover:bg-[#0b8043] text-white px-4 py-2 rounded-lg font-bold text-[13px] transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/30/Google_Sheets_logo_%282014-2020%29.svg" alt="Sheets" className="w-4 h-4 brightness-0 invert" />
            )}
            {hasGoogleSheet ? 'Abrir en Sheets' : 'Vincular a Sheets'}
          </button>
        </div>
      </div>

      <div className="flex-1 w-full relative" style={{ minHeight: '600px' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
          <Workbook ref={workbookRef} data={sheetSettings} lang="es" key={JSON.stringify(sheetSettings.length + allItems.length)} />
        </div>
      </div>
    </div>
  );
};

export default OportunidadesReporte;
