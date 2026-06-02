import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Modal from '../../ui/Modal';
import { apiService } from '../../../services/api';

const emptyLine = () => ({ id_producto: '', cantidad: 1, costo_unitario: 0 });

/**
 * Modal to create a purchase order (restock) for a supplier. Lines are picked
 * from the products this supplier already supplies; the running total is shown
 * so the buyer sees the cost before confirming.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {{id:number,name:string}} supplier
 * @param {Array} products - Products supplied by this supplier ({id_producto,name}).
 * @param {() => void} [onCreated]
 */
const PurchaseOrderModal = ({ isOpen, onClose, supplier, products = [], onCreated }) => {
    const [lines, setLines] = useState([emptyLine()]);
    const [notas, setNotas] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLines([{ ...emptyLine(), id_producto: products[0]?.id_producto || '' }]);
            setNotas('');
        }
    }, [isOpen, products]);

    const updateLine = (idx, patch) => setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
    const addLine = () => setLines((prev) => [...prev, { ...emptyLine(), id_producto: products[0]?.id_producto || '' }]);
    const removeLine = (idx) => setLines((prev) => prev.filter((_, i) => i !== idx));

    const total = lines.reduce((sum, l) => sum + Number(l.cantidad || 0) * Number(l.costo_unitario || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validLines = lines.filter((l) => l.id_producto && Number(l.cantidad) > 0);
        if (validLines.length === 0) {
            toast.error('Agrega al menos un producto con cantidad');
            return;
        }
        setSaving(true);
        try {
            await apiService.purchaseOrders.create({
                supplier_id: supplier.id,
                notas,
                items: validLines.map((l) => ({
                    id_producto: l.id_producto,
                    cantidad: Number(l.cantidad),
                    costo_unitario: Number(l.costo_unitario),
                })),
            });
            toast.success('Orden de compra creada');
            onClose();
            onCreated?.();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Nueva Orden de Compra"
            subtitle={supplier?.name}
            footer={
                <>
                    <button onClick={onClose} className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/10 transition-all">Cancelar</button>
                    <button form="po-form" type="submit" disabled={saving} className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-neon-lime text-dark-card hover:scale-105 transition-all disabled:opacity-50">{saving ? 'Creando...' : `Crear ($${total})`}</button>
                </>
            }
        >
            {products.length === 0 ? (
                <p className="text-white/30 text-xs italic py-6">Este proveedor no tiene productos asignados. Asignalo como proveedor en Inventario primero.</p>
            ) : (
                <form id="po-form" onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-3">
                        {lines.map((line, idx) => (
                            <div key={idx} className="flex gap-2 items-end">
                                <div className="flex-grow space-y-1">
                                    <label className="text-[8px] uppercase font-black text-white/30 tracking-widest ml-2">Producto</label>
                                    <select value={line.id_producto} onChange={(e) => updateLine(idx, { id_producto: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-neon-lime outline-none text-sm cursor-pointer">
                                        {products.map((p) => (
                                            <option key={p.id_producto} value={p.id_producto} className="bg-zinc-900">{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-20 space-y-1">
                                    <label className="text-[8px] uppercase font-black text-white/30 tracking-widest ml-2">Cant.</label>
                                    <input type="number" min="1" value={line.cantidad} onChange={(e) => updateLine(idx, { cantidad: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-neon-lime outline-none text-sm" />
                                </div>
                                <div className="w-24 space-y-1">
                                    <label className="text-[8px] uppercase font-black text-white/30 tracking-widest ml-2">Costo</label>
                                    <input type="number" min="0" step="0.01" value={line.costo_unitario} onChange={(e) => updateLine(idx, { costo_unitario: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white focus:border-neon-lime outline-none text-sm" />
                                </div>
                                <button type="button" onClick={() => removeLine(idx)} disabled={lines.length === 1} className="px-3 py-2.5 text-red-500/60 hover:text-red-500 disabled:opacity-20 text-lg">✕</button>
                            </div>
                        ))}
                    </div>
                    <button type="button" onClick={addLine} className="text-[10px] font-black uppercase tracking-widest text-neon-lime hover:underline">+ Agregar linea</button>
                    <div className="space-y-1">
                        <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Notas</label>
                        <input value={notas} onChange={(e) => setNotas(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white focus:border-neon-lime outline-none text-sm" placeholder="Notas del pedido (opcional)" />
                    </div>
                </form>
            )}
        </Modal>
    );
};

export default PurchaseOrderModal;
