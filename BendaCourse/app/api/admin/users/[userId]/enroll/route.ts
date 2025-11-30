import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const enrollSchema = z.object({
  courseId: z.string(),
})

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const admin = requireAdmin(request)
    const body = await request.json()
    const { courseId } = enrollSchema.parse(body)

    const enrollment = await prisma.enrollment.create({
      data: {
        userId: params.userId,
        courseId,
      },
    })

    await prisma.adminAction.create({
      data: {
        adminId: admin.userId,
        action: 'enroll_user',
        targetType: 'user',
        targetId: params.userId,
        metadata: { courseId },
      },
    })

    return NextResponse.json({ enrollment })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Enroll user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

