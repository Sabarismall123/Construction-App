# Free Frontend Hosting Guide

## Option 1: Vercel (Recommended - Easiest)

### Steps:

1. **Create a GitHub Repository** (if not already done):
   ```bash
   cd frontend
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git push -u origin main
   ```

2. **Sign up for Vercel**:
   - Go to https://vercel.com
   - Sign up with GitHub (free)

3. **Deploy**:
   - Click "New Project"
   - Import your GitHub repository
   - Framework Preset: **Vite**
   - Root Directory: `frontend` (if your repo has frontend folder)
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Click "Deploy"

4. **Configure Environment Variables** (if needed):
   - Go to Project Settings → Environment Variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`

5. **Done!** Your site will be live at: `https://your-project.vercel.app`

---

## Option 2: Netlify

### Steps:

1. **Create a GitHub Repository** (same as above)

2. **Sign up for Netlify**:
   - Go to https://netlify.com
   - Sign up with GitHub (free)

3. **Deploy**:
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository
   - Build settings:
     - Base directory: `frontend`
     - Build command: `npm run build`
     - Publish directory: `frontend/dist`
   - Click "Deploy site"

4. **Configure Environment Variables**:
   - Go to Site settings → Environment variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`

5. **Done!** Your site will be live at: `https://your-project.netlify.app`

---

## Option 3: Cloudflare Pages

### Steps:

1. **Create a GitHub Repository** (same as above)

2. **Sign up for Cloudflare Pages**:
   - Go to https://pages.cloudflare.com
   - Sign up (free)

3. **Deploy**:
   - Click "Create a project" → "Connect to Git"
   - Select your repository
   - Build settings:
     - Framework preset: **Vite**
     - Build command: `npm run build`
     - Build output directory: `dist`
   - Click "Save and Deploy"

4. **Configure Environment Variables**:
   - Go to Settings → Environment variables
   - Add: `VITE_API_URL` = `https://your-backend-url.com/api`

5. **Done!** Your site will be live at: `https://your-project.pages.dev`

---

## Option 4: GitHub Pages (Free but requires manual setup)

### Steps:

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add to package.json**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages**:
   - Go to repository Settings → Pages
   - Source: `gh-pages` branch
   - Your site: `https://YOUR_USERNAME.github.io/YOUR_REPO`

---

## Important: Update API URL

Before deploying, you need to update the API URL in your code:

1. **Create `.env` file** in `frontend` folder:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```

2. **Update `frontend/src/services/api.ts`**:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
   ```

3. **For production**, set the environment variable in your hosting platform.

---

## Quick Setup Commands:

```bash
# 1. Navigate to frontend
cd frontend

# 2. Create .env file (for local development)
echo "VITE_API_URL=http://localhost:5000/api" > .env

# 3. Create .env.production file (for production)
echo "VITE_API_URL=https://your-backend-url.com/api" > .env.production

# 4. Build to test
npm run build
```

---

## Recommended Hosting Order:

1. **Vercel** - Best for React/Vite, automatic deployments, free SSL
2. **Netlify** - Similar to Vercel, great free tier
3. **Cloudflare Pages** - Fast CDN, free SSL
4. **GitHub Pages** - Free but manual setup

Choose Vercel for the easiest setup!

