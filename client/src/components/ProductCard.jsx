
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../utils/currency';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const ProductCard = ({ product }) => {
    const { addToCart, cartItems } = useCart();
    const { success } = useToast();

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
        success(`${product.name} added to cart!`);
    };

    const isInCart = cartItems.some(item => item._id === product._id);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
            <Link to={`/product/${product._id}`}>
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-48 object-cover object-center"
                />
            </Link>
            <div className="p-4">
                <Link to={`/product/${product._id}`}>
                    <h2 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 truncate">{product.name}</h2>
                </Link>
                <div className="flex items-center mt-2 mb-2">
                    <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`h-4 w-4 ${i < product.rating ? 'fill-current' : 'text-gray-300'}`} />
                        ))}
                    </div>
                    <span className="text-gray-500 text-sm ml-2">({product.numReviews} reviews)</span>
                </div>
                <div className="flex justify-between items-center mt-3">
                    <span className="text-xl font-bold text-gray-900">{formatCurrency(product.price)}</span>
                    {!isInCart && (
                        <button 
                            onClick={handleAddToCart}
                            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
                        >
                            <ShoppingCart className="h-5 w-5" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
