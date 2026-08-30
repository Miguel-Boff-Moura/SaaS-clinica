import { TODAY, sameDay } from "@/lib/format";
import { PATIENTS } from "./patients";
import { APPOINTMENTS } from "./agenda";
import { procedureById } from "./catalog";
import { LEADS } from "./crm";
import { TRANSACTIONS } from "./finance";

export * from "./core";
export * from "./catalog";
export * from "./patients";
export * from "./agenda";
export * from "./crm";
export * from "./finance";
export * from "./comms";

/* ============================================================================
   SELETORES DERIVADOS — cálculos de negócio reutilizáveis nas telas
============================================================================ */

export type ReturnStatus = "em_dia" | "proximo" | "vencido";

export interface ProcedureReturn {
  patientId: string;
  patientNome: string;
  procedimento: string;
  aplicadoEm: Date;
  venceEm: Date;
  diasRestantes: number;
  progresso: number; // 0..1 do intervalo decorrido
  status: ReturnStatus;
}

/** Varre o histórico de todos os pacientes e calcula a janela de retorno
 *  do procedimento mais recente que possui validade cadastrada. */
export function computeReturns(): ProcedureReturn[] {
  const out: ProcedureReturn[] = [];
  for (const p of PATIENTS) {
    const comValidade = p.procedimentos
      .map((pr) => ({ pr, proc: procedureById(pr.procedimentoId) }))
      .filter((x) => x.proc?.retornoDias)
      .sort((a, b) => b.pr.data.getTime() - a.pr.data.getTime());
    if (!comValidade.length) continue;
    const { pr, proc } = comValidade[0];
    const dias = proc!.retornoDias!;
    const venceEm = new Date(pr.data.getTime() + dias * 86_400_000);
    const total = venceEm.getTime() - pr.data.getTime();
    const decorrido = TODAY.getTime() - pr.data.getTime();
    const diasRestantes = Math.ceil((venceEm.getTime() - TODAY.getTime()) / 86_400_000);
    const progresso = Math.max(0, Math.min(1, decorrido / total));
    const status: ReturnStatus =
      diasRestantes < 0 ? "vencido" : diasRestantes <= Math.max(15, dias * 0.2) ? "proximo" : "em_dia";
    out.push({
      patientId: p.id,
      patientNome: p.nome,
      procedimento: pr.nome,
      aplicadoEm: pr.data,
      venceEm,
      diasRestantes,
      progresso,
      status,
    });
  }
  return out.sort((a, b) => a.diasRestantes - b.diasRestantes);
}

export function appointmentsOn(date: Date) {
  return APPOINTMENTS.filter((a) => sameDay(a.inicio, date)).sort(
    (a, b) => a.inicio.getTime() - b.inicio.getTime()
  );
}

export function todayAppointments() {
  return appointmentsOn(TODAY);
}

export interface DashboardSummary {
  consultasHoje: number;
  aguardando: number;
  faturamentoDia: number;
  taxaComparecimento: number;
  novosPacientes30d: number;
  retornosPendentes: number;
}

export function dashboardSummary(): DashboardSummary {
  const hoje = todayAppointments();
  const finalizadosOuNao = hoje.filter((a) => ["concluido", "faltou"].includes(a.status));
  const compareceram = hoje.filter((a) => ["concluido", "em_atendimento"].includes(a.status));
  const faturamentoDia = TRANSACTIONS.filter(
    (t) => t.tipo === "receita" && t.status === "confirmado" && sameDay(t.data, TODAY)
  ).reduce((s, t) => s + t.valor, 0);
  const novos = PATIENTS.filter(
    (p) => (TODAY.getTime() - p.desde.getTime()) / 86_400_000 <= 30 && p.status !== "lead"
  ).length;
  return {
    consultasHoje: hoje.filter((a) => a.status !== "cancelado").length,
    aguardando: hoje.filter((a) => a.status === "aguardando").length,
    faturamentoDia,
    taxaComparecimento: finalizadosOuNao.length
      ? Math.round((compareceram.length / (compareceram.length + finalizadosOuNao.filter((a) => a.status === "faltou").length || 1)) * 100)
      : 92,
    novosPacientes30d: novos,
    retornosPendentes: computeReturns().filter((r) => r.status !== "em_dia").length,
  };
}

export interface Indicator {
  label: string;
  valor: string;
  delta: number; // variação % vs período anterior
  hint: string;
}

export function indicators(): Indicator[] {
  return [
    { label: "Faturamento (mês)", valor: "R$ 92,3k", delta: 4.2, hint: "vs. R$ 88,6k em julho" },
    { label: "Atendimentos (mês)", valor: "214", delta: 6.1, hint: "vs. 202 em julho" },
    { label: "Novos pacientes", valor: "31", delta: 10.7, hint: "vs. 28 em julho" },
    { label: "Conversão de leads", valor: "38%", delta: 3.0, hint: "18 de 47 leads" },
    { label: "Ticket médio", valor: "R$ 431", delta: -1.4, hint: "vs. R$ 437 em julho" },
    { label: "Taxa de retorno", valor: "64%", delta: 2.2, hint: "pacientes que remarcam em 120d" },
  ];
}

export function crmFunnelCounts() {
  const counts: Record<string, number> = {};
  for (const l of LEADS) counts[l.stage] = (counts[l.stage] ?? 0) + 1;
  return counts;
}
