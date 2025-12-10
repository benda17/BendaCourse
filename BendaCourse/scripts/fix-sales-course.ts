import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixSalesCourse() {
  try {
    console.log('🔍 Finding all courses with title: הקורס להכשרת אנשי מכירות - בנדה בע"מ\n')
    
    const courses = await prisma.course.findMany({
      where: {
        title: 'הקורס להכשרת אנשי מכירות - בנדה בע"מ'
      },
      include: {
        modules: {
          include: {
            lessons: true
          },
          orderBy: { order: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${courses.length} courses with this title:\n`)

    courses.forEach((course, index) => {
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
      console.log(`${index + 1}. Course ID: ${course.id}`)
      console.log(`   Slug: ${course.slug}`)
      console.log(`   Created: ${course.createdAt}`)
      console.log(`   Modules: ${course.modules.length}, Lessons: ${totalLessons}`)
      
      // Show first few modules
      if (course.modules.length > 0) {
        console.log(`   First modules:`)
        course.modules.slice(0, 3).forEach(m => {
          console.log(`     - ${m.title} (${m.lessons.length} lessons)`)
        })
      }
      console.log('')
    })

    // Identify the old course (should have many modules) and new course (should have 5 modules)
    const oldCourse = courses.find(c => c.modules.length > 10)
    const newCourse = courses.find(c => c.modules.length === 5)

    if (!oldCourse) {
      console.log('⚠️  Could not find old course (expected many modules)')
    } else {
      console.log(`\n📌 Old course identified: ${oldCourse.id}`)
      console.log(`   Has ${oldCourse.modules.length} modules`)
    }

    if (!newCourse) {
      console.log('⚠️  Could not find new course (expected 5 modules)')
      console.log('   Will create a new one...\n')
    } else {
      console.log(`\n✅ New course identified: ${newCourse.id}`)
      console.log(`   Has ${newCourse.modules.length} modules`)
      console.log(`   Slug: ${newCourse.slug}`)
    }

    // Check if new course has the correct lessons
    if (newCourse) {
      const expectedLessons = [
        'ערכי חברת בנדה בע״מ',
        'תוכן המוצר - שלם על ניהול קבל חנות חינם',
        'התנגדויות [01]',
        'מערכת ה CRM',
        'מה זה דרופשיפינג?'
      ]

      const newCourseLessons = newCourse.modules.flatMap(m => m.lessons.map(l => l.title))
      const hasCorrectLessons = expectedLessons.every(title => newCourseLessons.includes(title))

      if (hasCorrectLessons) {
        console.log(`\n✅ New course has the correct lessons!`)
      } else {
        console.log(`\n⚠️  New course might have wrong lessons`)
        console.log(`   Expected: ${expectedLessons.join(', ')}`)
        console.log(`   Found: ${newCourseLessons.join(', ')}`)
      }
    }

    // Delete all duplicate courses except the newest correct one
    if (newCourse && courses.length > 1) {
      console.log(`\n🗑️  Deleting duplicate courses...`)
      
      for (const course of courses) {
        if (course.id !== newCourse.id) {
          console.log(`   Deleting course: ${course.id} (${course.modules.length} modules)`)
          
          // Delete all modules and lessons first (cascade should handle this, but being explicit)
          for (const module of course.modules) {
            await prisma.lesson.deleteMany({
              where: { moduleId: module.id }
            })
          }
          await prisma.module.deleteMany({
            where: { courseId: course.id }
          })
          
          // Delete enrollments
          await prisma.enrollment.deleteMany({
            where: { courseId: course.id }
          })
          
          // Delete the course
          await prisma.course.delete({
            where: { id: course.id }
          })
          
          console.log(`   ✅ Deleted course: ${course.id}`)
        }
      }
    }

    // Verify final state
    const finalCourses = await prisma.course.findMany({
      where: {
        title: 'הקורס להכשרת אנשי מכירות - בנדה בע"מ'
      },
      include: {
        modules: {
          include: {
            lessons: true
          }
        }
      }
    })

    console.log(`\n✅ Final state:`)
    console.log(`   Total courses with this title: ${finalCourses.length}`)
    
    if (finalCourses.length === 1) {
      const course = finalCourses[0]
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
      console.log(`\n✅ Single course found:`)
      console.log(`   ID: ${course.id}`)
      console.log(`   Slug: ${course.slug}`)
      console.log(`   Modules: ${course.modules.length}`)
      console.log(`   Lessons: ${totalLessons}`)
      
      if (course.modules.length === 5) {
        console.log(`\n🎉 SUCCESS! The new sales course is properly set up!`)
      } else {
        console.log(`\n⚠️  Warning: Expected 5 modules, found ${course.modules.length}`)
      }
    } else {
      console.log(`\n⚠️  Still have ${finalCourses.length} courses. Manual cleanup may be needed.`)
    }

  } catch (error) {
    console.error('❌ Error:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

fixSalesCourse()

