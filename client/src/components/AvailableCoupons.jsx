import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Calendar, Users, Check, Info, X } from 'lucide-react';
import axios from '../utils/api';
import { formatCurrency } from '../utils/currency';

const AvailableCoupons = ({ onCouponSelect, orderAmount, cartItems }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCoupon, setSelectedCoupon] = useState(null);
    const [showDetails, setShowDetails] = useState(null);

    const fetchAvailableCoupons = useCallback(async () => {
        try {
            console.log('Fetching available coupons...');
            console.log('Current orderAmount:', orderAmount);
            const { data } = await axios.get('/discount-coupons/public');
            console.log('Coupons fetched:', data);
            
            // Filter active and valid coupons
            const validCoupons = data.filter(coupon => {
                const now = new Date();
                const isValid = coupon.isActive && 
                               new Date(coupon.validUntil) > now &&
                               (!coupon.minimumOrderAmount || orderAmount >= coupon.minimumOrderAmount);
                console.log(`Coupon ${coupon.code}:`, {
                    isActive: coupon.isActive,
                    validUntil: new Date(coupon.validUntil) > now,
                    minimumOrderAmount: coupon.minimumOrderAmount,
                    orderAmount: orderAmount,
                    meetsMinimum: !coupon.minimumOrderAmount || orderAmount >= coupon.minimumOrderAmount,
                    isValid: isValid
                });
                return isValid;
            });
            
            // TEMPORARY: Show all coupons for debugging
            console.log('DEBUG: Showing all coupons temporarily');
            setCoupons(data);
            // setCoupons(validCoupons);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            // Don't set coupons to empty array, keep whatever we have
        } finally {
            setLoading(false);
        }
    }, [orderAmount]);

    useEffect(() => {
        fetchAvailableCoupons();
    }, [orderAmount]);

    const handleCouponSelect = (coupon) => {
        setSelectedCoupon(coupon);
        onCouponSelect(coupon.code);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const isExpired = (validUntil) => {
        return new Date(validUntil) < new Date();
    };

    if (loading) {
        return (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                </div>
            </div>
        );
    }

    if (coupons.length === 0) {
        return (
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="text-center py-4">
                    <Tag className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No available coupons at the moment</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                    <Tag className="h-5 w-5 text-indigo-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Available Coupons</h3>
                </div>
                <span className="text-sm text-gray-500">{coupons.length} offers</span>
            </div>

            <div className="space-y-3">
                {coupons.map((coupon) => (
                    <div
                        key={coupon._id}
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                            selectedCoupon?._id === coupon._id
                                ? 'border-indigo-500 bg-indigo-50'
                                : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleCouponSelect(coupon)}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center mb-2">
                                    <span className="font-bold text-indigo-600 text-lg">
                                        {coupon.code}
                                    </span>
                                    {coupon.minimumOrderAmount > 0 && (
                                        <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                            Min. {formatCurrency(coupon.minimumOrderAmount)}
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-sm text-gray-700 mb-2">{coupon.description}</p>
                                
                                <div className="flex items-center space-x-4 text-xs text-gray-500">
                                    <div className="flex items-center">
                                        {coupon.discountType === 'PERCENTAGE' ? (
                                            <span className="font-medium text-green-600">
                                                {coupon.discountValue}% OFF
                                            </span>
                                        ) : (
                                            <span className="font-medium text-green-600">
                                                {formatCurrency(coupon.discountValue)} OFF
                                            </span>
                                        )}
                                    </div>
                                    
                                    {coupon.maximumDiscountAmount && (
                                        <div className="flex items-center">
                                            <span>Max: {formatCurrency(coupon.maximumDiscountAmount)}</span>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center">
                                        <Calendar className="h-3 w-3 mr-1" />
                                        <span>Valid until {formatDate(coupon.validUntil)}</span>
                                    </div>
                                    
                                    {coupon.usageLimit && (
                                        <div className="flex items-center">
                                            <Users className="h-3 w-3 mr-1" />
                                            <span>{coupon.usageLimit - coupon.usedCount} left</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="ml-3">
                                {selectedCoupon?._id === coupon._id ? (
                                    <div className="bg-indigo-600 text-white rounded-full p-1">
                                        <Check className="h-4 w-4" />
                                    </div>
                                ) : (
                                    <div className="border-2 border-gray-300 rounded-full p-1">
                                        <div className="w-4 h-4"></div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Expandable Details */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDetails(showDetails === coupon._id ? null : coupon._id);
                                }}
                                className="flex items-center text-xs text-indigo-600 hover:text-indigo-800"
                            >
                                <Info className="h-3 w-3 mr-1" />
                                {showDetails === coupon._id ? 'Hide' : 'Show'} Details
                            </button>
                            
                            {showDetails === coupon._id && (
                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                    {coupon.applicableTo !== 'ALL' && (
                                        <p>
                                            <strong>Applies to:</strong> {
                                                coupon.applicableTo === 'SPECIFIC_CATEGORIES' 
                                                    ? 'Selected categories only'
                                                    : 'Selected products only'
                                            }
                                        </p>
                                    )}
                                    {coupon.usageLimit && (
                                        <p>
                                            <strong>Usage:</strong> {coupon.usedCount}/{coupon.usageLimit} used
                                        </p>
                                    )}
                                    <p>
                                        <strong>Created:</strong> {formatDate(coupon.createdAt)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AvailableCoupons;
