# 🚀 How to Start Your Construction App

## ✅ Issue Fixed!
The `@babel/core` missing module issue has been fixed. All dependencies are now properly installed.

---

## 📋 Quick Start Guide

### **Option 1: Use the Startup Scripts (Easiest)**

#### For Windows (PowerShell):
```powershell
cd "d:\old projeect\Construction-App"
.\start-dev.ps1
```

#### For Windows (Command Prompt):
```cmd
cd "d:\old projeect\Construction-App"
START-EVERYTHING.bat
```

This will automatically start both frontend and backend in separate windows.

---

### **Option 2: Manual Start (Step by Step)**

#### **Step 1: Start Backend Server**

Open **Terminal 1** (PowerShell or Command Prompt):

```powershell
cd "d:\old projeect\Construction-App\backend"
npm install
npm run dev
```

**Backend will run on:** `http://localhost:5000`

**What you'll see:**
- ✅ MongoDB connected successfully
- 🚀 Server running on port 5000
- 🔗 API URL: http://localhost:5000/api

---

#### **Step 2: Start Frontend Server**

Open **Terminal 2** (PowerShell or Command Prompt):

```powershell
cd "d:\old projeect\Construction-App\frontend"
npm install
npm run dev
```

**Frontend will run on:** `http://localhost:5173` (Vite default port)

**What you'll see:**
- ✅ Vite dev server running
- 🌐 Local: http://localhost:5173
- 📡 Using local API URL: http://localhost:5000/api

---

## 🌐 Access Your Application

Once both servers are running:

1. **Frontend (Web App):**
   - Open browser: `http://localhost:5173`
   - The app will automatically connect to the backend

2. **Backend API:**
   - Health check: `http://localhost:5000/health`
   - API base: `http://localhost:5000/api`

---

## 🔧 Environment Setup

### Backend Environment Variables

The backend needs a `.env` file. If it doesn't exist, create one:

```powershell
cd "d:\old projeect\Construction-App\backend"
copy env.example .env
```

**Edit `.env` file:**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/construction_management
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
```

**For Production (Render):**
- Use your MongoDB Atlas connection string
- Set `NODE_ENV=production`
- Use a strong `JWT_SECRET`

---

### Frontend Environment Variables

The frontend automatically detects the environment:

- **Local Development:** Uses `http://localhost:5000/api`
- **Production (Vercel):** Uses `VITE_API_URL` environment variable

**To set production API URL in Vercel:**
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add: `VITE_API_URL` = `https://your-backend-url.onrender.com/api`

---

## 📦 Dependencies Status

✅ **Frontend:** All dependencies installed (including `@babel/core`)
✅ **Backend:** Ready to install dependencies

If you need to reinstall:

**Frontend:**
```powershell
cd "d:\old projeect\Construction-App\frontend"
npm install
```

**Backend:**
```powershell
cd "d:\old projeect\Construction-App\backend"
npm install
```

---

## 🚀 Deployment Status

### **Frontend (Vercel)**
- ✅ Deployed and configured
- ✅ Auto-deploys on git push
- ✅ Environment variables can be set in Vercel dashboard

### **Backend (Render)**
- ✅ Deployed and configured
- ✅ Root directory: `backend`
- ✅ Build command: `npm install && npm run build`
- ✅ Start command: `npm start`

---

## 🐛 Troubleshooting

### Frontend won't start?
```powershell
cd "d:\old projeect\Construction-App\frontend"
# Clean and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run dev
```

### Backend won't start?
```powershell
cd "d:\old projeect\Construction-App\backend"
# Clean and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
npm install
npm run dev
```

### MongoDB Connection Issues?
- Make sure MongoDB is running locally
- Or use MongoDB Atlas (cloud) and update `MONGODB_URI` in `.env`

### Port Already in Use?
- Frontend: Change port in `vite.config.ts` or use `npm run dev -- --port 3000`
- Backend: Change `PORT` in `.env` file

---

## 📝 Summary

**To start working locally:**

1. **Terminal 1:** `cd backend && npm run dev`
2. **Terminal 2:** `cd frontend && npm run dev`
3. **Browser:** Open `http://localhost:5173`

**To deploy changes:**

1. Make your changes
2. Commit: `git add . && git commit -m "Your changes"`
3. Push: `git push`
4. Vercel and Render will auto-deploy

---

## ✅ Current Status

- ✅ Frontend dependencies fixed and installed
- ✅ `@babel/core` issue resolved
- ✅ Ready to start development
- ✅ Deployment configured (Vercel + Render)

**You're all set! 🎉**

