const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

// Security middleware
const { 
  xssProtection, 
  hppProtection, 
  mongoSanitizeProtection, 
  cspHeaders, 
  securityHeaders 
} = require('./middleware/security');

// Rate limiting
const { generalLimiter, authLimiter } = require('./middleware/rateLimiter');

// Utility functions
const { ensureUploadsDir } = require('./utils/fileUpload');

const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const userRoutes = require('./routes/users');
const mediaRoutes = require('./routes/media');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 5000;

// Ensure uploads directory exists
ensureUploadsDir();

// Security middleware
app.use(securityHeaders);
app.use(cspHeaders);
app.use(helmet());
app.use(xssProtection);
app.use(hppProtection);
app.use(mongoSanitizeProtection);

// Rate limiting
app.use('/api/auth', authLimiter);
app.use('/api/', generalLimiter);

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',') 
  : [process.env.CLIENT_URL || 'http://localhost:5173'];

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin', 
    'X-Requested-With', 
    'Content-Type', 
    'Accept', 
    'Authorization',
    'Access-Control-Allow-Credentials',
    'X-CSRF-Token'
  ]
};
app.use(cors(corsOptions));

// Logging
app.use(morgan('combined'));

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-mock-testing')
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/users', userRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/analytics', analyticsRoutes);

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    message: 'IELTS Mock Testing System API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler
app.use('*', (req, res) => {
  const { notFoundResponse } = require('./utils/response');
  notFoundResponse(res, 'Route not found');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});