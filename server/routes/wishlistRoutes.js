const express = require('express');
const router = express.Router();
const {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    moveToCart
} = require('../controllers/wishlistController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// GET /api/wishlist - Get user's wishlist
router.get('/', getWishlist);

// POST /api/wishlist - Add product to wishlist
router.post('/', addToWishlist);

// DELETE /api/wishlist/:productId - Remove product from wishlist
router.delete('/:productId', removeFromWishlist);

// GET /api/wishlist/check/:productId - Check if product is in wishlist
router.get('/check/:productId', checkInWishlist);

// POST /api/wishlist/move-to-cart/:productId - Move product from wishlist to cart
router.post('/move-to-cart/:productId', moveToCart);

module.exports = router;
