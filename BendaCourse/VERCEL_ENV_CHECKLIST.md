# ✅ Vercel Environment Variables Checklist

## Critical: DATABASE_URL Must Be Correct

Your deployment is failing because `DATABASE_URL` in Vercel is using port **5432** instead of **6543**.

## Step-by-Step Fix

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Click your project

### 2. Check Current DATABASE_URL
1. Go to **Settings** → **Environment Variables**
2. Find `DATABASE_URL`
3. Click to view/edit it
4. **Check the port number** - it should say `:6543` NOT `:5432`

### 3. Update DATABASE_URL

**If it shows port 5432, replace it with this:**

```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Key Requirements:**
- ✅ Port: **6543** (NOT 5432)
- ✅ Host: `aws-1-ap-northeast-1.pooler.supabase.com` (pooler, not db)
- ✅ Username: `postgres.dnwhywnqnukzmkprlyyl` (with project ref)
- ✅ Password: `BendaLTD1710%21` (with `!` encoded as `%21`)
- ✅ Add `?pgbouncer=true` at the end

### 4. Verify All Environment Variables

Make sure these are set in Vercel:

- ✅ `DATABASE_URL` - Connection pooling URL (port 6543)
- ✅ `JWT_SECRET` - Your JWT secret key
- ✅ `EMAIL_FROM` - Your email address
- ✅ `SMTP_HOST` - smtp.gmail.com
- ✅ `SMTP_PORT` - 587
- ✅ `SMTP_SECURE` - true
- ✅ `SMTP_PASSWORD` - Your Gmail app password
- ✅ `PLATFORM_URL` - https://bendacourse.vercel.app

### 5. Redeploy

1. Go to **Deployments** tab
2. Click **⋯** (three dots) on latest deployment
3. Click **Redeploy**
4. Wait for deployment to complete

### 6. Verify Fix

After redeploy, check the logs. You should see:
- ✅ Connections to port **6543** (not 5432)
- ✅ Successful database queries
- ✅ No "Can't reach database server" errors

## Common Mistakes

❌ **WRONG:**
```
postgresql://postgres.dnwhywnqnukzmkprlyyl:password@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres
```
- Port 5432 (should be 6543)
- Missing password encoding
- Missing `?pgbouncer=true`

✅ **CORRECT:**
```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Still Not Working?

1. **Double-check the port** - Make absolutely sure it says `:6543`
2. **Check Supabase dashboard** - Verify your project is active (not paused)
3. **Try redeploying again** - Sometimes Vercel caches old values
4. **Check Vercel logs** - Look for the exact connection string being used

## Quick Test

After updating, the Vercel logs should show connections to:
```
aws-1-ap-northeast-1.pooler.supabase.com:6543
```

NOT:
```
aws-1-ap-northeast-1.pooler.supabase.com:5432
```

