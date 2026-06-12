import type { CostSummary } from "@/lib/ai-costs/types";

function formatBRL(n: number): string {
  return `R$ ${n.toFixed(2)}`;
}

function statusColor(status: CostSummary["status"]): string {
  switch (status) {
    case "red":
      return "bg-error-50 border-error-500 text-error-800";
    case "yellow":
      return "bg-warning-50 border-warning-500 text-warning-800";
    default:
      return "bg-success-50 border-success-500 text-success-600";
  }
}

function statusLabel(status: CostSummary["status"]): string {
  switch (status) {
    case "red":
      return "🔴 Crítico";
    case "yellow":
      return "🟡 Atenção";
    default:
      return "🟢 Normal";
  }
}

export default function CostSummaryCards({ summary }: { summary: CostSummary }) {
  const cards = [
    {
      label: "Custo Hoje",
      value: formatBRL(summary.today),
      sub: `Budget diário: ${formatBRL(summary.dailyBudget)}`,
    },
    {
      label: "Custo na Semana",
      value: formatBRL(summary.weekToDate),
      sub: `Média/dia: ${formatBRL(summary.weekToDate / 7)}`,
    },
    {
      label: "Custo no Mês",
      value: formatBRL(summary.monthToDate),
      sub: `${summary.percentOfMonthlyBudget.toFixed(1)}% do budget`,
    },
    {
      label: "Projeção Fim do Mês",
      value: formatBRL(summary.projectedMonthEnd),
      sub: `Budget: ${formatBRL(summary.monthlyBudget)}`,
    },
  ];

  return (
    <>
      <div className={`p-4 rounded-lg border ${statusColor(summary.status)}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Status do Budget</span>
          <span className="text-sm font-bold">{statusLabel(summary.status)}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200"
          >
            <h3 className="text-sm font-medium text-neutral-500">{card.label}</h3>
            <p className="mt-1 text-2xl font-bold text-neutral-900">{card.value}</p>
            <p className="mt-0.5 text-xs text-neutral-400">{card.sub}</p>
          </div>
        ))}
      </div>
    </>
  );
}
