
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { userInfo } = useAuth();
    const [cartItems, setCartItems] = useState(() => {
        console.log('CartContext: Initializing cart from localStorage');
        try {
            const stored = localStorage.getItem('cartItems');
            console.log('CartContext: Raw stored data:', stored);
            const parsed = stored ? JSON.parse(stored) : [];
            console.log('CartContext: Parsed cart items:', parsed);
            return parsed;
        } catch (error) {
            console.error('Error parsing cart items:', error);
            return [];
        }
    });

    // Sync cart when user logs in/out
    useEffect(() => {
        console.log('CartContext: userInfo changed:', userInfo);
        console.log('CartContext: current cartItems:', cartItems);
        
        if (userInfo) {
            // User is logged in, ensure cart is preserved
            try {
                const stored = localStorage.getItem('cartItems');
                console.log('CartContext: stored cart from localStorage:', stored);
                
                if (stored) {
                    const cart = JSON.parse(stored);
                    console.log('CartContext: parsed cart:', cart);
                    setCartItems(cart);
                }
            } catch (error) {
                console.error('Error syncing cart after login:', error);
            }
        }
    }, [userInfo]);

    // Custom state setter that also updates localStorage
    const setCartItemsWithStorage = (items) => {
        setCartItems(items);
        try {
            localStorage.setItem('cartItems', JSON.stringify(items));
        } catch (error) {
            console.error('Error saving cart items:', error);
        }
    };

    const addToCart = (product, qty) => {
        setCartItemsWithStorage((prevItems) => {
            const existItem = prevItems.find((x) => x._id === product._id);
            if (existItem) {
                return prevItems.map((x) =>
                    x._id === existItem._id ? { ...product, qty } : x
                );
            } else {
                return [...prevItems, { ...product, qty }];
            }
        });
    };

    const removeFromCart = (id) => {
        setCartItemsWithStorage(prevItems => prevItems.filter((x) => x._id !== id));
    };

    const clearCart = () => {
        setCartItemsWithStorage([]);
    };

    return (
        <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, clearCart }}>
            {children}
        </CartContext.Provider>
    );
};
