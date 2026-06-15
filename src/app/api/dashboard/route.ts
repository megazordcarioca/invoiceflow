import { resolveAuth } from "@/lib/supabase/mobile";
import { NextRequest, NextResponse } from "next/server";
import { PLAN_LIMITS } from "@/lib/plans";

export async function GET(request: NextRequest) {
  const { supabase, user } = await resolveAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*, invoice_line_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const invoicesThisMonth = (invoices || []).filter(
    (inv: { created_at: string }) => new Date(inv.created_at) >= new Date(startOfMonth)
  ).length;

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .single();

  const plan: string = sub && sub.status === "active" && sub.plan !== "free"
    ? (sub.plan ?? "free")
    : "free";
  const tierLimit = PLAN_LIMITS[plan].invoicesPerMonth;

  let totalEarned = 0;
  let pending = 0;
  let overdue = 0;
  let monthToDateEarned = 0;

  for (const invoice of invoices || []) {
    const subtotal = (invoice.invoice_line_items || []).reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    );

    if (invoice.status === "paid") {
      totalEarned += subtotal;
      if (new Date(invoice.updated_at) >= new Date(startOfMonth)) {
        monthToDateEarned += subtotal;
      }
    } else if (invoice.status === "sent") {
      if (new Date(invoice.due_date) < now) {
        overdue += subtotal;
      } else {
        pending += subtotal;
      }
    } else if (invoice.status === "overdue") {
      overdue += subtotal;
    }
  }

  const recentInvoices = (invoices || []).slice(0, 5).map((invoice) => ({
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    client_name: invoice.client_name,
    status: invoice.status,
    total: (invoice.invoice_line_items || []).reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    ),
    due_date: invoice.due_date,
    created_at: invoice.created_at,
  }));

  return NextResponse.json({
    stats: {
      totalEarned,
      pending,
      overdue,
      monthToDateEarned,
    },
    tierInfo: {
      plan,
      invoicesThisMonth,
      tierLimit,
      remaining: tierLimit === Infinity ? null : Math.max(0, tierLimit - invoicesThisMonth),
    },
    recentInvoices,
  });
}
