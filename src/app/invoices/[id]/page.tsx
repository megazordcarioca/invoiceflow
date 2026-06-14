"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import type { Invoice } from "@/types/invoice";

export default function InvoiceDetailPage() {
  const [invoice, setInvoice] = useState<
    | (Invoice & {
        invoice_line_items: Array<{
          id: string;
          description: string;
          quantity: number;
          unit_price: number;
        }>;
      })
    | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reminderMsg, setReminderMsg] = useState("");
  const [lastReminder, setLastReminder] = useState<{ sent_at: string } | null>(null);
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) ?? "";

  const fetchInvoice = useCallback(async () => {
    const { data } = await supabase
      .from("invoices")
      .select("*, invoice_line_items(*)")
      .eq("id", id)
      .single();
    setInvoice(data);
    setLoading(false);
  }, [id, supabase]);

  const fetchReminders = useCallback(async () => {
    const { data } = await supabase
      .from("reminders")
      .select("sent_at")
      .eq("invoice_id", id)
      .eq("status", "sent")
      .order("sent_at", { ascending: false });

    if (data && data.length > 0) {
      setLastReminder(data[0]);
    }
  }, [id, supabase]);

  useEffect(() => {
    fetchInvoice();
    fetchReminders();
  }, [fetchInvoice, fetchReminders]);

  const today = new Date().toISOString().split("T")[0];
  const computedStatus =
    invoice?.status === "sent" && invoice.due_date < today ? "overdue" : invoice?.status;

  const total =
    invoice?.invoice_line_items?.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    ) || 0;

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;
    await fetch(`/api/invoices/${id}`, { method: "DELETE" });
    router.push("/invoices");
  };

  const handleSendReminder = async () => {
    setSending(true);
    setReminderMsg("");
    const res = await fetch(`/api/invoices/${id}/reminders`, { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setReminderMsg(
        data.status === "sent"
          ? "Reminder sent!"
          : "Failed to send reminder (no email provider configured)"
      );
      fetchReminders();
    } else if (res.status === 429 && data.nextAvailable) {
      const nextDate = new Date(data.nextAvailable);
      setReminderMsg(
        `Rate limited. Next reminder available: ${nextDate.toLocaleDateString()} ${nextDate.toLocaleTimeString()}`
      );
    } else {
      setReminderMsg(data.error || "Failed");
    }
    setSending(false);
  };

  const handleDownloadPdf = () => {
    window.open(`/api/pdf?invoiceId=${id}`, "_blank");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar />
        <main className="flex-1 ml-56 flex items-center justify-center">
          <p className="text-neutral-500">Loading invoice...</p>
        </main>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar />
        <main className="flex-1 ml-56 flex items-center justify-center">
          <p className="text-neutral-500">Invoice not found.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="flex-1 ml-56 flex flex-col">
        <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 z-5">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-neutral-900">{invoice.invoice_number}</h1>
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                computedStatus === "paid"
                  ? "bg-success-100 text-success-700"
                  : computedStatus === "overdue"
                    ? "bg-error-100 text-error-700"
                    : computedStatus === "sent"
                      ? "bg-primary-100 text-primary-700"
                      : "bg-neutral-100 text-neutral-700"
              }`}
            >
              {computedStatus?.charAt(0).toUpperCase()}
              {computedStatus?.slice(1)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-1.5 border border-neutral-200 rounded-md text-sm text-neutral-600 hover:bg-neutral-50"
            >
              Download PDF
            </button>
            {invoice.status === "draft" && (
              <Link
                href={`/invoices/${id}/edit`}
                className="px-3 py-1.5 border border-neutral-200 rounded-md text-sm text-neutral-600 hover:bg-neutral-50"
              >
                Edit
              </Link>
            )}
            {invoice.status === "draft" && (
              <button
                onClick={async () => {
                  await fetch(`/api/invoices/${id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ status: "sent" }),
                  });
                  fetchInvoice();
                }}
                className="px-3 py-1.5 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600"
              >
                Mark as Sent
              </button>
            )}
            {computedStatus === "overdue" && (
              <button
                onClick={handleSendReminder}
                disabled={
                  sending ||
                  Boolean(
                    lastReminder &&
                    Date.now() - new Date(lastReminder.sent_at).getTime() < 7 * 24 * 60 * 60 * 1000
                  )
                }
                className="px-3 py-1.5 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Reminder"}
              </button>
            )}
            {invoice.status === "draft" && (
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 bg-error-500 text-white rounded-md text-sm hover:bg-error-600"
              >
                Delete
              </button>
            )}
          </div>
        </header>

        <div className="p-8 max-w-8xl w-full">
          {reminderMsg && (
            <div className="mb-4 p-3 bg-primary-50 border border-primary-200 text-primary-700 rounded text-sm">
              {reminderMsg}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-2">Bill To</h3>
                <p className="font-medium text-neutral-900">{invoice.client_name}</p>
                <p className="text-sm text-neutral-600">{invoice.client_email}</p>
                {invoice.client_address && (
                  <p className="text-sm text-neutral-600">{invoice.client_address}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500">
                  Issue Date: <span className="text-neutral-900">{invoice.issue_date}</span>
                </p>
                <p className="text-sm text-neutral-500">
                  Due Date: <span className="text-neutral-900">{invoice.due_date}</span>
                </p>
              </div>
            </div>

            <table className="min-w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left text-xs font-medium text-neutral-500 uppercase pb-2">
                    Description
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-500 uppercase pb-2 w-20">
                    Qty
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-500 uppercase pb-2 w-28">
                    Price
                  </th>
                  <th className="text-right text-xs font-medium text-neutral-500 uppercase pb-2 w-28">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoice.invoice_line_items.map((item) => (
                  <tr key={item.id} className="border-b border-neutral-100">
                    <td className="py-3 text-sm text-neutral-900">{item.description}</td>
                    <td className="py-3 text-sm text-right text-neutral-900">{item.quantity}</td>
                    <td className="py-3 text-sm text-right text-neutral-900">
                      ${item.unit_price.toFixed(2)}
                    </td>
                    <td className="py-3 text-sm text-right font-medium text-neutral-900">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="py-3 text-right font-bold text-neutral-900">
                    Total
                  </td>
                  <td className="py-3 text-right font-bold text-lg text-neutral-900">
                    ${total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>

            {invoice.notes && (
              <div>
                <h3 className="text-sm font-medium text-neutral-500 mb-1">Notes</h3>
                <p className="text-sm text-neutral-700">{invoice.notes}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
