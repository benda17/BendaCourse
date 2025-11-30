import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Log webhook
    await prisma.webhookLog.create({
      data: {
        provider: 'PAYPAL',
        event: body.event_type || 'unknown',
        payload: body,
      },
    })

    // TODO: Implement PayPal webhook verification and processing
    // This is a placeholder - you'll need to verify the webhook signature
    // and process payment events similar to Stripe

    if (body.event_type === 'PAYMENT.CAPTURE.COMPLETED') {
      const paymentId = body.resource?.id
      const userId = body.resource?.custom_id?.split(':')[0]
      const courseId = body.resource?.custom_id?.split(':')[1]

      if (userId && courseId) {
        await prisma.enrollment.create({
          data: {
            userId,
            courseId,
          },
        })

        await prisma.payment.create({
          data: {
            userId,
            courseId,
            amount: parseFloat(body.resource?.amount?.value || '0'),
            currency: body.resource?.amount?.currency || 'USD',
            provider: 'PAYPAL',
            providerPaymentId: paymentId,
            status: 'COMPLETED',
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('PayPal webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

