import type { Stripe } from '@stripe/stripe-js';

/**
 * Stripe Checkout Session Response
 */
export interface CheckoutSessionResponse {
  sessionId: string;
  url: string | null;
}

/**
 * Payment Intent Response
 */
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

/**
 * Subscription Response
 */
export interface SubscriptionResponse {
  subscriptionId: string;
  customerId: string;
  status: string;
}

/**
 * Product information
 */
export interface ProductInfo {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency: string;
  image?: string;
}

/**
 * Create Checkout Session params
 */
export interface CreateCheckoutSessionParams {
  lineItems: Array<{
    price: string; // Price ID from Stripe
    quantity?: number;
  }>;
  mode?: 'payment' | 'subscription' | 'setup';
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  metadata?: Record<string, string>;
}

/**
 * Create Payment Intent params
 */
export interface CreatePaymentIntentParams {
  amount: number; // Amount in cents
  currency?: string;
  customerId?: string;
  metadata?: Record<string, string>;
  paymentMethodTypes?: string[];
}

/**
 * Create Subscription params
 */
export interface CreateSubscriptionParams {
  customerId: string;
  priceId: string;
  paymentMethodId?: string;
  metadata?: Record<string, string>;
}

/**
 * Update Subscription params
 */
export interface UpdateSubscriptionParams {
  subscriptionId: string;
  priceId?: string;
  cancelAtPeriodEnd?: boolean;
  metadata?: Record<string, string>;
}

export type { Stripe };

