import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navigation Menu (Sidebar) for mobile and quick access.
 * Follows the premium design language with neon-lime accents.
 */
const NavMenu = ({ isOpen, onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

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
        className={`fixed top-0 left-0 w-full max-w-[350px] h-full bg-dark-card z-[300] border-r border-white/10 shadow-[20px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-500 flex flex-col p-10 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-16">
          <h2 className="font-syne text-4xl font-black text-white tracking-widest">DVL</h2>
          <button onClick={onClose} className="text-white/40 hover:text-accent transition-all">
            <span className="text-3xl">✕</span>
          </button>
        </div>

        <nav className="flex-grow space-y-8">
          <button 
            onClick={() => handleNavigation('/')}
            className="group flex items-center gap-4 text-sm font-black uppercase tracking-[5px] text-white hover:text-accent transition-all w-full text-left"
          >
            <span className="w-6 h-px bg-white/20 group-hover:w-10 group-hover:bg-accent transition-all"></span>
            Catálogo
          </button>

          {!isAuthenticated ? (
            <>
              <button 
                onClick={() => handleNavigation('/login')}
                className="group flex items-center gap-4 text-sm font-black uppercase tracking-[5px] text-white/60 hover:text-white transition-all w-full text-left"
              >
                <span className="w-6 h-px bg-white/10 group-hover:w-10 group-hover:bg-accent transition-all"></span>
                Acceder
              </button>
              <button 
                onClick={() => handleNavigation('/register')}
                className="group flex items-center gap-4 text-sm font-black uppercase tracking-[5px] text-white/60 hover:text-white transition-all w-full text-left"
              >
                <span className="w-6 h-px bg-white/10 group-hover:w-10 group-hover:bg-accent transition-all"></span>
                Registro
              </button>
            </>
          ) : (
            <>
              {/* Sección Admin dentro del menú */}
              {user.role === 'admin' && (
                <button 
                  onClick={() => handleNavigation('/admin')}
                  className="group flex items-center gap-4 text-sm font-black uppercase tracking-[5px] text-accent hover:scale-105 transition-all w-full text-left"
                >
                  <span className="w-10 h-px bg-accent"></span>
                  Panel Admin
                </button>
              )}

              <div className="pt-10 space-y-4">
                 <p className="text-[10px] uppercase font-black text-white/20 tracking-[4px]">Cuenta</p>
                 <button 
                    onClick={handleLogout}
                    className="text-xs font-black uppercase tracking-[3px] text-red-500/60 hover:text-red-500 transition-all block"
                 >
                    Cerrar Sesión
                 </button>
              </div>
            </>
          )}
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
