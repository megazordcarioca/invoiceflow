export interface AgentCost {
  agentId: string;
  agentName: string;
  model: string;
  cost24h: number;
  cost7d: number;
  cost30d: number;
  tokensInput24h: number;
  tokensOutput24h: number;
  latencyP50: number;
  latencyP95: number;
  latencyP99: number;
}

export interface DailyCost {
  date: string;
  total: number;
  byAgent: Record<string, number>;
}

export interface CostSummary {
  today: number;
  weekToDate: number;
  monthToDate: number;
  projectedMonthEnd: number;
  dailyBudget: number;
  monthlyBudget: number;
  percentOfMonthlyBudget: number;
  status: "green" | "yellow" | "red";
}

export interface AlertThreshold {
  level: "yellow" | "red";
  label: string;
  value: number;
  active: boolean;
  currentAmount: number;
}

export function computeBudgetStatus(monthToDate: number): CostSummary["status"] {
  const pct = (monthToDate / 350) * 100;
  if (pct >= 120) return "red";
  if (pct >= 80) return "yellow";
  return "green";
}

export function computeAlerts(monthToDate: number): AlertThreshold[] {
  return [
    {
      level: "yellow",
      label: "Alerta Amarelo (>80%)",
      value: 280,
      active: monthToDate >= 280,
      currentAmount: monthToDate,
    },
    {
      level: "red",
      label: "Alerta Vermelho (>120%)",
      value: 420,
      active: monthToDate >= 420,
      currentAmount: monthToDate,
    },
  ];
}
