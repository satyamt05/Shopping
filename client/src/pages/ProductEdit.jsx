import React, { useEffect, useState } from 'react';
import axios from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Trash2, Upload, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';

const ProductEdit = ({ productId, onSave, onCancel }) => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        price: 0,
        description: '',
        image: '',
        brand: '',
        category: '',
        countInStock: 0,
    });
    const [previewImage, setPreviewImage] = useState('');
    const [uploadError, setUploadError] = useState('');
    
    useEffect(() => {
        fetchCategories();
        if (productId) {
            fetchProduct();
        }
    }, [productId]);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/categories');
            setCategories(data);
            // Set default category to first available category if none selected
            if (data.length > 0 && !formData.category) {
                setFormData(prev => ({ ...prev, category: data[0].name }));
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchProduct = async () => {
        try {
            const { data } = await axios.get(`/products/${productId}`);
            setFormData({
                name: data.name,
                price: data.price,
                description: data.description,
                image: data.image,
                brand: data.brand,
                category: data.category,
                countInStock: data.countInStock,
            });
            setPreviewImage(data.image);
        } catch (error) {
            console.error('Error fetching product:', error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'price' || name === 'countInStock' ? Number(value) : value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Clear any previous error when starting new upload
        setUploadError('');

        // Show immediate local preview
        const localPreview = URL.createObjectURL(file);
        setPreviewImage(localPreview);

        const formData = new FormData();
        formData.append('image', file);

        setUploading(true);
        try {
            const { data } = await axios.post('/upload', formData);
            setFormData(prev => ({ ...prev, image: data.imagePath }));
            setPreviewImage(data.imagePath);
            // Clean up the local preview URL
            URL.revokeObjectURL(localPreview);
        } catch (error) {
            console.error('Error uploading image:', error);
            setUploadError('Error uploading image: ' + (error.response?.data?.message || error.message));
            // Revert to empty state on error
            setPreviewImage('');
            setFormData(prev => ({ ...prev, image: '' }));
            URL.revokeObjectURL(localPreview);
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (productId) {
                await axios.put(`/products/${productId}`, formData);
            } else {
                await axios.post('/products', formData);
            }

            onSave();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Error saving product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <Button
                        onClick={onCancel}
                        variant="ghost"
                        size="sm"
                        className="mr-4 p-2 text-gray-600 hover:text-gray-900"
                    >
                        <ArrowLeft className="h-6 w-6" />
                    </Button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {productId ? 'Edit Product' : 'Create Product'}
                    </h1>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Product Name */}
                    <div>
                        <Input
                            label="Product Name *"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Brand */}
                    <div>
                        <Input
                            label="Brand"
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                        />
                    </div>

                    {/* Price */}
                    <div>
                        <Input
                            label="Price (₹) *"
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <Dropdown
                            label="Category *"
                            name="category"
                            value={formData.category}
                            onChange={(value) => handleChange({ target: { name: 'category', value } })}
                            options={categories.map(cat => ({ value: cat.name, label: cat.name }))}
                            required
                        />
                    </div>

                    {/* Stock */}
                    <div>
                        <Input
                            label="Count in Stock *"
                            type="number"
                            name="countInStock"
                            value={formData.countInStock}
                            onChange={handleChange}
                            required
                            min="0"
                        />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Image
                        </label>
                        <div className="flex items-center space-x-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="hidden"
                                id="image-upload"
                            />
                            <label
                                htmlFor="image-upload"
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 disabled:opacity-50"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {uploading ? 'Uploading...' : 'Choose Image'}
                            </label>
                            {uploading && (
                                <div className="text-sm text-gray-500">
                                    Uploading image...
                                </div>
                            )}
                            {uploadError && (
                                <div className="text-sm text-red-600 mt-1">
                                    {uploadError}
                                </div>
                            )}
                            {(formData.image || previewImage) && (
                                <Button
                                    type="button"
                                    onClick={() => {
                                        setFormData(prev => ({ ...prev, image: '' }));
                                        setPreviewImage('');
                                    }}
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-800 p-1"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                {/* Image Preview */}
                {previewImage && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Image Preview {uploading && '(Uploading...)'}
                        </label>
                        <div className="relative">
                            <img
                                src={previewImage}
                                alt="Product preview"
                                className="h-48 w-48 object-cover rounded-md border border-gray-300"
                                onLoad={() => console.log('Image loaded successfully')}
                                onError={(e) => console.error('Image failed to load:', e)}
                            />
                            {uploading && (
                                <div className="absolute inset-0 bg-white bg-opacity-75 rounded-md border border-gray-300 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                                        <p className="mt-2 text-sm text-gray-600">Uploading...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Preview URL: {previewImage.substring(0, 50)}...</p>
                    </div>
                )}

                {/* Form Actions */}
                <div className="flex justify-end space-x-4">
                    <Button
                        type="button"
                        onClick={onCancel}
                        variant="outline"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading || uploading}
                        loading={loading || uploading}
                        variant="primary"
                        icon={Save}
                        iconPosition="left"
                    >
                        {loading ? 'Saving...' : 'Save Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default ProductEdit;
