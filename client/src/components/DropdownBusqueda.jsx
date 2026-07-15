import { useState, useRef, useEffect } from 'react';

function DropdownBusqueda({ valor, opciones, onChange, placeholder, disabled }) {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) { setAbierto(false); setBusqueda(''); } };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  useEffect(() => {
    if (abierto && inputRef.current) inputRef.current.focus();
  }, [abierto]);

  const opcionesFiltradas = opciones.filter(o =>
    o.label.toLowerCase().includes(busqueda.toLowerCase())
  );

  const etiqueta = opciones.find(o => o.value === valor)?.label || placeholder || 'Sin asignar';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !disabled && setAbierto(!abierto)}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm border border-gray-200 w-full bg-white text-gray-700
          ${disabled ? 'cursor-default opacity-70' : 'cursor-pointer hover:border-[#4A90D9]'}`}
      >
        <div className="flex items-center gap-2">
          {valor && (
            <div className="w-6 h-6 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {etiqueta?.charAt(0)}
            </div>
          )}
          <span className={valor ? 'text-gray-800' : 'text-gray-400'}>{etiqueta}</span>
        </div>
        {!disabled && <span className="text-xs text-gray-400">▾</span>}
      </button>

      {abierto && (
        <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded-xl shadow-xl z-20 w-full min-w-[200px]">
          <div className="p-2 border-b border-gray-100">
            <input
              ref={inputRef}
              className="w-full text-sm px-3 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-[#4A90D9]"
              placeholder="Buscar técnico..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            <button
              onClick={() => { onChange(''); setAbierto(false); setBusqueda(''); }}
              className="w-full text-left px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-400 border-none bg-transparent cursor-pointer"
            >
              Sin asignar
            </button>
            {opcionesFiltradas.map(o => (
              <button
                key={o.value}
                onClick={() => { onChange(o.value); setAbierto(false); setBusqueda(''); }}
                className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 border-none bg-transparent cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {o.label?.charAt(0)}
                </div>
                {o.label}
              </button>
            ))}
            {opcionesFiltradas.length === 0 && (
              <p className="text-sm text-gray-400 px-4 py-3">Sin resultados</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DropdownBusqueda;