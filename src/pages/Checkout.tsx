import { useState } from 'react';
import { StripeCheckoutButton } from '@/components/StripeCheckoutButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Shield, CheckCircle2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

// Example pricing plans - Replace with your actual Stripe Price IDs
const PRICING_PLANS = [
  {
    id: 'basic',
    name: 'Basic Plan',
    price: 29.99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_BASIC || 'price_basic',
    features: [
      'Up to 10 job postings',
      'Basic candidate matching',
      'Email support',
      'Standard reports',
    ],
  },
  {
    id: 'pro',
    name: 'Professional Plan',
    price: 79.99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_PRO || 'price_pro',
    features: [
      'Unlimited job postings',
      'Advanced candidate matching',
      'Priority support',
      'Advanced analytics',
      'Custom integrations',
    ],
    popular: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise Plan',
    price: 199.99,
    priceId: import.meta.env.VITE_STRIPE_PRICE_ID_ENTERPRISE || 'price_enterprise',
    features: [
      'Everything in Professional',
      'Dedicated account manager',
      'Custom AI training',
      'SLA guarantee',
      'White-label options',
    ],
  },
];

const FREE_TRIAL_PLAN = {
  id: 'free-trial',
  name: 'Free Trial',
  price: 0,
  priceId: import.meta.env.VITE_STRIPE_PRICE_ID_TRIAL || 'price_trial',
  trialDays: 15,
  features: [
    'Full access to all features',
    '15 days completely free',
    'No credit card required',
    'Cancel anytime',
    'Upgrade anytime',
  ],
};

export default function Checkout() {
  const [selectedPlan, setSelectedPlan] = useState<string>('free-trial');
  const [customerEmail, setCustomerEmail] = useState('');
  const [mode, setMode] = useState<'payment' | 'subscription'>('subscription');
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  const selectedPlanData = 
    selectedPlan === 'free-trial' 
      ? FREE_TRIAL_PLAN 
      : PRICING_PLANS.find((plan) => plan.id === selectedPlan);
  
  const isFreeTrial = selectedPlan === 'free-trial';

  const handleFreeTrial = async () => {
    if (!customerEmail) {
      toast.error('Please enter your email address');
      return;
    }

    setIsStartingTrial(true);
    
    try {
      // In a real app, you would call your backend API to create a free trial subscription
      // For now, we'll show a success message
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      toast.success(`Free trial started! Check your email at ${customerEmail} for confirmation.`);
      
      // Redirect to success page or dashboard
      setTimeout(() => {
        window.location.href = '/payment-success?trial=true';
      }, 2000);
    } catch (error) {
      toast.error('Failed to start free trial. Please try again.');
      setIsStartingTrial(false);
    }
  };

  const successUrl = `${window.location.origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${window.location.origin}/checkout`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-lg text-gray-600 mb-2">
            Select the perfect plan for your recruitment needs
          </p>
          <p className="text-sm text-gray-500 flex items-center justify-center gap-1">
            Powered by{' '}
            <span className="font-semibold text-gray-700">Stripe</span>
          </p>
        </div>

        {/* Free Trial Card - Prominent */}
        <div className="max-w-md mx-auto mb-12">
          <Card className="relative border-2 border-green-500 shadow-xl bg-gradient-to-br from-green-50 to-white">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-white">
              <Sparkles className="h-3 w-3 mr-1 inline" />
              Start Free
            </Badge>
            <CardHeader className="text-center">
              <CardTitle className="text-3xl flex items-center justify-center gap-2">
                {FREE_TRIAL_PLAN.name}
              </CardTitle>
              <div className="mt-4">
                <span className="text-5xl font-bold text-green-600">Free</span>
                <span className="text-gray-600 ml-2 text-lg">
                  for {FREE_TRIAL_PLAN.trialDays} days
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {FREE_TRIAL_PLAN.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                <div className="flex items-center space-x-2 justify-center">
                  <RadioGroupItem value="free-trial" id="free-trial" />
                  <Label htmlFor="free-trial" className="cursor-pointer font-semibold">
                    Select Free Trial
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mb-6">
          <p className="text-gray-600 font-medium">Or choose a paid plan:</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? 'border-2 border-blue-500 shadow-lg scale-105'
                  : 'hover:shadow-lg transition-shadow'
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600 ml-2">
                    /{mode === 'subscription' ? 'month' : 'one-time'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <RadioGroup value={selectedPlan} onValueChange={setSelectedPlan}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value={plan.id} id={plan.id} />
                    <Label htmlFor={plan.id} className="cursor-pointer">
                      Select this plan
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Purchase</CardTitle>
              <CardDescription>
                Enter your email and payment details to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Payment Mode Toggle - Only show for paid plans */}
              {!isFreeTrial && (
                <>
                  <div className="flex items-center gap-4">
                    <Label>Payment Type:</Label>
                    <RadioGroup
                      value={mode}
                      onValueChange={(value) => setMode(value as 'payment' | 'subscription')}
                      className="flex gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="subscription" id="subscription" />
                        <Label htmlFor="subscription" className="cursor-pointer">
                          Monthly Subscription
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="payment" id="payment" />
                        <Label htmlFor="payment" className="cursor-pointer">
                          One-time Payment
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Separator />
                </>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  required
                />
              </div>

              {/* Selected Plan Summary */}
              {selectedPlanData && (
                <Card className={isFreeTrial ? "bg-green-50 border-green-200" : "bg-gray-50"}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{selectedPlanData.name}</span>
                      {isFreeTrial ? (
                        <span className="text-xl font-bold text-green-600">
                          Free for {FREE_TRIAL_PLAN.trialDays} days
                        </span>
                      ) : (
                        <span className="text-xl font-bold">
                          ${selectedPlanData.price}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {isFreeTrial
                        ? 'No credit card required. Start instantly.'
                        : mode === 'subscription'
                        ? 'Billed monthly, cancel anytime'
                        : 'One-time payment'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Security Badge */}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-5 w-5" />
                <span>Secure payment powered by Stripe</span>
              </div>

              {/* Checkout Button */}
              {selectedPlanData && (
                <>
                  {isFreeTrial ? (
                    <Button
                      onClick={handleFreeTrial}
                      disabled={isStartingTrial || !customerEmail}
                      className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                    >
                      {isStartingTrial ? (
                        <>
                          <Sparkles className="mr-2 h-5 w-5 animate-spin" />
                          Starting your free trial...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-5 w-5" />
                          Start Free {FREE_TRIAL_PLAN.trialDays}-Day Trial
                        </>
                      )}
                    </Button>
                  ) : (
                    <StripeCheckoutButton
                      priceId={selectedPlanData.priceId}
                      mode={mode}
                      successUrl={successUrl}
                      cancelUrl={cancelUrl}
                      customerEmail={customerEmail || undefined}
                      metadata={{
                        plan: selectedPlanData.id,
                        plan_name: selectedPlanData.name,
                      }}
                      className="w-full h-12 text-lg"
                    >
                      <CreditCard className="mr-2 h-5 w-5" />
                      {mode === 'subscription'
                        ? `Subscribe for $${selectedPlanData.price}/month`
                        : `Pay $${selectedPlanData.price} Now`}
                    </StripeCheckoutButton>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>SSL Encrypted</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              <span>Cancel Anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              <span>Secure Payment</span>
            </div>
          </div>
          <p className="text-xs text-gray-500">
            Powered by <span className="font-semibold text-gray-700">Stripe</span>
          </p>
        </div>
      </div>
    </div>
  );
}

