import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { PageHeader, EmptyState, SkeletonRows } from "@/components/ui/Misc";
import { Card, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Segmented } from "@/components/ui/Tabs";
import { Badge, APPOINTMENT_STATUS } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { AppointmentDetail, type AppointmentView } from "@/components/AppointmentDetail";
import { DayView, WeekView, MonthView, type CalendarLookups } from "@/components/CalendarViews";
import { useAppointments, type AppointmentStatus } from "@/hooks/useAppointments";
import { usePatients } from "@/hooks/usePatients";
import { useProfessionals } from "@/hooks/useProfessionals";
import { useProcedures } from "@/hooks/useProcedures";
import { useRooms } from "@/hooks/useRooms";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { maskPhone } from "@/lib/masks";
import { colorForId } from "@/lib/color";
import { returnStatus, daysUntil, type ReturnStatus } from "@/lib/returns";
import { RETURN_STATUS } from "@/components/ui/Badge";
import { ReturnRing } from "@/components/ui/Misc";
import { addDays, sameDay, startOfWeek, time, longDate, shortDate } from "@/lib/format";
import { cn } from "@/lib/cn";

type ViewMode = "dia" | "semana" | "mes";
// Data real de hoje — diferente de NOW (@/lib/format), que é uma data fixa
// usada só pelo restante do protótipo (ainda mockado) pra combinar com os
// dados de exemplo. Agenda já é dado real, precisa da data real.
const NOW = new Date();

export function Agenda() {
  const toast = useToast();
  const { profile } = useAuth();
  const isAdmin = profile?.role === "admin";
  const [params, setParams] = useSearchParams();
  const [view, setView] = useState<ViewMode>("dia");
  const [anchor, setAnchor] = useState<Date>(NOW);
  const [proFilter, setProFilter] = useState("todos");
  const [roomFilter, setRoomFilter] = useState("todos");
  const [procFilter, setProcFilter] = useState("todos");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [novoOpen, setNovoOpen] = useState(params.get("novo") === "1");
  const [remarcarAlvo, setRemarcarAlvo] = useState<AppointmentView | null>(null);

  const { data: appointmentsRaw, loading, error, create, updateStatus, updateReturnDates, reload: reloadAppointments } = useAppointments();
  const { data: patients, loading: loadingPatients, create: createPatient } = usePatients();
  const { data: professionals } = useProfessionals();
  const { data: procedures } = useProcedures();
  const { data: rooms } = useRooms();

  // paciente: RLS já restringe patients/appointments ao próprio cadastro
  const myPatient = !isAdmin ? patients[0] : undefined;
  const needsProfileCompletion = !isAdmin && !loadingPatients && patients.length === 0;

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
        dataRetorno: a.data_retorno,
        dataManutencao: a.data_manutencao,
        valor: a.valor,
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

  if (needsProfileCompletion) {
    return (
      <div className="fade-in mx-auto max-w-md">
        <PageHeader title="Agenda" subtitle="Finalize seu cadastro pra continuar" />
        <CompleteProfileForm
          defaultNome={profile?.full_name ?? ""}
          onSave={async (input) => {
            const { error } = await createPatient({ ...input, profile_id: profile!.id });
            if (error) { toast.warning(error); return; }
            toast.success("Cadastro concluído");
          }}
        />
      </div>
    );
  }

  return (
    <div className="fade-in">
      <PageHeader
        title="Agenda"
        subtitle={isAdmin ? "Multiprofissional, por sala, procedimento e status" : "Seus agendamentos"}
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
            <button onClick={() => setAnchor(NOW)} className="focusable rounded-lg border border-line px-3 py-1.5 text-[13px] font-medium hover:bg-surface-2">
              Hoje
            </button>
            <button onClick={() => step(1)} className="focusable flex size-8 items-center justify-center rounded-lg border border-line hover:bg-surface-2">
              <ChevronRight size={16} />
            </button>
          </div>
          <p className="text-sm font-semibold capitalize text-ink">{rangeLabel}</p>

          {isAdmin && (
            <div className="ml-auto flex flex-wrap items-center gap-2">
              <Select value={proFilter} onChange={setProFilter} label="Profissional" options={[["todos", "Todos os profissionais"], ...professionals.map((p) => [p.id, p.nome] as [string, string])]} />
              <Select value={roomFilter} onChange={setRoomFilter} label="Sala" options={[["todos", "Todas as salas"], ...rooms.map((r) => [r.id, r.nome] as [string, string])]} />
              <Select value={procFilter} onChange={setProcFilter} label="Procedimento" options={[["todos", "Todos os procedimentos"], ...procedures.map((p) => [p.id, p.nome] as [string, string])]} />
              <Select value={statusFilter} onChange={setStatusFilter} label="Status" options={[["todos", "Todos os status"], ...Object.entries(APPOINTMENT_STATUS).map(([k, v]) => [k, v.label] as [string, string])]} />
            </div>
          )}
        </div>
      </Card>

      {loading && <SkeletonRows rows={5} />}
      {!loading && error && <p className="text-sm text-danger">Erro ao carregar agenda: {error}</p>}

      {!loading && !error && (
        <>
          {view === "dia" && <DayView date={anchor} appts={filtered} onOpen={setSelectedId} {...lookups} />}
          {view === "semana" && <WeekView anchor={anchor} now={NOW} appts={filtered} onOpen={setSelectedId} {...lookups} />}
          {view === "mes" && <MonthView anchor={anchor} now={NOW} appts={filtered} onPickDay={(d) => { setAnchor(d); setView("dia"); }} {...lookups} />}
        </>
      )}

      <AppointmentDetail
        appointment={selected}
        patientView={!isAdmin}
        {...lookups}
        onClose={() => setSelectedId(null)}
        onStatusChange={isAdmin ? async (id, status) => {
          const { error } = await updateStatus(id, status as AppointmentStatus);
          if (error) toast.warning("Erro ao atualizar status");
        } : undefined}
        onReturnDatesChange={isAdmin ? async (id, input) => {
          const { error } = await updateReturnDates(id, input);
          if (error) toast.warning("Erro ao salvar datas");
        } : undefined}
        onRequestRemarcar={!isAdmin ? (a) => { setSelectedId(null); setRemarcarAlvo(a); } : undefined}
      />

      {isAdmin && <ReturnsPanel appointments={appointments} patientMap={patientMap} onOpen={setSelectedId} />}

      <NovoAgendamentoModal
        open={novoOpen}
        onClose={() => { setNovoOpen(false); params.delete("novo"); setParams(params, { replace: true }); }}
        patients={patients}
        lockedPatient={myPatient}
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

      {!isAdmin && (
        <RemarcarModal
          appointment={remarcarAlvo}
          onClose={() => setRemarcarAlvo(null)}
          onSave={async (novoInicioISO) => {
            const { error } = await supabase.rpc("reagendar_meu_atendimento", {
              p_appointment_id: remarcarAlvo!.id,
              p_novo_inicio: novoInicioISO,
            });
            if (error) { toast.warning(error.message); return; }
            await reloadAppointments();
            setRemarcarAlvo(null);
            toast.success("Agendamento remarcado");
          }}
        />
      )}
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

/* ---- Modal de novo agendamento ----------------------------------- */
function NovoAgendamentoModal({
  open,
  onClose,
  patients,
  lockedPatient,
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
  lockedPatient?: { id: string; nome: string; telefone: string };
  professionals: { id: string; nome: string }[];
  procedures: { id: string; nome: string; duracao_min: number; preco: number }[];
  rooms: { id: string; nome: string }[];
  createPatient: (input: { nome: string; telefone: string }) => Promise<{ data: { id: string } | null; error: string | null }>;
  createAppointment: (input: {
    inicio: string; fim: string; paciente_id: string; profissional_id: string;
    procedimento_id: string; sala_id: string; tipo: string; origem: string; observacao?: string; valor: number;
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

    let finalPacienteId = lockedPatient?.id ?? pacienteId;
    setSubmitting(true);

    if (!lockedPatient && pacienteId === NOVO_PACIENTE) {
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
      origem: lockedPatient ? "Agendamento online" : "Recepção",
      observacao: observacao || undefined,
      valor: proc.preco,
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

        {!lockedPatient && (
          <FormRow label="Paciente">
            <select className="input" value={pacienteId} onChange={(e) => setPacienteId(e.target.value)}>
              <option value="">Buscar paciente…</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.nome} · {p.telefone}</option>
              ))}
              <option value={NOVO_PACIENTE}>+ Cadastrar novo paciente</option>
            </select>
          </FormRow>
        )}

        {!lockedPatient && pacienteId === NOVO_PACIENTE && (
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

/* ---- Painel de retornos e manutenções a vencer -------------------- */
function ReturnsPanel({
  appointments,
  patientMap,
  onOpen,
}: {
  appointments: AppointmentView[];
  patientMap: CalendarLookups["patientMap"];
  onOpen: (id: string) => void;
}) {
  const rows = useMemo(() => {
    const out: { id: string; patientNome: string; label: string; dateStr: string; status: ReturnStatus; dias: number }[] = [];
    for (const a of appointments) {
      // só faz sentido cobrar retorno de um atendimento que já aconteceu
      if (a.status !== "concluido") continue;
      const nome = patientMap.get(a.pacienteId)?.nome ?? "Paciente removido";
      if (a.dataRetorno) {
        out.push({ id: a.id, patientNome: nome, label: "Retorno", dateStr: a.dataRetorno, status: returnStatus(a.dataRetorno, NOW), dias: daysUntil(a.dataRetorno, NOW) });
      }
      if (a.dataManutencao) {
        out.push({ id: a.id, patientNome: nome, label: "Manutenção", dateStr: a.dataManutencao, status: returnStatus(a.dataManutencao, NOW), dias: daysUntil(a.dataManutencao, NOW) });
      }
    }
    return out.filter((r) => r.status !== "em_dia").sort((a, b) => a.dias - b.dias);
  }, [appointments, patientMap]);

  if (rows.length === 0) return null;

  return (
    <Card className="mt-4">
      <div className="p-5">
        <CardHeader title="Retornos e manutenções a vencer" subtitle="Preenchidos manualmente no atendimento" />
        <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map((r, i) => {
            const meta = RETURN_STATUS[r.status];
            const progresso = r.status === "vencido" ? 1 : Math.max(0, Math.min(1, 1 - r.dias / 30));
            return (
              <li key={`${r.id}-${r.label}-${i}`}>
                <button
                  onClick={() => onOpen(r.id)}
                  className="focusable flex w-full items-center gap-3 rounded-xl p-1.5 text-left hover:bg-surface-2"
                >
                  <ReturnRing progress={progresso} status={r.status} size={42} stroke={4} label={r.dias < 0 ? "!" : `${r.dias}d`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-ink">{r.patientNome}</p>
                    <p className="truncate text-[11px] text-muted">{r.label}</p>
                  </div>
                  <Badge tone={meta.tone} size="sm">{meta.label}</Badge>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </Card>
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

/* ---- Remarcar (paciente) ------------------------------------------ */
function RemarcarModal({
  appointment,
  onClose,
  onSave,
}: {
  appointment: AppointmentView | null;
  onClose: () => void;
  onSave: (novoInicioISO: string) => Promise<void>;
}) {
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit() {
    setFormError(null);
    if (!data || !horario) return setFormError("Escolha data e horário.");
    const novoInicio = new Date(`${data}T${horario}:00`);
    if (novoInicio.getTime() < Date.now()) return setFormError("Escolha uma data futura.");

    setSubmitting(true);
    await onSave(novoInicio.toISOString());
    setSubmitting(false);
  }

  return (
    <Modal
      open={!!appointment}
      onClose={onClose}
      title="Remarcar agendamento"
      footer={
        <>
          <Button variant="secondary" size="sm" onClick={onClose}>Cancelar</Button>
          <Button size="sm" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Enviando..." : "Confirmar nova data"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {formError && <p className="text-[13px] text-danger">{formError}</p>}
        <label className="text-[12px] font-medium text-muted">
          Nova data
          <input type="date" value={data} onChange={(e) => setData(e.target.value)} className="mt-1 w-full rounded-[10px] border border-line px-3 py-2 text-[13px]" />
        </label>
        <label className="text-[12px] font-medium text-muted">
          Novo horário
          <input type="time" value={horario} onChange={(e) => setHorario(e.target.value)} className="mt-1 w-full rounded-[10px] border border-line px-3 py-2 text-[13px]" />
        </label>
      </div>
    </Modal>
  );
}

/* ---- Completar cadastro (primeiro acesso do paciente) -------------- */
function CompleteProfileForm({
  defaultNome,
  onSave,
}: {
  defaultNome: string;
  onSave: (input: { nome: string; telefone: string }) => Promise<void>;
}) {
  const [nome, setNome] = useState(defaultNome);
  const [telefone, setTelefone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await onSave({ nome, telefone });
    setSubmitting(false);
  }

  return (
    <Card className="mt-4">
      <div className="p-5">
        <p className="mb-4 text-[13px] text-muted">Confirma teu nome e celular pra gente te encontrar na agenda da clínica.</p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="text-[12px] font-medium text-muted">
            Nome completo
            <input required value={nome} onChange={(e) => setNome(e.target.value)} className="mt-1 w-full rounded-[10px] border border-line px-3 py-2 text-[13px]" />
          </label>
          <label className="text-[12px] font-medium text-muted">
            Celular
            <input required value={telefone} onChange={(e) => setTelefone(maskPhone(e.target.value))} placeholder="(00) 00000-0000" className="mt-1 w-full rounded-[10px] border border-line px-3 py-2 text-[13px]" />
          </label>
          <Button type="submit" disabled={submitting}>{submitting ? "Salvando..." : "Concluir cadastro"}</Button>
        </form>
      </div>
    </Card>
  );
}
