export const TIERS = {
  FREE: {
    id: "free",
    name: "Free",
    price: 0,
    invoicesPerMonth: 3,
    features: ["PDF export", "Basic dashboard"],
  },
  PRO: {
    id: "pro",
    name: "Pro",
    price: 49,
    invoicesPerMonth: Infinity,
    features: [
      "Unlimited invoices",
      "Custom templates",
      "Payment reminders",
      "Priority email support",
    ],
  },
  BUSINESS: {
    id: "business",
    name: "Business",
    price: 99,
    invoicesPerMonth: Infinity,
    features: [
      "Everything in Pro",
      "Up to 5 team members",
      "API access",
      "Advanced analytics",
      "Chat + email support",
    ],
  },
} as const;

export type TierId = keyof typeof TIERS;
