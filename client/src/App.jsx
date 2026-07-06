import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetalle from './pages/TicketDetalle';
import Kanban from './pages/Kanban';

const PrivateRoute = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!token) return <Navigate to="/login" />;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      return <Navigate to="/login" />;
    }
  } catch {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    return <Navigate to="/login" />;
  }

  if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rol)) {
    const slug = usuario?.slug || 'empresa-demo';
    return <Navigate to={`/${slug}/dashboard`} />;
  }

  return children;
};

const Proximamente = ({ titulo }) => (
  <div className="flex min-h-screen bg-gray-50 font-sans items-center justify-center">
    <div className="text-center">
      <p className="text-4xl mb-4">🚧</p>
      <h2 className="text-lg font-medium text-[#1E3A5F]">{titulo}</h2>
      <p className="text-sm text-gray-400 mt-2">Próximamente disponible</p>
    </div>
  </div>
);

const RutaNoEncontrada = () => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  if (token && usuario) {
    return <Navigate to={`/${usuario.slug || 'empresa-demo'}/dashboard`} />;
  }
  return <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/:slug/login" element={<Login />} />

        <Route path="/:slug/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/:slug/tickets" element={<PrivateRoute><Tickets /></PrivateRoute>} />
        <Route path="/:slug/tickets/:id" element={<PrivateRoute><TicketDetalle /></PrivateRoute>} />
        <Route path="/:slug/kanban" element={<PrivateRoute><Kanban /></PrivateRoute>} />
        <Route path="/:slug/cambios" element={<PrivateRoute><Proximamente titulo="Gestión de Cambios" /></PrivateRoute>} />
        <Route path="/:slug/problemas" element={<PrivateRoute><Proximamente titulo="Gestión de Problemas" /></PrivateRoute>} />
        <Route path="/:slug/conocimiento" element={<PrivateRoute><Proximamente titulo="Base de Conocimiento" /></PrivateRoute>} />
        <Route path="/:slug/usuarios" element={
          <PrivateRoute rolesPermitidos={['admin', 'superadmin']}><Proximamente titulo="Gestión de Usuarios" /></PrivateRoute>
        } />
        <Route path="/:slug/reportes" element={
          <PrivateRoute rolesPermitidos={['admin', 'tecnico', 'superadmin']}><Proximamente titulo="Reportes" /></PrivateRoute>
        } />
        <Route path="/:slug/configuracion" element={
          <PrivateRoute rolesPermitidos={['admin', 'superadmin']}><Proximamente titulo="Configuración" /></PrivateRoute>
        } />

        <Route path="*" element={<RutaNoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;