import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';
import { UserPlus, Pencil, PowerOff, Power, KeyRound } from 'lucide-react';

const ROLES = ['admin', 'tecnico', 'usuario'];

const colorRol = {
  superadmin: 'bg-purple-50 text-purple-700',
  admin:      'bg-blue-50 text-blue-700',
  tecnico:    'bg-amber-50 text-amber-700',
  usuario:    'bg-gray-100 text-gray-600',
};

function Usuarios() {
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const esSuperadmin = usuario?.rol === 'superadmin';

  const [usuarios, setUsuarios] = useState([]);
  const [filtros, setFiltros] = useState({ busqueda: '', rol: '' });
  const [modal, setModal] = useState(false);
  const [modalPassword, setModalPassword] = useState(null);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'tecnico' });
  const [nuevaPassword, setNuevaPassword] = useState('');
  const [error, setError] = useState('');
  const [errorPassword, setErrorPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const cargarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const usuariosFiltrados = usuarios.filter(u => {
    const matchBusqueda = filtros.busqueda
      ? u.nombre.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
        u.email.toLowerCase().includes(filtros.busqueda.toLowerCase())
      : true;
    const matchRol = filtros.rol ? u.rol === filtros.rol : true;
    return matchBusqueda && matchRol;
  });

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', email: '', password: '', rol: 'tecnico' });
    setError('');
    setModal(true);
  };

  const abrirEditar = (u) => {
    setEditando(u);
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol });
    setError('');
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editando) {
        await api.put(`/usuarios/${editando.id}`, { nombre: form.nombre, email: form.email, rol: form.rol });
      } else {
        await api.post('/usuarios', form);
      }
      setModal(false);
      cargarUsuarios();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar usuario');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (u) => {
    try {
      if (u.activo) {
        await api.delete(`/usuarios/${u.id}`);
      } else {
        await api.patch(`/usuarios/${u.id}/activar`);
      }
      cargarUsuarios();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrorPassword('');
    if (nuevaPassword.length < 6) {
      setErrorPassword('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    try {
      await api.patch(`/usuarios/${modalPassword.id}/reset-password`, { password: nuevaPassword });
      setModalPassword(null);
      setNuevaPassword('');
    } catch (err) {
      setErrorPassword(err.response?.data?.error || 'Error al resetear contraseña');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header titulo="Usuarios" />

        <div className="p-6 flex flex-col gap-4">

          {/* Filtros */}
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              <input
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] w-56"
                placeholder="Buscar por nombre o email..."
                value={filtros.busqueda}
                onChange={e => setFiltros({ ...filtros, busqueda: e.target.value })}
              />
              <select
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] text-gray-600"
                value={filtros.rol}
                onChange={e => setFiltros({ ...filtros, rol: e.target.value })}
              >
                <option value="">Todos los roles</option>
                <option value="superadmin">Superadmin</option>
                <option value="admin">Admin</option>
                <option value="tecnico">Técnico</option>
                <option value="usuario">Usuario</option>
              </select>
            </div>
            <button
              onClick={abrirCrear}
              className="flex items-center gap-2 bg-[#1E3A5F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a4f7e] transition-colors"
            >
              <UserPlus size={16} />
              Nuevo usuario
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Usuario</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Email</th>
                  {esSuperadmin && (
                    <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Empresa</th>
                  )}
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Rol</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Estado</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={esSuperadmin ? 6 : 5} className="text-center text-sm text-gray-400 py-10">
                      No hay usuarios
                    </td>
                  </tr>
                ) : (
                  usuariosFiltrados.map(u => (
                    <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {u.nombre?.charAt(0)}
                          </div>
                          <span className="text-sm text-gray-800 font-medium">{u.nombre}</span>
                        </div>
                      </td>
                      <td className="text-sm text-gray-500 py-3 px-4">{u.email}</td>
                      {esSuperadmin && (
                        <td className="text-sm text-gray-500 py-3 px-4">{u.empresa_nombre}</td>
                      )}
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorRol[u.rol]}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${u.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirEditar(u)}
                            className="p-1.5 text-gray-400 hover:text-[#1E3A5F] hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => { setModalPassword(u); setNuevaPassword(''); setErrorPassword(''); }}
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                            title="Resetear contraseña"
                          >
                            <KeyRound size={14} />
                          </button>
                          {u.id !== usuario?.id && (
                            <button
                              onClick={() => handleToggleActivo(u)}
                              className={`p-1.5 rounded-lg transition-colors border-none bg-transparent cursor-pointer
                                ${u.activo ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-green-400 hover:text-green-600 hover:bg-green-50'}`}
                              title={u.activo ? 'Desactivar' : 'Activar'}
                            >
                              {u.activo ? <PowerOff size={14} /> : <Power size={14} />}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal crear/editar */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-base font-medium text-[#1E3A5F] mb-4">
              {editando ? 'Editar usuario' : 'Nuevo usuario'}
            </h2>

            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</label>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9]"
                  placeholder="Nombre completo"
                  value={form.nombre}
                  onChange={e => setForm({ ...form, nombre: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9]"
                  type="email"
                  placeholder="correo@aurogal.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              {!editando && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contraseña</label>
                  <input
                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9]"
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rol</label>
                <select
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] text-gray-700"
                  value={form.rol}
                  onChange={e => setForm({ ...form, rol: e.target.value })}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7e] disabled:opacity-60">
                  {loading ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal resetear contraseña */}
      {modalPassword && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h2 className="text-base font-medium text-[#1E3A5F] mb-1">Resetear contraseña</h2>
            <p className="text-sm text-gray-400 mb-4">{modalPassword.nombre}</p>

            {errorPassword && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{errorPassword}</div>}

            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nueva contraseña</label>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9]"
                  type="password"
                  placeholder="••••••••"
                  value={nuevaPassword}
                  onChange={e => setNuevaPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setModalPassword(null)} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7e]">
                  Actualizar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Usuarios;