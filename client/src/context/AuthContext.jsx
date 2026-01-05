import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [userInfo, setUserInfo] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const storedUserInfo = localStorage.getItem('userInfo');
        const storedToken = localStorage.getItem('token');
        
        if (storedUserInfo && storedToken) {
            try {
                setUserInfo(JSON.parse(storedUserInfo));
                setToken(storedToken);
            } catch (error) {
                console.error('Error parsing stored user info:', error);
                localStorage.removeItem('userInfo');
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false);
    }, []);

    const login = (userData, userToken) => {
        setUserInfo(userData);
        setToken(userToken);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
    };

    const logout = () => {
        setUserInfo(null);
        setToken(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        // Don't remove cartItems here - let user explicitly clear cart if needed
    };

    const signup = (userData, userToken) => {
        setUserInfo(userData);
        setToken(userToken);
        localStorage.setItem('userInfo', JSON.stringify(userData));
        localStorage.setItem('token', userToken);
    };

    const value = {
        userInfo,
        token,
        isLoading,
        isAuthenticated: !!userInfo,
        login,
        logout,
        signup
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
