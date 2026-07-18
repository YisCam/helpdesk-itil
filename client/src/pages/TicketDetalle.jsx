import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';
import ComentariosList, { ComentariosInput } from '../components/ComentariosList';
import HistorialList from '../components/HistorialList';
import Dropdown from '../components/Dropdown';
import DropdownBusqueda from '../components/DropdownBusqueda';
import CSATWidget from '../components/CSATWidget';

const CATEGORIAS = ['Hardware', 'Software', 'Red', 'Accesos', 'Otro'];
const PRIORIDADES = ['Critica', 'Alta', 'Media', 'Baja'];
const ESTADOS = ['Abierto', 'En Progreso', 'Resuelto', 'Cerrado'];

const colorEstado = {
  Abierto: 'bg-red-100 text-red-700',
  'En Progreso': 'bg-amber-100 text-amber-700',
  Resuelto: 'bg-green-100 text-green-700',
  Cerrado: 'bg-gray-100 text-gray-600',
};

const colorPrioridadMap = {
  Critica: 'bg-red-50 text-red-700',
  Alta: 'bg-amber-50 text-amber-700',
  Media: 'bg-blue-50 text-blue-700',
  Baja: 'bg-gray-100 text-gray-600',
};

function DetalleCampo({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5 py-3 border-b border-gray-100 last:border-0">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      <div>{children}</div>
    </div>
  );
}

function TicketDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const slug = usuario?.slug || 'aurogal';
  const puedeEditar = usuario?.rol === 'admin' || usuario?.rol === 'tecnico' || usuario?.rol === 'superadmin';
  const puedeAsignar = usuario?.rol === 'admin' || usuario?.rol === 'superadmin';

  const [ticket, setTicket] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [slaDetalle, setSlaDetalle] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [tituloEditado, setTituloEditado] = useState(false);
  const [descripcionEditada, setDescripcionEditada] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalEstado, setModalEstado] = useState(null);
  const [comentarioEstado, setComentarioEstado] = useState('');
  const [tabActivo, setTabActivo] = useState('comentarios');
  const [dropdownEstado, setDropdownEstado] = useState(false);
  const [refreshComentarios, setRefreshComentarios] = useState(0);
  const dropdownRef = useRef(null);

  const cargarTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
      setTitulo(res.data.titulo);
      setDescripcion(res.data.descripcion || '');
      setTituloEditado(false);
      setDescripcionEditada(false);
    } catch (err) { console.error(err); }
  };

  const cargarHistorial = async () => {
    try {
      const res = await api.get(`/tickets/${id}/historial`);
      setHistorial(res.data);
    } catch (err) { console.error(err); }
  };

  const cargarTecnicos = async () => {
    try {
      const res = await api.get('/usuarios');
      setTecnicos(res.data.filter(u => u.rol === 'tecnico' && u.activo));
    } catch (err) { console.error(err); }
  };

  const cargarSLADetalle = async () => {
    try {
      const res = await api.get(`/tickets/${id}/sla-detalle`);
      setSlaDetalle(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    cargarTicket();
    cargarHistorial();
    if (puedeAsignar) cargarTecnicos();
    cargarSLADetalle();
  }, [id]);

  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownEstado(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleGuardar = async () => {
    setLoading(true);
    try {
      await api.put(`/tickets/${id}`, { titulo, descripcion, categoria: ticket.categoria, prioridad: ticket.prioridad, etiquetas: ticket.etiquetas });
      cargarTicket();
    } catch (err) { setError('Error al guardar'); }
    finally { setLoading(false); }
  };

  const handleCambiarCampo = async (campo, valor) => {
    try {
      await api.put(`/tickets/${id}`, { titulo: ticket.titulo, descripcion: ticket.descripcion, categoria: ticket.categoria, prioridad: ticket.prioridad, etiquetas: ticket.etiquetas, [campo]: valor });
      cargarTicket();
    } catch (err) { setError('Error al actualizar'); }
  };

  const handleAsignar = async (asignado_a) => {
    try {
      await api.patch(`/tickets/${id}/asignar`, { asignado_a });
      cargarTicket(); cargarHistorial(); cargarSLADetalle();
    } catch (err) { setError('Error al asignar'); }
  };

  const handleCambiarEstado = async () => {
    try {
      await api.patch(`/tickets/${id}/estado`, { estado: modalEstado, comentario: comentarioEstado });
      setModalEstado(null); setComentarioEstado('');
      cargarTicket(); cargarHistorial(); cargarSLADetalle();
      setRefreshComentarios(r => r + 1);
    } catch (err) { setError('Error al cambiar estado'); }
  };

  if (!ticket) return (
    <div className="flex min-h-screen bg-white font-sans">
      <Sidebar />
      <div className="flex-1 flex items-center justify-center text-gray-400">Cargando...</div>
    </div>
  );

  return (
    <div className="flex h-screen font-sans bg-white overflow-hidden">

      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">

        <div className="flex-shrink-0">
          <Header titulo="" />
        </div>

        <div className="flex flex-1 overflow-hidden">

          {/* Columna central */}
          <div className="flex-1 flex flex-col overflow-hidden">

            {/* FIJO: breadcrumb + título + descripción */}
            <div className="px-10 pt-6 pb-4 border-b border-gray-100 bg-white flex-shrink-0">
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <button onClick={() => navigate(`/${slug}/tickets`)} className="hover:text-gray-600 bg-transparent border-none cursor-pointer p-0">
                  Tickets
                </button>
                <span>/</span>
                <span className="text-gray-600 font-medium">{ticket.codigo}</span>
              </div>

              {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-3">{error}</div>}

              <input
                className={`text-3xl font-bold text-gray-900 w-full outline-none rounded-lg px-2 py-1 mb-3 bg-transparent transition-colors
                  ${puedeEditar ? 'hover:bg-gray-100 focus:bg-gray-100 cursor-text' : 'cursor-default'}`}
                value={titulo}
                onChange={e => { setTitulo(e.target.value); setTituloEditado(true); }}
                readOnly={!puedeEditar}
              />

              <div className="mb-2">
                <p className="text-sm font-semibold text-gray-500 mb-1">Descripción</p>
                <textarea
                  className={`w-full text-base text-gray-700 outline-none rounded-lg px-2 py-1 resize-none bg-transparent transition-colors
                    ${puedeEditar ? 'hover:bg-gray-100 focus:bg-gray-100 cursor-text' : 'cursor-default'}`}
                  rows={3}
                  placeholder={puedeEditar ? 'Agrega una descripción...' : 'Sin descripción'}
                  value={descripcion}
                  onChange={e => { setDescripcion(e.target.value); setDescripcionEditada(true); }}
                  readOnly={!puedeEditar}
                />
              </div>

              {(tituloEditado || descripcionEditada) && (
                <div className="flex gap-2 mt-2">
                  <button onClick={handleGuardar} disabled={loading} className="px-5 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7e] disabled:opacity-60">
                    {loading ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button onClick={() => { setTitulo(ticket.titulo); setDescripcion(ticket.descripcion || ''); setTituloEditado(false); setDescripcionEditada(false); }} className="px-5 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg">
                    Cancelar
                  </button>
                </div>
              )}
            </div>

            {/* FIJO: tabs */}
            <div className="px-10 pt-4 pb-0 bg-white flex-shrink-0">
              <p className="text-base font-semibold text-gray-700 mb-3">Actividad</p>
              <div className="flex gap-5 border-b border-gray-200">
                <button onClick={() => setTabActivo('comentarios')} className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${tabActivo === 'comentarios' ? 'text-[#1E3A5F] border-[#1E3A5F]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
                  Comentarios
                </button>
                <button onClick={() => setTabActivo('historial')} className={`pb-2 text-sm font-semibold border-b-2 transition-colors ${tabActivo === 'historial' ? 'text-[#1E3A5F] border-[#1E3A5F]' : 'text-gray-400 border-transparent hover:text-gray-600'}`}>
                  Historial
                </button>
              </div>
            </div>

            {/* FIJO: input comentario */}
            {tabActivo === 'comentarios' && (
              <div className="flex-shrink-0 bg-white">
                <ComentariosInput
                  ticketId={id}
                  onNuevoComentario={() => { setRefreshComentarios(r => r + 1); cargarTicket(); cargarSLADetalle(); }}
                />
              </div>
            )}

            {/* SCROLL: lista */}
            <div className="flex-1 overflow-y-auto px-10 py-4">
              {tabActivo === 'historial' && <HistorialList historial={historial} />}
              {tabActivo === 'comentarios' && (
                <>
                  <ComentariosList
                    key={refreshComentarios}
                    ticketId={id}
                    onNuevoComentario={() => setRefreshComentarios(r => r + 1)}
                  />
                  <CSATWidget
                    ticketId={id}
                    estadoTicket={ticket?.estado}
                    creadoPor={ticket?.creado_por}
                  />
                </>
              )}
            </div>
          </div>

          {/* Panel derecho fijo */}
          <div className="w-[420px] border-l border-gray-200 bg-white flex-shrink-0 flex flex-col overflow-hidden">

            {/* Card estado */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0" ref={dropdownRef}>
              {puedeEditar && ticket.estado !== 'Cerrado' ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownEstado(!dropdownEstado)}
                    className={`flex items-center justify-between gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer border-none w-full ${colorEstado[ticket.estado]}`}
                  >
                    {ticket.estado} <span>▾</span>
                  </button>
                  {dropdownEstado && (
                    <div className="absolute top-11 left-0 bg-white border border-gray-200 rounded-xl shadow-xl z-20 w-full">
                      <p className="text-xs text-gray-400 px-4 py-2 border-b border-gray-100 uppercase tracking-wide">Cambiar a</p>
                      {ESTADOS.filter(e => e !== ticket.estado).map(e => (
                        <button
                          key={e}
                          onClick={() => { setDropdownEstado(false); setModalEstado(e); }}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-sm text-gray-700 border-none bg-transparent cursor-pointer"
                        >
                          <span>{e}</span>
                          <span className={`text-xs px-2 py-1 rounded-full font-semibold ${colorEstado[e]}`}>{e}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <span className={`inline-block px-4 py-2 rounded-lg text-sm font-semibold w-full text-center ${colorEstado[ticket.estado]}`}>
                  {ticket.estado}
                </span>
              )}
            </div>

            {/* Card SLA */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">SLAs</p>
              <div className="flex flex-col gap-4">

                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${slaDetalle?.primera_respuesta_en ? 'bg-green-500' : 'bg-amber-400'}`} />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Primera respuesta</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {slaDetalle?.primera_respuesta_en ? (
                        `✓ ${Math.round((new Date(slaDetalle.primera_respuesta_en) - new Date(ticket.creado_en)) / 60000)} min después de creado`
                      ) : (
                        ticket.sla_limite
                          ? `Vence ${new Date(ticket.sla_limite).toLocaleString('es-PE')}`
                          : 'Sin respuesta aún'
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0
                    ${ticket.sla_cumplido === 1 ? 'bg-green-500' :
                      ticket.sla_cumplido === 0 ? 'bg-red-500' : 'bg-amber-400'}`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Tiempo de resolución</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {ticket.sla_cumplido === 1 ? '✓ Resuelto dentro del plazo' :
                       ticket.sla_cumplido === 0 ? '✗ Fuera del plazo' :
                       ticket.sla_limite
                       ? `Vence ${new Date(ticket.sla_limite).toLocaleString('es-PE')}`
                       : 'Sin límite definido'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Detalles</p>

              <DetalleCampo label="Prioridad">
                <Dropdown
                  valor={ticket.prioridad}
                  opciones={PRIORIDADES}
                  onChange={v => handleCambiarCampo('prioridad', v)}
                  colorMap={colorPrioridadMap}
                  disabled={!puedeEditar}
                />
              </DetalleCampo>

              <DetalleCampo label="Categoría">
                <Dropdown
                  valor={ticket.categoria}
                  opciones={CATEGORIAS}
                  onChange={v => handleCambiarCampo('categoria', v)}
                  disabled={!puedeEditar}
                />
              </DetalleCampo>

              <DetalleCampo label="Asignado a">
                {puedeAsignar ? (
                  <DropdownBusqueda
                    valor={ticket.asignado_a || ''}
                    opciones={tecnicos.map(t => ({ value: t.id, label: t.nombre }))}
                    onChange={v => handleAsignar(v)}
                    placeholder="Sin asignar"
                    disabled={false}
                  />
                ) : (
                  <div className="flex items-center gap-2">
                    {ticket.asignado_a_nombre ? (
                      <>
                        <div className="w-6 h-6 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-xs font-bold">
                          {ticket.asignado_a_nombre?.charAt(0)}
                        </div>
                        <span className="text-sm text-gray-700">{ticket.asignado_a_nombre}</span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">Sin asignar</span>
                    )}
                  </div>
                )}
              </DetalleCampo>

              <DetalleCampo label="Creado por">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-xs font-bold">
                    {ticket.creado_por_nombre?.charAt(0)}
                  </div>
                  <span className="text-sm text-gray-700">{ticket.creado_por_nombre}</span>
                </div>
              </DetalleCampo>

              <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-1">
                <p className="text-xs text-gray-400">Creado {new Date(ticket.creado_en).toLocaleDateString('es-PE')}</p>
                {ticket.actualizado_en && (
                  <p className="text-xs text-gray-400">Actualizado {new Date(ticket.actualizado_en).toLocaleDateString('es-PE')}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal cambiar estado */}
      {modalEstado && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-base font-semibold text-[#1E3A5F] mb-1">Cambiar estado</h2>
            <p className="text-sm text-gray-400 mb-4">
              De <span className="font-semibold text-gray-600">{ticket.estado}</span> a <span className="font-semibold text-gray-600">{modalEstado}</span>
            </p>
            <div className="flex flex-col gap-1 mb-4">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Comentario (opcional)</label>
              <textarea
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] resize-none"
                rows={3}
                placeholder="Explica el motivo del cambio..."
                value={comentarioEstado}
                onChange={e => setComentarioEstado(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button onClick={() => { setModalEstado(null); setComentarioEstado(''); }} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg">Cancelar</button>
              <button onClick={handleCambiarEstado} className="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7e]">Confirmar cambio</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TicketDetalle;