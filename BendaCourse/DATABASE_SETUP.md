# Database Setup Guide

## Quick Start

1. **Install PostgreSQL** (if not already installed)
   - Download from: https://www.postgresql.org/download/
   - Or use Docker: `docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres`

2. **Create a database**
   ```sql
   CREATE DATABASE benda_course_platform;
   ```

3. **Create `.env` file** in the `BendaCourse` directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/benda_course_platform?schema=public"
   JWT_SECRET="your-random-secret-key-here"
   NODE_ENV="development"
   ```

4. **Run database migrations**:
   ```bash
   npm run db:push
   ```

5. **Seed the database** (create course):
   ```bash
   npm run db:seed
   ```

6. **Import users from CSV**:
   ```bash
   npm run import:csv "../BendasCourseStudents.csv"
   ```

## Database Connection String Format

```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE_NAME?schema=public
```

### Examples:

**Local PostgreSQL:**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/benda_course_platform?schema=public"
```

**Supabase (Free PostgreSQL hosting):**
```
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxxxx.supabase.co:5432/postgres?schema=public"
```

**Railway (Free PostgreSQL hosting):**
```
DATABASE_URL="postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway?schema=public"
```

**Neon (Free PostgreSQL hosting):**
```
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?schema=public"
```

## Troubleshooting

### "Environment variable not found: DATABASE_URL"
- Make sure you created a `.env` file in the `BendaCourse` directory
- Check that the file is named exactly `.env` (not `.env.txt` or `.env.example`)
- Verify the DATABASE_URL format is correct

### "Can't reach database server"
- Make sure PostgreSQL is running
- Check that the host, port, username, and password are correct
- Verify network connectivity if using a remote database

### "Database does not exist"
- Create the database first: `CREATE DATABASE database_name;`
- Or update DATABASE_URL to point to an existing database

## Next Steps

After setting up the database:
1. ✅ Run `npm run db:push` to create tables
2. ✅ Run `npm run db:seed` to create the course
3. ✅ Run `npm run import:csv` to import users
4. ✅ Start the dev server: `npm run dev`

