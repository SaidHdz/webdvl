import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../ui/Modal';
import SendSupplierMessageModal from './SendSupplierMessageModal';
import RestockModal from './RestockModal';
import { supabase } from '../../../lib/supabase';

/**
 * SCM inventory management powered by Supabase.
 * Handles stock adjustments and reorder threshold management.
 */
const InventoryManager = () => {
    const [items, setItems] = useState([]);
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [lowOnly, setLowOnly] = useState(false);

    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ stock_actual: 0, stock_minimo: 0, supplier_id: '' });
    const [saving, setSaving] = useState(false);

    // Supplier message modal target.
    const [messageTarget, setMessageTarget] = useState(null);
    // Restock (purchase order) modal target.
    const [restockTarget, setRestockTarget] = useState(null);

    const load = async (searchTerm = search, low = lowOnly) => {
        setLoading(true);
        try {
            // Fetch suppliers for the dropdown
            const suppliersRes = await supabase.from('suppliers').select('id, nombre_taller').order('nombre_taller');
            if (suppliersRes.error) throw suppliersRes.error;
            setSuppliers(suppliersRes.data);

            // Fetch inventory with relational data
            let query = supabase
                .from('inventory')
                .select(`
                    *,
                    products (name, id_producto),
                    suppliers (nombre_taller)
                `);
            
            if (low) {
                // We can't easily filter by a computed column in a simple select if the threshold varies per row
                // without an RPC or complex filter. For now, we'll filter client-side or use a gte filter if possible.
                // In Postgres we could do .filter('stock_actual', 'lte', 'stock_minimo') but PostgREST doesn't support col vs col directly.
            }

            const { data, error } = await query;
            if (error) throw error;

            let formatted = data.map(i => ({
                ...i,
                name: i.products?.name,
                id_producto: i.products?.id_producto,
                supplier_name: i.suppliers?.nombre_taller,
                is_low: i.stock_actual <= i.stock_minimo
            }));

            // Client-side filtering for search and low stock
            if (searchTerm) {
                formatted = formatted.filter(i => 
                    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                    i.id_producto?.toLowerCase().includes(searchTerm.toLowerCase())
                );
            }
            if (low) {
                formatted = formatted.filter(i => i.is_low);
            }

            setItems(formatted);
        } catch (err) {
            toast.error('Error al cargar inventario: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load('', false); }, []);

    useEffect(() => {
        const handle = setTimeout(() => load(search, lowOnly), 300);
        return () => clearTimeout(handle);
    }, [search, lowOnly]);

    const lowCount = items.filter((i) => i.is_low).length;
    const totalUnits = items.reduce((acc, i) => acc + i.stock_actual, 0);

    const openEdit = (item) => {
        setEditing(item);
        setForm({ stock_actual: item.stock_actual, stock_minimo: item.stock_minimo, supplier_id: item.supplier_id || '' });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { error } = await supabase
                .from('inventory')
                .update({
                    stock_actual: Number(form.stock_actual),
                    stock_minimo: Number(form.stock_minimo),
                    supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
                    updated_at: new Date().toISOString()
                })
                .eq('id', editing.id);
            
            if (error) throw error;

            toast.success('Inventario actualizado');
            setEditing(null);
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-dark-card text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-8 relative z-10 gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Control de Inventario</h2>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-1">SCM — Stock de Prendas</p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-red-500/10 border border-red-500/20 px-6 py-4 rounded-3xl text-right">
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-widest">Alertas Pull</p>
                        <p className="text-lg font-black text-white">{lowCount} Criticas</p>
                    </div>
                    <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl text-right">
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Piezas</p>
                        <p className="text-lg font-black text-white">{totalUnits}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-8 relative z-10">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o SKU..."
                    className="bg-white/5 border border-white/10 text-sm rounded-full px-6 py-3.5 w-full sm:w-96 focus:outline-none focus:border-white transition-all placeholder:text-text-muted/50"
                />
                <button
                    onClick={() => setLowOnly((v) => !v)}
                    className={`px-6 py-3.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${lowOnly ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 text-white/50 border-white/10 hover:text-white'}`}
                >
                    Solo Stock Bajo
                </button>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="w-10 h-10 border-4 border-white/5 border-t-white rounded-full animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-text-muted text-[10px] font-black uppercase tracking-[3px]">
                                <th className="pb-6 pl-4">SKU</th>
                                <th className="pb-6">Prenda</th>
                                <th className="pb-6">Proveedor</th>
                                <th className="pb-6 text-center">Stock</th>
                                <th className="pb-6 text-center">Minimo</th>
                                <th className="pb-6 pr-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {items.length > 0 ? items.map((item) => (
                                <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-6 pl-4 font-mono text-xs text-white/40">{item.id_producto}</td>
                                    <td className="py-6 font-bold text-white uppercase tracking-tight">{item.name}</td>
                                    <td className="py-6 text-zinc-400 text-sm">{item.supplier_name || '—'}</td>
                                    <td className="py-6 text-center">
                                        <span className={`text-xl font-black ${item.is_low ? 'text-red-500' : 'text-white'}`}>{item.stock_actual}</span>
                                    </td>
                                    <td className="py-6 text-center text-zinc-500 font-bold">{item.stock_minimo}</td>
                                    <td className="py-6 pr-4 text-right">
                                        <div className="flex gap-3 justify-end items-center">
                                            {item.is_low && (
                                                <span className="px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-red-500 text-white animate-pulse">Reordenar</span>
                                            )}
                                            {item.is_low && item.supplier_id && (
                                                <button
                                                    onClick={() => setMessageTarget({ supplier: { id: item.supplier_id, name: item.supplier_name }, product: { id: item.product_id, name: item.name } })}
                                                    className="text-[10px] font-black uppercase text-red-400 hover:text-red-300 tracking-widest"
                                                >
                                                    Avisar
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setRestockTarget(item)}
                                                className="text-[10px] font-black uppercase text-white hover:underline tracking-widest"
                                            >
                                                Reabastecer
                                            </button>
                                            <button onClick={() => openEdit(item)} className="text-[10px] font-black uppercase text-accent hover:underline tracking-widest">Editar</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">Sin resultados</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={!!editing}
                onClose={() => setEditing(null)}
                title="Ajustar Inventario"
                subtitle={editing?.name}
                footer={
                    <>
                        <button onClick={() => setEditing(null)} className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/10 transition-all">Cancelar</button>
                        <button form="inv-form" type="submit" disabled={saving} className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-black hover:scale-105 transition-all disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
                    </>
                }
            >
                <form id="inv-form" onSubmit={handleSave} className="space-y-5">
                    <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Stock Actual</label>
                            <input type="number" min="0" value={form.stock_actual} onChange={(e) => setForm({ ...form, stock_actual: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-white outline-none transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Stock Minimo</label>
                            <input type="number" min="0" value={form.stock_minimo} onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-white outline-none transition-all" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Proveedor</label>
                        <select value={form.supplier_id} onChange={(e) => setForm({ ...form, supplier_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-white outline-none transition-all cursor-pointer">
                            <option value="" className="bg-zinc-900">Sin proveedor</option>
                            {suppliers.map((s) => (
                                <option key={s.id} value={s.id} className="bg-zinc-900">{s.nombre_taller}</option>
                            ))}
                        </select>
                    </div>
                </form>
            </Modal>

            <SendSupplierMessageModal
                isOpen={!!messageTarget}
                onClose={() => setMessageTarget(null)}
                supplier={messageTarget?.supplier}
                product={messageTarget?.product}
            />

            <RestockModal
                isOpen={!!restockTarget}
                onClose={() => setRestockTarget(null)}
                item={restockTarget}
                onDone={() => load()}
            />
        </div>
    );
};

export default InventoryManager;
