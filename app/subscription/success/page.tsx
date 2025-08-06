"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, LoaderIcon } from "lucide-react";
import Link from "next/link";
import {
  cancelSubscription,
  createBillingPortalSession,
} from "../subscriptionActions";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleManagePayment = async () => {
    if (!sessionId) {
      setError("No session ID found");
      return;
    }
    const portalSession = await createBillingPortalSession(sessionId);
    if (portalSession.url) {
      window.location.href = portalSession.url;
    } else {
      setError("Failed to create billing portal session");
    }
  };

  const handleCancelSubscription = async () => {
    if (!sessionId) {
      setError("No session ID found");
      return;
    }
    await cancelSubscription(sessionId);
    alert("Subscription cancelled successfully");
  };

  useEffect(() => {
    if (sessionId) {
      // You can add a server action to verify the session if needed
      // For now, we'll just show success
      setLoading(false);
      setSession({ id: sessionId });
    } else {
      setError("No session ID found");
      setLoading(false);
    }
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex items-center justify-center p-8">
            <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2">Verifying your subscription...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Something went wrong</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/subscription">
              <Button>Back to Plans</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircleIcon className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Subscription Successful!
          </CardTitle>
          <CardDescription className="text-lg">
            Welcome! Your subscription has been activated successfully.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 text-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Session ID:{" "}
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {sessionId}
              </code>
            </p>
            <p className="text-sm">
              You should receive a confirmation email shortly with your
              subscription details.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full block"
              onClick={handleManagePayment}
            >
              Manage Payment Methods
            </Button>
          </div>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full block"
              onClick={handleCancelSubscription}
            >
              Cancel Subscription
            </Button>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-semibold mb-2">What's next?</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Check your email for subscription confirmation</li>
              <li>• Explore your new features and benefits</li>
              <li>• Contact support if you have any questions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="flex items-center justify-center p-8">
              <LoaderIcon className="w-8 h-8 animate-spin text-blue-500" />
              <span className="ml-2">Loading...</span>
            </CardContent>
          </Card>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
