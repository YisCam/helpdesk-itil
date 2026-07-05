import { useState, useRef, useEffect } from 'react';

function Dropdown({ valor, opciones, onChange, colorMap, disabled }) {
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const fn = (e) => { if (ref.current && !ref.current.contains(e.target)) setAbierto(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  const colorActual = colorMap?.[valor] || 'bg-gray-100 text-gray-600';

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => !disabled && setAbierto(!abierto)}
        className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold border-none w-full
          ${disabled ? 'cursor-default opacity-70' : 'cursor-pointer'} ${colorActual}`}
      >
        {valor} {!disabled && <span className="text-xs">▾</span>}
      </button>
      {abierto && (
        <div className="absolute top-10 left-0 bg-white border border-gray-200 rounded-xl shadow-xl z-20 w-full min-w-[160px]">
          {opciones.filter(o => o !== valor).map(o => (
            <button
              key={o}
              onClick={() => { onChange(o); setAbierto(false); }}
              className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700 border-none bg-transparent cursor-pointer"
            >
              <span>{o}</span>
              {colorMap && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${colorMap[o]}`}>{o}</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;