import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const ProductDetail = ({ product, onBack }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('white');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  const imagesList = product.images[selectedColor] || [];

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setCurrentImageIndex(0);
  };

  const handleNextImage = () => {
    if (imagesList.length > 1) {
      setIsFading(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev + 1) % imagesList.length);
        setIsFading(false);
      }, 200);
    }
  };

  const handlePrevImage = () => {
    if (imagesList.length > 1) {
      setIsFading(true);
      setTimeout(() => {
        setCurrentImageIndex((prev) => (prev - 1 + imagesList.length) % imagesList.length);
        setIsFading(false);
      }, 200);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, selectedSize, selectedColor, imagesList[currentImageIndex], user);
    // Podríamos disparar un pequeño efecto visual aquí
  };

  return (
    <div className="flex flex-col gap-10 animate-slide-up max-w-4xl mx-auto">
      <button 
        onClick={onBack}
        className="self-start text-[10px] uppercase font-black tracking-[3px] text-white/40 hover:text-accent transition-all duration-300 flex items-center gap-2 group"
      >
        <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Volver al Catálogo
      </button>

      <div className="grid lg:grid-cols-2 gap-12 items-start">
        {/* Carrusel Premium */}
        <div className="relative group bg-white/5 backdrop-blur-3xl rounded-[40px] p-8 border border-white/10 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-50" />
          <button onClick={handlePrevImage} className="absolute left-4 z-10 p-2 text-white/20 hover:text-accent transition-all text-2xl">❮</button>
          <img 
            src={imagesList[currentImageIndex]} 
            alt={product.name} 
            className={`relative z-0 w-full h-full object-contain transition-all duration-500 transform ${isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
          />
          <button onClick={handleNextImage} className="absolute right-4 z-10 p-2 text-white/20 hover:text-accent transition-all text-2xl">❯</button>
          
          {/* Indicador de imagen */}
          <div className="absolute bottom-6 flex gap-2">
            {imagesList.map((_, i) => (
              <div key={i} className={`h-1 transition-all duration-300 rounded-full ${i === currentImageIndex ? 'w-8 bg-accent' : 'w-2 bg-white/20'}`} />
            ))}
          </div>
        </div>

        {/* Info y Selectores */}
        <div className="flex flex-col gap-10 lg:pt-10">
          <div>
            <h2 className="font-syne text-5xl md:text-6xl font-black uppercase tracking-[-0.05em] leading-none mb-4 text-white">
              {product.name}
            </h2>
            <p className="text-accent font-bold text-xl tracking-[0.2em]">${product.price}</p>
          </div>

          <p className="text-white/60 leading-relaxed text-sm font-medium border-l-2 border-primary/40 pl-6 tracking-wide">
            {product.description}
          </p>

          <div className="space-y-12">
            {/* Tallas */}
            <div className="space-y-5">
              <span className="text-[10px] uppercase font-black tracking-[0.5em] text-white/30 block">Seleccionar Talla</span>
              <div className="flex gap-4">
                {['S', 'M', 'L'].map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 rounded-2xl font-black transition-all duration-300 border-2 tracking-tighter ${
                      selectedSize === size 
                      ? 'bg-white text-black border-white shadow-[0_0_25px_rgba(255,255,255,0.4)]' 
                      : 'bg-transparent text-white border-white/10 hover:border-white/40'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Colores */}
            <div className="space-y-5">
              <span className="text-[10px] uppercase font-black tracking-[0.5em] text-white/30 block">Variante de Color</span>
              <div className="flex gap-6">
                <button 
                  onClick={() => handleColorChange('white')}
                  className={`group relative w-12 h-12 rounded-full bg-white transition-all duration-500 ${selectedColor === 'white' ? 'ring-4 ring-primary ring-offset-8 ring-offset-black scale-110' : 'opacity-30 hover:opacity-100'}`}
                >
                   <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-black/20 to-transparent"></span>
                </button>
                <button 
                  onClick={() => handleColorChange('black')}
                  className={`group relative w-12 h-12 rounded-full bg-zinc-900 border border-white/10 transition-all duration-500 ${selectedColor === 'black' ? 'ring-4 ring-primary ring-offset-8 ring-offset-black scale-110' : 'opacity-30 hover:opacity-100'}`}
                >
                   <span className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 to-transparent"></span>
                </button>
              </div>
            </div>
          </div>

          <button 
            onClick={handleAddToCart}
            className="group relative w-full overflow-hidden rounded-3xl bg-white py-6 transition-all duration-500 hover:shadow-[0_0_50px_rgba(109,40,217,0.5)] active:scale-95 mt-4"
          >
            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <span className="relative z-10 font-syne font-black text-black group-hover:text-white uppercase tracking-[0.4em] text-sm transition-colors duration-500">
              Agregar al Carrito — ${product.price}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
