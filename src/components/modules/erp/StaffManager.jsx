import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import Modal from '../../ui/Modal';
import { apiService } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

const EMPTY_FORM = {
    name: '', email: '', password: '', role_id: '',
    puesto: '', departamento: '', status: 'Activo',
};

/**
 * ERP staff management: create, edit and delete internal accounts and assign a
 * role to each. Search filters by name/email. The current user cannot delete
 * their own account (enforced again on the server).
 */
const StaffManager = () => {
    const { user: currentUser } = useAuth();
    const [staff, setStaff] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [saving, setSaving] = useState(false);

    const load = (searchTerm = '') => {
        setLoading(true);
        Promise.all([
            apiService.users.list({ type: 'staff', search: searchTerm }),
            apiService.roles.list(),
        ])
            .then(([usersRes, rolesRes]) => {
                setStaff(usersRes.data);
                setRoles(rolesRes.data);
            })
            .catch((err) => toast.error(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, []);

    // Debounce the search so we do not hit the API on every keystroke.
    useEffect(() => {
        const handle = setTimeout(() => load(search), 300);
        return () => clearTimeout(handle);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...EMPTY_FORM, role_id: roles[0]?.id || '' });
        setModalOpen(true);
    };

    const openEdit = (member) => {
        setEditing(member);
        setForm({
            name: member.name, email: member.email, password: '',
            role_id: member.role_id || '', puesto: member.puesto || '',
            departamento: member.departamento || '', status: member.status,
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.role_id) {
            toast.error('Selecciona un rol');
            return;
        }
        setSaving(true);
        try {
            const payload = { ...form, role_id: Number(form.role_id) };
            // Do not send an empty password on edit (keeps the current one).
            if (editing && !payload.password) delete payload.password;

            if (editing) {
                await apiService.users.update(editing.id, payload);
                toast.success('Personal actualizado');
            } else {
                await apiService.users.create(payload);
                toast.success('Personal registrado');
            }
            setModalOpen(false);
            load(search);
        } catch (err) {
            toast.error(err.message);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (member) => {
        if (!window.confirm(`Eliminar a "${member.name}" del personal?`)) return;
        try {
            await apiService.users.remove(member.id);
            toast.success('Personal eliminado');
            load(search);
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="bg-dark-card text-white rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-lime/5 rounded-full blur-3xl -mr-32 -mt-32" />

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-white/5 pb-8 relative z-10 gap-4">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Gestion de Personal</h2>
                    <p className="text-text-muted text-xs font-bold uppercase tracking-[3px] mt-1">Recursos Humanos (RH)</p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-neon-lime text-dark-card font-black px-8 py-4 rounded-full text-[10px] uppercase tracking-[2px] hover:scale-105 transition-all shadow-[0_0_30px_rgba(219,255,0,0.2)]"
                >
                    + Registrar Empleado
                </button>
            </div>

            <div className="mb-8 relative z-10">
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por nombre o correo..."
                    className="bg-white/5 border border-white/10 text-sm rounded-full px-6 py-3.5 w-full md:w-96 focus:outline-none focus:border-neon-lime transition-all placeholder:text-text-muted/50"
                />
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
                                <th className="pb-6 pl-4">Colaborador</th>
                                <th className="pb-6">Rol</th>
                                <th className="pb-6">Puesto</th>
                                <th className="pb-6">Departamento</th>
                                <th className="pb-6 text-center">Estado</th>
                                <th className="pb-6 pr-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {staff.length > 0 ? staff.map((member) => (
                                <tr key={member.id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="py-6 pl-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-black text-neon-lime text-xs">
                                                {member.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white uppercase tracking-tight text-sm">{member.name}</p>
                                                <p className="text-[10px] text-text-muted">{member.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold text-zinc-300 uppercase tracking-widest">{member.role_name || 'Sin rol'}</span>
                                    </td>
                                    <td className="py-6 text-zinc-400 text-sm">{member.puesto || '—'}</td>
                                    <td className="py-6 text-zinc-400 text-sm">{member.departamento || '—'}</td>
                                    <td className="py-6 text-center">
                                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${member.status === 'Activo' ? 'bg-neon-lime/10 text-neon-lime border border-neon-lime/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                            {member.status}
                                        </span>
                                    </td>
                                    <td className="py-6 pr-4 text-right">
                                        <div className="flex gap-3 justify-end">
                                            <button onClick={() => openEdit(member)} className="text-[10px] font-black uppercase text-accent hover:underline tracking-widest">Editar</button>
                                            {member.id !== currentUser.id && (
                                                <button onClick={() => handleDelete(member)} className="text-[10px] font-black uppercase text-red-500/70 hover:text-red-500 tracking-widest">Borrar</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-20 text-center text-text-muted uppercase font-black tracking-[4px] text-[10px] opacity-20">
                                        Sin personal registrado
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editing ? 'Editar Personal' : 'Registrar Personal'}
                subtitle="ERP — Recursos Humanos"
                footer={
                    <>
                        <button onClick={() => setModalOpen(false)} className="px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white/50 hover:text-white border border-white/10 transition-all">Cancelar</button>
                        <button form="staff-form" type="submit" disabled={saving} className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-neon-lime text-dark-card hover:scale-105 transition-all disabled:opacity-50">
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </>
                }
            >
                <form id="staff-form" onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <Field label="Nombre Completo">
                            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="NOMBRE APELLIDO" />
                        </Field>
                        <Field label="Correo">
                            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputClass} placeholder="correo@dvl.com" />
                        </Field>
                        <Field label={editing ? 'Nueva Contrasena (opcional)' : 'Contrasena'}>
                            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputClass} placeholder="••••••••" />
                        </Field>
                        <Field label="Rol">
                            <select value={form.role_id} onChange={(e) => setForm({ ...form, role_id: e.target.value })} className={`${inputClass} cursor-pointer`}>
                                <option value="" className="bg-zinc-900">Selecciona un rol</option>
                                {roles.map((r) => (
                                    <option key={r.id} value={r.id} className="bg-zinc-900">{r.name}</option>
                                ))}
                            </select>
                        </Field>
                        <Field label="Puesto">
                            <input value={form.puesto} onChange={(e) => setForm({ ...form, puesto: e.target.value })} className={inputClass} placeholder="EJ. COORDINADOR" />
                        </Field>
                        <Field label="Departamento">
                            <input value={form.departamento} onChange={(e) => setForm({ ...form, departamento: e.target.value })} className={inputClass} placeholder="EJ. OPERACIONES" />
                        </Field>
                    </div>
                    <Field label="Estado">
                        <div className="grid grid-cols-2 gap-3">
                            {['Activo', 'Inactivo'].map((s) => (
                                <button type="button" key={s} onClick={() => setForm({ ...form, status: s })} className={`py-3 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${form.status === s ? 'bg-white text-black border-white' : 'bg-white/5 text-white/40 border-white/5 hover:border-white/20'}`}>{s}</button>
                            ))}
                        </div>
                    </Field>
                </form>
            </Modal>
        </div>
    );
};

const inputClass = 'w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-white focus:border-neon-lime outline-none transition-all text-sm';

/** Small labeled field wrapper for the staff form. */
const Field = ({ label, children }) => (
    <div className="space-y-2">
        <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-2">{label}</label>
        {children}
    </div>
);

export default StaffManager;
