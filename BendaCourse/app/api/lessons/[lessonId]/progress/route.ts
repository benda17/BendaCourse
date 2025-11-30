import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const progressSchema = z.object({
  progress: z.number().min(0).max(100).optional(),
  completed: z.boolean().optional(),
  notes: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { lessonId: string } }
) {
  try {
    const authUser = requireAuth(request)
    const body = await request.json()
    const data = progressSchema.parse(body)

    const lessonProgress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId: authUser.userId,
          lessonId: params.lessonId,
        },
      },
      update: {
        progress: data.progress ?? undefined,
        completed: data.completed ?? undefined,
        notes: data.notes ?? undefined,
        lastWatched: new Date(),
      },
      create: {
        userId: authUser.userId,
        lessonId: params.lessonId,
        progress: data.progress ?? 0,
        completed: data.completed ?? false,
        notes: data.notes ?? undefined,
      },
    })

    return NextResponse.json({ progress: lessonProgress })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Update progress error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

