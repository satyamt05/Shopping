import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import { User, MapPin, Phone, Mail, Edit2, Save, X, Plus, Trash2, Package, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AddressForm from '../components/AddressForm';

const Profile = () => {
    const { userInfo, token, login, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Validation functions
    const validateProfileForm = () => {
        const errors = {};
        
        // Name validation
        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            errors.name = 'Name must be at least 2 characters';
        } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
            errors.name = 'Name should contain only letters and spaces';
        } else if (formData.name.trim().length > 50) {
            errors.name = 'Name should not exceed 50 characters';
        }
        
        // Email validation
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            errors.email = 'Please enter a valid email address';
        }
        
        // Phone validation (Indian phone format)
        if (formData.phone.trim()) {
            if (!/^[6-9]\d{9}$/.test(formData.phone.replace(/\s/g, ''))) {
                errors.phone = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9';
            }
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    useEffect(() => {
        if (isAuthenticated) {
            axios.get('/auth/profile')
                .then(async ({ data }) => {
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || ''
                    });
                    
                    let addresses = data.addresses || [];
                    
                    // Auto-make single address default
                    if (addresses.length === 1 && !addresses[0].isDefault) {
                        try {
                            const updatedAddresses = [{ ...addresses[0], isDefault: true }];
                            await axios.put('/auth/profile', {
                                name: data.name,
                                email: data.email,
                                phone: data.phone,
                                addresses: updatedAddresses
                            });
                            console.log('Single address set as default in profile');
                            addresses = updatedAddresses;
                        } catch (error) {
                            console.error('Error setting single address as default in profile:', error);
                        }
                    }
                    
                    setAddresses(addresses);
                })
                .catch(error => {
                    console.error('Error loading profile:', error);
                });
        }
    }, [isAuthenticated]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect handled by effect; return null to avoid rendering protected content during redirect
    if (!isAuthenticated) {
        return null;
    }

    // useEffect(() => {
    //     // Redirect if not authenticated
    //     if (!isAuthenticated) {
    //         navigate('/login');
    //         return;
    //     }

    //     // Load user profile data
    //     const loadProfile = async () => {
    //         if (!userInfo) return;
            
    //         try {
    //             const { data } = await axios.get('/auth/profile');
    //             setFormData({
    //                 name: data.name || '',
    //                 email: data.email || '',
    //                 phone: data.phone || ''
    //             });
    //             setAddresses(data.addresses || []);
    //         } catch (error) {
    //             console.error('Error loading profile:', error);
    //         }
    //     };

    //     loadProfile();
    // }, [userInfo, isAuthenticated]); // Remove navigate from dependencies

    // moved above to ensure hook order

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAddressForm(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateProfileForm()) {
            return;
        }
        
        setLoading(true);

        try {
            const { data } = await axios.put('/auth/profile', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                addresses: addresses
            });
            
            // Update local user info
            login(data, token);
            setIsEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAddAddress = async (addressData) => {
        const newAddress = {
            street: addressData.street,
            city: addressData.city,
            state: addressData.state,
            postalCode: addressData.postalCode,
            country: addressData.country,
            isDefault: addressData.isDefault
        };

        const updatedAddresses = [...addresses, newAddress];
        setAddresses(updatedAddresses);

        try {
            // Save to database immediately
            await axios.put('/auth/profile', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                addresses: updatedAddresses
            });
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Error saving address');
            // Revert on error
            setAddresses(addresses);
        }

        setShowAddressForm(false);
    };

    const handleDeleteAddress = async (index) => {
        const updatedAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(updatedAddresses);

        try {
            // Save to database immediately
            await axios.put('/auth/profile', {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                addresses: updatedAddresses
            });
        } catch (error) {
            console.error('Error deleting address:', error);
            alert('Error deleting address');
            // Revert on error
            setAddresses(addresses);
        }
    };

    const handleSetDefaultAddress = async (index) => {
        const updatedAddresses = addresses.map((addr, i) => ({
            ...addr,
            isDefault: i === index
        }));
        setAddresses(updatedAddresses);

        try {
            // Save to database immediately
            await axios.put('/auth/profile', {
                ...formData,
                addresses: updatedAddresses
            });
        } catch (error) {
            console.error('Error setting default address:', error);
            alert('Error setting default address');
            // Revert on error
            setAddresses(addresses);
        }
    };

    if (!userInfo) {
        return <div className="text-center py-8">Loading...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-white shadow-lg rounded-lg">
                {/* Profile Header */}
                <div className="bg-indigo-600 text-white p-4 sm:p-6 rounded-t-lg">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center">
                            <div className="bg-white text-indigo-600 rounded-full p-2 sm:p-3 mr-3 sm:mr-4">
                                <User className="h-6 w-6 sm:h-8 sm:w-8" />
                            </div>
                            <div>
                                <h1 className="text-lg sm:text-2xl font-bold truncate pr-2">{formData.name}</h1>
                                <p className="text-indigo-100 text-sm truncate pr-2">{formData.email}</p>
                            </div>
                        </div>
                        {!isEditing ? (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="bg-white text-indigo-600 px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-indigo-50 flex items-center whitespace-nowrap text-sm sm:text-base"
                            >
                                <Edit2 className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="whitespace-nowrap">Edit Profile</span>
                            </button>
                        ) : (
                            <div className="flex flex-col sm:flex-row gap-2 sm:space-x-2">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="bg-indigo-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-indigo-400 flex items-center whitespace-nowrap text-sm sm:text-base"
                                >
                                    <X className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="whitespace-nowrap">Cancel</span>
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="bg-white text-indigo-600 px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-indigo-50 disabled:opacity-50 flex items-center whitespace-nowrap text-sm sm:text-base"
                                >
                                    <Save className="h-4 w-4 mr-2 flex-shrink-0" />
                                    <span className="whitespace-nowrap">{loading ? 'Saving...' : 'Save'}</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Profile Content */}
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                            
                            {isEditing ? (
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Name
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={formData.name}
                                            onChange={(e) => {
                                                handleChange(e);
                                                // Clear error when user starts typing
                                                if (formErrors.name) {
                                                    setFormErrors({ ...formErrors, name: '' });
                                                }
                                            }}
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                formErrors.name ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {formErrors.name && (
                                            <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={(e) => {
                                                handleChange(e);
                                                // Clear error when user starts typing
                                                if (formErrors.email) {
                                                    setFormErrors({ ...formErrors, email: '' });
                                                }
                                            }}
                                            disabled
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                                                formErrors.email ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                                        {formErrors.email && (
                                            <p className="text-xs text-red-600 mt-1">{formErrors.email}</p>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={(e) => {
                                                handleChange(e);
                                                // Clear error when user starts typing
                                                if (formErrors.phone) {
                                                    setFormErrors({ ...formErrors, phone: '' });
                                                }
                                            }}
                                            placeholder="9876543210"
                                            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                                                formErrors.phone ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                        />
                                        {formErrors.phone && (
                                            <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>
                                        )}
                                    </div>
                                </form>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center">
                                        <User className="h-4 w-4 text-gray-400 mr-3" />
                                        <span className="text-gray-700">{formData.name}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Mail className="h-4 w-4 text-gray-400 mr-3" />
                                        <span className="text-gray-700">{formData.email}</span>
                                    </div>
                                    {formData.phone && (
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 text-gray-400 mr-3" />
                                            <span className="text-gray-700">{formData.phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Order History */}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Orders</h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/orders')}
                                    className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                                >
                                    <div className="flex items-center">
                                        <Package className="h-5 w-5 text-indigo-600 mr-3" />
                                        <div className="text-left">
                                            <p className="text-sm font-medium text-gray-900">Order History</p>
                                            <p className="text-xs text-gray-500">View all your orders</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-400">→</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Addresses Section */}
                    <div className="mt-8">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Shipping Addresses</h2>
                            <button
                                onClick={() => setShowAddressForm(true)}
                                className="bg-indigo-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-md hover:bg-indigo-700 flex items-center whitespace-nowrap text-sm sm:text-base"
                            >
                                <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                                <span className="whitespace-nowrap">Add Address</span>
                            </button>
                        </div>

                        {showAddressForm && (
                            <AddressForm
                                onSave={handleAddAddress}
                                onCancel={() => setShowAddressForm(false)}
                                loading={loading}
                                submitButtonText="Save Address"
                                showCancelButton={true}
                            />
                        )}

                        {addresses.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500">No addresses added yet</p>
                                <p className="text-sm text-gray-400">Add your first shipping address to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {addresses.map((address, index) => (
                                    <div key={address._id || index} className="border border-gray-200 rounded-lg p-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                {address.isDefault && (
                                                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-2 inline-block">
                                                        Default
                                                    </span>
                                                )}
                                                <p className="text-gray-900">{address.street}</p>
                                                <p className="text-gray-600">
                                                    {address.city}, {address.state} {address.postalCode}
                                                </p>
                                                <p className="text-gray-600">{address.country}</p>
                                            </div>
                                            <div className="flex space-x-2 ml-4">
                                                {!address.isDefault && (
                                                    <button
                                                        onClick={() => handleSetDefaultAddress(index)}
                                                        className="text-indigo-600 hover:text-indigo-800 text-sm"
                                                    >
                                                        Set Default
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeleteAddress(index)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
