'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Invoice, InvoiceStatus } from '@/types/invoice';
import StatusBadge from './StatusBadge';

type SortField = 'invoice_number' | 'client_name' | 'amount' | 'issue_date' | 'due_date' | 'status';
type SortDir = 'asc' | 'desc';

function computeDisplayStatus(invoice: Invoice): InvoiceStatus {
  if (invoice.status === 'sent') {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(invoice.due_date);
    dueDate.setHours(0, 0, 0, 0);
    if (dueDate < today) return 'overdue';
  }
  return invoice.status;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function computeAmount(invoice: Invoice): number {
  if (!invoice.line_items || invoice.line_items.length === 0) return 0;
  return invoice.line_items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
}

interface Props {
  invoices: Invoice[];
}

export default function InvoiceListClient({ invoices }: Props) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('due_date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);
  const [deleting, setDeleting] = useState(false);

  const enriched = useMemo(
    () =>
      invoices.map((inv) => ({
        ...inv,
        displayStatus: computeDisplayStatus(inv),
        amount: computeAmount(inv),
      })),
    [invoices]
  );

  const filtered = useMemo(() => {
    let result = enriched;

    if (statusFilter !== 'all') {
      result = result.filter((inv) => inv.displayStatus === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoice_number.toLowerCase().includes(q) ||
          inv.client_name.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case 'invoice_number':
          cmp = a.invoice_number.localeCompare(b.invoice_number);
          break;
        case 'client_name':
          cmp = a.client_name.localeCompare(b.client_name);
          break;
        case 'amount':
          cmp = a.amount - b.amount;
          break;
        case 'issue_date':
          cmp = new Date(a.issue_date).getTime() - new Date(b.issue_date).getTime();
          break;
        case 'due_date':
          cmp = new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
          break;
        case 'status':
          cmp = a.displayStatus.localeCompare(b.displayStatus);
          break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [enriched, search, statusFilter, sortField, sortDir]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  function sortIndicator(field: SortField) {
    if (sortField !== field) return null;
    return sortDir === 'asc' ? ' ↑' : ' ↓';
  }

  async function markAsPaid(invoice: Invoice) {
    try {
      const res = await fetch(`/api/invoices/${invoice.id}/pay`, { method: 'POST' });
      if (res.ok) router.refresh();
    } catch {
      // noop — toast could be added
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/invoices/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        setDeleteTarget(null);
        router.refresh();
      }
    } catch {
      // noop
    } finally {
      setDeleting(false);
    }
  }

  function isOverdue(dueDate: string, status: InvoiceStatus) {
    if (status !== 'sent' && status !== 'overdue') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  }

  return (
    <>
      {/* Filter bar */}
      <div className="flex gap-3 mb-4 items-center">
        <div className="relative flex-1 max-w-80">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-3 border border-neutral-200 rounded-md text-sm text-neutral-900 bg-white placeholder:text-neutral-400 focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100 transition-colors"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InvoiceStatus | 'all')}
          className="h-10 px-3 pr-8 border border-neutral-200 rounded-md text-sm text-neutral-700 bg-white appearance-none focus:outline-none focus:border-primary-500 focus:ring-3 focus:ring-primary-100"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
          }}
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="paid">Paid</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6 text-primary-500">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-8 h-8">
                {search || statusFilter !== 'all' ? (
                  <>
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </>
                ) : (
                  <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </>
                )}
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              {search || statusFilter !== 'all' ? 'No invoices match your search' : 'No invoices yet'}
            </h3>
            <p className="text-sm text-neutral-500 mb-6 max-w-sm">
              {search || statusFilter !== 'all'
                ? 'Try different keywords or clear filters to see all invoices.'
                : "When you create your first invoice, it'll appear here. It only takes about 2 minutes."}
            </p>
            {search || statusFilter !== 'all' ? (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('all');
                }}
                className="px-5 h-10 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                href="/invoices/new"
                className="px-5 h-10 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
              >
                + Create Your First Invoice
              </Link>
            )}
          </div>
        ) : (
          <>
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {(
                    [
                      ['invoice_number', 'Invoice #'],
                      ['client_name', 'Client'],
                      ['amount', 'Amount'],
                      ['issue_date', 'Issue Date'],
                      ['due_date', 'Due Date'],
                      ['status', 'Status'],
                    ] as const
                  ).map(([field, label]) => (
                    <th
                      key={field}
                      onClick={() => toggleSort(field)}
                      className="bg-neutral-50 px-4 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider border-b border-neutral-200 cursor-pointer hover:text-neutral-700 select-none"
                    >
                      {label}
                      {sortIndicator(field)}
                    </th>
                  ))}
                  <th className="bg-neutral-50 px-4 py-3 border-b border-neutral-200" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-neutral-50 cursor-pointer"
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                  >
                    <td className="px-4 py-3 text-sm font-medium border-b border-neutral-100">
                      {inv.invoice_number}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-neutral-100">
                      {inv.client_name}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-neutral-100">
                      {formatCurrency(inv.amount)}
                    </td>
                    <td className="px-4 py-3 text-sm border-b border-neutral-100">
                      {formatDate(inv.issue_date)}
                    </td>
                    <td
                      className={`px-4 py-3 text-sm border-b border-neutral-100 ${
                        isOverdue(inv.due_date, inv.displayStatus)
                          ? 'text-error-500 font-medium'
                          : ''
                      }`}
                    >
                      {formatDate(inv.due_date)}
                    </td>
                    <td className="px-4 py-3 border-b border-neutral-100">
                      <StatusBadge status={inv.displayStatus} />
                    </td>
                    <td className="px-4 py-3 border-b border-neutral-100">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {inv.displayStatus !== 'paid' && (
                          <button
                            onClick={() => markAsPaid(inv)}
                            className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-600 hover:bg-neutral-100 transition-colors"
                            title="Mark as paid"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteTarget(inv)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-neutral-600 hover:bg-error-50 hover:text-error-500 transition-colors"
                          title="Delete invoice"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-200 text-sm text-neutral-500">
              <span>
                Showing {filtered.length} of {invoices.length} invoice{invoices.length !== 1 ? 's' : ''}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">Delete Invoice</h2>
              <p className="text-sm text-neutral-500">
                Are you sure you want to delete{' '}
                <span className="font-medium text-neutral-900">{deleteTarget.invoice_number}</span>?
                This action cannot be undone.
              </p>
            </div>
            <div className="px-6 pb-6 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-5 h-10 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 h-10 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-error-500 text-white hover:bg-error-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
