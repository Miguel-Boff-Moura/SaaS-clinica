import { TriangleAlert, Plus, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/Misc";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { PRODUCTS, LOW_STOCK, EXPIRING_SOON, STOCK_MOVEMENTS } from "@/data";
import { currency, mediumDate } from "@/lib/format";
import { cn } from "@/lib/cn";

export function Inventory() {
  const toast = useToast();

  return (
    <div className="fade-in">
      <PageHeader
        title="Estoque"
        subtitle="Produtos, insumos, validade e movimentações"
        actions={
          <>
            <Button size="sm" variant="secondary" onClick={() => toast.success("Entrada registrada")}>Registrar entrada</Button>
            <Button size="sm" onClick={() => toast.success("Produto criado")}><Plus size={15} /> Novo produto</Button>
          </>
        }
      />

      {(LOW_STOCK.length > 0 || EXPIRING_SOON.length > 0) && (
        <div className="mb-5 flex flex-wrap gap-3">
          {LOW_STOCK.length > 0 && (
            <div className="flex items-center gap-2.5 rounded-xl border border-danger/25 bg-danger-soft px-4 py-2.5 text-[13px] text-danger">
              <TriangleAlert size={16} />
              <span><strong>{LOW_STOCK.length} produtos</strong> abaixo do estoque mínimo: {LOW_STOCK.map((p) => p.nome).join(", ")}</span>
            </div>
          )}
          {EXPIRING_SOON.length > 0 && (
            <div className="flex items-center gap-2.5 rounded-xl border border-warn/25 bg-warn-soft px-4 py-2.5 text-[13px] text-warn">
              <TriangleAlert size={16} />
              <span><strong>{EXPIRING_SOON.length} produtos</strong> vencem em menos de 60 dias</span>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="p-5"><CardHeader title="Produtos e insumos" subtitle={`${PRODUCTS.length} itens cadastrados`} /></div>
          <div className="overflow-x-auto scroll-thin">
            <table className="w-full min-w-[720px] text-left text-[13px]">
              <thead>
                <tr className="border-y border-line bg-surface-2/50 text-[11px] font-semibold uppercase text-faint">
                  <th className="px-5 py-3">Produto</th>
                  <th className="px-3 py-3">Estoque</th>
                  <th className="px-3 py-3">Validade</th>
                  <th className="px-3 py-3 text-right">Custo</th>
                  <th className="px-3 py-3 text-right">Venda</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {PRODUCTS.map((p) => {
                  const baixo = p.estoque < p.estoqueMinimo;
                  return (
                    <tr key={p.id} className="hover:bg-surface-2/60">
                      <td className="px-5 py-3">
                        <p className="font-medium text-ink">{p.nome}</p>
                        <p className="text-[11px] text-faint">{p.categoria} · {p.fornecedor}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <span className={cn("font-medium tabular-nums", baixo ? "text-danger" : "text-ink")}>{p.estoque} {p.unidade}</span>
                          {baixo && <Badge tone="danger" size="sm">baixo</Badge>}
                        </div>
                        <ProgressBar className="mt-1 w-24" value={p.estoque} total={p.estoqueMinimo * 2} tone={baixo ? "danger" : "ok"} />
                        <p className="mt-0.5 text-[10px] text-faint">mín. {p.estoqueMinimo}</p>
                      </td>
                      <td className="px-3 py-3 text-muted">{mediumDate(p.validade)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-muted">{currency(p.custo, true)}</td>
                      <td className="px-3 py-3 text-right tabular-nums text-ink">{p.precoVenda > 0 ? currency(p.precoVenda) : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="p-5"><CardHeader title="Movimentações recentes" /></div>
          <ul className="divide-y divide-line">
            {STOCK_MOVEMENTS.map((m) => (
              <li key={m.id} className="flex items-start gap-3 px-5 py-3">
                <span className={cn("mt-0.5 flex size-7 items-center justify-center rounded-full", m.tipo === "entrada" ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn")}>
                  {m.tipo === "entrada" ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-ink">{m.produto} <span className="text-faint">×{m.quantidade}</span></p>
                  <p className="text-[11px] text-muted">{m.motivo}</p>
                  <p className="text-[10.5px] text-faint">{mediumDate(m.data)} · {m.responsavel}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
