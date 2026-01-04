# 🚀 Shopping App Deployment Guide

## 📋 Overview
This guide will help you deploy your complete shopping application with backend and frontend.

## 🏗️ Architecture
- **Backend**: Node.js + Express + MongoDB
- **Frontend**: React + Vite + Tailwind CSS
- **Database**: MongoDB Atlas
- **Authentication**: JWT + Google OAuth

## 🌐 Hosting Options

### Option 1: Free Hosting (Recommended)
- **Backend**: Render.com (Free tier)
- **Frontend**: Vercel/Netlify (Free tier)
- **Database**: MongoDB Atlas (Free tier)

### Option 2: Paid Hosting
- **Backend**: AWS, DigitalOcean, Heroku
- **Frontend**: AWS S3, CloudFront
- **Database**: MongoDB Atlas (Paid tier)

## 🔧 Step-by-Step Deployment

### 1. Backend Deployment (Render.com)

#### Prerequisites:
- GitHub account
- Render.com account

#### Steps:
1. **Push Code to GitHub**
   ```bash
   cd /Users/zopdev/Documents/Shopping
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/shopping-app.git
   git push -u origin main
   ```

2. **Deploy to Render**
   - Go to https://render.com
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select the `server` folder as root directory
   - Build Command: `npm install`
   - Start Command: `node server.js`
   - Add Environment Variables:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     GOOGLE_CLIENT_ID=your_google_client_id
     GOOGLE_CLIENT_SECRET=your_google_client_secret
     GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/google/callback
     ```

### 2. Frontend Deployment (Vercel)

#### Steps:
1. **Deploy to Vercel**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add Environment Variables:
     ```
     VITE_API_URL=https://your-app-name.onrender.com
     ```

2. **Update API URL in Client**
   - Update `/client/src/utils/api.js`:
   ```javascript
   const API_URL = import.meta.env.VITE_API_URL || 'https://your-app-name.onrender.com';
   ```

### 3. Google OAuth Configuration

#### Update Google Cloud Console:
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add these Authorized JavaScript Origins:
   - `http://localhost:5173` (development)
   - `https://your-vercel-app.vercel.app` (production)
4. Add these Authorized Redirect URIs:
   - `http://localhost:5000/api/auth/google/callback` (development)
   - `https://your-app-name.onrender.com/api/auth/google/callback` (production)

## 📱 Alternative: Netlify for Frontend

### Deploy to Netlify:
1. Go to https://netlify.com
2. Drag and drop the `client/dist` folder
3. Or connect GitHub repository for automatic deployments

## 🔒 Environment Variables

### Backend (.env):
```bash
PORT=5000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
JWT_SECRET=your_super_secret_jwt_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/google/callback
```

### Frontend (.env):
```bash
VITE_API_URL=https://your-app-name.onrender.com
```

## 🧪 Testing

### After Deployment:
1. Test all API endpoints
2. Test Google OAuth flow
3. Test user registration/login
4. Test product browsing
5. Test cart functionality
6. Test checkout process

## 📋 Deployment Checklist

- [ ] Backend deployed to Render.com
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Environment variables configured
- [ ] Google OAuth updated with production URLs
- [ ] Database connection working
- [ ] All API endpoints tested
- [ ] Google OAuth flow tested
- [ ] Frontend-backend communication tested

## 🚀 Quick Deploy Commands

### Backend (Render):
```bash
# Push to GitHub (auto-deploys to Render)
git add .
git commit -m "Deploy update"
git push origin main
```

### Frontend (Vercel):
```bash
# Push to GitHub (auto-deploys to Vercel)
git add .
git commit -m "Deploy update"
git push origin main
```

## 📞 Support

If you face any issues:
1. Check server logs on Render dashboard
2. Check build logs on Vercel dashboard
3. Verify environment variables
4. Test API endpoints individually
5. Check Google OAuth configuration

## 🎉 Success!

Once deployed, your shopping app will be live at:
- Frontend: https://your-app.vercel.app
- Backend: https://your-app.onrender.com
- API Docs: https://your-app.onrender.com/api-docs
