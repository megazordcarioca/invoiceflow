"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import type { LineItem } from "@/types/invoice";

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const id = (params?.id as string) ?? "";
  const supabase = createClient();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [form, setForm] = useState({
    client_name: "",
    client_email: "",
    client_address: "",
    issue_date: "",
    due_date: "",
    notes: "",
    line_items: [] as LineItem[],
  });
  const [invoiceStatus, setInvoiceStatus] = useState<string>("draft");
  const isSent = invoiceStatus === "sent";

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("invoices")
        .select("*, invoice_line_items(*)")
        .eq("id", id)
        .single();
      if (data) {
        setInvoiceStatus(data.status);
        setForm({
          client_name: data.client_name,
          client_email: data.client_email,
          client_address: data.client_address || "",
          issue_date: data.issue_date,
          due_date: data.due_date,
          notes: data.notes || "",
          line_items: data.invoice_line_items || [],
        });
      }
      setFetching(false);
    };
    load();
  }, [id, supabase]);

  const updateLine = (index: number, field: keyof LineItem, value: string | number) => {
    const items = [...form.line_items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, line_items: items });
  };

  const addLine = () =>
    setForm({
      ...form,
      line_items: [...form.line_items, { description: "", quantity: 1, unit_price: 0 }],
    });
  const removeLine = (index: number) => {
    if (form.line_items.length <= 1) return;
    setForm({ ...form, line_items: form.line_items.filter((_, i) => i !== index) });
  };

  const total = form.line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Failed to update");
      setLoading(false);
      return;
    }

    router.push(`/invoices/${id}`);
  };

  if (fetching) {
    return (
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar />
        <main className="flex-1 ml-56 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-500">Loading invoice...</p>
          </div>
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
            <h1 className="text-lg font-bold text-neutral-900">Edit Invoice</h1>
          </div>
          <div />
        </header>

        <div className="p-8 max-w-4xl w-full mx-auto">
          {isSent && (
            <div className="mb-6 p-4 bg-warning-50 border border-warning-500 rounded-lg">
              <p className="text-warning-800 font-medium">
                This invoice has been sent. Client info and line items are locked.
              </p>
              <p className="text-warning-700 text-sm mt-1">You can still edit notes and due date.</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-error-50 border border-error-500 text-error-600 rounded text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 space-y-6"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Client Name *
                </label>
                <input
                  type="text"
                  required
                  disabled={isSent}
                  value={form.client_name}
                  onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 placeholder-neutral-400 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Client Email *
                </label>
                <input
                  type="email"
                  required
                  disabled={isSent}
                  value={form.client_email}
                  onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 placeholder-neutral-400 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Client Address
              </label>
              <input
                type="text"
                disabled={isSent}
                value={form.client_address}
                onChange={(e) => setForm({ ...form, client_address: e.target.value })}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 placeholder-neutral-400 disabled:bg-neutral-100 disabled:cursor-not-allowed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Issue Date *
                </label>
                <input
                  type="date"
                  required
                  value={form.issue_date}
                  onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={form.due_date}
                  onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Notes</label>
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 placeholder-neutral-400"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-neutral-700">Line Items *</label>
                {!isSent && (
                  <button
                    type="button"
                    onClick={addLine}
                    className="text-sm text-primary-600 hover:underline font-medium"
                  >
                    + Add Item
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {form.line_items.map((item, i) => (
                  <div key={i} className="flex gap-3 items-start">
                    <input
                      type="text"
                      placeholder="Description"
                      required
                      disabled={isSent}
                      value={item.description}
                      onChange={(e) => updateLine(i, "description", e.target.value)}
                      className="flex-1 px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 placeholder-neutral-400 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      required
                      min="1"
                      disabled={isSent}
                      value={item.quantity}
                      onChange={(e) => updateLine(i, "quantity", parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    />
                    <input
                      type="number"
                      placeholder="Price"
                      required
                      min="0"
                      step="0.01"
                      disabled={isSent}
                      value={item.unit_price || ""}
                      onChange={(e) => updateLine(i, "unit_price", parseFloat(e.target.value) || 0)}
                      className="w-28 px-3 py-2 border border-neutral-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-neutral-900 disabled:bg-neutral-100 disabled:cursor-not-allowed"
                    />
                    <span className="py-2 text-sm text-neutral-600 w-24 text-right">
                      ${(item.quantity * item.unit_price).toFixed(2)}
                    </span>
                    {!isSent && form.line_items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(i)}
                        className="py-2 text-error-500 hover:text-error-700 transition-colors"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-right text-lg font-bold text-neutral-900">
                Total: ${total.toFixed(2)}
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Link
                href={`/invoices/${id}`}
                className="px-4 py-2 border border-neutral-200 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 transition-colors"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
