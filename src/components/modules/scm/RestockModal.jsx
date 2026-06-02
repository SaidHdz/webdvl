import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Modal from '../../ui/Modal';
import { apiService } from '../../../services/api';

/**
 * Quick restock from the inventory view. Creates a purchase order to the
 * product's supplier. The primary action also marks it received, simulating the
 * restock so stock goes up immediately; a secondary action just files the order
 * as pending (to be received later from the supplier history).
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {Object} item - Inventory row (id_producto, name, stock_actual, supplier_id, supplier_name).
 * @param {() => void} [onDone]
 */
const RestockModal = ({ isOpen, onClose, item, onDone }) => {
    const [cantidad, setCantidad] = useState(10);
    const [costo, setCosto] = useState(0);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) { setCantidad(10); setCosto(0); }
    }, [isOpen]);

    const submit = async (receive) => {
        const qty = Number(cantidad);
        if (!qty || qty <= 0) { toast.error('Cantidad invalida'); return; }
        setSaving(true);
        try {
            await apiService.purchaseOrders.create({
                supplier_id: item.supplier_id,
                notas: receive ? 'Reabastecimiento desde inventario' : 'Pedido desde inventario',
                receive,
                items: [{ id_producto: item.id_producto, cantidad: qty, costo_unitario: Number(costo) || 0 }],
            });
            toast.success(receive
                ? `Reabastecido: +${qty} de ${item.name}`
                : `Pedido creado para ${item.name}`);
            onClose();
            onDone?.();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (!item) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Reabastecer Prenda"
            subtitle="SCM — Pedido a Proveedor"
            footer={
                <>
                    <button onClick={() => submit(false)} disabled={saving || !item.supplier_id} className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white border border-white/10 transition-all disabled:opacity-30">Solo crear pedido</button>
                    <button onClick={() => submit(true)} disabled={saving || !item.supplier_id} className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-neon-lime text-dark-card hover:scale-105 transition-all disabled:opacity-30">{saving ? 'Procesando...' : 'Reabastecer ahora'}</button>
                </>
            }
        >
            <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Prenda</p>
                        <p className="text-sm font-bold text-white mt-1">{item.name}</p>
                    </div>
                    <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl">
                        <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Stock Actual</p>
                        <p className={`text-2xl font-black tracking-tighter mt-1 ${item.is_low ? 'text-red-500' : 'text-neon-lime'}`}>{item.stock_actual}</p>
                    </div>
                </div>

                <div className="bg-white/[0.03] border border-white/5 p-5 rounded-2xl">
                    <p className="text-[9px] font-black text-white/30 uppercase tracking-widest">Proveedor</p>
                    <p className="text-sm font-bold text-white mt-1">{item.supplier_name || 'Sin proveedor asignado'}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Cantidad a pedir</label>
                        <input type="number" min="1" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-neon-lime outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Costo unitario</label>
                        <input type="number" min="0" step="0.01" value={costo} onChange={(e) => setCosto(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-neon-lime outline-none transition-all" />
                    </div>
                </div>

                {!item.supplier_id && (
                    <p className="text-red-400 text-[11px] font-bold">Asigna un proveedor a esta prenda (boton Editar) antes de pedir.</p>
                )}
                <p className="text-white/30 text-[11px]">
                    "Reabastecer ahora" registra la orden como recibida y suma {cantidad || 0} al stock. "Solo crear pedido" la deja pendiente para recibirla luego desde el historial del proveedor.
                </p>
            </div>
        </Modal>
    );
};

export default RestockModal;
