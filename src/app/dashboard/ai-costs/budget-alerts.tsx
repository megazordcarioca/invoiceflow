import type { AlertThreshold } from "@/lib/ai-costs/types";

export default function BudgetAlerts({ alerts }: { alerts: AlertThreshold[] }) {
  const active = alerts.filter((a) => a.active);
  if (active.length === 0) return null;

  return (
    <div className="space-y-3">
      {active.map((alert) => (
        <div
          key={alert.level}
          className={`flex items-start gap-3 p-4 rounded-lg border ${
            alert.level === "red"
              ? "bg-error-50 border-error-500 text-error-800"
              : "bg-warning-50 border-warning-500 text-warning-800"
          }`}
        >
          <span className="text-lg mt-0.5">{alert.level === "red" ? "🔴" : "🟡"}</span>
          <div>
            <p className="font-semibold">{alert.label}</p>
            <p className="text-sm mt-0.5">
              Custo atual: R$ {alert.currentAmount.toFixed(2)} — Limite: R$ {alert.value.toFixed(2)}
            </p>
            <p className="text-xs mt-1 opacity-80">
              {alert.level === "red"
                ? "Notificação urgente enviada ao Fundador."
                : "Reporte simultâneo enviado ao CFO + Dir. Suporte IA."}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
