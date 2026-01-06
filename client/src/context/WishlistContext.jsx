import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import axios from '../utils/api';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const { userInfo, isAuthenticated } = useAuth();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Fetch wishlist when user logs in
    useEffect(() => {
        if (isAuthenticated && userInfo) {
            fetchWishlist();
        } else {
            setWishlistItems([]);
        }
    }, [isAuthenticated, userInfo]);

    const fetchWishlist = async () => {
        try {
            setLoading(true);
            setError('');
            const { data } = await axios.get('/wishlist');
            setWishlistItems(data.products || []);
        } catch (error) {
            console.error('Error fetching wishlist:', error);
            setError('Failed to fetch wishlist');
            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (productId) => {
        if (!isAuthenticated) {
            throw new Error('Please login to add items to wishlist');
        }

        try {
            setError('');
            const { data } = await axios.post('/wishlist', { productId });
            setWishlistItems(data.products || []);
            return true;
        } catch (error) {
            console.error('Error adding to wishlist:', error);
            const errorMessage = error.response?.data?.message || 'Failed to add to wishlist';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!isAuthenticated) {
            throw new Error('Please login to manage wishlist');
        }

        try {
            setError('');
            const { data } = await axios.delete(`/wishlist/${productId}`);
            setWishlistItems(data.products || []);
            return true;
        } catch (error) {
            console.error('Error removing from wishlist:', error);
            const errorMessage = error.response?.data?.message || 'Failed to remove from wishlist';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const moveToCart = async (productId) => {
        if (!isAuthenticated) {
            throw new Error('Please login to move items to cart');
        }

        try {
            setError('');
            await axios.post(`/wishlist/move-to-cart/${productId}`);
            // Remove from local wishlist items
            setWishlistItems(prev => prev.filter(item => item.product._id !== productId));
            return true;
        } catch (error) {
            console.error('Error moving to cart:', error);
            const errorMessage = error.response?.data?.message || 'Failed to move to cart';
            setError(errorMessage);
            throw new Error(errorMessage);
        }
    };

    const clearError = () => {
        setError('');
    };

    const value = {
        wishlistItems,
        loading,
        error,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        moveToCart,
        clearError
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
        </WishlistContext.Provider>
    );
};
