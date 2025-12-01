# Debugging Database Connection

## The Error
```
FATAL: Tenant or user not found
```

This means Supabase doesn't recognize the username format.

## Critical: Verify Your Supabase Connection String

### Step 1: Get the EXACT String from Supabase
1. Go to https://supabase.com/dashboard
2. Click your project
3. **Settings** → **Database**
4. Scroll to **Connection string**
5. **IMPORTANT:** Click **Connection pooling** tab (NOT "URI" or "Direct connection")
6. You should see something like:
   ```
   postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres
   ```

### Step 2: Check These Details
Look at the connection string Supabase shows you and verify:

1. **Username format:**
   - ✅ Should be: `postgres.dnwhywnqnukzmkprlyyl` (with dot)
   - ❌ NOT: `postgres` (without project ref)

2. **Hostname:**
   - Should be: `aws-0-ap-northeast-1.pooler.supabase.com` OR `aws-1-ap-northeast-1.pooler.supabase.com`
   - The number (0 or 1) depends on your Supabase region

3. **Port:**
   - ✅ Must be: `6543`
   - ❌ NOT: `5432`

4. **Password:**
   - Your password: `BendaLTD1710!`
   - Try both: with `!` and with `%21`

## Try These Connection Strings

### Option 1: With URL-encoded password
```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710%21@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Option 2: Without URL-encoding (try this first)
```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Option 3: Check if hostname should be aws-0 instead of aws-1
```
postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

## What to Check in Vercel

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Click on `DATABASE_URL` to view it
3. **Copy the entire value** and check:
   - Does it start with `postgresql://`?
   - Is the username `postgres.dnwhywnqnukzmkprlyyl`?
   - Is the port `:6543`?
   - Does it end with `/postgres` or `/postgres?pgbouncer=true`?

## Alternative: Use Direct Connection Temporarily

If connection pooling keeps failing, you can temporarily use the direct connection to test:

1. In Supabase, go to **Connection string** → **URI** tab
2. Copy that string
3. Use it in Vercel temporarily
4. **Note:** This might hit connection limits, but it will help verify the credentials work

Direct connection format:
```
postgresql://postgres:BendaLTD1710!@db.dnwhywnqnukzmkprlyyl.supabase.co:5432/postgres?schema=public
```

## Most Likely Issues

1. **Wrong username format** - Missing the project ref after `postgres.`
2. **Wrong hostname** - Using `aws-0` instead of `aws-1` or vice versa
3. **Wrong port** - Still using 5432 instead of 6543
4. **Password encoding** - Special characters not handled correctly

## Next Steps

1. **Copy the EXACT connection string from Supabase Connection Pooling tab**
2. **Replace `[YOUR-PASSWORD]` with your actual password**
3. **Verify the port is 6543**
4. **Update Vercel with this exact string**
5. **Redeploy**
6. **Test again**

If it still fails, please share:
- The exact connection string Supabase shows you (with `[YOUR-PASSWORD]` placeholder)
- What you're pasting into Vercel (you can mask the password)

