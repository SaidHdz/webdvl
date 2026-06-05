import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Header = ({ onMenuClick, onCartClick, onAdminClick, onScrollToCollection }) => {
  const { cartCount } = useCart();
  const { user, isAuthenticated, isStaff } = useAuth();
  const navigate = useNavigate();
  const controls = useAnimation();

  // Trigger pop animation when cartCount changes
  useEffect(() => {
    if (cartCount > 0) {
      controls.start({
        scale: [1, 1.4, 0.9, 1.1, 1],
        transition: { duration: 0.5, ease: "easeInOut" }
      });
    }
  }, [cartCount, controls]);

  const navLinks = [
    { label: 'Colección', filter: 'Todas' },
    { label: 'Playeras', filter: 'Playera' },
    { label: 'Gorros', filter: 'Gorro' },
  ];

  return (
    <header className="fixed top-0 left-0 w-full h-[70px] lg:h-[80px] bg-black/40 backdrop-blur-xl flex justify-between items-center px-4 lg:px-8 z-[100] border-b border-white/5">
      {/* Left: Logo & Menu */}
      <div className="flex items-center gap-4 lg:gap-8 flex-1">
        <div className="flex items-center cursor-pointer group" onClick={() => onScrollToCollection('Todas')}>
            <h1 className="font-syne text-2xl lg:text-3xl font-black tracking-[-0.05em] text-white transition-all duration-500 group-hover:tracking-tighter">
            DVL
            </h1>
        </div>

        <nav className="hidden lg:flex items-center gap-8 ml-8">
            {navLinks.map((link) => (
                <button
                    key={link.label}
                    onClick={() => onScrollToCollection(link.filter)}
                    className="text-[10px] font-black uppercase tracking-[3px] text-white/40 hover:text-white transition-all"
                >
                    {link.label}
                </button>
            ))}
        </nav>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 lg:gap-6 flex-1 justify-end">
        {/* Login/Staff Section */}
        {!isAuthenticated ? (
          <button 
            onClick={() => navigate('/login')}
            className="hidden sm:flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] text-white/60 hover:text-white transition-all group"
          >
            <span className="w-6 h-px bg-white/20 group-hover:w-10 group-hover:bg-white transition-all"></span>
            Acceder
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-4">
             <div className="flex flex-col items-end text-right">
                <span className="text-[8px] text-white/30 uppercase font-black tracking-widest leading-none">Miembro</span>
                <span className="text-[10px] text-white font-black uppercase tracking-tight">{user.name.split(' ')[0]}</span>
             </div>
          </div>
        )}

        {/* Quick access to the module hub for staff accounts */}
        {isAuthenticated && isStaff && (
          <button
            onClick={onAdminClick}
            className="hidden md:block text-[9px] font-black uppercase tracking-[2px] bg-white text-black border border-white hover:bg-transparent hover:text-white px-4 py-2 rounded-full transition-all shadow-xl"
          >
            Modulos
          </button>
        )}

        <div className="flex items-center gap-1">
            <motion.button 
                animate={controls}
                onClick={onCartClick}
                className="relative p-2 hover:scale-110 transition-all duration-300 group"
            >
                <svg 
                    width="18" 
                    height="18" 
                    lg:width="20" 
                    lg:height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    className="group-hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]"
                >
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 01-8 0"></path>
                </svg>
                {cartCount > 0 && (
                    <span className="absolute top-0 right-0 lg:-top-1 lg:-right-1 bg-white text-black text-[8px] font-black w-3.5 h-3.5 flex items-center justify-center rounded-full border border-black/20 shadow-lg">
                    {cartCount}
                    </span>
                )}
            </motion.button>

            <button 
                onClick={onMenuClick}
                className="lg:hidden text-white hover:text-white transition-all duration-300 p-2"
            >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12"></line>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
            </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
