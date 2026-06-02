import React from 'react';

/**
 * Catalog card. Shows the product image with hover details and a stock badge:
 * "Agotado" when out of stock or "Ultimas piezas" when at/below the threshold.
 */
const ProductCard = ({ product, onClick }) => {
  // Default to the white variant image for the catalog thumbnail.
  const mainImage = product.images?.white?.[0] || product.images?.black?.[0];
  const soldOut = product.stock_actual <= 0;
  const lowStock = !soldOut && product.is_low;

  return (
    <article
      onClick={() => onClick(product)}
      className={`group relative bg-white/5 border border-white/10 rounded-[32px] p-3 cursor-pointer transition-all duration-500 hover:bg-white/10 hover:border-accent/40 aspect-[4/5] overflow-hidden ${soldOut ? 'opacity-60' : ''}`}
    >
      {/* Stock badge */}
      {soldOut ? (
        <span className="absolute top-5 left-5 z-20 bg-red-500 text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Agotado</span>
      ) : lowStock ? (
        <span className="absolute top-5 left-5 z-20 bg-neon-lime text-dark-card text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Ultimas piezas</span>
      ) : null}

      <div className="w-full h-full relative overflow-hidden rounded-[24px]">
        <img
          src={mainImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
          <p className="font-syne text-lg uppercase font-black text-white tracking-tighter translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
            {product.name}
          </p>
          <div className="flex justify-between items-center translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
            <p className="text-accent font-bold text-sm tracking-widest">${product.price}</p>
            <span className="text-[10px] text-white/60 font-bold tracking-widest uppercase">{soldOut ? 'Sin stock' : 'Ver Detalle'}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
