import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Package, Truck, CheckCircle, Clock, XCircle, Download, Eye, Search, Filter } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { downloadInvoicePDF } from '../utils/invoice';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Dropdown from '../components/ui/Dropdown';

const OrderHistory = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const { isAuthenticated, isLoading } = useAuth();
    const { success, error: toastError } = useToast();
    const navigate = useNavigate();

    // Effects must be declared before any returns to keep hook order consistent
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            navigate('/login');
        }
    }, [isLoading, isAuthenticated, navigate]);

    // Redirect if not authenticated
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

    if (!isAuthenticated) {
        return null;
    }

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const { data } = await axios.get('/orders/myorders');
                setOrders(data);
            } catch (err) {
                console.error('Error fetching orders:', err);
                toastError('Failed to load order history');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Processing':
                return 'bg-yellow-100 text-yellow-800';
            case 'Shipped':
                return 'bg-blue-100 text-blue-800';
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Processing':
                return <Clock className="h-4 w-4" />;
            case 'Shipped':
                return <Truck className="h-4 w-4" />;
            case 'Delivered':
                return <CheckCircle className="h-4 w-4" />;
            case 'Cancelled':
                return <XCircle className="h-4 w-4" />;
            default:
                return <Package className="h-4 w-4" />;
        }
    };

    const handleDownloadInvoice = (order) => {
        try {
            downloadInvoicePDF(order);
            success('Invoice downloaded successfully!');
        } catch (error) {
            error('Failed to download invoice');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch = order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            order.orderItems.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">Loading order history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Order History</h1>
                <p className="text-gray-600">Track and manage all your orders</p>
            </div>

            {/* Filters */}
            <div className="bg-white shadow rounded-lg p-4 mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                        <Input
                            type="text"
                            placeholder="Search by order ID or product name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            icon={Search}
                            iconPosition="left"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Filter className="h-5 w-5 text-gray-400" />
                        <Dropdown
                            value={statusFilter}
                            onChange={(value) => setStatusFilter(value)}
                            options={[
                                { value: 'all', label: 'All Orders' },
                                { value: 'Processing', label: 'Processing' },
                                { value: 'Shipped', label: 'Shipped' },
                                { value: 'Delivered', label: 'Delivered' },
                                { value: 'Cancelled', label: 'Cancelled' }
                            ]}
                            className="min-w-[150px]"
                        />
                    </div>
                </div>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="bg-white shadow rounded-lg p-8 text-center">
                    <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
                    <p className="text-gray-500 mb-4">
                        {searchTerm || statusFilter !== 'all' 
                            ? 'Try adjusting your filters or search terms' 
                            : 'You haven\'t placed any orders yet'}
                    </p>
                    {!searchTerm && statusFilter === 'all' && (
                        <Button
                            onClick={() => navigate('/shop')}
                            variant="primary"
                        >
                            Start Shopping
                        </Button>
                    )}
                </div>
            ) : (
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <div key={order._id} className="bg-white shadow rounded-lg overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gray-50 px-6 py-4 border-b">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                    <div className="mb-2 md:mb-0">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Order #{order._id.substring(order._id.length - 8).toUpperCase()}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')} • 
                                            {order.orderItems.length} items • 
                                            {formatCurrency(order.totalPrice)}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                                            {getStatusIcon(order.status)}
                                            <span className="ml-1">{order.status}</span>
                                        </span>
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            order.isPaid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                        }`}>
                                            {order.isPaid ? 'Paid' : 'Payment Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="p-6">
                                <div className="space-y-4">
                                    {order.orderItems.map((item) => (
                                        <div key={item.product} className="flex items-center justify-between">
                                            <div className="flex items-center">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="h-16 w-16 object-cover rounded-md mr-4"
                                                />
                                                <div>
                                                    <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                                    <p className="text-sm text-gray-500">Qty: {item.qty}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {formatCurrency(item.qty * item.price)}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {formatCurrency(item.price)} each
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Order Actions */}
                                <div className="mt-6 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                    <div className="mb-4 sm:mb-0">
                                        <p className="text-sm text-gray-600">
                                            <strong>Shipping Address:</strong> {order.shippingAddress.street}, {order.shippingAddress.city}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <strong>Payment Method:</strong> {order.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
                                        </p>
                                    </div>
                                    <div className="flex space-x-3">
                                        <Button
                                            onClick={() => navigate(`/order/${order._id}`)}
                                            variant="outline"
                                            size="sm"
                                            icon={Eye}
                                            iconPosition="left"
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            onClick={() => handleDownloadInvoice(order)}
                                            variant="outline"
                                            size="sm"
                                            icon={Download}
                                            iconPosition="left"
                                        >
                                            Invoice
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistory;
