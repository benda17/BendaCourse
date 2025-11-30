# Benda Course Platform

A premium, full-stack course platform built with Next.js, TypeScript, and PostgreSQL. Features a luxurious UI, payment-gated access, progress tracking, and automated course synchronization.

## Features

- **User Authentication**: Email/password with JWT tokens, forgot password, role-based access (Admin/Student)
- **Payment Integration**: Stripe, PayPal, and Payoneer webhook support for course access
- **Course Management**: Dynamic modules, chapters, and lessons with YouTube video integration
- **Progress Tracking**: Lesson completion, progress bars, notes, and "Continue Watching"
- **Admin Dashboard**: User management, course sync, manual enrollments
- **Automated Sync**: Nightly job to sync courses from external platform
- **Premium UI**: Dark blues, beige/cream, deep blacks - Iman-Gadzhi style luxury design

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Supabase/Neon compatible)
- **Authentication**: JWT tokens
- **Payments**: Stripe, PayPal, Payoneer
- **Video**: React Player (YouTube)

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database (or Supabase/Neon)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd BendaCourse
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `COURSE_PLATFORM_API_URL`: Your external course platform API URL
- `COURSE_PLATFORM_API_KEY`: API key for external platform
- `STRIPE_SECRET_KEY`: Stripe secret key (if using Stripe)
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret

4. Set up the database:
```bash
npx prisma generate
npx prisma db push
```

5. Create an admin user (optional):
You can create an admin user through the registration page, then manually update the database:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-admin@email.com';
```

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel + Supabase

1. **Set up Supabase**:
   - Create a new Supabase project
   - Copy the connection string to `DATABASE_URL`

2. **Deploy to Vercel**:
   - Connect your GitHub repository to Vercel
   - Add all environment variables in Vercel dashboard
   - Deploy

3. **Set up webhooks**:
   - Configure Stripe/PayPal webhooks to point to `https://your-domain.com/api/webhooks/stripe`
   - Add webhook secrets to environment variables

4. **Set up cron job** (for nightly sync):
   - In Vercel dashboard, add a cron job: `0 2 * * *` (2 AM daily)
   - Point to `/api/sync` endpoint

### Alternative: Render + Neon

1. **Set up Neon PostgreSQL**:
   - Create a Neon project
   - Copy the connection string

2. **Deploy to Render**:
   - Create a new Web Service
   - Connect your repository
   - Add environment variables
   - Set build command: `npm install && npx prisma generate && npm run build`
   - Set start command: `npm start`

## API Routes

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/forgot-password` - Request password reset

### Courses
- `GET /api/courses` - Get user's enrolled courses
- `GET /api/courses/[courseId]` - Get course details with progress

### Lessons
- `PUT /api/lessons/[lessonId]/progress` - Update lesson progress/notes

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/users/[userId]/enroll` - Enroll user in course (admin only)
- `POST /api/sync` - Sync courses from external platform (admin only)

### Webhooks
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/webhooks/paypal` - PayPal webhook handler

## Database Schema

The platform uses Prisma with the following main models:
- `User` - User accounts with roles
- `Course` - Course information
- `Module` - Course modules/chapters
- `Lesson` - Individual lessons with YouTube URLs
- `Enrollment` - User course enrollments
- `LessonProgress` - User progress tracking
- `Payment` - Payment records
- `WebhookLog` - Webhook event logs
- `AdminAction` - Admin action audit log

## External Course Platform Integration

The platform syncs courses from an external API. Configure:
- `COURSE_PLATFORM_API_URL`
- `COURSE_PLATFORM_API_KEY`
- `COURSE_PLATFORM_API_SECRET`

The API should return courses in this format:
```json
{
  "courses": [
    {
      "id": "course-id",
      "title": "Course Title",
      "description": "Description",
      "price": 99.99,
      "modules": [
        {
          "id": "module-id",
          "title": "Module Title",
          "order": 1,
          "lessons": [
            {
              "id": "lesson-id",
              "title": "Lesson Title",
              "videoUrl": "https://youtube.com/watch?v=...",
              "order": 1
            }
          ]
        }
      ]
    }
  ]
}
```

## License

Private - All rights reserved

