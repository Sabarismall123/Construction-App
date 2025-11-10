# Step-by-Step Guide: Deploy Frontend for FREE

## Prerequisites
- ✅ Code is ready (already done)
- ✅ Environment files created (already done)
- ✅ GitHub account (free)
- ✅ Vercel account (free, we'll create it)

---

## STEP 1: Push Code to GitHub

### 1.1 Create GitHub Repository
1. Go to https://github.com
2. Click the **"+"** icon (top right) → **"New repository"**
3. Repository name: `construction-management-app` (or any name)
4. Description: "Construction Management System"
5. Choose **Public** (or Private if you have GitHub Pro)
6. **DO NOT** check "Initialize with README" (we already have code)
7. Click **"Create repository"**

### 1.2 Push Your Code to GitHub

**Open terminal/PowerShell in your project root** (`C:\Users\Guest_VIPS\Downloads\ki`):

```powershell
# Navigate to project root
cd C:\Users\Guest_VIPS\Downloads\ki

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit - Ready for deployment"

# Add your GitHub repository (replace YOUR_USERNAME and YOUR_REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** Replace `YOUR_USERNAME` with your GitHub username and `YOUR_REPO_NAME` with your repository name.

**Example:**
```powershell
git remote add origin https://github.com/johnsmith/construction-management-app.git
```

---

## STEP 2: Deploy to Vercel (FREE)

### 2.1 Sign Up for Vercel
1. Go to https://vercel.com
2. Click **"Sign Up"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. Complete the sign-up process

### 2.2 Import Your Project
1. After signing in, click **"Add New..."** → **"Project"**
2. You'll see your GitHub repositories listed
3. Find and click **"Import"** next to your repository (`construction-management-app`)

### 2.3 Configure Project Settings
**Important Settings:**
- **Framework Preset:** Select **"Vite"** (or it may auto-detect)
- **Root Directory:** Click **"Edit"** and set to `frontend`
- **Build Command:** `npm run build` (should be auto-filled)
- **Output Directory:** `dist` (should be auto-filled)
- **Install Command:** `npm install` (should be auto-filled)

### 2.4 Set Environment Variables
1. Click **"Environment Variables"** section
2. Click **"Add New"**
3. Add these variables:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.com/api` (replace with your actual backend URL)
   - **Environment:** Select all (Production, Preview, Development)
4. Click **"Save"**

**Note:** If you haven't deployed your backend yet, you can update this later.

### 2.5 Deploy
1. Click **"Deploy"** button
2. Wait 2-5 minutes for the build to complete
3. You'll see **"Building..."** → **"Success!"**
4. Your site is now live! 🎉

### 2.6 Get Your Live URL
- After deployment, you'll see: **"Visit: https://your-project-name.vercel.app"**
- Click on it to see your live site!
- This URL is permanent and free

---

## STEP 3: Update Backend URL (When Ready)

### 3.1 If Your Backend is Deployed
1. Go to your Vercel project dashboard
2. Go to **Settings** → **Environment Variables**
3. Edit `VITE_API_URL`
4. Update value to: `https://your-actual-backend-url.com/api`
5. Click **"Save"**
6. Go to **Deployments** tab
7. Click **"..."** on the latest deployment → **"Redeploy"**

### 3.2 Or Update in Frontend Code
Edit `frontend/.env.production`:
```
VITE_API_URL=https://your-actual-backend-url.com/api
```
Then push to GitHub (Vercel will auto-deploy):
```powershell
git add .
git commit -m "Update backend URL"
git push
```

---

## STEP 4: Configure CORS on Backend

**Important:** Your backend must allow requests from your frontend domain.

In your backend code (`backend/src/server.ts`), update CORS:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'https://your-project-name.vercel.app',  // Add your Vercel URL
    'https://*.vercel.app'  // Or allow all Vercel subdomains
  ],
  credentials: true
}));
```

---

## Alternative: Deploy to Netlify (Also FREE)

### Netlify Steps:
1. Go to https://netlify.com
2. Sign up with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your GitHub repository
5. Configure:
   - **Base directory:** `frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `frontend/dist`
6. Click **"Show advanced"** → **"New variable"**
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.com/api`
7. Click **"Deploy site"**
8. Your site will be at: `https://your-project-name.netlify.app`

---

## Quick Commands Summary

### Push to GitHub (First Time):
```powershell
cd C:\Users\Guest_VIPS\Downloads\ki
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

### Push Updates (After First Time):
```powershell
cd C:\Users\Guest_VIPS\Downloads\ki
git add .
git commit -m "Your update message"
git push
```

---

## Troubleshooting

### Build Fails?
- Check **Build Logs** in Vercel dashboard
- Make sure **Root Directory** is set to `frontend`
- Verify **Build Command** is `npm run build`

### API Not Working?
- Check `VITE_API_URL` environment variable is set correctly
- Verify backend CORS allows your frontend domain
- Check browser console for errors

### Can't Push to GitHub?
- Make sure you have Git installed
- Verify GitHub credentials
- Try: `git config --global user.name "Your Name"`
- Try: `git config --global user.email "your.email@example.com"`

---

## Summary

✅ **Step 1:** Push code to GitHub  
✅ **Step 2:** Sign up for Vercel  
✅ **Step 3:** Import project from GitHub  
✅ **Step 4:** Configure build settings (Root: `frontend`)  
✅ **Step 5:** Add environment variable (`VITE_API_URL`)  
✅ **Step 6:** Deploy!  
✅ **Step 7:** Update backend URL when ready  
✅ **Step 8:** Configure backend CORS  

**Your site will be live in ~5 minutes!** 🚀

