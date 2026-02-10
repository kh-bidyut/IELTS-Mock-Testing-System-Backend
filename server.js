#!/usr/bin/env node

/**
 * IELTS Mock Testing System - Server Entry Point
 * Professional Node.js Express Server with Industry Standards
 */

const createApp = require('./app');
const config = require('./config/app');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('💥 Process terminated!');
  });
});

// Start server
const startServer = async () => {
  try {
    const app = await createApp();
    
    const server = app.listen(config.server.port, () => {
      console.log('='.repeat(50));
      console.log(`🚀 ${config.app.name}`);
      console.log(`📡 Server running on port ${config.server.port}`);
      console.log(`🔧 Environment: ${config.server.nodeEnv}`);
      console.log(`🌐 API Version: ${config.server.apiVersion}`);
      console.log(`📅 Started: ${new Date().toISOString()}`);
      console.log('='.repeat(50));
      console.log(`Health check: http://localhost:${config.server.port}/api/health`);
      console.log(`API Docs: http://localhost:${config.server.port}/api/docs`);
      console.log('='.repeat(50));
    });

    // Handle server errors
    server.on('error', (error) => {
      if (error.syscall !== 'listen') {
        throw error;
      }

      const bind = typeof config.server.port === 'string'
        ? 'Pipe ' + config.server.port
        : 'Port ' + config.server.port;

      switch (error.code) {
        case 'EACCES':
          console.error(bind + ' requires elevated privileges');
          process.exit(1);
          break;
        case 'EADDRINUSE':
          console.error(bind + ' is already in use');
          process.exit(1);
          break;
        default:
          throw error;
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
startServer();