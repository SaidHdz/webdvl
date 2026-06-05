import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    // Load initial cart from localStorage
    const [cart, setCart] = useState(() => {
        const saved = localStorage.getItem('dvl_cart');
        return saved ? JSON.parse(saved) : [];
    });

    // Sync cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('dvl_cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product) => {
        setCart(prev => {
            // Robust identification: Compare stringified IDs and variant properties
            const existing = prev.findIndex(item => 
                String(item.id) === String(product.id) && 
                item.size === product.size && 
                item.color === product.color
            );

            if (existing !== -1) {
                const newCart = [...prev];
                // Increase quantity, ensuring we don't accidentally overwrite with undefined
                newCart[existing] = {
                    ...newCart[existing],
                    quantity: (newCart[existing].quantity || 1) + 1
                };
                return newCart;
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    };

    const updateQuantity = (index, delta) => {
        setCart(prev => {
            const newCart = [...prev];
            const item = newCart[index];
            if (!item) return prev;

            const newQty = item.quantity + delta;
            if (newQty <= 0) {
                newCart.splice(index, 1);
            } else {
                newCart[index] = { ...item, quantity: newQty };
            }
            return newCart;
        });
    };

    const removeFromCart = (index) => {
        setCart(prev => prev.filter((_, i) => i !== index));
    };

    const updateCartItem = (index, updatedItem) => {
        setCart(prev => {
            const newCart = [...prev];
            newCart[index] = updatedItem;
            return newCart;
        });
    };

    const clearCart = () => setCart([]);

    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{ 
            cart, 
            addToCart, 
            updateQuantity, 
            removeFromCart, 
            updateCartItem,
            clearCart, 
            cartCount, 
            cartTotal 
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) throw new Error('useCart must be used within CartProvider');
    return context;
};
