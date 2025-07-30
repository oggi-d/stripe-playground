import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon } from "lucide-react";
import Link from "next/link";

type PlanType = "basic" | "pro" | "enterprise";

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    price: "$29",
    description: "Perfect for getting started",
    features: [
      "Up to 5 projects",
      "Basic support",
      "10GB storage",
      "Standard features",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$49",
    description: "Best for growing businesses",
    features: [
      "Unlimited projects",
      "Priority support",
      "100GB storage",
      "Advanced features",
      "Analytics dashboard",
      "Team collaboration",
    ],
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "$99",
    description: "For large organizations",
    features: [
      "Everything in Pro",
      "Dedicated support",
      "Unlimited storage",
      "Custom integrations",
      "Advanced security",
      "SLA guarantee",
    ],
  },
];

export default function SubscriptionPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground mb-4">
          Select the perfect plan for your needs. Upgrade or downgrade at any
          time.
        </p>
        <div className="mb-8">
          <Link href="/subscription/manage-payment">
            <Button variant="outline" size="sm">
              Already subscribed? Manage Payment Methods
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`relative flex flex-col h-full ${
              plan.popular ? "border-primary shadow-lg scale-105" : ""
            }`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                Most Popular
              </Badge>
            )}

            <CardHeader className="text-center">
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>

            <CardContent className="flex-1">
              <ul className="space-y-3">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>

            <CardFooter>
              <Link href={`/subscription/${plan.id}`} className="w-full">
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                >
                  Subscribe to {plan.name}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
