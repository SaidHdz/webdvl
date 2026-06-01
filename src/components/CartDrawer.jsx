import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartDrawer = ({ isOpen, onClose, onCheckout }) => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[150] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside 
        className={`fixed top-0 right-0 w-full max-w-[450px] h-full bg-black/40 backdrop-blur-3xl z-[200] border-l border-white/5 shadow-2xl transition-transform duration-500 flex flex-col p-8 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-8">
          <h2 className="text-2xl font-syne font-black uppercase tracking-tight text-white">Tu Selección</h2>
          <button onClick={onClose} className="group p-2 text-white/40 hover:text-white transition-all">
            <span className="text-3xl font-light group-hover:rotate-90 block transition-transform">✕</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
               <svg 
                 width="64" 
                 height="64" 
                 viewBox="0 0 24 24" 
                 fill="none" 
                 stroke="currentColor" 
                 strokeWidth="1"
                 className="mb-4"
               >
                 <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4H6z"></path>
                 <line x1="3" y1="6" x2="21" y2="6"></line>
                 <path d="M16 10a4 4 0 01-8 0"></path>
               </svg>
               <p className="font-syne uppercase font-black tracking-[0.5em] text-[10px]">Vacío</p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {cart.map((item, index) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="group relative flex gap-6 items-center animate-fade-in border-b border-white/5 pb-6">
                  <div className="relative w-24 h-24 bg-white/5 rounded-2xl overflow-hidden border border-white/5 shrink-0">
                    <img 
                      src={item.image} 
                      alt={item.name} 
                      className="w-full h-full object-contain p-2"
                    />
                  </div>
                  
                  <div className="flex-grow space-y-1">
                    <h3 className="font-syne font-black text-sm uppercase tracking-tight">{item.name}</h3>
                    <p className="text-[9px] text-white/40 uppercase font-bold tracking-[2px]">
                      {item.size} <span className="mx-1">/</span> {item.color}
                    </p>
                    <p className="text-accent font-black text-sm pt-1">${item.price}</p>
                    
                    <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center bg-white/5 rounded-lg border border-white/10 overflow-hidden">
                            <button onClick={() => updateQuantity(index, -1)} className="px-3 py-1 text-white/40 hover:bg-white/10 hover:text-white transition-all">-</button>
                            <span className="px-1 text-[10px] font-black w-6 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(index, 1)} className="px-3 py-1 text-white/40 hover:bg-white/10 hover:text-white transition-all">+</button>
                        </div>
                        <button onClick={() => removeFromCart(index)} className="text-[9px] text-white/20 hover:text-red-500 uppercase font-black tracking-widest transition-colors">Eliminar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-8 mt-4 border-t border-white/5">
          <div className="flex justify-between items-end mb-8">
            <span className="text-[10px] uppercase font-black tracking-[4px] text-white/40">Total Estimado</span>
            <span className="text-4xl font-syne font-black text-white leading-none">${cartTotal}</span>
          </div>
          <button 
            onClick={onCheckout}
            disabled={cart.length === 0}
            className={`group relative w-full overflow-hidden rounded-2xl py-5 font-black text-sm tracking-[4px] transition-all duration-500 ${cart.length === 0 ? 'bg-white/5 text-white/20' : 'bg-white text-black hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}
          >
            <span className="relative z-10 uppercase">Finalizar Pedido</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default CartDrawer;
