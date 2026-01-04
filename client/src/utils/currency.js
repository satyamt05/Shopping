// Currency utility for Indian Rupees
export const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
};

export const formatCurrencyWithDecimals = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    }).format(amount);
};

// Indian shipping costs (in rupees)
export const SHIPPING_COSTS = {
    STANDARD: 40, // ₹40 for standard shipping
    FREE_SHIPPING_THRESHOLD: 500, // Free shipping over ₹500
    EXPRESS: 80, // ₹80 for express shipping
};

// Indian tax rate (GST)
export const TAX_RATE = 0.18; // 18% GST in India
