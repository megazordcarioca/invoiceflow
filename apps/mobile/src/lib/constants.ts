export const FREE_TIER_LIMIT = 3;
export const REMINDER_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
export const APP_NAME = "InvoiceFlow";

export const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  draft: { bg: "#f3f4f6", text: "#6b7280", label: "Draft" },
  sent: { bg: "#dbeafe", text: "#2563eb", label: "Sent" },
  paid: { bg: "#d1fae5", text: "#059669", label: "Paid" },
  overdue: { bg: "#fee2e2", text: "#dc2626", label: "Overdue" },
};
