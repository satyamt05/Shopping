import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, User, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';
import Button from './ui/Button';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { userInfo, isAuthenticated, logout } = useAuth();
    const { cartItems, clearCart } = useCart();
    const { wishlistItems } = useWishlist();
    const { success } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const userMenuRef = useRef(null);

    // Calculate total unique items in cart (not total quantity)
    const cartItemCount = cartItems.length;

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
                        <Link to="/" className={`transition ${location.pathname === '/' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}>Home</Link>
                        <Link to="/shop" className={`transition ${location.pathname === '/shop' ? 'text-indigo-600 font-semibold' : 'text-gray-700 hover:text-indigo-600'}`}>Shop</Link>
                        <Link to="/cart" className={`text-gray-700 hover:text-indigo-600 transition relative ${location.pathname === '/cart' ? 'text-indigo-600' : ''}`}>
                            <ShoppingCart className="h-6 w-6" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                                    {cartItemCount > 99 ? '99+' : cartItemCount}
                                </span>
                            )}
                        </Link>
                        {isAuthenticated && (
                            <Link to="/wishlist" className={`transition ${location.pathname === '/wishlist' ? 'text-indigo-600' : 'text-gray-700 hover:text-indigo-600'}`}>
                                <Heart className="h-6 w-6" />
                            </Link>
                        )}
                        {isAuthenticated ? (
                            <div className="relative" ref={userMenuRef}>
                                <Button
                                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                    variant="ghost"
                                    className="text-gray-700 hover:text-indigo-600 flex items-center"
                                >
                                    <User className="h-6 w-6" />
                                    <span className="ml-2 text-sm">{userInfo?.name}</span>
                                </Button>
                                {isUserMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                                        {userInfo?.isAdmin && (
                                            <Link
                                                to="/admin"
                                                className={`block px-4 py-2 text-sm hover:bg-gray-100 ${location.pathname === '/admin' ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                                                onClick={() => setIsUserMenuOpen(false)}
                                            >
                                                Admin Dashboard
                                            </Link>
                                        )}
                                        <Link
                                            to="/profile"
                                            className={`block px-4 py-2 text-sm hover:bg-gray-100 ${location.pathname === '/profile' ? 'text-indigo-600 font-medium' : 'text-gray-700'}`}
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            Profile
                                        </Link>
                                        <Button
                                            onClick={handleLogout}
                                            variant="ghost"
                                            size="sm"
                                            icon={LogOut}
                                            iconPosition="left"
                                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-none"
                                        >
                                            Logout
                                        </Button>
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
                        <Button
                            onClick={() => setIsOpen(!isOpen)}
                            variant="ghost"
                            size="sm"
                            className="p-2 text-gray-400 hover:text-gray-500"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-white">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium transition ${location.pathname === '/' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}>Home</Link>
                        <Link to="/shop" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium transition ${location.pathname === '/shop' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}>Shop</Link>
                        <Link to="/cart" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium transition ${location.pathname === '/cart' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}>
                            Cart {cartItemCount > 0 && `(${cartItemCount})`}
                        </Link>
                        {isAuthenticated && (
                            <Link to="/wishlist" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium transition ${location.pathname === '/wishlist' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}>
                                Wishlist
                            </Link>
                        )}
                        {isAuthenticated ? (
                            <>
                                <div className="px-3 py-2 text-base font-medium text-gray-700">
                                    Welcome, {userInfo?.name}
                                </div>
                                {userInfo?.isAdmin && (
                                    <Link to="/admin" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium transition ${location.pathname === '/admin' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}>
                                        Admin Dashboard
                                    </Link>
                                )}
                                <Link to="/profile" onClick={() => setIsOpen(false)} className={`block px-3 py-2 rounded-md text-base font-medium transition ${location.pathname === '/profile' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:text-indigo-600 hover:bg-gray-50'}`}>
                                    Profile
                                </Link>
                                <Button
                                    onClick={() => {
                                        handleLogout();
                                        setIsOpen(false);
                                    }}
                                    variant="ghost"
                                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
                                >
                                    Logout
                                </Button>
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
