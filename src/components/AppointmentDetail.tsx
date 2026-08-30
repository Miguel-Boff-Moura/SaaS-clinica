import { useNavigate } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  DoorOpen,
  MessageCircle,
  Play,
  UserRound,
  XCircle,
} from "lucide-react";
import type { Appointment } from "@/types";
import { SlideOver } from "@/components/ui/SlideOver";
import { Badge, APPOINTMENT_STATUS } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Field } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { patientById, procedureById, professionalById, roomById } from "@/data";
import { time, fullDate } from "@/lib/format";

export function AppointmentDetail({
  appointment,
  onClose,
  onStatusChange,
}: {
  appointment: Appointment | null;
  onClose: () => void;
  onStatusChange?: (id: string, status: Appointment["status"]) => void;
}) {
  const navigate = useNavigate();
  const toast = useToast();
  const open = !!appointment;

  const patient = appointment ? patientById(appointment.pacienteId) : undefined;
  const proc = appointment ? procedureById(appointment.procedimentoId) : undefined;
  const pro = appointment ? professionalById(appointment.profissionalId) : undefined;
  const room = appointment ? roomById(appointment.salaId) : undefined;
  const meta = appointment ? APPOINTMENT_STATUS[appointment.status] : undefined;

  return (
    <SlideOver
      open={open}
      onClose={onClose}
      title={patient?.nome ?? "Agendamento"}
      subtitle={appointment ? `${fullDate(appointment.inicio)} · ${time(appointment.inicio)}–${time(appointment.fim)}` : undefined}
      footer={
        appointment && (
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={() => {
                onStatusChange?.(appointment.id, "em_atendimento");
                navigate(`/atendimentos/${appointment.id}`);
              }}
            >
              <Play size={14} /> Iniciar atendimento
            </Button>
            <Button size="sm" variant="secondary" onClick={() => { onStatusChange?.(appointment.id, "confirmado"); toast.success("Agendamento confirmado"); }}>
              <CheckCircle2 size={14} /> Confirmar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => toast.info("Remarcar", "Selecione novo horário na agenda.")}>
              <CalendarClock size={14} /> Remarcar
            </Button>
            <Button size="sm" variant="secondary" onClick={() => toast.success("WhatsApp enviado", `Mensagem de confirmação para ${patient?.nome}.`)}>
              <MessageCircle size={14} /> WhatsApp
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { onStatusChange?.(appointment.id, "cancelado"); toast.warning("Agendamento cancelado"); }}>
              <XCircle size={14} /> Cancelar
            </Button>
          </div>
        )
      }
    >
      {appointment && patient && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <Avatar name={patient.nome} size="md" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{patient.nome}</p>
              <p className="text-[13px] text-muted">{patient.telefone}</p>
            </div>
            {meta && <Badge tone={meta.tone} className="ml-auto">{meta.label}</Badge>}
          </div>

          <div className="grid grid-cols-2 gap-4 rounded-xl border border-line bg-white p-4">
            <Field label="Procedimento">{proc?.nome}</Field>
            <Field label="Tipo">{appointment.tipo}</Field>
            <Field label="Profissional">{pro?.nome}</Field>
            <Field label="Sala">
              <span className="inline-flex items-center gap-1.5">
                <DoorOpen size={14} className="text-faint" />
                {room?.nome}
              </span>
            </Field>
            <Field label="Duração">{proc?.duracaoMin} min</Field>
            <Field label="Origem">{appointment.origem}</Field>
          </div>

          {appointment.observacao && (
            <div className="rounded-xl border border-line bg-surface-2/60 p-3.5 text-[13px] text-muted">
              {appointment.observacao}
            </div>
          )}

          <button
            onClick={() => navigate(`/pacientes/${patient.id}`)}
            className="focusable flex w-full items-center justify-between rounded-xl border border-line bg-white px-4 py-3 text-left hover:bg-surface-2"
          >
            <span className="flex items-center gap-2 text-[13px] font-medium text-ink">
              <UserRound size={15} className="text-primary" /> Abrir ficha completa do paciente
            </span>
            <span className="text-[13px] text-faint">R$ {patient.valorGasto.toLocaleString("pt-BR")} · {patient.procedimentos.length} atend.</span>
          </button>
        </div>
      )}
    </SlideOver>
  );
}
