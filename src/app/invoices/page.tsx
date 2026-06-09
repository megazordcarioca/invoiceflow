import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import InvoiceListClient from '@/components/InvoiceListClient';

export const dynamic = 'force-dynamic';

export default async function InvoicesPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let invoices: Awaited<ReturnType<typeof fetchInvoices>> = [];

  if (user) {
    invoices = await fetchInvoices(supabase, user.id);
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <main className="flex-1 ml-56 flex flex-col">
        <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 z-5">
          <div />
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        <div className="p-8 max-w-8xl w-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-neutral-900">Invoices</h1>
            <Link
              href="/invoices/new"
              className="px-5 h-10 inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium bg-primary-500 text-white hover:bg-primary-600 transition-colors"
            >
              + New Invoice
            </Link>
          </div>

          <InvoiceListClient invoices={invoices} />
        </div>
      </main>
    </div>
  );
}

async function fetchInvoices(supabase: ReturnType<typeof createClient>, userId: string) {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, line_items:invoice_line_items(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch invoices:', error.message);
    return [];
  }

  return data ?? [];
}
