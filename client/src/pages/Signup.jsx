import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../utils/api';
import { User, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [googleProcessed, setGoogleProcessed] = useState(false);
    const navigate = useNavigate();
    const { login, isLoading, isAuthenticated } = useAuth();
    const { success, error: toastError } = useToast();

    // Handle Google OAuth callback
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
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
                success('Account created and logged in successfully with Google!');
                navigate('/');
            } catch (error) {
                console.error('Error parsing user data:', error);
                setError('Failed to create account with Google');
            }
        }
    }, [login, success, googleProcessed]); // Remove navigate from dependencies

    // Redirect if already authenticated
    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            navigate('/');
        }
    }, [isLoading, isAuthenticated]); // Remove navigate from dependencies

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
        setError('');

        if (password !== confirmPassword) {
            const errorMessage = 'Passwords do not match';
            setError(errorMessage);
            toastError(errorMessage);
            return;
        }

        if (password.length < 6) {
            const errorMessage = 'Password must be at least 6 characters long';
            setError(errorMessage);
            toastError(errorMessage);
            return;
        }

        try {
            const { data } = await axios.post('/auth/register', { name, email, password });
            login(data, data.token);
            success('Account created successfully!');
            navigate('/');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Error creating account';
            setError(errorMessage);
            toastError(errorMessage);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Or{' '}
                        <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                            sign in to your existing account
                        </Link>
                    </p>
                </div>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>}
                <form className="mt-8 space-y-6" onSubmit={submitHandler}>
                    <input type="hidden" name="remember" value="true" />
                    <div className="space-y-4">
                        <Input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            placeholder="Full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            icon={User}
                            iconPosition="left"
                            label="Full name"
                        />
                        <Input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={Mail}
                            iconPosition="left"
                            label="Email address"
                        />
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            placeholder="Password (min 6 characters)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            icon={Lock}
                            iconPosition="left"
                            label="Password"
                            minLength="6"
                        />
                        <Input
                            id="confirm-password"
                            name="confirm-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            placeholder="Confirm password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            icon={Lock}
                            iconPosition="left"
                            label="Confirm password"
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
                            Create account
                        </Button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-gray-50 text-gray-500">Or sign up with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Button 
                            onClick={() => window.location.href = 'https://shopping-ivig.onrender.com/api/auth/google'}
                            variant="secondary"
                            size="md"
                            className="w-full"
                        >
                            <svg className="w-5 h-5 mr-2" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 7.373-2.36 3.2-3.2 2.196-8.258 2.03-8.72h-9.398z"/>
                            </svg>
                            Google
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;
