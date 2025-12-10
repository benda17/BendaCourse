import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyCourse() {
  try {
    const courses = await prisma.course.findMany({
      include: {
        modules: {
          include: {
            lessons: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { title: 'asc' }
    })

    console.log('\n📚 Courses in database:\n')
    
    if (courses.length === 0) {
      console.log('❌ No courses found in database!')
      return
    }

    courses.forEach(course => {
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
      console.log(`✅ ${course.title}`)
      console.log(`   ID: ${course.id}`)
      console.log(`   Slug: ${course.slug}`)
      console.log(`   Active: ${course.isActive ? 'Yes' : 'No'}`)
      console.log(`   Modules: ${course.modules.length}`)
      console.log(`   Lessons: ${totalLessons}`)
      
      course.modules.forEach(module => {
        console.log(`   📁 ${module.title} (${module.lessons.length} lessons)`)
        module.lessons.forEach(lesson => {
          const hasVideo = lesson.videoUrl ? '✅' : '❌'
          console.log(`      ${hasVideo} ${lesson.title}`)
        })
      })
      console.log('')
    })

    // Check enrollments
    const enrollments = await prisma.enrollment.findMany({
      include: {
        user: true,
        course: true
      }
    })

    console.log(`\n👥 Total enrollments: ${enrollments.length}\n`)
    
    if (enrollments.length > 0) {
      const enrollmentsByCourse = enrollments.reduce((acc, e) => {
        acc[e.course.title] = (acc[e.course.title] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      Object.entries(enrollmentsByCourse).forEach(([courseTitle, count]) => {
        console.log(`   ${courseTitle}: ${count} user(s)`)
      })
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyCourse()

