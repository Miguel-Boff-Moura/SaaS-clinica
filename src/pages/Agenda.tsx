import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Appointment } from "@/types";
import { PageHeader, EmptyState } from "@/components/ui/Misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Tabs";
import { Badge, APPOINTMENT_STATUS } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { AppointmentDetail } from "@/components/AppointmentDetail";
import {
  APPOINTMENTS,
  PATIENTS,
  PROCEDURES,
  PROFESSIONALS,
  ROOMS,
  patientById,
  procedureById,
  professionalById,
  roomById,
} from "@/data";
import { addDays, sameDay, startOfWeek, time, longDate, shortDate, mediumDate } from "@/lib/format";
import { TODAY } from "@/lib/format";
import { cn } from "@/lib/cn";

type ViewMode = "dia" | "semana" | "mes";
const WEEKDAYS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function Agenda() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<ViewMode>("dia");
  const [anchor, setAnchor] = useState<Date>(TODAY);
  const [proFilter, setProFilter] = useState("todos");
  const [roomFilter, setRoomFilter] = useState("todos");
  const [procFilter, setProcFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [statuses, setStatuses] = useState<Record<string, Appointment["status"]>>({});
  const [novoOpen, setNovoOpen] = useState(params.get("novo") === "1");

  const withStatus = (a: Appointment): Appointment => ({ ...a, status: statuses[a.id] ?? a.status });

  const filtered = useMemo(
    () =>
      APPOINTMENTS.map(withStatus).filter(
        (a) =>
          (proFilter === "todos" || a.profissionalId === proFilter) &&
          (roomFilter === "todos" || a.salaId === roomFilter) &&
          (procFilter === "todos" || a.procedimentoId === procFilter) &&
          (statusFilter === "todos" || a.status === statusFilter)
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [proFilter, roomFilter, procFilter, statusFilter, statuses]
  );

  const step = (dir: number) =>
    setAnchor((d) => addDays(d, dir * (view === "dia" ? 1 : view === "semana" ? 7 : 30)));

  const rangeLabel =
    view === "dia"
      ? longDate(anchor)
      : view === "semana"
      ? `${shortDate(startOfWeek(anchor))} – ${shortDate(addDays(startOfWeek(anchor), 6))}`
      : anchor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="fade-in">
      <PageHeader
        title="Agenda"
        subtitle="Multiprofissional, por sala, procedimento e status"
        actions={
          <>
            <Segmented
              value={view}
              onChange={(v) => setView(v as ViewMode)}
              options={[
                { key: "dia", label: "Dia" },
                { key: "semana", label: "Semana" },
                { key: "mes", label: "Mês" },
              ]}
            />
            <Button size="sm" onClick={() => setNovoOpen(true)}>
              <Plus size={15} /> Novo agendamento
            </Button>
          </>
        }
      />

      {/* Barra de navegação + filtros */}
      <Card flat className="mb-4">
        <div className="flex flex-wrap items-center gap-3 p-3">
          <div className="flex items-center gap-1">
            <button onClick={() => step(-1)} className="focusable flex size-8 items-center justify-center rounded-lg border border-line hover:bg-surface-2">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setAnchor(TODAY)} className="focusable rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium hover:bg-surface-2">
              Hoje
            </button>
            <button onClick={() => step(1)} className="focusable flex size-8 items-center justify-center rounded-lg border border-line hover:bg-surface-2">
              <ChevronRight size={16} />
            </button>
          </div>
          <p className="text-sm font-semibold capitalize text-ink">{rangeLabel}</p>

          <div className="ml-auto flex flex-wrap items-center gap-2">
            <Select value={proFilter} onChange={setProFilter} label="Profissional" options={[["todos", "Todos os profissionais"], ...PROFESSIONALS.map((p) => [p.id, p.nome] as [string, string])]} />
            <Select value={roomFilter} onChange={setRoomFilter} label="Sala" options={[["todos", "Todas as salas"], ...ROOMS.map((r) => [r.id, r.nome] as [string, string])]} />
            <Select value={procFilter} onChange={setProcFilter} label="Procedimento" options={[["todos", "Todos os procedimentos"], ...PROCEDURES.map((p) => [p.id, p.nome] as [string, string])]} />
            <Select value={statusFilter} onChange={setStatusFilter} label="Status" options={[["todos", "Todos os status"], ...Object.entries(APPOINTMENT_STATUS).map(([k, v]) => [k, v.label] as [string, string])]} />
          </div>
        </div>
      </Card>

      {view === "dia" && <DayView date={anchor} appts={filtered} onOpen={setSelected} />}
      {view === "semana" && <WeekView anchor={anchor} appts={filtered} onOpen={setSelected} />}
      {view === "mes" && <MonthView anchor={anchor} appts={filtered} onPickDay={(d) => { setAnchor(d); setView("dia"); }} />}

      <AppointmentDetail
        appointment={selected ? withStatus(selected) : null}
        onClose={() => setSelected(null)}
        onStatusChange={(id, status) => setStatuses((s) => ({ ...s, [id]: status }))}
      />

      <Modal
        open={novoOpen}
        onClose={() => { setNovoOpen(false); params.delete("novo"); setParams(params, { replace: true }); }}
        title="Novo agendamento"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setNovoOpen(false)}>Cancelar</Button>
            <Button size="sm" onClick={() => { setNovoOpen(false); toast.success("Agendamento criado", "Confirmação enviada ao paciente por WhatsApp."); }}>
              Agendar e confirmar
            </Button>
          </>
        }
      >
        <NovoAgendamentoForm />
      </Modal>
    </div>
  );
}

function Select({
  value,
  onChange,
  label,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  options: [string, string][];
}) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="focusable h-8 max-w-[190px] cursor-pointer rounded-lg border border-line bg-white pl-3 pr-7 text-[12.5px] font-medium text-ink"
      >
        {options.map(([v, l]) => (
          <option key={v} value={v}>{l}</option>
        ))}
      </select>
    </label>
  );
}

/* ---- Visão Dia ------------------------------------------------------- */
function DayView({ date, appts, onOpen }: { date: Date; appts: Appointment[]; onOpen: (a: Appointment) => void }) {
  const list = appts.filter((a) => sameDay(a.inicio, date)).sort((a, b) => +a.inicio - +b.inicio);
  if (!list.length)
    return (
      <Card>
        <EmptyState title="Nenhum agendamento neste dia" description="Ajuste os filtros ou crie um novo agendamento." />
      </Card>
    );

  return (
    <Card>
      <div className="divide-y divide-line">
        {list.map((a) => {
          const p = patientById(a.pacienteId)!;
          const proc = procedureById(a.procedimentoId)!;
          const pro = professionalById(a.profissionalId)!;
          const room = roomById(a.salaId)!;
          const meta = APPOINTMENT_STATUS[a.status];
          const dim = a.status === "cancelado" || a.status === "faltou";
          return (
            <button
              key={a.id}
              onClick={() => onOpen(a)}
              className={cn(
                "focusable flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-2",
                dim && "opacity-55"
              )}
            >
              <div className="w-16 shrink-0">
                <p className="text-[13px] font-semibold tabular-nums text-ink">{time(a.inicio)}</p>
                <p className="text-[11px] text-faint">{time(a.fim)}</p>
              </div>
              <span className="h-10 w-1 shrink-0 rounded-full" style={{ background: pro.cor }} />
              <Avatar name={p.nome} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-ink">{p.nome}</p>
                <p className="truncate text-[12px] text-muted">
                  {proc.nome} · {a.tipo}
                </p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-[12px] font-medium text-ink">{pro.nome}</p>
                <p className="text-[11px] text-faint">{room.nome}</p>
              </div>
              <Badge tone={meta.tone} size="sm">{meta.label}</Badge>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ---- Visão Semana -------------------------------------------------- */
function WeekView({ anchor, appts, onOpen }: { anchor: Date; appts: Appointment[]; onOpen: (a: Appointment) => void }) {
  const start = startOfWeek(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 divide-x divide-line">
        {days.map((d, i) => {
          const list = appts.filter((a) => sameDay(a.inicio, d)).sort((a, b) => +a.inicio - +b.inicio);
          const isToday = sameDay(d, TODAY);
          return (
            <div key={i} className="min-h-[420px]">
              <div className={cn("border-b border-line px-2.5 py-2 text-center", isToday && "bg-primary-soft/50")}>
                <p className="text-[11px] font-medium uppercase text-faint">{WEEKDAYS[i]}</p>
                <p className={cn("text-[15px] font-semibold", isToday ? "text-primary-ink" : "text-ink")}>{d.getDate()}</p>
              </div>
              <div className="space-y-1.5 p-1.5">
                {list.map((a) => {
                  const p = patientById(a.pacienteId)!;
                  const pro = professionalById(a.profissionalId)!;
                  const meta = APPOINTMENT_STATUS[a.status];
                  const dim = a.status === "cancelado" || a.status === "faltou";
                  return (
                    <button
                      key={a.id}
                      onClick={() => onOpen(a)}
                      className={cn(
                        "focusable w-full rounded-lg border-l-[3px] bg-surface-2 px-2 py-1.5 text-left transition hover:bg-surface-3",
                        dim && "opacity-55 line-through"
                      )}
                      style={{ borderColor: pro.cor }}
                    >
                      <p className="text-[11px] font-semibold tabular-nums text-ink">{time(a.inicio)}</p>
                      <p className="truncate text-[11px] text-muted">{p.nome.split(" ")[0]}</p>
                      <Badge tone={meta.tone} size="sm" className="mt-1 px-1.5 py-0 text-[9px]">{meta.label}</Badge>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* ---- Visão Mês --------------------------------------------------- */
function MonthView({ anchor, appts, onPickDay }: { anchor: Date; appts: Appointment[]; onPickDay: (d: Date) => void }) {
  const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1);
  const gridStart = startOfWeek(first);
  const cells = Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
  return (
    <Card className="overflow-hidden">
      <div className="grid grid-cols-7 border-b border-line bg-surface-2/60 text-center text-[11px] font-semibold uppercase text-faint">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-2">{w}</div>
        ))}
      </div>
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          const inMonth = d.getMonth() === anchor.getMonth();
          const list = appts.filter((a) => sameDay(a.inicio, d));
          const isToday = sameDay(d, TODAY);
          return (
            <button
              key={i}
              onClick={() => onPickDay(d)}
              className={cn(
                "focusable min-h-[92px] border-b border-r border-line p-1.5 text-left transition-colors hover:bg-surface-2",
                !inMonth && "bg-surface-2/40 text-faint"
              )}
            >
              <span
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-full text-[12px] font-semibold",
                  isToday ? "bg-primary text-white" : inMonth ? "text-ink" : "text-faint"
                )}
              >
                {d.getDate()}
              </span>
              <div className="mt-1 space-y-0.5">
                {list.slice(0, 3).map((a) => {
                  const pro = professionalById(a.profissionalId)!;
                  return (
                    <p key={a.id} className="flex items-center gap-1 truncate text-[10.5px] text-muted">
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: pro.cor }} />
                      {time(a.inicio)} {patientById(a.pacienteId)!.nome.split(" ")[0]}
                    </p>
                  );
                })}
                {list.length > 3 && <p className="text-[10.5px] font-medium text-primary-ink">+{list.length - 3}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ---- Form de novo agendamento (mock) ---------------------------- */
function NovoAgendamentoForm() {
  return (
    <div className="space-y-4">
      <FormRow label="Paciente">
        <select className="input">
          <option>Buscar paciente…</option>
          {PATIENTS.map((p) => (
            <option key={p.id}>{p.nome}</option>
          ))}
          <option>+ Cadastrar novo paciente</option>
        </select>
      </FormRow>
      <div className="grid grid-cols-2 gap-3">
        <FormRow label="Data">
          <input type="date" defaultValue="2026-08-31" className="input" />
        </FormRow>
        <FormRow label="Horário">
          <input type="time" defaultValue="09:00" className="input" />
        </FormRow>
      </div>
      <FormRow label="Procedimento">
        <select className="input">
          {PROCEDURES.map((p) => (
            <option key={p.id}>{p.nome} — {p.duracaoMin}min</option>
          ))}
        </select>
      </FormRow>
      <div className="grid grid-cols-2 gap-3">
        <FormRow label="Profissional">
          <select className="input">
            {PROFESSIONALS.map((p) => (
              <option key={p.id}>{p.nome}</option>
            ))}
          </select>
        </FormRow>
        <FormRow label="Sala">
          <select className="input">
            {ROOMS.map((r) => (
              <option key={r.id}>{r.nome}</option>
            ))}
          </select>
        </FormRow>
      </div>
      <FormRow label="Observações">
        <textarea rows={2} placeholder="Preparo, particularidades…" className="input resize-none" />
      </FormRow>
      <label className="flex items-center gap-2 text-[13px] text-muted">
        <input type="checkbox" defaultChecked className="size-4 rounded border-line accent-[var(--color-primary)]" />
        Enviar confirmação automática por WhatsApp
      </label>
      <style>{`.input{width:100%;border:1px solid var(--color-line);border-radius:10px;padding:8px 10px;font-size:13px;background:#fff;color:var(--color-ink)}.input:focus{outline:2px solid var(--color-primary);outline-offset:1px}`}</style>
    </div>
  );
}

function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
