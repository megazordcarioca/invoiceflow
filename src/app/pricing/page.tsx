"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: 0,
    currency: "$",
    interval: "forever",
    description: "Perfect for getting started",
    features: ["3 invoices per month", "PDF export", "Basic dashboard"],
    cta: "Get Started",
    highlighted: false,
  },
  {
    id: "pro",
    name: "Pro",
    price: 9,
    currency: "$",
    interval: "month",
    description: "For serious freelancers",
    features: [
      "Unlimited invoices",
      "Custom templates",
      "Payment reminders",
      "Priority email support",
    ],
    cta: "Subscribe to Pro",
    highlighted: true,
  },
  {
    id: "business",
    name: "Business",
    price: 19,
    currency: "$",
    interval: "month",
    description: "For growing teams",
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "API access",
      "Advanced analytics",
      "Chat + email support",
    ],
    cta: "Subscribe to Business",
    highlighted: false,
  },
] as const;

export default function PricingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleSubscribe = async (planId: string) => {
    setLoading(planId);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    if (planId === "free") {
      router.push("/dashboard");
      return;
    }

    try {
      const res = await fetch("/api/asaas/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId, billingType: "CREDIT_CARD" }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create subscription");
        return;
      }

      router.push("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary-600">
            InvoiceFlow
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-4">Simple, transparent pricing</h1>
          <p className="text-xl text-neutral-600">Start free. Upgrade when you need more.</p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-8 p-3 bg-error-50 border border-error-500 text-error-600 rounded text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg border ${
                plan.highlighted
                  ? "border-primary-500 ring-2 ring-primary-500 shadow-lg"
                  : "border-neutral-200 shadow-sm"
              } p-8 flex flex-col`}
            >
              {plan.highlighted && (
                <span className="text-xs font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full self-start mb-4">
                  Most Popular
                </span>
              )}

              <h2 className="text-2xl font-bold text-neutral-900 mb-1">{plan.name}</h2>
              <p className="text-neutral-500 text-sm mb-4">{plan.description}</p>

              <div className="mb-6">
                <span className="text-4xl font-bold text-neutral-900">
                  {plan.currency}
                  {plan.price}
                </span>
                <span className="text-neutral-500 ml-1">/{plan.interval}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-sm text-neutral-700">
                    <svg
                      className="w-5 h-5 text-primary-500 shrink-0 mt-0.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading === plan.id}
                className={`w-full py-3 rounded-lg font-semibold text-sm transition-colors ${
                  plan.highlighted
                    ? "bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-400"
                    : "border border-neutral-200 text-neutral-700 hover:bg-neutral-50 disabled:opacity-50"
                }`}
              >
                {loading === plan.id ? "Processing..." : plan.cta}
              </button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-neutral-500 text-sm">
            All plans include a 14-day free trial. No credit card required.
          </p>
        </div>
      </main>
    </div>
  );
}
