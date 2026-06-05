import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Profile = ({ onBack }) => {
    const { user, logout } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [couponCode, setCouponCode] = useState('');
    const [redeeming, setRedeeming] = useState(false);

    // Calculate Puntos de Veneración ($1 = 1 point for this demo)
    const points = useMemo(() => {
        return orders
            .filter(o => o.estado !== 'Cancelado')
            .reduce((sum, o) => sum + Math.floor(o.total), 0);
    }, [orders]);

    const level = useMemo(() => {
        if (points < 1000) return { name: 'INICIADO', next: 1000, color: '#a855f7' };
        if (points < 5000) return { name: 'DEVOTO', next: 5000, color: '#32a83e' };
        return { name: 'VENERADO', next: null, color: '#bf4a4a' };
    }, [points]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) return;
            try {
                const { data, error } = await supabase
                    .from('orders')
                    .select('*, order_items(*, products(name, images))')
                    .eq('user_id', user.id)
                    .order('created_at', { ascending: false });
                
                if (error) throw error;
                setOrders(data);
            } catch (err) {
                console.error(err);
                toast.error('No se pudieron cargar tus pedidos');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const handleRedeem = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        setRedeeming(true);
        setTimeout(() => {
            toast.error('Este cupón no es válido o ya expiró', {
                description: 'Mantente atento a nuestros próximos DROPS.'
            });
            setRedeeming(false);
            setCouponCode('');
        }, 1000);
    };

    const getThemedColor = (name) => {
        const n = name.toLowerCase();
        if (n.includes('slime') || n.includes('eyes')) return '#a855f7';
        if (n.includes('heart')) return '#f1d069';
        if (n.includes('flowers')) return '#32a83e';
        if (n.includes('devil') || n.includes('voodoo') || n.includes('diavloo') || n.includes('see you')) return '#bf4a4a';
        return '#ffffff';
    };

    if (!user) return null;

    return (
        <div className="max-w-7xl mx-auto w-full space-y-16 animate-fade-in pb-32 px-4">
            {/* Navigation & Exit */}
            <div className="flex justify-between items-center">
                <button 
                    onClick={onBack}
                    className="group flex items-center gap-3 text-[10px] font-black uppercase tracking-[4px] text-white/30 hover:text-white transition-all"
                >
                    <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span> Volver al Hub
                </button>
            </div>

            {/* Main Header / Profile Identity */}
            <header className="grid grid-cols-1 xl:grid-cols-12 gap-12 items-end">
                <div className="xl:col-span-7 flex flex-col md:flex-row gap-8 items-center md:items-center">
                    <div className="relative group">
                        <div className="absolute -inset-4 bg-[#bf4a4a]/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        <div className="relative w-32 h-32 bg-[#bf4a4a] rounded-[40px] flex items-center justify-center text-5xl font-syne font-black text-black shadow-[0_0_50px_rgba(191,74,74,0.3)] transform rotate-3 hover:rotate-0 transition-transform duration-500">
                            {user.name.charAt(0)}
                        </div>
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10 mb-2">
                            <span className="text-[8px] font-black uppercase tracking-[3px] text-white/40">Miembro Desde {new Date().getFullYear()}</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-syne font-black uppercase tracking-[ -0.04em] text-white leading-none">
                            {user.name}
                        </h1>
                        <p className="text-white/20 text-xs font-bold tracking-[2px] uppercase">{user.email}</p>
                    </div>
                </div>

                {/* Veneration Stats */}
                <div className="xl:col-span-5 bg-white/[0.02] border border-white/5 rounded-[48px] p-10 relative overflow-hidden group/stats">
                    <div className="absolute top-0 right-0 p-8 opacity-5 transition-opacity group-hover/stats:opacity-10">
                         <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/></svg>
                    </div>
                    
                    <div className="relative z-10 space-y-6">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <span className="text-[10px] font-black uppercase tracking-[5px] text-[#bf4a4a]">Puntos de Veneración</span>
                                <h4 className="text-white/20 text-[8px] font-black uppercase tracking-[2px]">Nivel Actual: {level.name}</h4>
                            </div>
                            <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 text-[#bf4a4a]">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2s-8 6-8 12 8 8 8 8 8-2 8-8-8-12-8-12z"/></svg>
                            </div>
                        </div>

                        <div className="flex items-baseline gap-2">
                            <span className="text-7xl font-syne font-black text-white tracking-tighter tabular-nums leading-none">{points}</span>
                            <span className="text-sm font-black text-white/10 uppercase tracking-widest">PTS</span>
                        </div>

                        {level.next && (
                            <div className="space-y-3 pt-4 border-t border-white/5">
                                <div className="flex justify-between text-[8px] font-black uppercase tracking-[3px]">
                                    <span className="text-white/40">Progreso al Siguiente Rango</span>
                                    <span className="text-white">{Math.round((points/level.next)*100)}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(points/level.next)*100}%` }}
                                        transition={{ duration: 1.5, ease: "easeOut" }}
                                        className="h-full bg-[#bf4a4a] shadow-[0_0_15px_rgba(191,74,74,0.5)]" 
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-12 gap-16">
                {/* Order History */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="flex items-center gap-6">
                        <h3 className="text-xs font-black uppercase tracking-[6px] text-white">Archivo de Adquisiciones</h3>
                        <div className="h-px flex-grow bg-white/5" />
                    </div>
                    
                    {loading ? (
                        <div className="py-32 flex justify-center"><div className="w-12 h-12 border-4 border-white/5 border-t-[#bf4a4a] rounded-full animate-spin" /></div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-8">
                            {orders.map(order => (
                                <div key={order.id} className="relative group/order overflow-hidden bg-[#0a0a0a] border border-white/5 rounded-[40px] p-8 lg:p-10 transition-all duration-500 hover:border-white/10 hover:bg-[#0f0f0f] shadow-2xl">
                                    <div className="relative z-10 flex flex-col gap-8">
                                        {/* Order Header */}
                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-lg font-syne font-black text-white uppercase tracking-tighter">{order.id_pedido}</span>
                                                    <span className={`text-[9px] font-black uppercase px-4 py-1.5 rounded-full border ${
                                                        order.estado === 'Entregado' ? 'bg-[#32a83e]/10 text-[#32a83e] border-[#32a83e]/20' : 
                                                        order.estado === 'Cancelado' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                                                        'bg-[#bf4a4a]/10 text-[#bf4a4a] border-[#bf4a4a]/20'
                                                    }`}>
                                                        {order.estado}
                                                    </span>
                                                </div>
                                                <p className="text-[9px] font-black uppercase tracking-[3px] text-white/20">
                                                    Procesado el {new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </p>
                                            </div>

                                            <div className="flex flex-col items-end">
                                                 <span className="text-[9px] font-black text-white/10 uppercase tracking-[4px] mb-1 text-right w-full">Inversión Total</span>
                                                 <p className="text-4xl font-syne font-black text-white leading-none tracking-tighter">${order.total}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Items List - Themed Mini Cards */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {order.order_items?.map((it, i) => {
                                                const themedColor = getThemedColor(it.products?.name || '');
                                                return (
                                                    <div key={i} className="flex items-center gap-5 p-4 bg-white/[0.02] border border-white/5 rounded-3xl group/item hover:bg-white/[0.04] transition-all">
                                                        <div 
                                                            className="w-16 h-16 rounded-2xl overflow-hidden border border-white/5 p-2 shrink-0 relative transition-transform group-hover/item:scale-105"
                                                            style={{ backgroundColor: `${themedColor}10` }}
                                                        >
                                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50" />
                                                            <img 
                                                                src={it.products?.images?.white?.[0] || it.products?.images?.black?.[0]} 
                                                                alt="item" 
                                                                className="w-full h-full object-contain relative z-10 drop-shadow-xl" 
                                                            />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="text-[10px] font-black text-white uppercase truncate">{it.products?.name}</span>
                                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-[2px]">Cantidad: {it.cantidad}</span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {/* Footer Detail */}
                                        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between gap-4">
                                            <div className="flex items-start gap-3">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#bf4a4a" strokeWidth="2.5" className="mt-0.5 shrink-0">
                                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                    <circle cx="12" cy="10" r="3"></circle>
                                                </svg>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-tight leading-relaxed max-w-sm">
                                                    {order.tipo_envio} {order.punto_entrega ? `(${order.punto_entrega})` : ''} 
                                                    {order.direccion && ` | ${order.direccion}`}
                                                </p>
                                            </div>
                                            <button className="text-[9px] font-black uppercase tracking-[3px] text-white/20 hover:text-[#bf4a4a] transition-colors self-end">
                                                Solicitar Factura Técnica →
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-32 text-center border border-dashed border-white/5 rounded-[48px] bg-white/[0.01]">
                            <p className="text-xs font-black uppercase tracking-[6px] text-white/10">Archivo Vacío: Comienza tu Colección</p>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-12">
                    {/* Redeem Coupon */}
                    <div className="bg-[#0a0a0a] border border-white/5 p-10 rounded-[48px] space-y-8 relative overflow-hidden group/coupon shadow-2xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover/coupon:opacity-100 transition-opacity duration-700 pointer-events-none" />
                        
                        <div className="relative z-10">
                            <h3 className="text-xl font-syne font-black uppercase tracking-tighter text-white mb-2">Protocolo de Descuento</h3>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[3px]">Valida tu código de acceso</p>
                        </div>

                        <form onSubmit={handleRedeem} className="relative z-10 space-y-5">
                            <input 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="DIGITA CÓDIGO..." 
                                className="w-full bg-white/[0.03] border border-white/5 rounded-3xl px-8 py-5 text-white font-black text-sm tracking-[6px] focus:border-[#bf4a4a]/40 focus:bg-white/[0.05] transition-all outline-none placeholder:text-white/5"
                            />
                            <button 
                                disabled={redeeming || !couponCode}
                                className="w-full bg-white text-black py-5 rounded-3xl font-black text-[11px] uppercase tracking-[5px] hover:scale-[1.02] active:scale-95 transition-all shadow-xl disabled:opacity-20"
                            >
                                {redeeming ? 'AUTENTICANDO...' : 'EJECUTAR'}
                            </button>
                        </form>
                    </div>

                    {/* Veneration Info */}
                    <div className="p-10 border border-white/5 rounded-[48px] space-y-6 bg-white/[0.01]">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#bf4a4a]/10 rounded-xl flex items-center justify-center text-[#bf4a4a]">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 2s-8 6-8 12 8 8 8 8 8-2 8-8-8-12-8-12z"/></svg>
                            </div>
                            <h4 className="text-xs font-black uppercase tracking-[4px] text-white">Sobre la Veneración</h4>
                        </div>
                        <p className="text-xs text-white/30 leading-relaxed font-medium uppercase tracking-tight">
                            Tus puntos simbolizan tu compromiso con el estilo técnico. La acumulación constante desbloquea privilegios en DROPS de edición limitada y eventos privados de la marca.
                        </p>
                    </div>

                    {/* Final Actions */}
                    <div className="space-y-4 pt-8">
                        <button 
                            onClick={logout}
                            className="w-full py-6 bg-red-500/5 hover:bg-red-500/10 text-red-500 border border-red-500/10 transition-all rounded-3xl text-[11px] font-black uppercase tracking-[5px] flex items-center justify-center gap-4 group"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="group-hover:translate-x-1 transition-transform"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
