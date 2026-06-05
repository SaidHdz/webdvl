import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { checkoutSchema } from '../schemas/validation';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Stepper, { Step } from './ui/Stepper';

const Checkout = ({ onBack, onSuccess }) => {
  const { cart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
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

  const handleFinalSubmit = async (data) => {
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

      toast.success(`Pedido ${orderNumber} registrado con éxito`);
      clearCart();
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  const validateStep = async (step) => {
    if (step === 1) {
      const fields = ['nombreCompleto', 'telefono', 'metodoEnvio'];
      if (metodoEnvio === 'local') fields.push('puntoEntrega');
      else fields.push('calle', 'colonia', 'ciudad', 'cp');
      
      const isValid = await trigger(fields);
      if (!isValid) {
          toast.error('Por favor, completa los campos requeridos correctamente');
          return false;
      }
    }
    return true;
  };

  return (
    <div className="flex flex-col gap-6 animate-slide-up max-w-7xl mx-auto w-full h-full pb-10 px-4">
      <button 
        onClick={onBack}
        className="self-start text-[9px] uppercase font-black tracking-[3px] text-white/40 hover:text-white transition-all duration-300 flex items-center gap-2 group"
      >
        <span className="text-base group-hover:-translate-x-1 transition-transform">←</span> Volver a la Tienda
      </button>

      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <Stepper
          initialStep={1}
          onStepChange={async (step) => {
             // Logic to prevent moving forward if validation fails could be here, 
             // but Stepper component doesn't natively support async cancel.
             // We'll rely on the visual flow.
          }}
          onFinalStepCompleted={handleSubmit(handleFinalSubmit)}
          backButtonText="Atrás"
          nextButtonText="Siguiente Paso"
          className="w-full"
        >
          {/* STEP 1: ENVÍO */}
          <Step>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 py-4">
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[32px]">
                        <h3 className="font-syne text-2xl font-black uppercase tracking-tighter text-white mb-8 border-b border-white/5 pb-4">
                            1. Datos de Entrega
                        </h3>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Nombre Completo</label>
                                    <input 
                                        {...register('nombreCompleto')}
                                        className={`w-full bg-white/5 border ${errors.nombreCompleto ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-white focus:border-white/40 outline-none transition-all placeholder:text-white/10 font-bold text-xs uppercase`}
                                        placeholder="TU NOMBRE"
                                    />
                                    {errors.nombreCompleto && <p className="text-red-500 text-[8px] font-bold uppercase tracking-widest ml-4">{errors.nombreCompleto.message}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Teléfono</label>
                                    <input 
                                        {...register('telefono')}
                                        className={`w-full bg-white/5 border ${errors.telefono ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-white focus:border-white/40 outline-none transition-all placeholder:text-white/10 font-mono text-xs`}
                                        placeholder="(000) 000-0000"
                                    />
                                    {errors.telefono && <p className="text-red-500 text-[8px] font-bold uppercase tracking-widest ml-4">{errors.telefono.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Modalidad de Envío</label>
                                <div className="grid grid-cols-2 gap-4">
                                    <label className={`p-5 rounded-2xl border-2 transition-all duration-500 text-center cursor-pointer flex flex-col items-center gap-1 ${metodoEnvio === 'local' ? 'bg-white text-black border-white shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}>
                                        <input {...register('metodoEnvio')} type="radio" value="local" className="hidden" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Entrega Local</p>
                                        <p className="text-[8px] opacity-60 font-bold uppercase tracking-tighter">Reynosa, Tamaulipas</p>
                                    </label>
                                    <label className={`p-5 rounded-2xl border-2 transition-all duration-500 text-center cursor-pointer flex flex-col items-center gap-1 ${metodoEnvio === 'nacional' ? 'bg-white text-black border-white shadow-2xl scale-[1.02]' : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'}`}>
                                        <input {...register('metodoEnvio')} type="radio" value="nacional" className="hidden" />
                                        <p className="text-[10px] font-black uppercase tracking-widest">Envío Nacional</p>
                                        <p className="text-[8px] opacity-60 font-bold uppercase tracking-tighter">Todo México (+ $150)</p>
                                    </label>
                                </div>
                            </div>

                            {metodoEnvio === 'local' ? (
                                <div className="space-y-2 animate-fade-in">
                                    <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Punto de Recolección</label>
                                    <select 
                                        {...register('puntoEntrega')}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-white/40 appearance-none cursor-pointer font-black text-[11px] uppercase tracking-widest"
                                    >
                                        <option value="Citadina" className="bg-zinc-950 text-white">CITADINA (REYNOSA)</option>
                                        <option value="Periférico" className="bg-zinc-950 text-white">PERIFÉRICO</option>
                                        <option value="Plaza Real" className="bg-zinc-950 text-white">PLAZA REAL (HEB)</option>
                                    </select>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Calle y Número</label>
                                            <input {...register('calle')} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-white/40 text-[11px] font-bold uppercase" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Colonia</label>
                                            <input {...register('colonia')} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-white/40 text-[11px] font-bold uppercase" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">Ciudad y Estado</label>
                                            <input {...register('ciudad')} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-white/40 text-[11px] font-bold uppercase" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] uppercase font-black text-white/30 tracking-[3px] ml-4">C.P.</label>
                                            <input {...register('cp')} className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-3 text-white outline-none focus:border-white/40 text-[11px] font-mono font-bold" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-5">
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[32px] h-fit sticky top-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[4px] text-white/20 mb-6">Tu Selección</h4>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto custom-scrollbar pr-2 mb-6">
                            {cart.map((item) => (
                                <div key={`${item.id}-${item.size}-${item.color}`} className="flex gap-4 items-center border-b border-white/5 pb-4 last:border-0">
                                    <div className="w-14 h-14 bg-white/5 rounded-xl border border-white/5 p-1">
                                        <img src={item.image} className="w-full h-full object-contain" alt="" />
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-[11px] font-black text-white uppercase">{item.name}</p>
                                        <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{item.size} — {item.quantity} UNIDADES</p>
                                    </div>
                                    <p className="text-xs font-black text-white">${item.price * item.quantity}</p>
                                </div>
                            ))}
                        </div>
                        <div className="pt-4 border-t border-white/5 space-y-2">
                            <div className="flex justify-between text-[9px] font-black uppercase text-white/30 tracking-widest">
                                <span>Subtotal</span>
                                <span>${cartTotal}</span>
                            </div>
                            <div className="flex justify-between text-[9px] font-black uppercase text-white/30 tracking-widest">
                                <span>Envío</span>
                                <span className={metodoEnvio === 'local' ? 'text-[#a855f7]' : 'text-white'}>
                                    {metodoEnvio === 'local' ? 'GRATIS' : '$150'}
                                </span>
                            </div>
                            <div className="pt-4 flex justify-between items-end">
                                <span className="text-[8px] font-black uppercase text-white/20 tracking-[4px]">Total</span>
                                <span className="text-3xl font-syne font-black text-white leading-none tracking-tighter">
                                    ${cartTotal + (metodoEnvio === 'local' ? 0 : 150)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          </Step>

          {/* STEP 2: PAGO (SIMULADO) */}
          <Step>
            <div className="max-w-3xl mx-auto py-8 text-center space-y-10">
                <div className="space-y-4">
                    <h3 className="font-syne text-3xl font-black uppercase tracking-tighter text-white">
                        2. Método de Pago
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[3px] text-white/30">
                        Transacción segura y encriptada
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border-2 border-white p-8 rounded-[32px] text-black space-y-4 shadow-2xl scale-[1.02]">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center mb-4">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                        </div>
                        <h4 className="text-xl font-syne font-black uppercase leading-tight">Tarjeta de Crédito / Débito</h4>
                        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Visa, Mastercard, AMEX</p>
                        <div className="pt-4 border-t border-black/5">
                            <span className="text-[8px] font-black uppercase px-3 py-1 bg-black text-white rounded-full tracking-widest">Seleccionado</span>
                        </div>
                    </div>

                    <div className="bg-white/5 border-2 border-white/5 p-8 rounded-[32px] text-white/20 space-y-4 transition-all hover:border-white/10 opacity-50 cursor-not-allowed">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                             <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                        </div>
                        <h4 className="text-xl font-syne font-black uppercase leading-tight">PayPal / Otros</h4>
                        <p className="text-[10px] font-bold opacity-30 uppercase tracking-widest">Próximamente disponible</p>
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 p-10 rounded-[40px] space-y-8 text-left animate-fade-in">
                    <div className="flex justify-between items-center border-b border-white/5 pb-6">
                        <span className="text-[10px] font-black uppercase tracking-[4px] text-white/30">Total a Pagar</span>
                        <span className="text-4xl font-syne font-black text-white tracking-tighter">
                            ${cartTotal + (metodoEnvio === 'local' ? 0 : 150)}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-white/5 p-6 rounded-2xl border border-white/5 flex items-center gap-4">
                            <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shrink-0">
                                <div className="w-1.5 h-1.5 bg-white rounded-full" />
                            </div>
                            <p className="text-[11px] font-bold text-white/60 uppercase leading-relaxed">
                                He revisado mi orden y acepto los <span className="text-white underline underline-offset-4 cursor-pointer">términos de servicio</span> de DVL Supply Co.
                            </p>
                        </div>
                        
                        <div className="flex items-start gap-4 p-4">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2.5" className="mt-1 shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            <p className="text-[9px] font-medium text-white/20 uppercase tracking-[2px] leading-normal">
                                Tu pago se procesará a través de nuestra pasarela segura. No guardamos los datos completos de tu tarjeta.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
          </Step>

          {/* STEP 3: REVISIÓN FINAL */}
          <Step>
            <div className="max-w-4xl mx-auto py-8 space-y-12">
                <div className="text-center space-y-4">
                    <h3 className="font-syne text-3xl font-black uppercase tracking-tighter text-white">
                        3. Revisión Final
                    </h3>
                    <p className="text-[10px] font-black uppercase tracking-[3px] text-white/30">
                        Confirma que todo esté correcto antes de finalizar
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white/[0.03] border border-white/5 p-8 rounded-[40px] space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[4px] text-[#a855f7] mb-6">Detalles de Envío</h4>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Recibe</span>
                                    <span className="text-sm font-black text-white uppercase tracking-tight">{watch('nombreCompleto')}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Contacto</span>
                                    <span className="text-sm font-black text-white font-mono">{watch('telefono')}</span>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Modalidad</span>
                                    <span className="text-sm font-black text-white uppercase tracking-tight">
                                        {metodoEnvio === 'local' ? `Local — ${watch('puntoEntrega')}` : 'Nacional a domicilio'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[4px] text-[#a855f7] mb-6">Instrucciones</h4>
                            <p className="text-xs font-medium text-white/40 italic uppercase leading-relaxed">
                                {watch('notas') || 'Sin notas adicionales.'}
                            </p>
                        </div>
                    </div>

                    <div className="bg-white text-black p-10 rounded-[40px] space-y-8 shadow-2xl relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-black/[0.03] rounded-full translate-x-16 -translate-y-16" />
                        
                        <div className="relative z-10">
                            <h4 className="text-[10px] font-black uppercase tracking-[4px] opacity-30 mb-8">Resumen Financiero</h4>
                            
                            <div className="space-y-5">
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                    <span className="opacity-40">Subtotal de Orden</span>
                                    <span>${cartTotal}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                                    <span className="opacity-40">Cargo de Logística</span>
                                    <span>${metodoEnvio === 'local' ? '0' : '150'}</span>
                                </div>
                                <div className="pt-8 border-t border-black/10 flex flex-col items-center gap-2">
                                    <span className="text-[10px] font-black uppercase tracking-[6px] opacity-20">Total Neto</span>
                                    <span className="text-5xl font-syne font-black tracking-tighter leading-none">
                                        ${cartTotal + (metodoEnvio === 'local' ? 0 : 150)}
                                    </span>
                                    <span className="text-[8px] font-black uppercase opacity-40 mt-2">Moneda: Pesos Mexicanos</span>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 text-center">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/[0.05] rounded-full">
                                <div className="w-1.5 h-1.5 bg-black rounded-full animate-pulse" />
                                <span className="text-[8px] font-black uppercase tracking-widest">Listo para procesar</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white/5 border border-dashed border-white/10 p-8 rounded-[40px] flex items-center justify-center">
                    <p className="text-[10px] font-black uppercase tracking-[4px] text-white/20 text-center leading-relaxed max-w-lg">
                        Al presionar "Finalizar", tu orden será procesada inmediatamente y recibirás una confirmación por correo y WhatsApp.
                    </p>
                </div>
            </div>
          </Step>
        </Stepper>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[300] flex flex-col items-center justify-center gap-6 animate-fade-in">
             <div className="w-16 h-16 border-4 border-white/10 border-t-white rounded-full animate-spin" />
             <div className="text-center space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[5px] text-white animate-pulse">Procesando Transacción</p>
                <p className="text-[8px] font-bold text-white/20 uppercase tracking-[2px]">No cierres esta ventana</p>
             </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
