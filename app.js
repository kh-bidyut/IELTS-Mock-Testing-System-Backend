const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/app');
const connectDB = require('./config/database');

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
const { notFoundResponse } = require('./utils/response');

// Routes
const authRoutes = require('./routes/auth');
const testRoutes = require('./routes/tests');
const userRoutes = require('./routes/users');
const mediaRoutes = require('./routes/media');
const analyticsRoutes = require('./routes/analytics');

const createApp = async () => {
  // Connect to database
  await connectDB();

  const app = express();

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
  const corsOptions = {
    origin: config.security.corsOrigins,
    credentials: true,
    optionsSuccessStatus: 200,
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
  app.use(morgan(config.logging.format));

  // Body parsing
  app.use(express.json({ limit: config.upload.maxSize }));
  app.use(express.urlencoded({ extended: true, limit: config.upload.maxSize }));

  // Routes
  app.use(`/api/${config.server.apiVersion}/auth`, authRoutes);
  app.use(`/api/${config.server.apiVersion}/tests`, testRoutes);
  app.use(`/api/${config.server.apiVersion}/users`, userRoutes);
  app.use(`/api/${config.server.apiVersion}/media`, mediaRoutes);
  app.use(`/api/${config.server.apiVersion}/analytics`, analyticsRoutes);

  // Serve static files from uploads directory
  app.use('/uploads', express.static(config.upload.uploadDir));

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({ 
      status: 'OK', 
      service: config.app.name,
      version: config.app.version,
      message: `${config.app.name} API is running`,
      timestamp: new Date().toISOString(),
      environment: config.server.nodeEnv
    });
  });

  // API Documentation endpoint
  app.get('/api/docs', (req, res) => {
    res.status(200).json({
      service: config.app.name,
      version: config.app.version,
      endpoints: {
        auth: `/api/${config.server.apiVersion}/auth`,
        tests: `/api/${config.server.apiVersion}/tests`,
        users: `/api/${config.server.apiVersion}/users`,
        media: `/api/${config.server.apiVersion}/media`,
        analytics: `/api/${config.server.apiVersion}/analytics`,
        health: '/api/health'
      },
      documentation: 'API documentation will be available soon'
    });
  });

  // Error handling middleware
  app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    // Mongoose validation errors
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }

    // Mongoose duplicate key errors
    if (err.code === 11000) {
      const field = Object.keys(err.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `Duplicate ${field} value entered`
      });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    // Default error
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Internal Server Error',
      ...(config.server.nodeEnv === 'development' && { stack: err.stack })
    });
  });

  // 404 handler
  app.use('*', (req, res) => {
    notFoundResponse(res, 'Route not found');
  });

  return app;
};

module.exports = createApp;