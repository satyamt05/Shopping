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
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

shippingConfigSchema.statics.updateConfig = async function(updateData) {
    let config = await this.findOne();
    if (!config) {
        config = await this.create(updateData);
    } else {
        Object.assign(config, updateData);
        await config.save();
    }
    return config;
};

const ShippingConfig = mongoose.model('ShippingConfig', shippingConfigSchema);

module.exports = ShippingConfig;
