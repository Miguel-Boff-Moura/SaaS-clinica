import { useState, type FormEvent } from "react";
import { TriangleAlert, Plus, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageHeader, EmptyState, SkeletonRows, ProgressBar } from "@/components/ui/Misc";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { useStock, type StockItem } from "@/hooks/useStock";
import { useAuth } from "@/lib/auth";
import { mediumDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Inventory() {
  const toast = useToast();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const { items, movements, loading, error, createItem, registerMovement } = useStock();
  const [novoItemOpen, setNovoItemOpen] = useState(false);
  const [movAlvo, setMovAlvo] = useState<StockItem | null>(null);

  const lowStock = items.filter((i) => i.quantidade < i.estoque_minimo);
  const expiringSoon = items.filter((i) => i.validade && new Date(i.validade + "T00:00:00").getTime() - Date.now() < 60 * 86_400_000);
  const itemById = (id: string) => items.find((i) => i.id === id);

  return (
    <div className="fade-in">
      <PageHeader
        title="Estoque"
        subtitle="Toxina botulínica e preenchedores — entrada, saída e contagem"
        actions={
          isAdmin && (
            <Button size="sm" onClick={() => setNovoItemOpen(true)}><Plus size={15} /> Novo item</Button>
          )
        }
      />

      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-sm text-danger">Erro ao carregar estoque: {error}</p>}

      {!loading && !error && (
        <>
          {(lowStock.length > 0 || expiringSoon.length > 0) && (
            <div className="mb-5 flex flex-wrap gap-3">
              {lowStock.length > 0 && (
                <div className="flex items-center gap-2.5 rounded-xl border border-danger/25 bg-danger-soft px-4 py-2.5 text-[13px] text-danger">
                  <TriangleAlert size={16} />
                  <span><strong>{lowStock.length} itens</strong> abaixo do estoque mínimo: {lowStock.map((i) => i.nome).join(", ")}</span>
                </div>
              )}
              {expiringSoon.length > 0 && (
                <div className="flex items-center gap-2.5 rounded-xl border border-warn/25 bg-warn-soft px-4 py-2.5 text-[13px] text-warn">
                  <TriangleAlert size={16} />
                  <span><strong>{expiringSoon.length} itens</strong> vencem em menos de 60 dias</span>
                </div>
              )}
            </div>
          )}

          {items.length === 0 ? (
            <EmptyState title="Nenhum item cadastrado" description="Cadastre toxina botulínica ou preenchedores pra começar." />
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              <Card className="lg:col-span-2 overflow-hidden">
                <div className="p-5"><CardHeader title="Itens" subtitle={`${items.length} cadastrados`} /></div>
                <div className="overflow-x-auto scroll-thin">
                  <table className="w-full min-w-[560px] text-left text-[13px]">
                    <thead>
                      <tr className="border-y border-line bg-surface-2/50 text-[11px] font-semibold uppercase text-faint">
                        <th className="px-5 py-3">Item</th>
                        <th className="px-3 py-3">Estoque</th>
                        <th className="px-3 py-3">Validade</th>
                        <th className="px-3 py-3"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {items.map((i) => {
                        const baixo = i.quantidade < i.estoque_minimo;
                        return (
                          <tr key={i.id} className="hover:bg-surface-2/60">
                            <td className="px-5 py-3">
                              <p className="font-medium text-ink">{i.nome}</p>
                              <p className="text-[11px] text-faint">{i.categoria}</p>
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex items-center gap-2">
                                <span className={cn("font-medium tabular-nums", baixo ? "text-danger" : "text-ink")}>{i.quantidade} {i.unidade}</span>
                                {baixo && <Badge tone="danger" size="sm">baixo</Badge>}
                              </div>
                              <ProgressBar className="mt-1 w-24" value={i.quantidade} total={Math.max(i.estoque_minimo * 2, 1)} tone={baixo ? "danger" : "ok"} />
                              <p className="mt-0.5 text-[10px] text-faint">mín. {i.estoque_minimo}</p>
                            </td>
                            <td className="px-3 py-3 text-muted">{i.validade ? mediumDate(new Date(i.validade + "T00:00:00")) : "—"}</td>
                            <td className="px-3 py-3 text-right">
                              {isAdmin && (
                                <Button size="sm" variant="ghost" onClick={() => setMovAlvo(i)}>Movimentar</Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card>
                <div className="p-5"><CardHeader title="Movimentações recentes" /></div>
                {movements.length === 0 ? (
                  <p className="px-5 pb-5 text-[13px] text-muted">Nenhuma movimentação ainda.</p>
                ) : (
                  <ul className="divide-y divide-line">
                    {movements.map((m) => (
                      <li key={m.id} className="flex items-start gap-3 px-5 py-3">
                        <span className={cn("mt-0.5 flex size-7 items-center justify-center rounded-full", m.tipo === "entrada" ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn")}>
                          {m.tipo === "entrada" ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-[12.5px] font-medium text-ink">{itemById(m.item_id)?.nome ?? "—"} <span className="text-faint">×{m.quantidade}</span></p>
                          <p className="text-[11px] text-muted">{m.motivo || (m.tipo === "entrada" ? "Entrada" : "Saída")}</p>
                          <p className="text-[10.5px] text-faint">{mediumDate(new Date(m.created_at))}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )}
        </>
      )}

      <NovoItemModal
        open={novoItemOpen}
        onClose={() => setNovoItemOpen(false)}
        onCreate={async (input) => {
          const { error } = await createItem(input);
          if (error) { toast.warning("Erro ao criar item"); return false; }
          toast.success("Item criado");
          setNovoItemOpen(false);
          return true;
        }}
      />

      <MovimentacaoModal
        item={movAlvo}
        onClose={() => setMovAlvo(null)}
        onSave={async (input) => {
          const { error } = await registerMovement({ item_id: movAlvo!.id, ...input });
          if (error) { toast.warning(error); return; }
          setMovAlvo(null);
          toast.success("Movimentação registrada");
        }}
      />
    </div>
  );
}

function NovoItemModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (input: { nome: string; categoria: string; unidade: string; estoque_minimo: number; validade?: string }) => Promise<boolean>;
}) {
  const [nome, setNome] = useState("");
  const [categoria, setCategoria] = useState("");
  const [unidade, setUnidade] = useState("frasco");
  const [estoqueMinimo, setEstoqueMinimo] = useState("");
  const [validade, setValidade] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const ok = await onCreate({
      nome, categoria, unidade,
      estoque_minimo: Number(estoqueMinimo) || 0,
      validade: validade || undefined,
    });
    setSubmitting(false);
    if (ok) { setNome(""); setCategoria(""); setUnidade("frasco"); setEstoqueMinimo(""); setValidade(""); }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo item de estoque"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" type="submit" form="novo-item-form" disabled={submitting}>
            {submitting ? "Salvando..." : "Salvar"}
          </Button>
        </>
      }
    >
      <form id="novo-item-form" onSubmit={handleSubmit} className="flex flex-col gap-4 [&_input]:mt-1 [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-line [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px]">
        <label className="text-[12px] font-medium text-muted">
          Nome
          <input required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Ácido hialurônico — lábio" />
        </label>
        <label className="text-[12px] font-medium text-muted">
          Categoria/região
          <input value={categoria} onChange={(e) => setCategoria(e.target.value)} placeholder="Ex: Preenchedor · lábio" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-[12px] font-medium text-muted">
            Unidade
            <input value={unidade} onChange={(e) => setUnidade(e.target.value)} placeholder="frasco, seringa…" />
          </label>
          <label className="text-[12px] font-medium text-muted">
            Estoque mínimo
            <input type="number" min={0} value={estoqueMinimo} onChange={(e) => setEstoqueMinimo(e.target.value)} />
          </label>
        </div>
        <label className="text-[12px] font-medium text-muted">
          Validade (opcional)
          <input type="date" value={validade} onChange={(e) => setValidade(e.target.value)} />
        </label>
      </form>
    </Modal>
  );
}

function MovimentacaoModal({
  item,
  onClose,
  onSave,
}: {
  item: StockItem | null;
  onClose: () => void;
  onSave: (input: { tipo: "entrada" | "saida"; quantidade: number; motivo: string }) => Promise<void>;
}) {
  const [tipo, setTipo] = useState<"entrada" | "saida">("entrada");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const q = Number(quantidade);
    if (!q || q <= 0) return setFormError("Informe a quantidade.");

    setSubmitting(true);
    await onSave({ tipo, quantidade: q, motivo });
    setSubmitting(false);
    setQuantidade(""); setMotivo("");
  }

  return (
    <Modal
      open={!!item}
      onClose={onClose}
      title={`Movimentar — ${item?.nome ?? ""}`}
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" type="submit" form="mov-form" disabled={submitting}>
            {submitting ? "Salvando..." : "Registrar"}
          </Button>
        </>
      }
    >
      {item && (
        <form id="mov-form" onSubmit={handleSubmit} className="flex flex-col gap-4 [&_input]:mt-1 [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-line [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px]">
          {formError && <p className="text-[13px] text-danger">{formError}</p>}
          <p className="text-[13px] text-muted">Estoque atual: <span className="font-semibold text-ink">{item.quantidade} {item.unidade}</span></p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setTipo("entrada")} className={cn("flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium", tipo === "entrada" ? "border-ok bg-ok-soft text-ok" : "border-line text-muted")}>Entrada</button>
            <button type="button" onClick={() => setTipo("saida")} className={cn("flex-1 rounded-lg border px-3 py-2 text-[13px] font-medium", tipo === "saida" ? "border-warn bg-warn-soft text-warn" : "border-line text-muted")}>Saída</button>
          </div>
          <label className="text-[12px] font-medium text-muted">
            Quantidade
            <input type="number" min={1} value={quantidade} onChange={(e) => setQuantidade(e.target.value)} />
          </label>
          <label className="text-[12px] font-medium text-muted">
            Motivo
            <input value={motivo} onChange={(e) => setMotivo(e.target.value)} placeholder="Ex: Aplicação — nome do paciente, ou NF do fornecedor" />
          </label>
        </form>
      )}
    </Modal>
  );
}
