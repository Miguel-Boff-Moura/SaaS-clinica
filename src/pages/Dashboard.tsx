import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import type { Appointment } from "@/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge, APPOINTMENT_STATUS, RETURN_STATUS } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ReturnRing } from "@/components/ui/Misc";
import { QuickActionGrid } from "@/components/QuickActions";
import { AppointmentDetail } from "@/components/AppointmentDetail";
import { TrendArea } from "@/components/charts/Charts";
import {
  computeReturns,
  dashboardSummary,
  indicators,
  patientById,
  procedureById,
  professionalById,
  REVENUE_SERIES,
  todayAppointments,
} from "@/data";
import { currency, firstName, longDate, time } from "@/lib/format";
import { TODAY } from "@/lib/format";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function Dashboard() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [statuses, setStatuses] = useState<Record<string, Appointment["status"]>>({});

  const summary = useMemo(() => dashboardSummary(), []);
  const returns = useMemo(() => computeReturns().filter((r) => r.status !== "em_dia"), []);
  const inds = useMemo(() => indicators(), []);
  const agenda = useMemo(() => todayAppointments(), []);

  const withStatus = (a: Appointment): Appointment => ({ ...a, status: statuses[a.id] ?? a.status });

  const stats = [
    { label: "Consultas hoje", value: summary.consultasHoje, icon: <CalendarDays size={16} />, delta: 8 },
    { label: "Pacientes aguardando", value: summary.aguardando, icon: <Clock size={16} /> },
    { label: "Faturamento do dia", value: currency(summary.faturamentoDia), icon: <CircleDollarSign size={16} />, delta: 12 },
    { label: "Taxa de comparecimento", value: `${summary.taxaComparecimento}%`, icon: <CalendarCheck size={16} />, delta: 2 },
    { label: "Novos pacientes (30d)", value: summary.novosPacientes30d, icon: <UserPlus size={16} />, delta: 11 },
    { label: "Retornos pendentes", value: summary.retornosPendentes, icon: <TrendingUp size={16} />, delta: -4 },
  ];

  return (
    <div className="fade-in">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[27px] leading-tight text-ink">
            {greeting()}, {firstName("Dra. Mariana Costa")} <span className="align-middle">👋</span>
          </h1>
          <p className="mt-1 text-sm text-muted">{longDate(TODAY)} · veja o resumo da sua clínica</p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => navigate("/relatorios")}>
          Relatórios completos <ArrowRight size={14} />
        </Button>
      </div>

      {/* Resumo do dia */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Agenda de hoje — timeline */}
        <Card className="lg:col-span-2">
          <div className="p-5">
            <CardHeader
              title="Agenda de hoje"
              subtitle={`${agenda.filter((a) => a.status !== "cancelado").length} atendimentos programados`}
              action={
                <Link to="/agenda" className="flex items-center gap-1 text-[13px] font-medium text-primary-ink hover:underline">
                  Ver agenda <ChevronRight size={14} />
                </Link>
              }
            />
            <ol className="mt-4">
              {agenda.map((raw, i) => {
                const a = withStatus(raw);
                const p = patientById(a.pacienteId)!;
                const proc = procedureById(a.procedimentoId)!;
                const pro = professionalById(a.profissionalId)!;
                const meta = APPOINTMENT_STATUS[a.status];
                const dim = a.status === "cancelado" || a.status === "faltou";
                return (
                  <li key={a.id} className="relative flex gap-4 pb-4 last:pb-0">
                    <div className="flex flex-col items-center">
                      <span className="w-14 pt-0.5 text-right text-[13px] font-semibold tabular-nums text-ink">
                        {time(a.inicio)}
                      </span>
                    </div>
                    <div className="relative flex flex-col items-center">
                      <span
                        className="z-10 size-2.5 rounded-full ring-4 ring-canvas"
                        style={{ background: pro.cor }}
                      />
                      {i < agenda.length - 1 && <span className="w-px flex-1 bg-line" />}
                    </div>
                    <button
                      onClick={() => setSelected(a)}
                      className={`focusable -mt-1 mb-1 flex flex-1 items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition-colors hover:border-line hover:bg-surface-2 ${dim ? "opacity-55" : ""}`}
                    >
                      <Avatar name={p.nome} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13.5px] font-medium text-ink">{p.nome}</p>
                        <p className="truncate text-[12px] text-muted">
                          {proc.nome} · {pro.nome.replace("Dra. ", "Dra. ").replace("Dr. ", "Dr. ")}
                        </p>
                      </div>
                      <Badge tone={meta.tone} size="sm">{meta.label}</Badge>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </Card>

        {/* Retornos / alertas */}
        <Card>
          <div className="p-5">
            <CardHeader
              title="Retornos a acompanhar"
              subtitle="Janela clínica por procedimento"
              action={
                <Link to="/pacientes?filtro=retorno" className="flex items-center gap-1 text-[13px] font-medium text-primary-ink hover:underline">
                  Todos <ChevronRight size={14} />
                </Link>
              }
            />
            <ul className="mt-4 space-y-3">
              {returns.map((r) => {
                const meta = RETURN_STATUS[r.status];
                return (
                  <li key={r.patientId}>
                    <Link
                      to={`/pacientes/${r.patientId}`}
                      className="focusable flex items-center gap-3 rounded-xl p-1.5 hover:bg-surface-2"
                    >
                      <ReturnRing
                        progress={r.progresso}
                        status={r.status}
                        size={42}
                        stroke={4}
                        label={r.diasRestantes < 0 ? "!" : `${r.diasRestantes}d`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[13px] font-medium text-ink">{r.patientNome}</p>
                        <p className="truncate text-[11px] text-muted">{r.procedimento}</p>
                      </div>
                      <Badge tone={meta.tone} size="sm">{meta.label}</Badge>
                    </Link>
                  </li>
                );
              })}
              {returns.length === 0 && <p className="py-6 text-center text-[13px] text-muted">Tudo em dia por aqui. ✨</p>}
            </ul>
          </div>
        </Card>
      </div>

      {/* Indicadores */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="p-5">
            <CardHeader title="Receitas x Despesas" subtitle="Últimos 6 meses" />
            <div className="mt-3">
              <TrendArea
                data={REVENUE_SERIES}
                keys={[
                  { key: "receita", label: "Receita", color: "var(--color-primary)" },
                  { key: "despesa", label: "Despesa", color: "#B45309" },
                ]}
              />
            </div>
          </div>
        </Card>
        <Card>
          <div className="p-5">
            <CardHeader title="Indicadores do mês" subtitle="Agosto/2026" />
            <ul className="mt-3 divide-y divide-line">
              {inds.map((ind) => (
                <li key={ind.label} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-ink">{ind.label}</p>
                    <p className="truncate text-[11px] text-faint">{ind.hint}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-ink">{ind.valor}</p>
                    <p className={`text-[11px] font-semibold ${ind.delta >= 0 ? "text-ok" : "text-danger"}`}>
                      {ind.delta >= 0 ? "▲" : "▼"} {Math.abs(ind.delta).toFixed(1)}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>

      {/* Ações rápidas */}
      <Card className="mt-5">
        <div className="p-5">
          <CardHeader title="Ações rápidas" subtitle="Os fluxos mais usados no dia a dia" />
          <div className="mt-4">
            <QuickActionGrid columns={5} />
          </div>
        </div>
      </Card>

      <AppointmentDetail
        appointment={selected ? withStatus(selected) : null}
        onClose={() => setSelected(null)}
        onStatusChange={(id, status) => setStatuses((s) => ({ ...s, [id]: status }))}
      />
    </div>
  );
}
