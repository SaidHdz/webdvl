import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

/**
 * Premium Sidebar Cart Drawer.
 * Features inline variant editing (Size/Color) and polished item visualization.
 */
const CartDrawer = ({ isOpen, onClose, onCheckout, onScrollToCollection }) => {
  const { cart, updateQuantity, removeFromCart, updateCartItem, cartTotal } = useCart();
  const [editingIndex, setIsEditingIndex] = useState(null);

  const toggleEdit = (index) => {
    setIsEditingIndex(editingIndex === index ? null : index);
  };

  const handleUpdateVariant = (index, field, value) => {
    const item = cart[index];
    const updatedItem = { ...item, [field]: value };
    
    // If color changes, resolve new image
    if (field === 'color') {
        updatedItem.image = item.images?.[value.toLowerCase()]?.[0] || item.images?.white?.[0] || item.image;
    }
    
    updateCartItem(index, updatedItem);
  };

  return (
    <>
      {/* Overlay with deep blur */}
      <div 
        className={`fixed inset-0 bg-black/90 backdrop-blur-md z-[150] transition-opacity duration-700 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside 
        className={`fixed top-0 right-0 w-full max-w-[480px] h-full bg-[#050505] z-[200] border-l border-white/5 shadow-[[-20px_0_60px_rgba(0,0,0,0.8)]] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Grain Texture Layer */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0 mix-blend-overlay" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
        />

        {/* Header - "FLOW" Focus */}
        <div className="relative z-10 px-8 py-10 flex justify-between items-center border-b border-white/5">
          <div className="space-y-1">
            <h2 className="text-2xl font-syne font-black uppercase tracking-tighter text-white">TU FLOW</h2>
            <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-pulse" />
                <p className="text-[9px] font-black text-white/30 uppercase tracking-[4px]">{cart.length} PIEZAS SELECCIONADAS</p>
            </div>
          </div>
          <button onClick={onClose} className="group w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-all border border-white/5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white/40 group-hover:text-white transition-colors group-hover:rotate-90 transition-transform duration-500">
                <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        {/* Content Section */}
        <div className="relative z-10 flex-grow overflow-y-auto px-8 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-8 animate-fade-in">
               <div className="relative">
                    <div className="absolute inset-0 bg-[#a855f7] blur-3xl opacity-5 rounded-full" />
                    <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.5" className="opacity-10">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 01-8 0"></path>
                    </svg>
               </div>
               
               <div className="text-center space-y-4">
                    <p className="font-syne uppercase font-black tracking-[0.6em] text-sm text-white/20">Flow Vacío</p>
                    <button 
                      onClick={() => { onClose(); setTimeout(() => onScrollToCollection?.('Todas'), 300); }}
                      className="px-8 py-3 bg-white text-black font-black text-[10px] uppercase tracking-[3px] rounded-full hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                      Explorar Drops
                    </button>
               </div>
            </div>
          ) : (
            <div className="flex flex-col py-8 gap-8">
              {cart.map((item, index) => (
                <div key={`${item.id}-${item.size}-${item.color}-${index}`} className="group relative flex flex-col animate-slide-up border-b border-white/5 pb-8 last:border-0 last:pb-0">
                  <div className="flex gap-6">
                    {/* Themed Thumbnail */}
                    <div className="relative w-28 h-28 bg-white/[0.03] rounded-3xl overflow-hidden border border-white/5 shrink-0 transition-all duration-500 group-hover:border-white/10 group-hover:bg-white/[0.05]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-contain p-3 transition-transform duration-700 group-hover:scale-110 drop-shadow-2xl"
                        />
                    </div>
                    
                    {/* Item Details */}
                    <div className="flex-grow flex flex-col justify-between py-1">
                        <div className="space-y-1">
                            <div className="flex justify-between items-start">
                                <h3 className="font-syne font-black text-sm text-white tracking-tight uppercase leading-none group-hover:text-[#a855f7] transition-colors">{item.name}</h3>
                                <button 
                                    onClick={() => removeFromCart(index)} 
                                    className="w-6 h-6 rounded-lg bg-red-500/5 text-red-500/20 hover:bg-red-500/20 hover:text-red-500 transition-all flex items-center justify-center border border-red-500/10"
                                >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12"></path></svg>
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[3px]">
                                {item.size} <span className="mx-1 opacity-20">|</span> {item.color}
                                </p>
                                <button 
                                    onClick={() => toggleEdit(index)}
                                    className="text-[8px] font-black uppercase tracking-[2px] text-[#a855f7] hover:text-white transition-colors"
                                >
                                    {editingIndex === index ? '[ CERRAR ]' : '[ EDITAR ]'}
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex justify-between items-end">
                            <div className="flex items-center bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden p-0.5">
                                <button onClick={() => updateQuantity(index, -1)} className="w-7 h-7 flex items-center justify-center text-white/30 hover:bg-white/5 hover:text-white transition-all text-sm font-black">—</button>
                                <span className="px-2 text-xs font-black text-white min-w-[24px] text-center">{item.quantity}</span>
                                <button onClick={() => updateQuantity(index, 1)} className="w-7 h-7 flex items-center justify-center text-white/30 hover:bg-white/5 hover:text-white transition-all text-sm font-black">+</button>
                            </div>
                            <div className="text-right">
                                <span className="text-[8px] font-black text-white/10 uppercase tracking-[2px] block mb-0.5">Inversión</span>
                                <p className="text-white font-syne font-black text-lg tracking-tighter">${item.price * item.quantity}</p>
                            </div>
                        </div>
                    </div>
                  </div>

                  {/* Inline Edit Section */}
                  <AnimatePresence>
                    {editingIndex === index && (
                        <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-white/[0.02] rounded-2xl mt-4 p-4 border border-white/5 space-y-4"
                        >
                            {/* Size Selection */}
                            <div className="space-y-2">
                                <span className="text-[8px] font-black uppercase tracking-[3px] text-white/20">Talla</span>
                                <div className="flex gap-2">
                                    {(item.category === 'Gorro' ? ['Unitalla'] : ['S', 'M', 'L', 'XL']).map(s => (
                                        <button 
                                            key={s}
                                            onClick={() => handleUpdateVariant(index, 'size', s)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all border ${item.size === s ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Color Selection */}
                            <div className="space-y-2">
                                <span className="text-[8px] font-black uppercase tracking-[3px] text-white/20">Color</span>
                                <div className="flex gap-2">
                                    {['Blanco', 'Negro'].map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => handleUpdateVariant(index, 'color', c)}
                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black transition-all border ${item.color === c ? 'bg-white text-black border-white' : 'bg-transparent text-white/40 border-white/10 hover:border-white/30'}`}
                                        >
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Summary */}
        <div className="relative z-10 p-8 space-y-8 bg-[#0a0a0a] border-t border-white/10">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-white/30">
                <span className="text-[10px] font-black uppercase tracking-[4px]">Logística Estimada</span>
                <span className="text-[9px] font-black uppercase tracking-[2px] opacity-40">Pendiente</span>
            </div>
            <div className="flex justify-between items-end">
                <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black tracking-[6px] text-[#a855f7]">Total Flow</span>
                    <h4 className="text-white/20 text-[8px] font-black uppercase tracking-[2px]">Neto en Pesos Mexicanos</h4>
                </div>
                <span className="text-5xl font-syne font-black text-white tracking-tighter leading-none">${cartTotal}</span>
            </div>
          </div>
          
          <button 
            onClick={onCheckout}
            disabled={cart.length === 0}
            className={`group relative w-full rounded-2xl py-6 overflow-hidden transition-all duration-700 ${cart.length === 0 ? 'bg-white/5 text-white/10 cursor-not-allowed border border-white/5' : 'bg-white text-black hover:shadow-[0_0_50px_rgba(168,85,247,0.3)] active:scale-95'}`}
          >
            {/* Pulsing Button Glow */}
            {!cart.length === 0 && (
                <div className="absolute inset-0 bg-[#a855f7]/0 group-hover:bg-[#a855f7]/10 transition-colors duration-500" />
            )}
            <span className="relative z-10 font-syne font-black text-sm uppercase tracking-[5px]">Check out</span>
          </button>

          <p className="text-center text-[8px] font-bold text-white/10 uppercase tracking-[3px]">
            Transacción encriptada de grado militar
          </p>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
