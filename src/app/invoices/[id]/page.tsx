"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
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
  const [reminderCount, setReminderCount] = useState(0);
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
      setReminderCount(data.length);
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
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-500">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500 mb-4">Invoice not found.</p>
          <Link href="/invoices" className="text-primary-600 hover:underline font-medium">
            Back to invoices
          </Link>
        </div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    paid: "bg-success-50 text-success-600",
    overdue: "bg-error-50 text-error-500",
    sent: "bg-primary-50 text-primary-600",
    draft: "bg-neutral-100 text-neutral-600",
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xl font-bold text-primary-600">
                InvoiceFlow
              </Link>
              <Link
                href="/invoices"
                className="text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                Invoices
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">{invoice.invoice_number}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${computedStatus ? statusColors[computedStatus] : ""}`}
              >
                {computedStatus?.charAt(0).toUpperCase()}
                {computedStatus?.slice(1)}
              </span>
              {reminderCount > 0 && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-warning-50 text-warning-600">
                  {reminderCount} reminder{reminderCount !== 1 ? "s" : ""} sent
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-2 border border-neutral-200 rounded-md text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
            >
              Download PDF
            </button>
            {invoice.status === "draft" && (
              <Link
                href={`/invoices/${id}/edit`}
                className="px-3 py-2 border border-neutral-200 rounded-md text-sm text-neutral-700 hover:bg-neutral-50 transition-colors"
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
                className="px-3 py-2 bg-primary-600 text-white rounded-md text-sm hover:bg-primary-700 transition-colors"
              >
                Mark as Sent
              </button>
            )}
            {computedStatus === "overdue" && (
              <div className="relative group">
                <button
                  onClick={handleSendReminder}
                  disabled={
                    sending ||
                    Boolean(
                      lastReminder &&
                      Date.now() - new Date(lastReminder.sent_at).getTime() <
                        7 * 24 * 60 * 60 * 1000
                    )
                  }
                  className="px-3 py-2 bg-warning-500 text-white rounded-md text-sm hover:bg-warning-600 disabled:opacity-50 transition-colors"
                >
                  {sending ? "Sending..." : "Send Reminder"}
                </button>
                {lastReminder &&
                  Date.now() - new Date(lastReminder.sent_at).getTime() <
                    7 * 24 * 60 * 60 * 1000 && (
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-neutral-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      Next reminder available:{" "}
                      {new Date(
                        new Date(lastReminder.sent_at).getTime() + 7 * 24 * 60 * 60 * 1000
                      ).toLocaleDateString()}
                    </div>
                  )}
              </div>
            )}
            {invoice.status === "draft" && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-error-500 text-white rounded-md text-sm hover:bg-error-600 transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>

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
                Issue Date:{" "}
                <span className="text-neutral-900 font-medium">{invoice.issue_date}</span>
              </p>
              <p className="text-sm text-neutral-500">
                Due Date: <span className="text-neutral-900 font-medium">{invoice.due_date}</span>
              </p>
            </div>
          </div>

          <table className="min-w-full">
            <thead>
              <tr className="border-b border-neutral-200">
                <th className="text-left text-xs font-semibold text-neutral-500 uppercase pb-2">
                  Description
                </th>
                <th className="text-right text-xs font-semibold text-neutral-500 uppercase pb-2 w-20">
                  Qty
                </th>
                <th className="text-right text-xs font-semibold text-neutral-500 uppercase pb-2 w-28">
                  Price
                </th>
                <th className="text-right text-xs font-semibold text-neutral-500 uppercase pb-2 w-28">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoice_line_items.map((item) => (
                <tr key={item.id} className="border-b border-neutral-100">
                  <td className="py-3 text-sm text-neutral-900">{item.description}</td>
                  <td className="py-3 text-sm text-right text-neutral-700">{item.quantity}</td>
                  <td className="py-3 text-sm text-right text-neutral-700">
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
      </main>
    </div>
  );
}
