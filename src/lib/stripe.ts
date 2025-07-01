import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Client-side Stripe
export const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
)

// Server-side Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-05-28.basil',
})

// Credit packages configuration
export const CREDIT_PACKAGES = [
  {
    id: 'credits_10',
    name: '10 Credits',
    credits: 10,
    price: 5.00, // £5
    priceId: 'price_credits_10', // Will be set up in Stripe
    popular: false,
  },
  {
    id: 'credits_25',
    name: '25 Credits',
    credits: 25,
    price: 10.00, // £10
    priceId: 'price_credits_25', // Will be set up in Stripe
    popular: true,
  },
  {
    id: 'credits_50',
    name: '50 Credits',
    credits: 50,
    price: 18.00, // £18 (10% discount)
    priceId: 'price_credits_50', // Will be set up in Stripe
    popular: false,
  },
  {
    id: 'credits_100',
    name: '100 Credits',
    credits: 100,
    price: 32.00, // £32 (20% discount)
    priceId: 'price_credits_100', // Will be set up in Stripe
    popular: false,
  },
]