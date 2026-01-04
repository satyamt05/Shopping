const express = require('express');
const router = express.Router();
const passport = require('../config/googleAuth');
const generateToken = require('../utils/generateToken');

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?error=google_auth_failed' }),
    (req, res) => {
        // Generate JWT token
        const token = generateToken(req.user._id);
        
        // Redirect to frontend with token
        res.redirect(`https://theshopping-app.netlify.app/login?token=${token}&user=${encodeURIComponent(JSON.stringify({
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
            isAdmin: req.user.isAdmin,
            profilePicture: req.user.profilePicture
        }))}`);
    }
);

module.exports = router;
