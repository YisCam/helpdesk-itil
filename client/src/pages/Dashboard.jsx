import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function Dashboard() {
  return (
    <div className="flex min-h-screen bg-gray-50 font-sans">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header titulo="Dashboard" />

        <div className="p-6 flex flex-col gap-6">
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Tickets abiertos</p>
              <p className="text-3xl font-medium text-[#1E3A5F]">24</p>
              <p className="text-xs text-amber-600 mt-1">↑ 4 nuevos hoy</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">En progreso</p>
              <p className="text-3xl font-medium text-[#1E3A5F]">12</p>
              <p className="text-xs text-blue-600 mt-1">3 asignados a ti</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">Resueltos hoy</p>
              <p className="text-3xl font-medium text-[#1E3A5F]">8</p>
              <p className="text-xs text-green-700 mt-1">↑ 60% vs ayer</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl p-4">
              <p className="text-xs text-gray-400 mb-2">SLA cumplido</p>
              <p className="text-3xl font-medium text-[#1E3A5F]">87%</p>
              <p className="text-xs text-red-600 mt-1">↓ 3% esta semana</p>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-medium text-[#1E3A5F] mb-4">Tickets recientes</p>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">Código</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">Título</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">Prioridad</th>
                  <th className="text-left text-xs text-gray-400 uppercase tracking-wide pb-2 px-2">Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-50">
                  <td className="text-xs text-gray-400 py-3 px-2">#TK-001</td>
                  <td className="text-sm text-gray-700 py-3 px-2">Error en sistema de facturación</td>
                  <td className="py-3 px-2"><span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">Crítica</span></td>
                  <td className="py-3 px-2"><span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full">Abierto</span></td>
                </tr>
                <tr className="border-b border-gray-50">
                  <td className="text-xs text-gray-400 py-3 px-2">#TK-002</td>
                  <td className="text-sm text-gray-700 py-3 px-2">Acceso denegado a carpeta red</td>
                  <td className="py-3 px-2"><span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">Alta</span></td>
                  <td className="py-3 px-2"><span className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-full">En progreso</span></td>
                </tr>
                <tr>
                  <td className="text-xs text-gray-400 py-3 px-2">#TK-003</td>
                  <td className="text-sm text-gray-700 py-3 px-2">PC no enciende en área contable</td>
                  <td className="py-3 px-2"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">Media</span></td>
                  <td className="py-3 px-2"><span className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-full">Resuelto</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;