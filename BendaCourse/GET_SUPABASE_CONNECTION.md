# How to Get Your Supabase Database Connection String

## Step-by-Step Instructions

### Step 1: Open Your Supabase Project Dashboard
1. Go to https://supabase.com/dashboard
2. Click on your project (the one you just created)

### Step 2: Navigate to Database Settings
1. Look at the **left sidebar**
2. Click on the **Settings** icon (⚙️ gear icon) at the bottom
3. In the settings menu, click **Database**

### Step 3: Find the Connection String
1. Scroll down on the Database settings page
2. Look for a section called **Connection string** or **Connection pooling**
3. You'll see several tabs: **URI**, **JDBC**, **Golang**, etc.
4. Click on the **URI** tab
5. You'll see something like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
   ```
   OR
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.dnwhywnqnukzmkprlyyl.supabase.co:5432/postgres
   ```

### Step 4: Copy the Connection String
1. Click the **copy button** (📋) next to the connection string
2. **IMPORTANT**: The connection string will have `[YOUR-PASSWORD]` placeholder
3. You need to replace `[YOUR-PASSWORD]` with the actual password you set when creating the project

### Step 5: Get Your Database Password
If you forgot your password:
1. Still in **Settings** → **Database**
2. Look for **Database password** section
3. You can either:
   - See your password (if you saved it)
   - Or click **Reset database password** to create a new one

### Step 6: Update Your .env File
1. Open `BendaCourse/.env` file in a text editor
2. Find this line:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/benda_course_platform?schema=public"
   ```
3. Replace it with your Supabase connection string (with your actual password):
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_ACTUAL_PASSWORD@db.dnwhywnqnukzmkprlyyl.supabase.co:5432/postgres?schema=public"
   ```
4. **Make sure to replace `YOUR_ACTUAL_PASSWORD` with your real password!**
5. Save the file

### Step 7: Test the Connection
Run this command to test if it works:
```bash
cd BendaCourse
npm run db:push
```

If it works, you'll see:
```
✔ Generated Prisma Client
✔ Database synchronized
```

---

## Alternative: Direct Connection String Format

If you have:
- **Project Reference**: `dnwhywnqnukzmkprlyyl`
- **Password**: `your-password-here`

Your connection string should be:
```
postgresql://postgres:your-password-here@db.dnwhywnqnukzmkprlyyl.supabase.co:5432/postgres?schema=public
```

---

## Visual Guide

1. **Dashboard** → Click your project
2. **Left Sidebar** → Click ⚙️ **Settings**
3. **Settings Menu** → Click **Database**
4. **Scroll Down** → Find **Connection string**
5. **Click URI tab** → Copy the string
6. **Replace password** → Update `.env` file

---

## Quick Checklist

- [ ] Opened Supabase dashboard
- [ ] Went to Settings → Database
- [ ] Found Connection string (URI tab)
- [ ] Copied the connection string
- [ ] Got my database password
- [ ] Replaced `[YOUR-PASSWORD]` with actual password
- [ ] Updated `.env` file
- [ ] Tested with `npm run db:push`

---

## Need Help?

If you can't find the connection string:
1. Make sure you're in the **Settings** page (not the project overview)
2. Look for **Database** in the left sidebar under Settings
3. The connection string is usually near the bottom of the Database settings page
4. It might be under "Connection string" or "Connection pooling"

