import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

/**
 * CRM Client Manager view.
 * Allows viewing and downloading client data.
 * Integrated with SCM for order history via a Neo-Brutalist Modal.
 */
export const ClientManager = ({ externalData = [], loading, allOrders = [] }) => {
  const [clients, setClients] = useState(externalData);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    setClients(externalData);
  }, [externalData]);

  /**
   * Opens the detail modal for a specific user, filtering their orders from SCM data.
   */
  const handleViewDetail = (user) => {
    // Filtramos los pedidos que coincidan con el email del usuario (Consulta Integrada CRM/SCM)
    const userOrders = allOrders.filter(order => 
        order.id_cliente?.toLowerCase() === user.email?.toLowerCase() || 
        order.id_cliente?.toLowerCase() === (user.nombre || user.name)?.toLowerCase()
    );
    setSelectedUser({ ...user, orders: userOrders });
  };

  /**
   * Generates and downloads a CSV file with client data.
   */
  const downloadCSV = () => {
    if (clients.length === 0) {
      toast.error('No hay datos para descargar');
      return;
    }

    const headers = ['Nombre', 'Email', 'Rol', 'Total Compras'];
    const rows = clients.map(c => [
      c.name || c.nombre || 'N/A',
      c.email || 'N/A',
      c.role || 'user',
      c.total_compras || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dvl_clients_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Reporte CRM descargado');
  };

  if (loading && clients.length === 0) {
    return (
      <div className="bg-canvas-bg min-h-screen flex items-center justify-center -mx-4 pt-10">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-dark-card border-t-neon-lime rounded-full animate-spin" />
            <p className="font-black uppercase tracking-[4px] text-[10px] text-dark-card">Sincronizando CRM...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas-bg min-h-screen p-8 font-display -mx-4 pt-10 relative">
      <div className="bg-dark-card text-white rounded-3xl p-10 shadow-2xl animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/5 pb-8 relative z-10 gap-6">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter">Gestión de Clientes</h2>
            <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-2">Customer Relationship Management (CRM)</p>
          </div>
          <button 
            onClick={downloadCSV}
            className="bg-neon-lime text-dark-card font-black px-8 py-4 rounded-full text-[10px] uppercase tracking-[2px] hover:scale-105 transition-all shadow-[0_0_30px_rgba(219,255,0,0.2)] flex items-center gap-3"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v4M7 10l5 5 5-5M12 15V3"/></svg>
            Descargar Reporte
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-text-muted text-[10px] font-black uppercase tracking-[3px]">
                <th className="pb-6 pl-4">Inicial</th>
                <th className="pb-6">Nombre del Cliente</th>
                <th className="pb-6">Email / Contacto</th>
                <th className="pb-6">Total Invertido</th>
                <th className="pb-6 pr-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {clients.length > 0 ? (
                clients.map((client, index) => (
                  <tr 
                    key={index} 
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-6 pl-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-neon-lime text-xs">
                        {(client.name || client.nombre || '?').charAt(0).toUpperCase()}
                      </div>
                    </td>
                    <td className="py-6 font-bold text-white uppercase tracking-tight text-lg">{client.name || client.nombre}</td>
                    <td className="py-6 text-zinc-400 text-sm font-medium">{client.email}</td>
                    <td className="py-6 font-black text-neon-lime">${client.total_compras || 0}</td>
                    <td className="py-6 pr-4 text-right">
                       <button 
                         onClick={() => handleViewDetail(client)}
                         className="text-[10px] font-black uppercase text-neon-lime hover:underline tracking-widest transition-all"
                       >
                          Ver Historial →
                       </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">
                    No se han encontrado clientes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL PREMIUM DE DETALLE DE CLIENTE (TEMA 03 - CONSULTA INTEGRADA) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center z-[500] p-6 animate-fade-in">
          <div className="bg-dark-card border border-white/10 w-full max-w-3xl rounded-[40px] p-10 relative animate-slide-up shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 blur-3xl -mr-32 -mt-32" />
            
            <button 
                onClick={() => setSelectedUser(null)} 
                className="absolute top-6 right-6 bg-white/5 hover:bg-red-500 hover:text-white text-white/40 p-3 rounded-full transition-all border border-white/10 z-10"
            >
                ✕
            </button>

            <header className="mb-10 border-b border-white/5 pb-6 relative z-10">
                <h2 className="text-5xl font-black uppercase tracking-tighter text-white">{selectedUser.nombre || selectedUser.name}</h2>
                <p className="font-bold text-xs uppercase tracking-[4px] text-zinc-500 mt-2">{selectedUser.email}</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10 relative z-10">
                <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl group hover:border-neon-lime/30 transition-colors">
                    <p className="text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-widest">Inversión Total</p>
                    <p className="text-4xl font-black text-neon-lime tracking-tighter">${selectedUser.total_compras || 0}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl group hover:border-white/20 transition-colors">
                    <p className="text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-widest">Pedidos SCM</p>
                    <p className="text-4xl font-black text-white tracking-tighter">{selectedUser.orders?.length || 0}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/5 p-8 rounded-3xl group hover:border-white/20 transition-colors">
                    <p className="text-[10px] font-black text-zinc-500 uppercase mb-2 tracking-widest">Lealtad</p>
                    <p className="text-4xl font-black text-white tracking-tighter">{selectedUser.puntos_lealtad || 0} <span className="text-xs opacity-30">PTS</span></p>
                </div>
            </div>

            <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase mb-6 tracking-[4px] text-white/30 flex items-center gap-4">
                   <span>Historial de Despacho (SCM)</span>
                   <div className="h-px bg-white/5 flex-grow" />
                </h3>
                
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-4 custom-scrollbar">
                    {selectedUser.orders && selectedUser.orders.length > 0 ? (
                        selectedUser.orders.map((ord, idx) => (
                            <div key={idx} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex justify-between items-center group hover:bg-white/[0.04] transition-all">
                                <div>
                                    <p className="font-black text-white uppercase text-sm tracking-tight">{ord.id_pedido}</p>
                                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">
                                        {typeof ord.items_json === 'string' ? ord.items_json : 'Consultar en Logística'}
                                    </p>
                                </div>
                                <div className="text-right flex flex-col items-end gap-2">
                                    <p className="font-black text-white text-lg tracking-tighter">${ord.total}</p>
                                    <span className="text-[8px] font-black uppercase px-3 py-1 rounded-full bg-neon-lime/10 text-neon-lime border border-neon-lime/20">
                                        {ord.estado}
                                    </span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="py-16 text-center border border-dashed border-white/10 rounded-[32px] bg-white/[0.01]">
                            <p className="text-zinc-600 text-[10px] font-black uppercase tracking-[5px]">Sin actividad logística registrada</p>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientManager;
