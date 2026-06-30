import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetalle from './pages/TicketDetalle';

const PrivateRoute = ({ children, rolesPermitidos }) => {
  const token = localStorage.getItem('token');
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  if (!token) return <Navigate to="/login" />;

  if (rolesPermitidos && !rolesPermitidos.includes(usuario?.rol)) {
    return <Navigate to="/dashboard" />;
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
  return token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tickets" element={<PrivateRoute><Tickets /></PrivateRoute>} />
        <Route path="/tickets/:id" element={<PrivateRoute><TicketDetalle /></PrivateRoute>} />
        <Route path="/kanban" element={<PrivateRoute><Proximamente titulo="Vista Kanban" /></PrivateRoute>} />
        <Route path="/cambios" element={<PrivateRoute><Proximamente titulo="Gestión de Cambios" /></PrivateRoute>} />
        <Route path="/problemas" element={<PrivateRoute><Proximamente titulo="Gestión de Problemas" /></PrivateRoute>} />
        <Route path="/conocimiento" element={<PrivateRoute><Proximamente titulo="Base de Conocimiento" /></PrivateRoute>} />
        <Route path="/usuarios" element={
          <PrivateRoute rolesPermitidos={['admin']}><Proximamente titulo="Gestión de Usuarios" /></PrivateRoute>
        } />
        <Route path="/reportes" element={
          <PrivateRoute rolesPermitidos={['admin', 'tecnico']}><Proximamente titulo="Reportes" /></PrivateRoute>
        } />
        <Route path="/configuracion" element={
          <PrivateRoute rolesPermitidos={['admin']}><Proximamente titulo="Configuración" /></PrivateRoute>
        } />
        <Route path="*" element={<RutaNoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;