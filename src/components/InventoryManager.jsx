import React from 'react';

/**
 * SCM Inventory Manager view.
 * Displays the clothing stock, SKUs, and categories.
 * Implements the PULL STRATEGY alerts.
 */
export const InventoryManager = ({ inventory = [], loading }) => {
  if (loading && inventory.length === 0) {
    return (
      <div className="bg-canvas-bg min-h-screen flex items-center justify-center -mx-4 pt-10">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-dark-card border-t-neon-lime rounded-full animate-spin" />
            <p className="font-black uppercase tracking-[4px] text-[10px] text-dark-card">Consultando Existencias...</p>
         </div>
      </div>
    );
  }

  const pullAlerts = inventory.filter(i => Number(i.stock_actual) <= Number(i.stock_minimo));

  return (
    <div className="bg-canvas-bg min-h-screen p-8 font-display -mx-4 pt-10">
      <div className="bg-dark-card text-white rounded-3xl p-10 shadow-2xl animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-lime/20 to-transparent" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 border-b border-white/5 pb-8 relative z-10 gap-6">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tighter">Control de Inventario</h2>
            <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-2">SCM - Stock de Prendas</p>
          </div>
          <div className="flex gap-4">
             <div className="bg-neon-lime/10 border border-neon-lime/20 px-6 py-4 rounded-3xl text-right">
                <p className="text-[10px] font-black text-neon-lime uppercase tracking-widest">Alertas Pull</p>
                <p className="text-lg font-black text-white">
                   {pullAlerts.length} Críticas
                </p>
             </div>
             <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl text-right">
                <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Total Piezas</p>
                <p className="text-lg font-black text-white">
                   {inventory.reduce((acc, item) => acc + Number(item.stock_actual || 0), 0)}
                </p>
             </div>
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-text-muted text-[10px] font-black uppercase tracking-[3px]">
                <th className="pb-6 pl-4">SKU / ID</th>
                <th className="pb-6">Nombre de la Prenda</th>
                <th className="pb-6">Categoría</th>
                <th className="pb-6 text-center">Stock Actual</th>
                <th className="pb-6 pr-4 text-right">Estrategia SCM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {inventory.length > 0 ? (
                inventory.map((item, index) => {
                  const stock = Number(item.stock_actual || 0);
                  const min = Number(item.stock_minimo || 5);
                  const isLow = stock <= min;

                  return (
                    <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-6 pl-4 font-mono text-xs text-white/40">{item.id_producto}</td>
                      <td className="py-6 font-bold text-white uppercase tracking-tight text-lg">{item.nombre}</td>
                      <td className="py-6">
                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                           {item.categoria}
                        </span>
                      </td>
                      <td className="py-6 text-center">
                        <span className={`text-xl font-black ${isLow ? 'text-red-500' : 'text-white'}`}>
                          {stock}
                        </span>
                      </td>
                      <td className="py-6 pr-4 text-right">
                        {isLow ? (
                          <div className="flex flex-col items-end gap-1">
                             <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-red-500 text-white animate-pulse">
                                Reordenar (Pull)
                             </span>
                             <span className="text-[8px] text-red-500/60 font-bold uppercase">Debajo del mínimo ({min})</span>
                          </div>
                        ) : (
                          <span className="px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-neon-lime/10 text-neon-lime border border-neon-lime/20">
                            Stock Saludable
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">
                    No hay datos de inventario disponibles. Refresca el panel.
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

export default InventoryManager;
