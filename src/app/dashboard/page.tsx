import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { InvoiceStatus } from "@/types/invoice";

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

  const invoicesThisMonth = (invoices || []).filter(
    (inv) => new Date(inv.created_at) >= new Date(startOfMonth)
  ).length;

  const FREE_TIER_LIMIT = 3;

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

  return {
    stats: { totalEarned, pending, overdue, monthToDateEarned },
    tierInfo: {
      invoicesThisMonth,
      tierLimit: FREE_TIER_LIMIT,
      remaining: Math.max(0, FREE_TIER_LIMIT - invoicesThisMonth),
    },
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

  const handleSignOut = async () => {
    "use server";
    const supabase = createClient();
    await supabase.auth.signOut();
    redirect("/login");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900">
                InvoiceFlow
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <form action={handleSignOut}>
                <button type="submit" className="text-sm text-gray-600 hover:text-gray-900">
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        {tierInfo.invoicesThisMonth === tierInfo.tierLimit - 1 && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 font-medium">1 invoice remaining this month</p>
            <p className="text-blue-700 text-sm mt-1">
              You&apos;ve used {tierInfo.invoicesThisMonth} of {tierInfo.tierLimit} free invoices.
            </p>
          </div>
        )}

        {tierInfo.invoicesThisMonth === tierInfo.tierLimit && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 font-medium">
              You have used all {tierInfo.tierLimit} free invoices for this month
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Your existing invoices remain accessible.
            </p>
          </div>
        )}

        {tierInfo.invoicesThisMonth > tierInfo.tierLimit && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Free tier limit exceeded</p>
            <p className="text-red-700 text-sm mt-1">
              You&apos;ve used {tierInfo.invoicesThisMonth} invoices this month.
              <Link href="/pricing" className="underline font-medium ml-1">
                Upgrade to Pro
              </Link>{" "}
              for unlimited invoices.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Earned</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">${stats.totalEarned.toFixed(2)}</p>
            <p className="mt-1 text-sm text-gray-500">
              Month-to-date: ${stats.monthToDateEarned.toFixed(2)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Pending</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">${stats.pending.toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Overdue</h3>
            <p className="mt-2 text-3xl font-bold text-gray-900">${stats.overdue.toFixed(2)}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Invoices</h2>
          </div>
          <div className="p-6">
            {recentInvoices.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No invoices yet.{" "}
                <Link href="/invoices/new" className="text-blue-600 hover:underline">
                  Create your first invoice
                </Link>
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentInvoices.map((invoice) => (
                      <tr key={invoice.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            href={`/invoices/${invoice.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {invoice.invoice_number}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.client_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <StatusBadge status={invoice.status} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${invoice.total.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
      </main>
    </div>
  );
}
