import React from 'react';

const ProductCard = ({ product, onClick }) => {
  // Usamos la imagen blanca por defecto para el catálogo
  const mainImage = product.images.white[0];

  return (
    <article 
      onClick={() => onClick(product)}
      className="group relative bg-white/5 border border-white/10 rounded-[32px] p-3 cursor-pointer transition-all duration-500 hover:bg-white/10 hover:border-accent/40 aspect-[4/5] overflow-hidden"
    >
      <div className="w-full h-full relative overflow-hidden rounded-[24px]">
        <img 
          src={mainImage} 
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Overlay de información premium */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
           <p className="font-syne text-lg uppercase font-black text-white tracking-tighter translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
             {product.name}
           </p>
           <div className="flex justify-between items-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
             <p className="text-accent font-bold text-sm tracking-widest">${product.price}</p>
             <span className="text-[10px] text-white/60 font-bold tracking-widest uppercase">Ver Detalle</span>
           </div>
        </div>
      </div>
      
      {/* Indicador de color discreto */}
      <div className="absolute top-6 right-6 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
         <div className="w-2 h-2 rounded-full bg-white border border-black/20"></div>
         <div className="w-2 h-2 rounded-full bg-black border border-white/20"></div>
      </div>
    </article>
  );
};

export default ProductCard;
