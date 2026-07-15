import { useState, useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const colorTipo = {
  asignacion: 'bg-blue-50 text-blue-700',
  resolucion: 'bg-green-50 text-green-700',
  comentario: 'bg-amber-50 text-amber-700',
};

const iconoTipo = {
  asignacion: '📋',
  resolucion: '✅',
  comentario: '💬',
};

const reproducirSonido = () => {
  try {
    const audio = new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  } catch (e) {}
};

function Header({ titulo }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const [notificaciones, setNotificaciones] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const dropdownRef = useRef(null);
  const esInicialRef = useRef(true);

  const noLeidos = notificaciones.filter(n => !n.leido).length;

  const cargarNotificaciones = async () => {
    try {
      const res = await api.get('/notificaciones');
      setNotificaciones(res.data);
    } catch (err) {
      console.error('Error al cargar notificaciones:', err);
    }
  };

  useEffect(() => {
    cargarNotificaciones();

    const token = localStorage.getItem('token');
    const eventSource = new EventSource(
      `http://localhost:3000/api/notificaciones/suscribir?token=${token}`
    );

    eventSource.onmessage = (e) => {
      const notif = JSON.parse(e.data);

      if (!esInicialRef.current) {
        reproducirSonido();
        toast(`${iconoTipo[notif.tipo] || '🔔'} ${notif.mensaje}`, {
          icon: null,
        });
      }

      setNotificaciones(prev => [{ ...notif, leido: false }, ...prev]);
    };

    eventSource.onerror = () => eventSource.close();

    setTimeout(() => { esInicialRef.current = false; }, 1000);

    return () => eventSource.close();
  }, []);

  useEffect(() => {
    const fn = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const handleMarcarLeido = async (id) => {
    try {
      await api.patch(`/notificaciones/${id}/leido`);
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, leido: true } : n));
    } catch (err) {
      console.error('Error al marcar notificación:', err);
    }
  };

  const handleMarcarTodos = async () => {
    try {
      await api.patch('/notificaciones/leer-todos');
      setNotificaciones(prev => prev.map(n => ({ ...n, leido: true })));
    } catch (err) {
      console.error('Error al marcar todas:', err);
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
      <h1 className="text-base font-medium text-[#1E3A5F]">{titulo}</h1>

      <div className="flex items-center gap-3">

        {/* Campana */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setAbierto(!abierto)}
            className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50 relative"
          >
            <Bell size={16} />
            {noLeidos > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {noLeidos > 9 ? '9+' : noLeidos}
              </span>
            )}
          </button>

          {abierto && (
            <div className="absolute right-0 top-10 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-[#1E3A5F]">Notificaciones</p>
                {noLeidos > 0 && (
                  <button
                    onClick={handleMarcarTodos}
                    className="text-xs text-[#4A90D9] hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Marcar todas como leídas
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notificaciones.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                    <Bell size={24} className="mb-2 opacity-30" />
                    <p className="text-sm">Sin notificaciones</p>
                  </div>
                ) : (
                  notificaciones.map(n => (
                    <div
                      key={n.id}
                      onClick={() => !n.leido && handleMarcarLeido(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 cursor-pointer hover:bg-gray-50 transition-colors
                        ${!n.leido ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${!n.leido ? 'bg-blue-500' : 'bg-gray-200'}`} />
                      <div className="flex-1">
                        <p className={`text-sm ${!n.leido ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                          {n.mensaje}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${colorTipo[n.tipo] || 'bg-gray-100 text-gray-500'}`}>
                            {n.tipo}
                          </span>
                          <span className="text-xs text-gray-400">
                            {new Date(n.creado_en).toLocaleString('es-PE')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-xs font-medium">
          {usuario?.nombre?.charAt(0)}
        </div>
      </div>
    </div>
  );
}

export default Header;