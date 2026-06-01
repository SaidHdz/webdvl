import React from 'react';

/**
 * HR Employee Management view.
 * Displays a table of employees with premium neo-brutalist styling.
 */
export const EmployeeManager = ({ employees = [], loading, onCreateEmployee }) => {
  if (loading && employees.length === 0) {
    return (
      <div className="bg-canvas-bg min-h-screen flex items-center justify-center -mx-4 pt-10">
         <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-dark-card border-t-neon-lime rounded-full animate-spin" />
            <p className="font-black uppercase tracking-[4px] text-[10px] text-dark-card">Cargando Personal...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas-bg min-h-screen p-8 font-display -mx-4 pt-10">
      <div className="bg-dark-card text-white rounded-3xl p-8 shadow-2xl font-display animate-slide-up">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Gestión de Personal</h2>
            <p className="text-text-muted text-xs font-bold uppercase tracking-[2px] mt-1">Recursos Humanos (RH)</p>
          </div>
          <button 
            onClick={onCreateEmployee} 
            className="bg-neon-lime text-dark-card font-black px-8 py-4 rounded-full text-[10px] uppercase tracking-[2px] hover:scale-105 transition-all shadow-[0_0_30px_rgba(219,255,0,0.2)]"
          >
            + Registrar Empleado
          </button>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-text-muted text-[10px] font-black uppercase tracking-[3px]">
                <th className="pb-6 pl-4">ID</th>
                <th className="pb-6">Nombre del Colaborador</th>
                <th className="pb-6">Puesto</th>
                <th className="pb-6">Departamento</th>
                <th className="pb-6 pr-4">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {employees.length > 0 ? (
                employees.map((emp) => (
                  <tr key={emp.id_empleado || emp.id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="py-6 pl-4 text-white/20 font-black text-xs">#{emp.id_empleado || '---'}</td>
                    <td className="py-6 font-bold text-white uppercase tracking-tight">{emp.nombre}</td>
                    <td className="py-6 text-zinc-400 text-sm font-medium">{emp.puesto}</td>
                    <td className="py-6">
                      <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                         {emp.departamento}
                      </span>
                    </td>
                    <td className="py-6 pr-4">
                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        emp.estado === 'Activo' 
                          ? 'bg-neon-lime/10 text-neon-lime border border-neon-lime/20' 
                          : 'bg-red-500/10 text-red-500 border border-red-500/20'
                      }`}>
                        {emp.estado}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">
                    No hay colaboradores registrados en el sistema
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

export default EmployeeManager;
