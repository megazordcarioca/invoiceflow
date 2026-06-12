import type { DailyCost } from "@/lib/ai-costs/types";

function formatBRL(n: number): string {
  return `R$ ${n.toFixed(2)}`;
}

function maxBarValue(costs: DailyCost[], budget: number): number {
  const maxCost = Math.max(...costs.map((c) => c.total), budget);
  return Math.ceil(maxCost * 1.2);
}

export default function DailyCostChart({
  dailyCosts,
  budget,
}: {
  dailyCosts: DailyCost[];
  budget: { daily: number; yellowThreshold: number; redThreshold: number };
}) {
  const maxVal = maxBarValue(dailyCosts, budget.daily);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="p-5 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">Custo Diário (30d)</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Budget diário: {formatBRL(budget.daily)}</p>
      </div>
      <div className="p-5">
        {dailyCosts.length === 0 ? (
          <p className="text-neutral-500 text-center py-8 text-sm">Nenhum dado disponível.</p>
        ) : (
          <div className="flex items-end gap-1 h-40">
            {dailyCosts.map((day) => {
              const pct = (day.total / maxVal) * 100;
              const isOverDaily = day.total > budget.daily;
              return (
                <div
                  key={day.date}
                  className="flex-1 flex flex-col items-center justify-end h-full"
                  title={`${day.date}: ${formatBRL(day.total)}`}
                >
                  <div
                    className={`w-full rounded-t-sm transition-all ${
                      isOverDaily ? "bg-warning-500" : "bg-primary-500"
                    }`}
                    style={{ height: `${Math.max(pct, 2)}%` }}
                  />
                  <span className="text-[0.6rem] text-neutral-400 mt-1 truncate w-full text-center">
                    {day.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
        <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-primary-500" /> Dentro do budget
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-warning-500" /> Acima do budget
          </span>
          <span className="ml-auto">
            Média: {formatBRL(dailyCosts.reduce((s, d) => s + d.total, 0) / dailyCosts.length)}/dia
          </span>
        </div>
      </div>
    </div>
  );
}
