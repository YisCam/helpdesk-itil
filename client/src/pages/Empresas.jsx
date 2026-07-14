import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import api from '../api/axios';
import { Building2, Pencil, PowerOff, Power, Plus } from 'lucide-react';

const PLANES = ['basico', 'profesional', 'enterprise'];

const colorPlan = {
  basico:       'bg-gray-100 text-gray-600',
  profesional:  'bg-blue-50 text-blue-700',
  enterprise:   'bg-purple-50 text-purple-700',
};

function Empresas() {
  const [empresas, setEmpresas] = useState([]);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', slug: '', ruc: '', email: '', plan: 'basico' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [busqueda, setBusqueda] = useState('');

  const cargarEmpresas = async () => {
    try {
      const res = await api.get('/empresas');
      setEmpresas(res.data);
    } catch (err) {
      console.error('Error al cargar empresas:', err);
    }
  };

  useEffect(() => {
    cargarEmpresas();
  }, []);

  const empresasFiltradas = empresas.filter(e =>
    e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.slug.toLowerCase().includes(busqueda.toLowerCase()) ||
    e.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', slug: '', ruc: '', email: '', plan: 'basico' });
    setError('');
    setModal(true);
  };

  const abrirEditar = (e) => {
    setEditando(e);
    setForm({ nombre: e.nombre, slug: e.slug, ruc: e.ruc || '', email: e.email, plan: e.plan });
    setError('');
    setModal(true);
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (editando) {
        await api.put(`/empresas/${editando.id}`, form);
      } else {
        await api.post('/empresas', form);
      }
      setModal(false);
      cargarEmpresas();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActivo = async (e) => {
    try {
      if (e.activo) {
        await api.delete(`/empresas/${e.id}`);
      } else {
        await api.patch(`/empresas/${e.id}/activar`);
      }
      cargarEmpresas();
    } catch (err) {
      console.error('Error al cambiar estado:', err);
    }
  };

  // Auto-generar slug desde el nombre
  const handleNombreChange = (valor) => {
    setForm(prev => ({
      ...prev,
      nombre: valor,
      slug: !editando
        ? valor.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        : prev.slug
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      <div className="flex-shrink-0">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header titulo="Empresas" />

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

          {/* Filtros + botón */}
          <div className="flex items-center justify-between">
            <input
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] w-64"
              placeholder="Buscar por nombre, slug o email..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            <button
              onClick={abrirCrear}
              className="flex items-center gap-2 bg-[#1E3A5F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2a4f7e] transition-colors"
            >
              <Plus size={16} />
              Nueva empresa
            </button>
          </div>

          {/* Tabla */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Empresa</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Slug</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Email</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Plan</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Usuarios</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Tickets</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Estado</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide py-3 px-4">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {empresasFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center text-sm text-gray-400 py-10">No hay empresas</td>
                  </tr>
                ) : (
                  empresasFiltradas.map(e => (
                    <tr key={e.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-[#1E3A5F] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {e.nombre?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{e.nombre}</p>
                            {e.ruc && <p className="text-xs text-gray-400">RUC: {e.ruc}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded font-mono">{e.slug}</span>
                      </td>
                      <td className="text-sm text-gray-500 py-3 px-4">{e.email}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${colorPlan[e.plan]}`}>
                          {e.plan}
                        </span>
                      </td>
                      <td className="text-sm text-gray-600 py-3 px-4">{e.total_usuarios}</td>
                      <td className="text-sm text-gray-600 py-3 px-4">{e.total_tickets}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${e.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          {e.activo ? 'Activa' : 'Inactiva'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => abrirEditar(e)}
                            className="p-1.5 text-gray-400 hover:text-[#1E3A5F] hover:bg-gray-100 rounded-lg transition-colors border-none bg-transparent cursor-pointer"
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          {e.id !== 'emp-001' && (
                            <button
                              onClick={() => handleToggleActivo(e)}
                              className={`p-1.5 rounded-lg transition-colors border-none bg-transparent cursor-pointer
                                ${e.activo ? 'text-red-400 hover:text-red-600 hover:bg-red-50' : 'text-green-400 hover:text-green-600 hover:bg-green-50'}`}
                              title={e.activo ? 'Desactivar' : 'Activar'}
                            >
                              {e.activo ? <PowerOff size={14} /> : <Power size={14} />}
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
              {editando ? 'Editar empresa' : 'Nueva empresa'}
            </h2>

            {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Nombre</label>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9]"
                  placeholder="Nombre de la empresa"
                  value={form.nombre}
                  onChange={e => handleNombreChange(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Slug (URL)</label>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] font-mono"
                  placeholder="mi-empresa"
                  value={form.slug}
                  onChange={e => setForm({ ...form, slug: e.target.value })}
                  required
                />
                <p className="text-xs text-gray-400">URL de acceso: /{form.slug}/login</p>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">RUC</label>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9]"
                  placeholder="20000000000"
                  value={form.ruc}
                  onChange={e => setForm({ ...form, ruc: e.target.value })}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
                <input
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9]"
                  type="email"
                  placeholder="contacto@empresa.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Plan</label>
                <select
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#4A90D9] text-gray-700"
                  value={form.plan}
                  onChange={e => setForm({ ...form, plan: e.target.value })}
                >
                  {PLANES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="flex gap-3 justify-end mt-2">
                <button type="button" onClick={() => setModal(false)} className="px-4 py-2 text-sm text-gray-500 border border-gray-200 rounded-lg">
                  Cancelar
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm bg-[#1E3A5F] text-white rounded-lg hover:bg-[#2a4f7e] disabled:opacity-60">
                  {loading ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Empresas;