import React, { useState, useMemo, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useCart } from '../context/CartContext';

const ProductDetail = ({ product, onBack }) => {
  const { addToCart } = useCart();
  const soldOut = product.stock_actual <= 0;
  const [selectedSize, setSelectedSize] = useState(product.category === 'Gorro' ? 'Unitalla' : 'M');
  const [selectedColor, setSelectedColor] = useState('white');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1024 : false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  
  const btnControls = useAnimation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const theme = useMemo(() => {
    const name = product.name.toLowerCase();
    const isPurple = name.includes('slime') || name.includes('eyes');
    const isYellow = name.includes('heart');
    const isGreen = name.includes('flowers');
    const isRed = (name.includes('devil') && !name.includes('beanie')) || name.includes('voodoo') || name.includes('diavloo') || name.includes('see you');

    if (isPurple) return { accent: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)' };
    if (isYellow) return { accent: '#f1d069', glow: 'rgba(241, 208, 105, 0.6)' };
    if (isGreen) return { accent: '#32a83e', glow: 'rgba(50, 168, 62, 0.6)' };
    if (isRed) return { accent: '#bf4a4a', glow: 'rgba(191, 74, 74, 0.6)' };
    return { accent: '#ffffff', glow: 'rgba(255,255,255,0.15)' };
  }, [product.name]);

  const imagesList = product.images[selectedColor] || [];

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setCurrentImageIndex(0);
  };

  const handleThumbnailClick = (index) => {
    if (index === currentImageIndex) return;
    setIsFading(true);
    setTimeout(() => {
      setCurrentImageIndex(index);
      setIsFading(false);
    }, 200);
  };

  const handleAddToCart = async () => {
    btnControls.start({ scale: [1, 0.85, 1.15, 1], transition: { duration: 0.4, ease: "backOut" } });
    addToCart({
        ...product,
        size: selectedSize,
        color: selectedColor,
        image: imagesList[currentImageIndex]
    });
    toast.success('Agregado al flow', { description: `${product.name} — Talla ${selectedSize}` });
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050505] flex flex-col overflow-hidden">
      
      {/* 1. LAYER: FIXED NAVIGATION */}
      <nav className="fixed top-[80px] inset-x-0 p-6 lg:p-8 flex justify-between items-center z-[110] pointer-events-none">
        <button 
          onClick={onBack}
          className="pointer-events-auto bg-white/[0.04] backdrop-blur-3xl border border-white/10 text-white px-8 py-3 rounded-full text-[10px] uppercase font-black tracking-[3px] hover:bg-white hover:text-black transition-all group shadow-2xl"
        >
          <span className="inline-block group-hover:-translate-x-1 transition-transform mr-2">←</span> 
          Volver a la Colección
        </button>
      </nav>

      {/* 2. LAYER: SCROLLABLE CONTAINER */}
      <div className="flex-grow overflow-y-auto lg:overflow-hidden overflow-x-hidden custom-scrollbar relative z-10 pb-32 lg:pb-0">
        
        {/* Full-Page Dynamic Background Glow */}
        <div 
            className="absolute inset-0 z-0 transition-all duration-1000 pointer-events-none opacity-100"
            style={{ 
                background: `radial-gradient(circle at ${isMobile ? '50% 30%' : '30% 50%'}, ${theme.glow} 0%, transparent 85%)`,
                minHeight: '100%'
            }}
        />

        <div className="flex flex-col lg:flex-row h-auto lg:h-screen relative z-10">
            
            {/* Product Section */}
            <div className="lg:flex-[1.2] relative flex flex-col items-center justify-center p-3 lg:p-12 pt-44 lg:pt-16 shrink-0 overflow-hidden">
                <div className={`relative z-10 w-full h-[35vh] lg:h-[50vh] transition-all duration-700 transform ${isFading ? 'opacity-0 scale-95 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}`}>
                    <img 
                        src={imagesList[currentImageIndex]} 
                        alt={product.name} 
                        className="w-full h-full object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)] select-none" 
                    />
                </div>

                <div className="relative z-10 mt-8 lg:mt-0 lg:absolute lg:left-8 lg:top-1/2 lg:-translate-y-1/2 z-30 flex flex-row lg:flex-col gap-3 justify-center">
                    {imagesList.map((img, i) => (
                    <button key={i} onClick={() => handleThumbnailClick(i)} className={`w-12 h-12 lg:w-16 lg:h-16 rounded-xl border-2 overflow-hidden transition-all duration-500 bg-white/5 backdrop-blur-md shrink-0 ${i === currentImageIndex ? 'border-white scale-110 shadow-xl' : 'border-white/5 opacity-30 hover:opacity-80'}`}>
                        <img src={img} alt="Preview" className="w-full h-full object-cover" />
                    </button>
                    ))}
                </div>
            </div>

            {/* Information Card Section */}
            <div className="flex-1 flex items-start lg:items-center justify-center p-6 lg:p-12 z-20 pb-12">
                <div className="max-w-md w-full bg-white/[0.04] backdrop-blur-3xl border border-white/10 p-8 lg:p-11 rounded-[40px] lg:rounded-[48px] shadow-2xl animate-slide-up relative h-fit overflow-y-auto no-scrollbar max-h-[85vh]">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="text-[9px] font-black uppercase tracking-[3px] text-white/30">{product.category}</span>
                            <span className={`text-[8px] font-black uppercase tracking-[2px] px-3 py-1 rounded-full border ${soldOut ? 'bg-red-500/20 text-red-500 border-red-500/20' : product.is_low ? 'bg-amber-500/20 text-amber-500 border-amber-500/20' : 'bg-white/5 text-white/40 border-white/5'}`}>
                                {soldOut ? 'Sin Stock' : `${product.stock_actual} Disponibles`}
                            </span>
                        </div>

                        <div className="mb-6">
                            <h1 className="font-syne text-4xl lg:text-5xl font-black uppercase tracking-[-0.04em] leading-[0.9] text-white mb-4">{product.name}</h1>
                            <p className="text-white/60 text-sm lg:text-base font-bold italic leading-tight">"Diseño de edición limitada, {product.description?.split('/')[0] || '100% algodón oversize'}"</p>
                        </div>

                        <div className="space-y-7">
                            <div className="flex items-baseline gap-3">
                                <span className="text-4xl font-black text-white">${product.price}</span>
                                <span className="text-sm font-black text-white/60 uppercase tracking-[0.2em]">MXN</span>
                            </div>

                            <div className="space-y-3">
                                <span className="text-[9px] uppercase font-black tracking-[4px] text-white/20">Variante</span>
                                <div className="flex gap-4">
                                    {Object.keys(product.images).map((color) => (
                                        <button key={color} onClick={() => handleColorChange(color)} className={`w-9 h-9 rounded-full border-2 transition-all duration-500 relative flex items-center justify-center ${selectedColor === color ? 'border-white scale-110 shadow-lg' : 'border-white/10 opacity-40 hover:opacity-100'}`} style={{ backgroundColor: color === 'white' ? '#fff' : '#000' }}>
                                            {selectedColor === color && <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color === 'white' ? '#000' : '#fff' }} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] uppercase font-black tracking-[4px] text-white/20">Talla</span>
                                    {product.category !== 'Gorro' && (
                                        <button 
                                            onClick={() => setShowSizeGuide(true)}
                                            className="text-[8px] font-black uppercase tracking-[2px] text-[#a855f7] hover:text-white transition-colors flex items-center gap-2"
                                        >
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 12h10M7 8h10M7 16h10"/></svg>
                                            Guía de Tallas
                                        </button>
                                    )}
                                </div>
                                <div className="flex gap-2">
                                    {(product.category === 'Gorro' ? ['Unitalla'] : ['S', 'M', 'L', 'XL']).map((size) => (
                                        <button key={size} onClick={() => setSelectedSize(size)} className={`w-11 h-11 rounded-xl font-black text-[10px] transition-all duration-300 border ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/5 hover:border-white/20'}`}>{size}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Garment Care Section */}
                        <div className="mt-8 pt-8 border-t border-white/5 space-y-4">
                            <span className="text-[9px] uppercase font-black tracking-[4px] text-white/20">Instrucciones de Cuidado</span>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><path d="M12 2L3 7v10l9 5 9-5V7l-9-5zM12 22V12M21 7l-9 5M3 7l9 5"/></svg>
                                    <span className="text-[7px] font-black text-white/30 uppercase text-center tracking-tighter">Lavar al Revés</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0M4.93 4.93l14.14 14.14"/></svg>
                                    <span className="text-[7px] font-black text-white/30 uppercase text-center tracking-tighter">Sin Secadora</span>
                                </div>
                                <div className="flex flex-col items-center gap-2 p-3 bg-white/5 rounded-2xl">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/40"><path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/><path d="M13 19v-4M10 17h6"/></svg>
                                    <span className="text-[7px] font-black text-white/30 uppercase text-center tracking-tighter">No Planchar Gráfico</span>
                                </div>
                            </div>
                        </div>

                        <motion.button animate={btnControls} onClick={handleAddToCart} disabled={soldOut} className={`w-full mt-8 py-5 rounded-[20px] font-black uppercase tracking-[4px] text-[11px] transition-all duration-500 ${soldOut ? 'bg-white/5 text-white/20 cursor-not-allowed' : 'bg-white text-black hover:shadow-[0_20px_40px_rgba(255,255,255,0.1)] active:scale-95'}`}>
                            {soldOut ? 'Agotado' : 'Añadir al Carrito'}
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* SIZE GUIDE MODAL */}
      <AnimatePresence>
        {showSizeGuide && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6"
                onClick={() => setShowSizeGuide(false)}
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.9, y: 20 }}
                    className="bg-[#1C1C1C] border border-white/10 p-8 lg:p-12 rounded-[48px] max-w-2xl w-full space-y-10"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="flex justify-between items-start">
                        <div className="space-y-2">
                            <h2 className="text-3xl font-syne font-black uppercase tracking-tighter text-white">GUÍA DE ROPA</h2>
                            <p className="text-[10px] font-black uppercase tracking-[4px] text-[#bf4a4a]">Corte Oversize Industrial</p>
                        </div>
                        <button onClick={() => setShowSizeGuide(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="py-4 text-[10px] font-black uppercase tracking-[3px] text-white/20">Talla</th>
                                    <th className="py-4 text-[10px] font-black uppercase tracking-[3px] text-white/20">Ancho (cm)</th>
                                    <th className="py-4 text-[10px] font-black uppercase tracking-[3px] text-white/20">Alto (cm)</th>
                                </tr>
                            </thead>
                            <tbody className="text-white font-black text-sm">
                                <tr className="border-b border-white/5">
                                    <td className="py-4 font-syne">S</td>
                                    <td className="py-4">54</td>
                                    <td className="py-4">70</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="py-4 font-syne text-[#bf4a4a]">M</td>
                                    <td className="py-4">57</td>
                                    <td className="py-4">73</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="py-4 font-syne">L</td>
                                    <td className="py-4">60</td>
                                    <td className="py-4">76</td>
                                </tr>
                                <tr className="border-b border-white/5">
                                    <td className="py-4 font-syne">XL</td>
                                    <td className="py-4">63</td>
                                    <td className="py-4">79</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="p-6 bg-white/[0.02] border border-dashed border-white/10 rounded-3xl">
                        <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest leading-relaxed">
                            Nota: Las medidas pueden variar +/- 1.5cm por el proceso de confección manual. Nuestras prendas tienen un corte intencionalmente amplio.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
