
import React, { useEffect, useState } from 'react';
import axios from '../utils/api';
import { Trash2, Plus, Edit, Search, Filter, FolderOpen, Package, Truck, CheckCircle, Clock, XCircle, User, DollarSign, Eye, X, Tag, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductEdit from './ProductEdit';
import CategoryEdit from './CategoryEdit';
import DiscountCouponManager from '../components/DiscountCouponManager';
import { formatCurrency } from '../utils/currency';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';

const AdminDashboard = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [orders, setOrders] = useState([]);
    const [users, setUsers] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [productsLoading, setProductsLoading] = useState(true);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [ordersLoading, setOrdersLoading] = useState(true);
    const [usersLoading, setUsersLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingCategory, setEditingCategory] = useState(null);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showOrderItems, setShowOrderItems] = useState(false);
    const [shippingConfig, setShippingConfig] = useState({
        standardShippingCost: 40,
        freeShippingThreshold: 500,
        expressShippingCost: 80,
        taxRate: 0.18,
        freeShippingEnabled: true,
        expressShippingEnabled: false
    });
    const [shippingLoading, setShippingLoading] = useState(false);
    const [shippingSaving, setShippingSaving] = useState(false);
    const { token, userInfo, isLoading, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Shimmer loader components
    const TableShimmer = ({ rows = 5 }) => (
        <div className="animate-pulse">
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, index) => (
                    <div key={index} className="grid grid-cols-5 gap-4">
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                        <div className="h-10 bg-gray-200 rounded"></div>
                    </div>
                ))}
            </div>
        </div>
    );

    const CardShimmer = () => (
        <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow">
                        <div className="flex items-center">
                            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                            <div className="ml-4 flex-1">
                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                <div className="h-8 bg-gray-200 rounded"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const fetchProducts = async () => {
        try {
            const { data } = await axios.get('/products');
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const { data } = await axios.get('/orders');
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const { data } = await axios.get('/auth/users');
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const [productsRes, categoriesRes, ordersRes, usersRes] = await Promise.all([
                axios.get('/products'),
                axios.get('/categories'),
                axios.get('/orders'),
                axios.get('/auth/users')
            ]);

            const totalRevenue = ordersRes.data.reduce((sum, order) => sum + order.totalPrice, 0);
            const totalOrders = ordersRes.data.length;
            const totalUsers = usersRes.data.length;
            const totalProducts = productsRes.data.length;
            const totalCategories = categoriesRes.data.length;

            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setOrders(ordersRes.data);
            setUsers(usersRes.data);
            
            setStats({
                totalRevenue,
                totalOrders,
                totalUsers,
                totalProducts,
                totalCategories,
                recentOrders: ordersRes.data.slice(0, 5),
                recentUsers: usersRes.data.slice(0, 5)
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchStats();
        }
    }, [token]);

    useEffect(() => {
        if (activeTab === 'settings' && token) {
            fetchShippingConfig();
        }
    }, [activeTab, token]);

    const deleteHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await axios.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error(error);
                alert('Error deleting product');
            }
        }
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
    };

    const handleCreateProduct = () => {
        setEditingProduct({}); // Empty object for new product
    };

    const handleSaveProduct = () => {
        setEditingProduct(null);
        fetchProducts();
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
    };

    const handleEditCategory = (category) => {
        setEditingCategory(category);
    };

    const handleCreateCategory = () => {
        setEditingCategory({});
    };

    const handleSaveCategory = () => {
        setEditingCategory(null);
        fetchCategories();
    };

    const handleCancelCategoryEdit = () => {
        setEditingCategory(null);
    };

    const deleteCategoryHandler = async (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await axios.delete(`/categories/${id}`);
                fetchCategories();
            } catch (error) {
                console.error(error);
                alert('Error deleting category');
            }
        }
    };

    const updateOrderStatus = async (orderId, newStatus) => {
        try {
            await axios.put(`/orders/${orderId}/status`, { status: newStatus });
            fetchOrders();
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Error updating order status');
        }
    };

    const handleViewOrderItems = (order) => {
        setSelectedOrder(order);
        setShowOrderItems(true);
    };

    const handleCloseOrderItems = () => {
        setSelectedOrder(null);
        setShowOrderItems(false);
    };

    const fetchShippingConfig = async () => {
        setShippingLoading(true);
        try {
            const { data } = await axios.get('/shipping/config');
            setShippingConfig(data);
        } catch (error) {
            console.error('Error fetching shipping config:', error);
        } finally {
            setShippingLoading(false);
        }
    };

    const updateShippingConfig = async (configData) => {
        setShippingSaving(true);
        try {
            const { data } = await axios.put('/shipping/config', configData);
            setShippingConfig(data);
            alert('Shipping configuration updated successfully!');
        } catch (error) {
            console.error('Error updating shipping config:', error);
            alert('Error updating shipping configuration');
        } finally {
            setShippingSaving(false);
        }
    };

    const handleShippingConfigChange = (field, value) => {
        setShippingConfig(prev => ({
            ...prev,
            [field]: field === 'taxRate' ? parseFloat(value) : 
                     field.includes('Cost') || field === 'freeShippingThreshold' ? parseInt(value) : 
                     value
        }));
    };

    // Filter products based on search and category
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             product.brand?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = !filterCategory || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categoryOptions = categories.map(cat => cat.name);

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

    // Redirect if not admin
    if (!isAuthenticated || !userInfo?.isAdmin) {
        navigate('/login');
        return null;
    }

    if (editingProduct !== null) {
        return (
            <ProductEdit
                productId={editingProduct._id}
                onSave={handleSaveProduct}
                onCancel={handleCancelEdit}
            />
        );
    }

    if (editingCategory !== null) {
        return (
            <CategoryEdit
                categoryId={editingCategory._id}
                onSave={handleSaveCategory}
                onCancel={handleCancelCategoryEdit}
            />
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-8">
                <nav className="-mb-px flex space-x-8">
                    <Button
                        onClick={() => setActiveTab('dashboard')}
                        variant="ghost"
                        className={`py-2 px-1 border-b-2 font-medium text-sm rounded-none ${
                            activeTab === 'dashboard'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Dashboard
                    </Button>
                    <Button
                        onClick={() => setActiveTab('products')}
                        variant="ghost"
                        className={`py-2 px-1 border-b-2 font-medium text-sm rounded-none ${
                            activeTab === 'products'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Products
                    </Button>
                    <Button
                        onClick={() => setActiveTab('categories')}
                        variant="ghost"
                        className={`py-2 px-1 border-b-2 font-medium text-sm rounded-none ${
                            activeTab === 'categories'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Categories
                    </Button>
                    <Button
                        onClick={() => setActiveTab('orders')}
                        variant="ghost"
                        className={`py-2 px-1 border-b-2 font-medium text-sm rounded-none ${
                            activeTab === 'orders'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Orders
                    </Button>
                    <Button
                        onClick={() => setActiveTab('users')}
                        variant="ghost"
                        className={`py-2 px-1 border-b-2 font-medium text-sm rounded-none ${
                            activeTab === 'users'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Users
                    </Button>
                    <Button
                        onClick={() => setActiveTab('coupons')}
                        variant="ghost"
                        className={`py-2 px-1 border-b-2 font-medium text-sm rounded-none ${
                            activeTab === 'coupons'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Coupons
                    </Button>
                    <Button
                        onClick={() => setActiveTab('settings')}
                        variant="ghost"
                        className={`py-2 px-1 border-b-2 font-medium text-sm rounded-none ${
                            activeTab === 'settings'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        Settings
                    </Button>
                </nav>
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && (
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
                    
                    {/* Stats Cards */}
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow">
                                        <div className="flex items-center">
                                            <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                                            <div className="ml-4 flex-1">
                                                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                                                <div className="h-8 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <div 
                                onClick={() => setActiveTab('products')}
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center">
                                    <div className="p-3 bg-indigo-100 rounded-full">
                                        <Package className="h-6 w-6 text-indigo-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Products</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalProducts || 0}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div 
                                onClick={() => setActiveTab('categories')}
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center">
                                    <div className="p-3 bg-green-100 rounded-full">
                                        <FolderOpen className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Categories</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalCategories || 0}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div 
                                onClick={() => setActiveTab('users')}
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center">
                                    <div className="p-3 bg-blue-100 rounded-full">
                                        <User className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Users</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalUsers || 0}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div 
                                onClick={() => setActiveTab('orders')}
                                className="bg-white p-6 rounded-lg shadow cursor-pointer hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-center">
                                    <div className="p-3 bg-yellow-100 rounded-full">
                                        <Truck className="h-6 w-6 text-yellow-600" />
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                        <p className="text-2xl font-bold text-gray-900">{stats.totalOrders || 0}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Revenue Card */}
                    <div className="bg-white p-6 rounded-lg shadow mb-8">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <DollarSign className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue || 0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Orders</h2>
                            <div className="space-y-3">
                                {stats.recentOrders?.map((order) => (
                                    <div key={order._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">#{order._id.slice(-8)}</p>
                                            <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            order.status === 'Delivered' 
                                                ? 'bg-green-100 text-green-800'
                                                : order.status === 'Shipped'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Users</h2>
                            <div className="space-y-3">
                                {stats.recentUsers?.map((user) => (
                                    <div key={user._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">{user.email}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            user.isAdmin 
                                                ? 'bg-indigo-100 text-indigo-800'
                                                : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {user.isAdmin ? 'Admin' : 'Customer'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Tab */}
            {activeTab === 'products' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Product Management</h1>
                        <Button 
                            onClick={handleCreateProduct}
                            variant="primary"
                            icon={Plus}
                            iconPosition="left"
                        >
                            Add Product
                        </Button>
                    </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                    <Input
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        icon={Search}
                        iconPosition="left"
                    />
                </div>
                <div className="sm:w-48">
                    <Dropdown
                        value={filterCategory}
                        onChange={(value) => setFilterCategory(value)}
                        options={[
                            { value: '', label: 'All Categories' },
                            ...categoryOptions.map(cat => ({ value: cat, label: cat }))
                        ]}
                        placeholder="All Categories"
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">Loading products...</p>
                </div>
            ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Product
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Price
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12">
                                                    <img
                                                        className="h-12 w-12 rounded object-cover"
                                                        src={product.image || 'https://via.placeholder.com/48'}
                                                        alt={product.name}
                                                    />
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {product.brand}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {formatCurrency(product.price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-sm font-medium ${
                                                product.countInStock > 0 ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {product.countInStock} in stock
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <Button
                                                    onClick={() => handleEditProduct(product)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-indigo-600 hover:text-indigo-900 p-1"
                                                    title="Edit product"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </Button>
                                                <Button
                                                    onClick={() => deleteHandler(product._id)}
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-900 p-1"
                                                    title="Delete product"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No products found</p>
                        </div>
                    )}
                </div>
                )}
                </div>
            )}

            {/* Categories Tab */}
            {activeTab === 'categories' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Category Management</h1>
                        <Button 
                            onClick={handleCreateCategory}
                            variant="primary"
                            icon={Plus}
                            iconPosition="left"
                        >
                            Add Category
                        </Button>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Description
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
                                    {categories.map((category) => (
                                        <tr key={category._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-12 w-12">
                                                        <img
                                                            className="h-12 w-12 rounded object-cover"
                                                            src={category.image || 'https://via.placeholder.com/48'}
                                                            alt={category.name}
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {category.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 max-w-xs truncate">
                                                    {category.description}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    category.isActive 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {category.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-2">
                                                    <Button
                                                        onClick={() => handleEditCategory(category)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-indigo-600 hover:text-indigo-900 p-1"
                                                        title="Edit category"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </Button>
                                                    <Button
                                                        onClick={() => deleteCategoryHandler(category._id)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-900 p-1"
                                                        title="Delete category"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {categories.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No categories found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
                    </div>

                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Order ID
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Customer
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Total
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Items
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.map((order) => (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    #{order._id.slice(-8)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {order.user?.name || 'N/A'}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {order.user?.email || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {new Date(order.createdAt).toLocaleString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(order.totalPrice)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    order.status === 'Delivered'
                                                        ? 'bg-green-100 text-green-800'
                                                        : order.status === 'Shipped'
                                                        ? 'bg-blue-100 text-blue-800'
                                                        : order.status === 'Processing'
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {order.status === 'Delivered' ? (
                                                        <div className="flex items-center">
                                                            <CheckCircle className="h-4 w-4 mr-1" />
                                                            Delivered
                                                        </div>
                                                    ) : order.status === 'Shipped' ? (
                                                        <div className="flex items-center">
                                                            <Truck className="h-4 w-4 mr-1" />
                                                            Shipped
                                                        </div>
                                                    ) : order.status === 'Processing' ? (
                                                        <div className="flex items-center">
                                                            <Clock className="h-4 w-4 mr-1" />
                                                            Processing
                                                        </div>
                                                    ) : (
                                                        <div className="flex items-center">
                                                            <XCircle className="h-4 w-4 mr-1" />
                                                            Cancelled
                                                        </div>
                                                    )}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {order.orderItems?.length || 0} items
                                                </div>
                                                <Button
                                                    onClick={() => handleViewOrderItems(order)}
                                                    variant="link"
                                                    size="sm"
                                                    icon={Eye}
                                                    iconPosition="left"
                                                    className="text-xs"
                                                >
                                                    View Items
                                                </Button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="w-full">
                                                    {/* Status Chain */}
                                                    <div className="flex items-center justify-between mb-3">
                                                        {['Processing', 'Shipped', 'Delivered'].map((step, index) => {
                                                            const isCompleted = 
                                                                (order.status === 'Delivered' && (step === 'Processing' || step === 'Shipped' || step === 'Delivered')) ||
                                                                (order.status === 'Shipped' && (step === 'Processing' || step === 'Shipped')) ||
                                                                (order.status === 'Processing' && step === 'Processing');
                                                            
                                                            const isCurrent = order.status === step;
                                                            const isUpcoming = !isCompleted && !isCurrent;
                                                            
                                                            return (
                                                                <div key={step} className="flex items-center flex-1">
                                                                    <div className="flex flex-col items-center">
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                                                            isCompleted 
                                                                                ? 'bg-green-500 text-white' 
                                                                                : isCurrent 
                                                                                ? 'bg-blue-500 text-white' 
                                                                                : 'bg-gray-300 text-gray-600'
                                                                        }`}>
                                                                            {isCompleted ? '✓' : index + 1}
                                                                        </div>
                                                                        <span className={`text-xs mt-1 ${
                                                                            isCompleted 
                                                                                ? 'text-green-600 font-medium' 
                                                                                : isCurrent 
                                                                                ? 'text-blue-600 font-medium' 
                                                                                : 'text-gray-500'
                                                                        }`}>
                                                                            {step}
                                                                        </span>
                                                                    </div>
                                                                    {index < 2 && (
                                                                        <div className={`flex-1 h-1 mx-2 ${
                                                                            order.status === 'Delivered' || (order.status === 'Shipped' && index === 0)
                                                                                ? 'bg-green-500' 
                                                                                : 'bg-gray-300'
                                                                        }`} />
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                    
                                                    {/* Action Button */}
                                                    <div className="flex justify-center">
                                                        {order.status === 'Processing' && (
                                                            <Button
                                                                onClick={() => updateOrderStatus(order._id, 'Shipped')}
                                                                variant="outline"
                                                                size="sm"
                                                                icon={Truck}
                                                                iconPosition="left"
                                                                className="border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 text-xs"
                                                            >
                                                                Mark as Shipped
                                                            </Button>
                                                        )}
                                                        {order.status === 'Shipped' && (
                                                            <Button
                                                                onClick={() => updateOrderStatus(order._id, 'Delivered')}
                                                                variant="outline"
                                                                size="sm"
                                                                icon={CheckCircle}
                                                                iconPosition="left"
                                                                className="border-green-300 text-green-700 bg-green-50 hover:bg-green-100 text-xs"
                                                            >
                                                                Mark as Delivered
                                                            </Button>
                                                        )}
                                                        {order.status === 'Delivered' && (
                                                            <Button
                                                                onClick={() => updateOrderStatus(order._id, 'Processing')}
                                                                variant="outline"
                                                                size="sm"
                                                                icon={Clock}
                                                                iconPosition="left"
                                                                className="border-yellow-300 text-yellow-700 bg-yellow-50 hover:bg-yellow-100 text-xs"
                                                            >
                                                                Reset to Processing
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        
                        {orders.length === 0 && (
                            <div className="text-center py-8">
                                <p className="text-gray-500">No orders found</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Order Items Modal */}
            {showOrderItems && selectedOrder && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-gray-900">
                                Order Items - #{selectedOrder._id.slice(-8)}
                            </h3>
                            <Button
                                onClick={handleCloseOrderItems}
                                variant="ghost"
                                size="sm"
                                className="text-gray-400 hover:text-gray-600 p-1"
                            >
                                <X className="h-6 w-6" />
                            </Button>
                        </div>

                        <div className="mb-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="font-medium text-gray-700">Customer:</span>
                                    <p className="text-gray-900">{selectedOrder.user?.name || 'N/A'}</p>
                                    <p className="text-gray-500">{selectedOrder.user?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <span className="font-medium text-gray-700">Order Date:</span>
                                    <p className="text-gray-900">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                        selectedOrder.status === 'Delivered'
                                            ? 'bg-green-100 text-green-800'
                                            : selectedOrder.status === 'Shipped'
                                            ? 'bg-blue-100 text-blue-800'
                                            : selectedOrder.status === 'Processing'
                                            ? 'bg-yellow-100 text-yellow-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {selectedOrder.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-3">Items in this order:</h4>
                            <div className="space-y-3 max-h-96 overflow-y-auto">
                                {selectedOrder.orderItems?.map((item, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                                        <div className="flex items-center flex-1">
                                            <img
                                                src={item.image || 'https://via.placeholder.com/48'}
                                                alt={item.name}
                                                className="h-12 w-12 object-cover rounded-md mr-3"
                                            />
                                            <div className="flex-1">
                                                <h5 className="text-sm font-medium text-gray-900">{item.name}</h5>
                                                <p className="text-xs text-gray-500">Qty: {item.qty} × {formatCurrency(item.price)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatCurrency(item.qty * item.price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <h4 className="font-medium text-gray-900 mb-3">Order Summary:</h4>
                            <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Items ({selectedOrder.orderItems?.length || 0}):</span>
                                    <span className="font-medium">{formatCurrency(selectedOrder.itemsPrice || 0)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span className="font-medium">
                                        {selectedOrder.shippingPrice === 0 ? 'FREE' : formatCurrency(selectedOrder.shippingPrice || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">GST (18%):</span>
                                    <span className="font-medium">{formatCurrency(selectedOrder.taxPrice || 0)}</span>
                                </div>
                                {selectedOrder.coupon && selectedOrder.couponDiscount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-green-600">
                                            Discount ({selectedOrder.coupon.code}):
                                            {selectedOrder.coupon.discountType === 'PERCENTAGE' 
                                                ? ` ${selectedOrder.coupon.discountValue}% off`
                                                : ` ${formatCurrency(selectedOrder.coupon.discountValue)} off`
                                            }
                                        </span>
                                        <span className="font-medium text-green-600">-{formatCurrency(selectedOrder.couponDiscount)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-300">
                                    <span>Total:</span>
                                    <span>{formatCurrency(selectedOrder.totalPrice)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end mt-4 pt-4 border-t">
                            <Button
                                onClick={handleCloseOrderItems}
                                variant="primary"
                                size="sm"
                            >
                                Close
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Users Management</h1>
                    
                    <div className="bg-white shadow-lg rounded-lg">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-semibold text-gray-900">All Users</h2>
                                <div className="text-sm text-gray-500">
                                    Total: {users.length} users
                                </div>
                            </div>
                            
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                User
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Email
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Phone
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Joined
                                            </th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.map((user) => (
                                            <tr key={user._id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-10 w-10 flex-shrink-0">
                                                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                                <User className="h-5 w-5 text-indigo-600" />
                                                            </div>
                                                        </div>
                                                        <div className="ml-4">
                                                            <div className="text-sm font-medium text-gray-900">
                                                                {user.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">{user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {user.phone || 'Not provided'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900">
                                                        {new Date(user.createdAt).toLocaleString()}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Coupons Tab */}
            {activeTab === 'coupons' && (
                <DiscountCouponManager />
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>
                    
                    <div className="bg-white shadow-lg rounded-lg">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                                <Settings className="h-6 w-6 mr-2 text-indigo-600" />
                                Shipping Configuration
                            </h2>
                            
                            {shippingLoading ? (
                                <div className="text-center py-8">
                                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                    <p className="mt-2 text-gray-600">Loading shipping configuration...</p>
                                </div>
                            ) : (
                                <form onSubmit={(e) => {
                                    e.preventDefault();
                                    updateShippingConfig(shippingConfig);
                                }} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Standard Shipping Cost */}
                                        <div>
                                            <Input
                                                label="Standard Shipping Cost (₹)"
                                                type="number"
                                                min="0"
                                                value={shippingConfig.standardShippingCost}
                                                onChange={(e) => handleShippingConfigChange('standardShippingCost', e.target.value)}
                                                helperText="Cost for standard delivery"
                                            />
                                        </div>

                                        {/* Free Shipping Threshold */}
                                        <div>
                                            <Input
                                                label="Free Shipping Threshold (₹)"
                                                type="number"
                                                min="0"
                                                value={shippingConfig.freeShippingThreshold}
                                                onChange={(e) => handleShippingConfigChange('freeShippingThreshold', e.target.value)}
                                                helperText="Order amount for free shipping"
                                            />
                                        </div>

                                        {/* Express Shipping Cost */}
                                        <div>
                                            <Input
                                                label="Express Shipping Cost (₹)"
                                                type="number"
                                                min="0"
                                                value={shippingConfig.expressShippingCost}
                                                onChange={(e) => handleShippingConfigChange('expressShippingCost', e.target.value)}
                                                helperText="Cost for express delivery"
                                            />
                                        </div>

                                        {/* Tax Rate */}
                                        <div>
                                            <Input
                                                label="Tax Rate (GST %)"
                                                type="number"
                                                min="0"
                                                max="1"
                                                step="0.01"
                                                value={shippingConfig.taxRate * 100}
                                                onChange={(e) => handleShippingConfigChange('taxRate', e.target.value / 100)}
                                                helperText="Tax rate as percentage (e.g., 18 for 18%)"
                                            />
                                        </div>
                                    </div>

                                    {/* Toggle Switches */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">
                                                    Enable Free Shipping
                                                </label>
                                                <p className="text-xs text-gray-500">Allow free shipping for orders above threshold</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleShippingConfigChange('freeShippingEnabled', !shippingConfig.freeShippingEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    shippingConfig.freeShippingEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        shippingConfig.freeShippingEnabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div>
                                                <label className="text-sm font-medium text-gray-700">
                                                    Enable Express Shipping
                                                </label>
                                                <p className="text-xs text-gray-500">Offer express delivery option to customers</p>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleShippingConfigChange('expressShippingEnabled', !shippingConfig.expressShippingEnabled)}
                                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                                    shippingConfig.expressShippingEnabled ? 'bg-indigo-600' : 'bg-gray-200'
                                                }`}
                                            >
                                                <span
                                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                        shippingConfig.expressShippingEnabled ? 'translate-x-6' : 'translate-x-1'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Save Button */}
                                    <div className="flex justify-end">
                                        <Button
                                            type="submit"
                                            disabled={shippingSaving}
                                            loading={shippingSaving}
                                            variant="primary"
                                        >
                                            {shippingSaving ? 'Saving...' : 'Save Configuration'}
                                        </Button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
