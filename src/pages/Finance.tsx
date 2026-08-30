import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/Misc";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Badge, BILL_STATUS } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { useToast } from "@/components/ui/Toast";
import { TrendArea, RankBars, BreakdownDonut } from "@/components/charts/Charts";
import {
  COMMISSIONS,
  PAYABLES,
  RECEIVABLES,
  REVENUE_BY_PROCEDURE,
  REVENUE_BY_PROFESSIONAL,
  REVENUE_SERIES,
  TRANSACTIONS,
} from "@/data";
import { currency, mediumDate } from "@/lib/format";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "visao", label: "Visão geral" },
  { key: "receber", label: "A receber" },
  { key: "pagar", label: "A pagar" },
  { key: "transacoes", label: "Transações" },
  { key: "comissoes", label: "Comissões" },
  { key: "formas", label: "Formas de pagamento" },
];

export function Finance() {
  const toast = useToast();
  const [tab, setTab] = useState("visao");

  const aReceber = RECEIVABLES.filter((r) => r.status !== "pago").reduce((s, r) => s + r.valor, 0);
  const inadimplencia = RECEIVABLES.filter((r) => r.status === "atrasado").reduce((s, r) => s + r.valor, 0);
  const aPagar = PAYABLES.filter((p) => p.status !== "pago").reduce((s, p) => s + p.valor, 0);
  const receitaMes = REVENUE_SERIES.at(-1)!.receita;
  const despesaMes = REVENUE_SERIES.at(-1)!.despesa;

  const formas = useMemo(() => {
    const map = new Map<string, number>();
    TRANSACTIONS.filter((t) => t.tipo === "receita" && t.forma).forEach((t) => {
      map.set(t.forma!, (map.get(t.forma!) ?? 0) + t.valor);
    });
    return [...map.entries()].map(([nome, valor]) => ({ nome, valor })).sort((a, b) => b.valor - a.valor);
  }, []);

  return (
    <div className="fade-in">
      <PageHeader
        title="Financeiro"
        subtitle="Fluxo de caixa, contas, comissões e indicadores"
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={() => toast.info("Exportação", "Relatório financeiro exportado.")}>Exportar</Button>
            <Button size="sm" onClick={() => toast.success("Lançamento criado")}><Plus size={15} /> Novo lançamento</Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
        <StatCard label="Faturamento (mês)" value={currency(receitaMes)} delta={4.2} />
        <StatCard label="Despesas (mês)" value={currency(despesaMes)} delta={3.0} />
        <StatCard label="Saldo do mês" value={currency(receitaMes - despesaMes)} delta={6.1} />
        <StatCard label="A receber" value={currency(aReceber)} hint={`${RECEIVABLES.filter((r) => r.status !== "pago").length} títulos`} />
        <StatCard label="Inadimplência" value={currency(inadimplencia)} delta={-2.4} />
        <StatCard label="Ticket médio" value={currency(431)} delta={-1.4} />
      </div>

      <Tabs tabs={TABS} value={tab} onChange={setTab} className="my-5" />

      {tab === "visao" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="p-5">
              <CardHeader title="Receitas x Despesas" subtitle="Fechamento mensal — últimos 6 meses" />
              <div className="mt-3">
                <TrendArea data={REVENUE_SERIES} keys={[{ key: "receita", label: "Receita", color: "var(--color-primary)" }, { key: "despesa", label: "Despesa", color: "#B45309" }]} />
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <CardHeader title="Faturamento por procedimento" subtitle="Mês atual" />
              <div className="mt-3">
                <BreakdownDonut data={REVENUE_BY_PROCEDURE} />
              </div>
            </div>
          </Card>
          <Card className="lg:col-span-2">
            <div className="p-5">
              <CardHeader title="Faturamento por profissional" />
              <div className="mt-3">
                <RankBars data={REVENUE_BY_PROFESSIONAL} />
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <CardHeader title="Resumo do dia" />
              <ul className="mt-3 space-y-2.5 text-[13px]">
                {[
                  ["Entradas confirmadas", currency(2930), "text-ok"],
                  ["Saídas do dia", currency(0), "text-ink"],
                  ["A receber hoje", currency(400), "text-warn"],
                  ["A pagar hoje", currency(5400), "text-danger"],
                ].map(([l, v, c]) => (
                  <li key={l} className="flex items-center justify-between">
                    <span className="text-muted">{l}</span>
                    <span className={cn("font-semibold", c)}>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      )}

      {tab === "receber" && (
        <BillTable
          rows={RECEIVABLES.map((r) => ({ id: r.id, a: r.paciente, b: r.descricao, venc: r.vencimento, valor: r.valor, status: r.status }))}
          colA="Paciente"
          onAction={() => toast.success("Pagamento registrado", "Título baixado no fluxo de caixa.")}
          actionLabel="Registrar recebimento"
        />
      )}

      {tab === "pagar" && (
        <BillTable
          rows={PAYABLES.map((p) => ({ id: p.id, a: p.fornecedor, b: `${p.descricao} · ${p.categoria}`, venc: p.vencimento, valor: p.valor, status: p.status }))}
          colA="Fornecedor"
          onAction={() => toast.success("Conta paga", "Saída lançada no fluxo de caixa.")}
          actionLabel="Marcar como paga"
        />
      )}

      {tab === "transacoes" && (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface-2/50 text-[11px] font-semibold uppercase text-faint">
                <th className="px-5 py-3">Descrição</th>
                <th className="px-3 py-3">Data</th>
                <th className="px-3 py-3">Categoria</th>
                <th className="px-3 py-3">Forma</th>
                <th className="px-3 py-3 text-right">Valor</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {TRANSACTIONS.map((t) => (
                <tr key={t.id} className="hover:bg-surface-2/60">
                  <td className="px-5 py-3 font-medium text-ink">{t.descricao}</td>
                  <td className="px-3 py-3 text-muted">{mediumDate(t.data)}</td>
                  <td className="px-3 py-3 text-muted">{t.categoria}</td>
                  <td className="px-3 py-3 text-muted">{t.forma ?? "—"}</td>
                  <td className={cn("px-3 py-3 text-right font-medium tabular-nums", t.tipo === "receita" ? "text-ok" : "text-danger")}>
                    {t.tipo === "receita" ? "+" : "−"} {currency(t.valor)}
                  </td>
                  <td className="px-3 py-3"><Badge tone={t.status === "confirmado" ? "ok" : "warn"} size="sm">{t.status === "confirmado" ? "Confirmado" : "Pendente"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "comissoes" && (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface-2/50 text-[11px] font-semibold uppercase text-faint">
                <th className="px-5 py-3">Profissional</th>
                <th className="px-3 py-3 text-right">Procedimentos</th>
                <th className="px-3 py-3 text-right">Faturado</th>
                <th className="px-3 py-3 text-right">%</th>
                <th className="px-3 py-3 text-right">Comissão</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {COMMISSIONS.map((c) => (
                <tr key={c.id} className="hover:bg-surface-2/60">
                  <td className="px-5 py-3 font-medium text-ink">{c.profissional}</td>
                  <td className="px-3 py-3 text-right text-muted">{c.procedimentos}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted">{currency(c.faturado)}</td>
                  <td className="px-3 py-3 text-right text-muted">{c.percentual}%</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums text-ink">{currency(c.comissao)}</td>
                  <td className="px-3 py-3"><Badge tone={c.status === "paga" ? "ok" : "warn"} size="sm">{c.status === "paga" ? "Paga" : "Aberta"}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {tab === "formas" && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <Card>
            <div className="p-5">
              <CardHeader title="Recebimentos por forma de pagamento" subtitle="Mês atual" />
              <div className="mt-3">
                <RankBars data={formas} />
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-5">
              <CardHeader title="Taxas e prazos configurados" />
              <ul className="mt-3 divide-y divide-line text-[13px]">
                {[
                  ["Pix", "0% · D+0"],
                  ["Cartão de débito", "1,2% · D+1"],
                  ["Cartão de crédito à vista", "2,9% · D+30"],
                  ["Cartão parcelado (2–6x)", "3,9% · D+30"],
                  ["Link de pagamento", "3,2% · D+2"],
                  ["Boleto", "R$ 2,90 · D+1"],
                ].map(([f, t]) => (
                  <li key={f} className="flex items-center justify-between py-2.5">
                    <span className="text-ink">{f}</span>
                    <span className="text-muted">{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function BillTable({
  rows,
  colA,
  onAction,
  actionLabel,
}: {
  rows: { id: string; a: string; b: string; venc: Date; valor: number; status: string }[];
  colA: string;
  onAction: () => void;
  actionLabel: string;
}) {
  const total = rows.filter((r) => r.status !== "pago").reduce((s, r) => s + r.valor, 0);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3">
        <p className="text-[13px] text-muted">{rows.filter((r) => r.status !== "pago").length} títulos em aberto</p>
        <p className="text-[13px] font-semibold text-ink">Total: {currency(total)}</p>
      </div>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr className="border-b border-line bg-surface-2/50 text-[11px] font-semibold uppercase text-faint">
            <th className="px-5 py-3">{colA}</th>
            <th className="px-3 py-3">Descrição</th>
            <th className="px-3 py-3">Vencimento</th>
            <th className="px-3 py-3 text-right">Valor</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r) => {
            const s = BILL_STATUS[r.status];
            return (
              <tr key={r.id} className="hover:bg-surface-2/60">
                <td className="px-5 py-3 font-medium text-ink">{r.a}</td>
                <td className="px-3 py-3 text-muted">{r.b}</td>
                <td className="px-3 py-3 text-muted">{mediumDate(r.venc)}</td>
                <td className="px-3 py-3 text-right font-medium tabular-nums text-ink">{currency(r.valor)}</td>
                <td className="px-3 py-3"><Badge tone={s.tone} size="sm">{s.label}</Badge></td>
                <td className="px-3 py-3 text-right">
                  {r.status !== "pago" && (
                    <Button size="sm" variant="ghost" onClick={onAction}>{actionLabel}</Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}
