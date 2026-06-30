import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', slug: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('usuario', JSON.stringify(res.data.usuario));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen font-sans">
      <div className="flex-1 bg-[#1E3A5F] flex flex-col justify-center px-12">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-9 h-9 bg-[#4A90D9] rounded-lg flex items-center justify-center text-white text-lg">🎧</div>
          <span className="text-white text-xl font-medium">HelpDesk</span>
        </div>
        <h1 className="text-white text-3xl font-medium leading-snug mb-4">
          Gestiona tu soporte<br />de TI en un solo lugar
        </h1>
        <p className="text-[#90AECB] text-sm leading-relaxed mb-8">
          Plataforma ITIL para equipos de tecnología modernos.
        </p>
        <div className="flex flex-col gap-3">
          <span className="text-[#B8CFDF] text-sm">✦ Gestión de tickets en tiempo real</span>
          <span className="text-[#B8CFDF] text-sm">✦ Reportes y métricas de SLA</span>
          <span className="text-[#B8CFDF] text-sm">✦ Multi-empresa con acceso aislado</span>
        </div>
      </div>

     <div className="w-1/2 bg-white flex flex-col justify-center px-16">
        <h2 className="text-2xl font-medium text-[#1E3A5F] mb-1">Bienvenido</h2>
        <p className="text-sm text-gray-400 mb-8">Ingresa tus credenciales para continuar</p>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Empresa (slug)</label>
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20"
              type="text"
              name="slug"
              placeholder="empresa-demo"
              value={form.slug}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Correo electrónico</label>
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20"
              type="email"
              name="email"
              placeholder="admin@helpdesk.com"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contraseña</label>
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] focus:ring-2 focus:ring-[#4A90D9]/20"
              type="password"
              name="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          <button
            className="w-full bg-[#1E3A5F] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#2a4f7e] transition-colors disabled:opacity-60"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="mt-8 text-xs text-gray-300 text-center">© 2025 HelpDesk ITIL · Todos los derechos reservados</p>
      </div>
    </div>
  );
}

export default Login;