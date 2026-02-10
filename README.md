# IELTS Mock Testing System - Backend API

A comprehensive backend API for an IELTS mock testing platform built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication**: JWT-based authentication with role-based access control
- 📝 **Test Management**: Create, read, update, delete mock tests
- 📊 **Analytics**: Detailed performance tracking and statistics
- 🖼️ **Media Handling**: Cloudinary integration for audio/image uploads
- 🔍 **Advanced Search**: Filtering, sorting, and pagination
- 🛡️ **Security**: Rate limiting, XSS protection, and input sanitization
- 📈 **Performance Tracking**: Timer functionality and detailed scoring

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT + bcrypt
- **File Storage**: Cloudinary
- **Validation**: express-validator
- **Security**: express-rate-limit, xss-clean, hpp, express-mongo-sanitize

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file with the following variables:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/ielts-mock-testing

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Client URL
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Upload limits
FILE_SIZE_LIMIT=50mb
```

4. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start

# Seed database with sample data
npm run seed
```

## API Endpoints

### Authentication Routes (`/api/auth`)

#### Register User
```http
POST /api/auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Login User
```http
POST /api/auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
```
**Headers:**
```
Authorization: Bearer <token>
```

#### Update Profile
```http
PUT /api/auth/profile
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "name": "John Smith",
  "email": "johnsmith@example.com"
}
```

### Test Routes (`/api/tests`)

#### Get All Tests
```http
GET /api/tests
```
**Query Parameters:**
- `section` - Filter by section (Listening, Reading, Writing, Speaking)
- `difficulty` - Filter by difficulty (Beginner, Intermediate, Advanced)
- `search` - Search in title or description
- `sortBy` - Sort field (default: createdAt)
- `sortOrder` - asc or desc (default: desc)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)

#### Get Single Test
```http
GET /api/tests/:id
```

#### Create Test (Admin only)
```http
POST /api/tests
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "title": "IELTS Listening Practice Test",
  "section": "Listening",
  "difficulty": "Intermediate",
  "description": "Practice your listening skills",
  "timeLimit": 30,
  "questions": [
    {
      "questionText": "What is the main topic?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A"
    }
  ]
}
```

#### Update Test (Admin/Creator only)
```http
PATCH /api/tests/:id
```
**Headers:**
```
Authorization: Bearer <token>
```

#### Delete Test (Admin/Creator only)
```http
DELETE /api/tests/:id
```
**Headers:**
```
Authorization: Bearer <token>
```

#### Submit Test Answers
```http
POST /api/tests/:id/submit
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request Body:**
```json
{
  "answers": ["Answer 1", "Answer 2", "Answer 3"],
  "startTime": "2023-01-01T10:00:00.000Z",
  "timeTaken": 1800
}
```

### User Routes (`/api/users`)

#### Get All Users (Admin only)
```http
GET /api/users
```
**Headers:**
```
Authorization: Bearer <token>
```
**Query Parameters:**
- `search` - Search by name or email
- `role` - Filter by role (user, admin)
- `sortBy` - Sort field
- `sortOrder` - asc or desc
- `page` - Page number
- `limit` - Items per page

#### Get User Attempts (Admin only)
```http
GET /api/users/attempts
```
**Headers:**
```
Authorization: Bearer <token>
```

#### Get User Statistics (Admin only)
```http
GET /api/users/stats
```
**Headers:**
```
Authorization: Bearer <token>
```

#### Get My Attempts
```http
GET /api/users/my-attempts
```
**Headers:**
```
Authorization: Bearer <token>
```

### Media Routes (`/api/media`)

#### Upload Media File (Admin only)
```http
POST /api/media/upload
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Form Data:**
- `media` - File to upload

#### Upload Profile Picture
```http
POST /api/media/profile-picture
```
**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```
**Form Data:**
- `profilePic` - Image file

#### Delete Media File (Admin only)
```http
DELETE /api/media/:publicId
```
**Headers:**
```
Authorization: Bearer <token>
```

### Analytics Routes (`/api/analytics`)

#### Get User Statistics
```http
GET /api/analytics/user-stats
```
**Headers:**
```
Authorization: Bearer <token>
```

#### Get Performance Trend
```http
GET /api/analytics/performance-trend
```
**Headers:**
```
Authorization: Bearer <token>
```
**Query Parameters:**
- `days` - Number of days to analyze (default: 30)

#### Get Section Performance
```http
GET /api/analytics/section-performance
```
**Headers:**
```
Authorization: Bearer <token>
```

#### Get Recent Activity
```http
GET /api/analytics/recent-activity
```
**Headers:**
```
Authorization: Bearer <token>
```

#### Get Test Statistics
```http
GET /api/analytics/test-stats/:id
```
**Headers:**
```
Authorization: Bearer <token>
```

#### Get Platform Statistics (Admin only)
```http
GET /api/analytics/platform-stats
```
**Headers:**
```
Authorization: Bearer <token>
```

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error description"
}
```

Common HTTP status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

## Rate Limiting

- **General API**: 100 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Test Submission**: 10 submissions per hour
- **File Upload**: 20 uploads per hour

## Security Features

- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- XSS protection
- HTTP Parameter Pollution protection
- MongoDB injection protection
- Rate limiting
- Security headers

## Database Models

### User Model
```javascript
{
  name: String,
  email: String,
  password: String,
  role: { type: String, enum: ['user', 'admin'] },
  profilePic: String,
  profilePicPublicId: String,
  testAttempts: [{
    testId: ObjectId,
    score: Number,
    sectionScores: {
      listening: Number,
      reading: Number,
      writing: Number,
      speaking: Number
    },
    answers: [{
      questionId: ObjectId,
      questionText: String,
      userAnswer: String,
      correctAnswer: String,
      isCorrect: Boolean,
      options: [String]
    }],
    timeTaken: Number,
    date: Date
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Test Model
```javascript
{
  title: String,
  section: { type: String, enum: ['Listening', 'Reading', 'Writing', 'Speaking'] },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'] },
  description: String,
  timeLimit: Number,
  questions: [{
    questionText: String,
    options: [String],
    correctAnswer: String,
    media: String,
    mediaType: { type: String, enum: ['audio', 'image', 'none'] }
  }],
  createdBy: ObjectId,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## Sample Data

Run `npm run seed` to populate the database with sample data including:
- Admin user (admin@example.com / admin123)
- Regular user (user@example.com / user123)
- Sample tests for each section

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

This project is licensed under the MIT License.