import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function enrollAllUsers() {
  try {
    console.log('🔍 Finding dropshipping course...\n')
    
    // Find the dropshipping course
    const course = await prisma.course.findUnique({
      where: { slug: 'benda-dropshipping-ebay-course' },
      select: { id: true, title: true }
    })

    if (!course) {
      console.error('❌ Dropshipping course not found!')
      console.error('   Make sure the course exists with slug: benda-dropshipping-ebay-course')
      process.exit(1)
    }

    console.log(`✅ Found course: ${course.title}`)
    console.log(`   Course ID: ${course.id}\n`)

    // Get all users
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true }
    })

    console.log(`📋 Found ${users.length} users\n`)

    let enrolledCount = 0
    let alreadyEnrolledCount = 0
    let errorCount = 0

    for (const user of users) {
      try {
        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            userId_courseId: {
              userId: user.id,
              courseId: course.id
            }
          }
        })

        if (existingEnrollment) {
          alreadyEnrolledCount++
          console.log(`⏭️  ${user.email} - already enrolled`)
          continue
        }

        // Create enrollment
        await prisma.enrollment.create({
          data: {
            userId: user.id,
            courseId: course.id
          }
        })

        enrolledCount++
        console.log(`✅ ${user.email} - enrolled successfully`)
      } catch (error) {
        errorCount++
        console.error(`❌ ${user.email} - error:`, error instanceof Error ? error.message : error)
      }
    }

    console.log(`\n✅ Enrollment complete!`)
    console.log(`   New enrollments: ${enrolledCount}`)
    console.log(`   Already enrolled: ${alreadyEnrolledCount}`)
    console.log(`   Errors: ${errorCount}`)
    console.log(`   Total users: ${users.length}`)

  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

enrollAllUsers()

