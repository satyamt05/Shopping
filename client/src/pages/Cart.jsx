
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import { Trash2, ShoppingBag, RotateCcw, Heart } from 'lucide-react';
import { formatCurrency, fetchShippingConfig } from '../utils/currency';

const Cart = () => {
    const { cartItems, removeFromCart, addToCart, clearCart } = useCart();
    const { userInfo, isAuthenticated } = useAuth();
    const { addToWishlist } = useWishlist();
    const { success, error: showError } = useToast();
    const navigate = useNavigate();

    const [shippingConfig, setShippingConfig] = useState({
        STANDARD: 0,
        FREE_SHIPPING_THRESHOLD: 0,
        EXPRESS: 0,
        freeShippingEnabled: true,
        expressShippingEnabled: false
    });
    const [taxRate, setTaxRate] = useState(0);
    const [configLoading, setConfigLoading] = useState(true);

    // Fetch shipping configuration
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                setConfigLoading(true);
                // Make only one API call to get both shipping config and tax rate
                const shippingData = await fetchShippingConfig();
                console.log('Cart - Fetched shipping config:', shippingData); // Debug log
                setShippingConfig(shippingData);
                setTaxRate(shippingData.taxRate || 0);
            } catch (error) {
                console.error('Error fetching configuration:', error);
            } finally {
                setConfigLoading(false);
            }
        };

        fetchConfig();
    }, []);

    const itemsPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
    const shippingPrice = (!configLoading && shippingConfig.freeShippingEnabled && itemsPrice > shippingConfig.FREE_SHIPPING_THRESHOLD) ? 0 : (!configLoading ? shippingConfig.STANDARD : 0);
    const taxPrice = itemsPrice * taxRate;
    const totalPrice = itemsPrice + shippingPrice + taxPrice;

    // Shimmer loader for shipping info
const ShippingShimmer = () => (
    <div className="animate-pulse">
        <div className="flex justify-between mb-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-40 mb-2"></div>
    </div>
);

    const checkoutHandler = () => {
        if (!isAuthenticated) {
            navigate('/login?redirect=checkout');
        } else {
            navigate('/checkout');
        }
    };

    const clearCartHandler = () => {
        if (window.confirm('Are you sure you want to clear all items from your cart?')) {
            clearCart();
        }
    };

    const moveToWishlistHandler = async (product) => {
        try {
            await addToWishlist(product._id);
            removeFromCart(product._id);
            success('Item moved to wishlist');
        } catch (error) {
            showError(error.message);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
                <ShoppingBag className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
                <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/shop" className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-md font-medium hover:bg-indigo-700 transition">Start Shopping</Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
                <button
                    onClick={clearCartHandler}
                    className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition"
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Clear All
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                    {cartItems.map((item) => (
                        <div key={item._id} className="flex items-center justify-between border-b border-gray-200 py-6">
                            <div className="flex items-center">
                                <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-md" />
                                <div className="ml-4">
                                    <Link to={`/product/${item._id}`} className="text-lg font-medium text-gray-900 hover:text-indigo-600">{item.name}</Link>
                                    <p className="text-gray-500 text-sm">{item.brand}</p>
                                    <p className="text-gray-900 font-bold mt-1">{formatCurrency(item.price)}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <select
                                    value={item.qty}
                                    onChange={(e) => addToCart(item, Number(e.target.value))}
                                    className="border border-gray-300 rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {[...Array(item.countInStock).keys()].map((x) => (
                                        <option key={x + 1} value={x + 1}>
                                            {x + 1}
                                        </option>
                                    ))}
                                </select>
                                <button 
                                    onClick={() => moveToWishlistHandler(item)} 
                                    className="text-pink-500 hover:text-pink-700 p-2"
                                    title="Move to Wishlist"
                                >
                                    <Heart className="h-5 w-5" />
                                </button>
                                <button onClick={() => removeFromCart(item._id)} className="text-red-500 hover:text-red-700 p-2">
                                    <Trash2 className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="lg:col-span-4">
                    <div className="bg-gray-50 rounded-lg p-6 sticky top-24">
                        <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                        <div className="flex justify-between mb-2">
                            <span className="text-gray-600">Subtotal ({cartItems.length} items)</span>
                            <span className="font-bold text-gray-900">{formatCurrency(itemsPrice)}</span>
                        </div>
                        
                        {/* Show shimmer while loading shipping config */}
                        {configLoading ? (
                            <ShippingShimmer />
                        ) : (
                            <>
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className={shippingPrice === 0 ? "text-green-600" : "text-gray-900"}>
                                        {shippingPrice === 0 ? 'FREE' : formatCurrency(shippingPrice)}
                                    </span>
                                </div>
                                {shippingPrice === 0 && shippingConfig.freeShippingEnabled && (
                                    <p className="text-xs text-green-600 mb-2">Free shipping on orders over {formatCurrency(shippingConfig.FREE_SHIPPING_THRESHOLD)}!</p>
                                )}
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">GST ({(taxRate * 100).toFixed(0)}%)</span>
                                    <span className="text-gray-900">{formatCurrency(taxPrice)}</span>
                                </div>
                            </>
                        )}
                        <div className="border-t border-gray-200 pt-4 mb-6">
                            <div className="flex justify-between">
                                <span className="text-lg font-bold text-gray-900">Total</span>
                                <span className="text-lg font-bold text-gray-900">{formatCurrency(totalPrice)}</span>
                            </div>
                        </div>
                        <button
                            onClick={checkoutHandler}
                            className="w-full bg-indigo-600 text-white py-3 rounded-md font-medium hover:bg-indigo-700 transition"
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Cart;
