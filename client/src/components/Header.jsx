function Header({ titulo }) {
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  return (
    <div className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between">
      <h1 className="text-base font-medium text-[#1E3A5F]">{titulo}</h1>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">🔔</button>
        <div className="w-8 h-8 rounded-full bg-[#4A90D9] flex items-center justify-center text-white text-xs font-medium">
          {usuario?.nombre?.charAt(0)}
        </div>
      </div>
    </div>
  );
}

export default Header;