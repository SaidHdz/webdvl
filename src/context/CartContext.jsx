import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

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
     * Adds a product to the cart, enforcing the available stock so the customer
     * cannot add more units than exist. stock comes from the catalog API.
     */
    const addToCart = (product, size, color, image) => {
        const stock = Number(product.stock_actual ?? 0);
        if (stock <= 0) {
            toast.error('Producto agotado');
            return;
        }

        setCart(prevCart => {
            const existingItem = prevCart.find(item =>
                item.id === product.id && item.size === size && item.color === color
            );

            if (existingItem) {
                if (existingItem.quantity >= stock) {
                    toast.error(`Solo hay ${stock} disponibles de ${product.name}`);
                    return prevCart;
                }
                return prevCart.map(item =>
                    (item.id === product.id && item.size === size && item.color === color)
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }

            return [...prevCart, {
                id: product.id,
                id_producto: product.id_producto,
                name: product.name,
                price: product.price,
                size,
                color,
                image,
                quantity: 1,
                stock,
            }];
        });
    };

    const removeFromCart = (index) => {
        setCart(prevCart => prevCart.filter((_, i) => i !== index));
    };

    /**
     * Adjusts a line quantity, capped at the item stock. Dropping to zero or
     * below removes the line.
     */
    const updateQuantity = (index, delta) => {
        setCart(prevCart => {
            const newCart = [...prevCart];
            const item = newCart[index];
            const nextQty = item.quantity + delta;

            if (nextQty <= 0) {
                newCart.splice(index, 1);
                return newCart;
            }
            if (item.stock && nextQty > item.stock) {
                toast.error(`Solo hay ${item.stock} disponibles de ${item.name}`);
                return prevCart;
            }
            newCart[index] = { ...item, quantity: nextQty };
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
        }}>
            {children}
        </CartContext.Provider>
    );
};
