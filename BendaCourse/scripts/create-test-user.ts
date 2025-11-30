import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'
import * as dotenv from 'dotenv'
import * as path from 'path'

dotenv.config({ path: path.join(__dirname, '../.env') })

const prisma = new PrismaClient()

async function createTestUser() {
  const testEmail = 'test@benda.com'
  const testPassword = 'test123456'
  
  console.log(`Creating test user...`)
  console.log(`Email: ${testEmail}`)
  console.log(`Password: ${testPassword}\n`)
  
  // Hash password
  const hashedPassword = await hashPassword(testPassword)
  
  // Create or update user
  const user = await prisma.user.upsert({
    where: { email: testEmail },
    update: {
      password: hashedPassword,
      name: 'Test User',
      role: 'STUDENT',
    },
    create: {
      email: testEmail,
      password: hashedPassword,
      name: 'Test User',
      role: 'STUDENT',
    },
  })
  
  console.log('✓ User created/updated')
  console.log(`  ID: ${user.id}`)
  console.log(`  Email: ${user.email}`)
  console.log(`  Name: ${user.name}`)
  
  // Enroll in course
  const course = await prisma.course.findFirst({
    where: {
      slug: 'benda-dropshipping-ebay-course',
    },
  })
  
  if (course) {
    const enrollment = await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: user.id,
          courseId: course.id,
        },
      },
      update: {},
      create: {
        userId: user.id,
        courseId: course.id,
      },
    })
    
    console.log(`\n✓ Enrolled in course: ${course.title}`)
  }
  
  console.log('\n=== Login Credentials ===')
  console.log(`Email: ${testEmail}`)
  console.log(`Password: ${testPassword}`)
  console.log('\nYou can now log in with these credentials!')
  
  await prisma.$disconnect()
}

createTestUser().catch(console.error)

