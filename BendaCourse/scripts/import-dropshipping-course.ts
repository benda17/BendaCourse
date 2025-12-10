import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface LessonData {
  title: string
  href?: string
  order: number
  duration?: number | null
  videoUrl?: string | null
}

interface ModuleData {
  title: string
  order: number
  description?: string
  lessons: LessonData[]
}

interface CourseData {
  title: string
  description?: string
  modules: ModuleData[]
}

function extractYouTubeIdFromUrl(url: string | null | undefined): string | null {
  if (!url) return null
  
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  return null
}

async function importCourse() {
  try {
    // Read course data file
    const dataPath = path.join(__dirname, '../dropshipping-course-data.json')
    
    if (!fs.existsSync(dataPath)) {
      console.error(`❌ File not found: ${dataPath}`)
      console.error('Please extract the course data first using:')
      console.error('   npm run extract:dropshipping-course')
      console.error('Or use the browser scraper script and save it as: dropshipping-course-data.json')
      process.exit(1)
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8')
    const courseData: CourseData = JSON.parse(fileContent)

    console.log(`\n📚 Importing course: ${courseData.title}`)
    console.log(`📦 Found ${courseData.modules.length} modules\n`)

    // Create slug for dropshipping course
    const slug = 'benda-dropshipping-ebay-course'

    // Create or update course
    const course = await prisma.course.upsert({
      where: { slug },
      update: {
        title: courseData.title,
        description: courseData.description || null,
      },
      create: {
        title: courseData.title,
        description: courseData.description || null,
        slug,
        price: 0,
        thumbnail: null,
        isActive: true,
      },
    })

    console.log(`✅ Course created/updated: ${course.title}`)

    let totalLessons = 0

    // Create modules and lessons
    for (const moduleData of courseData.modules) {
      const module = await prisma.module.upsert({
        where: {
          courseId_order: {
            courseId: course.id,
            order: moduleData.order,
          },
        },
        update: {
          title: moduleData.title,
          description: moduleData.description || null,
        },
        create: {
          courseId: course.id,
          title: moduleData.title,
          description: moduleData.description || null,
          order: moduleData.order,
        },
      })

      console.log(`  📁 Module ${moduleData.order}: ${module.title} (${moduleData.lessons.length} lessons)`)

      for (const lessonData of moduleData.lessons) {
        const youtubeId = lessonData.videoUrl 
          ? extractYouTubeIdFromUrl(lessonData.videoUrl)
          : null

        await prisma.lesson.upsert({
          where: {
            moduleId_order: {
              moduleId: module.id,
              order: lessonData.order,
            },
          },
          update: {
            title: lessonData.title,
            videoUrl: lessonData.videoUrl || '',
            youtubeId: youtubeId,
            duration: lessonData.duration || null,
          },
          create: {
            moduleId: module.id,
            title: lessonData.title,
            videoUrl: lessonData.videoUrl || '',
            youtubeId: youtubeId,
            duration: lessonData.duration || null,
            order: lessonData.order,
          },
        })

        totalLessons++
      }
    }

    console.log(`\n✅ Import complete!`)
    console.log(`   Course: ${course.title}`)
    console.log(`   Modules: ${courseData.modules.length}`)
    console.log(`   Lessons: ${totalLessons}`)

  } catch (error) {
    console.error('❌ Error importing course:', error)
    if (error instanceof Error) {
      console.error('Error details:', error.message)
      console.error('Stack:', error.stack)
    }
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

importCourse()

