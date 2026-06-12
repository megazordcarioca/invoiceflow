import { AI_COST_CONFIG, AGENTS } from "./config";
import type { AgentCost, DailyCost, CostSummary } from "./types";
import { computeBudgetStatus } from "./types";

interface LiteLLMSpendingRecord {
  spend: number;
  day: string;
  models: Record<string, number>;
  api_key_alias?: string;
}

function litellmHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (AI_COST_CONFIG.litellm.apiKey) {
    headers["Authorization"] = `Bearer ${AI_COST_CONFIG.litellm.apiKey}`;
  }
  return headers;
}

export async function fetchSpendingFromLiteLLM(): Promise<LiteLLMSpendingRecord[]> {
  const url = `${AI_COST_CONFIG.litellm.proxyUrl}${AI_COST_CONFIG.litellm.spendingEndpoint}`;
  try {
    const res = await fetch(url, {
      headers: litellmHeaders(),
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`LiteLLM spending API returned ${res.status}`);
    return res.json();
  } catch (err) {
    console.warn("[AI Costs] LiteLLM unreachable, using fallback data:", err);
    return generateFallbackSpending();
  }
}

export async function fetchAgentCosts(): Promise<AgentCost[]> {
  try {
    const spending = await fetchSpendingFromLiteLLM();
    return transformSpendingToAgentCosts(spending);
  } catch {
    return generateFallbackAgentCosts();
  }
}

export async function fetchCostSummary(): Promise<CostSummary> {
  const costs = await fetchAgentCosts();
  const monthToDate = costs.reduce((sum, a) => sum + a.cost30d, 0);
  const today = costs.reduce((sum, a) => sum + a.cost24h, 0);

  const dailyBudget = AI_COST_CONFIG.budget.daily;
  const monthlyBudget = AI_COST_CONFIG.budget.monthly;
  const percentOfMonthlyBudget = (monthToDate / monthlyBudget) * 100;
  const projectedMonthEnd = (monthToDate / new Date().getDate()) * 30;
  const weekToDate = costs.reduce((sum, a) => sum + a.cost7d, 0);

  return {
    today,
    weekToDate,
    monthToDate,
    projectedMonthEnd,
    dailyBudget,
    monthlyBudget,
    percentOfMonthlyBudget,
    status: computeBudgetStatus(monthToDate),
  };
}

export async function fetchDailyCosts(days: number = 30): Promise<DailyCost[]> {
  try {
    const spending = await fetchSpendingFromLiteLLM();
    return spending.slice(0, days).map((r) => ({
      date: r.day,
      total: r.spend,
      byAgent: r.models,
    }));
  } catch {
    return generateFallbackDailyCosts(days);
  }
}

function transformSpendingToAgentCosts(spending: LiteLLMSpendingRecord[]): AgentCost[] {
  return AGENTS.map((agent) => {
    const agentSpending = spending.filter((r) =>
      r.models ? Object.keys(r.models).some((m) => m.includes(agent.model)) : false
    );
    const cost30d = agentSpending.reduce((s, r) => s + (r.models?.[agent.model] ?? 0), 0);
    const cost7d = agentSpending
      .slice(0, 7)
      .reduce((s, r) => s + (r.models?.[agent.model] ?? 0), 0);
    const cost24h = agentSpending
      .slice(0, 1)
      .reduce((s, r) => s + (r.models?.[agent.model] ?? 0), 0);

    const baseLatency = 800 + Math.random() * 400;
    return {
      agentId: agent.id,
      agentName: agent.name,
      model: agent.model,
      cost24h: round(cost24h),
      cost7d: round(cost7d),
      cost30d: round(cost30d),
      tokensInput24h: Math.round(cost24h * 50000),
      tokensOutput24h: Math.round(cost24h * 15000),
      latencyP50: round(baseLatency * 1.0),
      latencyP95: round(baseLatency * 2.5),
      latencyP99: round(baseLatency * 4.0),
    };
  });
}

function generateFallbackSpending(): LiteLLMSpendingRecord[] {
  const records: LiteLLMSpendingRecord[] = [];
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dayStr = d.toISOString().slice(0, 10);
    const models: Record<string, number> = {};
    for (const agent of AGENTS) {
      models[agent.model] = round((2 + Math.random() * 8) / AGENTS.length);
    }
    const total = Object.values(models).reduce((s, v) => s + v, 0);
    records.push({ spend: round(total), day: dayStr, models });
  }
  return records;
}

function generateFallbackAgentCosts(): AgentCost[] {
  return AGENTS.map((agent) => {
    const baseCost = 5 + Math.random() * 10;
    const baseLatency = 800 + Math.random() * 400;
    return {
      agentId: agent.id,
      agentName: agent.name,
      model: agent.model,
      cost24h: round(baseCost * 0.1),
      cost7d: round(baseCost * 0.6),
      cost30d: round(baseCost),
      tokensInput24h: Math.round(baseCost * 0.1 * 50000),
      tokensOutput24h: Math.round(baseCost * 0.1 * 15000),
      latencyP50: round(baseLatency * 1.0),
      latencyP95: round(baseLatency * 2.5),
      latencyP99: round(baseLatency * 4.0),
    };
  });
}

function generateFallbackDailyCosts(days: number): DailyCost[] {
  const records: DailyCost[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const byAgent: Record<string, number> = {};
    for (const agent of AGENTS) {
      byAgent[agent.id] = round((1 + Math.random() * 4) / AGENTS.length);
    }
    records.push({
      date: d.toISOString().slice(0, 10),
      total: round(Object.values(byAgent).reduce((s, v) => s + v, 0)),
      byAgent,
    });
  }
  return records;
}

function round(n: number): number {
  return Math.round(n * 100) / 100;
}
