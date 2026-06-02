import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';

/**
 * ERP global dashboard. Shows cross-module counters pulled from the stats
 * endpoint so the admin gets a one-glance view of the whole operation.
 */
const METRIC_CARDS = [
    { key: 'totalClientes', label: 'Clientes (CRM)', accent: 'neon-lime' },
    { key: 'totalStaff', label: 'Personal Activo (RH)', accent: 'white' },
    { key: 'totalInventario', label: 'Piezas en Stock (SCM)', accent: 'neon-lime', suffix: 'pzas' },
    { key: 'totalProductos', label: 'Productos en Catalogo', accent: 'white' },
    { key: 'totalPedidos', label: 'Pedidos Totales', accent: 'white' },
    { key: 'ventasMes', label: 'Ventas (30 dias)', accent: 'neon-lime', prefix: '$' },
];

const ErpDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiService.stats.overview()
            .then((res) => setData(res.data))
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="py-24 flex justify-center">
                <div className="w-10 h-10 border-4 border-white/10 border-t-neon-lime rounded-full animate-spin" />
            </div>
        );
    }

    if (!data) return null;

    return (
        <div className="space-y-8">
            {data.alertasStock > 0 && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-3xl px-8 py-6 flex items-center justify-between">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[3px] text-red-500">Alerta de Inventario</p>
                        <p className="text-white/70 text-sm font-medium mt-1">
                            {data.alertasStock} producto(s) por debajo del stock minimo.
                        </p>
                    </div>
                    <span className="text-4xl font-black text-red-500">{data.alertasStock}</span>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {METRIC_CARDS.map((card) => (
                    <div key={card.key} className="bg-dark-card border border-white/10 p-8 rounded-3xl hover:border-white/20 transition-all">
                        <p className="text-text-muted text-[10px] uppercase font-black tracking-[2px]">{card.label}</p>
                        <p className={`text-5xl font-black mt-3 tracking-tighter ${card.accent === 'neon-lime' ? 'text-neon-lime' : 'text-white'}`}>
                            {card.prefix || ''}{Number(data[card.key]).toLocaleString('es-MX')}
                            {card.suffix && <span className="text-lg ml-1 opacity-50">{card.suffix}</span>}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ErpDashboard;
