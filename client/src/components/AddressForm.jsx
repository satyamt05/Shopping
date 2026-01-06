import React, { useState, useEffect } from 'react';
import { MapPin, Plus, X, Save } from 'lucide-react';

const AddressForm = ({ 
    initialAddress = null, 
    onSave, 
    onCancel, 
    loading = false,
    submitButtonText = "Save Address",
    showCancelButton = true,
    className = ""
}) => {
    const [formData, setFormData] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false
    });
    const [errors, setErrors] = useState({});

    // Initialize form with initialAddress if provided
    useEffect(() => {
        if (initialAddress) {
            setFormData({
                street: initialAddress.street || '',
                city: initialAddress.city || '',
                state: initialAddress.state || '',
                postalCode: initialAddress.postalCode || '',
                country: initialAddress.country || 'India',
                isDefault: initialAddress.isDefault || false
            });
        }
    }, [initialAddress]);

    // Validation function
    const validateForm = () => {
        const newErrors = {};
        
        // Street validation
        if (!formData.street.trim()) {
            newErrors.street = 'Street address is required';
        } else if (formData.street.trim().length < 5) {
            newErrors.street = 'Street address must be at least 5 characters';
        }
        
        // City validation
        if (!formData.city.trim()) {
            newErrors.city = 'City is required';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.city.trim())) {
            newErrors.city = 'City should contain only letters and spaces';
        }
        
        // State validation
        if (!formData.state.trim()) {
            newErrors.state = 'State is required';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.state.trim())) {
            newErrors.state = 'State should contain only letters and spaces';
        }
        
        // Postal code validation (India PIN code format)
        if (!formData.postalCode.trim()) {
            newErrors.postalCode = 'Postal code is required';
        } else if (!/^\d{6}$/.test(formData.postalCode.trim())) {
            newErrors.postalCode = 'Postal code must be 6 digits';
        }
        
        // Country validation
        if (!formData.country.trim()) {
            newErrors.country = 'Country is required';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.country.trim())) {
            newErrors.country = 'Country should contain only letters and spaces';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = () => {
        console.log('AddressForm handleSubmit called');
        console.log('Form data:', formData);
        
        if (!validateForm()) {
            console.log('Form validation failed');
            return;
        }
        
        console.log('Calling onSave with:', formData);
        onSave(formData);
    };

    return (
        <div className={`bg-gray-50 p-4 rounded-lg ${className}`}>
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900 flex items-center">
                    <MapPin className="h-5 w-5 mr-2 text-indigo-600" />
                    {initialAddress ? 'Edit Address' : 'Add New Address'}
                </h3>
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Street Address */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Street Address *
                        </label>
                        <input
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            placeholder="123 Main Street, Apartment 4B, Sector 15"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.street ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.street && (
                            <p className="text-xs text-red-600 mt-1">{errors.street}</p>
                        )}
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            City *
                        </label>
                        <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Mumbai"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.city ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.city && (
                            <p className="text-xs text-red-600 mt-1">{errors.city}</p>
                        )}
                    </div>

                    {/* State */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            State *
                        </label>
                        <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Maharashtra"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.state ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.state && (
                            <p className="text-xs text-red-600 mt-1">{errors.state}</p>
                        )}
                    </div>

                    {/* Postal Code */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Postal Code *
                        </label>
                        <input
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                            placeholder="400001"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.postalCode ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.postalCode && (
                            <p className="text-xs text-red-600 mt-1">{errors.postalCode}</p>
                        )}
                    </div>

                    {/* Country */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Country *
                        </label>
                        <input
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="India"
                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                errors.country ? 'border-red-500' : 'border-gray-300'
                            }`}
                            required
                        />
                        {errors.country && (
                            <p className="text-xs text-red-600 mt-1">{errors.country}</p>
                        )}
                    </div>
                </div>

                {/* Default Address Checkbox */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        name="isDefault"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={handleChange}
                        className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="text-sm text-gray-700">
                        Set as default address
                    </label>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {submitButtonText}
                            </>
                        )}
                    </button>
                    
                    {showCancelButton && onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddressForm;
