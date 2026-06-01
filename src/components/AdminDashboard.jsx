import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { apiService } from '../services/api';

/**
 * Dashboard principal de administración con datos dinámicos desde n8n.
 */
export const AdminDashboard = ({ externalData, loading }) => {
  const { metrics, logistics = [] } = externalData;
  const [activeOrder, setActiveOrder] = useState(null);

  if (loading && !metrics.totalClientes) {
    return (
      <div className="bg-canvas-bg min-h-screen flex items-center justify-center -mx-4 pt-10">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-dark-card border-t-neon-lime rounded-full animate-spin" />
            <p className="font-black uppercase tracking-[4px] text-[10px] text-dark-card">Sincronizando Sistema...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas-bg min-h-screen p-8 font-display -mx-4 pt-10">
      {/* Encabezado */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-dark-card tracking-tighter">Inicios / CRM Central</h1>
          <p className="text-text-muted text-sm font-medium">Gestión unificada de SCM, CRM y RH</p>
        </div>
        <button 
          onClick={() => toast.info('Ajustes de sistema próximamente')}
          className="bg-dark-card text-white px-8 py-4 rounded-full hover:scale-105 transition-all font-black text-[10px] uppercase tracking-[2px] shadow-xl"
        >
          + Configuración Sistema
        </button>
      </div>

      {/* Indicadores Clave en formato de Tarjetas de la Imagen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
          <p className="text-text-muted text-[10px] uppercase font-black tracking-[2px]">Clientes Registrados (CRM)</p>
          <p className="text-5xl font-extrabold text-dark-card mt-2">{metrics.totalClientes}</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
            <div className="bg-neon-lime h-full w-[70%] rounded-full transition-all duration-1000" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
          <p className="text-text-muted text-[10px] uppercase font-black tracking-[2px]">Prendas en Inventario (SCM)</p>
          <p className="text-5xl font-extrabold text-dark-card mt-2">{metrics.totalInventario} <span className="text-xl">pzas</span></p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
            <div className="bg-dark-card h-full w-[45%] rounded-full transition-all duration-1000" />
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
          <p className="text-text-muted text-[10px] uppercase font-black tracking-[2px]">Personal Activo (RH)</p>
          <p className="text-5xl font-extrabold text-dark-card mt-2">{metrics.totalEmpleados}</p>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
            <div className="bg-neon-lime h-full w-[85%] rounded-full transition-all duration-1000" />
          </div>
        </div>
      </div>
      
      {/* Bloque B: Split Layout de Consultas Integradas */}
      <CRMOrderSplitView 
        orders={logistics} 
        activeOrder={activeOrder} 
        onSelectOrder={setActiveOrder} 
      />
    </div>
  );
};

/**
 * Vista dividida para consultas integradas CRM/SCM.
 */
const CRMOrderSplitView = ({ orders = [], activeOrder, onSelectOrder }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState('recent'); // all, recent, sent

  // Filtrado y búsqueda combinada
  const displayOrders = orders.filter(order => {
    if (!order) return false;
    const query = searchQuery.toLowerCase();
    
    // Filtro por pestaña
    if (filterMode === 'sent' && order.estado !== 'Enviado' && order.estado !== 'Entregado') return false;
    
    // Si estamos en modo reciente, filtramos por los últimos 5
    if (filterMode === 'recent') {
        const lastFive = orders.slice(-5);
        if (!lastFive.find(o => o.id_pedido === order.id_pedido)) return false;
    }

    const matchesId = (order.id_pedido || '').toLowerCase().includes(query);
    const matchesClient = (order.id_cliente || '').toLowerCase().includes(query);
    
    return matchesId || matchesClient;
  }).reverse(); // Mostramos lo más nuevo primero

  return (
    <div className="bg-dark-card text-white rounded-3xl p-8 shadow-2xl animate-slide-up">
      {/* Pestañas superiores */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 border-b border-white/5 pb-6">
        <div className="flex gap-2 bg-dark-subcard p-1.5 rounded-full border border-white/5">
          <button 
            onClick={() => setFilterMode('all')}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filterMode === 'all' ? 'bg-zinc-800 text-white' : 'text-text-muted hover:text-white'}`}
          >
            Todos
          </button>
          <button 
            onClick={() => setFilterMode('recent')}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filterMode === 'recent' ? 'bg-zinc-800 text-white' : 'text-text-muted hover:text-white'}`}
          >
            Recientes
          </button>
          <button 
            onClick={() => setFilterMode('sent')}
            className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all ${filterMode === 'sent' ? 'bg-neon-lime text-dark-card' : 'text-text-muted hover:text-white'}`}
          >
            Enviados
          </button>
        </div>
        <div className="relative w-full md:w-96">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none">🔍</span>
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar pedido o cliente..." 
            className="bg-dark-subcard border border-white/10 text-sm rounded-full px-12 py-3.5 w-full focus:outline-none focus:border-neon-lime transition-all placeholder:text-text-muted/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Izquierdo: Lista de Registros */}
        <div className="lg:col-span-5 space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
          {displayOrders.length > 0 ? (
            displayOrders.map((order, idx) => (
              <div 
                key={order.id_pedido || idx}
                onClick={() => onSelectOrder(order)}
                className={`p-5 rounded-2xl cursor-pointer flex justify-between items-center transition-all duration-300 border ${
                  activeOrder?.id_pedido === order.id_pedido 
                  ? 'bg-dark-subcard border-neon-lime shadow-[0_0_20px_rgba(219,255,0,0.1)]' 
                  : 'bg-white/5 border-transparent hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-dark-subcard border border-white/10 flex items-center justify-center font-black text-neon-lime text-lg shadow-inner">
                    {(order.id_cliente || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-black text-white/40 tracking-[2px]">{order.id_pedido || '#ORD-LOG'}</p>
                    <p className="text-sm font-bold text-white uppercase tracking-tight">{order.id_cliente}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-neon-lime tracking-tighter">${order.total || 0}</p>
                  <span className={`text-[9px] px-3 py-1 rounded-full font-black uppercase tracking-widest ${order.estado === 'Enviado' || order.estado === 'Entregado' ? 'bg-neon-lime text-dark-card' : 'bg-white/5 text-text-muted'}`}>
                    {order.estado || 'Pendiente'}
                  </span>
                </div>
              </div>
            ))
          ) : (
             <div className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">
                No hay pedidos en esta categoría
             </div>
          )}
        </div>

        {/* Lado Derecho: Tarjeta de Detalle Expandido */}
        <div className="lg:col-span-7 bg-[#2A313C] rounded-[2.5rem] p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group min-h-[400px]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-neon-lime/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-neon-lime/10 transition-all" />
          
          {activeOrder ? (
            <>
              <div>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-[4px] font-black">Detalles del Pedido</span>
                    <h3 className="text-4xl font-black text-white mt-1 tracking-tighter">{activeOrder.id_pedido || '#ORD-DET'}</h3>
                  </div>
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-4 rounded-3xl text-right">
                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Cliente CRM</p>
                    <p className="text-lg font-black text-neon-lime uppercase tracking-tight">{activeOrder.id_cliente}</p>
                  </div>
                </div>

                {/* Items de SCM consumidos */}
                <div className="bg-black/20 backdrop-blur-sm rounded-3xl p-6 space-y-4 mb-6 border border-white/5">
                  <p className="text-[10px] font-black uppercase text-text-muted tracking-[3px]">Prendas Solicitadas (SCM)</p>
                  {/* Aquí procesamos el items_json si existe */}
                  {(() => {
                    let items = [];
                    try {
                      items = typeof activeOrder.items_json === 'string' ? JSON.parse(activeOrder.items_json) : (activeOrder.items_json || []);
                    } catch (e) { items = []; }
                    
                    if (items.length > 0) {
                      return items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center text-sm border-b border-white/5 pb-3 last:border-0 last:pb-0">
                          <div className="flex flex-col">
                            <span className="font-bold text-white">{item.id_producto}</span>
                            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Cantidad: {item.cantidad}</span>
                          </div>
                        </div>
                      ));
                    }
                    return <p className="text-xs text-white/20 italic">No hay ítems detallados.</p>
                  })()}
                </div>
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-white/10">
                <div>
                  <p className="text-[10px] font-black text-zinc-400 uppercase tracking-[3px]">Total Neto a Cuenta</p>
                  <p className="text-4xl font-black text-neon-lime tracking-tighter">${activeOrder.total || 0}</p>
                </div>
                <div className="bg-white/5 px-4 py-2 rounded-xl text-center border border-white/10">
                    <p className="text-[8px] font-black text-white/40 uppercase tracking-widest">Envío</p>
                    <p className="text-[10px] font-black text-accent uppercase">{activeOrder.tipo_envio}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-sm gap-4">
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/10 flex items-center justify-center text-2xl opacity-20">📄</div>
              <p className="uppercase font-black tracking-[4px] text-[10px] opacity-40">Selecciona un registro para ver la consulta</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
