import { useMemo, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { PageHeader, EmptyState, SkeletonRows } from "@/components/ui/Misc";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Tabs } from "@/components/ui/Tabs";
import { Modal } from "@/components/ui/Modal";
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
import { usePendencias, type PendenciaRow } from "@/hooks/usePendencias";
import { usePatients } from "@/hooks/usePatients";
import { currency, mediumDate } from "@/lib/format";
import { cn } from "@/lib/cn";

const TABS = [
  { key: "visao", label: "Visão geral" },
  { key: "pendencias", label: "Pendências" },
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

      {tab === "pendencias" && <PendenciasTab />}

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

function PendenciasTab() {
  const toast = useToast();
  const { data: pendencias, loading, error, create, addBaixa } = usePendencias();
  const { data: patients, create: createPatient } = usePatients();
  const patientMap = useMemo(() => new Map(patients.map((p) => [p.id, p])), [patients]);
  const [mesFiltro, setMesFiltro] = useState("todos");
  const [novaOpen, setNovaOpen] = useState(false);
  const [baixaAlvo, setBaixaAlvo] = useState<PendenciaRow | null>(null);

  const meses = useMemo(() => {
    const set = new Set(pendencias.map((p) => p.data_vencimento.slice(0, 7)));
    return Array.from(set).sort();
  }, [pendencias]);

  const filtradas = pendencias.filter((p) => mesFiltro === "todos" || p.data_vencimento.slice(0, 7) === mesFiltro);
  const totalAberto = filtradas.reduce((s, p) => s + (p.valor_total - p.valor_pago), 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <select
          value={mesFiltro}
          onChange={(e) => setMesFiltro(e.target.value)}
          className="focusable h-9 rounded-lg border border-line bg-white px-3 text-[13px] font-medium text-ink"
        >
          <option value="todos">Todos os meses</option>
          {meses.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <p className="text-[13px] text-muted">Saldo em aberto: <span className="font-semibold text-ink">{currency(totalAberto)}</span></p>
        <Button size="sm" className="ml-auto" onClick={() => setNovaOpen(true)}>
          <Plus size={15} /> Nova pendência
        </Button>
      </div>

      {loading && <SkeletonRows rows={4} />}
      {!loading && error && <p className="text-sm text-danger">Erro ao carregar pendências: {error}</p>}
      {!loading && !error && filtradas.length === 0 && (
        <EmptyState title="Nenhuma pendência" description="Sem parcelamentos informais em aberto pra esse período." />
      )}

      {filtradas.length > 0 && (
        <Card className="overflow-hidden">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-line bg-surface-2/50 text-[11px] font-semibold uppercase text-faint">
                <th className="px-5 py-3">Paciente</th>
                <th className="px-3 py-3">Descrição</th>
                <th className="px-3 py-3">Vencimento</th>
                <th className="px-3 py-3 text-right">Total</th>
                <th className="px-3 py-3 text-right">Pago</th>
                <th className="px-3 py-3 text-right">Saldo</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {filtradas.map((p) => {
                const saldo = p.valor_total - p.valor_pago;
                const quitado = saldo <= 0;
                return (
                  <tr key={p.id} className="hover:bg-surface-2/60">
                    <td className="px-5 py-3 font-medium text-ink">{patientMap.get(p.paciente_id)?.nome ?? "—"}</td>
                    <td className="px-3 py-3 text-muted">{p.descricao}</td>
                    <td className="px-3 py-3 text-muted">{mediumDate(new Date(p.data_vencimento + "T00:00:00"))}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted">{currency(p.valor_total)}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-muted">{currency(p.valor_pago)}</td>
                    <td className="px-3 py-3 text-right font-medium tabular-nums text-ink">{currency(saldo)}</td>
                    <td className="px-3 py-3"><Badge tone={quitado ? "ok" : "warn"} size="sm">{quitado ? "Quitado" : "Em aberto"}</Badge></td>
                    <td className="px-3 py-3 text-right">
                      {!quitado && (
                        <Button size="sm" variant="ghost" onClick={() => setBaixaAlvo(p)}>Registrar baixa</Button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      <NovaPendenciaModal
        open={novaOpen}
        onClose={() => setNovaOpen(false)}
        patients={patients}
        createPatient={createPatient}
        createPendencia={create}
        onCreated={() => { setNovaOpen(false); toast.success("Pendência registrada"); }}
      />

      <BaixaModal
        pendencia={baixaAlvo}
        onClose={() => setBaixaAlvo(null)}
        onSave={async (input) => {
          const { error } = await addBaixa(baixaAlvo!.id, input);
          if (error) { toast.warning("Erro ao registrar baixa"); return; }
          setBaixaAlvo(null);
          toast.success("Baixa registrada");
        }}
      />
    </div>
  );
}

function NovaPendenciaModal({
  open,
  onClose,
  patients,
  createPatient,
  createPendencia,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  patients: { id: string; nome: string; telefone: string }[];
  createPatient: (input: { nome: string; telefone: string }) => Promise<{ data: { id: string } | null; error: string | null }>;
  createPendencia: (input: { paciente_id: string; descricao: string; valor_total: number; data_vencimento: string }) => Promise<{ error: string | null }>;
  onCreated: () => void;
}) {
  const NOVO = "__novo__";
  const [pacienteId, setPacienteId] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [vencimento, setVencimento] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!descricao.trim()) return setFormError("Descreva a pendência.");
    if (!valorTotal || Number(valorTotal) <= 0) return setFormError("Informe o valor total.");
    if (!vencimento) return setFormError("Informe o vencimento.");

    let finalPacienteId = pacienteId;
    setSubmitting(true);

    if (pacienteId === NOVO) {
      if (!novoNome.trim() || !novoTelefone.trim()) {
        setSubmitting(false);
        return setFormError("Preencha nome e telefone do novo paciente.");
      }
      const { data, error } = await createPatient({ nome: novoNome.trim(), telefone: novoTelefone });
      if (error || !data) { setSubmitting(false); return setFormError("Erro ao cadastrar paciente: " + error); }
      finalPacienteId = data.id;
    }

    if (!finalPacienteId) { setSubmitting(false); return setFormError("Escolha o paciente."); }

    const { error } = await createPendencia({
      paciente_id: finalPacienteId,
      descricao: descricao.trim(),
      valor_total: Number(valorTotal),
      data_vencimento: vencimento,
    });
    setSubmitting(false);
    if (error) return setFormError(error);

    setPacienteId(""); setNovoNome(""); setNovoTelefone(""); setDescricao(""); setValorTotal(""); setVencimento("");
    onCreated();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Nova pendência"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" type="submit" form="nova-pendencia-form" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <form id="nova-pendencia-form" onSubmit={handleSubmit} className="flex flex-col gap-4 [&_input]:mt-1 [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-line [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_select]:mt-1 [&_select]:w-full [&_select]:rounded-[10px] [&_select]:border [&_select]:border-line [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px]">
        {formError && <p className="text-[13px] text-danger">{formError}</p>}

        <label className="text-[12px] font-medium text-muted">
          Paciente
          <select value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
            <option value="">Selecione…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.nome} · {p.telefone}</option>
            ))}
            <option value={NOVO}>+ Cadastrar novo paciente</option>
          </select>
        </label>

        {pacienteId === NOVO && (
          <div className="grid grid-cols-2 gap-3">
            <label className="text-[12px] font-medium text-muted">
              Nome
              <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
            </label>
            <label className="text-[12px] font-medium text-muted">
              Telefone
              <input value={novoTelefone} onChange={(e) => setNovoTelefone(e.target.value)} placeholder="(00) 00000-0000" />
            </label>
          </div>
        )}

        <label className="text-[12px] font-medium text-muted">
          Descrição
          <input value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex: Botox parcelado 3x" />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="text-[12px] font-medium text-muted">
            Valor total (R$)
            <input type="number" min={0.01} step="0.01" value={valorTotal} onChange={(e) => setValorTotal(e.target.value)} />
          </label>
          <label className="text-[12px] font-medium text-muted">
            Vencimento
            <input type="date" value={vencimento} onChange={(e) => setVencimento(e.target.value)} />
          </label>
        </div>
      </form>
    </Modal>
  );
}

function BaixaModal({
  pendencia,
  onClose,
  onSave,
}: {
  pendencia: PendenciaRow | null;
  onClose: () => void;
  onSave: (input: { valor: number; data: string; comprovante?: string }) => Promise<void>;
}) {
  const [valor, setValor] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [comprovante, setComprovante] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const saldo = pendencia!.valor_total - pendencia!.valor_pago;
    const v = Number(valor);
    if (!v || v <= 0) return setFormError("Informe o valor recebido.");
    if (v > saldo + 0.01) return setFormError(`Valor maior que o saldo em aberto (${currency(saldo)}).`);

    setSubmitting(true);
    await onSave({ valor: v, data, comprovante: comprovante || undefined });
    setSubmitting(false);
    setValor(""); setComprovante("");
  }

  return (
    <Modal
      open={!!pendencia}
      onClose={onClose}
      title="Registrar baixa"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" type="submit" form="baixa-form" disabled={submitting}>
            {submitting ? "Salvando..." : "Registrar"}
          </Button>
        </>
      }
    >
      {pendencia && (
        <form id="baixa-form" onSubmit={handleSubmit} className="flex flex-col gap-4 [&_input]:mt-1 [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-line [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px]">
          {formError && <p className="text-[13px] text-danger">{formError}</p>}
          <p className="text-[13px] text-muted">Saldo em aberto: <span className="font-semibold text-ink">{currency(pendencia.valor_total - pendencia.valor_pago)}</span></p>
          <label className="text-[12px] font-medium text-muted">
            Valor recebido (R$)
            <input type="number" min={0.01} step="0.01" value={valor} onChange={(e) => setValor(e.target.value)} />
          </label>
          <label className="text-[12px] font-medium text-muted">
            Data
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </label>
          <label className="text-[12px] font-medium text-muted">
            Comprovante (referência/observação)
            <input value={comprovante} onChange={(e) => setComprovante(e.target.value)} placeholder="Ex: Pix recebido, print anexado no WhatsApp" />
          </label>
        </form>
      )}
    </Modal>
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
