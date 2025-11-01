import { loadStripe, Stripe } from '@stripe/stripe-js';

// Stripe publishable key - should be set in environment variables
// For development, you can use test keys from Stripe Dashboard
const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

let stripePromise: Promise<Stripe | null>;

/**
 * Initialize Stripe instance
 * This function ensures Stripe is only loaded once and reused across the app
 */
export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    if (!STRIPE_PUBLISHABLE_KEY) {
      console.warn('Stripe publishable key is not set. Please set VITE_STRIPE_PUBLISHABLE_KEY in your .env file');
      return Promise.resolve(null);
    }
    stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * Get the Stripe instance (non-promise version)
 * Use this if you need to access Stripe methods directly
 */
export const stripe = getStripe();

