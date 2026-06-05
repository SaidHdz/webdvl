import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Navigation Menu (Sidebar) for mobile and quick access.
 * Features a distinct Account Zone with branded avatar.
 */
import logo from '../assets/logo_dvl.png';

const NavMenu = ({ isOpen, onClose, onScrollToCollection }) => {
  const { user, isAuthenticated, isStaff, logout } = useAuth();
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
        className={`fixed top-0 left-0 w-full max-w-[350px] h-full bg-[#0a0a0a] z-[300] border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col p-12 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex justify-between items-center mb-16">
          <img src={logo} alt="DVL Supply" className="h-10 w-auto object-contain" />
          <button onClick={onClose} className="text-white/20 hover:text-white transition-all">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"></path></svg>
          </button>
        </div>

        <nav className="flex-grow flex flex-col gap-10">
          <div className="space-y-10">
            {navLinks.map((link) => (
              <button 
                key={link.label}
                onClick={() => handleAction(link.filter)}
                className="group flex flex-col items-start gap-1 text-4xl font-black uppercase tracking-tighter text-white/20 hover:text-white transition-all w-full text-left"
              >
                <span className="text-[10px] uppercase font-black tracking-[4px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-white/40">Explorar</span>
                {link.label}
              </button>
            ))}
          </div>

          {/* Account Zone - Differentiated Background */}
          <div className="mt-10 pt-10 border-t border-white/5 space-y-8">
            <p className="text-[10px] uppercase font-black text-white/10 tracking-[4px]">Mi Cuenta</p>
            
            {!isAuthenticated ? (
                <div className="flex flex-col gap-4 items-start">
                    <button onClick={() => { navigate('/login'); onClose(); }} className="text-white font-black text-sm hover:text-[#bf4a4a] transition-colors tracking-widest uppercase">Iniciar Sesión</button>
                    <button onClick={() => { navigate('/register'); onClose(); }} className="text-white font-black text-sm hover:text-[#bf4a4a] transition-colors tracking-widest uppercase">Registro</button>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Branded Avatar Section */}
                    <button 
                        onClick={() => { navigate('/profile'); onClose(); }} 
                        className="w-full flex items-center gap-5 p-4 bg-white/[0.02] border border-white/5 rounded-2xl group transition-all hover:bg-white/[0.05] hover:border-white/10"
                    >
                        <div className="w-12 h-12 bg-[#bf4a4a] rounded-xl flex items-center justify-center text-xl font-syne font-black text-black shadow-[0_0_20px_rgba(191,74,74,0.2)] transform group-hover:rotate-3 transition-transform">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col items-start min-w-0">
                            <span className="text-white font-black text-lg tracking-tight uppercase truncate">{user.name.split(' ')[0]}</span>
                            <span className="text-[9px] text-[#bf4a4a] font-black uppercase tracking-[3px]">Ver Mi Perfil</span>
                        </div>
                    </button>
                    
                    <div className="flex flex-col gap-4 items-start pl-4">
                        {isStaff && (
                            <button 
                                onClick={() => { navigate('/hub'); onClose(); }} 
                                className="text-[#a855f7] font-black text-[10px] tracking-[4px] uppercase hover:text-white transition-colors"
                            >
                                Panel de Módulos
                            </button>
                        )}
                        <button onClick={handleLogout} className="text-red-500/40 hover:text-red-500 font-black text-[10px] transition-colors tracking-[4px] uppercase">Cerrar Sesión</button>
                    </div>
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
