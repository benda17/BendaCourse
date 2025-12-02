# Fix Database Connection Issue

## The Error
```
Can't reach database server at `db.dnwhywnqnukzmkprlyyl.supabase.co:5432`
```

## Most Likely Cause: Database is Paused

Supabase free tier projects **automatically pause** after 1 week of inactivity.

## How to Fix

### Step 1: Check Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Look at your project
3. **Check the status** - if it says "Paused" or shows a pause icon, that's the issue

### Step 2: Unpause the Database
1. In Supabase Dashboard, click on your project
2. If it's paused, you'll see a **"Restore"** or **"Resume"** button
3. Click it to unpause/resume the database
4. Wait 1-2 minutes for it to fully restore

### Step 3: Test Connection
After unpausing, test the connection:
```bash
cd BendaCourse
npm run test:db
```

Or try:
```bash
npx prisma db push --skip-generate
```

## Alternative: Check Connection String

If the database is not paused, verify your `.env` file has the correct connection string:

**For local development** (direct connection):
```
DATABASE_URL="postgresql://postgres:BendaLTD1710!@db.dnwhywnqnukzmkprlyyl.supabase.co:5432/postgres?schema=public"
```

**For Vercel** (connection pooling):
```
DATABASE_URL="postgresql://postgres.dnwhywnqnukzmkprlyyl:BendaLTD1710!@aws-1-ap-northeast-1.pooler.supabase.com:5432/postgres"
```

## Quick Checklist

- [ ] Checked Supabase dashboard - is project paused?
- [ ] Clicked "Restore" or "Resume" if paused
- [ ] Waited 1-2 minutes for database to restore
- [ ] Tested connection with `npm run test:db`
- [ ] Verified `.env` file has correct `DATABASE_URL`

## After Database is Restored

Once the database connection works, you can run:
```bash
npm run resend:credentials
```

This will resend emails to the 493 users who didn't receive them.

