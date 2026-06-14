import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import StatusBadge from "@/components/StatusBadge";
import { InvoiceStatus } from "@/types/invoice";
import { getDashboardTierInfo } from "@/lib/plans";

export const dynamic = "force-dynamic";

async function getDashboardData(userId: string) {
  const supabase = createClient();

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("*, invoice_line_items(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;

  let totalEarned = 0;
  let pending = 0;
  let overdue = 0;
  let monthToDateEarned = 0;

  for (const invoice of invoices || []) {
    const subtotal = (invoice.invoice_line_items || []).reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    );

    if (invoice.status === "paid") {
      totalEarned += subtotal;
      if (new Date(invoice.updated_at) >= new Date(startOfMonth)) {
        monthToDateEarned += subtotal;
      }
    } else if (invoice.status === "sent") {
      if (new Date(invoice.due_date) < now) {
        overdue += subtotal;
      } else {
        pending += subtotal;
      }
    } else if (invoice.status === "overdue") {
      overdue += subtotal;
    }
  }

  const recentInvoices = (invoices || []).slice(0, 5).map((invoice) => ({
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    client_name: invoice.client_name,
    status: invoice.status as InvoiceStatus,
    total: (invoice.invoice_line_items || []).reduce(
      (sum: number, item: { quantity: number; unit_price: number }) =>
        sum + item.quantity * item.unit_price,
      0
    ),
    due_date: invoice.due_date,
  }));

  const tierInfo = await getDashboardTierInfo(userId);

  return {
    stats: { totalEarned, pending, overdue, monthToDateEarned },
    tierInfo,
    recentInvoices,
  };
}

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { stats, tierInfo, recentInvoices } = await getDashboardData(user.id);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="flex-1 ml-56 flex flex-col">
        <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 z-5">
          <h1 className="text-lg font-bold text-neutral-900">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">{user.email}</span>
            <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-semibold">
              {user.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <form action="/api/auth/signout" method="POST">
              <button
                type="submit"
                className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <div className="p-8 max-w-8xl w-full">
          {tierInfo.plan === "free" && tierInfo.invoicesThisMonth < tierInfo.tierLimit && (
            <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-neutral-700 text-sm">
                  <span className="font-medium">Free Plan</span> &mdash; {tierInfo.remaining} of{" "}
                  {tierInfo.tierLimit} invoices remaining this month
                </p>
              </div>
              <Link
                href="/pricing"
                className="text-sm font-medium text-primary-600 hover:underline"
              >
                Upgrade
              </Link>
            </div>
          )}

          {tierInfo.plan === "free" && tierInfo.invoicesThisMonth >= tierInfo.tierLimit && (
            <div className="mb-6 p-4 bg-warning-50 border border-warning-500 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-warning-800 font-medium text-sm">
                  Free tier limit reached ({tierInfo.invoicesThisMonth}/{tierInfo.tierLimit})
                </p>
                <p className="text-warning-700 text-xs mt-1">
                  Your existing invoices remain accessible.
                </p>
              </div>
              <Link
                href="/pricing"
                className="text-sm font-medium px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                Upgrade to Pro
              </Link>
            </div>
          )}

          {tierInfo.plan !== "free" && (
            <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-lg">
              <p className="text-success-800 font-medium text-sm">
                {tierInfo.plan === "pro" ? "Pro" : "Business"} Plan &mdash; Unlimited invoices
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-500">Total Earned</h3>
              <p className="mt-2 text-3xl font-bold text-neutral-900">
                ${stats.totalEarned.toFixed(2)}
              </p>
              <p className="mt-1 text-sm text-neutral-500">
                Month-to-date: ${stats.monthToDateEarned.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-500">Pending</h3>
              <p className="mt-2 text-3xl font-bold text-neutral-900">
                ${stats.pending.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-neutral-200">
              <h3 className="text-sm font-medium text-neutral-500">Overdue</h3>
              <p className="mt-2 text-3xl font-bold text-neutral-900">
                ${stats.overdue.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
            <div className="p-6 border-b border-neutral-200">
              <h2 className="text-lg font-semibold text-neutral-900">Recent Invoices</h2>
            </div>
            <div className="p-6">
              {recentInvoices.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  No invoices yet.{" "}
                  <Link
                    href="/invoices/new"
                    className="text-primary-600 hover:underline font-medium"
                  >
                    Create your first invoice
                  </Link>
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-neutral-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Invoice
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Client
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Due Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-100">
                      {recentInvoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-neutral-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Link
                              href={`/invoices/${invoice.id}`}
                              className="text-primary-600 hover:underline font-medium"
                            >
                              {invoice.invoice_number}
                            </Link>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            {invoice.client_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={invoice.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                            ${invoice.total.toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
