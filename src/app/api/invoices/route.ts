import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const FREE_TIER_LIMIT = 3;

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(invoices);
}

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("created_at", startOfMonth);

  if (count !== null && count >= FREE_TIER_LIMIT) {
    const remaining = Math.max(0, FREE_TIER_LIMIT - count);
    return NextResponse.json(
      {
        error: "Free tier limit reached",
        limit: FREE_TIER_LIMIT,
        current: count,
        remaining,
        upgradeUrl: "/pricing",
      },
      { status: 403 }
    );
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
