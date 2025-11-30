import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateResetToken } from '@/lib/auth'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    // Don't reveal if user exists
    if (!user) {
      return NextResponse.json({
        message: 'If an account exists, a password reset link has been sent.',
      })
    }

    // Generate reset token
    const token = generateResetToken()
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 1)

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    })

    // TODO: Send email with reset link
    // For now, just return success
    // In production, integrate with email service (SendGrid, Resend, etc.)

    return NextResponse.json({
      message: 'If an account exists, a password reset link has been sent.',
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

