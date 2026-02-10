# IELTS Mock Testing System - Server

Professional backend server for the IELTS Computer-Based Exam platform, built with Node.js, Express, and MongoDB.

## 🏗️ Architecture

```
server/
├── config/          # Application configuration
├── controllers/     # Business logic handlers
├── middleware/      # Custom middleware
├── models/          # Database models
├── routes/          # API route definitions
├── utils/           # Utility functions
├── uploads/         # File upload directory
├── app.js          # Express application setup
└── server.js       # Server entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 16.0.0
- MongoDB >= 4.4
- npm >= 8.0.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev

# Start production server
npm start
```

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/logout` - User logout
- `GET /api/v1/auth/profile` - Get user profile

### Tests
- `GET /api/v1/tests` - Get all tests
- `GET /api/v1/tests/:id` - Get test by ID
- `POST /api/v1/tests` - Create new test
- `PUT /api/v1/tests/:id` - Update test
- `DELETE /api/v1/tests/:id` - Delete test

### Users
- `GET /api/v1/users` - Get all users (admin only)
- `GET /api/v1/users/:id` - Get user by ID
- `PUT /api/v1/users/:id` - Update user
- `DELETE /api/v1/users/:id` - Delete user

### Media
- `POST /api/v1/media/upload` - Upload media files
- `GET /api/v1/media/:id` - Get media by ID

### Analytics
- `GET /api/v1/analytics/dashboard` - Get dashboard analytics
- `GET /api/v1/analytics/user/:id` - Get user analytics

### Health & Monitoring
- `GET /api/health` - Health check endpoint
- `GET /api/docs` - API documentation

## 🔧 Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ielts-mock-testing

# Security Configuration
JWT_SECRET=your-jwt-secret-key-here
JWT_EXPIRATION=7d
SALT_ROUNDS=12
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Client Configuration
CLIENT_URL=http://localhost:5173

# Logging Configuration
LOG_LEVEL=info
```

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Start development server with nodemon
npm run debug        # Start server with debugging enabled

# Production
npm start           # Start production server

# Database Operations
npm run seed        # Seed database with sample data
npm run migrate     # Run database migrations
npm run clean       # Clean uploads directory

# Code Quality
npm run lint        # Check code style with ESLint
npm run lint:fix    # Fix code style issues
npm run prettier    # Format code with Prettier
npm run prettier:check # Check code formatting

# Health Check
npm run health      # Check server health
```

## 🔒 Security Features

- **Helmet.js**: Security headers
- **CORS**: Cross-origin resource sharing protection
- **Rate Limiting**: Prevent abuse and DDoS attacks
- **XSS Protection**: Cross-site scripting prevention
- **MongoDB Sanitization**: Prevent NoSQL injection
- **HTTP Parameter Pollution**: Protect against HPP attacks
- **JWT Authentication**: Secure token-based authentication

## 📊 Performance & Monitoring

- Request logging with Morgan
- Database connection pooling
- Graceful shutdown handling
- Error handling and logging
- Health check endpoints
- API versioning

## 🏗️ Industry Standards Implemented

- ✅ Clean architecture with separation of concerns
- ✅ Configuration management
- ✅ Environment-based configuration
- ✅ Proper error handling
- ✅ Security best practices
- ✅ Logging and monitoring
- ✅ API versioning
- ✅ Graceful shutdown procedures
- ✅ Health check endpoints
- ✅ Comprehensive documentation
- ✅ Standardized development scripts

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@ielts-mock-testing.com or join our Slack channel.