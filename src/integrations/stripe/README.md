# Stripe Integration

Esta integración proporciona una interfaz completa para comunicarse con Stripe desde tu aplicación React.

## Configuración

1. **Agrega tu clave pública de Stripe** en tu archivo `.env`:
   ```env
   VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

2. **Crea endpoints API en tu backend** para las operaciones que requieren la clave secreta:
   - `/api/stripe/create-checkout-session`
   - `/api/stripe/create-payment-intent`
   - `/api/stripe/create-subscription`
   - `/api/stripe/update-subscription`
   - `/api/stripe/cancel-subscription`
   - `/api/stripe/subscription/:id`

## Uso

### 1. Checkout Button Component (Más simple)

```tsx
import { StripeCheckoutButton } from '@/components/StripeCheckoutButton';

function PaymentPage() {
  return (
    <StripeCheckoutButton
      priceId="price_1234567890"
      mode="payment"
      successUrl="https://yourapp.com/success"
      cancelUrl="https://yourapp.com/cancel"
      customerEmail="customer@example.com"
    >
      Pay Now
    </StripeCheckoutButton>
  );
}
```

### 2. Usando Hooks Directamente

```tsx
import { useStripeCheckout } from '@/hooks/use-stripe';

function CheckoutForm() {
  const checkout = useStripeCheckout();

  const handlePayment = () => {
    checkout.mutate({
      lineItems: [{ price: 'price_1234567890', quantity: 1 }],
      mode: 'payment',
      successUrl: window.location.origin + '/success',
      cancelUrl: window.location.origin + '/cancel',
    });
  };

  return (
    <button onClick={handlePayment} disabled={checkout.isPending}>
      {checkout.isPending ? 'Processing...' : 'Pay Now'}
    </button>
  );
}
```

### 3. Payment Intent (Pago sin redirección)

```tsx
import { useCreatePaymentIntent, useConfirmPayment } from '@/hooks/use-stripe';
import { getStripe } from '@/integrations/stripe/client';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

function PaymentForm() {
  const createIntent = useCreatePaymentIntent();
  const confirmPayment = useConfirmPayment();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Crear Payment Intent
    const { clientSecret } = await createIntent.mutateAsync({
      amount: 2000, // $20.00 en centavos
      currency: 'usd',
    });

    // 2. Confirmar con Stripe Elements
    // (requiere instalar @stripe/react-stripe-js)
    await confirmPayment.mutateAsync({
      clientSecret,
      paymentMethodId: 'pm_...',
    });
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### 4. Suscripciones

```tsx
import { useCreateSubscription, useCancelSubscription } from '@/hooks/use-stripe';

function SubscriptionManager() {
  const createSubscription = useCreateSubscription();
  const cancelSubscription = useCancelSubscription();

  const handleSubscribe = () => {
    createSubscription.mutate({
      customerId: 'cus_123',
      priceId: 'price_1234567890',
    });
  };

  const handleCancel = () => {
    cancelSubscription.mutate('sub_1234567890');
  };

  return (
    <div>
      <button onClick={handleSubscribe}>Subscribe</button>
      <button onClick={handleCancel}>Cancel</button>
    </div>
  );
}
```

### 5. Usando el Servicio Directamente

```tsx
import { stripeService } from '@/integrations/stripe/service';

// Crear sesión de checkout
const session = await stripeService.createCheckoutSession({
  lineItems: [{ price: 'price_123', quantity: 1 }],
  mode: 'payment',
  successUrl: 'https://yourapp.com/success',
  cancelUrl: 'https://yourapp.com/cancel',
});

// Obtener detalles de suscripción
const subscription = await stripeService.getSubscription('sub_123');
```

## Notas Importantes

1. **Clave Secreta**: Nunca expongas tu clave secreta de Stripe (`sk_...`) en el frontend. Todas las operaciones que la requieren deben ejecutarse en tu backend.

2. **Endpoints API**: Necesitas crear endpoints en tu backend que usen la clave secreta. Puedes usar:
   - Supabase Edge Functions
   - Express/Node.js server
   - Next.js API routes
   - Cualquier backend que soporte Node.js

3. **Variables de Entorno**: Solo usa `VITE_STRIPE_PUBLISHABLE_KEY` en el frontend (las variables que empiezan con `VITE_` son públicas).

## Ejemplo de Backend Endpoint (Supabase Edge Function)

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

serve(async (req) => {
  if (req.method === "POST") {
    const { lineItems, mode, successUrl, cancelUrl } = await req.json();
    
    const session = await stripe.checkout.sessions.create({
      line_items: lineItems,
      mode,
      success_url: successUrl,
      cancel_url: cancelUrl,
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { "Content-Type": "application/json" } }
    );
  }
});
```

