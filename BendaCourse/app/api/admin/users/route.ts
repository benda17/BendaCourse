import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/middleware-auth'
import { prisma } from '@/lib/prisma'
import { hashPassword } from '@/lib/auth'
import { sendWelcomeEmail } from '@/lib/email'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().optional(),
  role: z.enum(['ADMIN', 'STUDENT']).default('STUDENT'),
})

export async function GET(request: NextRequest) {
  try {
    requireAdmin(request)

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({ users })
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    requireAdmin(request)

    const body = await request.json()
    const { email, password, name, role } = createUserSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name || null,
        role: role || 'STUDENT',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        enrollments: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })

    // Send welcome email with credentials
    try {
      const courses = user.enrollments.map(e => ({
        id: e.course.id,
        title: e.course.title,
      }))
      await sendWelcomeEmail(user.email, password, user.name, courses)
    } catch (error) {
      // Log error but don't fail user creation
      console.error('Failed to send welcome email:', error)
    }

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'Forbidden: Admin access required') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Create user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

