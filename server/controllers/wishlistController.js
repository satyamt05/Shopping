const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const wishlist = await Wishlist.findOne({ user: req.user._id })
            .populate({
                path: 'products.product',
                select: 'name image price countInStock rating numReviews'
            })
            .sort({ 'products.addedAt': -1 });

        if (!wishlist) {
            return res.json({ products: [] });
        }

        res.json(wishlist);
    } catch (error) {
        console.error('Error fetching wishlist:', error);
        res.status(500).json({ message: 'Error fetching wishlist' });
    }
};

// Add product to wishlist
const addToWishlist = async (req, res) => {
    try {
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Check if product exists and is in stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Find or create user's wishlist
        let wishlist = await Wishlist.findOne({ user: req.user._id });
        
        if (!wishlist) {
            wishlist = new Wishlist({
                user: req.user._id,
                products: []
            });
        }

        // Check if product already in wishlist
        const existingProduct = wishlist.products.find(
            item => item.product.toString() === productId
        );

        if (existingProduct) {
            return res.status(400).json({ message: 'Product already in wishlist' });
        }

        // Add product to wishlist
        wishlist.products.push({
            product: productId,
            addedAt: new Date()
        });

        await wishlist.save();

        // Return updated wishlist with populated product details
        const updatedWishlist = await Wishlist.findOne({ user: req.user._id })
            .populate({
                path: 'products.product',
                select: 'name image price countInStock rating numReviews'
            });

        res.status(201).json(updatedWishlist);
    } catch (error) {
        console.error('Error adding to wishlist:', error);
        res.status(500).json({ message: 'Error adding to wishlist' });
    }
};

// Remove product from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.status(404).json({ message: 'Wishlist not found' });
        }

        // Remove product from wishlist
        wishlist.products = wishlist.products.filter(
            item => item.product.toString() !== productId
        );

        await wishlist.save();

        // Return updated wishlist with populated product details
        const updatedWishlist = await Wishlist.findOne({ user: req.user._id })
            .populate({
                path: 'products.product',
                select: 'name image price countInStock rating numReviews'
            });

        res.json(updatedWishlist);
    } catch (error) {
        console.error('Error removing from wishlist:', error);
        res.status(500).json({ message: 'Error removing from wishlist' });
    }
};

// Check if product is in wishlist
const checkInWishlist = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        const wishlist = await Wishlist.findOne({ user: req.user._id });

        if (!wishlist) {
            return res.json({ inWishlist: false });
        }

        const inWishlist = wishlist.products.some(
            item => item.product.toString() === productId
        );

        res.json({ inWishlist });
    } catch (error) {
        console.error('Error checking wishlist:', error);
        res.status(500).json({ message: 'Error checking wishlist' });
    }
};

// Move product from wishlist to cart
const moveToCart = async (req, res) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            return res.status(400).json({ message: 'Product ID is required' });
        }

        // Check if product exists and has stock
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        if (product.countInStock <= 0) {
            return res.status(400).json({ message: 'Product is out of stock' });
        }

        // Remove from wishlist
        const wishlist = await Wishlist.findOne({ user: req.user._id });
        if (wishlist) {
            wishlist.products = wishlist.products.filter(
                item => item.product.toString() !== productId
            );
            await wishlist.save();
        }

        res.json({ message: 'Product moved to cart successfully' });
    } catch (error) {
        console.error('Error moving to cart:', error);
        res.status(500).json({ message: 'Error moving to cart' });
    }
};

module.exports = {
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    checkInWishlist,
    moveToCart
};
