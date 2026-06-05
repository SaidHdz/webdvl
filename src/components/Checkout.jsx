import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { checkoutSchema } from '../schemas/validation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Checkout = ({ onBack, onSuccess }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      metodoEnvio: 'local',
      nombreCompleto: user?.name || '',
      telefono: '',
      puntoEntrega: 'Citadina',
      notas: ''
    }
  });

  const metodoEnvio = watch('metodoEnvio');

  const onSubmit = async (data) => {
    if (cart.length === 0) {
      toast.error('Tu carrito esta vacio');
      return;
    }
    setLoading(true);

    try {
      // 1. Stock Validation
      for (const item of cart) {
        const { data: inv, error: invError } = await supabase
          .from('inventory')
          .select('stock_actual')
          .eq('product_id', item.id)
          .single();
        
        if (invError || !inv || inv.stock_actual < (item.quantity || 1)) {
          throw new Error(`Stock insuficiente para ${item.name}`);
        }
      }

      // 2. Create Order
      const isNacional = data.metodoEnvio === 'nacional';
      const shippingCost = isNacional ? 150 : 0;
      const orderNumber = `ORD-${Date.now().toString().slice(-4)}`;
      
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          id_pedido: orderNumber,
          user_id: user?.id || null,
          id_cliente: user?.email || 'guest',
          nombre: data.nombreCompleto,
          telefono: data.telefono,
          total: cartTotal + shippingCost,
          estado: 'Pendiente',
          tipo_envio: isNacional ? 'Nacional' : 'Local',
          direccion: isNacional ? `${data.calle}, ${data.colonia}, ${data.ciudad}, CP: ${data.cp}` : null,
          punto_entrega: isNacional ? null : data.puntoEntrega,
        })
        .select()
        .single();
      
      if (orderError) throw orderError;

      // 3. Create Order Items and Update Inventory
      for (const item of cart) {
        const { error: itemError } = await supabase
          .from('order_items')
          .insert({
            order_id: order.id,
            product_id: item.id,
            id_producto: item.id_producto,
            cantidad: item.quantity || 1,
            precio_unitario: item.price
          });
        if (itemError) throw itemError;

        const { data: curInv } = await supabase.from('inventory').select('stock_actual').eq('product_id', item.id).single();
        const { error: updError } = await supabase
          .from('inventory')
          .update({ stock_actual: curInv.stock_actual - (item.quantity || 1) })
          .eq('product_id', item.id);
        if (updError) throw updError;
      }

      toast.success(`Pedido ${orderNumber} registrado con exito`);
      clearCart();
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up max-w-6xl mx-auto w-full h-full pb-4">
      <button 
        onClick={onBack}
        className="self-start text-[9px] uppercase font-black tracking-[3px] text-white/40 hover:text-white transition-all duration-300 flex items-center gap-2 group"
      >
        <span className="text-base group-hover:-translate-x-1 transition-transform">←</span> Revisar Carrito
      </button>

      <div className="grid lg:grid-cols-5 gap-6 items-start overflow-hidden">
        {/* Formulario de Envío */}
        <div className="lg:col-span-3 space-y-4 h-full overflow-y-auto pr-2 custom-scrollbar max-h-[calc(100vh-180px)]">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-6 rounded-[32px]">
            <h3 className="font-syne text-2xl font-black uppercase tracking-tighter text-white mb-6">Información de Entrega</h3>
            
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Nombre Completo</label>
                  <input 
                    {...register('nombreCompleto')}
                    type="text" 
                    className={`w-full bg-white/5 border ${errors.nombreCompleto ? 'border-red-500' : 'border-white/10'} rounded-xl px-5 py-3 text-white focus:border-white/40 outline-none transition-all placeholder:text-white/10 font-bold text-xs`}
                    placeholder="TU NOMBRE COMPLETO"
                  />
                  {errors.nombreCompleto && <p className="text-red-500 text-[8px] font-bold uppercase tracking-widest ml-4">{errors.nombreCompleto.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Teléfono</label>
                  <input 
                    {...register('telefono')}
                    type="tel" 
                    className={`w-full bg-white/5 border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-xl px-5 py-3 text-white focus:border-white/40 outline-none transition-all placeholder:text-white/10 font-mono text-xs`}
                    placeholder="(899) 123-4567"
                  />
                  {errors.telefono && <p className="text-red-500 text-[8px] font-bold uppercase tracking-widest ml-4">{errors.telefono.message}</p>}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Modalidad de Envío</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`p-3 rounded-xl border-2 transition-all duration-300 text-center cursor-pointer ${metodoEnvio === 'local' ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}>
                    <input {...register('metodoEnvio')} type="radio" value="local" className="hidden" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Local</p>
                    <p className="text-[7px] opacity-60 font-bold uppercase">Reynosa</p>
                  </label>
                  <label className={`p-3 rounded-xl border-2 transition-all duration-300 text-center cursor-pointer ${metodoEnvio === 'nacional' ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}>
                    <input {...register('metodoEnvio')} type="radio" value="nacional" className="hidden" />
                    <p className="text-[9px] font-black uppercase tracking-widest">Nacional</p>
                    <p className="text-[7px] opacity-60 font-bold uppercase">Todo México</p>
                  </label>
                </div>
              </div>

              {metodoEnvio === 'local' ? (
                <div className="space-y-2 animate-fade-in">
                  <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Punto de Recolección</label>
                  <select 
                    {...register('puntoEntrega')}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-white/40 appearance-none cursor-pointer font-bold text-[11px]"
                  >
                    <option value="Citadina" className="bg-zinc-900 text-white">CITADINA (Reynosa)</option>
                    <option value="Periférico" className="bg-zinc-900 text-white">PERIFÉRICO</option>
                    <option value="Plaza Real" className="bg-zinc-900 text-white">PLAZA REAL (HEB)</option>
                  </select>
                </div>
              ) : (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Calle y Número</label>
                          <input 
                              {...register('calle')}
                              type="text"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-white/40 text-[11px] font-bold uppercase"
                          />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Colonia</label>
                          <input 
                              {...register('colonia')}
                              type="text"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-white/40 text-[11px] font-bold uppercase"
                          />
                      </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-1 col-span-2">
                          <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Ciudad y Estado</label>
                          <input 
                              {...register('ciudad')}
                              type="text"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-white/40 text-[11px] font-bold uppercase"
                          />
                      </div>
                      <div className="space-y-1 col-span-1">
                          <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">C.P.</label>
                          <input 
                              {...register('cp')}
                              type="text"
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-white/40 text-[11px] font-mono font-bold"
                          />
                      </div>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Notas (Opcional)</label>
                <textarea 
                  {...register('notas')}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-white/40 outline-none transition-all placeholder:text-white/10 text-[11px] font-medium min-h-[80px] resize-none"
                  placeholder="INDICACIONES ESPECIALES..."
                ></textarea>
              </div>
            </form>
          </div>
        </div>

        {/* Resumen de Orden */}
        <div className="lg:col-span-2">
          <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-8 rounded-[32px] shadow-2xl">
            <h3 className="font-syne text-xl font-black uppercase tracking-tighter text-white mb-6 border-b border-white/5 pb-3">Resumen</h3>
            
            <div className="space-y-4 mb-6 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-3 items-center border-b border-[#1a1a1a] pb-3 last:border-0">
                  <div className="w-10 h-10 bg-white/[0.03] rounded-lg border border-white/5 overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="text-[10px] font-bold uppercase text-white truncate">{item.name}</p>
                    <p className="text-[8px] uppercase font-bold text-white/40 tracking-widest">
                        {item.size} x{item.quantity} — <span className="text-white font-black">${item.price * item.quantity}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-widest text-white/30">
                <span>Subtotal</span>
                <span className="text-white font-mono">${cartTotal}</span>
              </div>
              <div className="flex justify-between items-center text-[9px] uppercase font-bold tracking-widest text-white/30">
                <span>Envío</span>
                <span className={`font-black ${metodoEnvio === 'local' ? 'text-[#66278b]' : 'text-white'}`}>
                  {metodoEnvio === 'local' ? 'SIN CARGO' : '$150'}
                </span>
              </div>
              <div className="pt-6 border-t border-[#1a1a1a]">
                <span className="text-[8px] font-black uppercase tracking-[5px] text-white/20 block mb-1 text-center">Total</span>
                <p className="text-4xl font-syne font-black text-white leading-none text-center tracking-tighter">
                  ${cartTotal + (metodoEnvio === 'local' ? 0 : 150)}
                </p>
              </div>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={loading || cart.length === 0}
              className={`w-full bg-white text-black py-5 rounded-xl font-black text-[10px] uppercase tracking-[4px] mt-8 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)] active:scale-95 ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? 'Procesando...' : 'Finalizar Compra'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
