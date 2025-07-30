"use server";

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-01-27.acacia",
});

export async function createCustomer(customerName: string) {
  try {
    const customer = await stripe.customers.create({
      name: customerName,
      email: `${customerName}@example.com`,
    });
    return customer;
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to create customer"
    );
  }
}

export async function initiateSetup(customerId: string) {
  if (!customerId) throw new Error("Customer ID is required");

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      customer: customerId,
      payment_method_types: ["card"],
      success_url: `${process.env.NEXT_PUBLIC_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}?canceled=true&customer_id=${customerId}`,
    });
    return session;
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to create setup session"
    );
  }
}

export async function updateSetup(customerId: string) {
  if (!customerId) throw new Error("Customer ID is required");

  try {
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_URL}?customer_id=${customerId}`, // Adjust the return URL as needed
    });
    return portalSession;
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to create customer portal session"
    );
  }
}

export async function chargeCustomerAndCreditBalance(
  customerId: string,
  amountInDollars: number
) {
  if (!customerId) throw new Error("Customer ID is required");
  if (!amountInDollars || amountInDollars <= 0)
    throw new Error("Valid amount is required");

  const amountInCents = Math.round(amountInDollars * 100);
  const paymentMethodId = await retrieveDefaultPaymentMethodId(customerId);

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      customer: customerId,
      payment_method_types: ["card"],
      payment_method: paymentMethodId,
      confirm: true,
      off_session: true,
    });

    if (paymentIntent.status === "succeeded") {
      const balanceTransaction =
        await stripe.customers.createBalanceTransaction(customerId, {
          amount: -amountInCents,
          currency: "usd",
          description: "Funding customer balance from default payment method",
        });
      return balanceTransaction;
    } else {
      throw new Error("Payment failed");
    }
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to charge customer and fund balance"
    );
  }
}

export async function debitBalance(
  customerId: string,
  amountInDollars: number
) {
  if (!customerId) throw new Error("Customer ID is required");
  if (!amountInDollars || amountInDollars <= 0)
    throw new Error("Valid amount is required");

  const amountInCents = Math.round(amountInDollars * 100);

  try {
    const customer = await stripe.customers.retrieve(customerId);
    if ("deleted" in customer) {
      throw new Error("Customer has been deleted");
    }
    const currentBalance = customer.balance || 0;
    console.log("====== currentBalance: ", currentBalance);

    if (currentBalance + amountInCents > 0) {
      throw new Error("Insufficient balance to cover the transaction");
    }

    const updatedCustomer = await stripe.customers.createBalanceTransaction(
      customerId,
      {
        amount: amountInCents, // Use a positive amount to debit the balance
        currency: "usd",
        description: "Debiting customer balance",
      }
    );

    return updatedCustomer;
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to debit funds"
    );
  }
}

export async function retrieveSession(sessionId: string) {
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to retrieve session"
    );
  }
}

export async function updateDefaultPaymentMethod(
  customerId: string,
  paymentMethodId: string
) {
  try {
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to update default payment method"
    );
  }
}

export async function retrieveSetupIntent(setupIntentId: string) {
  try {
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    return setupIntent.payment_method;
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to retrieve setup intent"
    );
  }
}

export async function retrieveDefaultPaymentMethodId(customerId: string) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    // Ensure the customer object is of the correct type
    if (
      customer &&
      typeof customer === "object" &&
      "invoice_settings" in customer
    ) {
      return customer.invoice_settings.default_payment_method as string;
    } else {
      throw new Error("Customer does not have a default payment method set");
    }
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to retrieve default payment method"
    );
  }
}

export async function initiateCheckoutSession(
  customerId: string,
  amountInDollars: number
) {
  if (!customerId) throw new Error("Customer ID is required");
  if (!amountInDollars || amountInDollars <= 0)
    throw new Error("Valid amount is required");

  const amountInCents = Math.round(amountInDollars * 100);

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Credit Balance",
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer: customerId,
      success_url: `${process.env.NEXT_PUBLIC_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}?canceled=true&customer_id=${customerId}`,
    });
    return session;
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to create checkout session"
    );
  }
}

export async function initiateSetupIntent(customerId: string) {
  if (!customerId) throw new Error("Customer ID is required");

  try {
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ["card"],
    });
    return setupIntent;
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to create setup intent"
    );
  }
}
