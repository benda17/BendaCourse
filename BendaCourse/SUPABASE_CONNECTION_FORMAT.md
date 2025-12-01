# Supabase Connection String Format for Vercel

## The Correct Format

For **Vercel/Serverless** (Connection Pooling - REQUIRED):

```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true
```

## How to Get Your Exact Connection String

### Step 1: Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Select your project

### Step 2: Get Connection Pooling String
1. Go to **Settings** → **Database**
2. Scroll to **Connection string** section
3. Click on **Connection pooling** tab (NOT "URI" or "Direct connection")
4. You'll see something like:
   ```
   postgresql://postgres.dnwhywnqnukzmkprlyyl:[YOUR-PASSWORD]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
   ```

### Step 3: Replace [YOUR-PASSWORD]
Replace `[YOUR-PASSWORD]` with your actual database password.

**IMPORTANT:** If your password contains special characters, you may need to URL-encode them:
- `!` becomes `%21`
- `@` becomes `%40`
- `#` becomes `%23`
- etc.

### Step 4: Add pgbouncer Parameter
Add `?pgbouncer=true` at the end:

```
postgresql://postgres.dnwhywnqnukzmkprlyyl:YOUR_PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Example with Your Credentials

Based on your local .env, your password is `BendaLTD1710!`

Since it contains `!`, you need to URL-encode it as `%21`:

```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Common Mistakes

❌ **WRONG** - Direct connection (port 5432):
```
postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
```

❌ **WRONG** - Missing project ref in username:
```
postgresql://postgres:password@pooler.supabase.com:6543/postgres
```

❌ **WRONG** - Wrong port:
```
postgresql://postgres.xxx:password@pooler.supabase.com:5432/postgres
```

✅ **CORRECT** - Connection pooling format:
```
postgresql://postgres.xxx:password@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## Quick Checklist

- [ ] Using **Connection pooling** tab (not Direct connection)
- [ ] Port is **6543** (not 5432)
- [ ] Username includes project ref: `postgres.[PROJECT-REF]`
- [ ] Hostname is `pooler.supabase.com` (not `db.xxx.supabase.co`)
- [ ] Added `?pgbouncer=true` at the end
- [ ] Password is URL-encoded if it has special characters
- [ ] Updated in Vercel Environment Variables
- [ ] Redeployed the application

## URL Encoding Reference

If your password has special characters, encode them:
- Space: `%20`
- `!`: `%21`
- `@`: `%40`
- `#`: `%23`
- `$`: `%24`
- `%`: `%25`
- `&`: `%26`
- `*`: `%2A`
- `+`: `%2B`
- `=`: `%3D`

## Test Your Connection String

You can test if the connection string works by running locally:

```bash
cd BendaCourse
# Temporarily update .env with the pooling URL
# Then run:
npx prisma db push
```

If it works locally, it will work on Vercel.

