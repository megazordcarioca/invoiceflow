import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { fetchDreSummary, formatBRL, formatPercent } from "@/lib/dre/service";
import type { DreMonthly } from "@/lib/dre/types";

export const dynamic = "force-dynamic";

function DreLine({
  label,
  value,
  indent = false,
  bold = false,
  highlight = false,
  border = false,
}: {
  label: string;
  value: string;
  indent?: boolean;
  bold?: boolean;
  highlight?: boolean;
  border?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between py-3 ${
        border ? "border-b border-neutral-200" : ""
      } ${indent ? "pl-6" : ""} ${highlight ? "bg-primary-50 -mx-4 px-4 rounded-lg" : ""}`}
    >
      <span
        className={`text-sm ${bold || highlight ? "font-bold text-neutral-900" : "text-neutral-600"}`}
      >
        {label}
      </span>
      <span
        className={`text-sm font-semibold ${highlight ? "text-primary-600" : "text-neutral-900"}`}
      >
        {value}
      </span>
    </div>
  );
}

function DreSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">{title}</h3>
      <div className="bg-white rounded-lg shadow-sm border border-neutral-200 px-4">{children}</div>
    </div>
  );
}

function MonthlyDreTable({ dre }: { dre: DreMonthly }) {
  const totalEmitido = dre.revenue.totalPaid + dre.revenue.totalPending + dre.revenue.totalOverdue;

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Faturado (Pago)
          </h3>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {formatBRL(dre.revenue.totalPaid)}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">{dre.revenue.invoiceCount} notas pagas</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            A Receber
          </h3>
          <p className="mt-1 text-2xl font-bold text-neutral-900">
            {formatBRL(dre.revenue.totalPending)}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">aguardando pagamento</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow-sm border border-neutral-200">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Em Atraso
          </h3>
          <p className="mt-1 text-2xl font-bold text-error-600">
            {formatBRL(dre.revenue.totalOverdue)}
          </p>
          <p className="text-xs text-neutral-400 mt-0.5">vencidas sem pagamento</p>
        </div>
      </div>

      <DreSection title="FATURAMENTO">
        <DreLine
          label="Faturado (pago pelos clientes)"
          value={formatBRL(dre.revenue.totalPaid)}
          bold
          border
        />
        <DreLine
          label="A receber (enviadas, aguardando)"
          value={formatBRL(dre.revenue.totalPending)}
          indent
          border
        />
        <DreLine
          label="Em atraso (vencidas)"
          value={formatBRL(dre.revenue.totalOverdue)}
          indent
          border
        />
        <DreLine label="Total emitido" value={formatBRL(totalEmitido)} bold highlight />
      </DreSection>

      {dre.previousMonth && (
        <div className="flex items-center justify-between py-2 px-4 bg-white rounded-lg border border-neutral-200 mb-6">
          <span className="text-xs text-neutral-400">
            vs.{" "}
            {dre.previousMonth.revenue === 0
              ? "mês anterior"
              : `${formatBRL(dre.previousMonth.revenue)} no mês anterior`}
          </span>
          <span
            className={`text-xs font-semibold ${
              dre.previousMonth.changePercent >= 0 ? "text-success-600" : "text-error-600"
            }`}
          >
            {formatPercent(dre.previousMonth.changePercent)}
          </span>
        </div>
      )}
    </>
  );
}

export default async function DrePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth() + 1;

  let summary;
  try {
    summary = await fetchDreSummary(year, month);
  } catch {
    return (
      <div className="flex min-h-screen bg-neutral-50">
        <Sidebar />
        <main className="flex-1 ml-56 flex flex-col">
          <div className="p-8">
            <div className="bg-error-50 border border-error-500 rounded-lg p-6">
              <h2 className="text-lg font-bold text-error-800">Erro ao carregar DRE</h2>
              <p className="text-error-700 text-sm mt-2">
                Não foi possível carregar os dados financeiros. Verifique a conexão com o banco de
                dados e tente novamente.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-50">
      <Sidebar />
      <main className="flex-1 ml-56 flex flex-col">
        <header className="h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-6 sticky top-0 z-5">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-neutral-900">DRE Simplificado Mensal</h1>
            <span className="text-sm text-neutral-400 font-medium">
              {summary.currentMonth.monthLabel}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
              Demonstrativo de Resultados
            </span>
          </div>
        </header>

        <div className="p-8 max-w-8xl w-full">
          <MonthlyDreTable dre={summary.currentMonth} />
        </div>
      </main>
    </div>
  );
}
