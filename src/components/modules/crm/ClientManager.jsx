import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../ui/Modal';
import { apiService } from '../../../services/api';

/**
 * CRM client management: searchable customer list with aggregated spend, plus a
 * detailed history modal (orders with line items) for the integrated CRM/SCM
 * view. Also exports the visible list to CSV.
 */
const ClientManager = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [detail, setDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const load = (searchTerm = search) => {
        setLoading(true);
        apiService.clients.list({ search: searchTerm })
            .then((res) => setClients(res.data))
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(''); }, []);
    useEffect(() => {
        const handle = setTimeout(() => load(search), 300);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const openDetail = (client) => {
        setDetail({ client });
        setDetailLoading(true);
        apiService.clients.history(client.id)
            .then((res) => setDetail(res.data))
            .catch((err) => { toast.error(err.message); setDetail(null); })
            .finally(() => setDetailLoading(false));
    };

    const downloadCSV = () => {
        if (clients.length === 0) { toast.error('No hay datos para descargar'); return; }
        const headers = ['Nombre', 'Email', 'Total Compras', 'Pedidos', 'Puntos'];
        const rows = clients.map((c) => [c.name, c.email, c.total_compras, c.num_pedidos, c.puntos_lealtad]);
        const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `dvl_clientes_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Reporte CRM descargado');
    };

    return (
        <div className="bg-dark-card text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-8 relative z-10 gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Gestion de Clientes</h2>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-1">Customer Relationship Management (CRM)</p>
                </div>
                <button onClick={downloadCSV} className="bg-neon-lime text-dark-card font-black px-8 py-4 rounded-full text-[10px] uppercase tracking-[2px] hover:scale-105 transition-all shadow-[0_0_30px_rgba(219,255,0,0.2)]">Descargar Reporte</button>
            </div>

            <div className="mb-8 relative z-10">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o correo..." className="bg-white/5 border border-white/10 text-sm rounded-full px-6 py-3.5 w-full md:w-96 focus:outline-none focus:border-neon-lime transition-all placeholder:text-text-muted/50" />
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-white/5 border-t-neon-lime rounded-full animate-spin" /></div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-text-muted text-[10px] font-black uppercase tracking-[3px]">
                                <th className="pb-6 pl-4">Cliente</th>
                                <th className="pb-6">Email</th>
                                <th className="pb-6 text-center">Pedidos</th>
                                <th className="pb-6 text-right">Total Invertido</th>
                                <th className="pb-6 pr-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {clients.length > 0 ? clients.map((c) => (
                                <tr key={c.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-6 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-neon-lime text-xs">{c.name.charAt(0).toUpperCase()}</div>
                                            <span className="font-bold text-white uppercase tracking-tight text-sm">{c.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-6 text-zinc-400 text-sm">{c.email}</td>
                                    <td className="py-6 text-center font-black text-white">{c.num_pedidos}</td>
                                    <td className="py-6 text-right font-black text-neon-lime">${c.total_compras}</td>
                                    <td className="py-6 pr-4 text-right">
                                        <button onClick={() => openDetail(c)} className="text-[10px] font-black uppercase text-neon-lime hover:underline tracking-widest">Ver Historial →</button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">Sin clientes</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={!!detail}
                onClose={() => setDetail(null)}
                title={detail?.client?.name || 'Cliente'}
                subtitle={detail?.client?.email}
            >
                {detailLoading || !detail?.orders ? (
                    <div className="py-16 flex justify-center"><div className="w-8 h-8 border-4 border-white/10 border-t-neon-lime rounded-full animate-spin" /></div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-3 gap-4">
                            <Stat label="Inversion Total" value={`$${detail.client.total_compras}`} />
                            <Stat label="Pedidos" value={detail.client.num_pedidos} muted />
                            <Stat label="Puntos" value={detail.client.puntos_lealtad} muted />
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black uppercase mb-4 tracking-[4px] text-white/30">Historial de Pedidos</h3>
                            <div className="space-y-3 max-h-[320px] overflow-y-auto custom-scrollbar pr-2">
                                {detail.orders.length > 0 ? detail.orders.map((o) => (
                                    <div key={o.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <p className="font-black text-white uppercase text-sm tracking-tight">{o.id_pedido}</p>
                                                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{new Date(o.created_at + 'Z').toLocaleDateString('es-MX')} · {o.tipo_envio || 'N/A'}</p>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                <p className="font-black text-neon-lime text-lg tracking-tighter">${o.total}</p>
                                                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${o.estado === 'Cancelado' ? 'bg-red-500/10 text-red-500' : 'bg-neon-lime/10 text-neon-lime border border-neon-lime/20'}`}>{o.estado}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {o.items.map((it, i) => (
                                                <span key={i} className="text-[10px] text-zinc-400 bg-white/5 px-2.5 py-1 rounded-lg">{it.product_name || it.id_producto} x{it.cantidad}</span>
                                            ))}
                                        </div>
                                    </div>
                                )) : <p className="text-white/20 text-xs italic">Sin pedidos registrados.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const Stat = ({ label, value, muted }) => (
    <div className="bg-white/[0.03] border border-white/5 p-6 rounded-2xl text-center">
        <p className={`text-3xl font-black tracking-tighter ${muted ? 'text-white' : 'text-neon-lime'}`}>{value}</p>
        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">{label}</p>
    </div>
);

export default ClientManager;
