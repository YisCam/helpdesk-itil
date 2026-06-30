import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

function TicketDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const puedeEditar = usuario?.rol === 'admin' || usuario?.rol === 'tecnico';
  const puedeAsignar = usuario?.rol === 'admin';

  const [ticket, setTicket] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({});
  const [resolucion, setResolucion] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const cargarTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
      setForm({
        titulo: res.data.titulo,
        descripcion: res.data.descripcion || '',
        categoria: res.data.categoria,
        prioridad: res.data.prioridad,
        etiquetas: res.data.etiquetas || '',
      });
    } catch (err) {
      console.error('Error al cargar ticket:', err);
    }
  };

  useEffect(() => {
    cargarTicket();
  }, [id]);

  const handleGuardar = async () => {
    setError('');
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, form);
      setEditando(false);
      cargarTicket();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (estado) => {
    try {
      await api.patch(`/tickets/${id}/estado`, { estado });
      cargarTicket();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cambiar estado');
    }
  };

  const handleResolver = async () => {
    if (!resolucion) {
      setError('Escribe la resolución antes de resolver el ticket');
      return;
    }
    try {
      await api.patch(`/tickets/${id}/resolver`, { resolucion });
      setResolucion('');
      cargarTicket();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al resolver ticket');
    }
  };

  if (!ticket) {
    return (
      <div className="flex min-h-screen bg-gray-50 font-sans">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header titulo={`Ticket ${ticket.codigo}`} />

        <div className="p-6 max-w-4xl">
          <button
            onClick={() => navigate('/tickets')}
            className="text-sm text-gray-500 hover:text-gray-700 mb-4 bg-transparent border-none cursor-pointer"
          >
            ← Volver a tickets
          </button>

          {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">{ticket.codigo}</p>
                {editando ? (
                  <input
                    className="text-xl font-medium text-[#1E3A5F] border border-gray-200 rounded-lg px-3 py-1 w-full"
                    value={form.titulo}
                    onChange={e => setForm({ ...form, titulo: e.target.value })}
                  />
                ) : (
                  <h2 className="text-xl font-medium text-[#1E3A5F]">{ticket.titulo}</h2>
                )}
              </div>
              <div className="flex gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${badgePrioridad[ticket.prioridad]}`}>
                  {ticket.prioridad}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${badgeEstado[ticket.estado]}`}>
                  {ticket.estado}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm mb-4 text-gray-600">
              <p><span className="text-gray-400">Categoría:</span> {ticket.categoria}</p>
              <p><span className="text-gray-400">Creado por:</span> {ticket.creado_por_nombre}</p>
              <p><span className="text-gray-400">Asignado a:</span> {ticket.asignado_a_nombre || 'Sin asignar'}</p>
              <p><span className="text-gray-400">Creado:</span> {new Date(ticket.creado_en).toLocaleString('es-PE')}</p>
            </div>

            <div className="mb-2">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Descripción</p>
              {editando ? (
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                />
              ) : (
                <p className="text-sm text-gray-700">{ticket.descripcion || 'Sin descripción'}</p>
              )}
            </div>

            {editando && (
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Categoría</p>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.categoria}
                    onChange={e => setForm({ ...form, categoria: e.target.value })}
                  >
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Prioridad</p>
                  <select
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                    value={form.prioridad}
                    onChange={e => setForm({ ...form, prioridad: e.target.value })}
                  >
                    {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            )}

            {puedeEditar && (
              <div className="flex gap-2 mt-5">
                {editando ? (
                  <>
                    <button
                      onClick={handleGuardar}
                      disabled={loading}
                      className="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7e]"
                    >
                      {loading ? 'Guardando...' : 'Guardar cambios'}
                    </button>
                    <button
                      onClick={() => setEditando(false)}
                      className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg"
                    >
                      Cancelar
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setEditando(true)}
                    className="px-4 py-2 text-sm text-[#1E3A5F] border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    ✎ Editar ticket
                  </button>
                )}
              </div>
            )}
          </div>

          {puedeEditar && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 mb-4">
              <p className="text-sm font-medium text-[#1E3A5F] mb-3">Cambiar estado</p>
              <div className="flex gap-2">
                {ESTADOS.map(e => (
                  <button
                    key={e}
                    onClick={() => handleCambiarEstado(e)}
                    className={`px-3 py-1.5 text-xs rounded-lg border transition-colors
                      ${ticket.estado === e
                        ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          {puedeEditar && ticket.estado !== 'Resuelto' && ticket.estado !== 'Cerrado' && (
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <p className="text-sm font-medium text-[#1E3A5F] mb-3">Resolver ticket</p>
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-3"
                rows={3}
                placeholder="Describe cómo se resolvió el problema..."
                value={resolucion}
                onChange={e => setResolucion(e.target.value)}
              />
              <button
                onClick={handleResolver}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✓ Marcar como resuelto
              </button>
            </div>
          )}

          {ticket.resolucion && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-6 mt-4">
              <p className="text-sm font-medium text-green-800 mb-2">Resolución</p>
              <p className="text-sm text-green-700">{ticket.resolucion}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TicketDetalle;