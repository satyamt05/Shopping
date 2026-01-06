import React, { useState, useEffect } from 'react';
import { MapPin, Plus, X, Save } from 'lucide-react';
import Button from './ui/Button';
import Input from './ui/Input';

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
                    <Button
                        type="button"
                        onClick={onCancel}
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-gray-600 p-1"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                )}
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Street Address */}
                    <div className="md:col-span-2">
                        <Input
                            label="Street Address *"
                            type="text"
                            name="street"
                            value={formData.street}
                            onChange={handleChange}
                            placeholder="123 Main Street, Apartment 4B, Sector 15"
                            error={errors.street}
                            required
                        />
                    </div>

                    {/* City */}
                    <div>
                        <Input
                            label="City *"
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            placeholder="Mumbai"
                            error={errors.city}
                            required
                        />
                    </div>

                    {/* State */}
                    <div>
                        <Input
                            label="State *"
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            placeholder="Maharashtra"
                            error={errors.state}
                            required
                        />
                    </div>

                    {/* Postal Code */}
                    <div>
                        <Input
                            label="Postal Code *"
                            type="text"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleChange}
                            placeholder="400001"
                            error={errors.postalCode}
                            required
                        />
                    </div>

                    {/* Country */}
                    <div>
                        <Input
                            label="Country *"
                            type="text"
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            placeholder="India"
                            error={errors.country}
                            required
                        />
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
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        loading={loading}
                        variant="primary"
                        icon={Save}
                        iconPosition="left"
                    >
                        {loading ? 'Saving...' : submitButtonText}
                    </Button>
                    
                    {showCancelButton && onCancel && (
                        <Button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            variant="secondary"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default AddressForm;
