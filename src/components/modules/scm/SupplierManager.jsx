import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../ui/Modal';
import SendSupplierMessageModal from './SendSupplierMessageModal';
import PurchaseOrderModal from './PurchaseOrderModal';
import { apiService } from '../../../services/api';

const EMPTY_FORM = { nombre_taller: '', contacto: '', correo: '', telefono: '', insumo: '' };

/**
 * SCM supplier management: CRUD plus a history view (supplied products and the
 * timeline of messages sent) and a quick action to message a supplier.
 */
const SupplierManager = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const [history, setHistory] = useState(null);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [messageOpen, setMessageOpen] = useState(false);
    const [poOpen, setPoOpen] = useState(false);

    const load = (searchTerm = search) => {
        setLoading(true);
        apiService.suppliers.list({ search: searchTerm })
            .then((res) => setSuppliers(res.data))
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(''); }, []);
    useEffect(() => {
        const handle = setTimeout(() => load(search), 300);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setEditOpen(true); };
    const openEdit = (s) => {
        setEditing(s);
        setForm({ nombre_taller: s.nombre_taller, contacto: s.contacto || '', correo: s.correo || '', telefono: s.telefono || '', insumo: s.insumo || '' });
        setEditOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                await apiService.suppliers.update(editing.id, form);
                toast.success('Proveedor actualizado');
            } else {
                await apiService.suppliers.create(form);
                toast.success('Proveedor registrado');
            }
            setEditOpen(false);
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (s) => {
        if (!window.confirm(`Eliminar al proveedor "${s.nombre_taller}"?`)) return;
        try {
            await apiService.suppliers.remove(s.id);
            toast.success('Proveedor eliminado');
            load();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const openHistory = (s) => {
        setHistory({ supplier: s });
        setHistoryLoading(true);
        apiService.suppliers.history(s.id)
            .then((res) => setHistory(res.data))
            .catch((err) => { toast.error(err.message); setHistory(null); })
            .finally(() => setHistoryLoading(false));
    };

    const reloadHistory = () => {
        if (history?.supplier) openHistory(history.supplier);
    };

    const receivePO = async (po) => {
        try {
            await apiService.purchaseOrders.receive(po.id);
            toast.success(`${po.folio} recibida — stock actualizado`);
            reloadHistory();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const cancelPO = async (po) => {
        if (!window.confirm(`Cancelar la orden ${po.folio}?`)) return;
        try {
            await apiService.purchaseOrders.cancel(po.id);
            toast.success(`${po.folio} cancelada`);
            reloadHistory();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="bg-dark-card text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-8 relative z-10 gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Red de Proveedores</h2>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-1">Supply Chain Management (SCM)</p>
                </div>
                <button onClick={openCreate} className="bg-neon-lime text-dark-card font-black px-8 py-4 rounded-full text-[10px] uppercase tracking-[2px] hover:scale-105 transition-all shadow-[0_0_30px_rgba(219,255,0,0.2)]">+ Nuevo Proveedor</button>
            </div>

            <div className="mb-8 relative z-10">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar taller, contacto o insumo..." className="bg-white/5 border border-white/10 text-sm rounded-full px-6 py-3.5 w-full md:w-96 focus:outline-none focus:border-neon-lime transition-all placeholder:text-text-muted/50" />
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-white/5 border-t-neon-lime rounded-full animate-spin" /></div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-text-muted text-[10px] font-black uppercase tracking-[3px]">
                                <th className="pb-6 pl-4">Taller</th>
                                <th className="pb-6">Contacto</th>
                                <th className="pb-6">Insumo</th>
                                <th className="pb-6 pr-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {suppliers.length > 0 ? suppliers.map((s) => (
                                <tr key={s.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-6 pl-4 font-bold text-white uppercase tracking-tight text-lg">{s.nombre_taller}</td>
                                    <td className="py-6">
                                        <div className="flex flex-col">
                                            <span className="text-sm font-medium text-zinc-300">{s.contacto || '—'}</span>
                                            <span className="text-[10px] text-text-muted">{s.correo} {s.telefono ? `· ${s.telefono}` : ''}</span>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <span className="bg-neon-lime/10 text-neon-lime border border-neon-lime/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{s.insumo || 'N/A'}</span>
                                    </td>
                                    <td className="py-6 pr-4 text-right">
                                        <div className="flex gap-3 justify-end">
                                            <button onClick={() => openHistory(s)} className="text-[10px] font-black uppercase text-neon-lime hover:underline tracking-widest">Historial</button>
                                            <button onClick={() => openEdit(s)} className="text-[10px] font-black uppercase text-accent hover:underline tracking-widest">Editar</button>
                                            <button onClick={() => handleDelete(s)} className="text-[10px] font-black uppercase text-red-500/70 hover:text-red-500 tracking-widest">Borrar</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="4" className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">Sin proveedores</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / edit modal */}
            <Modal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                title={editing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                subtitle="SCM — Proveedores"
                footer={
                    <>
                        <button onClick={() => setEditOpen(false)} className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/10 transition-all">Cancelar</button>
                        <button form="supplier-form" type="submit" disabled={saving} className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-neon-lime text-dark-card hover:scale-105 transition-all disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
                    </>
                }
            >
                <form id="supplier-form" onSubmit={handleSave} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Taller / Manufactura</label>
                        <input value={form.nombre_taller} onChange={(e) => setForm({ ...form, nombre_taller: e.target.value })} className={inputClass} placeholder="NOMBRE DEL TALLER" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Contacto"><input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} className={inputClass} placeholder="Nombre del contacto" /></Field>
                        <Field label="Insumo"><input value={form.insumo} onChange={(e) => setForm({ ...form, insumo: e.target.value })} className={inputClass} placeholder="EJ. ALGODON" /></Field>
                        <Field label="Correo"><input type="email" value={form.correo} onChange={(e) => setForm({ ...form, correo: e.target.value })} className={inputClass} placeholder="correo@taller.mx" /></Field>
                        <Field label="Telefono"><input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className={inputClass} placeholder="8990001122" /></Field>
                    </div>
                </form>
            </Modal>

            {/* History modal */}
            <Modal
                isOpen={!!history}
                onClose={() => setHistory(null)}
                title={history?.supplier?.nombre_taller || 'Historial'}
                subtitle="SCM — Historial de Proveedor"
                footer={
                    <>
                        <button onClick={() => setPoOpen(true)} className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white border border-white/10 transition-all">+ Orden de Compra</button>
                        <button onClick={() => setMessageOpen(true)} className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-neon-lime text-dark-card hover:scale-105 transition-all">+ Enviar Mensaje</button>
                    </>
                }
            >
                {historyLoading || !history?.stats ? (
                    <div className="py-16 flex justify-center"><div className="w-8 h-8 border-4 border-white/10 border-t-neon-lime rounded-full animate-spin" /></div>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Stat label="Productos" value={history.stats.total_productos} />
                            <Stat label="Comprado" value={`$${history.stats.total_comprado}`} />
                            <Stat label="Ordenes" value={history.stats.total_ordenes} muted />
                            <Stat label="En Alerta" value={history.stats.productos_bajos} danger={history.stats.productos_bajos > 0} />
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black uppercase mb-4 tracking-[4px] text-white/30">Productos que Suministra</h3>
                            <div className="space-y-2">
                                {history.products.length > 0 ? history.products.map((p) => (
                                    <div key={p.id} className="flex justify-between items-center bg-white/[0.02] border border-white/5 px-5 py-3 rounded-2xl">
                                        <span className="text-sm font-bold text-white">{p.name}</span>
                                        <span className={`text-xs font-black ${p.is_low ? 'text-red-500' : 'text-neon-lime'}`}>{p.stock_actual} / min {p.stock_minimo}</span>
                                    </div>
                                )) : <p className="text-white/20 text-xs italic">Sin productos asignados a este proveedor.</p>}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black uppercase mb-4 tracking-[4px] text-white/30">Ordenes de Compra (lo que les pedimos)</h3>
                            <div className="space-y-3 max-h-[280px] overflow-y-auto custom-scrollbar pr-2">
                                {history.purchase_orders.length > 0 ? history.purchase_orders.map((po) => (
                                    <div key={po.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-black text-white uppercase text-sm tracking-tight">{po.folio}</p>
                                                <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest mt-0.5">{new Date(po.created_at + 'Z').toLocaleDateString('es-MX')}</p>
                                            </div>
                                            <div className="text-right flex flex-col items-end gap-1">
                                                <p className="font-black text-neon-lime text-lg tracking-tighter">${po.total}</p>
                                                <span className={`text-[8px] font-black uppercase px-3 py-1 rounded-full ${poBadge(po.estado)}`}>{po.estado}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {po.items.map((it, i) => (
                                                <span key={i} className="text-[10px] text-zinc-400 bg-white/5 px-2.5 py-1 rounded-lg">{it.product_name || it.id_producto} x{it.cantidad}</span>
                                            ))}
                                        </div>
                                        {po.estado === 'Solicitado' && (
                                            <div className="flex gap-3">
                                                <button onClick={() => receivePO(po)} className="text-[10px] font-black uppercase text-neon-lime hover:underline tracking-widest">Marcar Recibida</button>
                                                <button onClick={() => cancelPO(po)} className="text-[10px] font-black uppercase text-red-500/70 hover:text-red-500 tracking-widest">Cancelar</button>
                                            </div>
                                        )}
                                    </div>
                                )) : <p className="text-white/20 text-xs italic">Aun no hay ordenes de compra a este proveedor.</p>}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-[10px] font-black uppercase mb-4 tracking-[4px] text-white/30">Mensajes Enviados</h3>
                            <div className="space-y-3 max-h-[240px] overflow-y-auto custom-scrollbar pr-2">
                                {history.messages.length > 0 ? history.messages.map((m) => (
                                    <div key={m.id} className="bg-white/[0.02] border border-white/5 p-5 rounded-2xl">
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-bold text-white text-sm">{m.asunto}</p>
                                            <span className="text-[8px] font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded-full text-white/40">{m.motivo}</span>
                                        </div>
                                        <p className="text-xs text-zinc-400 leading-relaxed">{m.mensaje}</p>
                                        <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest mt-3">
                                            {new Date(m.created_at + 'Z').toLocaleString('es-MX')} {m.sent_by_name ? `· ${m.sent_by_name}` : ''} {m.product_name ? `· ${m.product_name}` : ''}
                                        </p>
                                    </div>
                                )) : <p className="text-white/20 text-xs italic">Aun no se han enviado mensajes.</p>}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {history?.supplier && (
                <>
                    <SendSupplierMessageModal
                        isOpen={messageOpen}
                        onClose={() => setMessageOpen(false)}
                        supplier={{ id: history.supplier.id, name: history.supplier.nombre_taller }}
                        onSent={reloadHistory}
                    />
                    <PurchaseOrderModal
                        isOpen={poOpen}
                        onClose={() => setPoOpen(false)}
                        supplier={{ id: history.supplier.id, name: history.supplier.nombre_taller }}
                        products={history.products || []}
                        onCreated={reloadHistory}
                    />
                </>
            )}
        </div>
    );
};

/** Maps a purchase order state to its badge color classes. */
const poBadge = (estado) => {
    if (estado === 'Recibido') return 'bg-neon-lime/10 text-neon-lime border border-neon-lime/20';
    if (estado === 'Cancelado') return 'bg-red-500/10 text-red-500 border border-red-500/20';
    return 'bg-white/5 text-white/50 border border-white/10';
};

const inputClass = 'w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-neon-lime outline-none transition-all text-sm';

const Field = ({ label, children }) => (
    <div className="space-y-2">
        <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">{label}</label>
        {children}
    </div>
);

const Stat = ({ label, value, danger, muted }) => (
    <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl text-center">
        <p className={`text-3xl font-black tracking-tighter ${danger ? 'text-red-500' : muted ? 'text-white' : 'text-neon-lime'}`}>{value}</p>
        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest mt-1">{label}</p>
    </div>
);

export default SupplierManager;
