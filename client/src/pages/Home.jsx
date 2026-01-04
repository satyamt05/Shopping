
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight, Sparkles, TrendingUp, Heart, Star, Shield, Truck } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const Home = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.3,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }
    };

    const heroImageVariants = {
        hidden: { scale: 1.1, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                duration: 1.2,
                ease: "easeOut"
            }
        }
    };

    const categoryVariants = {
        hidden: { scale: 0.8, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 150,
                damping: 10
            }
        },
        hover: {
            scale: 1.05,
            transition: {
                duration: 0.3
            }
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const { data } = await api.get('/categories');
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback to hardcoded categories if API fails
            setCategories([
                { _id: '1', name: 'Men', description: 'Sophisticated styles for the modern man', image: 'https://images.unsplash.com/photo-1527010154944-bff4f4ce30ba?w=800&h=600&fit=crop&crop=faces&auto=format' },
                { _id: '2', name: 'Women', description: 'Elegant and trendy collections', image: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=800&h=600&fit=crop&crop=faces&auto=format' }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <motion.div 
                className="relative bg-gradient-to-br from-gray-900 via-indigo-900 to-gray-900 overflow-hidden"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>
                </div>
                
                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div variants={itemVariants}>
                            <motion.div 
                                className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-500 bg-opacity-20 border border-indigo-400 mb-6"
                                whileHover={{ scale: 1.05 }}
                            >
                                <Sparkles className="h-4 w-4 text-indigo-300 mr-2" />
                                <span className="text-indigo-300 text-sm font-medium">New Collection 2024</span>
                            </motion.div>
                            
                            <motion.h1 
                                className="text-5xl lg:text-6xl font-bold text-white mb-6"
                                variants={itemVariants}
                            >
                                <span className="block">Premium Fashion</span>
                                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">For Everyone</span>
                            </motion.h1>
                            
                            <motion.p 
                                className="text-xl text-gray-300 mb-8 leading-relaxed"
                                variants={itemVariants}
                            >
                                Discover the latest trends in men's, women's, and kids' fashion. High-quality materials, sustainable practices, and designs that stand out.
                            </motion.p>
                            
                            <motion.div 
                                className="flex flex-col sm:flex-row gap-4"
                                variants={itemVariants}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Link to="/shop" className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg">
                                        Shop Now <ShoppingBag className="ml-2 h-5 w-5" />
                                    </Link>
                                </motion.div>
                                
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                                >
                                    <Link to="/shop" className="inline-flex items-center px-8 py-4 bg-white bg-opacity-10 backdrop-blur-sm text-white font-semibold rounded-lg border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                                        View Collection <ArrowRight className="ml-2 h-5 w-5" />
                                    </Link>
                                </motion.div>
                            </motion.div>
                        </motion.div>
                        
                        <motion.div 
                            className="relative"
                            variants={heroImageVariants}
                        >
                            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                                <img
                                    className="w-full h-96 object-cover"
                                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80"
                                    alt="Fashion model"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-30"></div>
                            </div>
                            
                            {/* Floating badges */}
                            <motion.div 
                                className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg"
                                animate={{ y: [0, -10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            >
                                <Star className="h-6 w-6 text-yellow-500 fill-current" />
                            </motion.div>
                            
                            <motion.div 
                                className="absolute -bottom-4 -left-4 bg-indigo-600 text-white rounded-full px-4 py-2 shadow-lg"
                                animate={{ y: [0, 10, 0] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                            >
                                <span className="text-sm font-bold">NEW</span>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Categories Section */}
            <motion.section 
                className="py-12 bg-gradient-to-b from-gray-50 to-white"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        className="text-center mb-4"
                        variants={itemVariants}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Category</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Explore our curated collections for every style and occasion</p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {loading ? (
                            // Loading skeleton
                            Array.from({ length: 3 }).map((_, index) => (
                                <div key={index} className="animate-pulse">
                                    <div className="bg-gray-300 rounded-2xl h-64 mb-4"></div>
                                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                                    <div className="h-3 bg-gray-300 rounded"></div>
                                </div>
                            ))
                        ) : (
                            categories.map((category, index) => (
                                <motion.div
                                    key={category._id}
                                    variants={categoryVariants}
                                    custom={index}
                                >
                                    <Link to={`/shop?category=${category.name}`} className="group block">
                                        <div className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500">
                                            <div className="aspect-w-16 aspect-h-12">
                                                <img 
                                                    src={category.image} 
                                                    alt={category.name} 
                                                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700" 
                                                />
                                            </div>
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-80 group-hover:opacity-70 transition-opacity duration-300"></div>
                                            
                                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                                <motion.div 
                                                    className="transform transition-transform duration-300 group-hover:translate-y-[-4px]"
                                                >
                                                    <h3 className="text-3xl font-bold text-white mb-2">{category.name}</h3>
                                                    <p className="text-gray-200 text-sm">{category.description}</p>
                                                    <div className="mt-4 flex items-center text-white font-medium">
                                                        <span>Shop Now</span>
                                                        <ArrowRight className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                                                    </div>
                                                </motion.div>
                                            </div>
                                        </div>
                                    </Link>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </motion.section>

            {/* Features Section */}
            <motion.section 
                className="py-12 bg-gradient-to-b from-white to-gray-50"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div 
                        className="text-center mb-4"
                        variants={itemVariants}
                    >
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Us</h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience shopping that combines quality, style, and sustainability</p>
                    </motion.div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Sparkles, title: "Premium Quality", description: "Handpicked materials and exceptional craftsmanship" },
                            { icon: TrendingUp, title: "Latest Trends", description: "Stay ahead with our curated collections" },
                            { icon: Heart, title: "Sustainable Fashion", description: "Eco-friendly choices for conscious shoppers" },
                            { icon: Truck, title: "Fast Delivery", description: "Quick and reliable shipping worldwide" }
                        ].map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                className="text-center group"
                                variants={itemVariants}
                                custom={index}
                            >
                                <motion.div
                                    className="flex justify-center mb-6"
                                    whileHover={{ rotate: 360, scale: 1.1 }}
                                    transition={{ duration: 0.6 }}
                                >
                                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                        <feature.icon className="h-8 w-8 text-white" />
                                    </div>
                                </motion.div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>

            {/* Stats Section */}
            <motion.section 
                className="py-12 bg-gradient-to-r from-indigo-600 to-purple-600"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={containerVariants}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                        {[
                            { number: "10K+", label: "Happy Customers" },
                            { number: "500+", label: "Products" },
                            { number: "50+", label: "Brands" },
                            { number: "99%", label: "Satisfaction" }
                        ].map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                className="text-white"
                                variants={itemVariants}
                                custom={index}
                            >
                                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                                <div className="text-indigo-200">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default Home;
