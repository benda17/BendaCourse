import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware-auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is enrolled
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId: authUser.userId,
          courseId: params.courseId,
        },
      },
    })

    if (!enrollment && authUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Not enrolled in this course' },
        { status: 403 }
      )
    }

    const course = await prisma.course.findUnique({
      where: { id: params.courseId },
      include: {
        modules: {
          include: {
            lessons: {
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!course) {
      return NextResponse.json(
        { error: 'Course not found' },
        { status: 404 }
      )
    }

    // Log for debugging
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
    console.log(`[API Course Detail] Course: ${course.title}`)
    console.log(`[API Course Detail] Modules: ${course.modules.length}, Total Lessons: ${totalLessons}`)
    course.modules.forEach((module, idx) => {
      console.log(`[API Course Detail]   Module ${idx + 1}: ${module.title}, Lessons: ${module.lessons.length}`)
      if (module.lessons.length > 0) {
        const firstLesson = module.lessons[0]
        console.log(`[API Course Detail]     First lesson: ${firstLesson.title}, Video: ${firstLesson.videoUrl ? 'YES' : 'NO'}`)
      }
    })

    // Get user progress
    const progress = await prisma.lessonProgress.findMany({
      where: {
        userId: authUser.userId,
        lessonId: {
          in: course.modules.flatMap((m) => m.lessons.map((l) => l.id)),
        },
      },
    })

    return NextResponse.json({ course, progress })
  } catch (error) {
    console.error('Get course error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

