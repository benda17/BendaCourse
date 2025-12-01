# Vercel Database Connection - Step-by-Step Checklist

## Current Error
```
FATAL: Tenant or user not found
```

This means the username format is wrong OR the environment variable wasn't updated/redeployed.

## Exact Connection String to Use

Copy this EXACT string (replace with your actual password if different):

```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key parts:**
- Username: `postgres.dnwhywnqnukzmkprlyyl` (with dot!)
- Password: `BendaLTD1710%21` (URL-encoded !)
- Host: `aws-1-ap-northeast-1.pooler.supabase.com`
- Port: `6543` (NOT 5432!)
- Database: `postgres`
- Params: `?pgbouncer=true`

## Step-by-Step Fix

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Click on your project

### Step 2: Check Current DATABASE_URL
1. Go to **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click on it to see the current value
4. **Copy the current value** (to compare later)

### Step 3: Update DATABASE_URL
1. Click **Edit** on `DATABASE_URL`
2. **DELETE** everything in the Value field
3. **PASTE** this exact string:
   ```
   postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```
4. **VERIFY** it looks correct:
   - Starts with `postgresql://`
   - Username is `postgres.dnwhywnqnukzmkprlyyl` (with the dot!)
   - Port is `:6543` (not 5432)
   - Ends with `?pgbouncer=true`
5. Click **Save**

### Step 4: Verify Environment Variable Scope
Make sure `DATABASE_URL` is set for:
- ✅ **Production**
- ✅ **Preview** (optional but recommended)
- ✅ **Development** (optional)

### Step 5: Redeploy (CRITICAL!)
1. Go to **Deployments** tab
2. Find the latest deployment
3. Click **⋯** (three dots menu)
4. Click **Redeploy**
5. Wait for deployment to complete

### Step 6: Test
1. Try logging in again
2. If still failing, check deployment logs

## Common Mistakes

❌ **Forgot to redeploy** - Environment variables only take effect after redeploy
❌ **Wrong port** - Using 5432 instead of 6543
❌ **Missing project ref** - Using `postgres` instead of `postgres.dnwhywnqnukzmkprlyyl`
❌ **Not URL-encoding password** - `!` should be `%21`
❌ **Wrong environment scope** - Variable not set for Production

## Verify It's Working

After redeploy, check the deployment logs:
1. Go to **Deployments** → Latest deployment → **Logs**
2. Look for any database connection errors
3. If you see "Tenant or user not found" - the connection string is still wrong
4. If you see connection success - it's working!

## Still Not Working?

1. **Double-check the connection string** - Copy it from Supabase Connection Pooling tab again
2. **Verify you're using the right tab** - Must be "Connection pooling", NOT "URI" or "Direct connection"
3. **Check Supabase project** - Make sure it's not paused
4. **Try without URL encoding** - Sometimes Supabase accepts `!` directly:
   ```
   postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
   ```

