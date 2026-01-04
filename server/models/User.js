
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema(
    {
        name: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String }, // Optional for Google Login
        phone: { type: String, default: '' },
        isAdmin: { type: Boolean, required: true, default: false },
        googleId: { type: String },
        profilePicture: { type: String },
        addresses: [{
            street: String,
            city: String,
            state: String,
            postalCode: String,
            country: String,
            isDefault: { type: Boolean, default: false }
        }]
    },
    { timestamps: true }
);

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password using bcrypt
userSchema.pre('save', async function() {
    // Only run this function if password was modified (not on other updates)
    if (!this.isModified('password')) {
        return;
    }

    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
