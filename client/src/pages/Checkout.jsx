import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import axios from '../utils/api';
import { formatCurrency, fetchShippingConfig } from '../utils/currency';
import { CreditCard, Truck, Package, DollarSign, Banknote, Download, MapPin, Home, Building2, Globe } from 'lucide-react';
import { downloadInvoicePDF } from '../utils/invoice';
import CouponApply from '../components/CouponApply';
import AddressForm from '../components/AddressForm';

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
        country: 'India'
    });
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [formErrors, setFormErrors] = useState({});
    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [loading, setLoading] = useState(false);
    const [addressSaving, setAddressSaving] = useState(false);
    const [addressesLoading, setAddressesLoading] = useState(true);
    const [addressesError, setAddressesError] = useState(null);
    const [userAddresses, setUserAddresses] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [couponDiscount, setCouponDiscount] = useState(0);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [shippingConfig, setShippingConfig] = useState({
        STANDARD: 0,
        FREE_SHIPPING_THRESHOLD: 0,
        EXPRESS: 0,
        freeShippingEnabled: true,
        expressShippingEnabled: false
    });
    const [taxRate, setTaxRate] = useState(0);
    const [configLoading, setConfigLoading] = useState(true);

    // Validation function
    const validateForm = () => {
        const errors = {};
        
        // Street validation
        if (!address.street.trim()) {
            errors.street = 'Street address is required';
        } else if (address.street.trim().length < 5) {
            errors.street = 'Street address must be at least 5 characters';
        }
        
        // City validation
        if (!address.city.trim()) {
            errors.city = 'City is required';
        } else if (!/^[a-zA-Z\s]+$/.test(address.city.trim())) {
            errors.city = 'City should contain only letters and spaces';
        }
        
        // State validation
        if (!address.state.trim()) {
            errors.state = 'State is required';
        } else if (!/^[a-zA-Z\s]+$/.test(address.state.trim())) {
            errors.state = 'State should contain only letters and spaces';
        }
        
        // Postal code validation (India PIN code format: 6 digits)
        if (!address.postalCode.trim()) {
            errors.postalCode = 'Postal code is required';
        } else if (!/^\d{6}$/.test(address.postalCode.trim())) {
            errors.postalCode = 'Postal code must be 6 digits';
        }
        
        // Country validation
        if (!address.country.trim()) {
            errors.country = 'Country is required';
        } else if (!/^[a-zA-Z\s]+$/.test(address.country.trim())) {
            errors.country = 'Country should contain only letters and spaces';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSaveAddress = async (addressData) => {
        console.log('handleSaveAddress called with:', addressData);
        
        setAddressSaving(true);
        
        // Save to user profile
        try {
            const { data } = await axios.get('/auth/profile');
            console.log('Current user profile:', data);
            const updatedAddresses = [...(data.addresses || []), addressData];
            console.log('Updated addresses:', updatedAddresses);
            
            // Update user profile with new address
            await axios.put('/auth/profile', {
                name: data.name,
                email: data.email,
                phone: data.phone,
                addresses: updatedAddresses
            });
            console.log('Profile updated successfully');
            
            // Update local state
            setUserAddresses(updatedAddresses);
            setShowAddressForm(false);
            success('Address saved successfully!');
            
            // Auto-select the newly added address
            const newAddress = updatedAddresses[updatedAddresses.length - 1];
            setSelectedAddress(newAddress);
            setAddress({
                street: newAddress.street,
                city: newAddress.city,
                state: newAddress.state,
                postalCode: newAddress.postalCode,
                country: newAddress.country
            });
        } catch (error) {
            console.error('Error saving address:', error);
            error('Failed to save address');
        } finally {
            setAddressSaving(false);
        }
    };

    // Load user addresses - moved before early returns
    const loadAddresses = useCallback(async () => {
        console.log('loadAddresses called');
        setAddressesLoading(true);
        setAddressesError(null);
        
        try {
            const { data } = await axios.get('/auth/profile');
            console.log('Profile data received:', data);
            const addresses = data.addresses || [];
            setUserAddresses(addresses);
            
            // Auto-select logic
            if (addresses.length === 1) {
                // If there's only one address, select it and make it default
                const singleAddress = addresses[0];
                console.log('Auto-selecting single address:', singleAddress);
                
                // Update the address to be default if it's not already
                if (!singleAddress.isDefault) {
                    try {
                        await axios.put('/auth/profile', {
                            name: data.name,
                            email: data.email,
                            phone: data.phone,
                            addresses: [{ ...singleAddress, isDefault: true }]
                        });
                        console.log('Single address set as default');
                        // Update local state with default flag
                        singleAddress.isDefault = true;
                        setUserAddresses([{ ...singleAddress, isDefault: true }]);
                    } catch (error) {
                        console.error('Error setting single address as default:', error);
                        // Still select the address even if setting default fails
                    }
                }
                
                setSelectedAddress(singleAddress);
                setAddress({
                    street: singleAddress.street,
                    city: singleAddress.city,
                    state: singleAddress.state,
                    postalCode: singleAddress.postalCode,
                    country: singleAddress.country
                });
            } else {
                // Set default address if available (for multiple addresses)
                const defaultAddr = addresses.find(addr => addr.isDefault);
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
            }
        } catch (error) {
            console.error('Error loading addresses:', error);
            setAddressesError('Failed to load your addresses. Please try refreshing the page.');
        } finally {
            setAddressesLoading(false);
        }
    }, []);

    // Shimmer loader for shipping info
const ShippingShimmer = () => (
    <div className="animate-pulse">
        <div className="flex justify-between text-sm mb-2">
            <div className="h-4 bg-gray-200 rounded w-20"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-40 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-20"></div>
    </div>
);

    // Fetch shipping configuration
    const fetchConfig = useCallback(async () => {
        try {
            setConfigLoading(true);
            // Make only one API call to get both shipping config and tax rate
            const shippingData = await fetchShippingConfig();
            console.log('Checkout - Fetched shipping config:', shippingData); // Debug log
            setShippingConfig(shippingData);
            setTaxRate(shippingData.taxRate || 0);
        } catch (error) {
            console.error('Error fetching configuration:', error);
        } finally {
            setConfigLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated && !isLoading) {
            fetchConfig();
            loadAddresses();
        }
    }, [isAuthenticated, isLoading, fetchConfig]);

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
    const shippingPrice = (!configLoading && shippingConfig.freeShippingEnabled && itemsPrice > shippingConfig.FREE_SHIPPING_THRESHOLD) ? 0 : (!configLoading ? shippingConfig.STANDARD : 0);
    const calculatedTaxPrice = itemsPrice * taxRate;
    const discountAmount = couponDiscount || 0;
    const calculatedTotal = itemsPrice + shippingPrice + calculatedTaxPrice - discountAmount;
    // Ensure minimum total price of 1 for free orders to avoid server issues
    const totalPrice = Math.max(calculatedTotal, 1);

    // Check if user has a valid address
    const hasValidAddress = () => {
        // Check if user has selected an address from their saved addresses
        if (selectedAddress && selectedAddress.street && selectedAddress.city && 
            selectedAddress.state && selectedAddress.postalCode && selectedAddress.country) {
            return true;
        }
        
        // Check if user has manually entered a complete address
        if (address.street && address.city && address.state && address.postalCode && address.country) {
            return true;
        }
        
        return false;
    };

    const handleCouponApplied = (discountAmount, coupon) => {
        setCouponDiscount(discountAmount || 0);
        setAppliedCoupon(coupon);
    };

    const handleCouponRemoved = () => {
        setCouponDiscount(0);
        setAppliedCoupon(null);
    };


    // Handle click on disabled Place Order button to scroll to address section
    const handlePlaceOrderClick = (e) => {
        if (!hasValidAddress()) {
            e.preventDefault();
            // Scroll to the shipping address section
            const addressSection = document.getElementById('shipping-address-section');
            if (addressSection) {
                addressSection.scrollIntoView({ behavior: 'smooth' });
            } else {
                // Fallback: scroll to top of form
                document.querySelector('form').scrollIntoView({ behavior: 'smooth' });
            }
            // Show the address form if it's not already visible
            if (!showAddressForm && userAddresses.length === 0) {
                setShowAddressForm(true);
            }
        }
    };

    const placeOrderHandler = async (e) => {
        e.preventDefault();
        
        if (loading) {
            return;
        }

        // Validate form before proceeding
        if (!validateForm()) {
            error('Please fix the errors in the form');
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
                taxPrice: calculatedTaxPrice.toFixed(2),
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
            
            const { data } = await axios.post('/orders', orderData, {
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
                {/* Order Summary Section - Moved to first position */}
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
                            <span className="text-gray-600">Items ({cartItems.length})</span>
                            <span className="font-medium">{formatCurrency(itemsPrice)}</span>
                        </div>
                        
                        {/* Show shimmer while loading shipping config */}
                        {configLoading ? (
                            <ShippingShimmer />
                        ) : (
                            <>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping</span>
                                    <span className="font-medium">
                                        {shippingPrice === 0 ? 'FREE' : formatCurrency(shippingPrice)}
                                    </span>
                                </div>
                                {shippingPrice === 0 && shippingConfig.freeShippingEnabled && (
                                    <p className="text-xs text-green-600">Free shipping on orders over {formatCurrency(shippingConfig.FREE_SHIPPING_THRESHOLD)}!</p>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">GST ({(taxRate * 100).toFixed(0)}%)</span>
                                    <span className="font-medium">{formatCurrency(calculatedTaxPrice)}</span>
                                </div>
                            </>
                        )}
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
                        orderAmount={itemsPrice + shippingPrice + calculatedTaxPrice}
                        cartItems={cartItems}
                        onCouponApplied={handleCouponApplied}
                        onCouponRemoved={handleCouponRemoved}
                    />
                </div>

                {/* Shipping Address Section - Second position */}
                <div className="bg-white px-3 sm:px-4 py-4 sm:py-5 shadow sm:rounded-lg sm:p-6" id="shipping-address-section">
                    <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-1 lg:grid-cols-3 lg:gap-6">
                        <div className="sm:col-span-1">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">Shipping Address</h3>
                            <p className="mt-1 text-sm text-gray-500">Where should we send your order?</p>
                        </div>
                        <div className="sm:mt-4 lg:mt-0 lg:col-span-2">
                            {/* Loading State */}
                            {addressesLoading && (
                                <div className="mb-4">
                                    <div className="animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                                        <div className="space-y-2">
                                            <div className="h-16 bg-gray-200 rounded"></div>
                                            <div className="h-16 bg-gray-200 rounded"></div>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">Loading your addresses...</p>
                                </div>
                            )}

                            {/* Error State */}
                            {addressesError && !addressesLoading && (
                                <div className="mb-4">
                                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                                        <div className="flex">
                                            <div className="flex-shrink-0">
                                                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <div className="ml-3">
                                                <p className="text-sm text-red-800">{addressesError}</p>
                                                <button
                                                    type="button"
                                                    onClick={loadAddresses}
                                                    className="mt-2 text-sm text-red-600 underline hover:text-red-800"
                                                >
                                                    Try again
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Address Selection */}
                            {!addressesLoading && !addressesError && userAddresses.length > 0 && (
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
                                                        {addr.isDefault && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mt-1">
                                                                Default
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Add New Address Button - Show when not loading and no error */}
                            {!addressesLoading && !addressesError && (
                                <div className="flex justify-center py-4">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            console.log('Add New Address button clicked');
                                            setShowAddressForm(true);
                                        }}
                                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                    >
                                        <MapPin className="h-4 w-4 mr-2" />
                                        Add New Address
                                    </button>
                                </div>
                            )}

                            {/* Address Form Modal */}
                            {showAddressForm && (
                                <>
                                    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                                        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                                            <AddressForm
                                                onSave={handleSaveAddress}
                                                onCancel={() => setShowAddressForm(false)}
                                                loading={addressSaving}
                                                submitButtonText="Save & Use This Address"
                                                showCancelButton={true}
                                            />
                                        </div>
                                    </div>
                                    {console.log('AddressForm modal is being rendered')}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Payment Method Section - Third position */}
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
                                        disabled
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 opacity-50 cursor-not-allowed" 
                                    />
                                    <label htmlFor="card" className="ml-3 block text-sm font-medium text-gray-400 cursor-not-allowed">
                                        <CreditCard className="h-4 w-4 inline mr-2" />
                                        Credit/Debit Card (Coming Soon)
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !hasValidAddress()}
                        onClick={handlePlaceOrderClick}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                    >
                        {loading ? (
                            <>
                                <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Processing...
                            </>
                        ) : !hasValidAddress() ? (
                            <>
                                <MapPin className="h-5 w-5 mr-2" />
                                Add Address to Place Order
                            </>
                        ) : (
                            <>
                                <Package className="h-5 w-5 mr-2" />
                                Place Order
                            </>
                        )}
                    </button>

                    {!hasValidAddress() && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <p className="text-sm text-amber-800">
                                <strong>Please add a shipping address:</strong> You need to provide a delivery address to place your order. Click the "Add New Address" button above or select an existing address.
                            </p>
                        </div>
                    )}

                    {paymentMethod === 'COD' && hasValidAddress() && (
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
