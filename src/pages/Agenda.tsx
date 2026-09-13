import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader, EmptyState, SkeletonRows } from "@/components/ui/Misc";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Tabs";
import { Badge, APPOINTMENT_STATUS } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { AppointmentDetail, type AppointmentView } from "@/components/AppointmentDetail";
import { useAppointments, type AppointmentStatus } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useProcedures } from "@/hooks/useProcedures";
import { useRooms } from "@/hooks/useRooms";
import { maskPhone } from "@/lib/masks";
import { colorForId } from "@/lib/color";
import { addDays, sameDay, startOfWeek, time, longDate, shortDate } from "@/lib/format";
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
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [novoOpen, setNovoOpen] = useState(params.get("novo") === "1");

  const { data: appointmentsRaw, loading, error, create, updateStatus } = useAppointments();
  const { data: patients, create: createPatient } = usePatients();
  const { data: professionals } = useProfessionals();
  const { data: procedures } = useProcedures();
  const { data: rooms } = useRooms();

  const patientMap = useMemo(() => new Map(patients.map((p) => [p.id, p])), [patients]);
  const professionalMap = useMemo(() => new Map(professionals.map((p) => [p.id, p])), [professionals]);
  const procedureMap = useMemo(() => new Map(procedures.map((p) => [p.id, p])), [procedures]);
  const roomMap = useMemo(() => new Map(rooms.map((r) => [r.id, r])), [rooms]);

  const appointments: AppointmentView[] = useMemo(
    () =>
      appointmentsRaw.map((a) => ({
        id: a.id,
        inicio: new Date(a.inicio),
        fim: new Date(a.fim),
        pacienteId: a.paciente_id,
        profissionalId: a.profissional_id,
        procedimentoId: a.procedimento_id,
        salaId: a.sala_id,
        status: a.status,
        tipo: a.tipo,
        origem: a.origem,
        observacao: a.observacao ?? undefined,
      })),
    [appointmentsRaw]
  );

  const filtered = useMemo(
    () =>
      appointments.filter(
        (a) =>
          (proFilter === "todos" || a.profissionalId === proFilter) &&
          (roomFilter === "todos" || a.salaId === roomFilter) &&
          (procFilter === "todos" || a.procedimentoId === procFilter) &&
          (statusFilter === "todos" || a.status === statusFilter)
      ),
    [appointments, proFilter, roomFilter, procFilter, statusFilter]
  );

  const selected = selectedId ? appointments.find((a) => a.id === selectedId) ?? null : null;

  const step = (dir: number) =>
    setAnchor((d) => addDays(d, dir * (view === "dia" ? 1 : view === "semana" ? 7 : 30)));

  const rangeLabel =
    view === "dia"
      ? longDate(anchor)
      : view === "semana"
      ? `${shortDate(startOfWeek(anchor))} – ${shortDate(addDays(startOfWeek(anchor), 6))}`
      : anchor.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const lookups = { patientMap, professionalMap, procedureMap, roomMap };

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
            <Select value={proFilter} onChange={setProFilter} label="Profissional" options={[["todos", "Todos os profissionais"], ...professionals.map((p) => [p.id, p.nome] as [string, string])]} />
            <Select value={roomFilter} onChange={setRoomFilter} label="Sala" options={[["todos", "Todas as salas"], ...rooms.map((r) => [r.id, r.nome] as [string, string])]} />
            <Select value={procFilter} onChange={setProcFilter} label="Procedimento" options={[["todos", "Todos os procedimentos"], ...procedures.map((p) => [p.id, p.nome] as [string, string])]} />
            <Select value={statusFilter} onChange={setStatusFilter} label="Status" options={[["todos", "Todos os status"], ...Object.entries(APPOINTMENT_STATUS).map(([k, v]) => [k, v.label] as [string, string])]} />
          </div>
        </div>
      </Card>

      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-sm text-danger">Erro ao carregar agenda: {error}</p>}

      {!loading && !error && (
        <>
          {view === "dia" && <DayView date={anchor} appts={filtered} onOpen={setSelectedId} {...lookups} />}
          {view === "semana" && <WeekView anchor={anchor} appts={filtered} onOpen={setSelectedId} {...lookups} />}
          {view === "mes" && <MonthView anchor={anchor} appts={filtered} onPickDay={(d) => { setAnchor(d); setView("dia"); }} {...lookups} />}
        </>
      )}

      <AppointmentDetail
        appointment={selected}
        {...lookups}
        onClose={() => setSelectedId(null)}
        onStatusChange={async (id, status) => {
          const { error } = await updateStatus(id, status as AppointmentStatus);
          if (error) toast.warning("Erro ao atualizar status");
        }}
      />

      <NovoAgendamentoModal
        open={novoOpen}
        onClose={() => { setNovoOpen(false); params.delete("novo"); setParams(params, { replace: true }); }}
        patients={patients}
        professionals={professionals}
        procedures={procedures}
        rooms={rooms}
        createPatient={createPatient}
        createAppointment={create}
        onCreated={() => {
          setNovoOpen(false);
          toast.success("Agendamento criado");
        }}
      />
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

interface Lookups {
  patientMap: Map<string, { id: string; nome: string; telefone: string }>;
  professionalMap: Map<string, { id: string; nome: string }>;
  procedureMap: Map<string, { id: string; nome: string; duracao_min: number }>;
  roomMap: Map<string, { id: string; nome: string }>;
}

/* ---- Visão Dia ------------------------------------------------------- */
function DayView({ date, appts, onOpen, patientMap, professionalMap, procedureMap, roomMap }: { date: Date; appts: AppointmentView[]; onOpen: (id: string) => void } & Lookups) {
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
          const p = patientMap.get(a.pacienteId);
          const proc = procedureMap.get(a.procedimentoId);
          const pro = professionalMap.get(a.profissionalId);
          const room = roomMap.get(a.salaId);
          const meta = APPOINTMENT_STATUS[a.status];
          const dim = a.status === "cancelado" || a.status === "faltou";
          return (
            <button
              key={a.id}
              onClick={() => onOpen(a.id)}
              className={cn(
                "focusable flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-surface-2",
                dim && "opacity-55"
              )}
            >
              <div className="w-16 shrink-0">
                <p className="text-[13px] font-semibold tabular-nums text-ink">{time(a.inicio)}</p>
                <p className="text-[11px] text-faint">{time(a.fim)}</p>
              </div>
              <span className="h-10 w-1 shrink-0 rounded-full" style={{ background: colorForId(a.profissionalId) }} />
              <Avatar name={p?.nome ?? "?"} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-medium text-ink">{p?.nome ?? "Paciente removido"}</p>
                <p className="truncate text-[12px] text-muted">{proc?.nome} · {a.tipo}</p>
              </div>
              <div className="hidden text-right sm:block">
                <p className="text-[12px] font-medium text-ink">{pro?.nome}</p>
                <p className="text-[11px] text-faint">{room?.nome}</p>
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
function WeekView({ anchor, appts, onOpen, patientMap, professionalMap }: { anchor: Date; appts: AppointmentView[]; onOpen: (id: string) => void } & Lookups) {
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
                  const p = patientMap.get(a.pacienteId);
                  const meta = APPOINTMENT_STATUS[a.status];
                  const dim = a.status === "cancelado" || a.status === "faltou";
                  return (
                    <button
                      key={a.id}
                      onClick={() => onOpen(a.id)}
                      className={cn(
                        "focusable w-full rounded-lg border-l-[3px] bg-surface-2 px-2 py-1.5 text-left transition hover:bg-surface-3",
                        dim && "opacity-55 line-through"
                      )}
                      style={{ borderColor: colorForId(a.profissionalId) }}
                    >
                      <p className="text-[11px] font-semibold tabular-nums text-ink">{time(a.inicio)}</p>
                      <p className="truncate text-[11px] text-muted">{(p?.nome ?? "?").split(" ")[0]}</p>
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
function MonthView({ anchor, appts, onPickDay, patientMap }: { anchor: Date; appts: AppointmentView[]; onPickDay: (d: Date) => void } & Lookups) {
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
                {list.slice(0, 3).map((a) => (
                  <p key={a.id} className="flex items-center gap-1 truncate text-[10.5px] text-muted">
                    <span className="size-1.5 shrink-0 rounded-full" style={{ background: colorForId(a.profissionalId) }} />
                    {time(a.inicio)} {(patientMap.get(a.pacienteId)?.nome ?? "?").split(" ")[0]}
                  </p>
                ))}
                {list.length > 3 && <p className="text-[10.5px] font-medium text-primary-ink">+{list.length - 3}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

/* ---- Modal de novo agendamento ----------------------------------- */
function NovoAgendamentoModal({
  open,
  onClose,
  patients,
  professionals,
  procedures,
  rooms,
  createPatient,
  createAppointment,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  patients: { id: string; nome: string; telefone: string }[];
  professionals: { id: string; nome: string }[];
  procedures: { id: string; nome: string; duracao_min: number }[];
  rooms: { id: string; nome: string }[];
  createPatient: (input: { nome: string; telefone: string }) => Promise<{ data: { id: string } | null; error: string | null }>;
  createAppointment: (input: {
    inicio: string; fim: string; paciente_id: string; profissional_id: string;
    procedimento_id: string; sala_id: string; tipo: string; origem: string; observacao?: string;
  }) => Promise<{ error: string | null }>;
  onCreated: () => void;
}) {
  const NOVO_PACIENTE = "__novo__";
  const [pacienteId, setPacienteId] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novoTelefone, setNovoTelefone] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("09:00");
  const [procedimentoId, setProcedimentoId] = useState("");
  const [profissionalId, setProfissionalId] = useState("");
  const [salaId, setSalaId] = useState("");
  const [observacao, setObservacao] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function reset() {
    setPacienteId(""); setNovoNome(""); setNovoTelefone(""); setData(""); setHorario("09:00");
    setProcedimentoId(""); setProfissionalId(""); setSalaId(""); setObservacao(""); setFormError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!data || !horario) return setFormError("Escolha data e horário.");
    if (!procedimentoId) return setFormError("Escolha o procedimento.");
    if (!profissionalId) return setFormError("Escolha o profissional.");
    if (!salaId) return setFormError("Escolha a sala.");

    let finalPacienteId = pacienteId;
    setSubmitting(true);

    if (pacienteId === NOVO_PACIENTE) {
      if (!novoNome.trim() || !novoTelefone.trim()) {
        setSubmitting(false);
        return setFormError("Preencha nome e telefone do novo paciente.");
      }
      const { data: created, error } = await createPatient({ nome: novoNome.trim(), telefone: novoTelefone });
      if (error || !created) {
        setSubmitting(false);
        return setFormError("Erro ao cadastrar paciente: " + error);
      }
      finalPacienteId = created.id;
    }

    if (!finalPacienteId) {
      setSubmitting(false);
      return setFormError("Escolha o paciente.");
    }

    const proc = procedures.find((p) => p.id === procedimentoId)!;
    const inicio = new Date(`${data}T${horario}:00`);
    const fim = new Date(inicio.getTime() + proc.duracao_min * 60_000);

    const { error } = await createAppointment({
      inicio: inicio.toISOString(),
      fim: fim.toISOString(),
      paciente_id: finalPacienteId,
      profissional_id: profissionalId,
      procedimento_id: procedimentoId,
      sala_id: salaId,
      tipo: "Procedimento",
      origem: "Recepção",
      observacao: observacao || undefined,
    });

    setSubmitting(false);
    if (error) return setFormError(error);
    reset();
    onCreated();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo agendamento"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" type="submit" form="novo-agendamento-form" disabled={submitting}>
            {submitting ? "Agendando..." : "Agendar"}
          </Button>
        </>
      }
    >
      <form id="novo-agendamento-form" onSubmit={handleSubmit} className="space-y-4">
        {formError && <p className="text-[13px] text-danger">{formError}</p>}

        <FormRow label="Paciente">
          <select className="input" value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
            <option value="">Buscar paciente…</option>
            {patients.map((p) => (
              <option key={p.id} value={p.id}>{p.nome} · {p.telefone}</option>
            ))}
            <option value={NOVO_PACIENTE}>+ Cadastrar novo paciente</option>
          </select>
        </FormRow>

        {pacienteId === NOVO_PACIENTE && (
          <div className="grid grid-cols-2 gap-3">
            <FormRow label="Nome do paciente">
              <input className="input" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome completo" />
            </FormRow>
            <FormRow label="Celular">
              <input className="input" value={novoTelefone} onChange={(e) => setNovoTelefone(maskPhone(e.target.value))} placeholder="(00) 00000-0000" />
            </FormRow>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <FormRow label="Data">
            <input type="date" className="input" value={data} onChange={(e) => setData(e.target.value)} />
          </FormRow>
          <FormRow label="Horário">
            <input type="time" className="input" value={horario} onChange={(e) => setHorario(e.target.value)} />
          </FormRow>
        </div>

        <FormRow label="Procedimento">
          <select className="input" value={procedimentoId} onChange={(e) => setProcedimentoId(e.target.value)}>
            <option value="">Selecione…</option>
            {procedures.map((p) => (
              <option key={p.id} value={p.id}>{p.nome} — {p.duracao_min}min</option>
            ))}
          </select>
        </FormRow>

        <div className="grid grid-cols-2 gap-3">
          <FormRow label="Profissional">
            <select className="input" value={profissionalId} onChange={(e) => setProfissionalId(e.target.value)}>
              <option value="">Selecione…</option>
              {professionals.map((p) => (
                <option key={p.id} value={p.id}>{p.nome}</option>
              ))}
            </select>
          </FormRow>
          <FormRow label="Sala">
            <select className="input" value={salaId} onChange={(e) => setSalaId(e.target.value)}>
              <option value="">Selecione…</option>
              {rooms.map((r) => (
                <option key={r.id} value={r.id}>{r.nome}</option>
              ))}
            </select>
          </FormRow>
        </div>

        <FormRow label="Observações">
          <textarea rows={2} value={observacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Preparo, particularidades…" className="input resize-none" />
        </FormRow>

        <style>{`.input{width:100%;border:1px solid var(--color-line);border-radius:10px;padding:8px 10px;font-size:13px;background:#fff;color:var(--color-ink)}.input:focus{outline:2px solid var(--color-primary);outline-offset:1px}`}</style>
      </form>
    </Modal>
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
