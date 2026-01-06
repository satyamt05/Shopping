import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowLeft, Package } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { formatCurrency } from '../utils/currency';

const Wishlist = () => {
    const { wishlistItems, loading, error, removeFromWishlist, moveToCart, fetchWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { success, error: showError } = useToast();
    const [actionLoading, setActionLoading] = useState({});

    useEffect(() => {
        fetchWishlist();
    }, []);

    const handleRemoveFromWishlist = async (productId) => {
        setActionLoading(prev => ({ ...prev, [productId]: true }));
        try {
            await removeFromWishlist(productId);
            success('Item removed from wishlist');
        } catch (error) {
            showError(error.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [productId]: false }));
        }
    };

    const handleAddToCart = async (product) => {
        if (product.countInStock <= 0) {
            showError('Product is out of stock');
            return;
        }

        setActionLoading(prev => ({ ...prev, [product._id]: true }));
        try {
            await addToCart(product, 1);
            success('Item added to cart');
        } catch (error) {
            showError(error.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [product._id]: false }));
        }
    };

    const handleMoveToCart = async (product) => {
        if (product.countInStock <= 0) {
            showError('Product is out of stock');
            return;
        }

        setActionLoading(prev => ({ ...prev, [product._id]: true }));
        try {
            await moveToCart(product._id);
            await addToCart(product, 1);
            success('Item moved to cart');
        } catch (error) {
            showError(error.message);
        } finally {
            setActionLoading(prev => ({ ...prev, [product._id]: false }));
        }
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div key={item} className="bg-white rounded-lg shadow-md p-4">
                                <div className="h-40 bg-gray-300 rounded mb-4"></div>
                                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <Link to="/shop" className="mr-4">
                        <ArrowLeft className="h-5 w-5 text-gray-600 hover:text-gray-900" />
                    </Link>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Wishlist</h1>
                </div>
                <div className="text-sm text-gray-500">
                    {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'}
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                    {error}
                </div>
            )}

            {/* Empty Wishlist */}
            {wishlistItems.length === 0 && !loading && (
                <div className="text-center py-16">
                    <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-600 mb-6">Start adding items you love to your wishlist</p>
                    <Link
                        to="/shop"
                        className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Continue Shopping
                    </Link>
                </div>
            )}

            {/* Wishlist Items */}
            {wishlistItems.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {wishlistItems.map((item) => (
                        <div key={item.product._id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
                            {/* Product Image */}
                            <div className="relative">
                                <Link to={`/product/${item.product._id}`}>
                                    <img
                                        src={item.product.image}
                                        alt={item.product.name}
                                        className="w-full h-48 object-cover rounded-t-lg"
                                    />
                                </Link>
                                
                                {/* Out of Stock Badge */}
                                {item.product.countInStock <= 0 && (
                                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
                                        Out of Stock
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="p-4">
                                <Link to={`/product/${item.product._id}`}>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2 hover:text-indigo-600 line-clamp-2">
                                        {item.product.name}
                                    </h3>
                                </Link>

                                {/* Price */}
                                <div className="text-xl font-bold text-gray-900 mb-4">
                                    {formatCurrency(item.product.price)}
                                </div>

                                {/* Stock Status */}
                                <div className="text-sm text-gray-600 mb-4">
                                    {item.product.countInStock > 0 ? (
                                        <span className="text-green-600">
                                            {item.product.countInStock} in stock
                                        </span>
                                    ) : (
                                        <span className="text-red-600">Out of stock</span>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="space-y-2">
                                    {item.product.countInStock > 0 ? (
                                        <>
                                            <button
                                                onClick={() => handleAddToCart(item.product)}
                                                disabled={actionLoading[item.product._id]}
                                                className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading[item.product._id] ? (
                                                    <span className="flex items-center">
                                                        <Package className="h-4 w-4 mr-2 animate-spin" />
                                                        Adding...
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center">
                                                        <ShoppingCart className="h-4 w-4 mr-2" />
                                                        Add to Cart
                                                    </span>
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleMoveToCart(item.product)}
                                                disabled={actionLoading[item.product._id]}
                                                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {actionLoading[item.product._id] ? (
                                                    <span className="flex items-center">
                                                        <Package className="h-4 w-4 mr-2 animate-spin" />
                                                        Moving...
                                                    </span>
                                                ) : (
                                                    'Move to Cart'
                                                )}
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            disabled
                                            className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed"
                                        >
                                            Out of Stock
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleRemoveFromWishlist(item.product._id)}
                                        disabled={actionLoading[item.product._id]}
                                        className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {actionLoading[item.product._id] ? (
                                            <span className="flex items-center">
                                                <Package className="h-4 w-4 mr-2 animate-spin" />
                                                Removing...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
