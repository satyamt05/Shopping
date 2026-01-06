
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from '../utils/api';
import { Star, ArrowLeft, ShoppingCart, Truck, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { formatCurrency, fetchShippingConfig } from '../utils/currency';
import Button from '../components/ui/Button';
import Dropdown from '../components/ui/Dropdown';

const ProductDetails = () => {
    const { id } = useParams();
    const [product, setProduct] = useState({});
    const [loading, setLoading] = useState(true);
    const [qty, setQty] = useState(1);
    const [shippingConfig, setShippingConfig] = useState({
        FREE_SHIPPING_THRESHOLD: 500
    });
    const { addToCart } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            try {
                const { data } = await axios.get(`/products/${id}`);
                setProduct(data);
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        const fetchConfig = async () => {
            try {
                const config = await fetchShippingConfig();
                setShippingConfig(config);
            } catch (error) {
                console.error('Error fetching shipping config:', error);
            }
        };

        fetchProduct();
        fetchConfig();
    }, [id]);

    const addToCartHandler = () => {
        addToCart(product, qty);
        navigate('/cart');
    };

    if (loading) return <div className="flex justify-center items-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
    if (!product.name) return <div className="text-center text-red-500 mt-10">Product not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Link to="/shop" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-6">
                <ArrowLeft className="h-5 w-5 mr-1" /> Back to Shop
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Product Image */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>

                {/* Product Info */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                    <p className="text-sm text-gray-500 mb-4 uppercase tracking-wide">{product.brand} | {product.category}</p>

                    <div className="flex items-center mb-6">
                        <div className="flex text-yellow-500 mr-2">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-5 w-5 ${i < product.rating ? 'fill-current' : 'text-gray-300'}`} />
                            ))}
                        </div>
                        <span className="text-gray-600">({product.numReviews} reviews)</span>
                    </div>

                    <p className="text-4xl font-bold text-gray-900 mb-6">{formatCurrency(product.price)}</p>

                    <div className="bg-gray-50 rounded-lg p-6 mb-8">
                        <p className="text-gray-700 leading-relaxed mb-4">{product.description}</p>
                        <div className="flex space-x-6 text-sm text-gray-600">
                            <div className="flex items-center"><Truck className="h-5 w-5 mr-2 text-indigo-600" /> Free Shipping over {formatCurrency(shippingConfig.FREE_SHIPPING_THRESHOLD)}</div>
                            <div className="flex items-center"><ShieldCheck className="h-5 w-5 mr-2 text-indigo-600" /> 1 Year Warranty</div>
                        </div>
                    </div>

                    <div className="border-t border-gray-200 pt-6">
                        <div className="flex items-center mb-6">
                            <label htmlFor="qty" className="mr-4 font-medium text-gray-700">Quantity:</label>
                            <Dropdown
                                id="qty"
                                value={qty}
                                onChange={(value) => setQty(Number(value))}
                                options={[...Array(product.countInStock).keys()].map((x) => ({
                                    value: x + 1,
                                    label: `${x + 1}`
                                }))}
                                className="w-24"
                            />
                        </div>

                        <Button
                            onClick={addToCartHandler}
                            disabled={product.countInStock === 0}
                            variant={product.countInStock > 0 ? 'primary' : 'secondary'}
                            size="lg"
                            icon={ShoppingCart}
                            iconPosition="right"
                            className="w-full"
                        >
                            {product.countInStock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;
