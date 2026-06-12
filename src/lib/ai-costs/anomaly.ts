import { getBaselines, getBaselineForAgent } from "./baseline";
import { fetchAgentCosts, fetchCostSummary } from "./service";
import type { CostSummary } from "./types";

export interface AnomalyResult {
  agentId: string;
  agentName: string;
  metric: "cost_24h" | "cost_7d" | "cost_30d" | "budget_burn";
  actualValue: number;
  baselineValue: number;
  deviationPercent: number;
  severity: "warning" | "critical";
  detectedAt: string;
  message: string;
}

export interface AnomalyReport {
  date: string;
  totalAnomalies: number;
  criticalCount: number;
  warningCount: number;
  budgetStatus: CostSummary;
  anomalies: AnomalyResult[];
  topAgentsByCost: Array<{ agentId: string; agentName: string; cost: number }>;
}

const ANOMALY_THRESHOLD_WARNING = 20;
const ANOMALY_THRESHOLD_CRITICAL = 50;

function calcDeviation(actual: number, baseline: number): number {
  if (baseline === 0) return actual > 0 ? 100 : 0;
  return Math.round(((actual - baseline) / baseline) * 100 * 100) / 100;
}

export async function detectAnomalies(): Promise<AnomalyReport> {
  const costs = await fetchAgentCosts();
  const budget = await fetchCostSummary();
  const baselines = getBaselines();
  const anomalies: AnomalyResult[] = [];
  const now = new Date().toISOString();

  for (const cost of costs) {
    const bl = getBaselineForAgent(cost.agentId);
    if (!bl) continue;

    const checks: Array<{
      metric: AnomalyResult["metric"];
      actual: number;
      baseline: number;
      label: string;
    }> = [
      {
        metric: "cost_24h",
        actual: cost.cost24h,
        baseline: bl.estimatedCostPerDay,
        label: "custo 24h",
      },
      {
        metric: "cost_7d",
        actual: cost.cost7d,
        baseline: bl.estimatedCostPerDay * 7,
        label: "custo 7d",
      },
      {
        metric: "cost_30d",
        actual: cost.cost30d,
        baseline: bl.estimatedCostPerMonth,
        label: "custo 30d",
      },
    ];

    for (const check of checks) {
      const dev = calcDeviation(check.actual, check.baseline);
      if (Math.abs(dev) <= ANOMALY_THRESHOLD_WARNING) continue;

      const severity: AnomalyResult["severity"] =
        Math.abs(dev) >= ANOMALY_THRESHOLD_CRITICAL ? "critical" : "warning";
      anomalies.push({
        agentId: cost.agentId,
        agentName: cost.agentName,
        metric: check.metric,
        actualValue: check.actual,
        baselineValue: check.baseline,
        deviationPercent: dev,
        severity,
        detectedAt: now,
        message: `${cost.agentName}: ${check.label} ${dev > 0 ? "acima" : "abaixo"} da baseline em ${Math.abs(dev)}% (R$ ${check.actual} vs R$ ${check.baseline})`,
      });
    }
  }

  if (budget.monthToDate > baselines.totalEstimatedCostPerMonth) {
    const budgetDev = calcDeviation(budget.monthToDate, baselines.totalEstimatedCostPerMonth);
    anomalies.push({
      agentId: "__budget__",
      agentName: "Budget Geral",
      metric: "budget_burn",
      actualValue: budget.monthToDate,
      baselineValue: baselines.totalEstimatedCostPerMonth,
      deviationPercent: budgetDev,
      severity: budgetDev >= 50 ? "critical" : "warning",
      detectedAt: now,
      message: `Budget mensal excedido em ${Math.abs(budgetDev)}% (R$ ${budget.monthToDate} vs R$ ${baselines.totalEstimatedCostPerMonth})`,
    });
  }

  const sortedByCost = [...costs].sort((a, b) => b.cost30d - a.cost30d);
  const top3 = sortedByCost.slice(0, 3).map((c) => ({
    agentId: c.agentId,
    agentName: c.agentName,
    cost: c.cost30d,
  }));

  return {
    date: now,
    totalAnomalies: anomalies.length,
    criticalCount: anomalies.filter((a) => a.severity === "critical").length,
    warningCount: anomalies.filter((a) => a.severity === "warning").length,
    budgetStatus: budget,
    anomalies,
    topAgentsByCost: top3,
  };
}

export function formatAnomalyReport(report: AnomalyReport): string {
  const lines: string[] = [
    `ANOMALY REPORT — ${report.date.slice(0, 10)}`,
    `- Current daily cost: R$ ${report.budgetStatus.today}`,
    `- Daily budget: R$ ${report.budgetStatus.dailyBudget}`,
    `- % of budget: ${report.budgetStatus.percentOfMonthlyBudget.toFixed(1)}%`,
    `- Status: ${report.budgetStatus.status.toUpperCase()}`,
    `- Total anomalies: ${report.totalAnomalies} (${report.criticalCount} critical, ${report.warningCount} warning)`,
  ];

  if (report.topAgentsByCost.length > 0) {
    lines.push(`- Top agents by cost:`);
    for (const a of report.topAgentsByCost) {
      lines.push(`    ${a.agentName}: R$ ${a.cost}`);
    }
  }

  if (report.anomalies.length > 0) {
    lines.push(`- Probable cause: ${report.anomalies[0].message}`);
    lines.push(
      `- Recommended action: Investigate agent cost deviation >${ANOMALY_THRESHOLD_WARNING}%`
    );
  }

  lines.push("- Escalation: Dir. Suporte de IA + VP (anomaly report generated)");
  return lines.join("\n");
}
