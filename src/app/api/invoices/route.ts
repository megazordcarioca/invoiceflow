import { resolveAuth } from "@/lib/supabase/mobile";
import { NextRequest, NextResponse } from "next/server";
import type { InvoiceStatus } from "@/types/invoice";
import { PLAN_LIMITS } from "@/lib/plans";
import type { AsaasPlan } from "@/lib/asaas";

const VALID_STATUSES: InvoiceStatus[] = ["draft", "sent", "paid", "overdue"];
const VALID_SORT_BY = ["created_at", "due_date", "client_name"] as const;

export async function GET(request: NextRequest) {
  const { supabase, user } = await resolveAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const sp = request.nextUrl.searchParams;

  // Pagination
  const page = Math.max(1, parseInt(sp.get("page") ?? "1", 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(sp.get("limit") ?? "20", 10) || 20));
  const offset = (page - 1) * limit;

  // Filters
  const status = sp.get("status") as InvoiceStatus | null;
  const date_from = sp.get("date_from");
  const date_to = sp.get("date_to");
  const q = sp.get("q");

  // Sort
  const sort_by = VALID_SORT_BY.includes(sp.get("sort_by") as never)
    ? (sp.get("sort_by") as (typeof VALID_SORT_BY)[number])
    : "created_at";
  const ascending = sp.get("sort_order") === "asc";

  // Validate status if provided
  if (status && !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
  }

  let query = supabase.from("invoices").select("*", { count: "exact" }).eq("user_id", user.id);

  if (status) query = query.eq("status", status);
  if (date_from) query = query.gte("issue_date", date_from);
  if (date_to) query = query.lte("issue_date", date_to);
  if (q) query = query.ilike("client_name", `%${q}%`);

  const { data, error, count } = await query
    .order(sort_by, { ascending })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  const response = NextResponse.json({
    data,
    meta: { page, limit, total, totalPages },
  });
  response.headers.set("X-Total-Count", String(total));
  return response;
}

export async function POST(request: NextRequest) {
  const { supabase, user } = await resolveAuth(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("plan, status")
    .eq("user_id", user.id)
    .single();

  const plan: AsaasPlan =
    sub && sub.status === "active" && sub.plan !== "free" ? (sub.plan as AsaasPlan) : "free";
  const invoiceLimit = PLAN_LIMITS[plan].invoicesPerMonth;

  if (invoiceLimit !== Infinity) {
    const now = new Date();
    const startOfMonth = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)
    ).toISOString();

    const { count } = await supabase
      .from("invoices")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth);

    if (count !== null && count >= invoiceLimit) {
      return NextResponse.json(
        {
          error: "Free tier limit reached",
          limit: invoiceLimit,
          current: count,
          remaining: Math.max(0, invoiceLimit - count),
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }
  }

  const body = await request.json();
  const { line_items, ...invoiceData } = body;

  const { data: lastInvoice } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  let nextNumber = 1;
  if (lastInvoice?.invoice_number) {
    const match = lastInvoice.invoice_number.match(/(\d+)$/);
    if (match) nextNumber = parseInt(match[1], 10) + 1;
  }
  const invoiceNumber = `INV-${String(nextNumber).padStart(3, "0")}`;

  const { data: invoice, error: invError } = await supabase
    .from("invoices")
    .insert({
      user_id: user.id,
      invoice_number: invoiceNumber,
      client_name: invoiceData.client_name,
      client_email: invoiceData.client_email,
      client_address: invoiceData.client_address || null,
      issue_date: invoiceData.issue_date,
      due_date: invoiceData.due_date,
      notes: invoiceData.notes || null,
      status: "draft",
    })
    .select()
    .single();

  if (invError) return NextResponse.json({ error: invError.message }, { status: 500 });

  if (line_items && line_items.length > 0) {
    const items = line_items.map(
      (item: { description: string; quantity: number; unit_price: number }) => ({
        invoice_id: invoice.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })
    );

    const { error: itemsError } = await supabase.from("invoice_line_items").insert(items);
    if (itemsError) return NextResponse.json({ error: itemsError.message }, { status: 500 });
  }

  const { data: fullInvoice } = await supabase
    .from("invoices")
    .select("*, invoice_line_items(*)")
    .eq("id", invoice.id)
    .single();

  return NextResponse.json(fullInvoice, { status: 201 });
}
