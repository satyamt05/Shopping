import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Edit, Trash2, Calendar, Tag, Percent, DollarSign, Check, X, Eye } from 'lucide-react';
import axios from '../utils/api';
import { formatCurrency } from '../utils/currency';
import Button from './ui/Button';
import Input from './ui/Input';
import Dropdown from './ui/Dropdown';

const DiscountCouponManager = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'PERCENTAGE',
        discountValue: '',
        minimumOrderAmount: '',
        maximumDiscountAmount: '',
        usageLimit: '',
        validUntil: '',
        applicableTo: 'ALL',
        applicableCategories: [],
        applicableProducts: [],
        isActive: true
    });

    const fetchCoupons = useCallback(async () => {
        try {
            const { data } = await axios.get('/discount-coupons');
            setCoupons(data);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCoupons();
    }, [fetchCoupons]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCoupon) {
                await axios.put(`/discount-coupons/${editingCoupon._id}`, formData);
            } else {
                await axios.post('/discount-coupons', formData);
            }
            
            setShowForm(false);
            setEditingCoupon(null);
            resetForm();
            fetchCoupons();
        } catch (error) {
            console.error('Error saving coupon:', error);
            alert('Error saving coupon: ' + (error.response?.data?.message || error.message));
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minimumOrderAmount: coupon.minimumOrderAmount,
            maximumDiscountAmount: coupon.maximumDiscountAmount,
            usageLimit: coupon.usageLimit,
            validUntil: new Date(coupon.validUntil).toISOString().split('T')[0],
            applicableTo: coupon.applicableTo,
            applicableCategories: coupon.applicableCategories,
            applicableProducts: coupon.applicableProducts,
            isActive: coupon.isActive
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this coupon?')) {
            try {
                await axios.delete(`/discount-coupons/${id}`);
                fetchCoupons();
            } catch (error) {
                console.error('Error deleting coupon:', error);
                alert('Error deleting coupon');
            }
        }
    };

    const resetForm = () => {
        setFormData({
            code: '',
            description: '',
            discountType: 'PERCENTAGE',
            discountValue: '',
            minimumOrderAmount: '',
            maximumDiscountAmount: '',
            usageLimit: '',
            validUntil: '',
            applicableTo: 'ALL',
            applicableCategories: [],
            applicableProducts: [],
            isActive: true
        });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingCoupon(null);
        resetForm();
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
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Discount Coupons</h2>
                <Button
                    onClick={() => setShowForm(true)}
                    variant="primary"
                    icon={Plus}
                    iconPosition="left"
                >
                    Add Coupon
                </Button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-semibold mb-4">
                        {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Input
                                    label="Coupon Code"
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="Description"
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    required
                                />
                            </div>
                            <div>
                                <Dropdown
                                    label="Discount Type"
                                    value={formData.discountType}
                                    onChange={(value) => setFormData({...formData, discountType: value})}
                                    options={[
                                        { value: 'PERCENTAGE', label: 'Percentage' },
                                        { value: 'FIXED_AMOUNT', label: 'Fixed Amount' }
                                    ]}
                                />
                            </div>
                            <div>
                                <Input
                                    label={formData.discountType === 'PERCENTAGE' ? 'Discount (%)' : 'Discount Amount'}
                                    type="number"
                                    value={formData.discountValue}
                                    onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                                    min="0"
                                    required
                                />
                            </div>
                            <div>
                                <Input
                                    label="Minimum Order Amount"
                                    type="number"
                                    value={formData.minimumOrderAmount}
                                    onChange={(e) => setFormData({...formData, minimumOrderAmount: e.target.value})}
                                    min="0"
                                />
                            </div>
                            {formData.discountType === 'PERCENTAGE' && (
                                <div>
                                    <Input
                                        label="Maximum Discount Amount"
                                        type="number"
                                        value={formData.maximumDiscountAmount}
                                        onChange={(e) => setFormData({...formData, maximumDiscountAmount: e.target.value})}
                                        min="0"
                                    />
                                </div>
                            )}
                            <div>
                                <Input
                                    label="Usage Limit"
                                    type="number"
                                    value={formData.usageLimit}
                                    onChange={(e) => setFormData({...formData, usageLimit: e.target.value})}
                                    min="1"
                                />
                            </div>
                            <div>
                                <Input
                                    label="Valid Until"
                                    type="date"
                                    value={formData.validUntil}
                                    onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Active
                            </label>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <Button
                                type="button"
                                onClick={handleCancel}
                                variant="outline"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                            >
                                {editingCoupon ? 'Update' : 'Create'} Coupon
                            </Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Code
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Discount
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Min Order
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Usage
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Valid Until
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {coupons.map((coupon) => (
                                <tr key={coupon._id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <Tag className="h-4 w-4 text-gray-400 mr-2" />
                                            <span className="text-sm font-medium text-gray-900">{coupon.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-sm text-gray-900">{coupon.description}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {coupon.discountType === 'PERCENTAGE' ? (
                                                <Percent className="h-4 w-4 text-green-600 mr-1" />
                                            ) : (
                                                <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                                            )}
                                            <span className="text-sm text-gray-900">
                                                {coupon.discountType === 'PERCENTAGE' 
                                                    ? `${coupon.discountValue}%` 
                                                    : formatCurrency(coupon.discountValue)
                                                }
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {coupon.minimumOrderAmount > 0 ? formatCurrency(coupon.minimumOrderAmount) : 'No minimum'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {coupon.usageLimit ? `${coupon.usedCount}/${coupon.usageLimit}` : `${coupon.usedCount} used`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                                            {formatDate(coupon.validUntil)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            isExpired(coupon.validUntil) 
                                                ? 'bg-red-100 text-red-800'
                                                : coupon.isActive 
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {isExpired(coupon.validUntil) ? 'Expired' : coupon.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            <Button
                                                onClick={() => handleEdit(coupon)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-indigo-600 hover:text-indigo-900 p-1"
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                onClick={() => handleDelete(coupon._id)}
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-600 hover:text-red-900 p-1"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DiscountCouponManager;
