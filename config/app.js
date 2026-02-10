// Application configuration and constants
const config = {
  // Server configuration
  server: {
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    nodeEnv: process.env.NODE_ENV || 'development',
    apiVersion: 'v1'
  },

  // Database configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ielts-mock-testing',
    options: {
      retryWrites: true,
      w: 'majority'
    }
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key-here',
    jwtExpiration: process.env.JWT_EXPIRATION || '7d',
    saltRounds: parseInt(process.env.SALT_ROUNDS) || 12,
    corsOrigins: process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [
          process.env.CLIENT_URL || 'http://localhost:5173',
          'http://localhost:5174',
          'http://localhost:5175'
        ]
  },

  // Rate limiting configuration
  rateLimit: {
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    },
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 login requests per windowMs
      message: 'Too many authentication attempts, please try again later.',
      skipSuccessfulRequests: true
    }
  },

  // File upload configuration
  upload: {
    maxSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'audio/mpeg', 'audio/wav'],
    uploadDir: 'uploads'
  },

  // Cloudinary configuration
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },

  // Logging configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: process.env.NODE_ENV === 'production' ? 'json' : 'combined'
  },

  // Application constants
  app: {
    name: 'IELTS Mock Testing System',
    version: '1.0.0',
    description: 'Professional IELTS Computer-Based Exam Platform'
  }
};

module.exports = config;