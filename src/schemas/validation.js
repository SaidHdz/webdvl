import { z } from 'zod';

/**
 * Centralized validation schemas for Frontend and Backend consistency.
 */

export const loginSchema = z.object({
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
});

export const registerSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Correo electrónico no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

export const checkoutSchema = z.object({
  nombreCompleto: z.string().min(5, 'Ingresa tu nombre completo'),
  telefono: z.string().regex(/^\d{10}$/, 'El teléfono debe tener 10 dígitos'),
  metodoEnvio: z.enum(['local', 'nacional'], {
    errorMap: () => ({ message: 'Selecciona un método de envío válido' })
  }),
  // Campos opcionales iniciales
  puntoEntrega: z.string().optional(),
  calle: z.string().optional(),
  colonia: z.string().optional(),
  ciudad: z.string().optional(),
  cp: z.string().optional(),
  notas: z.string().max(300, 'Máximo 300 caracteres').optional(),
}).refine((data) => {
    if (data.metodoEnvio === 'nacional') {
        return !!data.calle && !!data.colonia && !!data.ciudad && !!data.cp;
    }
    return true;
}, {
    message: "Todos los campos de dirección son obligatorios para envíos nacionales",
    path: ["direccion"]
});
