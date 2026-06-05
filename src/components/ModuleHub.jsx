import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Post-login launcher. Shows the CRM / SCM / ERP modules the current role is
 * allowed to open. Modules without permission are rendered as locked, so the
 * user understands the platform scope without being able to enter them.
 */
const MODULES = [
    {
        key: 'crm',
        path: '/crm',
        title: 'CRM',
        subtitle: 'Gestión de Relaciones con Clientes',
        description: 'Clientes, historial de compra y analitica de ventas.',
    },
    {
        key: 'scm',
        path: '/scm',
        title: 'SCM',
        subtitle: 'Gestión de Cadena de Suministro',
        description: 'Inventario, proveedores, mensajes y logistica de envios.',
    },
    {
        key: 'erp',
        path: '/erp',
        title: 'ERP',
        subtitle: 'Planificación de Recursos Empresariales',
        description: 'Personal, roles y permisos, y vista global del sistema.',
    },
];

const ModuleHub = () => {
    const navigate = useNavigate();
    const { user, hasModule, logout } = useAuth();

    return (
        <div className="max-w-6xl mx-auto py-12 px-4 animate-fade-in">
            <header className="mb-14 text-center">
                <p className="text-[10px] font-black uppercase tracking-[6px] text-white/30 mb-4">Bienvenido</p>
                <h1 className="font-syne text-5xl md:text-6xl font-black uppercase tracking-tighter text-white">
                    {user?.name}
                </h1>
                <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-3">
                    {user?.role || 'Cliente'} — Selecciona un módulo
                </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {MODULES.map((mod) => {
                    const allowed = hasModule(mod.key);
                    return (
                        <button
                            key={mod.key}
                            onClick={() => allowed && navigate(mod.path)}
                            disabled={!allowed}
                            className={`group relative text-left p-10 rounded-[40px] border transition-all duration-500 overflow-hidden ${
                                allowed
                                    ? 'bg-dark-card border-white/10 hover:border-white/40 hover:scale-[1.02] cursor-pointer'
                                    : 'bg-dark-card/40 border-white/5 opacity-40 cursor-not-allowed'
                            }`}
                        >
                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/10 transition-all" />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-8">
                                    <h2 className="font-syne text-5xl font-black tracking-tighter text-white">
                                        {mod.title}
                                    </h2>
                                    {allowed ? (
                                        <span className="text-white text-2xl group-hover:translate-x-1 transition-transform">→</span>
                                    ) : (
                                        <span className="text-white/30 text-lg" title="Sin acceso">🔒</span>
                                    )}
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[3px] text-white mb-3">
                                    {mod.subtitle}
                                </p>
                                <p className="text-sm text-text-muted font-medium leading-relaxed">
                                    {mod.description}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-14 flex flex-wrap justify-center gap-4">
                <button
                    onClick={() => navigate('/')}
                    className="text-[10px] font-black uppercase tracking-[3px] text-white/40 hover:text-white border border-white/10 hover:border-white/30 px-6 py-3 rounded-full transition-all"
                >
                    Ir a la Tienda
                </button>
                <button
                    onClick={logout}
                    className="text-[10px] font-black uppercase tracking-[3px] text-red-500/60 hover:text-red-500 border border-red-500/20 hover:border-red-500 px-6 py-3 rounded-full transition-all"
                >
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default ModuleHub;
