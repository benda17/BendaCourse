import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '.env') })

const prisma = new PrismaClient()

async function testConnection() {
  console.log('Testing database connection...\n')
  console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'))
  console.log('')
  
  try {
    // Try to connect and query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Connection successful!')
    console.log('Result:', result)
    
    // Try to count users
    const userCount = await prisma.user.count()
    console.log(`✅ Database is accessible! Found ${userCount} users.`)
    
  } catch (error: any) {
    console.error('❌ Connection failed!')
    console.error('Error:', error.message)
    
    if (error.message.includes('Tenant or user not found')) {
      console.error('\n🔴 This error means the USERNAME format is wrong!')
      console.error('For Supabase connection pooling, username must be: postgres.[PROJECT-REF]')
      console.error('Example: postgres.dnwhywnqnukzmkprlyyl')
      console.error('\nCurrent DATABASE_URL format:')
      const url = process.env.DATABASE_URL || ''
      const match = url.match(/postgresql:\/\/([^:]+):/)
      if (match) {
        const username = match[1]
        console.error(`Username: ${username}`)
        if (!username.includes('.')) {
          console.error('❌ Username is missing project reference!')
          console.error('Should be: postgres.dnwhywnqnukzmkprlyyl')
        }
      }
    } else if (error.message.includes("Can't reach database server")) {
      console.error('\n🔴 This error means the HOST or PORT is wrong!')
      console.error('For Supabase connection pooling:')
      console.error('- Host: aws-0-[REGION].pooler.supabase.com')
      console.error('- Port: 6543 (NOT 5432)')
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()

