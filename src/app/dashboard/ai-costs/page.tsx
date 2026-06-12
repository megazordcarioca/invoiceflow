import { AI_COST_CONFIG } from "@/lib/ai-costs/config";
import { fetchCostSummary, fetchAgentCosts, fetchDailyCosts } from "@/lib/ai-costs/service";
import { computeAlerts } from "@/lib/ai-costs/types";
import Sidebar from "@/components/Sidebar";
import CostSummaryCards from "./cost-summary-cards";
import AgentCostTable from "./agent-cost-table";
import DailyCostChart from "./daily-cost-chart";
import BudgetAlerts from "./budget-alerts";
import AnomalyReport from "./anomaly-report";

export const dynamic = "force-dynamic";

export default async function AICostsPage() {
  const [summary, agentCosts, dailyCosts] = await Promise.all([
    fetchCostSummary(),
    fetchAgentCosts(),
    fetchDailyCosts(30),
  ]);

  const alerts = computeAlerts(summary.monthToDate);

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="flex-1 ml-56 flex flex-col">
        <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 z-5">
          <h1 className="text-lg font-bold text-neutral-900">
            AI Cost Dashboard — {AI_COST_CONFIG.currencies.symbol}
            {AI_COST_CONFIG.budget.monthly.toFixed(2)}/mês
          </h1>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
              LiteLLM Proxy
            </span>
            <span className="text-xs text-neutral-400">Atualizado a cada 1h</span>
          </div>
        </header>

        <div className="p-8 max-w-8xl w-full space-y-6">
          <BudgetAlerts alerts={alerts} />

          <CostSummaryCards summary={summary} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyCostChart dailyCosts={dailyCosts} budget={AI_COST_CONFIG.budget} />
            <AnomalyReport summary={summary} agentCosts={agentCosts} />
          </div>

          <AgentCostTable agents={agentCosts} />
        </div>
      </main>
    </div>
  );
}
