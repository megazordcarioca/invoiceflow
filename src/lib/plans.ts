import { createClient } from "@/lib/supabase/server";

const PLAN_LIMITS: Record<string, { invoicesPerMonth: number; label: string }> = {
  free: { invoicesPerMonth: 3, label: "Free" },
  pro: { invoicesPerMonth: Infinity, label: "Pro" },
  business: { invoicesPerMonth: Infinity, label: "Business" },
};

export async function getUserPlan(userId: string): Promise<{
  plan: string;
  invoicesPerMonth: number;
  label: string;
}> {
  const supabase = createClient();

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", userId)
    .single();

  const plan: string = sub && sub.status === "active" ? (sub.plan ?? "free") : "free";

  return {
    plan,
    invoicesPerMonth: PLAN_LIMITS[plan].invoicesPerMonth,
    label: PLAN_LIMITS[plan].label,
  };
}

export async function checkInvoiceLimit(userId: string): Promise<{
  allowed: boolean;
  current: number;
  limit: number;
  plan: string;
  remaining: number;
}> {
  const supabase = createClient();
  const planInfo = await getUserPlan(userId);

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", startOfMonth);

  const current = count ?? 0;
  const allowed = current < planInfo.invoicesPerMonth;
  const remaining = Math.max(0, planInfo.invoicesPerMonth - current);

  return { allowed, current, limit: planInfo.invoicesPerMonth, plan: planInfo.plan, remaining };
}

export async function getDashboardTierInfo(userId: string): Promise<{
  plan: string;
  invoicesThisMonth: number;
  tierLimit: number;
  remaining: number;
}> {
  const supabase = createClient();
  const planInfo = await getUserPlan(userId);

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("created_at")
    .eq("user_id", userId);

  const invoicesThisMonth = (invoices || []).filter(
    (inv) => new Date(inv.created_at) >= new Date(startOfMonth)
  ).length;

  return {
    plan: planInfo.plan,
    invoicesThisMonth,
    tierLimit: planInfo.invoicesPerMonth,
    remaining: Math.max(0, planInfo.invoicesPerMonth - invoicesThisMonth),
  };
}

export { PLAN_LIMITS };
