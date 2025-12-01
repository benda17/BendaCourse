import { PrismaClient } from '@prisma/client'
import { verifyPassword } from '../lib/auth'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

async function verifyUserPassword() {
  const email = process.argv[2]
  const password = process.argv[3]
  
  if (!email || !password) {
    console.error('Usage: tsx scripts/verify-user-password.ts <email> <password>')
    console.error('\nExample:')
    console.error('  tsx scripts/verify-user-password.ts user@example.com Test123456')
    process.exit(1)
  }
  
  console.log(`Checking password for: ${email}\n`)
  
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      id: true,
      email: true,
      password: true,
      updatedAt: true,
    },
  })
  
  if (!user) {
    console.error(`❌ User not found: ${email}`)
    await prisma.$disconnect()
    process.exit(1)
  }
  
  console.log(`✓ User found:`)
  console.log(`  ID: ${user.id}`)
  console.log(`  Email: ${user.email}`)
  console.log(`  Password hash: ${user.password.substring(0, 20)}...`)
  console.log(`  Last updated: ${user.updatedAt}`)
  console.log(`\nVerifying password...`)
  
  const isValid = await verifyPassword(password, user.password)
  
  if (isValid) {
    console.log('✓ Password is CORRECT!')
  } else {
    console.log('❌ Password is INCORRECT!')
    console.log('\nThe password in the database does not match the provided password.')
    console.log('This could mean:')
    console.log('  1. The password was not updated in the database')
    console.log('  2. The wrong password was sent in the email')
    console.log('  3. There was an error during password hashing')
  }
  
  await prisma.$disconnect()
}

verifyUserPassword().catch(console.error)

