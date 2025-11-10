# 🚀 Deployment Checklist - Ready for Production

## ✅ Pre-Deployment Checks

### 1. Vercel Configuration ✅
- [x] `vercel.json` exists and is configured correctly
- [x] Build command: `npm run build`
- [x] Output directory: `dist`
- [x] Framework: Vite
- [x] Rewrites configured for SPA routing

### 2. Environment Variables (Set in Vercel Dashboard)
- [ ] `VITE_API_URL` - Set to your production backend URL
  - Example: `https://your-backend.onrender.com/api`
  - **Action Required:** Add this in Vercel Dashboard → Settings → Environment Variables

### 3. Git Configuration
- [x] `.gitignore` properly configured
- [x] No sensitive files committed
- [x] `node_modules` and `dist` are ignored

### 4. Build Configuration
- [x] `package.json` has correct build script
- [x] `vite.config.ts` is configured
- [x] TypeScript compilation should pass

### 5. API Configuration
- [x] API service uses environment variable `VITE_API_URL`
- [x] Fallback to localhost for development
- [x] Production URL placeholder (needs to be set in Vercel)

## 📋 Deployment Steps

### Step 1: Set Environment Variable in Vercel
1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Click **"Add New"**
4. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-actual-backend-url.com/api`
   - **Environment:** Select all (Production, Preview, Development)
5. Click **"Save"**

### Step 2: Verify Git Connection
```bash
# Check if Vercel is connected to your Git repository
# In Vercel Dashboard → Settings → Git
# Should show your connected repository
```

### Step 3: Push to Git (Auto-Deploy)
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main  # or master, depending on your branch
```

### Step 4: Monitor Deployment
1. Go to Vercel Dashboard → **Deployments**
2. Watch the build process
3. Check for any build errors
4. Verify deployment is successful

## 🔍 Post-Deployment Verification

### 1. Test Frontend
- [ ] Visit your Vercel URL
- [ ] Check if the app loads correctly
- [ ] Test login functionality
- [ ] Verify API calls are working

### 2. Check Console Logs
- [ ] Open browser DevTools → Console
- [ ] Look for `📡 Using API URL from env:` message
- [ ] Verify it's using the production backend URL

### 3. Test Key Features
- [ ] Login/Logout
- [ ] Dashboard loads
- [ ] Projects page
- [ ] Tasks page
- [ ] Attendance page
- [ ] Resources page

## ⚠️ Important Notes

### Backend CORS Configuration
Make sure your backend allows requests from your Vercel domain:
```typescript
// In backend/src/server.ts
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-vercel-app.vercel.app',  // Add your Vercel URL
    'https://*.vercel.app'  // Or allow all Vercel previews
  ],
  credentials: true
}));
```

### Environment Variables
- **Never commit** `.env` files to Git
- Always set environment variables in Vercel Dashboard
- Use `VITE_` prefix for Vite environment variables

### Auto-Deploy
- Vercel automatically deploys on every `git push` to the main branch
- Preview deployments are created for pull requests
- Production deployments are created for main branch pushes

## 🐛 Troubleshooting

### Build Fails
1. Check Vercel build logs
2. Verify `package.json` scripts are correct
3. Check for TypeScript errors: `npm run build:check`
4. Verify all dependencies are in `package.json`

### API Calls Fail
1. Check `VITE_API_URL` is set correctly in Vercel
2. Verify backend CORS allows your Vercel domain
3. Check browser console for API errors
4. Verify backend is deployed and running

### Routing Issues
1. Verify `vercel.json` has rewrites configured
2. Check that all routes redirect to `index.html`

## ✅ Ready to Deploy!

If all checks pass:
1. Set `VITE_API_URL` in Vercel Dashboard
2. Push to Git: `git push origin main`
3. Monitor deployment in Vercel Dashboard
4. Test your live site!

---

**Last Updated:** $(date)
**Status:** ✅ Ready for deployment

