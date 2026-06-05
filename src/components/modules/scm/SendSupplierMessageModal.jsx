import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import Modal from '../../ui/Modal';
import { apiService } from '../../../services/api';

/**
 * Reusable modal to send (store) a manual message to a supplier. Used both from
 * the supplier detail view and from a low-stock inventory row, where it
 * pre-fills a reorder request for the affected product.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {{id: number, name: string}} supplier - Target supplier.
 * @param {{id: number, name: string}} [product] - Optional related product.
 * @param {() => void} [onSent] - Called after a successful send.
 */
const SendSupplierMessageModal = ({ isOpen, onClose, supplier, product, onSent }) => {
    const [form, setForm] = useState({ asunto: '', mensaje: '', motivo: 'stock_bajo' });
    const [saving, setSaving] = useState(false);

    // Pre-fill a low-stock reorder template when opened for a specific product.
    useEffect(() => {
        if (!isOpen) return;
        if (product) {
            setForm({
                asunto: `Reabastecimiento: ${product.name}`,
                mensaje: `Hola ${supplier?.name || ''}, el producto "${product.name}" esta por debajo del stock minimo. Favor de cotizar y programar una reposicion lo antes posible.`,
                motivo: 'stock_bajo',
            });
        } else {
            setForm({ asunto: '', mensaje: '', motivo: 'manual' });
        }
    }, [isOpen, product, supplier]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await apiService.suppliers.sendMessage(supplier.id, {
                ...form,
                product_id: product?.id || null,
            });
            toast.success('Mensaje enviado al proveedor');
            onClose();
            onSent?.();
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
            title="Mensaje al Proveedor"
            subtitle={supplier?.name}
            footer={
                <>
                    <button onClick={onClose} className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/10 transition-all">Cancelar</button>
                    <button form="supplier-msg-form" type="submit" disabled={saving} className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-white text-black hover:scale-105 transition-all disabled:opacity-50">
                        {saving ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                </>
            }
        >
            <form id="supplier-msg-form" onSubmit={handleSubmit} className="space-y-5">
                {product && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-3">
                        <p className="text-[9px] font-black uppercase tracking-widest text-red-500">Producto en alerta</p>
                        <p className="text-sm font-bold text-white">{product.name}</p>
                    </div>
                )}
                <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Asunto</label>
                    <input
                        value={form.asunto}
                        onChange={(e) => setForm({ ...form, asunto: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-white outline-none transition-all text-sm"
                        placeholder="Asunto del mensaje"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Mensaje</label>
                    <textarea
                        value={form.mensaje}
                        onChange={(e) => setForm({ ...form, mensaje: e.target.value })}
                        rows={5}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-white outline-none transition-all text-sm resize-none"
                        placeholder="Escribe el mensaje..."
                    />
                </div>
            </form>
        </Modal>
    );
};

export default SendSupplierMessageModal;
