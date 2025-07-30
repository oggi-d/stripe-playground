"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CheckIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  ShieldCheckIcon,
  StarIcon,
} from "lucide-react";
import Link from "next/link";
import { createCheckoutSession } from "../subscriptionActions";

type PlanType = "basic" | "pro" | "enterprise";

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
  highlight?: string;
}

const plans: Record<PlanType, Plan> = {
  basic: {
    id: "basic",
    name: "Basic",
    price: "$29",
    description: "Perfect for getting started with your projects",
    highlight: "Great for individuals and small projects",
    features: [
      "Up to 5 projects",
      "Basic support via email",
      "10GB storage",
      "Standard features",
      "Monthly reports",
      "Basic analytics",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: "$49",
    description: "Best for growing businesses and teams",
    highlight: "Most popular choice for growing businesses",
    features: [
      "Unlimited projects",
      "Priority support",
      "100GB storage",
      "Advanced features",
      "Analytics dashboard",
      "Team collaboration",
      "Custom integrations",
      "Weekly reports",
    ],
    popular: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    description: "For large organizations with advanced needs",
    highlight: "Enterprise-grade security and support",
    features: [
      "Everything in Pro",
      "Dedicated support manager",
      "Unlimited storage",
      "Custom integrations",
      "Advanced security & compliance",
      "SLA guarantee",
      "Custom onboarding",
      "Daily reports",
      "API access",
      "White-label options",
    ],
  },
};

export default function PlanPage({ params }: { params: { plan: string } }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const planType = params.plan as PlanType;
  const plan = plans[planType];

  if (!plan) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Plan Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The requested plan does not exist.
        </p>
        <Link href="/subscription">
          <Button variant="outline">
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Plans
          </Button>
        </Link>
      </div>
    );
  }

  const handleSignInOrUp = async () => {
    if (!email) {
      setStatus({
        type: "error",
        message: "Please enter your email address",
      });
      return;
    }

    try {
      setLoading(true);
      setStatus(null);

      // Create checkout session and redirect to Stripe
      const session = await createCheckoutSession(email, planType);

      // Redirect to Stripe checkout
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error("Failed to create checkout session");
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Link href="/subscription">
            <Button variant="ghost" className="mb-4">
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to all plans
            </Button>
          </Link>

          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              {plan.popular && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">
                  <StarIcon className="w-3 h-3 mr-1" />
                  Most Popular
                </Badge>
              )}
            </div>
            <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {plan.name} Plan
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              {plan.description}
            </p>
            <p className="text-lg font-medium text-blue-600">
              {plan.highlight}
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Plan Details Card */}
          <Card className="shadow-xl border-0">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-t-lg">
              <div className="text-center">
                <CardTitle className="text-3xl mb-2">{plan.name}</CardTitle>
                <div className="text-4xl font-bold mb-2">
                  {plan.price}
                  <span className="text-lg font-normal">/month</span>
                </div>
                <CardDescription className="text-blue-100">
                  {plan.description}
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ShieldCheckIcon className="w-4 h-4" />
                  30-day money-back guarantee
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3 flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-2" />
                    What's included:
                  </h3>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Subscription Form Card */}
          <Card className="shadow-xl border-0">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center">
                <CreditCardIcon className="w-6 h-6 mr-2" />
                Start Your Subscription
              </CardTitle>
              <CardDescription>
                Get started with {plan.name} plan today. Cancel anytime.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12"
                  />
                </div>

                {status && (
                  <div
                    className={`p-4 rounded-lg ${
                      status.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200"
                        : "bg-red-50 text-red-800 border border-red-200"
                    }`}
                  >
                    {status.message}
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{plan.name} Plan</span>
                  <span className="font-bold">{plan.price}/month</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>Billed monthly</span>
                  <span>Cancel anytime</span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="pt-0">
              <Button
                className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                onClick={handleSignInOrUp}
                disabled={loading || !email}
              >
                {loading
                  ? "Redirecting to Stripe..."
                  : `Continue to Payment - ${plan.price}/month`}
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Trust indicators */}
        <div className="mt-12 text-center">
          <div className="flex justify-center items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <ShieldCheckIcon className="w-4 h-4" />
              Secure payments
            </div>
            <div className="flex items-center gap-1">
              <CheckIcon className="w-4 h-4" />
              No setup fees
            </div>
            <div className="flex items-center gap-1">
              <StarIcon className="w-4 h-4" />
              Cancel anytime
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
