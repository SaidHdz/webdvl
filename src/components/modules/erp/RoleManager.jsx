import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../ui/Modal';
import { supabase } from '../../../lib/supabase';

const MODULES = [
    { key: 'crm', label: 'CRM' },
    { key: 'scm', label: 'SCM' },
    { key: 'erp', label: 'ERP' },
];

const EMPTY_FORM = { name: '', description: '', permissions: [] };

/**
 * ERP roles management powered by Supabase.
 */
const RoleManager = () => {
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = async () => {
        setLoading(true);
        try {
            // Fetch roles with count of associated users
            const { data, error } = await supabase
                .from('roles')
                .select('*, users(count)')
                .order('name');
            
            if (error) throw error;

            const formatted = data.map(r => ({
                ...r,
                user_count: r.users?.[0]?.count || 0
            }));

            setRoles(formatted);
        } catch (err) {
            toast.error('Error al cargar roles: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(EMPTY_FORM);
        setModalOpen(true);
    };

    const openEdit = (role) => {
        setEditing(role);
        setForm({ name: role.name, description: role.description || '', permissions: [...role.permissions] });
        setModalOpen(true);
    };

    const togglePermission = (key) => {
        setForm((prev) => ({
            ...prev,
            permissions: prev.permissions.includes(key)
                ? prev.permissions.filter((p) => p !== key)
                : [...prev.permissions, key],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.permissions.length === 0) {
            toast.error('Selecciona al menos un modulo');
            return;
        }
        setSaving(true);
        try {
            if (editing) {
                const { error } = await supabase.from('roles').update(form).eq('id', editing.id);
                if (error) throw error;
                toast.success('Rol actualizado');
            } else {
                const { error } = await supabase.from('roles').insert(form);
                if (error) throw error;
                toast.success('Rol creado');
            }
            setModalOpen(false);
            load();
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (role) => {
        if (!window.confirm(`Eliminar el rol "${role.name}"? Esta accion no se puede deshacer.`)) return;
        try {
            const { error } = await supabase.from('roles').delete().eq('id', role.id);
            if (error) throw error;
            toast.success('Rol eliminado');
            load();
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="bg-dark-card text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b border-white/5 pb-8 relative z-10 gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Roles y Permisos</h2>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-1">Control de Acceso por Modulo</p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-neon-lime text-dark-card font-black px-8 py-4 rounded-full text-[10px] uppercase tracking-[2px] hover:scale-105 transition-all shadow-[0_0_30px_rgba(219,255,0,0.2)]"
                >
                    + Crear Rol
                </button>
            </div>

            {loading ? (
                <div className="py-20 flex justify-center">
                    <div className="w-10 h-10 border-4 border-white/5 border-t-neon-lime rounded-full animate-spin" />
                </div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar relative z-10">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 text-text-muted text-[10px] font-black uppercase tracking-[3px]">
                                <th className="pb-6 pl-4">Rol</th>
                                <th className="pb-6">Descripcion</th>
                                <th className="pb-6">Modulos</th>
                                <th className="pb-6 text-center">Usuarios</th>
                                <th className="pb-6 pr-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {roles.map((role) => (
                                <tr key={role.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-6 pl-4">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-white uppercase tracking-tight">{role.name}</span>
                                            {role.is_system && (
                                                <span className="text-[8px] font-black uppercase bg-white/10 text-white/50 px-2 py-0.5 rounded-full">Sistema</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-6 text-zinc-400 text-sm font-medium">{role.description || '—'}</td>
                                    <td className="py-6">
                                        <div className="flex gap-1.5">
                                            {role.permissions.map((p) => (
                                                <span key={p} className="bg-neon-lime/10 text-neon-lime border border-neon-lime/20 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">{p}</span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="py-6 text-center font-black text-white">{role.user_count}</td>
                                    <td className="py-6 pr-4 text-right">
                                        {role.is_system ? (
                                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Protegido</span>
                                        ) : (
                                            <div className="flex gap-3 justify-end">
                                                <button onClick={() => openEdit(role)} className="text-[10px] font-black uppercase text-accent hover:underline tracking-widest">Editar</button>
                                                <button onClick={() => handleDelete(role)} className="text-[10px] font-black uppercase text-red-500/70 hover:text-red-500 tracking-widest">Borrar</button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Editar Rol' : 'Crear Rol'}
                subtitle="ERP — Roles"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/10 transition-all">Cancelar</button>
                        <button form="role-form" type="submit" disabled={saving} className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-neon-lime text-dark-card hover:scale-105 transition-all disabled:opacity-50">
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </>
                }
            >
                <form id="role-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Nombre del Rol</label>
                        <input
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-neon-lime outline-none transition-all"
                            placeholder="EJ. SUPERVISOR DE ALMACEN"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Descripcion</label>
                        <input
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:border-neon-lime outline-none transition-all"
                            placeholder="Breve descripcion del rol"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">Modulos con Acceso</label>
                        <div className="grid grid-cols-3 gap-3">
                            {MODULES.map((mod) => {
                                const active = form.permissions.includes(mod.key);
                                return (
                                    <button
                                        type="button"
                                        key={mod.key}
                                        onClick={() => togglePermission(mod.key)}
                                        className={`py-4 rounded-2xl border-2 font-black text-sm uppercase tracking-widest transition-all ${active ? 'bg-neon-lime text-dark-card border-neon-lime' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}
                                    >
                                        {mod.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default RoleManager;
