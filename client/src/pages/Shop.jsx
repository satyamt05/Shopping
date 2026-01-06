
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
    const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
    const [priceFilter, setPriceFilter] = useState({ min: 0, max: 1000 });
    const location = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const categoryParam = searchParams.get('category');
    const urlSearchParam = searchParams.get('search');
    const urlMinPrice = searchParams.get('minPrice');
    const urlMaxPrice = searchParams.get('maxPrice');

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

                // Calculate price range from filtered products
                if (filteredProducts.length > 0) {
                    const prices = filteredProducts.map(p => p.price);
                    const minPrice = Math.floor(Math.min(...prices));
                    const maxPrice = Math.ceil(Math.max(...prices));
                    setPriceRange({ min: minPrice, max: maxPrice });
                    
                    // Initialize price filter from URL or use full range
                    const min = urlMinPrice ? parseInt(urlMinPrice) : minPrice;
                    const max = urlMaxPrice ? parseInt(urlMaxPrice) : maxPrice;
                    setPriceFilter({ min, max });
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [categoryParam, urlMinPrice, urlMaxPrice]);

    // Initialize search query from URL
    useEffect(() => {
        if (urlSearchParam) {
            setSearchQuery(urlSearchParam);
        }
    }, [urlSearchParam]);

    // Apply search and price filter
    useEffect(() => {
        let filtered = products;

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase().trim();
            filtered = filtered.filter(product => 
                product.name.toLowerCase().includes(query) ||
                product.description.toLowerCase().includes(query) ||
                product.category.toLowerCase().includes(query) ||
                product.brand?.toLowerCase().includes(query)
            );
        }

        // Apply price filter
        filtered = filtered.filter(product => 
            product.price >= priceFilter.min && product.price <= priceFilter.max
        );

        setFilteredProducts(filtered);
    }, [products, searchQuery, priceFilter]);

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

    // Handle price filter changes
    const handlePriceFilterChange = (type, value) => {
        const newPriceFilter = { ...priceFilter, [type]: value };
        setPriceFilter(newPriceFilter);
        
        // Update URL params
        const newParams = new URLSearchParams(searchParams);
        if (type === 'min') {
            if (value > priceRange.min) {
                newParams.set('minPrice', value);
            } else {
                newParams.delete('minPrice');
            }
        } else {
            if (value < priceRange.max) {
                newParams.set('maxPrice', value);
            } else {
                newParams.delete('maxPrice');
            }
        }
        setSearchParams(newParams);
    };

    const clearPriceFilter = () => {
        setPriceFilter({ min: priceRange.min, max: priceRange.max });
        const newParams = new URLSearchParams(searchParams);
        newParams.delete('minPrice');
        newParams.delete('maxPrice');
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
                        
                        {/* Search and Filter Section */}
                        <div className="flex flex-col lg:flex-row gap-6 mb-6">
                            {/* Search Bar */}
                            <div className="relative flex-1 max-w-md">
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

                            {/* Price Filter */}
                            <div className="bg-white p-4 rounded-lg border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-medium text-gray-900">Price Range</h3>
                                    {(priceFilter.min !== priceRange.min || priceFilter.max !== priceRange.max) && (
                                        <button
                                            onClick={clearPriceFilter}
                                            className="text-xs text-indigo-600 hover:text-indigo-800"
                                        >
                                            Clear
                                        </button>
                                    )}
                                </div>
                                
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs text-gray-600">Min: ₹{priceFilter.min}</label>
                                        <input
                                            type="range"
                                            min={priceRange.min}
                                            max={priceRange.max}
                                            value={priceFilter.min}
                                            onChange={(e) => handlePriceFilterChange('min', parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs text-gray-600">Max: ₹{priceFilter.max}</label>
                                        <input
                                            type="range"
                                            min={priceRange.min}
                                            max={priceRange.max}
                                            value={priceFilter.max}
                                            onChange={(e) => handlePriceFilterChange('max', parseInt(e.target.value))}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                                        />
                                    </div>
                                    <div className="text-xs text-gray-500 text-center">
                                        Range: ₹{priceFilter.min} - ₹{priceFilter.max}
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Search Results Count */}
                        {(searchQuery.trim() || priceFilter.min !== priceRange.min || priceFilter.max !== priceRange.max) && (
                            <p className="text-sm text-gray-600">
                                Found {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
                                {searchQuery.trim() && ` for "${searchQuery}"`}
                                {(priceFilter.min !== priceRange.min || priceFilter.max !== priceRange.max) && 
                                    ` in price range ₹${priceFilter.min} - ₹${priceFilter.max}`
                                }
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
                                ? `No products found for "${searchQuery}"${(priceFilter.min !== priceRange.min || priceFilter.max !== priceRange.max) ? ` in this price range.` : '.'}` 
                                : (priceFilter.min !== priceRange.min || priceFilter.max !== priceRange.max)
                                    ? `No products found in price range ₹${priceFilter.min} - ₹${priceFilter.max}.`
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
