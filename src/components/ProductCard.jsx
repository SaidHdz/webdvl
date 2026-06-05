import React from 'react';
import TiltedCard from './ui/TiltedCard';

/**
 * Premium technical product card design.
 * Features a charcoal container, capsule-style image section with gradient,
 * and a high-impact asymmetric info layout.
 */
const ProductCard = ({ product, onClick }) => {
  const mainImage = product.images?.white?.[0] || product.images?.black?.[0];
  const soldOut = product.stock_actual <= 0;

  return (
    <article
      onClick={() => onClick(product)}
      className={`group relative bg-[#1C1C1C] border border-white/80 rounded-[28px] lg:rounded-[32px] cursor-pointer transition-all duration-500 hover:scale-[1.02] shadow-2xl overflow-hidden flex flex-col ${soldOut ? 'opacity-70' : ''}`}
    >
      {/* 1. Upper Section: Capsule Image Container with Gradient */}
      <div className="relative m-1.5 lg:m-2 mb-0 h-[180px] lg:h-[220px] bg-gradient-to-br from-[#E5E7EB] to-white rounded-t-[20px] lg:rounded-t-[24px] rounded-b-[28px] lg:rounded-b-[32px] overflow-hidden flex items-center justify-center shrink-0">
        
        {/* Wishlist Button */}
        <button 
          className="absolute top-3 right-3 lg:top-4 lg:right-4 w-7 h-7 lg:w-8 lg:h-8 rounded-full border border-white/40 flex items-center justify-center backdrop-blur-sm hover:bg-white/10 transition-colors z-10"
          onClick={(e) => { e.stopPropagation(); /* Wishlist */ }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.84-8.84 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>

        {/* Product Image with Tilt Effect */}
        <TiltedCard
          imageSrc={mainImage}
          altText={product.name}
          captionText={product.name}
          containerHeight="100%"
          containerWidth="100%"
          imageHeight="100%"
          imageWidth="100%"
          rotateAmplitude={12}
          scaleOnHover={1.15}
          showMobileWarning={false}
          showTooltip={false}
        />

        {/* Sold Out Badge */}
        {soldOut && (
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="bg-[#1C1C1C] text-white text-[7px] lg:text-[8px] font-black uppercase tracking-[2px] px-3 py-1 rounded-full border border-white/20">Agotado</span>
          </div>
        )}
      </div>

      {/* 2. Lower Section: Information & CTA */}
      <div className="p-4 lg:p-6 pt-4 lg:pt-5 flex flex-col justify-between flex-grow">
        <div className="flex justify-between items-start gap-2">
          <div className="flex flex-col min-w-0">
            <h3 className="text-white font-semibold text-sm lg:text-base leading-tight truncate">
              {product.name}
            </h3>
            <p className="text-[#8E8E93] text-[9px] lg:text-[11px] font-medium uppercase tracking-wider mt-0.5">
              {product.category || 'DVL Supply Co.'}
            </p>
          </div>
        </div>

        <div className="flex justify-between items-end mt-4 lg:mt-6">
          <div className="text-white font-bold text-lg lg:text-xl leading-none">
            <span className="mr-0.5">$</span>{product.price}
          </div>

          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-white rounded-lg lg:rounded-xl flex items-center justify-center shadow-lg transform transition-transform group-hover:scale-110">
            <svg width="14" height="14" lg:width="18" lg:height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
              <path d="M3 6h18"></path>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
              <path d="M12 12v6m-2-2 2-2 2 2"></path>
            </svg>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ProductCard;
