import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Star } from 'lucide-react';

function CSATWidget({ ticketId, estadoTicket, creadoPor, onTicketCerrado }) {
  const [csat, setCsat] = useState(null);
  const [hover, setHover] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const esCreador = usuario?.id === creadoPor;
  const puedeCalificar = esCreador && ['Resuelto', 'Cerrado'].includes(estadoTicket);

  const cargarCSAT = async () => {
    try {
      const res = await api.get(`/tickets/${ticketId}/csat`);
      setCsat(res.data);
    } catch (err) {
      console.error('Error al cargar CSAT:', err);
    }
  };

  useEffect(() => {
    if (puedeCalificar || esCreador) cargarCSAT();
  }, [ticketId, estadoTicket]);

  const handleEnviar = async () => {
    if (!puntuacion) return;
    setEnviando(true);
    setError('');
    try {
      await api.post(`/tickets/${ticketId}/csat`, { puntuacion, comentario });
      await cargarCSAT();
      if (onTicketCerrado) onTicketCerrado();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar calificación');
    } finally {
      setEnviando(false);
    }
  };

  if (!puedeCalificar) return null;

  const etiquetas = { 1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Bueno', 5: 'Excelente' };
  const colorEstrella = { 1: 'text-red-500', 2: 'text-orange-500', 3: 'text-amber-500', 4: 'text-blue-500', 5: 'text-green-500' };

  return (
    <div className="mt-6 border-t border-gray-100 pt-5">
      {csat ? (
        <div className="bg-green-50 border border-green-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-green-700 mb-2">✓ Gracias por tu calificación</p>
          <div className="flex items-center gap-1 mb-1">
            {[1, 2, 3, 4, 5].map(s => (
              <Star
                key={s}
                size={18}
                className={s <= csat.puntuacion ? 'text-amber-400 fill-amber-400' : 'text-gray-200 fill-gray-200'}
              />
            ))}
            <span className="text-sm text-gray-600 ml-2">{etiquetas[csat.puntuacion]}</span>
          </div>
          {csat.comentario && (
            <p className="text-sm text-gray-500 italic mt-1">"{csat.comentario}"</p>
          )}
        </div>
      ) : (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <p className="text-sm font-semibold text-[#1E3A5F] mb-1">¿Cómo calificarías la atención recibida?</p>
          <p className="text-xs text-gray-400 mb-4">Tu opinión nos ayuda a mejorar el servicio</p>

          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                onMouseEnter={() => setHover(s)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setPuntuacion(s)}
                className="border-none bg-transparent cursor-pointer p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={`transition-colors ${
                    s <= (hover || puntuacion)
                      ? `fill-amber-400 ${colorEstrella[hover || puntuacion]}`
                      : 'text-gray-300 fill-gray-200'
                  }`}
                />
              </button>
            ))}
            {(hover || puntuacion) > 0 && (
              <span className="text-sm text-gray-500 ml-2">{etiquetas[hover || puntuacion]}</span>
            )}
          </div>

          {puntuacion > 0 && (
            <div className="flex flex-col gap-2">
              <textarea
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] resize-none bg-white"
                rows={2}
                placeholder="Comentario opcional..."
                value={comentario}
                onChange={e => setComentario(e.target.value)}
              />
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                onClick={handleEnviar}
                disabled={enviando}
                className="self-end px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7e] disabled:opacity-60"
              >
                {enviando ? 'Enviando...' : 'Enviar calificación'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CSATWidget;