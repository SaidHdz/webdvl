import React, { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';

/**
 * Highly polished Product Card with dynamic themes, 
 * break-out imagery, and refined brand typography.
 * Optimized for mobile with larger image area and full-width buttons.
 */
const ProductCard = ({ product, onClick }) => {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const mainImage = product.images?.white?.[0] || product.images?.black?.[0];
  const soldOut = product.stock_actual <= 0;

  const theme = useMemo(() => {
    const name = product.name.toLowerCase();
    const isPurple = name.includes('slime') || name.includes('eyes');
    const isYellow = name.includes('heart');
    const isGreen = name.includes('flowers');
    const isRed = (name.includes('devil') && !name.includes('beanie')) || name.includes('voodoo') || name.includes('diavloo') || name.includes('see you');

    if (isPurple) return { accent: '#a855f7', glow: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.3)', button: 'white', buttonText: 'black' };
    if (isYellow) return { accent: '#f1d069', glow: 'rgba(241, 208, 105, 0.15)', border: 'rgba(241, 208, 105, 0.3)', button: 'black', buttonText: 'white' };
    if (isGreen) return { accent: '#32a83e', glow: 'rgba(50, 168, 62, 0.15)', border: 'rgba(50, 168, 62, 0.3)', button: 'white', buttonText: 'black' };
    if (isRed) return { accent: '#bf4a4a', glow: 'rgba(191, 74, 74, 0.15)', border: 'rgba(191, 74, 74, 0.3)', button: 'white', buttonText: 'black' };
    return { accent: '#ffffff', glow: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255, 255, 255, 0.2)', button: 'white', buttonText: 'black' };
  }, [product.name]);

  const toggleWishlist = (e) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
        toast.success('Añadido a deseos', {
            description: product.name,
            icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="#ff4444" stroke="#ff4444"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        });
    }
  };

  const handleQuickAdd = (e) => {
    e.stopPropagation();
    toast.info('Próximamente disponible', {
        description: 'Mantente atento al lanzamiento del DROP 01.',
        icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
    });
  };

  return (
    <article
      onClick={() => onClick(product)}
      className={`group relative border border-white/10 rounded-[32px] cursor-pointer transition-all duration-700 hover:scale-[1.03] shadow-2xl flex flex-col ${soldOut ? 'opacity-70' : ''}`}
      style={{
        '--accent-color': theme.accent,
        '--glow-color': theme.glow,
        '--border-hover': theme.border,
        backgroundColor: `${theme.accent}12`, // ~7% persistent tint
        isolation: 'isolate'
      }}
    >
      {/* 1. Base Layer (Solid background) */}
      <div className="absolute inset-0 bg-[#050505] rounded-[32px] -z-20 pointer-events-none" />

      {/* 2. Hover Tint Shift */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[32px] -z-10"
        style={{ backgroundColor: `${theme.accent}1A` }} // ~10% tint on hover
      />

      {/* 3. Themed Illumination */}
      <div 
        className="absolute inset-0 opacity-20 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none rounded-[32px] -z-10"
        style={{ background: `radial-gradient(circle at 50% 20%, ${theme.accent}40 0%, transparent 80%)` }}
      />
      
      {/* 4. Glossy Highlight */}
      <div 
        className="absolute inset-x-0 top-0 h-32 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[32px] -z-10"
        style={{ background: `linear-gradient(to bottom, ${theme.accent}15 0%, transparent 100%)` }}
      />
      
      {/* 5. Grain Texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none -z-10 mix-blend-overlay rounded-[32px]" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      {/* Header Visual: Image Section - Mobile optimized aspect ratio */}
      <div className="relative m-2 h-[260px] lg:h-[240px] bg-white/[0.03] rounded-[24px] flex items-center justify-center p-8 shrink-0 border border-white/5 group-hover:border-white/10 transition-colors z-40 overflow-visible">
        
        {/* Wishlist Toggle */}
        <button 
          className={`absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center backdrop-blur-md transition-all duration-300 z-50 group/wishlist ${isWishlisted ? 'bg-white border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]' : 'hover:bg-white/10'}`}
          onClick={toggleWishlist}
        >
          <svg 
            width="12" 
            height="12" 
            viewBox="0 0 24 24" 
            fill={isWishlisted ? "#ff4444" : "none"} 
            stroke={isWishlisted ? "#ff4444" : "currentColor"} 
            strokeWidth="3" 
            className={`transition-colors duration-300 ${isWishlisted ? '' : 'text-white/40 group-hover/wishlist:text-white'}`}
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        {/* The Break-out Image! */}
        <div className="relative group-hover:scale-135 group-hover:-translate-y-14 transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] w-full h-full flex items-center justify-center pointer-events-none">
          <img
            src={mainImage}
            alt={product.name}
            className="max-w-[100%] max-h-[100%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)] group-hover:drop-shadow-[0_60px_90px_rgba(0,0,0,0.9)] transition-all duration-700"
          />
        </div>

        {/* Sold Out UI */}
        {soldOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-20 rounded-[24px]">
            <span className="bg-white text-black text-[9px] font-black uppercase tracking-[4px] px-5 py-2 rounded-full">SOLD OUT</span>
          </div>
        )}
      </div>

      {/* Information Section */}
      <div className="p-6 pt-3 flex flex-col justify-between flex-grow z-10 relative">
        <div className="space-y-1.5">
          <div className="flex flex-col min-w-0">
            <h3 
              className="font-syne font-black text-xl lg:text-2xl uppercase tracking-tighter leading-[0.85] text-white group-hover:text-[var(--accent-color)] group-hover:scale-105 origin-left transition-all duration-500 truncate"
              style={{
                filter: 'drop-shadow(0 0 0px transparent)',
              }}
            >
              <span className="group-hover:[filter:drop-shadow(0_4px_12px_var(--accent-color))] transition-all duration-500">
                {product.name}
              </span>
            </h3>
            <p className="text-[#bf4a4a] text-[10px] font-black uppercase tracking-[4px] mt-1">
              {product.category || 'DROP'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mt-8 gap-6">
          <div className="flex items-baseline gap-1">
             <span className="text-white font-syne font-black text-3xl leading-none tracking-tighter">
                ${product.price}
             </span>
             <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">MXN</span>
          </div>

          {/* Technical ADD Button - Disabled for showcase */}
          <div 
            onClick={handleQuickAdd}
            className={`group/add w-full sm:w-12 h-14 sm:h-12 rounded-2xl sm:rounded-xl flex items-center justify-center border border-white/5 relative overflow-hidden transition-all duration-500 cursor-help opacity-40`}
          >
            {/* Hover Fill Effect (Subtle) */}
            <div className="absolute inset-0 bg-white/5 translate-y-full group-hover/add:translate-y-0 transition-transform duration-500 ease-expo" />
            
            {/* Mobile: Label + Icon | Desktop: Icon only */}
            <div className="relative z-10 flex items-center gap-3">
                <span className="sm:hidden font-syne font-black text-[11px] uppercase tracking-[3px] text-white/60">Espera al Drop</span>
                <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2.5" 
                    className="text-white/40"
                >
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Border Highlight */}
      <div className="absolute inset-0 border-2 border-[var(--accent-color)] opacity-0 group-hover:opacity-20 transition-opacity duration-700 rounded-[32px] pointer-events-none z-[5]" />
    </article>
  );
};

export default ProductCard;
