# Copy Local Database URL to Vercel

## The Situation
- ✅ **Localhost works** - Your local `.env` has the correct DATABASE_URL
- ❌ **Vercel doesn't work** - Vercel's environment variable is different/wrong

## Solution: Copy Your Working Connection String to Vercel

### Step 1: Check Your Local .env File

Open `BendaCourse/.env` and find the `DATABASE_URL` line. It should look something like:

```
DATABASE_URL="postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

OR

```
DATABASE_URL="postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Step 2: For Vercel, Use Port 6543

**Important:** Even if your local `.env` uses port 5432 (which works locally), Vercel **MUST** use port **6543** for serverless functions.

So if your local `.env` has:
```
DATABASE_URL="...@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

Change it to **6543** for Vercel:
```
DATABASE_URL="...@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

### Step 3: URL-Encode Special Characters

If your password has special characters (like `!`), encode them:
- `!` becomes `%21`
- `@` becomes `%40`
- `#` becomes `%23`

So if your password is `BendaLTD1710!`, use `BendaLTD1710%21` in the connection string.

### Step 4: Copy to Vercel

1. Go to https://vercel.com/dashboard
2. Click your project
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL` (or create it if it doesn't exist)
5. **Paste** your connection string (with port 6543 and URL-encoded password)
6. Make sure it's set for **Production**, **Preview**, and **Development**
7. Click **Save**

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click **⋯** on latest deployment
3. Click **Redeploy**

## Example

If your local `.env` has:
```
DATABASE_URL="postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

Use this in Vercel:
```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

**Changes:**
- Port: `5432` → `6543`
- Password: `BendaLTD1710!` → `BendaLTD1710%21` (URL-encoded)
- Added: `?pgbouncer=true` at the end

## Quick Checklist

- [ ] Found DATABASE_URL in local `.env`
- [ ] Changed port from 5432 to 6543
- [ ] URL-encoded password special characters
- [ ] Added `?pgbouncer=true` at the end
- [ ] Pasted into Vercel environment variables
- [ ] Set for Production/Preview/Development
- [ ] Saved
- [ ] Redeployed

