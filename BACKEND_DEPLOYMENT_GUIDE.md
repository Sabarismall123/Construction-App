# Backend Deployment Guide - Render (FREE)

## Step-by-Step Guide to Deploy Backend

---

## Step 1: Get MongoDB Connection String

### Option A: MongoDB Atlas (FREE Cloud Database)

1. **Go to https://www.mongodb.com/cloud/atlas**
2. **Sign up** (free tier available)
3. **Create a new cluster** (FREE tier)
4. **Wait for cluster to be created** (2-3 minutes)
5. **Click "Connect"** on your cluster
6. **Choose "Connect your application"**
7. **Copy the connection string** (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/construction?retryWrites=true&w=majority
   ```
8. **Replace `<password>`** with your actual password
9. **Save this connection string** - you'll need it!

### Option B: Use Existing MongoDB

If you already have MongoDB, use your connection string.

---

## Step 2: Deploy Backend to Render

### 2.1 Sign Up for Render

1. **Go to https://render.com**
2. **Click "Get Started for Free"**
3. **Sign up with GitHub** (recommended)
4. **Authorize Render** to access your GitHub

### 2.2 Create New Web Service

1. **Click "New +"** button (top right)
2. **Select "Web Service"**
3. **Connect your GitHub repository**
   - Select: `Sabarismall123/Construction-App`
   - Click "Connect"

### 2.3 Configure Backend Service

Fill in these settings:

**Basic Settings:**
- **Name:** `construction-backend` (or any name you like)
- **Region:** Choose closest to you (e.g., Singapore, US East)
- **Branch:** `main`
- **Root Directory:** `backend`
- **Runtime:** `Node`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Plan:** `Free` (or choose paid if you want)

**Important:** Make sure "Root Directory" is set to `backend`!

### 2.4 Add Environment Variables

Click "Advanced" → "Add Environment Variable"

Add these variables one by one:

1. **MONGODB_URI**
   - **Key:** `MONGODB_URI`
   - **Value:** Your MongoDB connection string (from Step 1)
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/construction?retryWrites=true&w=majority`

2. **PORT** (Optional - Render auto-assigns)
   - **Key:** `PORT`
   - **Value:** `5000` (or leave empty)

3. **NODE_ENV**
   - **Key:** `NODE_ENV`
   - **Value:** `production`

4. **JWT_SECRET**
   - **Key:** `JWT_SECRET`
   - **Value:** Generate a random secret (use: https://randomkeygen.com/)
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

5. **JWT_EXPIRE**
   - **Key:** `JWT_EXPIRE`
   - **Value:** `7d`

### 2.5 Deploy!

1. **Click "Create Web Service"** at the bottom
2. **Wait for deployment** (5-10 minutes)
   - You'll see build logs in real-time
   - Watch for any errors
3. **Once deployed**, you'll see:
   - ✅ Status: Live
   - 🌐 URL: `https://construction-backend.onrender.com` (example)
   - **Copy this URL!**

---

## Step 3: Test Backend

1. **Open your backend URL** in browser
2. **Add `/health`** to the end:
   ```
   https://your-backend-url.onrender.com/health
   ```
3. **You should see:**
   ```json
   {
     "status": "OK",
     "timestamp": "...",
     "uptime": ...,
     "environment": "production"
   }
   ```

If you see this, your backend is working! ✅

---

## Step 4: Update Frontend with Backend URL

### 4.1 Update Vercel Environment Variable

1. **Go to Vercel Dashboard**
2. **Select your frontend project**
3. **Go to Settings → Environment Variables**
4. **Edit `VITE_API_URL`**
5. **Change value to:**
   ```
   https://your-backend-url.onrender.com/api
   ```
   Replace `your-backend-url.onrender.com` with your actual backend URL!
6. **Click "Save"**

### 4.2 Redeploy Frontend

1. **Go to Deployments tab**
2. **Click "..." on latest deployment**
3. **Click "Redeploy"**
4. **Wait for deployment** (2-3 minutes)

---

## Step 5: Test Everything Together

1. **Open your frontend URL** on mobile or web
2. **Try to login** (use demo credentials)
3. **Create a project** - it should save to database!
4. **Check MongoDB Atlas** - you should see your data!

---

## Troubleshooting

### Backend deployment fails?

**Check build logs:**
- Look for errors in Render dashboard
- Common issues:
  - Missing environment variables
  - Wrong root directory
  - Build command error

**Fix common errors:**
- Ensure `Root Directory` is `backend`
- Check `MONGODB_URI` is correct
- Verify `Build Command` is `npm install && npm run build`

### Backend not responding?

1. **Check backend URL** - try `/health` endpoint
2. **Check Render logs** - look for errors
3. **Verify MongoDB connection** - check if MongoDB URI is correct
4. **Check CORS** - ensure backend CORS allows your frontend URL

### Frontend can't connect to backend?

1. **Verify `VITE_API_URL`** in Vercel is correct
2. **Check backend CORS** - should include your Vercel URL
3. **Check browser console** - look for CORS errors
4. **Test backend URL directly** - should return JSON

---

## Quick Checklist

Before deploying:
- [ ] MongoDB Atlas account created
- [ ] MongoDB cluster created
- [ ] Connection string copied
- [ ] Render account created
- [ ] GitHub repository connected

After deploying:
- [ ] Backend URL working (`/health` endpoint)
- [ ] Frontend `VITE_API_URL` updated
- [ ] Frontend redeployed
- [ ] Test login on frontend
- [ ] Test creating project
- [ ] Check data in MongoDB

---

## Alternative: Railway (Also FREE)

If Render doesn't work, try Railway:

1. **Go to https://railway.app**
2. **Sign up with GitHub**
3. **New Project → Deploy from GitHub**
4. **Select your repository**
5. **Add Service → Select "backend" directory**
6. **Add Environment Variables:**
   - `MONGODB_URI`
   - `NODE_ENV=production`
   - `JWT_SECRET`
7. **Deploy**

---

## Summary

✅ **Step 1:** Get MongoDB connection string  
✅ **Step 2:** Deploy backend to Render  
✅ **Step 3:** Test backend  
✅ **Step 4:** Update frontend with backend URL  
✅ **Step 5:** Test everything together  

**Your app will be fully functional!** 🚀

---

## Need Help?

If you encounter any issues:
1. Check the build logs in Render
2. Check browser console for errors
3. Test backend `/health` endpoint
4. Verify all environment variables are set

