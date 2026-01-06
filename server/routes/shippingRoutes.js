const express = require('express');
const router = express.Router();
const {
    getShippingConfig,
    updateShippingConfig
} = require('../controllers/shippingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/config', getShippingConfig);
router.put('/config', protect, admin, updateShippingConfig);

module.exports = router;
