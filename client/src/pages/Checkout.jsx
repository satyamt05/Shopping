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
    const totalPrice = itemsPrice + shippingPrice + taxPrice - (couponDiscount || 0);

    const handleCouponApplied = (discountAmount, coupon) => {
        setCouponDiscount(discountAmount || 0);
        setAppliedCoupon(coupon);
    };

    const handleCouponRemoved = () => {
        setCouponDiscount(0);
        setAppliedCoupon(null);
    };

    // Network connectivity check
    const checkNetworkConnectivity = async () => {
        try {
            const response = await fetch('/api/health', {
                method: 'GET',
                cache: 'no-cache'
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    const placeOrderHandler = async (e) => {
        e.preventDefault();
        console.log('Place order clicked, loading state:', loading);
        console.log('User agent:', navigator.userAgent);
        console.log('Is mobile:', /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
        
        if (loading) {
            console.log('Already loading, ignoring click');
            return;
        }
        
        setLoading(true);

        // Check network connectivity first
        console.log('Checking network connectivity...');
        const isOnline = await checkNetworkConnectivity();
        if (!isOnline) {
            console.log('Network connectivity check failed');
            error('No internet connection. Please check your network and try again.');
            setLoading(false);
            return;
        }
        console.log('Network connectivity OK');

        // Validate address
        if (!address.street || !address.city || !address.postalCode || !address.country) {
            console.log('Address validation failed:', address);
            error('Please fill in all address fields');
            setLoading(false);
            return;
        }

        // Validate cart
        if (!cartItems || cartItems.length === 0) {
            console.log('Cart validation failed - empty cart');
            error('Your cart is empty');
            setLoading(false);
            return;
        }

        console.log('Placing order with data:', {
            itemsCount: cartItems.length,
            paymentMethod,
            totalPrice,
            couponDiscount,
            address: address
        });

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
                couponDiscount: couponDiscount.toFixed(2),
                coupon: appliedCoupon ? {
                    code: appliedCoupon.code,
                    discountType: appliedCoupon.discountType,
                    discountValue: appliedCoupon.discountValue
                } : null
            };

            console.log('Sending order data:', orderData);
            
            // Try multiple approaches for mobile compatibility
            let response;
            
            // Method 1: Standard axios (works on desktop and responsive mode)
            try {
                console.log('Trying standard axios call...');
                response = await axios.post('/orders', orderData, {
                    timeout: 15000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                console.log('Standard axios worked:', response.data);
            } catch (axiosError) {
                console.log('Standard axios failed, trying fallback:', axiosError);
                
                // Method 2: Fetch API fallback for mobile
                try {
                    console.log('Trying fetch API fallback...');
                    const fetchResponse = await fetch('/api/orders', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        },
                        body: JSON.stringify(orderData)
                    });
                    
                    if (!fetchResponse.ok) {
                        throw new Error(`HTTP error! status: ${fetchResponse.status}`);
                    }
                    
                    const data = await fetchResponse.json();
                    console.log('Fetch API worked:', data);
                    response = { data };
                } catch (fetchError) {
                    console.log('Fetch API also failed:', fetchError);
                    throw fetchError;
                }
            }
            
            const { data } = response;
            console.log('Order placed successfully:', data);

            clearCart();
            
            // Show success toast with invoice download option
            success(`Order placed successfully! Order ID: ${data._id.substring(data._id.length - 8).toUpperCase()}`, 10000);
            
            // Navigate to order details page
            navigate(`/order/${data._id}`);
        } catch (error) {
            console.error('Error placing order:', error);
            console.error('Error type:', error.name);
            console.error('Error message:', error.message);
            console.error('Error response:', error.response?.data);
            
            let errorMessage = 'Error placing order. Please try again.';
            
            if (error.message.includes('timeout')) {
                errorMessage = 'Request timed out. Please check your internet connection and try again.';
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
                errorMessage = 'Network error. Please check your connection and try again.';
            } else if (error.message.includes('HTTP error')) {
                errorMessage = `Server error: ${error.message}`;
            }
            
            error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
            <form onSubmit={placeOrderHandler} className="space-y-6">
                <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Shipping Address</h3>
                            <p className="mt-1 text-sm text-gray-500">Where should we send your order?</p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
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

                <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                    <div className="md:grid md:grid-cols-3 md:gap-6">
                        <div className="md:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Payment Method</h3>
                            <p className="mt-1 text-sm text-gray-500">Choose how you want to pay</p>
                        </div>
                        <div className="mt-5 md:mt-0 md:col-span-2">
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

                <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Order Summary</h3>
                    
                    {/* Order Items */}
                    <div className="space-y-3 mb-6">
                        {cartItems.map((item) => (
                            <div key={item._id} className="flex justify-between items-center">
                                <div className="flex items-center">
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
                                <p className="text-sm font-medium text-gray-900">{formatCurrency(item.qty * item.price)}</p>
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

                    {/* Debug button for mobile testing - remove in production */}
                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
                            <p className="text-sm text-yellow-800 mb-2">
                                <strong>Mobile Debug:</strong> Test API connectivity
                            </p>
                            <button
                                onClick={async () => {
                                    console.log('Testing API connectivity...');
                                    try {
                                        const response = await fetch('/api/health');
                                        console.log('Health check response:', response);
                                        const data = await response.json();
                                        console.log('Health check data:', data);
                                        alert(`API Test: ${response.ok ? 'SUCCESS' : 'FAILED'} - ${JSON.stringify(data)}`);
                                    } catch (error) {
                                        console.error('API Test failed:', error);
                                        alert(`API Test: FAILED - ${error.message}`);
                                    }
                                }}
                                className="px-3 py-1 bg-yellow-600 text-white text-xs rounded hover:bg-yellow-700"
                            >
                                Test API Connection
                            </button>
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        onClick={(e) => {
                            console.log('Button clicked directly');
                            if (!loading) {
                                placeOrderHandler(e);
                            }
                        }}
                        className="w-full flex justify-center py-4 px-4 border border-transparent rounded-lg shadow-lg text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mt-6 touch-manipulation transition-all duration-150 min-h-[56px]"
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
