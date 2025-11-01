import { useMutation, useQuery } from '@tanstack/react-query';
import { getStripe } from '@/integrations/stripe/client';
import { stripeService } from '@/integrations/stripe/service';
import type {
  CreateCheckoutSessionParams,
  CreatePaymentIntentParams,
  CreateSubscriptionParams,
  UpdateSubscriptionParams,
} from '@/integrations/stripe/types';

/**
 * Hook to redirect to Stripe Checkout
 */
export function useStripeCheckout() {
  return useMutation({
    mutationFn: async (params: CreateCheckoutSessionParams) => {
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe is not initialized');
      }

      const { url } = await stripeService.createCheckoutSession(params);
      if (url) {
        window.location.href = url;
      } else {
        throw new Error('Failed to get checkout URL');
      }
    },
  });
}

/**
 * Hook to create a Payment Intent
 */
export function useCreatePaymentIntent() {
  return useMutation({
    mutationFn: (params: CreatePaymentIntentParams) =>
      stripeService.createPaymentIntent(params),
  });
}

/**
 * Hook to confirm Payment Intent using Stripe Elements
 */
export function useConfirmPayment() {
  return useMutation({
    mutationFn: async ({
      clientSecret,
      paymentMethodId,
    }: {
      clientSecret: string;
      paymentMethodId: string;
    }) => {
      const stripe = await getStripe();
      if (!stripe) {
        throw new Error('Stripe is not initialized');
      }

      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
  });
}

/**
 * Hook to create a Subscription
 */
export function useCreateSubscription() {
  return useMutation({
    mutationFn: (params: CreateSubscriptionParams) =>
      stripeService.createSubscription(params),
  });
}

/**
 * Hook to update a Subscription
 */
export function useUpdateSubscription() {
  return useMutation({
    mutationFn: (params: UpdateSubscriptionParams) =>
      stripeService.updateSubscription(params),
  });
}

/**
 * Hook to cancel a Subscription
 */
export function useCancelSubscription() {
  return useMutation({
    mutationFn: (subscriptionId: string) =>
      stripeService.cancelSubscription(subscriptionId),
  });
}

/**
 * Hook to get Subscription details
 */
export function useSubscription(subscriptionId: string | null) {
  return useQuery({
    queryKey: ['stripe-subscription', subscriptionId],
    queryFn: () => {
      if (!subscriptionId) {
        throw new Error('Subscription ID is required');
      }
      return stripeService.getSubscription(subscriptionId);
    },
    enabled: !!subscriptionId,
  });
}

