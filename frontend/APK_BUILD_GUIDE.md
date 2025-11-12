# APK Build Guide - Construction Management App

## ✅ YES! You can use the APK once both frontend and backend are hosted!

Once you deploy both frontend and backend, the APK will work perfectly with your hosted backend.

---

## Step 1: Deploy Backend First (Required)

### Option A: Deploy to Render (Recommended - FREE)

1. **Go to https://render.com**
2. **Sign up with GitHub** (free)
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repository**
5. **Configure:**
   - **Name:** `construction-backend`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** `Free` (or paid if you want)

6. **Add Environment Variables:**
   - Click "Environment" tab
   - Add these variables:
     - **Key:** `MONGODB_URI`
     - **Value:** Your MongoDB connection string (e.g., `mongodb+srv://username:password@cluster.mongodb.net/construction?retryWrites=true&w=majority`)
     - **Key:** `PORT`
     - **Value:** `5000` (or leave empty, Render will auto-assign)
     - **Key:** `NODE_ENV`
     - **Value:** `production`

7. **Click "Create Web Service"**
8. **Wait for deployment** (5-10 minutes)
9. **Copy your backend URL** (e.g., `https://construction-backend.onrender.com`)

### Option B: Deploy to Railway (FREE tier)

1. **Go to https://railway.app**
2. **Sign up with GitHub**
3. **New Project → Deploy from GitHub**
4. **Select your repository**
5. **Add Service → Select "backend" directory**
6. **Set Environment Variables:**
   - `MONGODB_URI` = your MongoDB connection string
   - `PORT` = `5000`
   - `NODE_ENV` = `production`
7. **Deploy**
8. **Copy your backend URL**

---

## Step 2: Update Frontend with Backend URL

Once you have your backend URL (e.g., `https://construction-backend.onrender.com`):

### 2.1 Update Vercel Environment Variable

1. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**
2. Edit `VITE_API_URL`
3. Change to: `https://your-backend-url.com/api` (replace with your actual backend URL)
4. Click **Save**
5. Go to **Deployments → Redeploy** (to apply the change)

### 2.2 Create .env.production for APK

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.com/api
```

Replace `https://your-backend-url.com/api` with your actual backend URL.

---

## Step 3: Build APK with Backend URL

### 3.1 Update Environment Variable

Before building, set the backend URL:

```powershell
cd frontend
```

Create `.env.production` file:
```env
VITE_API_URL=https://your-backend-url.com/api
```

**Replace `https://your-backend-url.com/api` with your actual backend URL!**

### 3.2 Build Frontend

```powershell
npm run build
```

This will create the `dist` folder with the production build that includes your backend URL.

### 3.3 Sync with Capacitor

```powershell
npx cap sync android
```

This updates the Android project with your latest build.

### 3.4 Build APK

#### Option A: Build from Android Studio (Recommended)

1. **Open Android Studio**
2. **File → Open → Select `frontend/android` folder**
3. **Wait for Gradle sync to complete**
4. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
5. **Wait for build to complete**
6. **Find APK:** `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

#### Option B: Build from Command Line

```powershell
cd frontend/android
.\gradlew assembleDebug
```

APK will be at: `frontend/android/app/build/outputs/apk/debug/app-debug.apk`

---

## Step 4: Install and Test APK

1. **Transfer APK to your phone** (via USB, email, or cloud storage)
2. **Enable "Install from Unknown Sources"** on your phone
3. **Install the APK**
4. **Open the app**
5. **Test all features** - they should connect to your hosted backend!

---

## Important Notes

### ✅ APK Will Work Because:
- APK uses the same code as your web frontend
- It reads `VITE_API_URL` from environment variables during build
- Once built with the backend URL, it will always use that URL
- Your hosted backend handles all API requests

### 🔄 To Update APK Later:
1. Make changes to your code
2. Update `.env.production` if backend URL changes
3. Run `npm run build`
4. Run `npx cap sync android`
5. Build new APK from Android Studio
6. Install new APK on devices

### 📱 Mobile App Behavior:
- **Works offline:** Uses localStorage as fallback
- **Online:** Connects to your hosted backend
- **Data syncs:** Between mobile app and web app via backend

---

## Quick Commands Summary

```powershell
# 1. Navigate to frontend
cd frontend

# 2. Create .env.production with your backend URL
echo "VITE_API_URL=https://your-backend-url.com/api" > .env.production

# 3. Build frontend
npm run build

# 4. Sync with Capacitor
npx cap sync android

# 5. Open Android Studio
npx cap open android

# 6. Build APK from Android Studio
# OR use command line:
cd android
.\gradlew assembleDebug
```

---

## Troubleshooting

### APK can't connect to backend?
- Check backend URL in `.env.production`
- Verify backend CORS allows your domain
- Check backend is running and accessible
- Test backend URL in browser: `https://your-backend-url.com/api/health`

### Build fails?
- Make sure you're in `frontend` directory
- Run `npm install` first
- Check Node.js version (should be 16+)

### APK install fails?
- Enable "Install from Unknown Sources"
- Check Android version compatibility
- Try uninstalling old version first

---

## Summary

✅ **Frontend:** Deployed on Vercel  
⏳ **Backend:** Deploy to Render/Railway  
⏳ **APK:** Build with backend URL after backend is deployed  
✅ **Result:** APK will work with hosted backend!

---

**Your APK will work perfectly once both are hosted!** 🚀

