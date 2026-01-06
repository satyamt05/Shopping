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

// Default shipping costs (fallback values)
export const DEFAULT_SHIPPING_COSTS = {
    STANDARD: 40, // ₹40 for standard shipping
    FREE_SHIPPING_THRESHOLD: 500, // Free shipping over ₹500
    EXPRESS: 80, // ₹80 for express shipping
};

// Default tax rate (fallback value)
export const DEFAULT_TAX_RATE = 0.18; // 18% GST in India

// Fetch shipping configuration from API
export const fetchShippingConfig = async () => {
    try {
        // Add cache-busting timestamp to prevent browser caching
        const timestamp = Date.now();
        const response = await fetch(`/api/shipping/config?t=${timestamp}`);
        if (response.ok) {
            const config = await response.json();
            console.log('Fetched shipping config:', config); // Debug log
            return {
                STANDARD: config.standardShippingCost || DEFAULT_SHIPPING_COSTS.STANDARD,
                FREE_SHIPPING_THRESHOLD: config.freeShippingThreshold || DEFAULT_SHIPPING_COSTS.FREE_SHIPPING_THRESHOLD,
                EXPRESS: config.expressShippingCost || DEFAULT_SHIPPING_COSTS.EXPRESS,
                freeShippingEnabled: config.freeShippingEnabled !== false,
                expressShippingEnabled: config.expressShippingEnabled === true,
            };
        }
    } catch (error) {
        console.warn('Failed to fetch shipping config, using defaults:', error);
    }
    
    // Return default values if API call fails
    return {
        ...DEFAULT_SHIPPING_COSTS,
        freeShippingEnabled: true,
        expressShippingEnabled: false,
    };
};

// Fetch tax rate from API
export const fetchTaxRate = async () => {
    try {
        // Add cache-busting timestamp to prevent browser caching
        const timestamp = Date.now();
        const response = await fetch(`/api/shipping/config?t=${timestamp}`);
        if (response.ok) {
            const config = await response.json();
            console.log('Fetched tax rate:', config.taxRate); // Debug log
            return config.taxRate || DEFAULT_TAX_RATE;
        }
    } catch (error) {
        console.warn('Failed to fetch tax rate, using default:', error);
    }
    
    return DEFAULT_TAX_RATE;
};
