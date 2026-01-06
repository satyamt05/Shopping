const mongoose = require('mongoose');

const shippingConfigSchema = mongoose.Schema(
    {
        standardShippingCost: {
            type: Number,
            required: true,
            default: 40,
            min: 0
        },
        freeShippingThreshold: {
            type: Number,
            required: true,
            default: 500,
            min: 0
        },
        expressShippingCost: {
            type: Number,
            required: true,
            default: 80,
            min: 0
        },
        taxRate: {
            type: Number,
            required: true,
            default: 0.18,
            min: 0,
            max: 1
        },
        freeShippingEnabled: {
            type: Boolean,
            required: true,
            default: true
        },
        expressShippingEnabled: {
            type: Boolean,
            required: true,
            default: false
        }
    },
    { timestamps: true }
);

// There should be only one shipping configuration document
shippingConfigSchema.statics.getConfig = async function() {
    // Find the most recently updated config document
    let config = await this.findOne().sort({ updatedAt: -1 });
    if (!config) {
        config = await this.create({});
    }
    return config;
};

shippingConfigSchema.statics.updateConfig = async function(updateData) {
    // Find the most recently updated config document
    let config = await this.findOne().sort({ updatedAt: -1 });
    if (!config) {
        config = await this.create(updateData);
    } else {
        Object.assign(config, updateData);
        await config.save();
    }
    
    // Clean up any duplicate documents (keep only the most recent one)
    await this.cleanupDuplicates();
    
    return config;
};

// Clean up duplicate shipping configuration documents
shippingConfigSchema.statics.cleanupDuplicates = async function() {
    const allConfigs = await this.find().sort({ updatedAt: -1 });
    if (allConfigs.length > 1) {
        // Keep the first (most recent) document, delete the rest
        const toKeep = allConfigs[0]._id;
        const toDelete = allConfigs.slice(1).map(config => config._id);
        await this.deleteMany({ _id: { $in: toDelete } });
        console.log(`Cleaned up ${toDelete.length} duplicate shipping config documents`);
    }
};

const ShippingConfig = mongoose.model('ShippingConfig', shippingConfigSchema);

module.exports = ShippingConfig;
