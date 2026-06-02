import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';

const STATES = ['Pendiente', 'Enviado', 'Entregado', 'Cancelado'];
const FILTERS = ['Todos', ...STATES];

/**
 * SCM shipping/logistics view. Master-detail: a filterable list of orders on the
 * left and a detailed panel on the right (client, address, line items, shipping
 * type, status timeline) with controls to advance the order state.
 */
const ShippingManager = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('Todos');
    const [search, setSearch] = useState('');
    const [selected, setSelected] = useState(null);

    const load = (estado = filter, searchTerm = search) => {
        setLoading(true);
        apiService.orders.list({
            estado: estado === 'Todos' ? undefined : estado,
            search: searchTerm,
        })
            .then((res) => {
                setOrders(res.data);
                // Keep the selection in sync with the refreshed list.
                setSelected((prev) => (prev ? res.data.find((o) => o.id === prev.id) || null : null));
            })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load('Todos', ''); }, []);
    useEffect(() => {
        const handle = setTimeout(() => load(filter, search), 300);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filter, search]);

    const changeStatus = async (order, estado) => {
        try {
            const res = await apiService.orders.updateStatus(order.id, estado);
            toast.success(`Pedido ${order.id_pedido} → ${estado}`);
            setSelected(res.data);
            load();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="bg-dark-card text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-8 relative z-10 gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Logistica de Envios</h2>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-1">Seguimiento y Cumplimiento</p>
                </div>
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar pedido o cliente..." className="bg-white/5 border border-white/10 text-sm rounded-full px-6 py-3.5 w-full md:w-72 focus:outline-none focus:border-neon-lime transition-all placeholder:text-text-muted/50" />
            </div>

            <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                {FILTERS.map((f) => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-neon-lime text-dark-card' : 'bg-white/5 text-white/40 hover:text-white'}`}>{f}</button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
                {/* Order list */}
                <div className="lg:col-span-5 space-y-3 max-h-[560px] overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                        <div className="py-20 flex justify-center"><div className="w-8 h-8 border-4 border-white/10 border-t-neon-lime rounded-full animate-spin" /></div>
                    ) : orders.length > 0 ? orders.map((order) => (
                        <div key={order.id} onClick={() => setSelected(order)} className={`p-5 rounded-2xl cursor-pointer flex justify-between items-center transition-all border ${selected?.id === order.id ? 'bg-dark-subcard border-neon-lime' : 'bg-white/5 border-transparent hover:bg-white/10'}`}>
                            <div>
                                <p className="text-[10px] font-black text-white/40 tracking-[2px]">{order.id_pedido}</p>
                                <p className="text-sm font-bold text-white uppercase tracking-tight">{order.nombre || order.id_cliente}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-black text-neon-lime tracking-tighter">${order.total}</p>
                                <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${badgeClass(order.estado)}`}>{order.estado}</span>
                            </div>
                        </div>
                    )) : (
                        <div className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">Sin pedidos</div>
                    )}
                </div>

                {/* Detail panel */}
                <div className="lg:col-span-7 bg-[#2A313C] rounded-[2.5rem] p-8 min-h-[500px]">
                    {selected ? (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <span className="text-[10px] text-zinc-400 uppercase tracking-[4px] font-black">Pedido</span>
                                    <h3 className="text-4xl font-black text-white tracking-tighter">{selected.id_pedido}</h3>
                                </div>
                                <span className={`text-[10px] px-4 py-2 rounded-full font-black uppercase tracking-widest ${badgeClass(selected.estado)}`}>{selected.estado}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <InfoBox label="Cliente" value={selected.nombre || selected.id_cliente} />
                                <InfoBox label="Telefono" value={selected.telefono || '—'} />
                                <InfoBox label="Tipo de Envio" value={selected.tipo_envio || '—'} />
                                <InfoBox label="Fecha" value={new Date(selected.created_at + 'Z').toLocaleDateString('es-MX')} />
                            </div>

                            <div className="bg-black/20 rounded-3xl p-5 mb-6 border border-white/5">
                                <p className="text-[10px] font-black uppercase text-text-muted tracking-[3px] mb-3">Direccion / Entrega</p>
                                <p className="text-sm text-white/80 font-medium">{selected.direccion || selected.punto_entrega || 'No especificada'}</p>
                            </div>

                            <div className="bg-black/20 rounded-3xl p-5 mb-6 border border-white/5 flex-grow">
                                <p className="text-[10px] font-black uppercase text-text-muted tracking-[3px] mb-3">Productos</p>
                                <div className="space-y-2">
                                    {selected.items.map((it) => (
                                        <div key={it.id} className="flex justify-between text-sm border-b border-white/5 pb-2 last:border-0">
                                            <span className="text-white font-bold">{it.product_name || it.id_producto} <span className="text-white/30">x{it.cantidad}</span></span>
                                            <span className="text-neon-lime font-black">${it.precio_unitario * it.cantidad}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="flex justify-between pt-4 mt-2 border-t border-white/10">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Total</span>
                                    <span className="text-2xl font-black text-neon-lime">${selected.total}</span>
                                </div>
                            </div>

                            <div>
                                <p className="text-[10px] font-black uppercase text-text-muted tracking-[3px] mb-3">Cambiar Estado</p>
                                <div className="flex flex-wrap gap-2">
                                    {STATES.map((s) => (
                                        <button key={s} disabled={s === selected.estado} onClick={() => changeStatus(selected, s)} className={`px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${s === selected.estado ? 'bg-neon-lime text-dark-card cursor-default' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}>{s}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-zinc-400 gap-4">
                            <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-2xl opacity-20">⬡</div>
                            <p className="uppercase font-black tracking-[4px] text-[10px] opacity-40">Selecciona un pedido</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/** Maps an order state to its badge color classes. */
const badgeClass = (estado) => {
    if (estado === 'Enviado' || estado === 'Entregado') return 'bg-neon-lime/10 text-neon-lime border border-neon-lime/20';
    if (estado === 'Cancelado') return 'bg-red-500/10 text-red-500 border border-red-500/20';
    return 'bg-white/5 text-white/40 border border-white/10';
};

const InfoBox = ({ label, value }) => (
    <div className="bg-white/5 border border-white/10 px-4 py-3 rounded-2xl">
        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">{label}</p>
        <p className="text-sm font-bold text-white truncate">{value}</p>
    </div>
);

export default ShippingManager;
