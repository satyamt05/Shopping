import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import { User, MapPin, Phone, Mail, Edit2, Save, X, Plus, Trash2, Package, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { userInfo, token, login, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
    });

    const [addressForm, setAddressForm] = useState({
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        isDefault: false
    });

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

    // Redirect if not authenticated
    if (!isAuthenticated) {
        navigate('/login');
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

    // Load profile data directly without useEffect
    const [profileLoaded, setProfileLoaded] = React.useState(false);
    
    React.useEffect(() => {
        if (!profileLoaded && isAuthenticated) {
            axios.get('/auth/profile')
                .then(({ data }) => {
                    setFormData({
                        name: data.name || '',
                        email: data.email || '',
                        phone: data.phone || ''
                    });
                    setAddresses(data.addresses || []);
                    setProfileLoaded(true);
                })
                .catch(error => {
                    console.error('Error loading profile:', error);
                    setProfileLoaded(true); // Prevent infinite retries
                });
        }
    }, [isAuthenticated, profileLoaded]);

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
        setLoading(true);

        try {
            const { data } = await axios.put('/auth/profile', {
                ...formData,
                addresses
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

    const handleAddAddress = async (e) => {
        e.preventDefault();
        
        const newAddress = {
            street: addressForm.street,
            city: addressForm.city,
            state: addressForm.state,
            postalCode: addressForm.postalCode,
            country: addressForm.country,
            isDefault: addressForm.isDefault
        };

        const updatedAddresses = [...addresses, newAddress];
        setAddresses(updatedAddresses);

        try {
            // Save to database immediately
            await axios.put('/auth/profile', {
                ...formData,
                addresses: updatedAddresses
            });
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Error saving address');
            // Revert on error
            setAddresses(addresses);
        }

        setAddressForm({
            street: '',
            city: '',
            state: '',
            postalCode: '',
            country: '',
            isDefault: false
        });
        setShowAddressForm(false);
    };

    const handleDeleteAddress = async (index) => {
        const updatedAddresses = addresses.filter((_, i) => i !== index);
        setAddresses(updatedAddresses);

        try {
            // Save to database immediately
            await axios.put('/auth/profile', {
                ...formData,
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
            <div className="bg-white shadow-lg rounded-lg p-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Page</h1>
                <p className="text-gray-600 mb-4">Profile page is temporarily disabled for debugging.</p>
                <button 
                    onClick={() => navigate('/')}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700"
                >
                    Go to Home
                </button>
            </div>
        </div>
    );
};

export default Profile;
