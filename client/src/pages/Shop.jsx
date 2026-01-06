
import React, { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Search, X } from 'lucide-react';

const Shop = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const urlSearchParam = searchParams.get('search');

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

    // Initialize search query from URL
    useEffect(() => {
        if (urlSearchParam) {
            setSearchQuery(urlSearchParam);
        }
    }, [urlSearchParam]);

    // Apply search filter
    useEffect(() => {
        let filtered = products;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = products.filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query) ||
                product.brand?.toLowerCase().includes(query)
            );
        }

        setFilteredProducts(filtered);
    }, [products, searchQuery]);

    // Update URL when search changes
    const handleSearchChange = (value) => {
        setSearchQuery(value);
        
        // Update URL params
        const newParams = new URLSearchParams(searchParams);
        if (value.trim()) {
            newParams.set('search', value);
        } else {
            newParams.delete('search');
        }
        setSearchParams(newParams);
    };

    const clearSearch = () => {
        setSearchQuery('');
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('search');
        setSearchParams(newParams);
    };

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
                    {/* Header with Search */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-6 capitalize">
                            {categoryParam ? `${categoryParam}'s Collection` : 'All Products'}
                        </h1>
                        
                        {/* Search Bar */}
                        <div className="relative max-w-md">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder="Search products..."
                                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
                            />
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                                </button>
                            )}
                        </div>
                        
                        {/* Search Results Count */}
                        {searchQuery.trim() && (
                            <p className="mt-2 text-sm text-gray-600">
                                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
                            </p>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="text-center text-gray-500 text-xl mt-10">
                            {searchQuery.trim() 
                                ? `No products found for "${searchQuery}".` 
                                : categoryParam 
                                    ? `No products found in ${categoryParam} category.` 
                                    : 'No products found.'
                            }
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {filteredProducts.map((product) => (
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
