import React from 'react';
import { apiService } from '../services/api';
import { toast } from 'sonner';

/**
 * Logistics Manager view.
 * Displays order tracking and fulfillment data.
 */
export const LogisticsManager = ({ orders = [], loading, onUpdateStatus }) => {
  
  const handleStatusChange = async (idPedido, nuevoEstado) => {
    const promise = apiService.updateOrderStatus(idPedido, nuevoEstado);
    
    toast.promise(promise, {
      loading: `Actualizando pedido ${idPedido}...`,
      success: () => {
        onUpdateStatus(idPedido, nuevoEstado);
        return `Pedido actualizado a ${nuevoEstado}`;
      },
      error: 'Error al conectar con el servidor de n8n'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className="bg-canvas-bg min-h-screen flex items-center justify-center -mx-4 pt-10">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-dark-card border-t-neon-lime rounded-full animate-spin" />
            <p className="font-black uppercase tracking-[4px] text-[10px] text-dark-card">Cargando Logística...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas-bg min-h-screen p-8 font-display -mx-4 pt-10">
      <div className="bg-dark-card text-white rounded-3xl p-10 shadow-2xl animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/5 pb-8 relative z-10 gap-6">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter">Logística de Pedidos</h2>
            <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-2">Seguimiento y Cumplimiento</p>
          </div>
          <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl text-right">
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Órdenes Totales</p>
            <p className="text-lg font-black text-neon-lime">{orders.length}</p>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-text-muted text-[10px] font-black uppercase tracking-[3px]">
                <th className="pb-6 pl-4">ID Pedido</th>
                <th className="pb-6">Cliente</th>
                <th className="pb-6">Productos</th>
                <th className="pb-6">Monto Total</th>
                <th className="pb-6">Tipo Envío</th>
                <th className="pb-6 pr-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {orders.length > 0 ? (
                orders.map((order, index) => {
                  let items = [];
                  try {
                    items = typeof order.items_json === 'string' ? JSON.parse(order.items_json) : (order.items_json || []);
                  } catch (e) { console.error("Error parsing items_json", e); }

                  return (
                    <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-6 pl-4 font-mono text-xs text-white/40">{order.id_pedido}</td>
                      <td className="py-6 font-bold text-white uppercase tracking-tight">{order.id_cliente}</td>
                      <td className="py-6">
                        <div className="flex flex-col gap-1">
                          {Array.isArray(items) ? items.map((it, i) => (
                            <span key={i} className="text-[10px] text-zinc-400 font-medium">
                              • {it.id_producto} (x{it.cantidad})
                            </span>
                          )) : <span className="text-[10px] text-zinc-500 italic">Ver detalles en Dashboard</span>}
                        </div>
                      </td>
                      <td className="py-6 font-black text-white">${order.total}</td>
                      <td className="py-6">
                         <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">
                            {order.tipo_envio}
                         </span>
                      </td>
                      <td className="py-6 pr-4 text-right">
                        <div className="flex flex-col items-end gap-2">
                            <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                            order.estado === 'Entregado' || order.estado === 'Enviado'
                                ? 'bg-neon-lime/10 text-neon-lime border border-neon-lime/20' 
                                : 'bg-white/5 text-white/40 border border-white/10'
                            }`}>
                            {order.estado}
                            </span>
                            
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                {order.estado !== 'Enviado' && order.estado !== 'Entregado' && (
                                    <button 
                                        onClick={() => handleStatusChange(order.id_pedido, 'Enviado')}
                                        className="text-[8px] font-black uppercase tracking-widest text-accent hover:underline"
                                    >
                                        Marcar Enviado
                                    </button>
                                )}
                                {order.estado !== 'Entregado' && (
                                    <button 
                                        onClick={() => handleStatusChange(order.id_pedido, 'Entregado')}
                                        className="text-[8px] font-black uppercase tracking-widest text-white/40 hover:text-white hover:underline"
                                    >
                                        Marcar Entregado
                                    </button>
                                )}
                            </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">
                    No hay registros logísticos disponibles.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LogisticsManager;
