import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
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
        <Route path="/kanban" element={<PrivateRoute><Proximamente titulo="Vista Kanban" /></PrivateRoute>} />
        <Route path="/cambios" element={<PrivateRoute><Proximamente titulo="Gestión de Cambios" /></PrivateRoute>} />
        <Route path="/problemas" element={<PrivateRoute><Proximamente titulo="Gestión de Problemas" /></PrivateRoute>} />
        <Route path="/conocimiento" element={<PrivateRoute><Proximamente titulo="Base de Conocimiento" /></PrivateRoute>} />
        <Route path="/usuarios" element={<PrivateRoute><Proximamente titulo="Gestión de Usuarios" /></PrivateRoute>} />
        <Route path="/reportes" element={<PrivateRoute><Proximamente titulo="Reportes" /></PrivateRoute>} />
        <Route path="/configuracion" element={<PrivateRoute><Proximamente titulo="Configuración" /></PrivateRoute>} />
        <Route path="*" element={<RutaNoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;