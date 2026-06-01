import { z } from 'zod';

/**
 * Validations schemas for the application.
 * Separation of concerns: Validations are decoupled from components.
 */

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    email: z.string().email('Email inválido'),
    password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
});

export const checkoutSchema = z.object({
    shippingMethod: z.enum(['Local', 'Nacional']),
    puntoEntrega: z.string().optional(),
    address: z.string().optional(),
}).refine((data) => {
    if (data.shippingMethod === 'Nacional' && (!data.address || data.address.length < 10)) {
        return false;
    }
    return true;
}, {
    message: "La dirección es obligatoria para envíos nacionales",
    path: ["address"],
});
