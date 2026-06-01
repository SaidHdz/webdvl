import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem('dvl_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    useEffect(() => {
        localStorage.setItem('dvl_cart', JSON.stringify(cart));
    }, [cart]);

    /**
     * Sends a CRM event to the backend.
     * @param {string} evento - Event type (e.g., 'compra', 'add_to_cart').
     * @param {Object} cartData - Data related to the cart or item.
     * @param {Object|null} userData - User information.
     */
    const sendWebhook = async (evento, cartData, userData = null) => {
        const payload = {
            email: userData?.email || "invitado@dvl.com",
            nombre: userData?.name || "Invitado",
            evento: evento,
            monto: parseFloat(evento === 'compra' ? cartData.total : cartData.itemPrice),
            // Si es compra, enviamos los productos estructurados (id_producto + cantidad)
            // Si es add_to_cart, mantenemos el string simple para CRM
            productos: evento === 'compra' 
                ? cartData.productos 
                : [`${cartData.itemName} (${cartData.itemSize})`],
            // Incluimos datos de envío si existen
            shipping: cartData.shipping || null
        };

        try {
            await apiService.sendCrmEvent(payload);
        } catch (error) {
            // Silently fail for CRM events to not interrupt UX
        }
    };

    const addToCart = (product, size, color, image, userData = null) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => 
                item.id === product.id && item.size === size && item.color === color
            );

            let newCart;
            if (existingItem) {
                newCart = prevCart.map(item => 
                    (item.id === product.id && item.size === size && item.color === color)
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
                );
            } else {
                newCart = [...prevCart, {
                    id: product.id,
                    id_producto: product.id_producto, // Nuevo campo SKU para SCM
                    name: product.name,
                    price: product.price,
                    size,
                    color,
                    image,
                    quantity: 1
                }];
            }

            // Se elimina el envío de webhook automático al añadir al carrito para optimizar flujos
            return newCart;
        });
    };

    const removeFromCart = (index) => {
        setCart(prevCart => prevCart.filter((_, i) => i !== index));
    };

    const updateQuantity = (index, delta) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            newCart[index].quantity += delta;
            if (newCart[index].quantity <= 0) {
                newCart.splice(index, 1);
            }
            return newCart;
        });
    };

    const clearCart = () => {
        setCart([]);
    };

    const cartTotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            removeFromCart, 
            updateQuantity, 
            clearCart, 
            cartTotal, 
            cartCount,
            sendWebhook 
        }}>
            {children}
        </CartContext.Provider>
    );
};
