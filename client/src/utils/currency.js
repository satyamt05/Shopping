import axios from './api';

// Currency utility for Indian Rupees
export const formatCurrency = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '₹0';
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatCurrencyWithDecimals = (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
        return '₹0.00';
    }
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Default shipping costs (fallback values only for API failures)
export const DEFAULT_SHIPPING_COSTS = {
    STANDARD: 0, // No fallback - API should always work
    FREE_SHIPPING_THRESHOLD: 0, // No fallback - API should always work
    EXPRESS: 0, // No fallback - API should always work
};

// Default tax rate (fallback value only for API failures)
export const DEFAULT_TAX_RATE = 0; // No fallback - API should always work

// Fetch shipping configuration from API
export const fetchShippingConfig = async () => {
    try {
        // Add cache-busting timestamp to prevent browser caching
        const timestamp = Date.now();
        const response = await axios.get(`/shipping/config?t=${timestamp}`);
        const config = response.data;
        console.log('Fetched shipping config:', config); // Debug log
        return {
            STANDARD: config.standardShippingCost || DEFAULT_SHIPPING_COSTS.STANDARD,
            FREE_SHIPPING_THRESHOLD: config.freeShippingThreshold || DEFAULT_SHIPPING_COSTS.FREE_SHIPPING_THRESHOLD,
            EXPRESS: config.expressShippingCost || DEFAULT_SHIPPING_COSTS.EXPRESS,
            taxRate: config.taxRate || DEFAULT_TAX_RATE,
            freeShippingEnabled: config.freeShippingEnabled !== false,
            expressShippingEnabled: config.expressShippingEnabled === true,
        };
    } catch (error) {
        console.warn('Failed to fetch shipping config, using defaults:', error);
    }
    
    // Return default values if API call fails
    return {
        ...DEFAULT_SHIPPING_COSTS,
        taxRate: DEFAULT_TAX_RATE,
        freeShippingEnabled: true,
        expressShippingEnabled: false,
    };
};
