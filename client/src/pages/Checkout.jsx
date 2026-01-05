import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../utils/api';
import { formatCurrency, SHIPPING_COSTS, TAX_RATE } from '../utils/currency';
import { CreditCard, Truck, Package, DollarSign, Banknote, Download, MapPin, Home, Building2, Globe } from 'lucide-react';
import { downloadInvoicePDF } from '../utils/invoice';
import CouponApply from '../components/CouponApply';

const Checkout = () => {
    const { cartItems, clearCart } = useCart();
    const { userInfo, isAuthenticated, isLoading } = useAuth();
    const { success, error } = useToast();
    const navigate = useNavigate();

    const [address, setAddress] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
    });
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);

    // Load user addresses - moved before early returns
    const loadAddresses = useCallback(async () => {
        console.log('loadAddresses called');
        try {
            const { data } = await axios.get('/auth/profile');
            console.log('Profile data received:', data);
            setUserAddresses(data.addresses || []);
            // Set default address if available
            const defaultAddr = data.addresses?.find(addr => addr.isDefault);
            if (defaultAddr) {
                console.log('Setting default address:', defaultAddr);
                setSelectedAddress(defaultAddr);
                setAddress({
                    street: defaultAddr.street,
                    city: defaultAddr.city,
                    state: defaultAddr.state,
                    postalCode: defaultAddr.postalCode,
                    country: defaultAddr.country
                });
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
        }
    }, []);

    useEffect(() => {
        console.log('useEffect triggered, isAuthenticated:', isAuthenticated, 'isLoading:', isLoading);
        if (isAuthenticated && !isLoading) {
            loadAddresses();
        }
    }, [loadAddresses, isAuthenticated, isLoading]);

    // Early returns after all hooks
    if (isLoading) {
        console.log('Showing loading state');
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        console.log('Redirecting to login');
        navigate('/login?redirect=checkout');
        return null;
    }

    const itemsPrice = cartItems.reduce((acc, item) => acc + (item.qty || 0) * (item.price || 0), 0);
    const shippingPrice = itemsPrice > SHIPPING_COSTS.FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COSTS.STANDARD;
    const taxPrice = itemsPrice * TAX_RATE;
    const discountAmount = couponDiscount || 0;
    const calculatedTotal = itemsPrice + shippingPrice + taxPrice - discountAmount;
    // Ensure minimum total price of 1 for free orders to avoid server issues
    const totalPrice = Math.max(calculatedTotal, 1);

    const handleCouponApplied = (discountAmount, coupon) => {
        setCouponDiscount(discountAmount || 0);
        setAppliedCoupon(coupon);
    };

    const handleCouponRemoved = () => {
        setCouponDiscount(0);
        setAppliedCoupon(null);
    };


    const placeOrderHandler = async (e) => {
        e.preventDefault();
        
        if (loading) {
            return;
        }
        
        setLoading(true);

        // Validate address
        if (!address.street || !address.city || !address.postalCode || !address.country) {
            error('Please fill in all address fields');
            setLoading(false);
            return;
        }

        // Validate cart
        if (!cartItems || cartItems.length === 0) {
            error('Your cart is empty');
            setLoading(false);
            return;
        }

        try {
            const orderData = {
                orderItems: cartItems.map(item => ({
                    name: item.name,
                    qty: item.qty,
                    image: item.image,
                    price: item.price,
                    product: item._id
                })),
                shippingAddress: address,
                paymentMethod: paymentMethod,
                itemsPrice: itemsPrice.toFixed(2),
                shippingPrice: shippingPrice.toFixed(2),
                taxPrice: taxPrice.toFixed(2),
                totalPrice: totalPrice.toFixed(2),
                // Only include coupon fields if they exist
                ...(couponDiscount > 0 && {
                    couponDiscount: couponDiscount.toFixed(2),
                    coupon: appliedCoupon ? {
                        code: appliedCoupon.code,
                        discountType: appliedCoupon.discountType,
                        discountValue: appliedCoupon.discountValue
                    } : null
                })
            };
            
            const { data } = await axios.post('/api/orders', orderData, {
                timeout: 15000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            clearCart();
            
            // Show success toast with invoice download option
            success(`Order placed successfully! Order ID: ${data._id.substring(data._id.length - 8).toUpperCase()}`, 10000);
            
            // Navigate to order details page
            navigate(`/order/${data._id}`);
        } catch (error) {
            console.error('Error placing order:', error);
            error(error.response?.data?.message || 'Error placing order. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8">Checkout</h1>
            <form onSubmit={placeOrderHandler} className="space-y-4 sm:space-y-6">
                <div className="bg-white px-3 sm:px-4 py-4 sm:py-5 shadow sm:rounded-lg sm:p-6">
                    <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-3 lg:gap-6">
                        <div className="sm:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Shipping Address</h3>
                            <p className="mt-1 text-sm text-gray-500">Where should we send your order?</p>
                        </div>
                        <div className="sm:mt-4 lg:mt-0 lg:col-span-2">
                            {/* Address Selection */}
                            {userAddresses.length > 0 && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Address</label>
                                    <div className="space-y-2">
                                        {userAddresses.map((addr, index) => (
                                            <div key={index} className="border border-gray-200 rounded-lg p-3 cursor-pointer hover:border-indigo-500" onClick={() => {
                                                setSelectedAddress(addr);
                                                setAddress({
                                                    street: addr.street,
                                                    city: addr.city,
                                                    state: addr.state,
                                                    postalCode: addr.postalCode,
                                                    country: addr.country
                                                });
                                            }}>
                                                <div className="flex items-center">
                                                    <input
                                                        type="radio"
                                                        name="addressSelect"
                                                        checked={selectedAddress?._id === addr._id}
                                                        onChange={() => {}}
                                                        className="mr-3"
                                                    />
                                                    <div>
                                                        <p className="text-sm font-medium">{addr.street}</p>
                                                        <p className="text-sm text-gray-500">{addr.city}, {addr.state} {addr.postalCode}</p>
                                                        <p className="text-sm text-gray-500">{addr.country}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            
                            {/* Manual Address Entry */}
                            <div className="grid grid-cols-6 gap-6">
                                <div className="col-span-6">
                                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Home className="h-4 w-4 inline mr-2 text-gray-400" />
                                        Street address
                                    </label>
                                    <input 
                                        required 
                                        type="text" 
                                        name="street" 
                                        id="street" 
                                        value={address.street} 
                                        onChange={(e) => setAddress({ ...address, street: e.target.value })} 
                                        placeholder="123 Main Street, Apartment 4B"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm" 
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-6 lg:col-span-2">
                                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Building2 className="h-4 w-4 inline mr-2 text-gray-400" />
                                        City
                                    </label>
                                    <input 
                                        required 
                                        type="text" 
                                        name="city" 
                                        id="city" 
                                        value={address.city} 
                                        onChange={(e) => setAddress({ ...address, city: e.target.value })} 
                                        placeholder="New York"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm" 
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                                        <MapPin className="h-4 w-4 inline mr-2 text-gray-400" />
                                        State
                                    </label>
                                    <input 
                                        required 
                                        type="text" 
                                        name="state" 
                                        id="state" 
                                        value={address.state} 
                                        onChange={(e) => setAddress({ ...address, state: e.target.value })} 
                                        placeholder="NY"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm" 
                                    />
                                </div>

                                <div className="col-span-6 sm:col-span-3 lg:col-span-2">
                                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Package className="h-4 w-4 inline mr-2 text-gray-400" />
                                        Postal code
                                    </label>
                                    <input 
                                        required 
                                        type="text" 
                                        name="postalCode" 
                                        id="postalCode" 
                                        value={address.postalCode} 
                                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} 
                                        placeholder="10001"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm" 
                                    />
                                </div>

                                <div className="col-span-6">
                                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                                        <Globe className="h-4 w-4 inline mr-2 text-gray-400" />
                                        Country
                                    </label>
                                    <input 
                                        required 
                                        type="text" 
                                        name="country" 
                                        id="country" 
                                        value={address.country} 
                                        onChange={(e) => setAddress({ ...address, country: e.target.value })} 
                                        placeholder="United States"
                                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm sm:text-sm" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white px-3 sm:px-4 py-4 sm:py-5 shadow sm:rounded-lg sm:p-6">
                    <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-3 lg:gap-6">
                        <div className="sm:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Payment Method</h3>
                            <p className="mt-1 text-sm text-gray-500">Choose how you want to pay</p>
                        </div>
                        <div className="sm:mt-4 lg:mt-0 lg:col-span-2">
                            <div className="space-y-3">
                                <div className="flex items-center">
                                    <input 
                                        id="cod" 
                                        name="paymentMethod" 
                                        type="radio" 
                                        value="COD"
                                        checked={paymentMethod === 'COD'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" 
                                    />
                                    <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                                        <Banknote className="h-4 w-4 inline mr-2" />
                                        Cash on Delivery (COD)
                                    </label>
                                </div>
                                <div className="flex items-center">
                                    <input 
                                        id="card" 
                                        name="paymentMethod" 
                                        type="radio" 
                                        value="CARD"
                                        checked={paymentMethod === 'CARD'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300" 
                                    />
                                    <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-700">
                                        <CreditCard className="h-4 w-4 inline mr-2" />
                                        Credit/Debit Card (Coming Soon)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white px-3 sm:px-4 py-4 sm:py-5 shadow sm:rounded-lg sm:p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Order Summary</h3>
                    
                    {/* Order Items */}
                    <div className="space-y-3 mb-6">
                        {cartItems.map((item) => (
                            <div key={item._id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center mb-2 sm:mb-0">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="h-12 w-12 object-cover rounded-md mr-3"
                                    />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                        <p className="text-sm text-gray-500">Qty: {item.qty} × {formatCurrency(item.price)}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-gray-900">
                                        {formatCurrency(item.qty * item.price)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Price Breakdown */}
                    <div className="border-t pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
                            <span className="font-medium">{formatCurrency(itemsPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium">
                                {shippingPrice === 0 ? 'FREE' : formatCurrency(shippingPrice)}
                            </span>
                        </div>
                        {shippingPrice === 0 && (
                            <p className="text-xs text-green-600">Free shipping on orders over ₹500!</p>
                        )}
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">GST (18%)</span>
                            <span className="font-medium">{formatCurrency(taxPrice)}</span>
                        </div>
                        {couponDiscount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-600">Discount ({appliedCoupon.code})</span>
                                <span className="font-medium text-green-600">-{formatCurrency(couponDiscount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                            <span>Total</span>
                            <span>{formatCurrency(totalPrice)}</span>
                        </div>
                    </div>

                    {/* Coupon Apply Section */}
                    <CouponApply
                        orderAmount={itemsPrice + shippingPrice + taxPrice}
                        cartItems={cartItems}
                        onCouponApplied={handleCouponApplied}
                        onCouponRemoved={handleCouponRemoved}
                    />

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Processing...
                            </>
                        ) : (
                            <>
                                <Package className="h-5 w-5 mr-2" />
                                Place Order
                            </>
                        )}
                    </button>

                    {paymentMethod === 'COD' && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-md">
                            <p className="text-sm text-blue-800">
                                <strong>Cash on Delivery:</strong> Pay when you receive your order. Delivery within 3-5 business days.
                            </p>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
};

export default Checkout;
