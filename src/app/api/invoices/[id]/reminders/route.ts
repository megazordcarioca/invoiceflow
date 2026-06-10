import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function createTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;
  return nodemailer.createTransport({
    host,
    port: parseInt(process.env.SMTP_PORT || "587", 10),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || "" }
      : undefined,
  });
}

const FROM_EMAIL = process.env.SMTP_FROM || "InvoiceFlow <noreply@invoiceflow.app>";

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!invoice) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const today = new Date();
  const dueDate = new Date(invoice.due_date);
  const isOverdue = dueDate < today && invoice.status === "sent";
  if (!isOverdue) {
    return NextResponse.json(
      { error: "Reminders only available for overdue invoices" },
      { status: 400 }
    );
  }

  const { data: lastReminder } = await supabase
    .from("reminders")
    .select("sent_at")
    .eq("invoice_id", params.id)
    .order("sent_at", { ascending: false })
    .limit(1)
    .single();

  if (lastReminder) {
    const lastSent = new Date(lastReminder.sent_at).getTime();
    if (Date.now() - lastSent < SEVEN_DAYS_MS) {
      const nextAvailable = new Date(lastSent + SEVEN_DAYS_MS);
      return NextResponse.json(
        {
          error: "Reminder rate limited",
          nextAvailable: nextAvailable.toISOString(),
        },
        { status: 429 }
      );
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const freelancerName = profile?.name || user.email || "InvoiceFlow";

  let status = "sent";

  const transporter = createTransporter();
  if (transporter) {
    try {
      console.log(
        "[reminders] Sending reminder email for invoice",
        params.id,
        "to",
        invoice.client_email
      );
      await transporter.sendMail({
        from: FROM_EMAIL,
        to: invoice.client_email,
        subject: `Payment Reminder: ${invoice.invoice_number} from ${freelancerName}`,
        html: `
          <h2>Payment Reminder</h2>
          <p>This is a friendly reminder that invoice <strong>${invoice.invoice_number}</strong> is overdue.</p>
          <p>Client: ${invoice.client_name}</p>
          <p>Due date: ${invoice.due_date}</p>
          ${invoice.notes ? `<p>Notes: ${invoice.notes}</p>` : ""}
          <p>Please arrange payment at your earliest convenience.</p>
          <p>Thank you,<br>${freelancerName}</p>
        `,
      });
    } catch (err) {
      console.error("[reminders] Failed to send email for invoice", params.id, err);
      status = "failed";
    }
  } else {
    console.warn("[reminders] SMTP_HOST not configured — marking reminder as failed");
    status = "failed";
  }

  const { error } = await supabase.from("reminders").insert({
    invoice_id: params.id,
    status,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { count } = await supabase
    .from("reminders")
    .select("*", { count: "exact", head: true })
    .eq("invoice_id", params.id)
    .eq("status", "sent");

  return NextResponse.json({
    success: true,
    status,
    reminderCount: count || 0,
  });
}
