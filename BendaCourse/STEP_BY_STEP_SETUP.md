# Step-by-Step Setup Guide

## What Database Do You Need?

You need a **PostgreSQL database**. PostgreSQL is a free, open-source database that works perfectly with this application.

You have 3 options (I recommend Option 1 - Supabase):

---

## Option 1: Supabase (Easiest - Recommended) ⭐

**Why Supabase?** It's free, cloud-based, and takes 5 minutes to set up. No installation needed.

### Step 1: Create Supabase Account
1. Go to https://supabase.com
2. Click "Start your project"
3. Sign up with GitHub, Google, or email (it's free)

### Step 2: Create a New Project
1. Click "New Project"
2. Fill in:
   - **Name**: `benda-course-platform` (or any name you like)
   - **Database Password**: Create a strong password (save it somewhere!)
   - **Region**: Choose closest to you
3. Click "Create new project"
4. Wait 2-3 minutes for it to set up

### Step 3: Get Your Database Connection String
1. Once project is ready, click on your project
2. Go to **Settings** (gear icon in left sidebar)
3. Click **Database** in the settings menu
4. Scroll down to **Connection string**
5. Under **URI**, you'll see something like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres
   ```
6. **Copy this entire string**
7. Replace `[YOUR-PASSWORD]` with the password you created in Step 2

### Step 4: Update Your .env File
1. Open the file `BendaCourse/.env` in a text editor
2. Find the line that says:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/benda_course_platform?schema=public"
   ```
3. Replace it with your Supabase connection string:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public"
   ```
4. Save the file

### Step 5: Create Database Tables
Open PowerShell/Terminal in the `BendaCourse` folder and run:
```bash
npm run db:push
```
This creates all the tables your application needs.

### Step 6: Create the Course
```bash
npm run db:seed
```
This creates the "Benda Dropshipping Course" in your database.

### Step 7: Import All Users from CSV
```bash
npm run import:csv "../BendasCourseStudents.csv"
```
This will:
- Read all 1,490 students from your CSV file
- Create user accounts for each student
- Generate secure passwords for each user
- Enroll all students in the course
- Save passwords to `user-passwords.txt` file

**Important:** The script will create a file called `user-passwords.txt` with all email/password combinations. Keep this secure!

### Step 8: Start Your Application
```bash
npm run dev
```
Then open http://localhost:3000/login

---

## Option 2: Docker (If You Have Docker Desktop)

### Step 1: Start Docker Desktop
Make sure Docker Desktop is running on your computer.

### Step 2: Create PostgreSQL Container
Open PowerShell and run:
```bash
docker run --name benda-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=benda_course_platform -p 5432:5432 -d postgres
```

This downloads and starts PostgreSQL in a container.

### Step 3: Your .env File is Already Correct
The `.env` file already has the correct settings for local PostgreSQL.

### Step 4-8: Same as Supabase
Follow Steps 5-8 from the Supabase section above.

---

## Option 3: Install PostgreSQL Locally

### Step 1: Download PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Click "Download the installer"
3. Download and run the installer

### Step 2: Install PostgreSQL
1. Run the installer
2. Use default settings
3. **Remember the password you set** (or use `postgres`)
4. Complete the installation

### Step 3: Create Database
1. Open "pgAdmin" (comes with PostgreSQL)
2. Connect to your server (use the password you set)
3. Right-click "Databases" → "Create" → "Database"
4. Name it: `benda_course_platform`
5. Click "Save"

### Step 4: Update .env File
If you used a different password than `postgres`, update `.env`:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/benda_course_platform?schema=public"
```

### Step 5-8: Same as Supabase
Follow Steps 5-8 from the Supabase section above.

---

## Complete Command Summary

Once your database is connected, run these commands **in order**:

```bash
# Navigate to project folder
cd BendaCourse

# 1. Create database tables
npm run db:push

# 2. Create the course
npm run db:seed

# 3. Import all students (1,490 users)
npm run import:csv "../BendasCourseStudents.csv"

# 4. Start the application
npm run dev
```

---

## What Happens When You Import Users?

1. **Reads CSV file**: Processes all 1,490 rows from `BendasCourseStudents.csv`
2. **Creates user accounts**: Each student gets an account with their email
3. **Generates passwords**: Creates a secure random password for each user
4. **Enrolls in course**: Automatically enrolls all students in the Benda course
5. **Saves passwords**: Creates `user-passwords.txt` with all email/password pairs
6. **Skips invalid entries**: Ignores users marked as "removed" (הוסר/ה)

## After Import

You'll have:
- ✅ 1,490+ user accounts ready to log in
- ✅ All users enrolled in the course
- ✅ A `user-passwords.txt` file with all credentials
- ✅ Users can log in at http://localhost:3000/login

**Important:** 
- Keep `user-passwords.txt` secure
- Distribute passwords to users
- Delete the file after distributing passwords

---

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Make sure `.env` file exists in `BendaCourse` folder
- Check that `DATABASE_URL` line is correct (no extra spaces)

### "Authentication failed"
- Check your database password is correct
- For Supabase: Make sure you replaced `[YOUR-PASSWORD]` in the connection string
- For local: Make sure PostgreSQL is running

### "Database does not exist"
- For Supabase: This shouldn't happen (it's automatic)
- For local: Create the database first (see Option 3, Step 3)

### "Cannot connect to database"
- Check your internet connection (for Supabase)
- Make sure Docker is running (for Docker option)
- Make sure PostgreSQL service is running (for local install)

---

## Need Help?

If you get stuck, check:
1. Your `.env` file has the correct `DATABASE_URL`
2. Your database is running and accessible
3. You're running commands from the `BendaCourse` folder

