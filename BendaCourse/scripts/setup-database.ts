import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { execSync } from 'child_process'

const envPath = path.join(__dirname, '../.env')

// Generate a random JWT secret
const jwtSecret = crypto.randomBytes(32).toString('hex')

// Default database URL (user can update this)
const defaultDatabaseUrl = 'postgresql://postgres:postgres@localhost:5432/benda_course_platform?schema=public'

const envContent = `# Database Connection
# Update this with your actual PostgreSQL connection string
DATABASE_URL="${defaultDatabaseUrl}"

# JWT Secret - Auto-generated
JWT_SECRET="${jwtSecret}"

# Environment
NODE_ENV="development"

# Course Platform API (optional)
COURSE_PLATFORM_API_URL=""
COURSE_PLATFORM_API_KEY=""
COURSE_PLATFORM_API_SECRET=""
`

async function setupDatabase() {
  console.log('Setting up database configuration...\n')

  // Create .env file if it doesn't exist
  if (!fs.existsSync(envPath)) {
    fs.writeFileSync(envPath, envContent)
    console.log('✓ Created .env file')
  } else {
    console.log('⚠ .env file already exists, skipping creation')
  }

  // Check if PostgreSQL is available
  console.log('\nChecking for PostgreSQL...')
  
  try {
    // Try to connect to default PostgreSQL
    const testUrl = process.env.DATABASE_URL || defaultDatabaseUrl
    console.log(`\nAttempting to connect to: ${testUrl.replace(/:[^:]*@/, ':****@')}`)
    
    // Try to run prisma db push
    execSync('npx prisma db push --skip-generate', {
      cwd: path.join(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, DATABASE_URL: testUrl }
    })
    
    console.log('\n✓ Database connection successful!')
    console.log('\nNext steps:')
    console.log('  1. Run: npm run db:seed')
    console.log('  2. Run: npm run import:csv "../BendasCourseStudents.csv"')
    
  } catch (error: any) {
    console.log('\n❌ Could not connect to PostgreSQL database')
    console.log('\nYou have several options:')
    console.log('\n1. Install PostgreSQL locally:')
    console.log('   - Download: https://www.postgresql.org/download/windows/')
    console.log('   - Or use Docker: docker run --name postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres')
    console.log('   - Then create database: CREATE DATABASE benda_course_platform;')
    
    console.log('\n2. Use a free cloud database:')
    console.log('   - Supabase: https://supabase.com (recommended)')
    console.log('   - Railway: https://railway.app')
    console.log('   - Neon: https://neon.tech')
    console.log('   - Copy connection string and update DATABASE_URL in .env')
    
    console.log('\n3. Update .env file with your database URL:')
    console.log(`   DATABASE_URL="your-connection-string-here"`)
    
    process.exit(1)
  }
}

setupDatabase().catch(console.error)

