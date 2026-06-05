import React, { useState, useEffect } from 'react';

import logo from '../assets/logo_dvl.png';

const Hero = ({ onExploreClick }) => {
  const targetDate = new Date('2026-09-30T00:00:00');
  
  const calculateTimeLeft = () => {
    const difference = +targetDate - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        días: Math.floor(difference / (1000 * 60 * 60 * 24)),
        horas: Math.floor((difference / (1000 * 60 * 60)) % 24),
        mins: Math.floor((difference / 1000 / 60) % 60),
        segs: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center overflow-hidden mb-20 pt-32 lg:pt-32">
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

      <div className="relative z-10 space-y-12 px-6 max-w-5xl animate-fade-in flex flex-col items-center w-full">
        <img 
            src={logo} 
            alt="DVL Supply" 
            className="w-[200px] sm:w-[300px] md:w-[450px] h-auto object-contain mb-4 animate-float drop-shadow-[0_0_50px_rgba(255,255,255,0.1)]" 
        />
        
        <div className="space-y-6">
          <p className="text-white/60 font-black text-xl md:text-2xl uppercase tracking-[0.2em] max-w-4xl mx-auto leading-relaxed">
            EL MUNDO YA TIENE DEMASIADA ROPA ABURRIDA. <br className="hidden md:block" />
            CREADO POR MÍ, PARA LOS QUE BUSCAN ROZAR MI FLOW.
          </p>
          
          {/* Countdown Timer - Technical UI */}
          <div className="pt-4 space-y-4">
             <p className="text-[#bf4a4a] text-[10px] font-black uppercase tracking-[6px] animate-pulse">Lanzamiento Oficial Drop 01</p>
             <div className="flex justify-center gap-4 sm:gap-8">
                {Object.entries(timeLeft).length > 0 ? (
                    Object.entries(timeLeft).map(([unit, value]) => (
                        <div key={unit} className="flex flex-col items-center">
                            <div className="bg-white/5 border border-white/10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center backdrop-blur-xl">
                                <span className="text-2xl sm:text-3xl font-syne font-black text-white tabular-nums leading-none">
                                    {String(value).padStart(2, '0')}
                                </span>
                            </div>
                            <span className="text-[8px] font-black uppercase tracking-[3px] text-white/30 mt-3">{unit}</span>
                        </div>
                    ))
                ) : (
                    <p className="text-white font-black uppercase tracking-[5px] text-sm">DROP DISPONIBLE</p>
                )}
             </div>
          </div>
        </div>

        <div className="pt-4">
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
