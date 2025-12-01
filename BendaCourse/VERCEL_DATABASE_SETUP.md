# Vercel Database Setup - IMPORTANT

## The Problem

Vercel serverless functions need to use **Supabase Connection Pooling** (port 6543), NOT the direct connection (port 5432).

## How to Fix

### Step 1: Get Your Connection Pooling URL from Supabase

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string** section
5. Look for **Connection pooling** tab (NOT the direct connection)
6. Copy the connection string that looks like:
   ```
   postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```
   
   Example:
   ```
   postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```

### Step 2: Update Vercel Environment Variable

1. Go to your Vercel project: https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. **Update it** with the connection pooling URL (port 6543)
6. Make sure to:
   - Use port **6543** (NOT 5432)
   - Use the **pooler.supabase.com** hostname
   - Include `?pgbouncer=true` at the end (optional but recommended)

### Step 3: Correct Format

Your `DATABASE_URL` in Vercel should look like:

```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key differences:**
- ✅ Port: **6543** (not 5432)
- ✅ Hostname: **pooler.supabase.com** (not db.xxx.supabase.co)
- ✅ Username format: **postgres.[PROJECT-REF]** (not just postgres)
- ✅ Optional: Add `?pgbouncer=true` at the end

### Step 4: Redeploy

After updating the environment variable:
1. Go to **Deployments** tab in Vercel
2. Click **Redeploy** on the latest deployment
3. Or push a new commit to trigger a new deployment

## Why This Matters

- **Direct connection (5432)**: Works locally, but fails on Vercel serverless functions
- **Connection pooling (6543)**: Required for serverless/Vercel because it handles connection pooling automatically

## Quick Checklist

- [ ] Got connection pooling URL from Supabase (port 6543)
- [ ] Updated DATABASE_URL in Vercel environment variables
- [ ] Used port 6543 (not 5432)
- [ ] Used pooler.supabase.com hostname
- [ ] Redeployed the application

## Troubleshooting

If you still get connection errors:
1. Make sure you're using the **pooler** URL, not the direct connection
2. Verify the port is **6543**
3. Check that your Supabase project is not paused
4. Verify the password is correct (no special characters need URL encoding)
5. Try adding `?pgbouncer=true` to the connection string

