import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing Stripe signature' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: unknown) {
    console.error('Webhook signature verification failed:', error.message)
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        
        if (session.payment_status === 'paid') {
          const { userId, credits } = session.metadata || {}
          
          if (!userId || !credits) {
            console.error('Missing metadata in session:', session.id)
            break
          }

          const creditsToAdd = parseInt(credits)
          
          // Get current user credits
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('credits')
            .eq('id', userId)
            .single()

          if (userError) {
            console.error('Error fetching user:', userError)
            break
          }

          // Update user credits
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              credits: userData.credits + creditsToAdd 
            })
            .eq('id', userId)

          if (updateError) {
            console.error('Error updating credits:', updateError)
            break
          }

          // Log the transaction (optional - you might want to create a transactions table)
          console.log(`Successfully added ${creditsToAdd} credits to user ${userId}`)
        }
        break

      case 'payment_intent.payment_failed':
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.error('Payment failed:', paymentIntent.id)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error: unknown) {
    console.error('Error processing webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}