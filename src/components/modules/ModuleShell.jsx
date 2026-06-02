import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Shared chrome for a back-office module (CRM / SCM / ERP): a header with the
 * module identity plus a tab bar for its sections. Keeps every module visually
 * consistent and centralizes navigation back to the hub.
 *
 * @param {string} title - Module short title (e.g. "CRM").
 * @param {string} subtitle - Descriptive subtitle.
 * @param {Array<{label: string, path: string}>} tabs - Section tabs.
 * @param {React.ReactNode} children - The active section content.
 */
const ModuleShell = ({ title, subtitle, tabs, children }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    return (
        <div className="max-w-7xl mx-auto py-8 px-4">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div className="flex items-center gap-5">
                    <button
                        onClick={() => navigate('/hub')}
                        className="w-12 h-12 rounded-full bg-dark-card border border-white/10 text-white/50 hover:text-neon-lime hover:border-neon-lime/40 transition-all flex items-center justify-center"
                        title="Volver al menu"
                    >
                        ←
                    </button>
                    <div>
                        <h1 className="font-syne text-4xl font-black uppercase tracking-tighter text-white leading-none">{title}</h1>
                        <p className="text-text-muted text-[10px] font-bold uppercase tracking-[3px] mt-1">{subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                        <p className="text-[8px] text-white/30 uppercase font-black tracking-widest">Sesion</p>
                        <p className="text-[10px] text-neon-lime font-black uppercase">{user?.name}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="text-[9px] font-black uppercase tracking-[2px] text-red-500/60 hover:text-red-500 border border-red-500/20 hover:border-red-500 px-4 py-2 rounded-full transition-all"
                    >
                        Salir
                    </button>
                </div>
            </header>

            <nav className="flex flex-wrap gap-2 bg-dark-card p-2 rounded-3xl md:rounded-full border border-white/5 mb-8 w-full">
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    return (
                        <button
                            key={tab.path}
                            onClick={() => navigate(tab.path)}
                            className={`px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${
                                isActive
                                    ? 'bg-neon-lime text-dark-card shadow-[0_0_20px_rgba(219,255,0,0.3)]'
                                    : 'text-white/40 hover:text-white hover:bg-white/5'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </nav>

            <div>{children}</div>
        </div>
    );
};

/**
 * Placeholder used for sections that are wired up in a later phase, so the
 * navigation works end-to-end before every panel is implemented.
 * @param {string} phase - Human-readable phase label.
 */
export const SectionPlaceholder = ({ phase }) => (
    <div className="py-24 text-center border border-dashed border-white/10 rounded-[40px] bg-dark-card/40">
        <p className="text-white/20 text-[10px] font-black uppercase tracking-[5px]">
            Seccion en construccion — {phase}
        </p>
    </div>
);

export default ModuleShell;
