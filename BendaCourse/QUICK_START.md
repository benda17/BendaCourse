# Quick Start Guide

## Option 1: Use Supabase (Recommended - 2 minutes)

1. Go to https://supabase.com and sign up (free)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" (URI format)
5. Update `.env` file:
   ```env
   DATABASE_URL="paste-your-supabase-connection-string-here"
   ```
6. Run:
   ```bash
   npm run db:push
   npm run db:seed
   npm run import:csv "../BendasCourseStudents.csv"
   ```

## Option 2: Use Docker (Local PostgreSQL)

1. Start Docker Desktop
2. Run:
   ```bash
   docker run --name benda-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=benda_course_platform -p 5432:5432 -d postgres
   ```
3. Your `.env` file already has the correct DATABASE_URL
4. Run:
   ```bash
   npm run db:push
   npm run db:seed
   npm run import:csv "../BendasCourseStudents.csv"
   ```

## Option 3: Install PostgreSQL Locally

1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Set password to `postgres` (or update `.env` with your password)
4. Create database:
   ```sql
   CREATE DATABASE benda_course_platform;
   ```
5. Your `.env` file already has the correct DATABASE_URL
6. Run:
   ```bash
   npm run db:push
   npm run db:seed
   npm run import:csv "../BendasCourseStudents.csv"
   ```

## After Database Setup

Once your database is connected, run these commands in order:

```bash
# 1. Create database tables
npm run db:push

# 2. Create the course
npm run db:seed

# 3. Import all students from CSV
npm run import:csv "../BendasCourseStudents.csv"
```

The import will create a `user-passwords.txt` file with all email/password combinations.

## Start the Application

```bash
npm run dev
```

Then visit http://localhost:3000/login

