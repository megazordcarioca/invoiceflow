import type { CostSummary, AgentCost } from "@/lib/ai-costs/types";

function formatBRL(n: number): string {
  return `R$ ${n.toFixed(2)}`;
}

export default function AnomalyReport({
  summary,
  agentCosts,
}: {
  summary: CostSummary;
  agentCosts: AgentCost[];
}) {
  const top3 = [...agentCosts].sort((a, b) => b.cost24h - a.cost24h).slice(0, 3);

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="p-5 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">Relatório de Anomalia</h2>
        <p className="text-xs text-neutral-400 mt-0.5">
          Gerado automaticamente quando custo &gt;80% do budget diário
        </p>
      </div>
      <div className="p-5">
        <pre className="text-xs font-mono text-neutral-700 leading-relaxed whitespace-pre-wrap">
          {`ANOMALY REPORT — ${todayStr}
  Current daily cost:    ${formatBRL(summary.today)}
  Daily budget:          ${formatBRL(summary.dailyBudget)}
  % of budget:           ${((summary.today / summary.dailyBudget) * 100).toFixed(1)}%
  Month-to-date:         ${formatBRL(summary.monthToDate)} (${summary.percentOfMonthlyBudget.toFixed(1)}% of monthly)

  Top 3 agents by cost (24h):
${top3.map((a, i) => `    ${i + 1}. ${a.agentName.padEnd(25)} ${formatBRL(a.cost24h).padStart(8)}`).join("\n")}

  Probable cause:        {analysis}
  Recommended action:    {proposal}

  Status:                ${summary.status.toUpperCase()}
  Projected month-end:   ${formatBRL(summary.projectedMonthEnd)}
  Monthly budget:        ${formatBRL(summary.monthlyBudget)}`}
        </pre>
        <div className="mt-4 pt-3 border-t border-dashed border-neutral-200 text-xs text-neutral-400">
          {summary.status === "green"
            ? "Nenhuma anomalia detectada. Custos dentro do esperado."
            : "Anomalia detectada — reporte enviado ao CFO + Dir. Suporte IA."}
        </div>
      </div>
    </div>
  );
}
