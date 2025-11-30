import { PrismaClient } from '@prisma/client'
import { hashPassword, verifyPassword } from '../lib/auth'
import * as dotenv from 'dotenv'
import * as path from 'path'
import * as fs from 'fs'

dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

async function resetPassword() {
  const email = process.argv[2]
  const newPassword = process.argv[3]
  
  if (!email || !newPassword) {
    console.error('Usage: tsx scripts/reset-user-password.ts <email> <new-password>')
    console.error('\nExample:')
    console.error('  tsx scripts/reset-user-password.ts orikus.tal@gmail.com Q3jHe7HNCNgS')
    process.exit(1)
  }
  
  console.log(`Resetting password for: ${email}`)
  console.log(`New password: ${newPassword}\n`)
  
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  
  if (!user) {
    console.error(`❌ User not found: ${email}`)
    await prisma.$disconnect()
    process.exit(1)
  }
  
  const hashedPassword = await hashPassword(newPassword)
  
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  })
  
  // Verify it works
  const isValid = await verifyPassword(newPassword, hashedPassword)
  
  if (isValid) {
    console.log('✓ Password reset successfully!')
    console.log(`\nLogin credentials:`)
    console.log(`  Email: ${email}`)
    console.log(`  Password: ${newPassword}`)
  } else {
    console.error('❌ Password verification failed after reset')
  }
  
  await prisma.$disconnect()
}

resetPassword().catch(console.error)

