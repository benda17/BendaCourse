import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyVideos() {
  try {
    const course = await prisma.course.findUnique({
      where: { slug: 'benda-dropshipping-ebay-course' },
      include: {
        modules: {
          include: {
            lessons: {
              take: 10,
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' },
          take: 2
        }
      }
    })

    if (!course) {
      console.log('❌ Course not found')
      return
    }

    console.log(`\n📚 Course: ${course.title}\n`)
    
    let totalLessons = 0
    let lessonsWithVideos = 0

    for (const module of course.modules) {
      console.log(`📁 ${module.title}`)
      for (const lesson of module.lessons) {
        totalLessons++
        const hasVideo = lesson.videoUrl && lesson.videoUrl.length > 0
        if (hasVideo) lessonsWithVideos++
        console.log(`  ${hasVideo ? '✅' : '❌'} ${lesson.title.substring(0, 60)}`)
        if (hasVideo) {
          console.log(`     Video: ${lesson.videoUrl}`)
        }
      }
    }

    // Get total count
    const allLessons = await prisma.lesson.findMany({
      where: {
        module: {
          course: {
            slug: 'benda-dropshipping-ebay-course'
          }
        }
      },
      select: {
        videoUrl: true
      }
    })

    const totalWithVideos = allLessons.filter(l => l.videoUrl && l.videoUrl.length > 0).length

    console.log(`\n📊 Summary:`)
    console.log(`   Total lessons: ${allLessons.length}`)
    console.log(`   Lessons with videos: ${totalWithVideos}`)
    console.log(`   Lessons without videos: ${allLessons.length - totalWithVideos}`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyVideos()

