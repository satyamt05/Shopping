const express = require('express');
const router = express.Router();
const {
    debugShippingConfig,
    forceUpdateShippingConfig
} = require('../controllers/shippingDebugController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/debug', protect, admin, debugShippingConfig);
router.post('/force-update', protect, admin, forceUpdateShippingConfig);

module.exports = router;
