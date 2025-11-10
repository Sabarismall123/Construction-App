import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Import routes
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import taskRoutes from './routes/tasks';
import issueRoutes from './routes/issues';
import resourceRoutes from './routes/resources';
import attendanceRoutes from './routes/attendance';
import pettyCashRoutes from './routes/pettyCash';
import commercialRoutes from './routes/commercial';
import userRoutes from './routes/users';
import reportRoutes from './routes/reports';
import fileRoutes from './routes/files';
import inventoryRoutes from './routes/inventory';
import materialIssuesRoutes from './routes/materialIssues';
import materialReturnsRoutes from './routes/materialReturns';
import materialConsumptionsRoutes from './routes/materialConsumptions';
import siteTransfersRoutes from './routes/siteTransfers';
import labourRoutes from './routes/labours';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// CORS must come before other middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5174',
      'https://construction-app-o7qj.vercel.app',
      'https://construction-app-o7qj-o3h1wiua9-sabaris-projects-383b3041.vercel.app',
      'https://construction-app.vercel.app',
      /^https:\/\/construction-app.*\.vercel\.app$/,
      'capacitor://localhost',
      'ionic://localhost',
      'http://localhost'
    ];
    
    // Check if origin matches any allowed origin
    const isAllowed = allowedOrigins.some(allowedOrigin => {
      if (allowedOrigin instanceof RegExp) {
        return allowedOrigin.test(origin);
      }
      return allowedOrigin === origin;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
}));

// Security middleware (after CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting - disabled in development, enabled in production
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
if (!isDevelopment) {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  app.use(limiter);
  console.log('✅ Rate limiting enabled for production');
} else {
  console.log('⚠️  Rate limiting disabled for development');
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/petty-cash', pettyCashRoutes);
app.use('/api/commercial', commercialRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/site-transfers', siteTransfersRoutes);
app.use('/api/material-issues', materialIssuesRoutes);
app.use('/api/material-returns', materialReturnsRoutes);
app.use('/api/material-consumptions', materialConsumptionsRoutes);
app.use('/api/labours', labourRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Database connection with retry logic
const connectDB = async (retries = 5, delay = 5000) => {
  const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/construction_management';
  
  const mongooseOptions = {
    serverSelectionTimeoutMS: 10000, // Timeout after 10s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 1, // Maintain at least 1 socket connection
    maxIdleTimeMS: 30000, // Close connections after 30s of inactivity
    connectTimeoutMS: 10000, // Give up initial connection after 10s
    // bufferCommands is enabled by default, no need to specify
  };

  for (let i = 0; i < retries; i++) {
    try {
      await mongoose.connect(mongoURI, mongooseOptions);
      console.log('✅ MongoDB connected successfully');
      console.log(`📊 Database: ${mongoose.connection.name}`);
      
      // Handle connection events
      mongoose.connection.on('error', (err) => {
        console.error('❌ MongoDB connection error:', err);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
        connectDB(3, 5000); // Retry with fewer attempts
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('✅ MongoDB reconnected successfully');
      });
      
      return;
    } catch (error: any) {
      console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, error.message);
      
      if (i < retries - 1) {
        console.log(`⏳ Retrying in ${delay / 1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        console.error('❌ MongoDB connection failed after all retries');
        console.warn('⚠️  Server will continue without database connection');
        console.warn('⚠️  Some features may not work until MongoDB is available');
        console.warn('💡 To fix MongoDB Atlas connection:');
        console.warn('   1. Go to: https://cloud.mongodb.com/');
        console.warn('   2. Navigate to: Network Access → Add IP Address');
        console.warn('   3. Click "Add Current IP Address" or enter your IP manually');
        console.warn('   4. Wait 1-2 minutes for changes to take effect');
        console.warn('   5. For development, you can allow all IPs: 0.0.0.0/0 (less secure)');
        console.warn('   📖 See MONGODB_ATLAS_SETUP.md for detailed instructions');
        // Throw error so server startup can handle it
        throw new Error('MongoDB connection failed after all retries');
      }
    }
  }
  // If we get here, all retries failed
  throw new Error('MongoDB connection failed');
};

// Start server
const startServer = async () => {
  try {
    // Try to connect to database first
    console.log('🔄 Attempting to connect to MongoDB...');
    await connectDB();
    
    // Start server after database connection is established
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: http://localhost:5173`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    // If connection fails, still start server but warn user
    console.warn('⚠️  Starting server without database connection...');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT} (without database)`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Frontend URL: http://localhost:5173`);
      console.log(`🔗 API URL: http://localhost:${PORT}/api`);
      console.warn('⚠️  Database operations will fail until MongoDB is connected');
    });
  }
};

startServer();

export default app;
