const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const passport = require('passport');
const session = require('express-session');
const { protect, admin } = require('./middleware/authMiddleware');
const { cloudinary, upload } = require('./utils/cloudinaryUpload');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:5173', 'https://theshopping-app.netlify.app'],
    credentials: true
}));

// Session middleware
app.use(session({
    secret: process.env.JWT_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // For development
}));

app.get('/api/debug-env', (req, res) => {
    res.json({
        googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
        googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
        googleCallbackUrl: process.env.GOOGLE_CALLBACK_URL,
        nodeEnv: process.env.NODE_ENV
    });
});

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Database Connection
const connectDB = require('./config/db');

// Database Connection
connectDB();

// Routes
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Image upload route
app.post('/api/upload', protect, admin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }
        
        // Cloudinary automatically uploads the file
        // The file URL is available in req.file.path
        const imagePath = req.file.path;
        
        res.json({
            message: 'Image uploaded successfully',
            imagePath: imagePath
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading image: ' + error.message });
    }
});

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/wishlist', require('./routes/wishlistRoutes'));
// Health check endpoint for mobile debugging
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

app.use('/api/auth', require('./routes/googleAuthRoutes'));
app.use('/api/discount-coupons', require('./routes/discountCouponRoutes'));

// Make upload middleware available to routes
app.locals.upload = upload;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
