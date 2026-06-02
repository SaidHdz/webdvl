import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuClick, onCartClick, onAdminClick }) => {
  const { cartCount } = useCart();
  const { user, isAuthenticated, isStaff, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 w-full h-[80px] bg-black/40 backdrop-blur-xl flex justify-between items-center px-8 z-[100] border-b border-white/5">
      <div className="flex items-center gap-6">
        <button 
          onClick={onMenuClick}
          className="text-white hover:text-accent transition-all duration-300 p-2 hover:scale-110"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="7" x2="21" y2="7"></line>
            <line x1="3" y1="17" x2="21" y2="17"></line>
          </svg>
        </button>

        {/* Botón de Login (Escritorio) */}
        {!isAuthenticated ? (
          <button 
            onClick={() => navigate('/login')}
            className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-white/60 hover:text-white transition-all group"
          >
            <span className="w-8 h-px bg-white/20 group-hover:w-12 group-hover:bg-accent transition-all"></span>
            Acceder
          </button>
        ) : (
          <div className="hidden md:flex items-center gap-4">
             <div className="flex flex-col items-start">
                <span className="text-[8px] text-white/30 uppercase font-black tracking-widest">Bienvenido</span>
                <span className="text-[10px] text-accent font-black uppercase tracking-tight">{user.name}</span>
             </div>
             <button 
                onClick={logout}
                className="text-[9px] font-black uppercase tracking-[2px] text-red-500/60 hover:text-red-500 transition-all border border-red-500/20 hover:border-red-500 px-3 py-1 rounded-full"
             >
                Salir
             </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center cursor-pointer group" onClick={() => navigate('/')}>
        <h1 className="font-syne text-3xl md:text-4xl font-black tracking-[0.2em] text-white transition-all duration-500 group-hover:tracking-[0.3em]">
          DVL
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick access to the module hub for staff accounts */}
        {isAuthenticated && isStaff && (
          <button
            onClick={onAdminClick}
            className="hidden md:block text-[9px] font-black uppercase tracking-[2px] bg-white/5 border border-white/10 hover:border-accent text-white hover:text-accent px-4 py-2 rounded-full transition-all"
          >
            Modulos
          </button>
        )}

        <button 
          onClick={onCartClick}
          className="relative p-2 hover:scale-110 transition-all duration-300 group"
        >
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1.5"
            className="group-hover:drop-shadow-[0_0_8px_rgba(219,255,0,0.8)]"
          >
            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 01-8 0"></path>
          </svg>
          {cartCount > 0 && (
            <span className="absolute top-0 right-0 bg-accent text-black text-[9px] font-black w-4 h-4 flex items-center justify-center rounded-full border border-black/20">
              {cartCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
