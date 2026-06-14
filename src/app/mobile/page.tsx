"use client";

import { FormEvent, useEffect, useState } from "react";

const LAUNCH_DATE = new Date("2026-07-31T00:00:00Z");

function useCountdown(target: Date) {
  const [remaining, setRemaining] = useState(target.getTime() - Date.now());

  useEffect(() => {
    const tick = () => setRemaining(Math.max(0, target.getTime() - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [target]);

  const days = Math.floor(remaining / 86400000);
  const hours = Math.floor((remaining % 86400000) / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  return { days, hours, minutes, seconds, expired: remaining <= 0 };
}

function CountdownBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl md:text-4xl font-bold text-white tabular-nums">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs md:text-sm text-primary-200 uppercase tracking-widest mt-1">
        {label}
      </span>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[240px] h-[486px] md:w-[280px] md:h-[566px]">
      <div className="absolute inset-0 bg-neutral-900 rounded-[36px] shadow-2xl border-2 border-neutral-700">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120px] h-[28px] bg-neutral-900 rounded-b-xl" />
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[60px] h-[6px] bg-neutral-700 rounded-full" />
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[110px] h-[4px] bg-neutral-700 rounded-full" />
        <div className="mx-[10px] my-[44px] bg-white rounded-2xl overflow-hidden h-[calc(100%-88px)]">
          <div className="bg-primary-600 px-3 py-2 flex items-center justify-between">
            <div className="w-5 h-5 bg-white/20 rounded-md" />
            <span className="text-white text-xs font-semibold">InvoiceFlow</span>
            <div className="w-5 h-5 bg-white/20 rounded-full" />
          </div>
          <div className="p-3 space-y-3">
            <div className="bg-neutral-50 rounded-lg p-2">
              <div className="text-[10px] text-neutral-500 mb-1">Total Earned</div>
              <div className="text-lg font-bold text-neutral-900">$1,234</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-neutral-50 rounded-lg p-2">
                <div className="text-[10px] text-neutral-500">Pending</div>
                <div className="text-sm font-bold text-neutral-900">$456</div>
              </div>
              <div className="bg-warning-50 rounded-lg p-2 border border-warning-200">
                <div className="text-[10px] text-warning-600">Overdue</div>
                <div className="text-sm font-bold text-warning-700">$234</div>
              </div>
            </div>
            <div className="text-[10px] text-neutral-500 font-medium">Recent Invoices</div>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-1.5 border-b border-neutral-100 last:border-0"
              >
                <div>
                  <div className="text-xs font-medium text-neutral-900">INV-00{i}</div>
                  <div className="text-[10px] text-neutral-400">
                    Client {String.fromCharCode(64 + i)}
                  </div>
                </div>
                <div className="text-xs font-semibold text-neutral-900">$150</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MobilePage() {
  const { days, hours, minutes, seconds, expired } = useCountdown(LAUNCH_DATE);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(email)) return;
    setStatus("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        const data = await res.json();
        if (data.message === "Email already registered") {
          setStatus("success");
        } else {
          setStatus("error");
        }
      }
    } catch {
      setStatus("error");
    }
  };

  const handleShare = async (platform: "twitter" | "linkedin" | "whatsapp") => {
    const url = "https://invoiceflow.app/mobile";
    const text =
      "I just joined the waitlist for InvoiceFlow Mobile! 📱 Track invoices on the go. Join me:";
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);

    const shareUrls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      linkedin: `https://linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    };

    window.open(shareUrls[platform], "_blank", "noopener,noreferrer,width=600,height=400");
  };

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-b from-primary-800 via-primary-700 to-primary-600 px-4 pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-primary-200 text-sm md:text-base font-semibold uppercase tracking-widest mb-3">
              Coming Soon
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 text-balance">
              InvoiceFlow Mobile
            </h1>
            <p className="text-lg md:text-xl text-primary-100 max-w-2xl mx-auto text-balance">
              Create, send, and track invoices from anywhere. Your entire freelance business in your
              pocket.
            </p>
          </div>
          <PhoneMockup />
        </div>
      </section>

      {/* Countdown + Waitlist */}
      <section className="px-4 py-16 md:py-24 max-w-3xl mx-auto text-center -mt-16 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-8 md:p-12">
          {!expired ? (
            <>
              <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">Launching in</h2>
              <div className="flex justify-center gap-4 md:gap-8 mb-8">
                <CountdownBlock value={days} label="Days" />
                <span className="text-3xl md:text-4xl font-bold text-primary-200 self-start mt-1">
                  :
                </span>
                <CountdownBlock value={hours} label="Hours" />
                <span className="text-3xl md:text-4xl font-bold text-primary-200 self-start mt-1">
                  :
                </span>
                <CountdownBlock value={minutes} label="Minutes" />
                <span className="text-3xl md:text-4xl font-bold text-primary-200 self-start mt-1">
                  :
                </span>
                <CountdownBlock value={seconds} label="Seconds" />
              </div>
            </>
          ) : (
            <h2 className="text-xl md:text-2xl font-bold text-neutral-900 mb-2">
              We&apos;re live!
            </h2>
          )}

          <p className="text-neutral-600 mb-6">
            Be the first to know when InvoiceFlow Mobile launches. Get exclusive early adopter
            perks.
          </p>

          {status === "success" ? (
            <div className="p-4 bg-success-50 border border-success-200 rounded-xl">
              <p className="text-success-700 font-semibold">
                You&apos;re on the list! We&apos;ll notify you when we launch.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  disabled={status === "submitting"}
                  required
                  className="flex-1 px-4 py-3 border border-neutral-200 rounded-xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-50"
                  aria-label="Email address"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="px-6 py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 disabled:bg-primary-400 transition-colors min-h-[48px] whitespace-nowrap"
                >
                  {status === "submitting" ? "Subscribing..." : "Get Early Access"}
                </button>
              </div>
              {status === "error" && (
                <p className="text-error-500 text-sm">Something went wrong. Please try again.</p>
              )}
            </form>
          )}
        </div>
      </section>

      {/* Features Preview */}
      <section className="px-4 py-16 md:py-24 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 text-center mb-12">
            Everything you need, on the go
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                icon: "⚡",
                title: "Create in Seconds",
                desc: "Tap, fill, send. Invoice creation optimized for mobile with smart defaults.",
              },
              {
                icon: "📊",
                title: "Dashboard at a Glance",
                desc: "See your earnings, pending payments, and overdue invoices instantly.",
              },
              {
                icon: "🔔",
                title: "Push Notifications",
                desc: "Get notified when invoices are sent, marked as paid, or become overdue — right on your phone.",
              },
              {
                icon: "📎",
                title: "PDF on the Fly",
                desc: "Generate and share professional PDF invoices directly from your phone.",
              },
              {
                icon: "📤",
                title: "Send Invoices",
                desc: "Send invoices directly to your clients via email, right from your phone.",
              },
              {
                icon: "📱",
                title: "Offline Mode",
                desc: "Create invoices even without internet. They sync when you&apos;re back online.",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="bg-white p-6 md:p-8 rounded-xl border border-neutral-200 hover:border-primary-200 hover:shadow-md transition-all"
              >
                <span className="text-2xl mb-3 block">{feature.icon}</span>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{feature.title}</h3>
                <p className="text-neutral-600 text-sm md:text-base">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Share */}
      <section className="px-4 py-16 md:py-24 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-neutral-900 mb-4">Spread the word</h2>
        <p className="text-neutral-600 mb-8">
          Know someone who needs better invoicing? Share the news and help them get early access.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            onClick={() => handleShare("twitter")}
            className="px-6 py-3 bg-neutral-900 text-white font-semibold rounded-xl hover:bg-neutral-700 transition-colors min-h-[48px]"
          >
            Share on X
          </button>
          <button
            onClick={() => handleShare("linkedin")}
            className="px-6 py-3 bg-[#0A66C2] text-white font-semibold rounded-xl hover:bg-[#004182] transition-colors min-h-[48px]"
          >
            Share on LinkedIn
          </button>
          <button
            onClick={() => handleShare("whatsapp")}
            className="px-6 py-3 bg-[#25D366] text-white font-semibold rounded-xl hover:bg-[#1da851] transition-colors min-h-[48px]"
          >
            Share on WhatsApp
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 px-4 py-8 text-center">
        <p className="text-neutral-500 text-sm mb-2">
          Create, send, and track invoices in 60 seconds.
        </p>
        <a
          href="/"
          className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors"
        >
          Back to InvoiceFlow
        </a>
      </footer>
    </main>
  );
}
