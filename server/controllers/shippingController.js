const asyncHandler = require('express-async-handler');
const ShippingConfig = require('../models/ShippingConfig');

// @desc    Get shipping configuration
// @route   GET /api/shipping/config
// @access  Public
const getShippingConfig = asyncHandler(async (req, res) => {
    const config = await ShippingConfig.getConfig();
    res.json(config);
});

// @desc    Update shipping configuration
// @route   PUT /api/shipping/config
// @access  Private/Admin
const updateShippingConfig = asyncHandler(async (req, res) => {
    const {
        standardShippingCost,
        freeShippingThreshold,
        expressShippingCost,
        taxRate,
        freeShippingEnabled,
        expressShippingEnabled
    } = req.body;

    const config = await ShippingConfig.updateConfig({
        standardShippingCost,
        freeShippingThreshold,
        expressShippingCost,
        taxRate,
        freeShippingEnabled,
        expressShippingEnabled
    });

    res.json(config);
});

module.exports = {
    getShippingConfig,
    updateShippingConfig
};
