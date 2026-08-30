import { Download } from "lucide-react";
import { PageHeader } from "@/components/ui/Misc";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Tabs";
import { useToast } from "@/components/ui/Toast";
import { TrendArea, RankBars, MiniBars, BreakdownDonut } from "@/components/charts/Charts";
import {
  DAILY_REVENUE_7D,
  REVENUE_BY_PROCEDURE,
  REVENUE_BY_PROFESSIONAL,
  REVENUE_SERIES,
  PROFESSIONALS,
} from "@/data";
import { useState } from "react";

const LEAD_FUNNEL = [
  { nome: "Leads recebidos", valor: 47 },
  { nome: "Contato realizado", valor: 39 },
  { nome: "Agendaram", valor: 27 },
  { nome: "Compareceram", valor: 21 },
  { nome: "Orçamento", valor: 18 },
  { nome: "Converteram", valor: 12 },
];

const CANCEL_SERIES = [
  { mes: "Mar", cancelamentos: 9, faltas: 6 },
  { mes: "Abr", cancelamentos: 7, faltas: 8 },
  { mes: "Mai", cancelamentos: 11, faltas: 5 },
  { mes: "Jun", cancelamentos: 6, faltas: 7 },
  { mes: "Jul", cancelamentos: 8, faltas: 4 },
  { mes: "Ago", cancelamentos: 5, faltas: 6 },
];

const TOP_PROCEDURES = [
  { nome: "Toxina botulínica", valor: 42 },
  { nome: "Limpeza de pele", valor: 38 },
  { nome: "Peeling químico", valor: 29 },
  { nome: "Preenchimento", valor: 21 },
  { nome: "Depilação a laser", valor: 18 },
];

export function Reports() {
  const toast = useToast();
  const [period, setPeriod] = useState<"30d" | "90d" | "12m">("90d");

  return (
    <div className="fade-in">
      <PageHeader
        title="Relatórios"
        subtitle="Desempenho clínico, comercial e financeiro"
        actions={
          <>
            <Segmented
              value={period}
              onChange={(p) => setPeriod(p as typeof period)}
              options={[
                { key: "30d", label: "30 dias" },
                { key: "90d", label: "90 dias" },
                { key: "12m", label: "12 meses" },
              ]}
            />
            <Button size="sm" variant="secondary" onClick={() => toast.success("Relatório exportado", "PDF consolidado gerado.")}>
              <Download size={14} /> Exportar
            </Button>
          </>
        }
      />

      <Card flat className="mb-5">
        <div className="flex flex-wrap items-center gap-2 p-3 text-[12.5px]">
          <span className="font-medium text-muted">Filtros:</span>
          <select className="rounded-lg border border-line bg-white px-2.5 py-1.5"><option>Todas as unidades</option><option>Aurora · Moinhos</option><option>Aurora · Zona Sul</option></select>
          <select className="rounded-lg border border-line bg-white px-2.5 py-1.5"><option>Todos os profissionais</option>{PROFESSIONALS.map((p) => <option key={p.id}>{p.nome}</option>)}</select>
          <select className="rounded-lg border border-line bg-white px-2.5 py-1.5"><option>Todos os procedimentos</option></select>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <ReportCard title="Faturamento por período" subtitle="Receita x despesa mensal">
          <TrendArea data={REVENUE_SERIES} keys={[{ key: "receita", label: "Receita", color: "var(--color-primary)" }, { key: "despesa", label: "Despesa", color: "#B45309" }]} />
        </ReportCard>

        <ReportCard title="Faturamento por procedimento" subtitle="Participação na receita">
          <BreakdownDonut data={REVENUE_BY_PROCEDURE} />
        </ReportCard>

        <ReportCard title="Conversão de leads" subtitle="Funil comercial no período">
          <RankBars data={LEAD_FUNNEL} height={220} />
        </ReportCard>

        <ReportCard title="Procedimentos mais realizados" subtitle="Volume no período">
          <RankBars data={TOP_PROCEDURES} height={220} />
        </ReportCard>

        <ReportCard title="Cancelamentos e faltas" subtitle="Evolução mensal">
          <MiniBars data={CANCEL_SERIES} xKey="mes" yKey="faltas" height={200} />
        </ReportCard>

        <ReportCard title="Faturamento por profissional" subtitle="Mês atual">
          <RankBars data={REVENUE_BY_PROFESSIONAL} height={200} />
        </ReportCard>

        <ReportCard title="Novos pacientes x retornos" subtitle="Receita diária — últimos 7 dias">
          <MiniBars data={DAILY_REVENUE_7D} xKey="dia" yKey="valor" height={200} />
        </ReportCard>

        <Card>
          <div className="p-5">
            <CardHeader title="Indicadores consolidados" subtitle={`Período: ${period}`} />
            <ul className="mt-3 divide-y divide-line text-[13px]">
              {[
                ["Taxa de comparecimento", "91%"],
                ["Taxa de retorno (120d)", "64%"],
                ["Ticket médio", "R$ 431"],
                ["Receita por profissional/dia", "R$ 2.180"],
                ["Ocupação da agenda", "78%"],
                ["NPS (últimas pesquisas)", "82"],
              ].map(([l, v]) => (
                <li key={l} className="flex items-center justify-between py-2.5">
                  <span className="text-muted">{l}</span>
                  <span className="font-semibold text-ink">{v}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ReportCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <Card>
      <div className="p-5">
        <CardHeader title={title} subtitle={subtitle} />
        <div className="mt-3">{children}</div>
      </div>
    </Card>
  );
}
