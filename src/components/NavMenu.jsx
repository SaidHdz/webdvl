import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navigation Menu (Sidebar) for mobile and quick access.
 * Follows the premium design language with white accents.
 */
const NavMenu = ({ isOpen, onClose, onScrollToCollection }) => {
  const { isAuthenticated, isStaff, logout } = useAuth();
  const navigate = useNavigate();

  const handleAction = (category = 'Todas') => {
    onScrollToCollection?.(category);
    onClose();
  };

  const navLinks = [
    { label: 'Colección', filter: 'Todas' },
    { label: 'Playeras', filter: 'Playera' },
    { label: 'Gorros', filter: 'Gorro' },
  ];

  const handleLogout = () => {
    logout();
    onClose();
    navigate('/');
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[250] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Menu */}
      <aside 
        className={`fixed top-0 left-0 w-full max-w-[350px] h-full bg-[#0a0a0a] z-[300] border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-in-out flex flex-col p-12 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-16">
          <h2 className="font-syne text-4xl font-black text-white tracking-tighter">DVL</h2>
          <button onClick={onClose} className="text-white/20 hover:text-white transition-all">
            <span className="text-3xl">✕</span>
          </button>
        </div>

        <nav className="flex-grow flex flex-col gap-10">
          {navLinks.map((link) => (
            <button 
              key={link.label}
              onClick={() => handleAction(link.filter)}
              className="group flex flex-col items-start gap-1 text-4xl font-black uppercase tracking-tighter text-white/20 hover:text-white transition-all w-full text-left"
            >
              <span className="text-[10px] uppercase font-black tracking-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-500">Explorar</span>
              {link.label}
            </button>
          ))}

          <div className="pt-10 space-y-6">
            <p className="text-[10px] uppercase font-black text-white/10 tracking-[4px]">Cuenta</p>
            {!isAuthenticated ? (
                <div className="flex flex-col gap-4 items-start">
                    <button onClick={() => { navigate('/login'); onClose(); }} className="text-white font-bold text-sm hover:text-accent transition-colors tracking-widest uppercase">Acceder</button>
                    <button onClick={() => { navigate('/register'); onClose(); }} className="text-white font-bold text-sm hover:text-accent transition-colors tracking-widest uppercase">Registro</button>
                </div>
            ) : (
                <div className="flex flex-col gap-4 items-start">
                    {isStaff && <button onClick={() => { navigate('/hub'); onClose(); }} className="text-accent font-black text-sm tracking-widest uppercase">Panel Admin</button>}
                    <button onClick={handleLogout} className="text-red-500/60 hover:text-red-500 font-bold text-sm transition-colors tracking-widest uppercase">Cerrar Sesión</button>
                </div>
            )}
          </div>
        </nav>

        <div className="mt-auto pt-10 border-t border-white/5">
          <p className="text-[9px] font-black uppercase tracking-[4px] text-white/20">
            DVL SUPPLY CO. <br />
            © 2026 PREMIUM CLOTHING
          </p>
        </div>
      </aside>
    </>
  );
};

export default NavMenu;
