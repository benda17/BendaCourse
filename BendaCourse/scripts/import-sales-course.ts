import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'
import { extractYouTubeId } from '../lib/schooler-api'

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
    const dataPath = path.join(__dirname, '../sales-course-data.json')
    
    if (!fs.existsSync(dataPath)) {
      console.error(`❌ File not found: ${dataPath}`)
      console.error('Please extract the course data first using the browser scraper script.')
      console.error('Save it as: sales-course-data.json in the project root')
      process.exit(1)
    }

    const fileContent = fs.readFileSync(dataPath, 'utf-8')
    const courseData: CourseData = JSON.parse(fileContent)

    console.log(`\n📚 Importing course: ${courseData.title}`)
    console.log(`📦 Found ${courseData.modules.length} modules\n`)

    // Create slug from title (handle Hebrew text)
    // Use a unique identifier for Hebrew titles - always create NEW course
    const slug = `sales-training-course-${Date.now()}`

    // Always create a NEW course (don't update existing)
    // Check if a course with this exact title already exists
    const existingCourse = await prisma.course.findFirst({
      where: { 
        title: courseData.title,
        slug: { not: { startsWith: 'sales-training-course-' } } // Don't match our new course
      }
    })

    if (existingCourse) {
      console.log(`⚠️  Found existing course with same title: ${existingCourse.title}`)
      console.log(`   Existing course ID: ${existingCourse.id}`)
      console.log(`   Creating NEW course with unique slug...`)
    }

    // Always create a new course
    const course = await prisma.course.create({
      data: {
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
            videoUrl: lessonData.videoUrl || null,
            youtubeId: youtubeId,
            duration: lessonData.duration || null,
          },
          create: {
            moduleId: module.id,
            title: lessonData.title,
            videoUrl: lessonData.videoUrl || null,
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
    console.log(`\n📝 Next steps:`)
    console.log(`   1. Extract video URLs from each lesson page`)
    console.log(`   2. Update sales-course-data.json with video URLs`)
    console.log(`   3. Run this script again to update videos`)

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

