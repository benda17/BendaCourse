import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/middleware-auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const authUser = getAuthUser(request)
    if (!authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: authUser.userId },
      include: {
        course: {
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
        },
      },
    })

    const courses = enrollments.map((enrollment) => enrollment.course)

    // Log for debugging
    courses.forEach(course => {
      const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0)
      console.log(`[API] Course: ${course.title}, Modules: ${course.modules.length}, Lessons: ${totalLessons}`)
      course.modules.forEach((module, idx) => {
        console.log(`[API]   Module ${idx + 1}: ${module.title}, Lessons: ${module.lessons.length}`)
      })
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error('Get courses error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

