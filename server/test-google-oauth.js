// Test script to verify Google OAuth setup
console.log('=== Google OAuth Test ===');
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '***' : 'Not set');
console.log('GOOGLE_CALLBACK_URL:', process.env.GOOGLE_CALLBACK_URL);

// Check if client ID looks valid
const clientId = process.env.GOOGLE_CLIENT_ID;
if (clientId && clientId.includes('your_')) {
    console.log('❌ ERROR: You still have placeholder values in your .env file');
    console.log('Please update GOOGLE_CLIENT_ID with your actual Google Client ID');
} else if (clientId && clientId.includes('.googleusercontent.com')) {
    console.log('✅ Client ID format looks correct');
} else if (clientId) {
    console.log('⚠️  Client ID format might be incorrect');
} else {
    console.log('❌ ERROR: GOOGLE_CLIENT_ID is not set');
}
