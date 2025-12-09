import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateResetToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

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

    // Send password reset email
    try {
      const emailSent = await sendPasswordResetEmail(user.email, token, user.name)
      if (!emailSent) {
        console.error(`[forgot-password] Failed to send password reset email to: ${user.email}`)
        // Still return success to user for security (don't reveal if email failed)
      } else {
        console.log(`[forgot-password] Password reset email sent successfully to: ${user.email}`)
      }
    } catch (error) {
      console.error('[forgot-password] Error sending password reset email:', error)
      // Still return success to user for security (don't reveal if email failed)
    }

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

