import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Ticket, Columns, RefreshCw, Bug,
  BookOpen, Users, BarChart2, Settings, LogOut, Headphones
} from 'lucide-react';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const rol = usuario?.rol;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const navItem = (icon, label, path) => {
    const active = location.pathname === path;
    return (
      <div
        onClick={() => navigate(path)}
        className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors
          ${active ? 'bg-[#4A90D9]/20 text-[#4A90D9]' : 'text-[#90AECB] hover:bg-white/5 hover:text-white'}`}
      >
        {icon}
        <span>{label}</span>
      </div>
    );
  };

  return (
    <div className="w-56 bg-[#1E3A5F] flex flex-col flex-shrink-0 min-h-screen">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-[#4A90D9] rounded-md flex items-center justify-center">
          <Headphones size={16} color="white" />
        </div>
        <span className="text-white text-base font-medium">HelpDesk</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
        <p className="text-[10px] text-[#6B8FAD] uppercase tracking-widest px-2 mb-1">Principal</p>
        {navItem(<LayoutDashboard size={16} />, 'Dashboard', '/dashboard')}
        {navItem(<Ticket size={16} />, 'Tickets', '/tickets')}
        {navItem(<Columns size={16} />, 'Kanban', '/kanban')}

        <p className="text-[10px] text-[#6B8FAD] uppercase tracking-widest px-2 mt-4 mb-1">ITIL</p>
        {navItem(<RefreshCw size={16} />, 'Cambios', '/cambios')}
        {navItem(<Bug size={16} />, 'Problemas', '/problemas')}
        {navItem(<BookOpen size={16} />, 'Conocimiento', '/conocimiento')}

        {(rol === 'admin' || rol === 'tecnico') && (
          <>
            <p className="text-[10px] text-[#6B8FAD] uppercase tracking-widest px-2 mt-4 mb-1">Administración</p>
            {rol === 'admin' && navItem(<Users size={16} />, 'Usuarios', '/usuarios')}
            {navItem(<BarChart2 size={16} />, 'Reportes', '/reportes')}
            {rol === 'admin' && navItem(<Settings size={16} />, 'Configuración', '/configuracion')}
          </>
        )}
      </nav>

      {/* Usuario */}
      <div className="flex items-center gap-2 px-4 py-4 border-t border-white/10">
        <div className="w-7 h-7 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
          {usuario?.nombre?.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-xs font-medium truncate">{usuario?.nombre}</p>
          <p className="text-[#6B8FAD] text-xs">{usuario?.rol}</p>
        </div>
        <button
          onClick={handleLogout}
          className="text-[#6B8FAD] hover:text-white cursor-pointer bg-transparent border-none p-1"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
}

export default Sidebar;