import React, { useState, useEffect } from 'react';
import axios from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { X, Save, Upload } from 'lucide-react';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const CategoryEdit = ({ categoryId, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        image: '',
        isActive: true
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (categoryId) {
            fetchCategory();
        }
    }, [categoryId]);

    const fetchCategory = async () => {
        try {
            const { data } = await axios.get(`/categories/${categoryId}`);
            setFormData(data);
        } catch (error) {
            console.error('Error fetching category:', error);
            setError('Failed to fetch category');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Clear any previous error when starting new upload
        setError('');

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const { data } = await axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setFormData(prev => ({
                ...prev,
                image: data.imagePath
            }));
        } catch (error) {
            console.error('Error uploading image:', error);
            setError('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (categoryId) {
                await axios.put(`/categories/${categoryId}`, formData);
            } else {
                await axios.post('/categories', formData);
            }
            onSave();
        } catch (error) {
            console.error('Error saving category:', error);
            setError(error.response?.data?.message || 'Failed to save category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {categoryId ? 'Edit Category' : 'Add New Category'}
                    </h2>
                    <Button
                        onClick={onCancel}
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700 p-1"
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Input
                            label="Category Name *"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category Image *
                        </label>
                        <div className="space-y-4">
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
                                    className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer"
                                >
                                    <Upload className="h-4 w-4 mr-2" />
                                    {uploading ? 'Uploading...' : 'Upload Image'}
                                </label>
                            </div>
                            
                            {formData.image && (
                                <div className="mt-2">
                                    <img
                                        src={formData.image}
                                        alt="Category preview"
                                        className="h-32 w-32 object-cover rounded-md"
                                    />
                                </div>
                            )}

                            <Input
                                type="url"
                                name="image"
                                value={formData.image}
                                onChange={handleChange}
                                placeholder="Or enter image URL"
                            />
                        </div>
                    </div>

                    {categoryId && (
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                name="isActive"
                                id="isActive"
                                checked={formData.isActive}
                                onChange={handleChange}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                                Active (visible to customers)
                            </label>
                        </div>
                    )}

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
                            disabled={loading}
                            loading={loading}
                            variant="primary"
                            icon={Save}
                            iconPosition="left"
                        >
                            {loading ? 'Saving...' : 'Save Category'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryEdit;
