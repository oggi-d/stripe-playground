"use client";

import { useState, useEffect } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, AlertCircle } from "lucide-react";
import {
  createCustomer,
  initiateSetup,
  updateSetup,
  retrieveSession,
  updateDefaultPaymentMethod,
  retrieveSetupIntent,
  chargeCustomerAndCreditBalance,
  debitBalance,
} from "./actions";

export default function StripePage() {
  const [customerId, setCustomerId] = useState<string>("");
  const [creditBalanceAmount, setCreditBalanceAmount] = useState("");
  const [debitBalanceAmount, setDebitBalanceAmount] = useState("");
  const [customerName, setCustomerName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get("session_id");
    const returnedCustomerId = urlParams.get("customer_id");

    if (sessionId) {
      (async () => {
        try {
          const session = await retrieveSession(sessionId);
          if (session.customer) {
            setCustomerId(session.customer as string);
          }
          if (session.setup_intent) {
            const paymentMethodId = await retrieveSetupIntent(
              session.setup_intent as string
            );

            if (paymentMethodId) {
              await updateDefaultPaymentMethod(
                session.customer as string,
                paymentMethodId as string
              );
              console.log("Default payment method updated successfully");
            }
          }
        } catch (error) {
          console.error("Failed to retrieve session:", error);
        }
      })();
    }

    if (returnedCustomerId) {
      setCustomerId(returnedCustomerId);
    }
  }, []);

  const handleAction = async (
    action: () => Promise<any>,
    successMessage: string
  ) => {
    try {
      setLoading(true);
      setStatus(null);
      const result = await action();
      setStatus({
        type: "success",
        message: successMessage + (result.id ? ` (ID: ${result.id})` : ""),
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCustomer = () =>
    handleAction(async () => {
      const result = await createCustomer(customerName);
      setCustomerId(result.id);
      return result;
    }, "Customer created successfully");

  const handleInitiateSetup = () =>
    handleAction(async () => {
      const setupResult = await initiateSetup(customerId);
      if (setupResult.url) {
        window.location.href = setupResult.url;
      }

      return setupResult;
    }, "Setup session created successfully");

  const handleUpdateSetup = () =>
    handleAction(async () => {
      const portalResult = await updateSetup(customerId);
      if (portalResult.url) {
        window.location.href = portalResult.url;
      }
      return portalResult;
    }, "Setup session updated successfully");

  const handleCreditBalance = () =>
    handleAction(
      () =>
        chargeCustomerAndCreditBalance(
          customerId,
          Number.parseInt(creditBalanceAmount)
        ),
      `Successfully funded customer balance with $${creditBalanceAmount}`
    );

  const handleDebitBalance = () =>
    handleAction(
      () => debitBalance(customerId, Number.parseInt(debitBalanceAmount)),
      `Successfully debited customer balance with $${debitBalanceAmount}`
    );

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Stripe Playground</CardTitle>
          <CardDescription>
            Test various Stripe operations in development mode
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status && (
            <Alert
              variant={status.type === "success" ? "default" : "destructive"}
            >
              {status.type === "success" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertDescription>{status.message}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <Input
              type="text"
              placeholder="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleCreateCustomer}
              disabled={loading || !customerName}
              className="w-full"
            >
              1. Create Customer
            </Button>

            <Button
              onClick={handleInitiateSetup}
              disabled={loading || !customerId}
              className="w-full"
            >
              2. Setup Your Primary Payment Method
            </Button>

            <Button
              onClick={handleUpdateSetup}
              disabled={loading || !customerId}
              className="w-full"
            >
              3. Manage Your Payment Methods
            </Button>

            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Amount in dollars"
                  value={creditBalanceAmount}
                  onChange={(e) => setCreditBalanceAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleCreditBalance}
                  disabled={loading || !customerId || !creditBalanceAmount}
                  className="flex-1"
                >
                  4. Credit
                </Button>
              </div>
              <div className="flex space-x-2">
                <Input
                  type="number"
                  placeholder="Amount in dollars"
                  value={debitBalanceAmount}
                  onChange={(e) => setDebitBalanceAmount(e.target.value)}
                  className="flex-1"
                />
                <Button
                  onClick={handleDebitBalance}
                  disabled={loading || !debitBalanceAmount}
                  className="flex-1"
                >
                  5. Debit
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start">
          <div className="text-sm text-muted-foreground">
            {customerId && (
              <p>
                Current Customer ID: {customerId}
                <a
                  href={`https://dashboard.stripe.com/test/customers/${customerId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View in Stripe Dashboard
                </a>
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
