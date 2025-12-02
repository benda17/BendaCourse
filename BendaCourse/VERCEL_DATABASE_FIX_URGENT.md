# 🔴 URGENT: Fix Vercel Database Connection

## The Error
```
Can't reach database server at `aws-1-ap-northeast-1.pooler.supabase.com:5432`
```

**Problem:** Your `DATABASE_URL` in Vercel is using port **5432** instead of **6543**.

## Quick Fix (5 minutes)

### Step 1: Get the Correct Connection String from Supabase

1. Go to https://supabase.com/dashboard
2. Click your project
3. Go to **Settings** → **Database**
4. Scroll to **Connection string** section
5. Click **Connection pooling** tab (NOT "URI" or "Direct connection")
6. Copy the connection string - it should show port **6543**

### Step 2: URL-Encode Your Password

Your password is `BendaLTD1710!` - the `!` needs to be encoded as `%21`

So the password part becomes: `BendaLTD1710%21`

### Step 3: Build the Correct Connection String

Based on your error, you're using `aws-1-ap-northeast-1.pooler.supabase.com`, so your connection string should be:

```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key points:**
- ✅ Port: **6543** (NOT 5432)
- ✅ Username: `postgres.dnwhywnqnukzmkprlyyl` (with project ref)
- ✅ Password: `BendaLTD1710%21` (with `!` encoded as `%21`)
- ✅ Host: `aws-1-ap-northeast-1.pooler.supabase.com` (pooler, not db)
- ✅ Add `?pgbouncer=true` at the end

### Step 4: Update Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Click your project (`bendacourse` or similar)
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. Click **Edit** or **Delete** and recreate it
6. **Paste** this exact value:
   ```
   postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
7. Make sure it's set for **Production**, **Preview**, and **Development**
8. Click **Save**

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

## Verify It's Fixed

After redeploying, try accessing your app. The database connection should work.

## Still Not Working?

1. **Double-check the port** - Make sure it's `:6543` not `:5432`
2. **Verify Supabase project is active** - Check that your Supabase project is not paused
3. **Check the exact connection string from Supabase** - Copy it directly from the dashboard
4. **Make sure password is URL-encoded** - `!` = `%21`

## Quick Copy-Paste

Here's the exact string to use (if your password is `BendaLTD1710!`):

```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

Copy this entire line and paste it into Vercel's `DATABASE_URL` environment variable.

