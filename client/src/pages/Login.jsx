
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from '../utils/api';
import { User, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [googleProcessed, setGoogleProcessed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { login, isLoading, isAuthenticated } = useAuth();
    const { success, error: toastError } = useToast();

    const redirect = new URLSearchParams(location.search).get('redirect') || '/';
    
    // Ensure redirect path starts with '/' to avoid relative path issues
    const safeRedirect = redirect.startsWith('/') ? redirect : `/${redirect}`;

    // Handle Google OAuth callback
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');
        const userParam = urlParams.get('user');
        
        if (token && userParam) {
            // Check if we've already processed this Google login
            const processedKey = `google_oauth_processed_${token.slice(-10)}`;
            if (sessionStorage.getItem(processedKey)) {
                return; // Already processed, skip
            }
            
            // Mark as processed
            sessionStorage.setItem(processedKey, 'true');
            
            try {
                const user = JSON.parse(decodeURIComponent(userParam));
                login(user, token);
                success('Logged in successfully with Google!');
                
                // Get the redirect URL from sessionStorage (stored before Google OAuth)
                const storedRedirect = sessionStorage.getItem('google_oauth_redirect');
                const finalRedirect = storedRedirect || safeRedirect;
                
                // Clean up sessionStorage
                sessionStorage.removeItem('google_oauth_redirect');
                
                navigate(finalRedirect);
            } catch (error) {
                console.error('Error parsing user data:', error);
                setError('Failed to login with Google');
            }
        }
    }, [location.search, login, success, safeRedirect]); // Remove navigate from dependencies

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate(safeRedirect);
        }
    }, [isLoading, isAuthenticated, safeRedirect]); // Remove navigate from dependencies

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

    const submitHandler = async (e) => {
        e.preventDefault();
        try {
            const { data } = await axios.post('/auth/login', { email, password });
            login(data, data.token);
            success('Login successful!');
            navigate(safeRedirect);
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Invalid email or password';
            setError(errorMessage);
            toastError(errorMessage);
        }
    };

    const googleLoginHandler = () => {
        // Store the redirect URL in sessionStorage before navigating to Google OAuth
        sessionStorage.setItem('google_oauth_redirect', safeRedirect);
        window.location.href = 'https://shopping-ivig.onrender.com/api/auth/google';
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                            create a new account
                        </Link>
                    </p>
                </div>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="space-y-4">
                        <Input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={User}
                            iconPosition="left"
                            label="Email address"
                        />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={Lock}
                            iconPosition="left"
                            label="Password"
                        />
                    </div>

                    <div>
                        <Button 
                            type="submit" 
                            variant="primary" 
                            size="md"
                            className="w-full"
                            loading={isLoading}
                        >
                            Sign in
                        </Button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button
                            onClick={googleLoginHandler}
                            variant="secondary"
                            size="md"
                            className="w-full rounded-full bg-gray-100 hover:bg-gray-200 border border-gray-200"
                        >
                            {/* Correct Google G Logo */}
                            <svg
                                className="w-5 h-5"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 533.5 544.3"
                            >
                                <path fill="#4285F4" d="M533.5 278.4c0-18.5-1.5-37.1-4.7-55.3H272v105h147.5c-6.3 33.7-25.6 62.3-54.5 81.6v67h88c51.6-47.5 80.5-117.5 80.5-198.3z"/>
                                <path fill="#34A853" d="M272 544.3c73.6 0 135.3-24.3 180.4-66.6l-88-67c-24.4 16.4-55.6 26-92.4 26-71 0-131-47.9-152.5-112.3h-91v70.6C73.8 486.5 165 544.3 272 544.3z"/>
                                <path fill="#FBBC05" d="M119.5 324.4c-4.5-13.7-7-28.3-7-43.4s2.5-29.7 7-43.4v-70.6h-91C10 199.4 0 239 0 281s10 81.6 28.5 113.9l91-70.5z"/>
                                <path fill="#EA4335" d="M272 107.7c39.9 0 75.8 13.7 104 40.7l78-78C407.2 26.9 345.6 0 272 0 165 0 73.8 57.9 28.5 168.1l91 70.6C141 155.6 201 107.7 272 107.7z"/>
                            </svg>

                            <span className="text-sm font-medium text-gray-700">
                                Log in with Google
                            </span>
                        </Button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;
