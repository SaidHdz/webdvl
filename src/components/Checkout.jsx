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
      puntoEntrega: 'Citadina'
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
        // Add item
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

        // Decrease stock
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
    <div className="flex flex-col gap-12 animate-slide-up max-w-5xl mx-auto w-full pb-20">
      <button 
        onClick={onBack}
        className="self-start text-[10px] uppercase font-black tracking-[3px] text-white/40 hover:text-white transition-all duration-300 flex items-center gap-2 group"
      >
        <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Revisar Carrito
      </button>

      <div className="grid lg:grid-cols-5 gap-12">
        {/* Formulario de Envío */}
        <div className="lg:col-span-3 space-y-8">
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[40px]">
            <h3 className="font-syne text-3xl font-black uppercase tracking-tighter text-white mb-8">Información de Entrega</h3>
            
            <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <div className="flex flex-col gap-6">
                <div className="space-y-4">
                  <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">Nombre Completo</label>
                  <input 
                    {...register('nombreCompleto')}
                    type="text" 
                    className={`w-full bg-white/5 border ${errors.nombreCompleto ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-white focus:border-white/40 outline-none transition-all placeholder:text-white/10`}
                    placeholder="TU NOMBRE COMPLETO"
                  />
                  {errors.nombreCompleto && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest ml-4">{errors.nombreCompleto.message}</p>}
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">Teléfono (10 dígitos)</label>
                  <input 
                    {...register('telefono')}
                    type="tel" 
                    className={`w-full bg-white/5 border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-white focus:border-white/40 outline-none transition-all placeholder:text-white/10`}
                    placeholder="8991234567"
                  />
                  {errors.telefono && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest ml-4">{errors.telefono.message}</p>}
                </div>

                <div className="space-y-4">
                  <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">Modalidad de Envío</label>
                  <div className="grid grid-cols-2 gap-4">
                    <label className={`p-4 rounded-2xl border-2 transition-all duration-300 text-center cursor-pointer ${metodoEnvio === 'local' ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}>
                      <input {...register('metodoEnvio')} type="radio" value="local" className="hidden" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Local</p>
                      <p className="text-[8px] opacity-60">Reynosa, Tamps.</p>
                    </label>
                    <label className={`p-4 rounded-2xl border-2 transition-all duration-300 text-center cursor-pointer ${metodoEnvio === 'nacional' ? 'bg-white text-black border-white shadow-lg' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}>
                      <input {...register('metodoEnvio')} type="radio" value="nacional" className="hidden" />
                      <p className="text-[10px] font-black uppercase tracking-widest">Nacional</p>
                      <p className="text-[8px] opacity-60">Todo México</p>
                    </label>
                  </div>
                  {errors.metodoEnvio && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest ml-4">{errors.metodoEnvio.message}</p>}
                </div>

                {metodoEnvio === 'local' ? (
                  <div className="space-y-2 animate-fade-in">
                    <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">Punto de Recolección</label>
                    <select 
                      {...register('puntoEntrega')}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-white/40 appearance-none cursor-pointer font-bold text-xs"
                    >
                      <option value="Citadina" className="bg-zinc-900 text-white">📍 CITADINA (Reynosa)</option>
                      <option value="Periférico" className="bg-zinc-900 text-white">📍 PERIFÉRICO (Walmart)</option>
                      <option value="Plaza Real" className="bg-zinc-900 text-white">📍 PLAZA REAL (HEB)</option>
                    </select>
                  </div>
                ) : (
                  <div className="space-y-6 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">Calle y Número</label>
                            <input 
                                {...register('calle')}
                                type="text"
                                placeholder="EJ. AV. REVOLUCIÓN 123"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-white/40 text-xs font-medium"
                            />
                        </div>
                        <div className="space-y-2 col-span-2 md:col-span-1">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">Colonia / Barrio</label>
                            <input 
                                {...register('colonia')}
                                type="text"
                                placeholder="CENTRO"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-white/40 text-xs font-medium"
                            />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2 col-span-2">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">Ciudad y Estado</label>
                            <input 
                                {...register('ciudad')}
                                type="text"
                                placeholder="REYNOSA, TAMAULIPAS"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-white/40 text-xs font-medium"
                            />
                        </div>
                        <div className="space-y-2 col-span-1">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">C.P.</label>
                            <input 
                                {...register('cp')}
                                type="text"
                                placeholder="88000"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-white/40 text-xs font-medium"
                            />
                        </div>
                    </div>
                    {errors.direccion && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest ml-4">{errors.direccion.message}</p>}
                  </div>
                )}
              </div>
            </form>
          </div>

          <div className="p-6 bg-primary/10 border border-primary/20 rounded-3xl flex items-center gap-6">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-accent shrink-0">
               <path d="M21 8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16V8z"></path>
               <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
               <line x1="12" y1="22.08" x2="12" y2="12"></line>
             </svg>
             <p className="text-[10px] font-bold uppercase tracking-[2px] text-accent leading-relaxed">
               {metodoEnvio === 'local' 
                ? 'Las entregas locales se coordinan exclusivamente para los días Viernes y Domingos.' 
                : 'Los envíos nacionales se realizan vía FedEx/Estafeta con un tiempo estimado de 3 a 5 días hábiles.'}
             </p>
          </div>
        </div>

        {/* Resumen de Orden */}
        <div className="lg:col-span-2">
          <div className="bg-black/60 backdrop-blur-3xl border border-white/10 p-10 rounded-[40px] sticky top-28">
            <h3 className="font-syne text-2xl font-black uppercase tracking-tighter text-white mb-8 text-center">Resumen de Orden</h3>
            
            <div className="space-y-6 mb-10 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {cart.map((item) => (
                <div key={`${item.id}-${item.size}-${item.color}`} className="flex justify-between items-start border-b border-white/5 pb-4">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase text-white">{item.name}</p>
                    <p className="text-[8px] uppercase font-bold text-white/30 tracking-widest">{item.size} x {item.quantity}</p>
                  </div>
                  <span className="text-xs font-black text-accent">${item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-white/40">
                <span>Subtotal</span>
                <span>${cartTotal}</span>
              </div>
              <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-white/40">
                <span>Gestión de Envío</span>
                <span className={metodoEnvio === 'local' ? 'text-green-500' : ''}>
                  {metodoEnvio === 'local' ? 'SIN CARGO' : '$150'}
                </span>
              </div>
              <div className="h-px bg-white/10 pt-4" />
              <div className="flex justify-between items-end pt-2">
                <span className="text-[10px] font-black uppercase tracking-[4px] text-white/40">Total Final</span>
                <span className="text-4xl font-syne font-black text-white leading-none">
                  ${cartTotal + (metodoEnvio === 'local' ? 0 : 150)}
                </span>
              </div>
            </div>

            <button 
              form="checkout-form"
              type="submit"
              disabled={loading || cart.length === 0}
              className={`w-full bg-white text-black py-6 rounded-2xl font-black text-xs uppercase tracking-[4px] mt-10 transition-all duration-500 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95 ${loading ? 'opacity-50' : ''}`}
            >
              {loading ? 'Procesando Pedido...' : 'Finalizar Compra'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
