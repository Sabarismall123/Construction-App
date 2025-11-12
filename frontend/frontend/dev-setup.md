# Development Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies

```bash
# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Start MongoDB

Make sure MongoDB is running on your system:
```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### 3. Configure Environment

```bash
# Backend environment
cd backend
cp env.example .env

# Edit .env file with your MongoDB connection:
# MONGODB_URI=mongodb://localhost:27017/construction_management
```

### 4. Start Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
Backend will run on: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on: http://localhost:3000

## 📊 Database Connection

The backend is configured to connect to MongoDB at:
```
mongodb://localhost:27017/construction_management
```

## 🔐 Default Users

After starting the backend, you can register users or use these test credentials:
- Email: admin@construction.com
- Password: admin123
- Role: admin

## 🛠️ Development Commands

### Frontend Commands
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend Commands
```bash
cd backend
npm run dev          # Start development server
npm run build        # Build TypeScript
npm start            # Start production server
```

## 📁 Project Structure

```
construction-management/
├── frontend/         # React + TypeScript frontend
├── backend/          # Node.js + Express + MongoDB backend
└── README.md         # Main project documentation
```

## 🔧 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify MongoDB port (default: 27017)

### Port Conflicts
- Frontend: Change port in `frontend/vite.config.ts`
- Backend: Change PORT in `backend/.env`

### Dependencies Issues
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again

## 📚 Next Steps

1. **Test the API**: Visit http://localhost:5000/health
2. **Test the Frontend**: Visit http://localhost:3000
3. **Register a User**: Use the registration form
4. **Explore Features**: Navigate through different modules

## 🚀 Production Deployment

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

### Backend
```bash
cd backend
npm run build
npm start
# Deploy to your server or cloud platform
```
