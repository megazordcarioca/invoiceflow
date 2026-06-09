'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import type { Invoice } from '@/types/invoice';

export default function InvoiceDetailPage() {
  const [invoice, setInvoice] = useState<(Invoice & { invoice_line_items: Array<{ id: string; description: string; quantity: number; unit_price: number }> }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [reminderMsg, setReminderMsg] = useState('');
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  useEffect(() => {
    fetchInvoice();
  }, [id]);

  const fetchInvoice = async () => {
    const { data } = await supabase
      .from('invoices')
      .select('*, invoice_line_items(*)')
      .eq('id', id)
      .single();
    setInvoice(data);
    setLoading(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const computedStatus =
    invoice?.status === 'sent' && invoice.due_date < today ? 'overdue' : invoice?.status;

  const total =
    invoice?.invoice_line_items?.reduce(
      (sum: number, item: { quantity: number; unit_price: number }) => sum + item.quantity * item.unit_price,
      0
    ) || 0;

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this invoice?')) return;
    await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    router.push('/invoices');
  };

  const handleSendReminder = async () => {
    setSending(true);
    setReminderMsg('');
    const res = await fetch(`/api/invoices/${id}/reminders`, { method: 'POST' });
    const data = await res.json();
    if (res.ok) {
      setReminderMsg(data.status === 'sent' ? 'Reminder sent!' : 'Failed to send reminder (no email provider configured)');
    } else {
      setReminderMsg(data.error || 'Failed');
    }
    setSending(false);
  };

  const handleDownloadPdf = () => {
    window.open(`/api/pdf?invoiceId=${id}`, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading invoice...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Invoice not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">InvoiceFlow</Link>
              <Link href="/invoices" className="text-sm font-medium text-gray-600 hover:text-gray-900">Invoices</Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoice_number}</h1>
            <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
              computedStatus === 'paid' ? 'bg-green-100 text-green-800' :
              computedStatus === 'overdue' ? 'bg-red-100 text-red-800' :
              computedStatus === 'sent' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {computedStatus?.charAt(0).toUpperCase()}{computedStatus?.slice(1)}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPdf}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
            >
              Download PDF
            </button>
            {invoice.status === 'draft' && (
              <Link
                href={`/invoices/${id}/edit`}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit
              </Link>
            )}
            {invoice.status === 'draft' && (
              <button
                onClick={async () => {
                  await fetch(`/api/invoices/${id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ status: 'sent' }),
                  });
                  fetchInvoice();
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
              >
                Mark as Sent
              </button>
            )}
            {computedStatus === 'overdue' && (
              <button
                onClick={handleSendReminder}
                disabled={sending}
                className="px-3 py-2 bg-yellow-500 text-white rounded-md text-sm hover:bg-yellow-600 disabled:opacity-50"
              >
                {sending ? 'Sending...' : 'Send Reminder'}
              </button>
            )}
            {invoice.status === 'draft' && (
              <button
                onClick={handleDelete}
                className="px-3 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        {reminderMsg && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded text-sm">{reminderMsg}</div>
        )}

        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Bill To</h3>
              <p className="font-medium">{invoice.client_name}</p>
              <p className="text-sm text-gray-600">{invoice.client_email}</p>
              {invoice.client_address && <p className="text-sm text-gray-600">{invoice.client_address}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Issue Date: <span className="text-gray-900">{invoice.issue_date}</span></p>
              <p className="text-sm text-gray-500">Due Date: <span className="text-gray-900">{invoice.due_date}</span></p>
            </div>
          </div>

          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 uppercase pb-2">Description</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2 w-20">Qty</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2 w-28">Price</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase pb-2 w-28">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoice_line_items.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 text-sm">{item.description}</td>
                  <td className="py-3 text-sm text-right">{item.quantity}</td>
                  <td className="py-3 text-sm text-right">${item.unit_price.toFixed(2)}</td>
                  <td className="py-3 text-sm text-right font-medium">${(item.quantity * item.unit_price).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={3} className="py-3 text-right font-bold">Total</td>
                <td className="py-3 text-right font-bold text-lg">${total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          {invoice.notes && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Notes</h3>
              <p className="text-sm text-gray-700">{invoice.notes}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
