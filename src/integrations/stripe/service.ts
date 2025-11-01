import { getStripe } from './client';
import type {
  CreateCheckoutSessionParams,
  CreatePaymentIntentParams,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
  CheckoutSessionResponse,
  PaymentIntentResponse,
  SubscriptionResponse,
} from './types';

/**
 * Stripe Service
 * Provides methods to interact with Stripe API
 * 
 * Note: Most operations require a backend API endpoint that uses the Stripe secret key.
 * This service provides the client-side interface. You'll need to create API endpoints
 * in your backend (e.g., using Supabase Edge Functions, Express, etc.)
 */

export class StripeService {
  private apiUrl: string;

  constructor(apiUrl: string = '/api/stripe') {
    this.apiUrl = apiUrl;
  }

  /**
   * Create a Checkout Session
   * Redirects customer to Stripe Checkout
   */
  async createCheckoutSession(
    params: CreateCheckoutSessionParams
  ): Promise<CheckoutSessionResponse> {
    const response = await fetch(`${this.apiUrl}/create-checkout-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create checkout session');
    }

    return response.json();
  }

  /**
   * Create a Payment Intent
   * For one-time payments without redirecting to Checkout
   */
  async createPaymentIntent(
    params: CreatePaymentIntentParams
  ): Promise<PaymentIntentResponse> {
    const response = await fetch(`${this.apiUrl}/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create payment intent');
    }

    return response.json();
  }

  /**
   * Create a Subscription
   */
  async createSubscription(
    params: CreateSubscriptionParams
  ): Promise<SubscriptionResponse> {
    const response = await fetch(`${this.apiUrl}/create-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create subscription');
    }

    return response.json();
  }

  /**
   * Update a Subscription
   */
  async updateSubscription(
    params: UpdateSubscriptionParams
  ): Promise<SubscriptionResponse> {
    const response = await fetch(`${this.apiUrl}/update-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update subscription');
    }

    return response.json();
  }

  /**
   * Cancel a Subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    const response = await fetch(`${this.apiUrl}/cancel-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscriptionId }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to cancel subscription');
    }
  }

  /**
   * Get Subscription details
   */
  async getSubscription(subscriptionId: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}/subscription/${subscriptionId}`);

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get subscription');
    }

    return response.json();
  }

  /**
   * Redirect to Stripe Checkout
   * Helper method that creates a session and redirects
   */
  async redirectToCheckout(params: CreateCheckoutSessionParams): Promise<void> {
    const stripe = await getStripe();
    if (!stripe) {
      throw new Error('Stripe is not initialized');
    }

    const { url } = await this.createCheckoutSession(params);
    if (url) {
      window.location.href = url;
    } else {
      throw new Error('Failed to get checkout URL');
    }
  }
}

// Export a default instance
export const stripeService = new StripeService();

