export const FREE_TIER_LIMIT = 3;

export const REMINDER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;

export const APP_NAME = "InvoiceFlow";

export const PRICING_PAGE = "/pricing";

export const TIER_INFO = {
  FREE: {
    invoicesPerMonth: FREE_TIER_LIMIT,
    label: "Free",
  },
  PRO: {
    price: 49,
    label: "Pro",
  },
  BUSINESS: {
    price: 99,
    label: "Business",
  },
} as const;
