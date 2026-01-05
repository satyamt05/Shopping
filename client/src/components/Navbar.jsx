import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { userInfo, isAuthenticated, logout } = useAuth();
    const { cartItems, clearCart } = useCart();
    const { success } = useToast();
    const navigate = useNavigate();
    const userMenuRef = useRef(null);

    // Calculate total items in cart
    const cartItemCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

    // Close user menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = () => {
        logout();
        setIsUserMenuOpen(false);
        success('Logged out successfully!');
        navigate('/');
    };

    return (
        <nav className="bg-white shadow-md fixed w-full z-50 top-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center">
                            <span className="font-bold text-xl text-indigo-600">QuickStyle</span>
                        </Link>
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 hover:text-indigo-600 transition">Home</Link>
                        <Link to="/shop" className="text-gray-700 hover:text-indigo-600 transition">Shop</Link>
                        <Link to="/cart" className="text-gray-700 hover:text-indigo-600 transition relative">
                            <ShoppingCart className="h-6 w-6" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount > 99 ? '99+' : cartItemCount}
                                </span>
                            )}
                        </Link>
                        {isAuthenticated ? (
                            <div className="relative" ref={userMenuRef}>
                                <button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    className="text-gray-700 hover:text-indigo-600 transition flex items-center"
                                >
                                    <User className="h-6 w-6" />
                                    <span className="ml-2 text-sm">{userInfo?.name}</span>
                                </button>
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                        {userInfo?.isAdmin && (
                                            <Link
                                                to="/admin"
                                                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <Link
                                            to="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <LogOut className="inline h-4 w-4 mr-2" />
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="text-gray-700 hover:text-indigo-600 transition">
                                <User className="h-6 w-6" />
                            </Link>
                        )}
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Home</Link>
                        <Link to="/shop" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Shop</Link>
                        <Link to="/cart" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">
                            Cart {cartItemCount > 0 && `(${cartItemCount})`}
                        </Link>
                        {isAuthenticated ? (
                            <>
                                <div className="px-3 py-2 text-base font-medium text-gray-700">
                                    Welcome, {userInfo?.name}
                                </div>
                                {userInfo?.isAdmin && (
                                    <Link to="/admin" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">
                                        Admin Dashboard
                                    </Link>
                                )}
                                <Link to="/profile" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">
                                    Profile
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50">Login</Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
