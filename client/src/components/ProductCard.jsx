
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product }) => {
    const { addToCart, cartItems } = useCart();
    const { addToWishlist, removeFromWishlist, wishlistItems } = useWishlist();
    const { success, error } = useToast();
    const [wishlistLoading, setWishlistLoading] = useState(false);

    // Check if product is in wishlist by looking at the wishlistItems array
    const isInWishlist = wishlistItems.some(item => item.product._id === product._id);

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        setWishlistLoading(true);
        try {
            if (isInWishlist) {
                await removeFromWishlist(product._id);
                success('Removed from wishlist');
            } else {
                await addToWishlist(product._id);
                success('Added to wishlist');
            }
        } catch (error) {
            // Error is already handled by the context
        } finally {
            setWishlistLoading(false);
        }
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Check if product is in stock
        if (product.countInStock <= 0) {
            error(`${product.name} is out of stock`);
            return;
        }

        // Check if adding this would exceed stock
        const existingItem = cartItems.find(item => item._id === product._id);
        const currentQty = existingItem ? existingItem.qty : 0;
        
        if (currentQty >= product.countInStock) {
            error(`Only ${product.countInStock} ${product.name} available in stock`);
            return;
        }

        addToCart(product, 1);
        success(`${product.name} added to cart!`);
    };

    const isInCart = cartItems.some(item => item._id === product._id);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
            <Link to={`/product/${product._id}`}>
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover object-center"
                />
            </Link>
            <div className="p-4">
                <Link to={`/product/${product._id}`}>
                    <h2 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 truncate">{product.name}</h2>
                </Link>
                <div className="flex items-center mt-2 mb-2">
                    <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < product.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <span className="text-gray-500 text-sm ml-2">({product.numReviews} reviews)</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <div>
                        <span className="text-xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                        <div className="text-xs text-gray-500 mt-1">
                            {product.countInStock > 0 ? 
                                `${product.countInStock} in stock` : 
                                'Out of stock'
                            }
                        </div>
                    </div>
                    <div className="flex space-x-2">
                        {/* Wishlist Button */}
                        <button 
                            onClick={handleWishlistToggle}
                            disabled={wishlistLoading}
                            className={`p-2 rounded-lg transition-colors ${
                                isInWishlist
                                    ? 'bg-red-500 text-white hover:bg-red-600'
                                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                            } ${wishlistLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {wishlistLoading ? (
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                            ) : (
                                <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
                            )}
                        </button>
                        
                        {/* Cart Button */}
                        {!isInCart && (
                            <button 
                                onClick={handleAddToCart}
                                disabled={product.countInStock <= 0}
                                className={`p-2 rounded-lg transition-colors ${
                                    product.countInStock > 0 
                                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                }`}
                            >
                                <ShoppingCart className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
