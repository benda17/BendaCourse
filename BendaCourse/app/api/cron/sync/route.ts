import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchCoursesFromPlatform, extractYouTubeId, getYouTubeThumbnail } from '@/lib/api-client'
import { slugify } from '@/lib/utils'

// This endpoint should be called by a cron job (Vercel Cron, GitHub Actions, etc.)
// For Vercel: Add to vercel.json cron configuration
export async function GET(request: NextRequest) {
  // Verify cron secret (optional but recommended)
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let coursesSynced = 0
  let lessonsSynced = 0
  const errors: string[] = []

  try {
    const externalCourses = await fetchCoursesFromPlatform()

    for (const extCourse of externalCourses) {
      try {
        const course = await prisma.course.upsert({
          where: { slug: slugify(extCourse.title) },
          update: {
            title: extCourse.title,
            description: extCourse.description || null,
            thumbnail: extCourse.thumbnail || null,
            price: extCourse.price,
          },
          create: {
            title: extCourse.title,
            description: extCourse.description || null,
            thumbnail: extCourse.thumbnail || null,
            price: extCourse.price,
            slug: slugify(extCourse.title),
          },
        })

        coursesSynced++

        for (const extModule of extCourse.modules) {
          const existingModule = await prisma.module.findUnique({
            where: {
              courseId_order: {
                courseId: course.id,
                order: extModule.order,
              },
            },
          })

          const module = existingModule
            ? await prisma.module.update({
                where: { id: existingModule.id },
                data: {
                  title: extModule.title,
                  description: extModule.description || null,
                },
              })
            : await prisma.module.create({
                data: {
                  courseId: course.id,
                  title: extModule.title,
                  description: extModule.description || null,
                  order: extModule.order,
                },
              })

          for (const extLesson of extModule.lessons) {
            const youtubeId = extLesson.youtubeId || extractYouTubeId(extLesson.videoUrl)
            const thumbnail = youtubeId ? getYouTubeThumbnail(youtubeId) : null

            const existingLesson = await prisma.lesson.findUnique({
              where: {
                moduleId_order: {
                  moduleId: module.id,
                  order: extLesson.order,
                },
              },
            })

            if (existingLesson) {
              await prisma.lesson.update({
                where: { id: existingLesson.id },
                data: {
                  title: extLesson.title,
                  description: extLesson.description || null,
                  videoUrl: extLesson.videoUrl,
                  youtubeId: youtubeId || null,
                  duration: extLesson.duration || null,
                },
              })
            } else {
              await prisma.lesson.create({
                data: {
                  moduleId: module.id,
                  title: extLesson.title,
                  description: extLesson.description || null,
                  videoUrl: extLesson.videoUrl,
                  youtubeId: youtubeId || null,
                  duration: extLesson.duration || null,
                  order: extLesson.order,
                },
              })
            }

            lessonsSynced++
          }
        }
      } catch (error) {
        errors.push(`Error syncing course ${extCourse.title}: ${error}`)
      }
    }

    await prisma.courseSyncLog.create({
      data: {
        status: errors.length > 0 ? 'partial' : 'success',
        coursesSynced,
        lessonsSynced,
        error: errors.length > 0 ? errors.join('; ') : null,
      },
    })

    return NextResponse.json({
      success: true,
      coursesSynced,
      lessonsSynced,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    await prisma.courseSyncLog.create({
      data: {
        status: 'failed',
        coursesSynced,
        lessonsSynced,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return NextResponse.json(
      { error: 'Sync failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

