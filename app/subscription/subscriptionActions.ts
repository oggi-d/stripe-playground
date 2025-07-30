"use server";

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not set in environment variables");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Plan configurations
const PLANS = {
  basic: {
    priceId: "price_1RqSK0Cu6bmtuBQfCjwQ4pkI",
    priceIdYearly: "price_1RqTE0Cu6bmtuBQfYBroUu9a",
    name: "Basic Plan",
  },
  pro: {
    priceId: "price_1RqTG8Cu6bmtuBQfxhba36iM",
    priceIdYearly: "price_1QyHtWCu6bmtuBQfVY0a0Uxb",
    name: "Pro Plan",
  },
  enterprise: {
    priceId: "price_1RqTG8Cu6bmtuBQfxhba36iM",
    priceIdYearly: "price_1QyHtWCu6bmtuBQfVY0a0Uxb",
    name: "Enterprise Plan",
  },
};

export async function getCustomer(email: string) {
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  });
  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0];
  }
  return null;
}

export async function createCustomer(email: string) {
  // Search for an existing customer by email
  let customer = await getCustomer(email);
  if (!customer) {
    // Create a new customer if none exists
    customer = await stripe.customers.create({
      email,
    });
  }
  return customer;
}

export async function createCheckoutSession(
  email: string,
  planType: keyof typeof PLANS
) {
  const plan = PLANS[planType];
  if (!plan) {
    throw new Error("Invalid plan type");
  }

  // Create or get existing customer
  const customer = await createCustomer(email);

  // Create checkout session for subscription with payment method collection
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card"],
    line_items: [
      {
        price: plan.priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${
      process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
    }/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${
      process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
    }/subscription/${planType}`,
    allow_promotion_codes: false,
    billing_address_collection: "required",
    customer_update: {
      address: "auto",
      name: "auto",
    },
  });

  return session;
}

export async function createBillingPortalSession(sessionId: string) {
  try {
    // Get the customer
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const email = session.customer_details?.email;
    if (!email) {
      throw new Error("Email not found in session");
    }

    const customer = await getCustomer(email);
    if (!customer) {
      throw new Error("Customer not found. Please contact support.");
    }

    // Create billing portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: `${
        process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
      }/subscription/success?session_id=${sessionId}`,
    });

    return portalSession;
  } catch (error) {
    throw new Error(
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Failed to create billing portal session"
    );
  }
}
