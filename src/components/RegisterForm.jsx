import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { registerSchema } from '../schemas/validationSchemas';
import { useAuth } from '../context/AuthContext';

const RegisterForm = ({ onToggleMode, onSuccess }) => {
  const { register: authRegister } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    const result = await authRegister(data);
    setIsLoading(false);

    if (result.success) {
      toast.success('¡Registro exitoso! Bienvenido a DVL.');
      // New accounts are always customers; send them to the storefront.
      onSuccess('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="bg-black/40 backdrop-blur-3xl border border-white/5 p-12 rounded-[40px] w-full max-w-[450px] shadow-2xl animate-fade-in relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      
      <h2 className="font-syne text-4xl font-black uppercase tracking-tighter text-white mb-2 text-center">Únete</h2>
      <p className="text-[10px] uppercase font-bold text-white/40 tracking-[4px] mb-10 text-center">Membresía DVL Supply</p>
      
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="space-y-2">
          <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">Nombre Completo</label>
          <input 
            {...register('name')}
            type="text" 
            className={`w-full bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-white focus:border-white/40 outline-none transition-all font-medium placeholder:text-white/10`}
            placeholder="NOMBRE APELLIDO"
          />
          {errors.name && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest ml-4">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">Email de Contacto</label>
          <input 
            {...register('email')}
            type="email" 
            className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-white focus:border-white/40 outline-none transition-all font-medium placeholder:text-white/10`}
            placeholder="EMAIL@DVL.COM"
          />
          {errors.email && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest ml-4">{errors.email.message}</p>}
        </div>
        
        <div className="space-y-2">
          <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">Establecer Clave</label>
          <input 
            {...register('password')}
            type="password" 
            className={`w-full bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-white focus:border-white/40 outline-none transition-all font-medium placeholder:text-white/10`}
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest ml-4">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="text-[9px] uppercase font-black text-white/30 tracking-[3px] ml-4">Confirmar Clave</label>
          <input 
            {...register('confirmPassword')}
            type="password" 
            className={`w-full bg-white/5 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'} rounded-2xl px-6 py-4 text-white focus:border-white/40 outline-none transition-all font-medium placeholder:text-white/10`}
            placeholder="••••••••"
          />
          {errors.confirmPassword && <p className="text-red-500 text-[9px] font-bold uppercase tracking-widest ml-4">{errors.confirmPassword.message}</p>}
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className={`group relative w-full overflow-hidden rounded-2xl bg-white py-5 font-black text-xs tracking-[4px] transition-all duration-500 mt-4 ${isLoading ? 'opacity-50' : 'hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]'}`}
        >
          <span className="relative z-10 text-black uppercase">{isLoading ? 'Procesando...' : 'Registrarse'}</span>
        </button>
      </form>

      <div className="mt-10 text-center space-y-4">
        <div className="h-px bg-white/5 w-1/2 mx-auto" />
        <button 
          onClick={onToggleMode}
          className="text-white/40 text-[9px] font-black uppercase tracking-[3px] hover:text-white transition-colors"
        >
          Ya soy Miembro — Iniciar Sesión
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;
