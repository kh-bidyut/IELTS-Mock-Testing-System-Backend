// Security middleware

const xss = require('xss-clean');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');

// XSS protection
const xssProtection = xss();

// HTTP Parameter Pollution protection
const hppProtection = hpp({
  whitelist: [
    'section',
    'difficulty',
    'sortBy',
    'page',
    'limit'
  ]
});

// MongoDB injection protection
const mongoSanitizeProtection = mongoSanitize({
  replaceWith: '_'
});

// Content security policy headers
const cspHeaders = (req, res, next) => {
  res.setHeader('Content-Security-Policy', 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net https://unpkg.com; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://api.cloudinary.com;"
  );
  next();
};

// Additional security headers
const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
};

module.exports = {
  xssProtection,
  hppProtection,
  mongoSanitizeProtection,
  cspHeaders,
  securityHeaders
};