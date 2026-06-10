"use client";

import { FormEvent, useState } from "react";

export default function Home() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [emailError, setEmailError] = useState("");

  const validateEmail = (value: string) => {
    if (!value) {
      setEmailError("Email is required");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleBlur = () => {
    validateEmail(email);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateEmail(email)) {
      return;
    }

    setStatus("submitting");
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setStatus("success");
        setEmail("");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-4 md:px-8 py-12 md:py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-4 md:mb-6 text-balance">
            Get paid faster. Invoice in 60 seconds.
          </h1>
          <p className="text-lg md:text-xl text-neutral-600 mb-8 text-balance">
            InvoiceFlow turns your work into paid invoices. No more admin, just money.
          </p>
          <p className="text-2xl md:text-3xl font-bold text-primary-600 mb-8">
            $7/mo.{" "}
            <span className="text-neutral-600 font-normal text-lg md:text-xl">Start free.</span>
          </p>
        </div>

        {/* Email Capture Form */}
        <div className="max-w-md mx-auto mb-16">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailError("");
                }}
                onBlur={handleBlur}
                placeholder="you@example.com"
                disabled={status === "submitting"}
                className="w-full px-4 py-3 md:py-3.5 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all disabled:bg-neutral-50"
                aria-label="Email address"
                minLength={5}
                maxLength={254}
              />
              {emailError && <p className="text-error-500 text-sm mt-1">{emailError}</p>}
            </div>
            <button
              type="submit"
              disabled={status === "submitting" || status === "success"}
              className="w-full px-6 py-3 md:py-3.5 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 disabled:bg-primary-400 transition-colors min-h-[44px] flex items-center justify-center"
            >
              {status === "submitting" && "Getting early access..."}
              {status === "idle" && "Get Early Access"}
              {status === "success" && "✓ Check your email"}
              {status === "error" && "Try again"}
            </button>
          </form>

          {/* Success Message */}
          {status === "success" && (
            <div className="mt-4 p-3 bg-success-50 border border-success-500 rounded-lg">
              <p className="text-success-600 text-sm font-medium">
                Welcome to InvoiceFlow! Check your email for early access details.
              </p>
            </div>
          )}

          {/* Error Message */}
          {status === "error" && (
            <div className="mt-4 p-3 bg-error-50 border border-error-500 rounded-lg">
              <p className="text-error-600 text-sm font-medium">
                Something went wrong. Please try again.
              </p>
            </div>
          )}
        </div>

        {/* Trust Signals */}
        <div className="border-t border-neutral-200 pt-8 md:pt-12">
          <p className="text-neutral-500 text-sm md:text-base text-center mb-6 font-medium">
            Trusted by forward-thinking companies
          </p>

          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-8 mb-8">
            <div className="text-neutral-600 text-sm font-medium">Stripe Partner</div>
            <div className="text-neutral-600 text-sm font-medium">SOC 2 Certified</div>
            <div className="text-neutral-600 text-sm font-medium">GDPR Compliant</div>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 text-xs md:text-sm text-neutral-600">
            <span>✓ No credit card required</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ 14-day free trial</span>
            <span className="hidden sm:inline">•</span>
            <span>✓ Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-neutral-50 px-4 md:px-8 py-12 md:py-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-12">
            Why choose InvoiceFlow?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white p-6 md:p-8 rounded-lg border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Fast & Simple</h3>
              <p className="text-neutral-600 text-sm md:text-base">
                Create an invoice in under a minute. No complex workflows or unnecessary steps.
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-lg border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Always Available</h3>
              <p className="text-neutral-600 text-sm md:text-base">
                Access your invoices anytime, anywhere. Works on desktop and mobile.
              </p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-lg border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-900 mb-2">Secure & Reliable</h3>
              <p className="text-neutral-600 text-sm md:text-base">
                Bank-level security with Stripe integration for safe payments.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 md:px-8 py-12 md:py-20 max-w-6xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">
          Start creating invoices in seconds
        </h2>
        <p className="text-neutral-600 text-lg mb-8">
          Join hundreds of freelancers getting paid faster
        </p>
        <button className="px-8 py-3 md:py-4 bg-primary-600 text-white font-semibold rounded-lg hover:bg-primary-700 transition-colors inline-flex items-center justify-center min-h-[44px]">
          Get Early Access for $7/mo
        </button>
      </section>
    </main>
  );
}
