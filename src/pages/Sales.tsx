import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FileDown, MessageCircle, Plus, Trash2, CheckCircle2 } from "lucide-react";
import type { Quote, QuoteItem } from "@/types";
import { PageHeader, EmptyState } from "@/components/ui/Misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, QUOTE_STATUS } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { PROCEDURES, PACKAGE_TEMPLATES, QUOTES, quoteTotal } from "@/data";
import { currency, mediumDate } from "@/lib/format";
import { cn } from "@/lib/cn";

const FILTERS = ["todos", "rascunho", "enviado", "aprovado", "recusado", "expirado"];

export function Sales() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState("todos");
  const [builderOpen, setBuilderOpen] = useState(params.get("novo") === "1");

  const list = useMemo(
    () => QUOTES.filter((q) => filter === "todos" || q.status === filter).sort((a, b) => +b.criadoEm - +a.criadoEm),
    [filter]
  );

  const stats = useMemo(() => {
    const aprovados = QUOTES.filter((q) => q.status === "aprovado");
    const enviados = QUOTES.filter((q) => q.status === "enviado");
    const valorAprovado = aprovados.reduce((s, q) => s + quoteTotal(q).total, 0);
    const taxa = Math.round((aprovados.length / QUOTES.length) * 100);
    return { valorAprovado, taxa, emAberto: enviados.length };
  }, []);

  return (
    <div className="fade-in">
      <PageHeader
        title="Vendas & Orçamentos"
        subtitle="Propostas comerciais de procedimentos, produtos e pacotes"
        actions={<Button size="sm" onClick={() => setBuilderOpen(true)}><Plus size={15} /> Novo orçamento</Button>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Orçamentos (mês)" value={String(QUOTES.length)} />
        <Kpi label="Aprovado" value={currency(stats.valorAprovado)} tone="ok" />
        <Kpi label="Taxa de aprovação" value={`${stats.taxa}%`} />
        <Kpi label="Aguardando resposta" value={String(stats.emAberto)} />
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "focusable rounded-full border px-3 py-1.5 text-[12.5px] font-medium capitalize transition-colors",
              filter === f ? "border-primary bg-primary text-white" : "border-line bg-white text-muted hover:bg-surface-2"
            )}
          >
            {f === "todos" ? "Todos" : QUOTE_STATUS[f].label}
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-line bg-surface-2/50 text-[11px] font-semibold uppercase text-faint">
              <th className="px-5 py-3">Nº</th>
              <th className="px-3 py-3">Paciente</th>
              <th className="px-3 py-3">Itens</th>
              <th className="px-3 py-3">Criado</th>
              <th className="px-3 py-3">Validade</th>
              <th className="px-3 py-3 text-right">Total</th>
              <th className="px-3 py-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((q) => {
              const { total } = quoteTotal(q);
              const s = QUOTE_STATUS[q.status];
              return (
                <tr key={q.id} className="hover:bg-surface-2/60">
                  <td className="px-5 py-3 font-medium text-ink">#{q.numero}</td>
                  <td className="px-3 py-3 text-ink">{q.pacienteNome}</td>
                  <td className="px-3 py-3 text-muted">{q.itens.map((i) => i.descricao).join(", ")}</td>
                  <td className="px-3 py-3 text-muted">{mediumDate(q.criadoEm)}</td>
                  <td className="px-3 py-3 text-muted">{mediumDate(q.validadeAte)}</td>
                  <td className="px-3 py-3 text-right font-semibold tabular-nums text-ink">{currency(total)}</td>
                  <td className="px-3 py-3"><Badge tone={s.tone} size="sm">{s.label}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {list.length === 0 && <EmptyState title="Nenhum orçamento neste filtro" />}
      </Card>

      <Modal
        open={builderOpen}
        onClose={() => { setBuilderOpen(false); params.delete("novo"); setParams(params, { replace: true }); }}
        title="Novo orçamento"
        size="lg"
        footer={<span className="text-[12px] text-faint">Rascunho salvo automaticamente</span>}
      >
        <QuoteBuilder onSent={() => setBuilderOpen(false)} />
      </Modal>
    </div>
  );
}

function Kpi({ label, value, tone }: { label: string; value: string; tone?: "ok" }) {
  return (
    <div className="card p-3.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <p className={cn("mt-1 font-display text-[20px]", tone === "ok" ? "text-ok" : "text-ink")}>{value}</p>
    </div>
  );
}

const CATALOG: { label: string; tipo: QuoteItem["tipo"]; valor: number }[] = [
  ...PROCEDURES.filter((p) => p.preco > 0).map((p) => ({ label: p.nome, tipo: "Procedimento" as const, valor: p.preco })),
  ...PACKAGE_TEMPLATES.map((p) => ({ label: p.nome, tipo: "Pacote" as const, valor: p.preco })),
  { label: "Sérum vitamina C 20% (revenda)", tipo: "Produto", valor: 210 },
  { label: "Protetor solar FPS 50 (revenda)", tipo: "Produto", valor: 149 },
];

function QuoteBuilder({ onSent }: { onSent: () => void }) {
  const toast = useToast();
  const [itens, setItens] = useState<QuoteItem[]>([
    { descricao: "Toxina botulínica (Botox)", tipo: "Procedimento", qtd: 1, valorUnit: 1350 },
  ]);
  const [desconto, setDesconto] = useState(0);
  const [pick, setPick] = useState(CATALOG[0].label);

  const subtotal = itens.reduce((s, i) => s + i.qtd * i.valorUnit, 0);
  const descontoValor = Math.round(subtotal * (desconto / 100));
  const total = subtotal - descontoValor;

  const add = () => {
    const c = CATALOG.find((x) => x.label === pick)!;
    setItens((p) => [...p, { descricao: c.label, tipo: c.tipo, qtd: 1, valorUnit: c.valor }]);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Paciente</span>
          <input className="w-full rounded-[10px] border border-line px-3 py-2 text-[13px]" placeholder="Buscar paciente…" />
        </label>
        <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Condição de pagamento</span>
          <select className="w-full rounded-[10px] border border-line px-3 py-2 text-[13px]">
            <option>Pix à vista</option><option>2x sem juros</option><option>3x sem juros</option><option>Cartão em até 6x</option>
          </select>
        </label>
      </div>

      <div className="rounded-xl border border-line">
        <div className="flex items-center gap-2 border-b border-line p-2.5">
          <select value={pick} onChange={(e) => setPick(e.target.value)} className="flex-1 rounded-lg border border-line px-2.5 py-1.5 text-[12.5px]">
            {CATALOG.map((c) => <option key={c.label}>{c.label}</option>)}
          </select>
          <Button size="sm" variant="secondary" onClick={add}><Plus size={13} /> Adicionar</Button>
        </div>
        <table className="w-full text-left text-[12.5px]">
          <thead className="text-[10.5px] uppercase text-faint">
            <tr><th className="px-3 py-2">Item</th><th className="px-2 py-2">Tipo</th><th className="px-2 py-2 w-14">Qtd</th><th className="px-2 py-2 text-right">Unit.</th><th className="px-2 py-2 text-right">Total</th><th></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {itens.map((it, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 text-ink">{it.descricao}</td>
                <td className="px-2 py-2 text-muted">{it.tipo}</td>
                <td className="px-2 py-2">
                  <input
                    type="number" min={1} value={it.qtd}
                    onChange={(e) => setItens((p) => p.map((x, i) => i === idx ? { ...x, qtd: +e.target.value || 1 } : x))}
                    className="w-12 rounded border border-line px-1.5 py-1 text-[12px]"
                  />
                </td>
                <td className="px-2 py-2 text-right tabular-nums text-muted">{currency(it.valorUnit)}</td>
                <td className="px-2 py-2 text-right tabular-nums font-medium text-ink">{currency(it.qtd * it.valorUnit)}</td>
                <td className="px-2 py-2 text-right">
                  <button onClick={() => setItens((p) => p.filter((_, i) => i !== idx))} className="text-faint hover:text-danger"><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <div className="w-64 space-y-1.5 text-[13px]">
          <div className="flex justify-between text-muted"><span>Subtotal</span><span className="tabular-nums">{currency(subtotal)}</span></div>
          <div className="flex items-center justify-between text-muted">
            <span className="flex items-center gap-1.5">Desconto
              <input type="number" min={0} max={100} value={desconto} onChange={(e) => setDesconto(Math.min(100, +e.target.value || 0))} className="w-12 rounded border border-line px-1.5 py-0.5 text-[12px]" />%
            </span>
            <span className="tabular-nums text-danger">− {currency(descontoValor)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-1.5 text-[15px] font-semibold text-ink"><span>Total</span><span className="tabular-nums">{currency(total)}</span></div>
        </div>
      </div>

      <div className="flex flex-wrap justify-end gap-2 border-t border-line pt-4">
        <Button size="sm" variant="secondary" onClick={() => toast.info("Rascunho salvo")}>Salvar</Button>
        <Button size="sm" variant="secondary" onClick={() => toast.success("PDF gerado")}><FileDown size={14} /> Gerar PDF</Button>
        <Button size="sm" variant="secondary" onClick={() => { toast.success("Enviado pelo WhatsApp"); onSent(); }}><MessageCircle size={14} /> Enviar WhatsApp</Button>
        <Button size="sm" onClick={() => { toast.success("Orçamento aprovado", "Convertido em venda e enviado ao financeiro."); onSent(); }}><CheckCircle2 size={14} /> Aprovar</Button>
      </div>
    </div>
  );
}
