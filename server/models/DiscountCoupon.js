const mongoose = require('mongoose');

const discountCouponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    discountType: {
        type: String,
        required: true,
        enum: ['PERCENTAGE', 'FIXED_AMOUNT']
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    minimumOrderAmount: {
        type: Number,
        default: 0
    },
    maximumDiscountAmount: {
        type: Number,
        default: null
    },
    usageLimit: {
        type: Number,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    validFrom: {
        type: Date,
        default: Date.now
    },
    validUntil: {
        type: Date,
        required: true
    },
    applicableTo: {
        type: String,
        enum: ['ALL', 'SPECIFIC_CATEGORIES', 'SPECIFIC_PRODUCTS'],
        default: 'ALL'
    },
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Method to check if coupon is valid
discountCouponSchema.methods.isValid = function(orderAmount = 0, user = null) {
    const now = new Date();
    
    // Check if coupon is active
    if (!this.isActive) return { valid: false, message: 'Coupon is not active' };
    
    // Check if coupon is within valid date range
    if (now < this.validFrom) return { valid: false, message: 'Coupon is not yet valid' };
    if (now > this.validUntil) return { valid: false, message: 'Coupon has expired' };
    
    // Check minimum order amount
    if (orderAmount < this.minimumOrderAmount) {
        return { 
            valid: false, 
            message: `Minimum order amount of ₹${this.minimumOrderAmount} required` 
        };
    }
    
    // Check usage limit
    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        return { valid: false, message: 'Coupon usage limit reached' };
    }
    
    return { valid: true, message: 'Coupon is valid' };
};

// Method to calculate discount
discountCouponSchema.methods.calculateDiscount = function(orderAmount) {
    let discount = 0;
    
    if (this.discountType === 'PERCENTAGE') {
        discount = (orderAmount * this.discountValue) / 100;
        // Apply maximum discount limit if set
        if (this.maximumDiscountAmount && discount > this.maximumDiscountAmount) {
            discount = this.maximumDiscountAmount;
        }
    } else if (this.discountType === 'FIXED_AMOUNT') {
        discount = this.discountValue;
        // Discount cannot exceed order amount
        if (discount > orderAmount) {
            discount = orderAmount;
        }
    }
    
    return discount;
};

// Method to increment usage count
discountCouponSchema.methods.incrementUsage = function() {
    this.usedCount += 1;
    return this.save();
};

module.exports = mongoose.model('DiscountCoupon', discountCouponSchema);
