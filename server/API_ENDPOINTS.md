# Cobios Gym Management System - Complete API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require an `Authorization` header:
```
Authorization: Bearer <accessToken>
```

---

## Authentication Routes

### POST `/auth/login`
**Description:** User login  
**Access:** Public  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token"
  }
}
```

### POST `/auth/register`
**Description:** User registration  
**Access:** Public  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "member",
  "phone": "1234567890"
}
```

### POST `/auth/refresh`
**Description:** Refresh access token  
**Access:** Public  
**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### POST `/auth/logout`
**Description:** User logout  
**Access:** Authenticated  
**Request Body:**
```json
{
  "refreshToken": "refresh_token"
}
```

### POST `/auth/forgot-password`
**Description:** Request password reset  
**Access:** Public  
**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### POST `/auth/reset-password/:token`
**Description:** Reset password  
**Access:** Public  
**Request Body:**
```json
{
  "password": "newpassword123"
}
```

### GET `/auth/me`
**Description:** Get current user  
**Access:** Authenticated

---

## User Routes (Admin Only)

### GET `/users`
**Description:** Get all users  
**Access:** Admin  
**Query Parameters:**
- `role` (optional): Filter by role
- `isActive` (optional): Filter by active status
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

### GET `/users/:id`
**Description:** Get user by ID  
**Access:** Admin

### POST `/users`
**Description:** Create new user  
**Access:** Admin  
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "member",
  "phone": "1234567890"
}
```

### PUT `/users/:id`
**Description:** Update user  
**Access:** Admin  
**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543210"
}
```

### DELETE `/users/:id`
**Description:** Delete user  
**Access:** Admin

### PATCH `/users/:id/status`
**Description:** Toggle user active status  
**Access:** Admin

---

## Member Routes

### GET `/members`
**Description:** Get all members  
**Access:** Admin, Trainer  
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

### GET `/members/:id`
**Description:** Get member by ID  
**Access:** Admin, Trainer, Self

### POST `/members`
**Description:** Create new member  
**Access:** Admin  
**Request Body:**
```json
{
  "email": "member@example.com",
  "password": "password123",
  "name": "Member Name",
  "phone": "1234567890",
  "trainerId": "trainer_id",
  "membershipId": "membership_id"
}
```

### PUT `/members/:id`
**Description:** Update member  
**Access:** Admin, Self  
**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "9876543210"
}
```

### DELETE `/members/:id`
**Description:** Delete member  
**Access:** Admin

### GET `/members/:id/progress`
**Description:** Get member progress  
**Access:** Admin, Trainer, Self

### GET `/members/:id/plans`
**Description:** Get member's workout and diet plans  
**Access:** Admin, Trainer, Self

### GET `/members/:id/attendance`
**Description:** Get member's attendance records  
**Access:** Admin, Trainer, Self

---

## Trainer Routes

### GET `/trainers`
**Description:** Get all trainers  
**Access:** Admin

### GET `/trainers/:id`
**Description:** Get trainer by ID  
**Access:** Admin, Self

### POST `/trainers`
**Description:** Create new trainer  
**Access:** Admin  
**Request Body:**
```json
{
  "email": "trainer@example.com",
  "password": "password123",
  "name": "Trainer Name",
  "specialization": "Weight Training",
  "experience": 5,
  "certifications": ["Cert 1", "Cert 2"]
}
```

### PUT `/trainers/:id`
**Description:** Update trainer  
**Access:** Admin, Self  
**Request Body:**
```json
{
  "specialization": "Updated Specialization",
  "experience": 6
}
```

### DELETE `/trainers/:id`
**Description:** Delete trainer  
**Access:** Admin

### GET `/trainers/:id/members`
**Description:** Get trainer's assigned members  
**Access:** Admin, Self

### POST `/trainers/:id/assign-member`
**Description:** Assign member to trainer  
**Access:** Admin  
**Request Body:**
```json
{
  "memberId": "member_id"
}
```

### DELETE `/trainers/:id/unassign-member/:memberId`
**Description:** Unassign member from trainer  
**Access:** Admin

---

## Membership Routes

### GET `/memberships`
**Description:** Get all membership plans  
**Access:** Public

### GET `/memberships/:id`
**Description:** Get membership by ID  
**Access:** Public

### POST `/memberships`
**Description:** Create new membership  
**Access:** Admin  
**Request Body:**
```json
{
  "name": "Premium Plan",
  "duration": 3,
  "durationType": "months",
  "cost": 2999,
  "benefits": ["Benefit 1", "Benefit 2"],
  "color": "#FF5733"
}
```

### PUT `/memberships/:id`
**Description:** Update membership  
**Access:** Admin  
**Request Body:**
```json
{
  "cost": 3499,
  "benefits": ["Updated Benefit"]
}
```

### DELETE `/memberships/:id`
**Description:** Delete membership  
**Access:** Admin

### PATCH `/memberships/:id/status`
**Description:** Toggle membership status  
**Access:** Admin

---

## Payment Routes

### GET `/payments`
**Description:** Get all payments  
**Access:** Admin  
**Query Parameters:**
- `status` (optional): Filter by status
- `page` (optional): Page number
- `limit` (optional): Items per page

### GET `/payments/:id`
**Description:** Get payment by ID  
**Access:** Admin, Self

### POST `/payments`
**Description:** Create new payment  
**Access:** Admin  
**Request Body:**
```json
{
  "memberId": "member_id",
  "membershipId": "membership_id",
  "amount": 2999,
  "paymentMethod": "Credit Card",
  "status": "completed"
}
```

### PUT `/payments/:id`
**Description:** Update payment  
**Access:** Admin  
**Request Body:**
```json
{
  "status": "completed",
  "amount": 3499
}
```

### DELETE `/payments/:id`
**Description:** Delete payment  
**Access:** Admin

### GET `/payments/member/:memberId`
**Description:** Get member's payments  
**Access:** Admin, Self

### GET `/payments/stats`
**Description:** Get payment statistics  
**Access:** Admin

### PATCH `/payments/:id/status`
**Description:** Update payment status  
**Access:** Admin  
**Request Body:**
```json
{
  "status": "completed"
}
```

---

## Workout Plan Routes

### GET `/workout-plans`
**Description:** Get all workout plans  
**Access:** Admin

### GET `/workout-plans/:id`
**Description:** Get workout plan by ID  
**Access:** Admin, Trainer, Member (own plan)

### POST `/workout-plans`
**Description:** Create new workout plan  
**Access:** Admin, Trainer  
**Request Body:**
```json
{
  "memberId": "member_id",
  "planName": "Beginner Plan",
  "goal": "Weight Loss",
  "duration": "12 weeks",
  "schedule": [
    {
      "day": "Monday",
      "focus": "Chest & Triceps",
      "exercises": [
        {
          "name": "Push-ups",
          "sets": 3,
          "reps": "10-12",
          "rest": "60s"
        }
      ]
    }
  ]
}
```

### PUT `/workout-plans/:id`
**Description:** Update workout plan  
**Access:** Admin, Trainer  
**Request Body:**
```json
{
  "planName": "Updated Plan",
  "schedule": [ ... ]
}
```

### DELETE `/workout-plans/:id`
**Description:** Delete workout plan  
**Access:** Admin, Trainer

### GET `/workout-plans/member/:memberId`
**Description:** Get member's workout plans  
**Access:** Admin, Trainer, Self

---

## Diet Plan Routes

### GET `/diet-plans`
**Description:** Get all diet plans  
**Access:** Admin

### GET `/diet-plans/:id`
**Description:** Get diet plan by ID  
**Access:** Admin, Trainer, Member (own plan)

### POST `/diet-plans`
**Description:** Create new diet plan  
**Access:** Admin, Trainer  
**Request Body:**
```json
{
  "memberId": "member_id",
  "planName": "Weight Loss Diet",
  "goal": "Weight Loss",
  "dailyCalories": 2000,
  "macros": {
    "protein": "30%",
    "carbs": "45%",
    "fats": "25%"
  },
  "meals": [
    {
      "meal": "Breakfast",
      "time": "7:00 AM",
      "items": [
        {
          "food": "Oatmeal",
          "quantity": "100g",
          "calories": 350,
          "protein": "12g"
        }
      ],
      "totalCalories": 350
    }
  ]
}
```

### PUT `/diet-plans/:id`
**Description:** Update diet plan  
**Access:** Admin, Trainer  
**Request Body:**
```json
{
  "planName": "Updated Diet Plan",
  "dailyCalories": 2200
}
```

### DELETE `/diet-plans/:id`
**Description:** Delete diet plan  
**Access:** Admin, Trainer

### GET `/diet-plans/member/:memberId`
**Description:** Get member's diet plans  
**Access:** Admin, Trainer, Self

---

## Progress Routes

### GET `/progress`
**Description:** Get all progress records  
**Access:** Admin

### GET `/progress/member/:memberId`
**Description:** Get member's progress  
**Access:** Admin, Trainer, Self

### POST `/progress/:memberId/record`
**Description:** Add progress record  
**Access:** Admin, Trainer, Self  
**Request Body:**
```json
{
  "weight": 75.5,
  "bmi": 24.5,
  "bodyFat": 18.5,
  "muscleMass": 60.0
}
```

### PUT `/progress/:memberId/record/:recordId`
**Description:** Update progress record  
**Access:** Admin, Trainer  
**Request Body:**
```json
{
  "weight": 74.0,
  "bmi": 24.0
}
```

### DELETE `/progress/:memberId/record/:recordId`
**Description:** Delete progress record  
**Access:** Admin

---

## Attendance Routes

### GET `/attendance`
**Description:** Get all attendance records  
**Access:** Admin

### GET `/attendance/today`
**Description:** Get today's attendance  
**Access:** Admin, Trainer

### GET `/attendance/stats`
**Description:** Get attendance statistics  
**Access:** Admin

### GET `/attendance/member/:memberId`
**Description:** Get member's attendance  
**Access:** Admin, Trainer, Self

### POST `/attendance/check-in`
**Description:** Member check-in  
**Access:** Member

### POST `/attendance/check-out`
**Description:** Member check-out  
**Access:** Member

---

## Feedback Routes

### GET `/feedback`
**Description:** Get all feedback  
**Access:** Admin

### GET `/feedback/:id`
**Description:** Get feedback by ID  
**Access:** Admin

### POST `/feedback`
**Description:** Submit feedback  
**Access:** Member  
**Request Body:**
```json
{
  "trainerId": "trainer_id",
  "rating": 5,
  "comment": "Great trainer!",
  "category": "trainer"
}
```

### DELETE `/feedback/:id`
**Description:** Delete feedback  
**Access:** Admin

### GET `/feedback/trainer/:trainerId`
**Description:** Get trainer's feedback  
**Access:** Admin, Trainer (own)

### GET `/feedback/member/:memberId`
**Description:** Get member's feedback  
**Access:** Admin, Self

### GET `/feedback/stats`
**Description:** Get feedback statistics  
**Access:** Admin

---

## Notification Routes

### GET `/notifications`
**Description:** Get user's notifications  
**Access:** Authenticated  
**Query Parameters:**
- `read` (optional): Filter by read status
- `page` (optional): Page number
- `limit` (optional): Items per page

### GET `/notifications/unread`
**Description:** Get unread notifications  
**Access:** Authenticated

### PATCH `/notifications/:id/read`
**Description:** Mark notification as read  
**Access:** Authenticated

### PATCH `/notifications/read-all`
**Description:** Mark all notifications as read  
**Access:** Authenticated

### DELETE `/notifications/:id`
**Description:** Delete notification  
**Access:** Authenticated

### POST `/notifications`
**Description:** Create notification (system)  
**Access:** Admin  
**Request Body:**
```json
{
  "userId": "user_id",
  "type": "plan",
  "title": "New Plan Available",
  "message": "Your workout plan is ready!",
  "priority": "medium"
}
```

---

## AI Routes

### POST `/ai/generate-workout-plan`
**Description:** Generate AI workout plan  
**Access:** Admin, Trainer  
**Request Body:**
```json
{
  "memberId": "member_id",
  "age": 25,
  "height": 175,
  "weight": 75,
  "fitnessLevel": "intermediate",
  "goal": "Build Muscle",
  "medicalConditions": "None",
  "workoutDaysPerWeek": 4,
  "preferredWorkoutTime": "Morning"
}
```

### POST `/ai/generate-diet-plan`
**Description:** Generate AI diet plan  
**Access:** Admin, Trainer  
**Request Body:**
```json
{
  "memberId": "member_id",
  "age": 25,
  "height": 175,
  "weight": 75,
  "fitnessLevel": "intermediate",
  "goal": "Weight Loss",
  "dietaryRestrictions": "Vegetarian",
  "medicalConditions": "None"
}
```

### POST `/ai/request-plan`
**Description:** Member request AI plan  
**Access:** Member  
**Request Body:**
```json
{
  "trainerId": "trainer_id",
  "age": 25,
  "height": 175,
  "weight": 75,
  "fitnessLevel": "beginner",
  "goal": "Weight Loss"
}
```

---

## Health Check

### GET `/health`
**Description:** Server health check  
**Access:** Public  
**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": ["Error detail 1", "Error detail 2"]
}
```

---

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## Notes

1. All timestamps are in ISO 8601 format
2. All IDs are MongoDB ObjectIds
3. Pagination defaults: `page=1`, `limit=10`
4. JWT tokens expire: Access token (15 min), Refresh token (7 days)
5. Rate limiting is applied to all routes
6. AI features require OpenAI API key configuration

