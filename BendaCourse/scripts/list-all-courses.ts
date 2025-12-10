import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function listCourses() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: true
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    console.log(`\n📚 All courses in database (${courses.length} total):\n`)
    
    courses.forEach((course, index) => {
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
      console.log(`${index + 1}. ${course.title}`)
      console.log(`   ID: ${course.id}`)
      console.log(`   Slug: ${course.slug}`)
      console.log(`   Active: ${course.isActive ? 'Yes' : 'No'}`)
      console.log(`   Modules: ${course.modules.length}, Lessons: ${totalLessons}`)
      console.log(`   Created: ${course.createdAt}`)
      console.log('')
    })

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

listCourses()

