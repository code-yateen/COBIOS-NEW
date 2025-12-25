# Cobios Gym Management System - Backend

A comprehensive gym management system backend built with the MERN stack (MongoDB, Express.js, Node.js).

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher) OR MongoDB Atlas account
- OpenAI API key (for AI features - optional)

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configurations:
   - MongoDB URI
   - JWT secrets (must be at least 32 characters)
   - Email configuration (optional)
   - OpenAI API key (optional, for AI features)

3. **Start the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   # Production mode
   npm start
   ```

4. **Verify installation**
   ```bash
   curl http://localhost:5000/api/health
   ```

## Project Structure

```
server/
├── src/
│   ├── config/          # Configuration files
│   ├── models/          # Database models
│   ├── controllers/     # Route controllers
│   ├── routes/          # API routes
│   ├── middleware/      # Express middleware
│   ├── services/        # Business logic services
│   ├── utils/           # Utility functions
│   ├── validators/      # Input validators
│   └── app.js           # Express app setup
├── server.js            # Entry point
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Users (Admin only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Members
- `GET /api/members` - Get all members
- `GET /api/members/:id` - Get member by ID
- `POST /api/members` - Create new member (Admin)
- `PUT /api/members/:id` - Update member
- `GET /api/members/:id/progress` - Get member progress
- `GET /api/members/:id/plans` - Get member plans

### Trainers
- `GET /api/trainers` - Get all trainers
- `GET /api/trainers/:id` - Get trainer by ID
- `POST /api/trainers` - Create trainer (Admin)
- `GET /api/trainers/:id/members` - Get trainer's members

### Memberships
- `GET /api/memberships` - Get all memberships (Public)
- `GET /api/memberships/:id` - Get membership by ID
- `POST /api/memberships` - Create membership (Admin)

### Payments
- `GET /api/payments` - Get all payments (Admin)
- `POST /api/payments` - Create payment (Admin)
- `GET /api/payments/member/:memberId` - Get member's payments

### Workout Plans
- `GET /api/workout-plans` - Get all plans (Admin)
- `POST /api/workout-plans` - Create plan (Admin, Trainer)
- `GET /api/workout-plans/member/:memberId` - Get member's plans

### Diet Plans
- `GET /api/diet-plans` - Get all plans (Admin)
- `POST /api/diet-plans` - Create plan (Admin, Trainer)
- `GET /api/diet-plans/member/:memberId` - Get member's plans

### Progress
- `GET /api/progress/member/:memberId` - Get member progress
- `POST /api/progress/:memberId/record` - Add progress record

### Attendance
- `POST /api/attendance/check-in` - Member check-in
- `POST /api/attendance/check-out` - Member check-out
- `GET /api/attendance/today` - Get today's attendance

### Feedback
- `POST /api/feedback` - Submit feedback (Member)
- `GET /api/feedback` - Get all feedback (Admin)

### Notifications
- `GET /api/notifications` - Get user's notifications
- `GET /api/notifications/unread` - Get unread notifications
- `PATCH /api/notifications/:id/read` - Mark as read

### AI Features
- `POST /api/ai/generate-workout-plan` - Generate AI workout plan (Admin, Trainer)
- `POST /api/ai/generate-diet-plan` - Generate AI diet plan (Admin, Trainer)
- `POST /api/ai/request-plan` - Request AI plan (Member)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login** - Returns `accessToken` (15 min) and `refreshToken` (7 days)
2. **Protected Routes** - Include `Authorization: Bearer <accessToken>` header
3. **Refresh Token** - Use `/api/auth/refresh` when access token expires
4. **Logout** - Revokes refresh token

## Role-Based Access Control

- **Admin**: Full access to all endpoints
- **Trainer**: Access to assigned members, can create plans
- **Member**: Access to own data, can check-in/out, submit feedback

## Environment Variables

See `.env.example` for all required environment variables.

**Required:**
- `MONGODB_URI` - MongoDB connection string
- `JWT_ACCESS_SECRET` - Secret for access tokens (min 32 chars)
- `JWT_REFRESH_SECRET` - Secret for refresh tokens (min 32 chars)

**Optional:**
- `OPENAI_API_KEY` - For AI plan generation
- `SMTP_*` - For email notifications

## Development

```bash
# Run in development mode
npm run dev

# Run in production mode
npm start
```

## Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Rate limiting
- Input validation
- CORS protection
- Helmet security headers
- Role-based access control

## License

MIT License

