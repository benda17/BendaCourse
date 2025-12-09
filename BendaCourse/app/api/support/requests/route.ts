import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/middleware-auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createRequestSchema = z.object({
  type: z.enum(['REQUEST', 'DEBATE']),
  title: z.string().min(1),
  content: z.string().min(1),
})

export async function GET(request: NextRequest) {
  try {
    const user = requireAuth(request)

    const requests = await prisma.userRequest.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    console.error('Get user requests error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = requireAuth(request)

    const body = await request.json()
    const { type, title, content } = createRequestSchema.parse(body)

    const userRequest = await prisma.userRequest.create({
      data: {
        userId: user.userId,
        type,
        title,
        content,
      },
    })

    return NextResponse.json({ request: userRequest }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Create request error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

