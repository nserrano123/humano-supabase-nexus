import { useStripeCheckout } from '@/hooks/use-stripe';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import type { CreateCheckoutSessionParams } from '@/integrations/stripe/types';

interface StripeCheckoutButtonProps {
  priceId: string;
  mode?: 'payment' | 'subscription';
  successUrl: string;
  cancelUrl: string;
  customerEmail?: string;
  quantity?: number;
  metadata?: Record<string, string>;
  children?: React.ReactNode;
  className?: string;
}

/**
 * Stripe Checkout Button Component
 * Example usage of Stripe integration
 */
export function StripeCheckoutButton({
  priceId,
  mode = 'payment',
  successUrl,
  cancelUrl,
  customerEmail,
  quantity = 1,
  metadata,
  children,
  className,
}: StripeCheckoutButtonProps) {
  const checkout = useStripeCheckout();

  const handleCheckout = () => {
    const params: CreateCheckoutSessionParams = {
      lineItems: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode,
      successUrl,
      cancelUrl,
      customerEmail,
      metadata,
    };

    checkout.mutate(params);
  };

  return (
    <Button
      onClick={handleCheckout}
      disabled={checkout.isPending}
      className={className}
    >
      {checkout.isPending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children || 'Checkout'
      )}
    </Button>
  );
}

