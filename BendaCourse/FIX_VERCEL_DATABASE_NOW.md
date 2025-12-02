# 🔴 URGENT: Fix Vercel DATABASE_URL - Wrong Port!

## The Problem
Your Vercel `DATABASE_URL` is using port **5432** but it MUST use port **6543** for Supabase connection pooling.

**Current (WRONG):** `aws-1-ap-northeast-1.pooler.supabase.com:5432`  
**Should be:** `aws-1-ap-northeast-1.pooler.supabase.com:6543`

## Fix This Right Now (2 minutes)

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Click your project (`bendacourse` or similar)

### Step 2: Update Environment Variable
1. Click **Settings** (top menu)
2. Click **Environment Variables** (left sidebar)
3. Find `DATABASE_URL` in the list
4. Click **Edit** (or delete and recreate it)

### Step 3: Use This Exact Connection String

Copy and paste this EXACT string (replace `BendaLTD1710%21` with your URL-encoded password if different):

```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key points:**
- ✅ Port: **6543** (NOT 5432)
- ✅ Password: `BendaLTD1710%21` (the `!` is encoded as `%21`)
- ✅ Host: `aws-1-ap-northeast-1.pooler.supabase.com`
- ✅ Username: `postgres.dnwhywnqnukzmkprlyyl` (with project ref)
- ✅ Add `?pgbouncer=true` at the end

### Step 4: Save and Redeploy
1. Click **Save**
2. Make sure it's set for **Production**, **Preview**, and **Development**
3. Go to **Deployments** tab
4. Click **⋯** (three dots) on latest deployment
5. Click **Redeploy**

## Verify It's Fixed

After redeploy, check the logs. You should see connections to port **6543**, not 5432.

## Still Using Port 5432?

If you're still seeing port 5432 in errors:
1. **Double-check** the DATABASE_URL in Vercel - make sure it says `:6543`
2. **Clear Vercel cache** - Sometimes old values are cached
3. **Redeploy** - Make sure you redeployed after updating the env var

## Quick Copy-Paste String

```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Copy this entire line and paste it into Vercel's DATABASE_URL environment variable.**

