export interface AgentBaseline {
  agentId: string;
  agentName: string;
  squad: string;
  estimatedTokensPerRun: number;
  estimatedRunsPerDay: number;
  estimatedCostPerDay: number;
  estimatedCostPerMonth: number;
  model: string;
}

export interface BaselineStore {
  version: number;
  updatedAt: string;
  baselines: AgentBaseline[];
  totalEstimatedCostPerDay: number;
  totalEstimatedCostPerMonth: number;
}

const BASELINE_DATA: AgentBaseline[] = [
  {
    agentId: "squad-1-dev",
    agentName: "Squad 1 - Engineering",
    squad: "1-2 (Engineering)",
    estimatedTokensPerRun: 2000,
    estimatedRunsPerDay: 48,
    estimatedCostPerDay: 3.2,
    estimatedCostPerMonth: 96.0,
    model: "phi3-14b",
  },
  {
    agentId: "squad-2-pmo",
    agentName: "Squad 2 - Engineering",
    squad: "1-2 (Engineering)",
    estimatedTokensPerRun: 2000,
    estimatedRunsPerDay: 48,
    estimatedCostPerDay: 3.2,
    estimatedCostPerMonth: 96.0,
    model: "phi3-14b",
  },
  {
    agentId: "squad-3-cfo",
    agentName: "Squad 3 - Finance",
    squad: "7-8 (Finance)",
    estimatedTokensPerRun: 1000,
    estimatedRunsPerDay: 24,
    estimatedCostPerDay: 0.8,
    estimatedCostPerMonth: 24.0,
    model: "phi3-14b",
  },
  {
    agentId: "squad-4-cmo",
    agentName: "Squad 4 - Marketing",
    squad: "9-10 (Marketing)",
    estimatedTokensPerRun: 1500,
    estimatedRunsPerDay: 36,
    estimatedCostPerDay: 1.8,
    estimatedCostPerMonth: 54.0,
    model: "phi3-14b",
  },
  {
    agentId: "squad-5-cco",
    agentName: "Squad 5 - Design",
    squad: "11-12 (Design)",
    estimatedTokensPerRun: 2000,
    estimatedRunsPerDay: 36,
    estimatedCostPerDay: 2.4,
    estimatedCostPerMonth: 72.0,
    model: "phi3-14b",
  },
  {
    agentId: "squad-6-support",
    agentName: "Squad 6 - Support IA",
    squad: "13 (Observability)",
    estimatedTokensPerRun: 500,
    estimatedRunsPerDay: 24,
    estimatedCostPerDay: 0.4,
    estimatedCostPerMonth: 12.0,
    model: "phi3-14b",
  },
  {
    agentId: "squad-7-exec",
    agentName: "Squad 7 - Exec",
    squad: "14 (Maintenance)",
    estimatedTokensPerRun: 1000,
    estimatedRunsPerDay: 12,
    estimatedCostPerDay: 0.4,
    estimatedCostPerMonth: 12.0,
    model: "phi3-14b",
  },
  {
    agentId: "squad-8-ops",
    agentName: "Squad 8 - IA Ops",
    squad: "13 (Observability)",
    estimatedTokensPerRun: 500,
    estimatedRunsPerDay: 24,
    estimatedCostPerDay: 0.4,
    estimatedCostPerMonth: 12.0,
    model: "phi3-14b",
  },
];

const TOTAL_PER_DAY = BASELINE_DATA.reduce((s, b) => s + b.estimatedCostPerDay, 0);
const TOTAL_PER_MONTH = BASELINE_DATA.reduce((s, b) => s + b.estimatedCostPerMonth, 0);

export function getBaselines(): BaselineStore {
  return {
    version: 1,
    updatedAt: "2026-06-11T00:00:00.000Z",
    baselines: BASELINE_DATA,
    totalEstimatedCostPerDay: Math.round(TOTAL_PER_DAY * 100) / 100,
    totalEstimatedCostPerMonth: Math.round(TOTAL_PER_MONTH * 100) / 100,
  };
}

export function getBaselineForAgent(agentId: string): AgentBaseline | undefined {
  return BASELINE_DATA.find((b) => b.agentId === agentId);
}
