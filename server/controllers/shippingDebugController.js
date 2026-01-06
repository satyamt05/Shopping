const asyncHandler = require('express-async-handler');
const ShippingConfig = require('../models/ShippingConfig');

// @desc    Debug shipping configuration
// @route   GET /api/shipping/debug
// @access  Private/Admin (temporary endpoint for debugging)
const debugShippingConfig = asyncHandler(async (req, res) => {
    try {
        // Find all shipping config documents
        const allConfigs = await ShippingConfig.find({});
        console.log('All shipping configs in database:', allConfigs);
        
        // Get current config
        const currentConfig = await ShippingConfig.getConfig();
        console.log('Current config:', currentConfig);
        
        // If there are multiple configs, delete extras
        if (allConfigs.length > 1) {
            console.log('Found multiple configs, cleaning up...');
            await ShippingConfig.deleteMany({ _id: { $ne: currentConfig._id } });
        }
        
        res.json({
            message: 'Debug info',
            allConfigs: allConfigs,
            currentConfig: currentConfig,
            count: allConfigs.length
        });
    } catch (error) {
        console.error('Debug error:', error);
        res.status(500).json({ error: error.message });
    }
});

// @desc    Force update shipping configuration
// @route   POST /api/shipping/force-update
// @access  Private/Admin (temporary endpoint for debugging)
const forceUpdateShippingConfig = asyncHandler(async (req, res) => {
    try {
        const { freeShippingThreshold } = req.body;
        
        // Delete existing config
        await ShippingConfig.deleteMany({});
        
        // Create new config with specified values
        const newConfig = await ShippingConfig.create({
            standardShippingCost: 40,
            freeShippingThreshold: freeShippingThreshold || 504,
            expressShippingCost: 80,
            taxRate: 0.18,
            freeShippingEnabled: true,
            expressShippingEnabled: false
        });
        
        console.log('Force created new config:', newConfig);
        
        res.json({
            message: 'Force updated shipping config',
            config: newConfig
        });
    } catch (error) {
        console.error('Force update error:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = {
    debugShippingConfig,
    forceUpdateShippingConfig
};
