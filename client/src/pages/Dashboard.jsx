import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';

const badgePrioridad = {
  Critica: 'bg-red-50 text-red-700',
  Alta: 'bg-amber-50 text-amber-700',
  Media: 'bg-blue-50 text-blue-700',
  Baja: 'bg-gray-100 text-gray-600',
};

const badgeEstado = {
  Abierto: 'bg-red-50 text-red-700',
  'En Progreso': 'bg-amber-50 text-amber-700',
  Resuelto: 'bg-green-50 text-green-700',
  Cerrado: 'bg-gray-100 text-gray-600',
};

const PRIORIDADES_ORDEN = ['Critica', 'Alta', 'Media', 'Baja'];

function Dashboard() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const [metricas, setMetricas] = useState(null);
  const [ticketsRecientes, setTicketsRecientes] = useState([]);
  const [slaPrioridad, setSlaPrioridad] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [mRes, tRes, sRes] = await Promise.all([
          api.get('/dashboard/metricas'),
          api.get('/dashboard/tickets-recientes'),
          api.get('/dashboard/sla-prioridad'),
        ]);
        setMetricas(mRes.data);
        setTicketsRecientes(tRes.data);
        setSlaPrioridad(sRes.data);
      } catch (err) {
        console.error('Error al cargar dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const getSLAPorPrioridad = (prioridad) => {
    const item = slaPrioridad.find(s => s.prioridad === prioridad);
    return item ? item.porcentaje : null;
  };

  const colorBarra = {
    Critica: 'bg-red-500',
    Alta: 'bg-amber-500',
    Media: 'bg-blue-500',
    Baja: 'bg-green-500',
  };

  if (loading) return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header titulo="Dashboard" />

        <div className="p-6 flex flex-col gap-6">

          {/* Saludo */}
          <div>
            <h2 className="text-lg font-medium text-[#1E3A5F]">Bienvenido, {usuario?.nombre} 👋</h2>
            <p className="text-sm text-gray-400">Aquí tienes un resumen de la actividad actual.</p>
          </div>

          {/* Métricas */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Tickets abiertos</p>
              <p className="text-3xl font-medium text-[#1E3A5F]">{metricas?.abiertos ?? 0}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">En progreso</p>
              <p className="text-3xl font-medium text-[#1E3A5F]">{metricas?.enProgreso ?? 0}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Resueltos hoy</p>
              <p className="text-3xl font-medium text-[#1E3A5F]">{metricas?.resueltosHoy ?? 0}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">SLA cumplido</p>
              <p className="text-3xl font-medium text-[#1E3A5F]">{metricas?.slaCumplido ?? 0}%</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Tickets recientes */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-[#1E3A5F]">Tickets recientes</p>
                <button onClick={() => navigate('/tickets')} className="text-xs text-[#4A90D9] hover:underline bg-transparent border-none cursor-pointer">
                  Ver todos →
                </button>
              </div>
              {ticketsRecientes.length === 0 ? (
                <p className="text-sm text-gray-400">No hay tickets aún.</p>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">Código</th>
                      <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">Título</th>
                      <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">Prioridad</th>
                      <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ticketsRecientes.map(t => (
                      <tr
                        key={t.id}
                        onClick={() => navigate(`/tickets/${t.id}`)}
                        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="text-xs text-gray-400 py-3 px-2">{t.codigo}</td>
                        <td className="text-sm text-gray-700 py-3 px-2 max-w-xs truncate">{t.titulo}</td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgePrioridad[t.prioridad]}`}>
                            {t.prioridad}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeEstado[t.estado]}`}>
                            {t.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* SLA por prioridad */}
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-sm font-medium text-[#1E3A5F] mb-4">SLA por prioridad</p>
              {slaPrioridad.length === 0 ? (
                <p className="text-sm text-gray-400">Sin datos de SLA aún.</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {PRIORIDADES_ORDEN.map(p => {
                    const pct = getSLAPorPrioridad(p);
                    if (pct === null) return null;
                    return (
                      <div key={p}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">{p}</span>
                          <span className={`font-medium ${pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                            {pct}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${colorBarra[p]}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;