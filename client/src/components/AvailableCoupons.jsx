import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Calendar, Users, Check, Info, X } from 'lucide-react';
import axios from '../utils/api';
import { formatCurrency } from '../utils/currency';
import Button from './ui/Button';

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
                const isValid = (coupon.isActive !== false) &&  // Treat undefined as active
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
            
            // Restore normal filtering
            console.log('Valid coupons after filtering:', validCoupons);
            setCoupons(validCoupons);
        } catch (error) {
            console.error('Error fetching coupons:', error);
            // Don't set coupons to empty array, keep whatever we have
        } finally {
            setLoading(false);
        }
    }, []); // Remove orderAmount from dependencies

    useEffect(() => {
        fetchAvailableCoupons();
    }, [fetchAvailableCoupons]);

    const handleCouponSelect = (coupon) => {
        // Check if this coupon is already selected
        if (selectedCoupon?._id === coupon._id) {
            // Deselect the coupon
            setSelectedCoupon(null);
            onCouponSelect(''); // Clear the coupon code
        } else {
            // Select the new coupon
            setSelectedCoupon(coupon);
            onCouponSelect(coupon.code);
        }
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                <div className="flex items-center">
                    <Tag className="h-5 w-5 text-indigo-600 mr-2 flex-shrink-0" />
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
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-bold text-indigo-600 text-lg">
                                        {coupon.code}
                                    </span>
                                    {coupon.minimumOrderAmount > 0 && (
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded whitespace-nowrap">
                                            Min. {formatCurrency(coupon.minimumOrderAmount)}
                                        </span>
                                    )}
                                </div>
                                
                                <p className="text-sm text-gray-700 mb-2 break-words">{coupon.description}</p>
                                
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">
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
                                        <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                        <span>Valid until {formatDate(coupon.validUntil)}</span>
                                    </div>
                                    
                                    {coupon.usageLimit && (
                                        <div className="flex items-center">
                                            <Users className="h-3 w-3 mr-1 flex-shrink-0" />
                                            <span>{coupon.usageLimit - coupon.usedCount} left</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex-shrink-0">
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
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowDetails(showDetails === coupon._id ? null : coupon._id);
                                }}
                                variant="link"
                                size="sm"
                                icon={Info}
                                iconPosition="left"
                                className="text-xs"
                            >
                                {showDetails === coupon._id ? 'Hide' : 'Show'} Details
                            </Button>
                            
                            {showDetails === coupon._id && (
                                <div className="mt-2 text-xs text-gray-600 space-y-1">
                                    {coupon.applicableTo !== 'ALL' && (
                                        <p className="break-words">
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
