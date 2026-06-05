import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';

const Profile = () => {
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
        // Simulation of coupon redemption
        setTimeout(() => {
            toast.error('Este cupón no es válido o ya expiró', {
                description: 'Mantente atento a nuestros próximos DROPS.'
            });
            setRedeeming(false);
            setCouponCode('');
        }, 1000);
    };

    if (!user) return null;

    return (
        <div className="max-w-6xl mx-auto w-full space-y-12 animate-fade-in pb-20">
            {/* Header / Stats */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 border-b border-white/5 pb-12">
                <div className="space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white/[0.03] border border-white/10 rounded-3xl flex items-center justify-center text-2xl font-black">
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-[10px] font-black uppercase tracking-[5px] text-white/20">Perfil de Miembro</h2>
                            <h1 className="text-4xl font-syne font-black uppercase tracking-tighter text-white">{user.name}</h1>
                        </div>
                    </div>
                    <p className="text-white/40 text-sm font-medium">{user.email}</p>
                </div>

                <div className="flex gap-8">
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-[3px] text-[#66278b] mb-1">Puntos de Veneración</p>
                        <p className="text-4xl font-syne font-black text-white">{points}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] font-black uppercase tracking-[3px] text-white/20 mb-1">Pedidos Totales</p>
                        <p className="text-4xl font-syne font-black text-white">{orders.length}</p>
                    </div>
                </div>
            </header>

            <div className="grid lg:grid-cols-3 gap-12">
                {/* Order History */}
                <div className="lg:col-span-2 space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[4px] text-white/40">Historial de Pedidos</h3>
                    
                    {loading ? (
                        <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-white/5 border-t-white rounded-full animate-spin" /></div>
                    ) : orders.length > 0 ? (
                        <div className="space-y-6">
                            {orders.map(order => (
                                <div key={order.id} className="bg-white/[0.02] border border-white/5 rounded-[32px] p-6 lg:p-8 hover:border-white/10 transition-all group">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="space-y-4 flex-grow">
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-black text-white uppercase tracking-tight">{order.id_pedido}</span>
                                                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full border ${
                                                    order.estado === 'Entregado' ? 'bg-[#66278b]/20 text-[#66278b] border-[#66278b]/20' : 
                                                    order.estado === 'Cancelado' ? 'bg-red-500/20 text-red-500 border-red-500/20' : 
                                                    'bg-white/5 text-white/40 border-white/5'
                                                }`}>
                                                    {order.estado}
                                                </span>
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-4">
                                                {order.order_items?.map((it, i) => (
                                                    <div key={i} className="flex items-center gap-3">
                                                        <div className="w-10 h-10 bg-white/[0.05] rounded-xl overflow-hidden border border-white/5 p-1">
                                                            <img src={it.products?.images?.white?.[0] || it.products?.images?.black?.[0]} alt="item" className="w-full h-full object-contain" />
                                                        </div>
                                                        <span className="text-[10px] font-bold text-white/60 uppercase">{it.products?.name} x{it.cantidad}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="text-right space-y-2 shrink-0">
                                            <p className="text-[9px] font-black uppercase tracking-[2px] text-white/20">{new Date(order.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' })}</p>
                                            <p className="text-2xl font-syne font-black text-white leading-none">${order.total}</p>
                                            <p className="text-[8px] font-bold text-white/20 uppercase">{order.tipo_envio} {order.punto_entrega ? `(${order.punto_entrega})` : ''}</p>
                                        </div>
                                    </div>
                                    
                                    {order.direccion && (
                                        <div className="mt-6 pt-6 border-t border-white/5 flex items-start gap-3">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/20 mt-0.5">
                                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                                <circle cx="12" cy="10" r="3"></circle>
                                            </svg>
                                            <p className="text-[10px] font-medium text-white/30 uppercase tracking-tight">{order.direccion}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center border border-dashed border-white/5 rounded-[40px]">
                            <p className="text-[10px] font-black uppercase tracking-[4px] text-white/10">Aún no has realizado pedidos</p>
                        </div>
                    )}
                </div>

                {/* Sidebar: Coupons & Actions */}
                <div className="space-y-8">
                    {/* Redeem Coupon */}
                    <div className="bg-white/[0.03] border border-white/10 p-8 rounded-[40px] space-y-6">
                        <div>
                            <h3 className="text-lg font-syne font-black uppercase tracking-tight text-white mb-1">Canjear Cupón</h3>
                            <p className="text-[10px] font-bold text-white/20 uppercase tracking-[2px]">Obtén beneficios exclusivos</p>
                        </div>

                        <form onSubmit={handleRedeem} className="space-y-4">
                            <input 
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="CÓDIGO" 
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white font-black text-xs tracking-[4px] focus:border-white transition-all outline-none"
                            />
                            <button 
                                disabled={redeeming || !couponCode}
                                className="w-full bg-white text-black py-4 rounded-2xl font-black text-[10px] uppercase tracking-[4px] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] active:scale-95 transition-all disabled:opacity-30"
                            >
                                {redeeming ? 'Validando...' : 'Aplicar Código'}
                            </button>
                        </form>
                    </div>

                    {/* Info Box */}
                    <div className="p-8 border border-white/5 rounded-[40px] space-y-4">
                        <h4 className="text-[9px] font-black uppercase tracking-[4px] text-[#66278b]">Veneración System</h4>
                        <p className="text-xs text-white/40 leading-relaxed font-medium">
                            Tus puntos se acumulan con cada compra confirmada. Pronto podrás canjearlos por accesos prioritarios a DROPS y descuentos especiales.
                        </p>
                    </div>

                    <button 
                        onClick={logout}
                        className="w-full py-4 border border-red-500/20 text-red-500/60 hover:text-red-500 hover:bg-red-500/5 transition-all rounded-2xl text-[10px] font-black uppercase tracking-[4px]"
                    >
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </div>
    );
};

// Add missing useMemo import
import { useMemo } from 'react';

export default Profile;
