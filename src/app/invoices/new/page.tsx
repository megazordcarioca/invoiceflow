'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { LineItem } from '@/types/invoice';

const EMPTY_LINE: LineItem = { description: '', quantity: 1, unit_price: 0 };

export default function NewInvoicePage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tierWarning, setTierWarning] = useState('');
  const [tierCount, setTierCount] = useState(0);
  const [tierLimit, setTierLimit] = useState(3);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const [form, setForm] = useState({
    client_name: '',
    client_email: '',
    client_address: '',
    issue_date: new Date().toISOString().split('T')[0],
    due_date: '',
    notes: '',
    line_items: [{ ...EMPTY_LINE }],
  });

  const updateLine = (index: number, field: keyof LineItem, value: string | number) => {
    const items = [...form.line_items];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, line_items: items });
  };

  const addLine = () => setForm({ ...form, line_items: [...form.line_items, { ...EMPTY_LINE }] });
  const removeLine = (index: number) => {
    if (form.line_items.length <= 1) return;
    setForm({ ...form, line_items: form.line_items.filter((_, i) => i !== index) });
  };

  const total = form.line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setTierWarning('');
    setLoading(true);

    const res = await fetch('/api/invoices', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      if (res.status === 403 && data.error === 'Free tier limit reached') {
        const count = data.current || 0;
        const limit = data.limit || 3;
        setTierCount(count);
        setTierLimit(limit);
        
        if (count >= limit + 1) {
          setShowUpgradeModal(true);
        } else if (count === limit) {
          setTierWarning(`You have used all ${limit} free invoices for this month`);
        } else if (count === limit - 1) {
          setTierWarning(`1 invoice remaining this month`);
        }
        
        setLoading(false);
        return;
      }
      setError(data.error || 'Failed to create invoice');
      setLoading(false);
      return;
    }

    router.push(`/invoices/${data.id}`);
  };

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
        <h1 className="text-2xl font-bold text-gray-900 mb-6">New Invoice</h1>

        {tierWarning && (
          <div className={`mb-6 p-4 rounded-lg ${
            tierCount === tierLimit - 1 
              ? 'bg-blue-50 border border-blue-200' 
              : 'bg-yellow-50 border border-yellow-200'
          }`}>
            <p className={`font-medium ${
              tierCount === tierLimit - 1 ? 'text-blue-800' : 'text-yellow-800'
            }`}>
              {tierWarning}
            </p>
            <p className={`text-sm mt-1 ${
              tierCount === tierLimit - 1 ? 'text-blue-700' : 'text-yellow-700'
            }`}>
              Your existing invoices remain accessible.
            </p>
          </div>
        )}

        {showUpgradeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Upgrade to Pro
              </h3>
              <p className="text-gray-600 mb-4">
                You&apos;ve used all {tierLimit} free invoices for this month. 
                Upgrade to Pro for unlimited invoices and premium features.
              </p>
              <ul className="text-sm text-gray-600 mb-6 space-y-1">
                <li>✓ Unlimited invoices per month</li>
                <li>✓ Custom invoice templates</li>
                <li>✓ Priority support</li>
              </ul>
              <div className="flex gap-3">
                <Link
                  href="/pricing"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-center"
                >
                  View Plans
                </Link>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
              <input
                type="text"
                required
                value={form.client_name}
                onChange={(e) => setForm({ ...form, client_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Email *</label>
              <input
                type="email"
                required
                value={form.client_email}
                onChange={(e) => setForm({ ...form, client_email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Address</label>
            <input
              type="text"
              value={form.client_address}
              onChange={(e) => setForm({ ...form, client_address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date *</label>
              <input
                type="date"
                required
                value={form.issue_date}
                onChange={(e) => setForm({ ...form, issue_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Line Items *</label>
              <button type="button" onClick={addLine} className="text-sm text-blue-600 hover:underline">
                + Add Item
              </button>
            </div>
            <div className="space-y-3">
              {form.line_items.map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <input
                    type="text"
                    placeholder="Description"
                    required
                    value={item.description}
                    onChange={(e) => updateLine(i, 'description', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    required
                    min="1"
                    step="1"
                    value={item.quantity}
                    onChange={(e) => updateLine(i, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    required
                    min="0"
                    step="0.01"
                    value={item.unit_price || ''}
                    onChange={(e) => updateLine(i, 'unit_price', parseFloat(e.target.value) || 0)}
                    className="w-28 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="py-2 text-sm text-gray-600 w-24 text-right">
                    ${(item.quantity * item.unit_price).toFixed(2)}
                  </span>
                  {form.line_items.length > 1 && (
                    <button type="button" onClick={() => removeLine(i)} className="py-2 text-red-500 hover:text-red-700">
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 text-right text-lg font-bold text-gray-900">
              Total: ${total.toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Link href="/invoices" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Invoice'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
