import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[150] transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside 
        className={`fixed top-0 right-0 w-full max-w-[450px] h-full bg-[#0a0a0a] z-[200] border-l border-white/5 shadow-2xl transition-transform duration-700 ease-expo flex flex-col p-8 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center pb-8 border-b border-[#1a1a1a]">
          <div className="space-y-1">
            <h2 className="text-xl font-syne font-black uppercase tracking-tight text-white">Tu Selección</h2>
            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[2px]">{cart.length} Artículos</p>
          </div>
          <button onClick={onClose} className="group p-2 text-white/20 hover:text-white transition-all">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:rotate-90 transition-transform duration-500">
                <path d="M18 6L6 18M6 6l12 12"></path>
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center space-y-6">
               <div className="relative">
                    <svg 
                        width="80" 
                        height="80" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="rgba(255,255,255,0.05)" 
                        strokeWidth="1"
                    >
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 01-8 0"></path>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[8px] font-black uppercase tracking-[3px] text-white/10">DVL</span>
                    </div>
               </div>
               
               <div className="text-center space-y-2">
                    <p className="font-syne uppercase font-black tracking-[0.4em] text-xs text-white/40">El carrito está vacío</p>
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest leading-relaxed">Agrega productos desde la colección <br/> para continuar.</p>
               </div>

               <button 
                 onClick={() => { onClose(); setTimeout(() => onScrollToCollection?.('Todas'), 300); }}
                 className="text-[10px] font-black uppercase tracking-[4px] text-white/60 hover:text-white border-b border-white/10 pb-1 transition-all"
               >
                 Ver Colección
               </button>
            </div>
          ) : (
            <div className="flex flex-col py-6">
              {cart.map((item, index) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="group relative flex gap-6 items-center animate-fade-in border-b border-[#1a1a1a] py-6 last:border-0">
                  <div className="relative w-20 h-20 bg-white/[0.02] rounded-2xl overflow-hidden border border-white/5 shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  
                  <div className="flex-grow space-y-1">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-sm text-white tracking-tight leading-none">{item.name}</h3>
                        <button onClick={() => removeFromCart(index)} className="text-[#ff4444]/40 hover:text-[#ff4444] transition-colors p-1">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                        </button>
                    </div>
                    <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest">
                      {item.size} — {item.color}
                    </p>
                    
                    <div className="flex justify-between items-end pt-3">
                        <div className="flex items-center bg-white/[0.03] rounded-xl border border-white/5 overflow-hidden">
                            <button onClick={() => updateQuantity(index, -1)} className="px-3 py-2 text-white/30 hover:bg-white/5 hover:text-white transition-all text-xs">—</button>
                            <span className="px-1 text-[11px] font-black w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(index, 1)} className="px-3 py-2 text-white/30 hover:bg-white/5 hover:text-white transition-all text-xs">+</button>
                        </div>
                        <p className="text-white font-black text-sm tracking-tight">${item.price}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-8 space-y-6 border-t border-[#1a1a1a]">
          <div className="space-y-4">
            <div className="flex justify-between items-center text-white/30">
                <span className="text-[10px] font-black uppercase tracking-[3px]">Subtotal</span>
                <span className="text-xs font-bold font-mono tracking-tighter">${cartTotal}</span>
            </div>
            <div className="flex justify-between items-center text-white/20 border-b border-dashed border-white/5 pb-4">
                <span className="text-[9px] font-black uppercase tracking-[3px]">Envío</span>
                <span className="text-[9px] font-black uppercase tracking-[2px]">Calculado al finalizar</span>
            </div>
            <div className="flex justify-between items-end pt-2">
                <span className="text-[10px] uppercase font-black tracking-[4px] text-white/60">Total Estimado</span>
                <span className="text-4xl font-syne font-black text-white leading-none">${cartTotal}</span>
            </div>
          </div>
          
          <button 
            onClick={onCheckout}
            disabled={cart.length === 0}
            className={`w-full rounded-2xl py-6 font-black text-xs tracking-[4px] transition-all duration-500 border ${cart.length === 0 ? 'bg-transparent text-white/10 border-white/5 cursor-not-allowed' : 'bg-white text-black border-white hover:bg-transparent hover:text-white hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] active:scale-95'}`}
          >
            <span className="uppercase">Finalizar Pedido</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
