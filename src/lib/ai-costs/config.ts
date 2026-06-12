export const AI_COST_CONFIG = {
  litellm: {
    proxyUrl: process.env.LITELLM_PROXY_URL ?? "http://localhost:4000",
    apiKey: process.env.LITELLM_API_KEY ?? "",
    prometheusEndpoint: "/metrics",
    costEndpoint: "/cost",
    spendingEndpoint: "/spending",
  },
  budget: {
    monthly: 350,
    daily: 11.67,
    yellowThreshold: 280,
    redThreshold: 420,
  },
  currencies: {
    symbol: "R$",
    code: "BRL",
    locale: "pt-BR",
  },
  polling: {
    costCollectionIntervalMs: 60 * 60 * 1000,
    metricCollectionIntervalMs: 2 * 60 * 60 * 1000,
  },
} as const;

export const AGENTS = [
  { id: "squad-1-dev", name: "Squad 1 - Dev", model: "phi3-14b" },
  { id: "squad-2-pmo", name: "Squad 2 - PMO", model: "phi3-14b" },
  { id: "squad-3-cfo", name: "Squad 3 - CFO", model: "phi3-14b" },
  { id: "squad-4-cmo", name: "Squad 4 - CMO", model: "phi3-14b" },
  { id: "squad-5-cco", name: "Squad 5 - CCO", model: "phi3-14b" },
  { id: "squad-6-support", name: "Squad 6 - Support IA", model: "phi3-14b" },
  { id: "squad-7-exec", name: "Squad 7 - Exec", model: "phi3-14b" },
  { id: "squad-8-ops", name: "Squad 8 - IA Ops", model: "phi3-14b" },
] as const;
