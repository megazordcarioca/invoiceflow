import { createClient } from "@/lib/supabase/server";
import type { DreMonthly, DreSummary } from "./types";

function getMonthBounds(year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
  return { start: start.toISOString(), end: end.toISOString() };
}

function formatMonthLabel(year: number, month: number): string {
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

function fmtMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

export async function fetchDreMonth(year: number, month: number): Promise<DreMonthly> {
  const supabase = createClient();
  const { start, end } = getMonthBounds(year, month);

  const { data: invoices } = await supabase
    .from("invoices")
    .select("*, invoice_line_items(*)")
    .gte("created_at", start)
    .lte("created_at", end)
    .order("created_at", { ascending: false });

  let totalPaid = 0;
  let totalPending = 0;
  let totalOverdue = 0;
  let paidCount = 0;

  for (const inv of invoices || []) {
    const subtotal = (inv.invoice_line_items || []).reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    );
    if (inv.status === "paid") {
      totalPaid += subtotal;
      paidCount++;
    } else if (inv.status === "pending" || inv.status === "sent") {
      totalPending += subtotal;
    } else if (inv.status === "overdue") {
      totalOverdue += subtotal;
    }
  }

  let previousMonth: DreMonthly["previousMonth"];
  if (month > 1) {
    const prev = await fetchDreMonth(year, month - 1);
    const prevRevenue = prev.revenue.totalPaid;
    const changePercent = prevRevenue > 0 ? ((totalPaid - prevRevenue) / prevRevenue) * 100 : 0;
    previousMonth = {
      revenue: prevRevenue,
      changePercent,
    };
  }

  return {
    month: fmtMonth(year, month),
    year,
    monthLabel: formatMonthLabel(year, month),
    revenue: {
      totalPaid,
      totalPending,
      totalOverdue,
      invoiceCount: paidCount,
    },
    previousMonth,
  };
}

export async function fetchDreSummary(year: number, month: number): Promise<DreSummary> {
  const currentMonth = await fetchDreMonth(year, month);

  const availableMonths = [];
  for (let m = 1; m <= 12; m++) {
    availableMonths.push({
      year,
      month: m,
      label: formatMonthLabel(year, m),
    });
  }

  return {
    currentMonth,
    availableMonths,
  };
}

export function formatBRL(n: number): string {
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

export function formatPercent(n: number): string {
  return `${n >= 0 ? "+" : ""}${n.toFixed(1)}%`;
}
