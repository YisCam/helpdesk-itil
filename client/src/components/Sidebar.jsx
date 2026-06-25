import { useNavigate } from 'react-router-dom';

function Sidebar() {
  const navigate = useNavigate();
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  return (
    <div className="w-56 bg-[#1E3A5F] flex flex-col flex-shrink-0 min-h-screen">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-[#4A90D9] rounded-md flex items-center justify-center text-white text-sm">🎧</div>
        <span className="text-white text-base font-medium">HelpDesk</span>
      </div>

      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <p className="text-[10px] text-[#6B8FAD] uppercase tracking-widest px-2 mb-1">Principal</p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-[#4A90D9]/20 text-[#4A90D9] text-sm cursor-pointer">📊 Dashboard</div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#90AECB] text-sm cursor-pointer hover:bg-white/5">🎫 Tickets</div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#90AECB] text-sm cursor-pointer hover:bg-white/5">📋 Kanban</div>

        <p className="text-[10px] text-[#6B8FAD] uppercase tracking-widest px-2 mt-4 mb-1">ITIL</p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#90AECB] text-sm cursor-pointer hover:bg-white/5">🔄 Cambios</div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#90AECB] text-sm cursor-pointer hover:bg-white/5">🐛 Problemas</div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#90AECB] text-sm cursor-pointer hover:bg-white/5">📖 Conocimiento</div>

        <p className="text-[10px] text-[#6B8FAD] uppercase tracking-widest px-2 mt-4 mb-1">Administración</p>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#90AECB] text-sm cursor-pointer hover:bg-white/5">👥 Usuarios</div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#90AECB] text-sm cursor-pointer hover:bg-white/5">📈 Reportes</div>
        <div className="flex items-center gap-2 px-3 py-2 rounded-md text-[#90AECB] text-sm cursor-pointer hover:bg-white/5">⚙️ Configuración</div>
      </nav>

      <div className="flex items-center gap-2 px-4 py-4 border-t border-white/10">
        <div className="w-7 h-7 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
          {usuario?.nombre?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">{usuario?.nombre}</p>
          <p className="text-[#6B8FAD] text-xs">{usuario?.rol}</p>
        </div>
        <button onClick={handleLogout} className="text-[#6B8FAD] hover:text-white text-sm cursor-pointer bg-transparent border-none">↩</button>
      </div>
    </div>
  );
}

export default Sidebar;