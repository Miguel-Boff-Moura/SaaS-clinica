import {
  CalendarClock,
  CheckCircle2,
  DoorOpen,
  MessageCircle,
  Play,
  XCircle,
} from "lucide-react";
import { SlideOver } from "@/components/ui/SlideOver";
import { Badge, APPOINTMENT_STATUS } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Field } from "@/components/ui/Misc";
import { useToast } from "@/components/ui/Toast";
import { time, fullDate } from "@/lib/format";
import type { AppointmentStatus } from "@/hooks/useAppointments";

export interface AppointmentView {
  id: string;
  inicio: Date;
  fim: Date;
  pacienteId: string;
  profissionalId: string;
  procedimentoId: string;
  salaId: string;
  status: AppointmentStatus;
  tipo: string;
  origem: string;
  observacao?: string;
}

interface Lookups {
  patientMap: Map<string, { id: string; nome: string; telefone: string }>;
  professionalMap: Map<string, { id: string; nome: string }>;
  procedureMap: Map<string, { id: string; nome: string; duracao_min: number }>;
  roomMap: Map<string, { id: string; nome: string }>;
}

export function AppointmentDetail({
  appointment,
  onClose,
  onStatusChange,
  patientMap,
  professionalMap,
  procedureMap,
  roomMap,
}: {
  appointment: AppointmentView | null;
  onClose: () => void;
  onStatusChange?: (id: string, status: AppointmentStatus) => void;
} & Lookups) {
  const toast = useToast();
  const open = !!appointment;

  const patient = appointment ? patientMap.get(appointment.pacienteId) : undefined;
  const proc = appointment ? procedureMap.get(appointment.procedimentoId) : undefined;
  const pro = appointment ? professionalMap.get(appointment.profissionalId) : undefined;
  const room = appointment ? roomMap.get(appointment.salaId) : undefined;
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
            <Button size="sm" onClick={() => onStatusChange?.(appointment.id, "em_atendimento")}>
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
            <Field label="Duração">{proc?.duracao_min} min</Field>
            <Field label="Origem">{appointment.origem}</Field>
          </div>

          {appointment.observacao && (
            <div className="rounded-xl border border-line bg-surface-2/60 p-3.5 text-[13px] text-muted">
              {appointment.observacao}
            </div>
          )}
        </div>
      )}
    </SlideOver>
  );
}
