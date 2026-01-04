
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch both products and categories
                const [productsResponse, categoriesResponse] = await Promise.all([
                    api.get('/products'),
                    api.get('/categories')
                ]);

                const allProducts = productsResponse.data;
                const activeCategories = categoriesResponse.data;
                setCategories(activeCategories);

                // Get active category names
                const activeCategoryNames = new Set(activeCategories.map(cat => cat.name));

                // Filter products to only include those with active categories
                let filteredProducts = allProducts.filter(product => 
                    activeCategoryNames.has(product.category)
                );

                // If category param is specified, further filter by that category
                if (categoryParam) {
                    filteredProducts = filteredProducts.filter(product => 
                        product.category === categoryParam
                    );
                }

                setProducts(filteredProducts);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryParam]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Check if requested category exists */}
            {categoryParam && categories.length > 0 && !categories.some(cat => cat.name === categoryParam) ? (
                <div className="text-center py-16">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Category Not Found</h1>
                    <p className="text-gray-600 mb-8">The category "{categoryParam}" is no longer available.</p>
                    <a 
                        href="/shop" 
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Browse All Products
                    </a>
                </div>
            ) : (
                <>
                    <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">
                        {categoryParam ? `${categoryParam}'s Collection` : 'All Products'}
                    </h1>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center text-gray-500 text-xl mt-10">
                            {categoryParam ? `No products found in ${categoryParam} category.` : 'No products found.'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product._id} product={product} />
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Shop;
