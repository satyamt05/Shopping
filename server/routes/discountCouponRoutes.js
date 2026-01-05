const express = require('express');
const router = express.Router();
const DiscountCoupon = require('../models/DiscountCoupon');
const { protect, admin } = require('../middleware/authMiddleware');

// @desc    Get all active discount coupons for public
// @route   GET /api/discount-coupons/public
// @access  Public
router.get('/public', async (req, res) => {
    try {
        const coupons = await DiscountCoupon.find({ 
            isActive: true,
            validUntil: { $gt: new Date() }
        })
        .select('code description discountType discountValue minimumOrderAmount maximumDiscountAmount usageLimit usedCount validUntil applicableTo createdAt')
        .sort({ createdAt: -1 });
        
        res.json(coupons);
    } catch (error) {
        console.error('Error fetching public coupons:', error);
        res.status(500).json({ message: 'Error fetching coupons' });
    }
});

// @desc    Create new discount coupon
// @route   POST /api/discount-coupons
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minimumOrderAmount,
            maximumDiscountAmount,
            usageLimit,
            validUntil,
            applicableTo,
            applicableCategories,
            applicableProducts
        } = req.body;

        // Check if coupon code already exists
        const existingCoupon = await DiscountCoupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({ message: 'Coupon code already exists' });
        }

        const coupon = new DiscountCoupon({
            code: code.toUpperCase(),
            description,
            discountType,
            discountValue,
            minimumOrderAmount,
            maximumDiscountAmount,
            usageLimit,
            validUntil,
            applicableTo,
            applicableCategories,
            applicableProducts,
            createdBy: req.user._id
        });

        const createdCoupon = await coupon.save();
        res.status(201).json(createdCoupon);
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({ message: 'Error creating discount coupon' });
    }
});

// @desc    Get all discount coupons
// @route   GET /api/discount-coupons
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
    try {
        const coupons = await DiscountCoupon.find({})
            .populate('createdBy', 'name email')
            .populate('applicableCategories', 'name')
            .populate('applicableProducts', 'name')
            .sort({ createdAt: -1 });
        
        res.json(coupons);
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({ message: 'Error fetching discount coupons' });
    }
});

// @desc    Get single discount coupon
// @route   GET /api/discount-coupons/:id
// @access  Private/Admin
router.get('/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await DiscountCoupon.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('applicableCategories', 'name')
            .populate('applicableProducts', 'name');
        
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }
        
        res.json(coupon);
    } catch (error) {
        console.error('Error fetching coupon:', error);
        res.status(500).json({ message: 'Error fetching discount coupon' });
    }
});

// @desc    Update discount coupon
// @route   PUT /api/discount-coupons/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const {
            code,
            description,
            discountType,
            discountValue,
            minimumOrderAmount,
            maximumDiscountAmount,
            usageLimit,
            validUntil,
            applicableTo,
            applicableCategories,
            applicableProducts,
            isActive
        } = req.body;

        const coupon = await DiscountCoupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        // If code is being changed, check if new code already exists
        if (code && code.toUpperCase() !== coupon.code) {
            const existingCoupon = await DiscountCoupon.findOne({ code: code.toUpperCase() });
            if (existingCoupon) {
                return res.status(400).json({ message: 'Coupon code already exists' });
            }
            coupon.code = code.toUpperCase();
        }

        // Update other fields
        if (description) coupon.description = description;
        if (discountType) coupon.discountType = discountType;
        if (discountValue !== undefined) coupon.discountValue = discountValue;
        if (minimumOrderAmount !== undefined) coupon.minimumOrderAmount = minimumOrderAmount;
        if (maximumDiscountAmount !== undefined) coupon.maximumDiscountAmount = maximumDiscountAmount;
        if (usageLimit !== undefined) coupon.usageLimit = usageLimit;
        if (validUntil) coupon.validUntil = validUntil;
        if (applicableTo) coupon.applicableTo = applicableTo;
        if (applicableCategories) coupon.applicableCategories = applicableCategories;
        if (applicableProducts) coupon.applicableProducts = applicableProducts;
        if (isActive !== undefined) coupon.isActive = isActive;

        const updatedCoupon = await coupon.save();
        res.json(updatedCoupon);
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ message: 'Error updating discount coupon' });
    }
});

// @desc    Delete discount coupon
// @route   DELETE /api/discount-coupons/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const coupon = await DiscountCoupon.findById(req.params.id);
        
        if (!coupon) {
            return res.status(404).json({ message: 'Coupon not found' });
        }

        await DiscountCoupon.deleteOne({ _id: req.params.id });
        res.json({ message: 'Coupon deleted successfully' });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ message: 'Error deleting discount coupon' });
    }
});

// @desc    Validate and apply coupon
// @route   POST /api/discount-coupons/validate
// @access  Private
router.post('/validate', protect, async (req, res) => {
    try {
        const { code, orderAmount, cartItems } = req.body;

        if (!code) {
            return res.status(400).json({ message: 'Coupon code is required' });
        }

        const coupon = await DiscountCoupon.findOne({ code: code.toUpperCase(), isActive: true });
        
        if (!coupon) {
            return res.status(404).json({ message: 'Invalid coupon code' });
        }

        // Check if coupon is valid
        const validation = coupon.isValid(orderAmount);
        if (!validation.valid) {
            return res.status(400).json({ message: validation.message });
        }

        // If coupon applies to specific categories/products, validate cart items
        if (coupon.applicableTo === 'SPECIFIC_CATEGORIES') {
            const hasValidItems = cartItems.some(item => 
                coupon.applicableCategories.includes(item.category)
            );
            if (!hasValidItems) {
                return res.status(400).json({ message: 'Coupon is not applicable to any items in your cart' });
            }
        } else if (coupon.applicableTo === 'SPECIFIC_PRODUCTS') {
            const hasValidItems = cartItems.some(item => 
                coupon.applicableProducts.includes(item._id)
            );
            if (!hasValidItems) {
                return res.status(400).json({ message: 'Coupon is not applicable to any items in your cart' });
            }
        }

        // Calculate discount
        const discountAmount = coupon.calculateDiscount(orderAmount);

        res.json({
            coupon: {
                code: coupon.code,
                description: coupon.description,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                discountAmount
            },
            message: 'Coupon applied successfully'
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ message: 'Error validating coupon' });
    }
});

module.exports = router;
