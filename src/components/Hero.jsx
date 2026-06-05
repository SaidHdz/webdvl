import React from 'react';

import logo from '../assets/logo_dvl.png';

const Hero = ({ onExploreClick }) => {
  return (
    <section className="relative min-h-[80vh] flex flex-col items-center justify-center text-center overflow-hidden mb-20 pt-32 lg:pt-32">
      {/* Red Atmospheric Glow at Top */}
      <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-red-600/20 to-transparent z-0 pointer-events-none" />

      {/* Large Background Brand Text with Fade-out */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span 
          className="text-[25vw] font-black text-white/[0.02] tracking-tighter uppercase leading-none"
          style={{
            maskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 50%, transparent 95%)'
          }}
        >
          DVL SUPPLY
        </span>
      </div>

      {/* Background Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-transparent z-10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-[radial-gradient(circle,rgba(255,255,255,0.02)_0%,transparent_70%)] blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 space-y-8 px-6 max-w-5xl animate-fade-in flex flex-col items-center">
        <img 
            src={logo} 
            alt="DVL Supply" 
            className="w-[200px] sm:w-[300px] md:w-[500px] h-auto object-contain mb-8 animate-float drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]" 
        />
        
        <div className="space-y-6">
          <p className="text-white/60 font-black text-xl md:text-2xl uppercase tracking-[0.2em] max-w-4xl mx-auto leading-relaxed">
            SI TODOS LO TIENEN, <br className="hidden md:block" />
            DEFINITIVAMENTE NO ES <span className="text-white">DVL.</span>
          </p>
          <p className="text-white/20 text-[10px] md:text-xs font-black uppercase tracking-[0.6em] pt-2">
            DROP 01 — POR DIAVLO
          </p>
        </div>

        <div className="pt-10">
          <button 
            onClick={onExploreClick}
            className="bg-white text-black px-12 py-5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] hover:bg-transparent hover:text-white border border-white transition-all duration-500 shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95 group"
          >
            Ver Colección
            <span className="inline-block ml-4 group-hover:translate-y-1 transition-transform">↓</span>
          </button>
        </div>
      </div>

      {/* Decorative vertical line */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-white/20 to-transparent" />
    </section>
  );
};

export default Hero;
