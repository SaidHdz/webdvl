import React, { useState, useMemo, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
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
        
        {/* Full-Page Dynamic Background Glow - Spans the entire scrollable area */}
        <div 
            className="absolute inset-0 z-0 transition-all duration-1000 pointer-events-none opacity-100"
            style={{ 
                background: `radial-gradient(circle at ${isMobile ? '50% 30%' : '30% 50%'}, ${theme.glow} 0%, transparent 85%)`,
                minHeight: '100%'
            }}
        />

        <div className="flex flex-col lg:flex-row h-auto lg:h-screen relative z-10">
            
            {/* Product Section - Increased mobile top padding for better clearance from navigation */}
            <div className="lg:flex-[1.2] relative flex flex-col items-center justify-center p-3 lg:p-12 pt-44 lg:pt-16 shrink-0 overflow-hidden">
                {/* Main Product Image - Reverted to standard img for stability */}
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
                <div className="max-w-md w-full bg-white/[0.04] backdrop-blur-3xl border border-white/10 p-8 lg:p-11 rounded-[40px] lg:rounded-[48px] shadow-2xl animate-slide-up relative">
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
                            <div className="flex items-baseline gap-3"><span className="text-4xl font-black text-white">${product.price}</span><span className="text-sm font-black text-white/60 uppercase tracking-[0.2em]">MXN</span></div>

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
                                <span className="text-[9px] uppercase font-black tracking-[4px] text-white/20">Talla</span>
                                <div className="flex gap-2">
                                    {(product.category === 'Gorro' ? ['Unitalla'] : ['S', 'M', 'L', 'XL']).map((size) => (
                                        <button key={size} onClick={() => setSelectedSize(size)} className={`w-11 h-11 rounded-xl font-black text-[10px] transition-all duration-300 border ${selectedSize === size ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/5 hover:border-white/20'}`}>{size}</button>
                                    ))}
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
    </div>
  );
};

export default ProductDetail;
