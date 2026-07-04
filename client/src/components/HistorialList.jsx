function HistorialList({ historial }) {
  return (
    <div className="flex flex-col gap-3">
      {historial.length === 0 ? (
        <p className="text-sm text-gray-400">Sin historial aún.</p>
      ) : (
        historial.map(h => (
          <div key={h.id} className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
              {h.usuario_nombre?.charAt(0)}
            </div>
            <div className="flex-1 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-[#1E3A5F]">{h.usuario_nombre}</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Sistema</span>
                </div>
                <span className="text-xs text-gray-400">{new Date(h.creado_en).toLocaleString('es-PE')}</span>
              </div>
              <p className="text-sm text-blue-700 italic">{h.accion}</p>
              {h.detalle && <p className="text-xs text-gray-500 mt-1">"{h.detalle}"</p>}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default HistorialList;