# Fix Local Database Connection

## The Issue
Project shows "online" in Supabase, but connection fails locally.

## Solution: Use Connection Pooling URL Locally Too

Sometimes the direct connection (port 5432) is restricted, but connection pooling (port 5432 or 6543) works.

### Step 1: Get Connection Pooling URL from Supabase
1. Go to https://supabase.com/dashboard
2. Your project → **Settings** → **Database**
3. Scroll to **Connection string**
4. Click **Connection pooling** tab
5. Copy the connection string (should show port 5432 or 6543)

### Step 2: Update Local .env File

Update your `BendaCourse/.env` file with the connection pooling URL:

**Option 1: If Supabase shows port 5432 in pooling:**
```
DATABASE_URL="postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

**Option 2: If Supabase shows port 6543 in pooling:**
```
DATABASE_URL="postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
```

**Key differences from direct connection:**
- Username: `postgres.dnwhywnqnukzmkprlyyl` (with project ref)
- Host: `aws-1-ap-northeast-1.pooler.supabase.com` (pooler, not db)
- Port: `5432` or `6543` (check what Supabase shows)

### Step 3: Test Connection
```bash
npm run test:db
```

### Step 4: Check IP Restrictions (if still failing)
1. Go to Supabase Dashboard → Your Project
2. **Settings** → **Database**
3. Look for **Connection pooling** → **IP allowlist** or **Network restrictions**
4. Make sure your IP is allowed, or set it to allow all IPs temporarily

## Alternative: Check Supabase Project Settings

1. Go to Supabase Dashboard
2. Your Project → **Settings** → **Database**
3. Check:
   - **Connection pooling** is enabled
   - **IP allowlist** allows your IP (or is set to allow all)
   - **Network restrictions** are not blocking connections

## Quick Test

Try updating `.env` with the connection pooling URL and test:
```bash
# Update .env with pooling URL, then:
npm run test:db
```

If it works, you can then run:
```bash
npm run resend:credentials
```

