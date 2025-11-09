# MongoDB Atlas Connection Setup Guide

## Issue: IP Address Not Whitelisted

If you're seeing this error:
```
Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Solution: Whitelist Your IP Address

### Option 1: Whitelist Your Current IP (Recommended for Production)

1. **Get Your Current IP Address:**
   - Visit: https://whatismyipaddress.com/
   - Copy your IPv4 address (e.g., `123.45.67.89`)

2. **Add IP to MongoDB Atlas Whitelist:**
   - Go to: https://cloud.mongodb.com/
   - Log in to your MongoDB Atlas account
   - Select your cluster (e.g., `Cluster0`)
   - Click on **"Network Access"** in the left sidebar
   - Click **"Add IP Address"** button
   - Choose one of these options:
     - **"Add Current IP Address"** (if available) - This automatically adds your current IP
     - **"Add IP Address"** - Enter your IP manually (e.g., `123.45.67.89`)
   - Click **"Confirm"**
   - Wait 1-2 minutes for the changes to take effect

### Option 2: Allow All IPs (For Development Only - Less Secure)

⚠️ **Warning:** This allows access from any IP address. Only use this for development!

1. Go to MongoDB Atlas Dashboard
2. Navigate to **"Network Access"**
3. Click **"Add IP Address"**
4. Enter: `0.0.0.0/0` (this allows all IPs)
5. Add a comment: "Development - Allow all IPs"
6. Click **"Confirm"**

### Option 3: Use MongoDB Compass Connection String (Alternative)

If you're still having issues, you can test the connection using MongoDB Compass:

1. Download MongoDB Compass: https://www.mongodb.com/try/download/compass
2. Use your connection string from Atlas
3. If Compass connects successfully, the issue is with the Node.js connection
4. If Compass also fails, the issue is with IP whitelisting

## Verify Connection

After whitelisting your IP:

1. Wait 1-2 minutes for changes to propagate
2. Restart your backend server
3. Check the console for: `✅ MongoDB connected successfully`

## Troubleshooting

### Still Can't Connect?

1. **Check Connection String:**
   - Make sure your `.env` file has the correct `MONGODB_URI`
   - Format: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database?retryWrites=true&w=majority`

2. **Check Username/Password:**
   - Verify your MongoDB Atlas username and password are correct
   - Make sure there are no special characters that need URL encoding

3. **Check Database Name:**
   - Ensure the database name in the connection string matches what you expect
   - Default: `construction_management`

4. **Check Network/Firewall:**
   - Some corporate networks block MongoDB connections
   - Try from a different network (mobile hotspot, home network)

5. **Check Atlas Cluster Status:**
   - Make sure your cluster is running (not paused)
   - Go to Atlas Dashboard → Clusters → Check status

## Quick Test

Run this command to test your connection string:

```bash
# Replace with your actual connection string
mongosh "mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/construction_management?retryWrites=true&w=majority"
```

If this connects, your IP is whitelisted and credentials are correct.
