import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Flame, Plus, Snowflake, Sun } from "lucide-react";
import type { CrmStage, Lead } from "@/types";
import { PageHeader } from "@/components/ui/Misc";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { CRM_STAGES, LEADS, USERS } from "@/data";
import { cn } from "@/lib/cn";
import { compactCurrency, currency, relativeFromToday } from "@/lib/format";

const TEMP_ICON = { quente: Flame, morno: Sun, frio: Snowflake };
const TEMP_TONE = { quente: "text-danger", morno: "text-warn", frio: "text-info" };

export function CRM() {
  const navigate = useNavigate();
  const toast = useToast();
  const [leads, setLeads] = useState<Lead[]>(LEADS);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overStage, setOverStage] = useState<CrmStage | null>(null);
  const [novoOpen, setNovoOpen] = useState(false);

  const userName = (id: string) => USERS.find((u) => u.id === id)?.nome ?? "—";

  const totals = useMemo(() => {
    const potencial = leads.filter((l) => !["conversao", "pos_atendimento"].includes(l.stage)).reduce((s, l) => s + l.valorPotencial, 0);
    const ganho = leads.filter((l) => l.stage === "conversao").reduce((s, l) => s + l.valorPotencial, 0);
    const conv = Math.round((leads.filter((l) => ["conversao", "pos_atendimento"].includes(l.stage)).length / leads.length) * 100);
    return { potencial, ganho, conv };
  }, [leads]);

  function drop(stage: CrmStage) {
    if (!dragId) return;
    setLeads((prev) => prev.map((l) => (l.id === dragId ? { ...l, stage } : l)));
    const moved = leads.find((l) => l.id === dragId);
    if (moved && moved.stage !== stage) {
      toast.success("Lead movido", `${moved.nome} → ${CRM_STAGES.find((s) => s.key === stage)?.label}`);
    }
    setDragId(null);
    setOverStage(null);
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="CRM"
        subtitle="Pipeline visual do lead ao pós-atendimento — arraste os cards entre as etapas"
        actions={<Button size="sm" onClick={() => setNovoOpen(true)}><Plus size={15} /> Novo lead</Button>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi label="Leads no funil" value={String(leads.length)} />
        <Kpi label="Valor potencial" value={compactCurrency(totals.potencial)} />
        <Kpi label="Convertido (mês)" value={compactCurrency(totals.ganho)} tone="ok" />
        <Kpi label="Taxa de conversão" value={`${totals.conv}%`} />
      </div>

      <div className="flex gap-3 overflow-x-auto scroll-thin pb-3">
        {CRM_STAGES.map((stage) => {
          const items = leads.filter((l) => l.stage === stage.key);
          const soma = items.reduce((s, l) => s + l.valorPotencial, 0);
          return (
            <div
              key={stage.key}
              onDragOver={(e) => { e.preventDefault(); setOverStage(stage.key); }}
              onDragLeave={() => setOverStage((s) => (s === stage.key ? null : s))}
              onDrop={() => drop(stage.key)}
              className={cn(
                "flex w-[264px] shrink-0 flex-col rounded-xl border bg-surface-2/40 transition-colors",
                overStage === stage.key ? "border-primary bg-primary-soft/40" : "border-line"
              )}
            >
              <div className="border-b border-line px-3 py-2.5">
                <div className="flex items-center justify-between">
                  <p className="text-[12.5px] font-semibold text-ink">{stage.label}</p>
                  <span className="rounded-full bg-white px-1.5 text-[11px] font-semibold text-muted">{items.length}</span>
                </div>
                <p className="mt-0.5 text-[10.5px] text-faint">{stage.hint} · {compactCurrency(soma)}</p>
              </div>

              <div className="flex flex-1 flex-col gap-2 p-2">
                {items.map((l) => {
                  const TIcon = TEMP_ICON[l.temperatura];
                  return (
                    <article
                      key={l.id}
                      draggable
                      onDragStart={() => setDragId(l.id)}
                      onDragEnd={() => { setDragId(null); setOverStage(null); }}
                      onClick={() => l.pacienteId && navigate(`/pacientes/${l.pacienteId}`)}
                      className={cn(
                        "card-flat cursor-grab rounded-lg border-line p-3 shadow-[var(--shadow-card)] transition active:cursor-grabbing",
                        dragId === l.id && "opacity-40"
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-[13px] font-semibold leading-tight text-ink">{l.nome}</p>
                        <TIcon size={13} className={cn("shrink-0", TEMP_TONE[l.temperatura])} />
                      </div>
                      <p className="mt-1 text-[12px] text-muted">{l.procedimentoInteresse}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium text-muted">{l.origem}</span>
                        <span className="text-[12px] font-semibold text-ink">{currency(l.valorPotencial)}</span>
                      </div>
                      <div className="mt-2.5 border-t border-line pt-2 text-[10.5px] text-faint">
                        <p className="flex items-center gap-1 text-primary-ink"><ArrowUpRight size={11} /> {l.proximaAcao}</p>
                        <p className="mt-0.5">{userName(l.responsavelId).replace("Dra. ", "").replace("Dr. ", "")} · {relativeFromToday(l.ultimaInteracao)}</p>
                      </div>
                    </article>
                  );
                })}
                {items.length === 0 && (
                  <p className="rounded-lg border border-dashed border-line py-6 text-center text-[11px] text-faint">
                    Solte um card aqui
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={novoOpen}
        onClose={() => setNovoOpen(false)}
        title="Novo lead"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setNovoOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={() => { setNovoOpen(false); toast.success("Lead criado", "Adicionado à etapa 'Novo lead'."); }}>Adicionar ao funil</Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3 [&_input]:w-full [&_input]:rounded-[10px] [&_input]:border [&_input]:border-line [&_input]:px-3 [&_input]:py-2 [&_input]:text-[13px] [&_select]:w-full [&_select]:rounded-[10px] [&_select]:border [&_select]:border-line [&_select]:px-3 [&_select]:py-2 [&_select]:text-[13px]">
          <label className="col-span-2 block"><span className="mb-1 block text-[12px] font-medium text-muted">Nome</span><input placeholder="Nome do lead" /></label>
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Telefone</span><input placeholder="(51) 9…" /></label>
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Origem</span><select><option>Instagram</option><option>Google</option><option>Indicação</option><option>Facebook</option><option>Site</option></select></label>
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Procedimento de interesse</span><input placeholder="Ex.: Botox" /></label>
          <label className="block"><span className="mb-1 block text-[12px] font-medium text-muted">Valor potencial</span><input placeholder="R$" /></label>
          <label className="col-span-2 block"><span className="mb-1 block text-[12px] font-medium text-muted">Responsável</span><select>{USERS.map((u) => <option key={u.id}>{u.nome}</option>)}</select></label>
        </div>
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
