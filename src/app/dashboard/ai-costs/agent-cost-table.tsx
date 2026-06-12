import type { AgentCost } from "@/lib/ai-costs/types";

function formatBRL(n: number): string {
  return `R$ ${n.toFixed(2)}`;
}

export default function AgentCostTable({ agents }: { agents: AgentCost[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
      <div className="p-5 border-b border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-900">Custo por Agente</h2>
        <p className="text-xs text-neutral-400 mt-0.5">Últimas 24h, 7d e 30d</p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-neutral-200">
          <thead>
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Agente
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                24h
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                7d
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                30d
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Tokens In
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Tokens Out
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                P50
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                P95
              </th>
              <th className="px-5 py-3 text-right text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                P99
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {agents.map((agent) => (
              <tr key={agent.agentId} className="hover:bg-neutral-50">
                <td className="px-5 py-3.5 whitespace-nowrap text-sm font-medium text-neutral-900">
                  {agent.agentName}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-xs text-neutral-500 font-mono">
                  {agent.model}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-right text-neutral-900 font-mono">
                  {formatBRL(agent.cost24h)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-right text-neutral-900 font-mono">
                  {formatBRL(agent.cost7d)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-right text-neutral-900 font-mono">
                  {formatBRL(agent.cost30d)}
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-right text-neutral-500 font-mono">
                  {(agent.tokensInput24h / 1000).toFixed(0)}K
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-right text-neutral-500 font-mono">
                  {(agent.tokensOutput24h / 1000).toFixed(0)}K
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-right text-neutral-500 font-mono">
                  {agent.latencyP50.toFixed(0)}ms
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-right text-neutral-500 font-mono">
                  {agent.latencyP95.toFixed(0)}ms
                </td>
                <td className="px-5 py-3.5 whitespace-nowrap text-sm text-right text-neutral-500 font-mono">
                  {agent.latencyP99.toFixed(0)}ms
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
