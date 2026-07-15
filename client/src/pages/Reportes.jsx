import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { FileDown, FileSpreadsheet } from 'lucide-react';

const colorEstado = {
  Abierto: 'bg-red-500',
  'En Progreso': 'bg-amber-500',
  Resuelto: 'bg-green-500',
  Cerrado: 'bg-gray-400',
};

const colorPrioridad = {
  Critica: 'bg-red-500',
  Alta: 'bg-amber-500',
  Media: 'bg-blue-500',
  Baja: 'bg-gray-400',
};

const colorCategoria = {
  Hardware: 'bg-purple-500',
  Software: 'bg-blue-500',
  Red: 'bg-cyan-500',
  Accesos: 'bg-amber-500',
  Otro: 'bg-gray-400',
};

function BarraHorizontal({ label, valor, total, color }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-gray-600 w-28 flex-shrink-0">{label}</span>
      <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-sm font-medium text-gray-700 w-8 text-right">{valor}</span>
    </div>
  );
}

function Reportes() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const hoy = new Date().toISOString().split('T')[0];
  const hace30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [reporte, setReporte] = useState(null);
  const [loading, setLoading] = useState(true);
  const [desde, setDesde] = useState(hace30);
  const [hasta, setHasta] = useState(hoy);

  const cargarReporte = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/reportes?desde=${desde}&hasta=${hasta}`);
      setReporte(res.data);
    } catch (err) {
      console.error('Error al cargar reporte:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const exportarPDF = () => {
    const doc = new jsPDF();
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    const azulOscuro = [30, 58, 95];
    const azulClaro = [74, 144, 217];
    const grisClaro = [245, 247, 250];
    const grisTexto = [100, 116, 139];

    // ── Encabezado ──────────────────────────────
    doc.setFillColor(...azulOscuro);
    doc.rect(0, 0, pageW, 38, 'F');

    doc.setFillColor(...azulClaro);
    doc.rect(0, 38, pageW, 3, 'F');

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('AUROGAL', 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Sistema de Gestión HelpDesk ITIL', 14, 27);

    doc.setFontSize(9);
    doc.setTextColor(180, 200, 220);
    doc.text(`Generado: ${new Date().toLocaleString('es-PE')}`, pageW - 14, 18, { align: 'right' });
    doc.text(`Período: ${desde} al ${hasta}`, pageW - 14, 27, { align: 'right' });

    // ── Título reporte ───────────────────────────
    doc.setFontSize(14);
    doc.setTextColor(...azulOscuro);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte de Actividad', 14, 54);

    doc.setDrawColor(...azulClaro);
    doc.setLineWidth(0.5);
    doc.line(14, 57, pageW - 14, 57);

    let y = 66;

    const seccion = (titulo) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...azulOscuro);
        doc.text(titulo, 14, y);
        y += 5;
    };

    const tabla = (head, body) => {
        autoTable(doc, {
        startY: y,
        head: [head],
        body,
        styles: {
            fontSize: 9,
            cellPadding: 4,
            textColor: [30, 41, 59],
        },
        headStyles: {
            fillColor: azulOscuro,
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            fontSize: 9,
        },
        alternateRowStyles: {
            fillColor: grisClaro,
        },
        tableLineColor: [226, 232, 240],
        tableLineWidth: 0.3,
        margin: { left: 14, right: 14 },
        });
        y = doc.lastAutoTable.finalY + 12;
    };

    // Tickets por estado
    seccion('Tickets por estado');
    tabla(
        ['Estado', 'Total', '% del total'],
        reporte.porEstado.map(e => [
        e.estado,
        e.total,
        `${totalEstado > 0 ? Math.round((e.total / totalEstado) * 100) : 0}%`
        ])
    );

    // Tickets por prioridad
    seccion('Tickets por prioridad');
    tabla(
        ['Prioridad', 'Total', '% del total'],
        reporte.porPrioridad.map(p => [
        p.prioridad,
        p.total,
        `${totalPrioridad > 0 ? Math.round((p.total / totalPrioridad) * 100) : 0}%`
        ])
    );

    // Tickets por categoría
    seccion('Tickets por categoría');
    tabla(
        ['Categoría', 'Total', '% del total'],
        reporte.porCategoria.map(c => [
        c.categoria,
        c.total,
        `${totalCategoria > 0 ? Math.round((c.total / totalCategoria) * 100) : 0}%`
        ])
    );

    // CSAT
    if (reporte.csat?.promedio) {
        seccion('Satisfacción del cliente (CSAT)');
        tabla(
        ['Puntuación promedio', 'Total calificaciones', 'Valoración'],
        [[
            `${reporte.csat.promedio} / 5`,
            reporte.csat.total_respuestas,
            reporte.csat.promedio >= 4 ? 'Excelente' :
            reporte.csat.promedio >= 3 ? 'Bueno' : 'Por mejorar'
        ]]
        );
    }

    // Rendimiento técnicos
    if (reporte.tecnicos?.length > 0) {
        seccion('Rendimiento por técnico');
        tabla(
        ['Técnico', 'Asignados', 'Resueltos', 'SLA cumplido', '1ra respuesta'],
        reporte.tecnicos.map(t => [
            t.tecnico,
            t.total_asignados,
            t.resueltos,
            `${t.sla_cumplido_pct ?? 0}%`,
            t.avg_primera_respuesta_min ? `${t.avg_primera_respuesta_min} min` : '—'
        ])
        );
    }

    // ── Pie de página ────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(...grisClaro);
        doc.rect(0, pageH - 14, pageW, 14, 'F');
        doc.setFontSize(8);
        doc.setTextColor(...grisTexto);
        doc.setFont('helvetica', 'normal');
        doc.text('Aurogal — Sistema HelpDesk ITIL', 14, pageH - 5);
        doc.text(`Página ${i} de ${totalPages}`, pageW - 14, pageH - 5, { align: 'right' });
    }

    doc.save(`reporte-aurogal-${desde}-${hasta}.pdf`);
    };
  const exportarExcel = () => {
    const wb = XLSX.utils.book_new();

    const wsEstado = XLSX.utils.json_to_sheet(reporte.porEstado.map(e => ({ Estado: e.estado, Total: e.total })));
    XLSX.utils.book_append_sheet(wb, wsEstado, 'Por Estado');

    const wsPrioridad = XLSX.utils.json_to_sheet(reporte.porPrioridad.map(p => ({ Prioridad: p.prioridad, Total: p.total })));
    XLSX.utils.book_append_sheet(wb, wsPrioridad, 'Por Prioridad');

    const wsCategoria = XLSX.utils.json_to_sheet(reporte.porCategoria.map(c => ({ Categoría: c.categoria, Total: c.total })));
    XLSX.utils.book_append_sheet(wb, wsCategoria, 'Por Categoría');

    if (reporte.csat?.promedio) {
      const wsCsat = XLSX.utils.json_to_sheet([{
        'Promedio': reporte.csat.promedio,
        'Total respuestas': reporte.csat.total_respuestas
      }]);
      XLSX.utils.book_append_sheet(wb, wsCsat, 'CSAT');
    }

    if (reporte.tecnicos?.length > 0) {
      const wsTecnicos = XLSX.utils.json_to_sheet(reporte.tecnicos.map(t => ({
        'Técnico': t.tecnico,
        'Asignados': t.total_asignados,
        'Resueltos': t.resueltos,
        'SLA cumplido %': `${t.sla_cumplido_pct ?? 0}%`,
        '1ra respuesta (min)': t.avg_primera_respuesta_min ?? '—'
      })));
      XLSX.utils.book_append_sheet(wb, wsTecnicos, 'Técnicos');
    }

    XLSX.writeFile(wb, `reporte-helpdesk-${desde}-${hasta}.xlsx`);
  };

  const totalEstado = reporte?.porEstado.reduce((a, b) => a + b.total, 0) || 0;
  const totalPrioridad = reporte?.porPrioridad.reduce((a, b) => a + b.total, 0) || 0;
  const totalCategoria = reporte?.porCategoria.reduce((a, b) => a + b.total, 0) || 0;

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">

      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header titulo="Reportes" />

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* Filtro fechas + botones exportar */}
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-4 flex-wrap">
            <p className="text-sm font-medium text-gray-600">Período:</p>
            <div className="flex items-center gap-2">
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4A90D9]"
                value={desde}
                onChange={e => setDesde(e.target.value)}
              />
              <span className="text-gray-400">—</span>
              <input
                type="date"
                className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm outline-none focus:border-[#4A90D9]"
                value={hasta}
                onChange={e => setHasta(e.target.value)}
              />
            </div>
            <button
              onClick={cargarReporte}
              className="px-4 py-1.5 text-sm bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7e]"
            >
              Aplicar
            </button>
            <div className="ml-auto flex gap-2">
              <button
                onClick={exportarPDF}
                disabled={!reporte}
                className="flex items-center gap-2 px-4 py-1.5 text-sm border border-red-200 text-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                <FileDown size={16} />
                PDF
              </button>
              <button
                onClick={exportarExcel}
                disabled={!reporte}
                className="flex items-center gap-2 px-4 py-1.5 text-sm border border-green-200 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50"
              >
                <FileSpreadsheet size={16} />
                Excel
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">Cargando...</div>
          ) : (
            <>
              {/* Fila 1: Estado + Prioridad */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-[#1E3A5F] mb-4">Tickets por estado</p>
                  <div className="flex flex-col gap-3">
                    {reporte?.porEstado.length === 0 ? (
                      <p className="text-sm text-gray-400">Sin datos</p>
                    ) : (
                      reporte?.porEstado.map(e => (
                        <BarraHorizontal key={e.estado} label={e.estado} valor={e.total} total={totalEstado} color={colorEstado[e.estado]} />
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Total: {totalEstado} tickets</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-[#1E3A5F] mb-4">Tickets por prioridad</p>
                  <div className="flex flex-col gap-3">
                    {reporte?.porPrioridad.length === 0 ? (
                      <p className="text-sm text-gray-400">Sin datos</p>
                    ) : (
                      reporte?.porPrioridad.map(p => (
                        <BarraHorizontal key={p.prioridad} label={p.prioridad} valor={p.total} total={totalPrioridad} color={colorPrioridad[p.prioridad]} />
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Total: {totalPrioridad} tickets</p>
                </div>
              </div>

              {/* Fila 2: Categoría + CSAT */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-[#1E3A5F] mb-4">Tickets por categoría</p>
                  <div className="flex flex-col gap-3">
                    {reporte?.porCategoria.length === 0 ? (
                      <p className="text-sm text-gray-400">Sin datos</p>
                    ) : (
                      reporte?.porCategoria.map(c => (
                        <BarraHorizontal key={c.categoria} label={c.categoria} valor={c.total} total={totalCategoria} color={colorCategoria[c.categoria]} />
                      ))
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-3">Total: {totalCategoria} tickets</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-[#1E3A5F] mb-4">Satisfacción del cliente (CSAT)</p>
                  {!reporte?.csat?.promedio ? (
                    <p className="text-sm text-gray-400">Sin calificaciones aún</p>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-4 gap-2">
                      <p className="text-5xl font-bold text-[#1E3A5F]">{reporte.csat.promedio}</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} className={`text-2xl ${s <= Math.round(reporte.csat.promedio) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-400">Basado en {reporte.csat.total_respuestas} calificaciones</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Rendimiento técnicos */}
              {(usuario?.rol === 'admin' || usuario?.rol === 'superadmin') && (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <p className="text-sm font-semibold text-[#1E3A5F] mb-4">Rendimiento por técnico</p>
                  {reporte?.tecnicos.length === 0 ? (
                    <p className="text-sm text-gray-400">Sin datos</p>
                  ) : (
                    <table className="w-full">
                      <thead className="border-b border-gray-100">
                        <tr>
                          <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">Técnico</th>
                          <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">Asignados</th>
                          <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">Resueltos</th>
                          <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">SLA cumplido</th>
                          <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">1ra respuesta</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporte.tecnicos.map(t => (
                          <tr key={t.tecnico} className="border-b border-gray-50 hover:bg-gray-50">
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-xs font-bold">
                                  {t.tecnico?.charAt(0)}
                                </div>
                                <span className="text-sm text-gray-700">{t.tecnico}</span>
                              </div>
                            </td>
                            <td className="text-sm text-gray-600 py-3 px-2">{t.total_asignados}</td>
                            <td className="text-sm text-gray-600 py-3 px-2">{t.resueltos}</td>
                            <td className="py-3 px-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                t.sla_cumplido_pct >= 80 ? 'bg-green-50 text-green-700' :
                                t.sla_cumplido_pct >= 50 ? 'bg-amber-50 text-amber-700' :
                                'bg-red-50 text-red-700'
                              }`}>
                                {t.sla_cumplido_pct ?? 0}%
                              </span>
                            </td>
                            <td className="text-sm text-gray-600 py-3 px-2">
                              {t.avg_primera_respuesta_min ? `${t.avg_primera_respuesta_min} min` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reportes;