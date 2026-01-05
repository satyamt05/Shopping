import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 1500) => {
        const id = Date.now();
        const toast = { id, message, type };

        setToasts(prev => [...prev, toast]);

        // Auto remove after duration
        setTimeout(() => {
            removeToast(id);
        }, duration);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = useCallback((message, duration) => {
        addToast(message, 'success', duration);
    }, []); // Remove addToast dependency

    const error = useCallback((message, duration) => {
        addToast(message, 'error', duration);
    }, []); // Remove addToast dependency

    const info = useCallback((message, duration) => {
        addToast(message, 'info', duration);
    }, []); // Remove addToast dependency

    const warning = useCallback((message, duration) => {
        addToast(message, 'warning', duration);
    }, []); // Remove addToast dependency

    const value = {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        warning
    };

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    );
};

const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    const getIcon = (type) => {
        switch (type) {
            case 'success':
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'error':
                return <XCircle className="h-5 w-5 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-5 w-5 text-yellow-500" />;
            default:
                return <AlertCircle className="h-5 w-5 text-blue-500" />;
        }
    };

    const getStyles = (type) => {
        switch (type) {
            case 'success':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'error':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'warning':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default:
                return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    return (
        <div className="fixed top-20 right-4 z-50 space-y-2">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`flex items-center justify-between p-4 rounded-lg border shadow-lg max-w-md ${getStyles(toast.type)} transform transition-all duration-300 ease-in-out`}
                >
                    <div className="flex items-center">
                        {getIcon(toast.type)}
                        <p className="ml-3 text-sm font-medium">{toast.message}</p>
                    </div>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="ml-4 text-gray-400 hover:text-gray-600"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ))}
        </div>
    );
};

export default ToastProvider;
