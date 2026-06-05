import React from 'react';
import { useNavigate } from 'react-router-dom';

import logo from '../assets/logo_dvl.png';

const Footer = () => {
  const navigate = useNavigate();
  return (
    <footer className="bg-[#0a0a0a] border-t border-white/5 pt-20 pb-10 px-8 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16 lg:gap-32 mb-20">
        
        {/* Brand Mission */}
        <div className="col-span-1 md:col-span-2 space-y-8">
          <img src={logo} alt="DVL Supply" className="h-16 w-auto object-contain opacity-80" />
          <p className="text-white/40 text-lg md:text-xl font-medium leading-relaxed max-w-2xl italic">
            El mundo ya tiene demasiada ropa aburrida y gente sin estilo. DVL es mi manifiesto: 
            piezas de edición limitada con un diseño impecable y un flow ridículo. Está hecha 
            para los que están listos para dejar de pasar desapercibidos e intentar rozar mi nivel. 
            Si no estás listo, la salida está arriba.
          </p>
        </div>

        {/* Links & Social */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-12">
          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[4px] text-white/20">Compañía</h3>
            <div className="flex flex-col gap-4">
                <button 
                    onClick={() => { window.scrollTo({ top: 0 }); navigate('/about'); }}
                    className="text-white hover:text-accent transition-all font-bold text-sm text-left flex items-center gap-2 group"
                >
                    Quienes Somos
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
                <button 
                    onClick={() => { window.scrollTo({ top: 0 }); navigate('/faq'); }}
                    className="text-white hover:text-accent transition-all font-bold text-sm text-left flex items-center gap-2 group"
                >
                    FAQs
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
                <button 
                    onClick={() => { window.scrollTo({ top: 0 }); navigate('/faq'); }}
                    className="text-white hover:text-accent transition-all font-bold text-sm text-left flex items-center gap-2 group"
                >
                    Devoluciones
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[4px] text-white/20">Social</h3>
            <div className="flex flex-col gap-4">
              <a 
                href="https://www.instagram.com/dvl.supply/?utm_source=ig_web_button_share_sheet" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-accent transition-all font-bold text-sm flex items-center gap-3 group"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40 group-hover:opacity-100 group-hover:text-accent transition-all">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
                Instagram
                <span className="opacity-0 group-hover:opacity-100 transition-opacity">↗</span>
              </a>
              <a 
                href="#" 
                className="text-white hover:text-accent transition-colors font-bold text-sm flex items-center gap-3 group opacity-30 cursor-not-allowed"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-40">
                  <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
                </svg>
                TikTok
              </a>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-[10px] font-black uppercase tracking-[4px] text-white/20">Ubicación</h3>
            <p className="text-white/60 text-sm font-medium tracking-tight">Reynosa, Tamaulipas, México.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
        <p className="text-[10px] font-black uppercase tracking-[2px] text-white/20">
          © {new Date().getFullYear()} DVL Supply Co. Todos los derechos reservados.
        </p>
        <div className="flex gap-8">
          <button className="text-[10px] font-black uppercase tracking-[2px] text-white/20 hover:text-white transition-colors">Términos</button>
          <button className="text-[10px] font-black uppercase tracking-[2px] text-white/20 hover:text-white transition-colors">Privacidad</button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
