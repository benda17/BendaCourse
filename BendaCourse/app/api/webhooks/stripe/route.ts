import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'No signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    )
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  // Log webhook
  await prisma.webhookLog.create({
    data: {
      provider: 'STRIPE',
      event: event.type,
      payload: event as any,
    },
  })

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const courseId = session.metadata?.courseId

      if (userId && courseId) {
        // Create enrollment
        await prisma.enrollment.create({
          data: {
            userId,
            courseId,
          },
        })

        // Create payment record
        await prisma.payment.create({
          data: {
            userId,
            courseId,
            amount: (session.amount_total || 0) / 100,
            currency: session.currency || 'usd',
            provider: 'STRIPE',
            providerPaymentId: session.id,
            status: 'COMPLETED',
          },
        })

        // Update webhook log
        await prisma.webhookLog.updateMany({
          where: {
            provider: 'STRIPE',
            event: event.type,
            processed: false,
          },
          data: {
            processed: true,
          },
        })
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    await prisma.webhookLog.updateMany({
      where: {
        provider: 'STRIPE',
        event: event.type,
        processed: false,
      },
      data: {
        processed: true,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
    })

    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

