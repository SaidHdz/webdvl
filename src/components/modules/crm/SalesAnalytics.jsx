import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { apiService } from '../../../services/api';

const RANGES = [
    { key: 'day', label: 'Dia' },
    { key: 'week', label: 'Semana' },
    { key: 'month', label: 'Mes' },
];

/**
 * CRM sales analytics. A day/week/month switch drives the window; the panel
 * shows headline totals, a simple bar chart of daily revenue and the
 * top-selling products for the selected period.
 */
const SalesAnalytics = () => {
    const [range, setRange] = useState('week');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        apiService.sales.summary(range)
            .then((res) => setData(res.data))
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    }, [range]);

    const maxSeries = data?.series?.reduce((max, p) => Math.max(max, p.total), 0) || 0;

    return (
        <div className="bg-dark-card text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-8 relative z-10 gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Analitica de Ventas</h2>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-1">Reporte por Periodo</p>
                </div>
                <div className="flex gap-2 bg-dark-subcard p-1.5 rounded-full border border-white/5">
                    {RANGES.map((r) => (
                        <button key={r.key} onClick={() => setRange(r.key)} className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${range === r.key ? 'bg-white text-black' : 'text-text-muted hover:text-white'}`}>{r.label}</button>
                    ))}
                </div>
            </div>

            {loading || !data ? (
                <div className="py-20 flex justify-center"><div className="w-10 h-10 border-4 border-white/5 border-t-white rounded-full animate-spin" /></div>
            ) : (
                <div className="space-y-8 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        <Metric label="Ventas Totales" value={`$${data.total_ventas.toLocaleString('es-MX')}`} />
                        <Metric label="Pedidos" value={data.num_pedidos} muted />
                        <Metric label="Ticket Promedio" value={`$${data.ticket_promedio.toLocaleString('es-MX')}`} muted />
                    </div>

                    <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8">
                        <p className="text-[10px] font-black uppercase tracking-[3px] text-white/30 mb-6">Ventas por Dia</p>
                        {data.series.length > 0 ? (
                            <div className="flex items-end gap-3 h-48">
                                {data.series.map((point) => (
                                    <div key={point.fecha} className="flex-1 flex flex-col items-center gap-2 group">
                                        <span className="text-[9px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">${point.total}</span>
                                        <div
                                            className="w-full bg-gradient-to-t from-white/30 to-white rounded-t-lg transition-all hover:from-white/50"
                                            style={{ height: `${maxSeries > 0 ? Math.max((point.total / maxSeries) * 100, 4) : 4}%` }}
                                            title={`$${point.total}`}
                                        />
                                        <span className="text-[8px] font-bold text-white/30 uppercase">{formatDay(point.fecha)}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-white/20 text-xs italic py-12 text-center">Sin ventas en este periodo.</p>
                        )}
                    </div>

                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[3px] text-white/30 mb-4">Productos Mas Vendidos</p>
                        <div className="space-y-2">
                            {data.top_products.length > 0 ? data.top_products.map((p, i) => (
                                <div key={p.id_producto} className="flex items-center justify-between bg-white/[0.02] border border-white/5 px-5 py-3 rounded-2xl">
                                    <div className="flex items-center gap-4">
                                        <span className="text-white/20 font-black text-sm w-5">{i + 1}</span>
                                        <span className="text-sm font-bold text-white">{p.name}</span>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <span className="text-xs text-white/40 font-bold">{p.unidades} uds</span>
                                        <span className="text-sm font-black text-white">${p.ingresos}</span>
                                    </div>
                                </div>
                            )) : <p className="text-white/20 text-xs italic">Sin ventas en este periodo.</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

/** Formats an ISO date (YYYY-MM-DD) into a short day/month label. */
const formatDay = (iso) => {
    const [, month, day] = iso.split('-');
    return `${day}/${month}`;
};

const Metric = ({ label, value, muted }) => (
    <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl">
        <p className="text-text-muted text-[10px] uppercase font-black tracking-[2px]">{label}</p>
        <p className={`text-4xl font-black mt-2 tracking-tighter ${muted ? 'text-white' : 'text-white'}`}>{value}</p>
    </div>
);

export default SalesAnalytics;
