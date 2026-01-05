import React, { useState } from 'react';
import { Tag, Check, X, Loader, Gift } from 'lucide-react';
import axios from '../utils/api';
import { formatCurrency } from '../utils/currency';
import AvailableCoupons from './AvailableCoupons';

const CouponApply = ({ orderAmount, cartItems, onCouponApplied, onCouponRemoved }) => {
    const [couponCode, setCouponCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) {
            setError('Please enter a coupon code');
            return;
        }

        if (loading) {
            return; // Prevent duplicate calls
        }

        if (appliedCoupon && appliedCoupon.code === couponCode.trim().toUpperCase()) {
            setError('Coupon is already applied');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            console.log('Applying coupon:', couponCode.trim());
            console.log('Order amount:', orderAmount);
            console.log('Cart items:', cartItems);
            
            const response = await axios.post('/discount-coupons/validate', {
                code: couponCode.trim(),
                orderAmount: orderAmount || 0,
                cartItems
            });

            const { coupon, discountAmount } = response.data;
            console.log('Coupon validation response:', response.data);
            
            setAppliedCoupon({
                ...coupon,
                discountAmount: discountAmount || 0
            });
            setSuccess('Coupon applied successfully!');
            onCouponApplied(discountAmount || 0, coupon);
        } catch (error) {
            console.error('Coupon validation error:', error);
            console.error('Error response:', error.response?.data);
            setError(error.response?.data?.message || 'Invalid coupon code');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setError('');
        setSuccess('');
        onCouponRemoved();
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleApplyCoupon();
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center mb-3">
                    <Tag className="h-5 w-5 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Apply Coupon Code</h3>
                </div>

                {!appliedCoupon ? (
                    <div className="space-y-3">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                onKeyPress={handleKeyPress}
                                placeholder="Enter coupon code"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                disabled={loading}
                            />
                            <button
                                onClick={handleApplyCoupon}
                                disabled={loading || !couponCode.trim()}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <Loader className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    <Check className="h-4 w-4 mr-2" />
                                )}
                                Apply
                            </button>
                        </div>

                        {error && (
                            <div className="flex items-center text-red-600 text-sm">
                                <X className="h-4 w-4 mr-1" />
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="flex items-center text-green-600 text-sm">
                                <Check className="h-4 w-4 mr-1" />
                                {success}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        <div className="bg-green-50 border border-green-200 rounded-md p-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="flex items-center">
                                        <Tag className="h-4 w-4 text-green-600 mr-2" />
                                        <span className="font-medium text-green-800">{appliedCoupon.code}</span>
                                    </div>
                                    <p className="text-sm text-green-600 mt-1">{appliedCoupon.description}</p>
                                    <div className="flex items-center mt-2">
                                        <span className="text-sm text-green-700">
                                            {appliedCoupon.discountType === 'PERCENTAGE' 
                                                ? `${appliedCoupon.discountValue}% off`
                                                : `${formatCurrency(appliedCoupon.discountValue)} off`
                                            }
                                        </span>
                                        <span className="text-sm text-green-600 ml-2">
                                            (-{formatCurrency(appliedCoupon.discountAmount)})
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={handleRemoveCoupon}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Remove coupon"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Available Coupons */}
            <AvailableCoupons
                orderAmount={orderAmount}
                cartItems={cartItems}
                onCouponSelect={(code) => {
                    setCouponCode(code);
                    setError('');  // Clear any previous error
                    setSuccess(''); // Clear any previous success
                    // Small delay to ensure state is updated
                    setTimeout(() => {
                        handleApplyCoupon();
                    }, 100);
                }}
            />
        </div>
    );
};

export default CouponApply;
