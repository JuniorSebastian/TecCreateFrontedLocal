// src/components/NavBar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

export default function NavBar() {
  const [usuario, setUsuario] = useState(null);
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const obtenerUsuario = () => {
      const guardado = localStorage.getItem('usuario');
      if (guardado) {
        try {
          setUsuario(JSON.parse(guardado));
        } catch (e) {
          console.error('Error leyendo usuario:', e);
        }
      }
    };

    obtenerUsuario();

    const handleStorageChange = () => obtenerUsuario();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/');
  };

  return (
    <nav className="relative z-10 overflow-visible bg-white shadow-[0_18px_45px_rgba(37,99,235,0.12)]">
      <div className="absolute inset-x-0 -top-2 h-2 bg-gradient-to-r from-blue-500 via-cyan-400 to-sky-500"></div>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-10 py-6">
        <Link to="/perfil" className="flex items-center text-blue-700">
          <img
            src="https://i.ibb.co/Q3JXxDPY/Chat-GPT-Image-13-jun-2025-22-14-04-removebg-preview-Photoroom.png"
            alt="TecCreate logo"
            className="h-36 w-56 object-contain drop-shadow-[0_22px_60px_rgba(37,99,235,0.45)]"
          />
        </Link>

        <div className="relative flex items-center gap-6">
          <Link
            to="/perfil"
            className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
          >
            Mis Presentaciones
          </Link>

          {usuario && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setOpenMenu((prev) => !prev)}
                className="flex items-center gap-3 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-200"
              >
                <span className="hidden sm:block">{usuario.nombre?.split(' ')[0]}</span>
                <img
                  src={usuario.foto}
                  alt="Perfil"
                  className="h-11 w-11 rounded-full border border-blue-100 object-cover shadow-[0_10px_25px_rgba(37,99,235,0.2)]"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/default-avatar.png';
                  }}
                />
              </button>

              {openMenu && (
                <div className="absolute right-0 mt-3 w-52 overflow-hidden rounded-2xl border border-blue-50 bg-white shadow-[0_18px_40px_rgba(37,99,235,0.15)]">
                  <button
                    onClick={handleCerrarSesion}
                    className="block w-full px-4 py-3 text-left text-sm font-semibold text-red-500 transition hover:bg-red-50"
                  >
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
