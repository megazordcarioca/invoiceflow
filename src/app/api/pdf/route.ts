import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import React from "react";
import { InvoicePDF } from "@/components/InvoicePDF";

export async function GET(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const invoiceId = searchParams.get("invoiceId");
  if (!invoiceId) return NextResponse.json({ error: "invoiceId required" }, { status: 400 });

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*, invoice_line_items(*)")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (error || !invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();

  const total =
    invoice.invoice_line_items?.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    ) || 0;

  const pdfElement = React.createElement(InvoicePDF, {
    invoice: {
      ...invoice,
      total,
      freelancer_name: profile?.name || user.email || "",
      freelancer_company: profile?.company || "",
    },
  });

  const buffer = await renderToBuffer(pdfElement);

  const clientName = invoice.client_name.replace(/[^a-zA-Z0-9]/g, "_");
  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.invoice_number}_${clientName}.pdf"`,
    },
  });
}
