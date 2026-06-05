import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../ui/Modal';
import { supabase } from '../../../lib/supabase';

const EMPTY_FORM = {
    id_producto: '',
    name: '',
    price: 0,
    description: '',
    category: 'Playera',
    images: { white: [], black: [] },
    active: true
};

/**
 * SCM Product Catalog management: CRUD for the store products.
 */
const ProductManager = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const [editOpen, setEditOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = async (searchTerm = search) => {
        setLoading(true);
        try {
            let query = supabase.from('products').select('*').order('name');
            
            if (searchTerm) {
                query = query.or(`name.ilike.%${searchTerm}%,id_producto.ilike.%${searchTerm}%`);
            }

            const { data, error } = await query;
            if (error) throw error;
            setProducts(data);
        } catch (err) {
            toast.error('Error al cargar productos: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(''); }, []);
    useEffect(() => {
        const handle = setTimeout(() => load(search), 300);
        return () => clearTimeout(handle);
    }, [search]);

    const openCreate = () => { 
        setEditing(null); 
        setForm(EMPTY_FORM); 
        setEditOpen(true); 
    };

    const openEdit = (p) => {
        setEditing(p);
        setForm({
            id_producto: p.id_producto,
            name: p.name,
            price: p.price,
            description: p.description || '',
            category: p.category || 'Playera',
            images: p.images || { white: [], black: [] },
            active: p.active
        });
        setEditOpen(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editing) {
                const { error } = await supabase.from('products').update(form).eq('id', editing.id);
                if (error) throw error;
                toast.success('Producto actualizado');
            } else {
                // 1. Create Product
                const { data: newProd, error } = await supabase.from('products').insert(form).select().single();
                if (error) throw error;

                // 2. Initialize Inventory for the new product
                await supabase.from('inventory').insert({
                    product_id: newProd.id,
                    stock_actual: 0,
                    stock_minimo: 5
                });

                toast.success('Producto registrado e inventario inicializado');
            }
            setEditOpen(false);
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (p) => {
        if (!window.confirm(`Eliminar el producto "${p.name}"? Esta acción es irreversible.`)) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', p.id);
            if (error) throw error;
            toast.success('Producto eliminado');
            load();
        } catch (err) {
            toast.error(err.message);
        }
    };

    const handleImageChange = (color, value) => {
        // Simple comma separated paths for now
        const paths = value.split(',').map(s => s.trim()).filter(Boolean);
        setForm(prev => ({
            ...prev,
            images: { ...prev.images, [color]: paths }
        }));
    };

    return (
        <div className="bg-dark-card text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-8 relative z-10 gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Catálogo de Productos</h2>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-1">Gestión de Tienda (SCM)</p>
                </div>
                <button onClick={openCreate} className="bg-white text-black font-black px-8 py-4 rounded-full text-[10px] uppercase tracking-[2px] hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">+ Nuevo Producto</button>
            </div>

            <div className="mb-8 relative z-10">
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o SKU..." className="bg-white/5 border border-white/10 text-sm rounded-full px-6 py-3.5 w-full md:w-96 focus:outline-none focus:border-white transition-all placeholder:text-text-muted/50" />
            </div>

            {loading ? (
                <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-white/5 border-t-white rounded-full animate-spin" /></div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-text-muted text-[10px] font-black uppercase tracking-[3px]">
                                <th className="pb-6 pl-4">SKU / Producto</th>
                                <th className="pb-6">Categoría</th>
                                <th className="pb-6">Precio</th>
                                <th className="pb-6">Estado</th>
                                <th className="pb-6 pr-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {products.length > 0 ? products.map((p) => (
                                <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-6 pl-4 font-bold text-white uppercase tracking-tight">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/5 overflow-hidden shrink-0">
                                                <img src={p.images?.white?.[0] || p.images?.black?.[0] || '/imagenes/placeholder.png'} className="w-full h-full object-contain p-1" alt="thumb" />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-lg leading-none mb-1">{p.name}</span>
                                                <span className="text-[10px] text-text-muted tracking-widest">{p.id_producto}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <span className="bg-white/10 text-white border border-white/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">{p.category}</span>
                                    </td>
                                    <td className="py-6 font-black text-white">${p.price}</td>
                                    <td className="py-6">
                                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${p.active ? 'bg-white/10 text-white border border-white/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {p.active ? 'Activo' : 'Oculto'}
                                        </span>
                                    </td>
                                    <td className="py-6 pr-4 text-right">
                                        <div className="flex gap-3 justify-end">
                                            <button onClick={() => openEdit(p)} className="text-[10px] font-black uppercase text-white hover:underline tracking-widest">Editar</button>
                                            <button onClick={() => handleDelete(p)} className="text-[10px] font-black uppercase text-red-500/70 hover:text-red-500 tracking-widest">Borrar</button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">No hay productos en el catálogo</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={editOpen}
                onClose={() => setEditOpen(false)}
                title={editing ? 'Editar Producto' : 'Nuevo Producto'}
                subtitle="SCM — Catálogo"
                footer={
                    <>
                        <button onClick={() => setEditOpen(false)} className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/10 transition-all">Cancelar</button>
                        <button form="product-form" type="submit" disabled={saving} className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-black hover:scale-105 transition-all disabled:opacity-50">{saving ? 'Guardando...' : 'Guardar'}</button>
                    </>
                }
            >
                <form id="product-form" onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Nombre del Producto</label>
                            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="P.EJ. SLIME TEE" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">SKU / ID Producto</label>
                            <input required value={form.id_producto} onChange={(e) => setForm({ ...form, id_producto: e.target.value })} className={inputClass} placeholder="SKU-XXX-001" disabled={!!editing} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        <div className="space-y-2">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Precio (MXN)</label>
                            <input required type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Categoría</label>
                            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputClass}>
                                <option value="Playera">Playera</option>
                                <option value="Gorro">Gorro</option>
                                <option value="Accesorio">Accesorio</option>
                            </select>
                        </div>
                        <div className="space-y-2 flex flex-col justify-end">
                            <label className="flex items-center gap-3 cursor-pointer p-3 bg-white/5 border border-white/10 rounded-2xl">
                                <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} className="w-4 h-4 accent-white" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-white/60">Producto Activo</span>
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Descripción</label>
                        <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={`${inputClass} min-h-[80px] resize-none`} placeholder="Detalles técnicos, materiales..." />
                    </div>

                    <div className="h-px bg-white/5 my-2" />

                    <div className="space-y-4">
                        <h4 className="text-[10px] font-black uppercase tracking-[4px] text-white/20">Rutas de Imágenes</h4>
                        <p className="text-[8px] text-white/10 uppercase tracking-widest italic">Separa múltiples rutas con comas (,)</p>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Variante Blanca</label>
                                <input 
                                    value={form.images.white.join(', ')} 
                                    onChange={(e) => handleImageChange('white', e.target.value)} 
                                    className={inputClass} 
                                    placeholder="/imagenes/v1.png, /imagenes/v1_back.png" 
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Variante Negra</label>
                                <input 
                                    value={form.images.black.join(', ')} 
                                    onChange={(e) => handleImageChange('black', e.target.value)} 
                                    className={inputClass} 
                                    placeholder="/imagenes/v2.png, /imagenes/v2_back.png" 
                                />
                            </div>
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

const inputClass = 'w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-white outline-none transition-all text-sm';

export default ProductManager;
