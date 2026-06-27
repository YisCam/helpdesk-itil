import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';

const CATEGORIAS = ['Hardware', 'Software', 'Red', 'Accesos', 'Otro'];
const PRIORIDADES = ['Critica', 'Alta', 'Media', 'Baja'];
const ESTADOS = ['Abierto', 'En Progreso', 'Resuelto', 'Cerrado'];

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

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [filtros, setFiltros] = useState({ estado: '', prioridad: '', busqueda: '' });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ titulo: '', descripcion: '', categoria: 'Software', prioridad: 'Media', etiquetas: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cargarTickets = async () => {
    try {
      const res = await api.get('/tickets');
      setTickets(res.data);
    } catch (err) {
      console.error('Error al cargar tickets:', err);
    }
  };

  useEffect(() => {
    cargarTickets();
  }, []);

  const ticketsFiltrados = tickets.filter(t => {
    const matchEstado = filtros.estado ? t.estado === filtros.estado : true;
    const matchPrioridad = filtros.prioridad ? t.prioridad === filtros.prioridad : true;
    const matchBusqueda = filtros.busqueda
      ? t.titulo.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        t.codigo.toLowerCase().includes(filtros.busqueda.toLowerCase())
      : true;
    return matchEstado && matchPrioridad && matchBusqueda;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/tickets', form);
      setModal(false);
      setForm({ titulo: '', descripcion: '', categoria: 'Software', prioridad: 'Media', etiquetas: '' });
      cargarTickets();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header titulo="Tickets" />

        <div className="p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] w-56"
                placeholder="Buscar por título o código..."
                value={filtros.busqueda}
                onChange={e => setFiltros({ ...filtros, busqueda: e.target.value })}
              />
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] text-gray-600"
                value={filtros.estado}
                onChange={e => setFiltros({ ...filtros, estado: e.target.value })}
              >
                <option value="">Todos los estados</option>
                {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] text-gray-600"
                value={filtros.prioridad}
                onChange={e => setFiltros({ ...filtros, prioridad: e.target.value })}
              >
                <option value="">Todas las prioridades</option>
                {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <button
              onClick={() => setModal(true)}
              className="bg-[#1E3A5F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a4f7e] transition-colors"
            >
              + Nuevo ticket
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Código</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Título</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Categoría</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Prioridad</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Estado</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Asignado a</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Creado</th>
                </tr>
              </thead>
              <tbody>
                {ticketsFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-sm text-gray-400 py-10">No hay tickets</td>
                  </tr>
                ) : (
                  ticketsFiltrados.map(t => (
                    <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="text-xs text-gray-400 py-3 px-4">{t.codigo}</td>
                      <td className="text-sm text-gray-700 py-3 px-4 max-w-xs truncate">{t.titulo}</td>
                      <td className="text-sm text-gray-600 py-3 px-4">{t.categoria}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgePrioridad[t.prioridad]}`}>
                          {t.prioridad}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${badgeEstado[t.estado]}`}>
                          {t.estado}
                        </span>
                      </td>
                      <td className="text-sm text-gray-600 py-3 px-4">{t.asignado_a_nombre || '—'}</td>
                      <td className="text-xs text-gray-400 py-3 px-4">
                        {new Date(t.creado_en).toLocaleDateString('es-PE')}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-base font-medium text-[#1E3A5F] mb-4">Nuevo ticket</h2>

            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Título</label>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9]"
                  placeholder="Describe el problema brevemente"
                  value={form.titulo}
                  onChange={e => setForm({ ...form, titulo: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Descripción</label>
                <textarea
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] resize-none"
                  rows={3}
                  placeholder="Detalla el problema..."
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Categoría</label>
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] text-gray-600"
                    value={form.categoria}
                    onChange={e => setForm({ ...form, categoria: e.target.value })}
                  >
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Prioridad</label>
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] text-gray-600"
                    value={form.prioridad}
                    onChange={e => setForm({ ...form, prioridad: e.target.value })}
                  >
                    {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Etiquetas</label>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9]"
                  placeholder="ej: red, urgente, servidor"
                  value={form.etiquetas}
                  onChange={e => setForm({ ...form, etiquetas: e.target.value })}
                />
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setModal(false)}
                  className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7e] disabled:opacity-60"
                >
                  {loading ? 'Creando...' : 'Crear ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;