import { useState, useEffect } from 'react';
import api from '../api/axios';

const esSistema = (contenido) => contenido.startsWith('Estado cambiado de');

export function ComentariosInput({ ticketId, onNuevoComentario }) {
  const [contenido, setContenido] = useState('');
  const [loading, setLoading] = useState(false);
  const [escribiendo, setEscribiendo] = useState(false);
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const handleEnviar = async () => {
    if (!contenido.trim()) return;
    setLoading(true);
    try {
      await api.post(`/tickets/${ticketId}/comentarios`, { contenido });
      setContenido('');
      setEscribiendo(false);
      if (onNuevoComentario) onNuevoComentario();
    } catch (err) {
      console.error('Error al enviar comentario:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex gap-3 px-10 py-3 border-b border-gray-100 bg-white">
      <div className="w-8 h-8 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
        {usuario?.nombre?.charAt(0)}
      </div>
      <div className="flex-1">
        {!escribiendo ? (
          <button
            onClick={() => setEscribiendo(true)}
            className="w-full text-left text-sm text-gray-400 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 hover:bg-gray-100 cursor-pointer"
          >
            Añadir un comentario...
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <textarea
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] resize-none"
              rows={3}
              placeholder="Escribe un comentario..."
              value={contenido}
              onChange={e => setContenido(e.target.value)}
              autoFocus
              onKeyDown={e => { if (e.key === 'Escape') { setEscribiendo(false); setContenido(''); } }}
            />
            <div className="flex gap-2">
              <button onClick={handleEnviar} disabled={loading || !contenido.trim()} className="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7e] disabled:opacity-60">
                {loading ? 'Enviando...' : 'Guardar'}
              </button>
              <button onClick={() => { setEscribiendo(false); setContenido(''); }} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ComentariosList({ ticketId, onNuevoComentario }) {
  const [comentarios, setComentarios] = useState([]);
  const [editandoId, setEditandoId] = useState(null);
  const [editContenido, setEditContenido] = useState('');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const cargarComentarios = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}/comentarios`);
      setComentarios(res.data);
    } catch (err) {
      console.error('Error al cargar comentarios:', err);
    }
  };

  useEffect(() => {
    cargarComentarios();
  }, [ticketId, onNuevoComentario]);

  const handleEliminar = async (id) => {
    try {
      await api.delete(`/tickets/${ticketId}/comentarios/${id}`);
      cargarComentarios();
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
    }
  };

  const handleEditar = async (id) => {
    if (!editContenido.trim()) return;
    try {
      await api.put(`/tickets/${ticketId}/comentarios/${id}`, { contenido: editContenido });
      setEditandoId(null);
      setEditContenido('');
      cargarComentarios();
    } catch (err) {
      console.error('Error al editar comentario:', err);
    }
  };

  if (comentarios.length === 0) return <p className="text-sm text-gray-400 px-2">No hay comentarios aún.</p>;

  return (
    <div className="flex flex-col gap-5">
      {comentarios.map(c => (
        <div key={c.id} className="flex gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${esSistema(c.contenido) ? 'bg-gray-300' : 'bg-[#4A90D9]'}`}>
            {c.usuario_nombre?.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-sm font-semibold text-gray-800">{c.usuario_nombre}</span>
              {esSistema(c.contenido) && (
                <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Sistema</span>
              )}
              <span className="text-xs text-gray-400">{new Date(c.creado_en).toLocaleString('es-PE')}</span>
              {c.usuario_id === usuario?.id && !esSistema(c.contenido) && (
                <>
                  <button onClick={() => { setEditandoId(c.id); setEditContenido(c.contenido); }} className="text-xs text-blue-400 hover:text-blue-600 bg-transparent border-none cursor-pointer">Editar</button>
                  <button onClick={() => handleEliminar(c.id)} className="text-xs text-red-400 hover:text-red-600 bg-transparent border-none cursor-pointer">Eliminar</button>
                </>
              )}
            </div>
            {editandoId === c.id ? (
              <div className="flex flex-col gap-2">
                <textarea
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] resize-none"
                  rows={2}
                  value={editContenido}
                  onChange={e => setEditContenido(e.target.value)}
                />
                <div className="flex gap-2">
                  <button onClick={() => handleEditar(c.id)} className="px-3 py-1 text-xs bg-[#1E3A5F] text-white rounded-lg">Guardar</button>
                  <button onClick={() => setEditandoId(null)} className="px-3 py-1 text-xs border border-gray-200 text-gray-500 rounded-lg">Cancelar</button>
                </div>
              </div>
            ) : (
              <p className={`text-sm ${esSistema(c.contenido) ? 'text-blue-700 italic' : 'text-gray-700'}`}>
                {c.contenido}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default ComentariosList;