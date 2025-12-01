# URGENT: Fix Vercel Database Connection

## The Error
```
FATAL: Tenant or user not found
```

This means the **username format** in your DATABASE_URL is wrong.

## Quick Fix (Do This Now)

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Click your project

### Step 2: Get Connection Pooling String
1. Click **Settings** (gear icon) → **Database**
2. Scroll to **Connection string** section
3. Click **Connection pooling** tab (NOT "URI" or "Direct connection")
4. You'll see a string like:
   ```
   postgresql://postgres.dnwhywnqnukzmkprlyyl:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```

### Step 3: Copy the ENTIRE String
Copy the whole string from Supabase. It should look like:
```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
```

**IMPORTANT:** If your password has `!`, you need to URL-encode it:
- Replace `!` with `%21`
- So `BendaLTD1710!` becomes `BendaLTD1710%21`

Final string:
```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Step 4: Update Vercel
1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL`
5. **DELETE** the old value
6. **PASTE** the new connection pooling string from Step 3
7. Click **Save**

### Step 5: Redeploy
1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**

## Verify It's Correct

Your DATABASE_URL should have:
- ✅ `postgres.dnwhywnqnukzmkprlyyl` (username with project ref)
- ✅ `pooler.supabase.com` (pooler hostname)
- ✅ `:6543` (pooler port)
- ✅ `?pgbouncer=true` (optional but recommended)

## Common Mistakes

❌ **WRONG:**
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```
- Missing project ref in username
- Wrong hostname
- Wrong port

✅ **CORRECT:**
```
postgresql://postgres.dnwhywnqnukzmkprlyyl:password@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```
- Username includes project ref
- Pooler hostname
- Port 6543

## Still Not Working?

1. Double-check you're using the **Connection pooling** tab (not Direct connection)
2. Make sure the username is `postgres.dnwhywnqnukzmkprlyyl` (with the dot)
3. Verify port is 6543
4. URL-encode special characters in password (`!` → `%21`)
5. Make sure you redeployed after updating the environment variable

