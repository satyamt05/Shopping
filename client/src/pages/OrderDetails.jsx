import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ArrowLeft, Package, Truck, DollarSign, CheckCircle, Download } from 'lucide-react';
import { formatCurrency } from '../utils/currency';
import { downloadInvoicePDF } from '../utils/invoice';

const OrderDetails = () => {
    const { id } = useParams();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const { isAuthenticated, isLoading } = useAuth();
    const { success, error } = useToast();
    const navigate = useNavigate();

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
        navigate('/login');
        return null;
    }

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await axios.get(`/api/orders/${id}`);
                setOrder(data);
            } catch (error) {
                console.error('Error fetching order:', error);
                error('Order not found');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id, navigate]);

    const handleDownloadInvoice = () => {
        try {
            downloadInvoicePDF(order);
            success('Invoice downloaded successfully!');
        } catch (error) {
            error('Failed to download invoice');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <p className="mt-2 text-gray-600">Loading order details...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-500">Order not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Success Header */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
                <div className="flex items-center">
                    <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                        <h1 className="text-2xl font-bold text-green-900">Order Placed Successfully!</h1>
                        <p className="text-green-700">Thank you for your order. We'll send you updates on your order status.</p>
                    </div>
                </div>
            </div>

            {/* Order Info */}
            <div className="bg-white shadow-lg rounded-lg p-6 mb-6">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900">Order #{order._id.substring(order._id.length - 8).toUpperCase()}</h2>
                        <p className="text-gray-600">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                            order.isPaid 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                        }`}>
                            {order.isPaid ? 'Paid' : 'Pending Payment'}
                        </span>
                    </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
                    <div className="space-y-4">
                        {order.orderItems.map((item) => (
                            <div key={item.product} className="flex items-center justify-between border-b pb-4">
                                <div className="flex items-center">
                                    <img 
                                        src={item.image} 
                                        alt={item.name} 
                                        className="h-16 w-16 object-cover rounded-md mr-4"
                                    />
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                        <p className="text-sm text-gray-500">Qty: {item.qty} × {formatCurrency(item.price)}</p>
                                    </div>
                                </div>
                                <p className="text-sm font-medium text-gray-900">{formatCurrency(item.qty * item.price)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                        <p className="text-sm text-gray-900">{order.shippingAddress.street}</p>
                        <p className="text-sm text-gray-900">
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                        </p>
                        <p className="text-sm text-gray-900">{order.shippingAddress.country}</p>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="mb-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
                    <div className="flex items-center">
                        {order.paymentMethod === 'COD' ? (
                            <>
                                <DollarSign className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">Cash on Delivery</span>
                            </>
                        ) : (
                            <>
                                <Package className="h-5 w-5 text-gray-400 mr-2" />
                                <span className="text-sm text-gray-900">Credit/Debit Card</span>
                            </>
                        )}
                    </div>
                    {order.paymentMethod === 'COD' && (
                        <p className="text-sm text-gray-500 mt-2">Pay when you receive your order</p>
                    )}
                </div>

                {/* Price Summary */}
                <div className="border-t pt-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Items</span>
                            <span className="font-medium">{formatCurrency(order.itemsPrice)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-medium">
                                {order.shippingPrice === 0 ? 'FREE' : formatCurrency(order.shippingPrice)}
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">GST</span>
                            <span className="font-medium">{formatCurrency(order.taxPrice)}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                            <span>Total</span>
                            <span>{formatCurrency(order.totalPrice)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
                <button
                    onClick={() => navigate('/')}
                    className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition"
                >
                    Continue Shopping
                </button>
                <button
                    onClick={() => navigate('/profile')}
                    className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-md font-medium hover:bg-gray-300 transition"
                >
                    View Profile
                </button>
                <button
                    onClick={handleDownloadInvoice}
                    className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md font-medium hover:bg-green-700 transition flex items-center justify-center"
                >
                    <Download className="h-4 w-4 mr-2" />
                    Download Invoice
                </button>
            </div>
        </div>
    );
};

export default OrderDetails;
