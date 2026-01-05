
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

const protect = asyncHandler(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            console.log('Auth middleware - Decoded token:', decoded);
            console.log('Auth middleware - Looking for user ID:', decoded.id);

            const user = await User.findById(decoded.id).select('-password');
            console.log('Auth middleware - Found user:', user ? user._id : 'null');

            if (!user) {
                console.log('Auth middleware - User not found in database');
                res.status(401);
                throw new Error('User not found');
            }

            req.user = user;
            next();
        } catch (error) {
            console.error('Auth middleware error:', error);
            console.error('Auth middleware - Token:', token ? token.substring(0, 20) + '...' : 'null');
            res.status(401);
            throw new Error('Not authorized, token failed');
        }
    }

    if (!token) {
        console.log('Auth middleware - No token provided');
        res.status(401);
        throw new Error('Not authorized, no token');
    }
});

const admin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401);
        throw new Error('Not authorized as an admin');
    }
};

module.exports = { protect, admin };
