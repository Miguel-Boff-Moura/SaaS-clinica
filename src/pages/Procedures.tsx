import { useState } from "react";
import { Clock, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/Misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { PROCEDURES, PROFESSIONALS, roomById } from "@/data";
import { currency } from "@/lib/format";
import { cn } from "@/lib/cn";

const CATS = ["Todas", "Consulta", "Avaliação", "Estética facial", "Estética corporal", "Injetáveis", "Laser"];

export function Procedures() {
  const toast = useToast();
  const [cat, setCat] = useState("Todas");
  const list = PROCEDURES.filter((p) => cat === "Todas" || p.categoria === cat);

  return (
    <div className="fade-in">
      <PageHeader
        title="Procedimentos"
        subtitle="Catálogo com duração, preço, comissão, sala e materiais"
        actions={<Button size="sm" onClick={() => toast.success("Procedimento criado")}><Plus size={15} /> Novo procedimento</Button>}
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={cn(
              "focusable rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              cat === c ? "border-primary bg-primary text-white" : "border-line bg-white text-muted hover:bg-surface-2"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <Card key={p.id}>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[14px] font-semibold text-ink">{p.nome}</p>
                  <Badge tone="primary" size="sm" className="mt-1">{p.categoria}</Badge>
                </div>
                <p className="font-display text-[18px] text-ink">{p.preco > 0 ? currency(p.preco) : "Cortesia"}</p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-y-2 text-[12px] text-muted">
                <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {p.duracaoMin} min</span>
                <span>Comissão: {p.comissaoPct}%</span>
                <span>Sala: {roomById(p.salaId)?.nome}</span>
                <span>{p.retornoDias ? `Retorno: ${p.retornoDias}d` : "Sem retorno"}</span>
              </div>

              <div className="mt-3 border-t border-line pt-3">
                <p className="text-[11px] font-medium uppercase text-faint">Materiais</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {p.materiais.length ? p.materiais.map((m) => (
                    <span key={m} className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">{m}</span>
                  )) : <span className="text-[12px] text-faint">—</span>}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {PROFESSIONALS.filter((pro) => pro.procedimentos.includes(p.id)).map((pro) => (
                  <span key={pro.id} className="rounded-full px-2 py-0.5 text-[11px] font-medium text-white" style={{ background: pro.cor }}>
                    {pro.nome.replace("Dra. ", "").replace("Dr. ", "")}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
