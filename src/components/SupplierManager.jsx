import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';

/**
 * SCM Supplier Manager view.
 * Displays a catalog of textile and accessory suppliers.
 */
export default function SupplierManager({ externalData, loading }) {
  const suppliers = externalData || [];

  if (loading && suppliers.length === 0) {
    return (
      <div className="bg-canvas-bg min-h-screen flex items-center justify-center -mx-4 pt-10">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-dark-card border-t-neon-lime rounded-full animate-spin" />
            <p className="font-black uppercase tracking-[4px] text-[10px] text-dark-card">Cargando Proveedores...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas-bg min-h-screen p-8 font-display -mx-4 pt-10">
      <div className="bg-dark-card text-white rounded-3xl p-10 shadow-2xl animate-slide-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="mb-12 border-b border-white/5 pb-8 relative z-10">
          <h2 className="text-4xl font-black uppercase tracking-tighter">Red de Proveedores</h2>
          <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-2">Supply Chain Management (SCM)</p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-white/5 border-t-neon-lime rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[4px] text-white/20">Consultando Base de Datos...</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-text-muted text-[10px] font-black uppercase tracking-[3px]">
                  <th className="pb-6 pl-4">ID Proveedor</th>
                  <th className="pb-6">Taller / Manufactura</th>
                  <th className="pb-6">Contacto Directo</th>
                  <th className="pb-6 pr-4">Categoría Insumo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {suppliers.length > 0 ? (
                  suppliers.map((prov, index) => (
                    <tr key={index} className="group hover:bg-white/[0.02] transition-colors">
                      <td className="py-6 pl-4 text-white/20 font-black text-xs">#{prov.id_proveedor}</td>
                      <td className="py-6 font-bold text-white uppercase tracking-tight text-lg">{prov.nombre_taller}</td>
                      <td className="py-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-300">{prov.contacto}</span>
                          <span className="text-[10px] text-text-muted font-bold tracking-widest">{prov.correo}</span>
                        </div>
                      </td>
                      <td className="py-6 pr-4">
                        <span className="bg-neon-lime/10 text-neon-lime border border-neon-lime/20 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest">
                          {prov.insumo}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">
                      No se encontraron proveedores registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
