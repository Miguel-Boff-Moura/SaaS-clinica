import type { Appointment } from "@/types";
import { TODAY, addDays, addMinutes } from "@/lib/format";
import { procedureById } from "./catalog";

function at(dayOffset: number, hhmm: string): Date {
  const [h, m] = hhmm.split(":").map(Number);
  const d = addDays(TODAY, dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
}

type Seed = {
  d: number;
  hhmm: string;
  pacienteId: string;
  profissionalId: string;
  procedimentoId: string;
  status: Appointment["status"];
  tipo: Appointment["tipo"];
  origem: Appointment["origem"];
  obs?: string;
};

const SEEDS: Seed[] = [
  // ---- HOJE (d = 0) --------------------------------------------------------
  { d: 0, hhmm: "08:30", pacienteId: "p4", profissionalId: "pro3", procedimentoId: "pc4", status: "concluido", tipo: "Retorno", origem: "Recepção" },
  { d: 0, hhmm: "09:00", pacienteId: "p1", profissionalId: "pro1", procedimentoId: "pc6", status: "em_atendimento", tipo: "Retorno", origem: "WhatsApp", obs: "Retorno de preenchimento + retoque se necessário" },
  { d: 0, hhmm: "09:40", pacienteId: "p2", profissionalId: "pro3", procedimentoId: "pc3", status: "aguardando", tipo: "Sessão de pacote", origem: "Agendamento online" },
  { d: 0, hhmm: "10:30", pacienteId: "p7", profissionalId: "pro3", procedimentoId: "pc10", status: "confirmado", tipo: "Procedimento", origem: "Recepção" },
  { d: 0, hhmm: "11:30", pacienteId: "p8", profissionalId: "pro1", procedimentoId: "pc2", status: "confirmado", tipo: "Avaliação", origem: "WhatsApp", obs: "Lead — primeira avaliação, orçamento de toxina já enviado" },
  { d: 0, hhmm: "14:00", pacienteId: "p3", profissionalId: "pro1", procedimentoId: "pc1", status: "confirmado", tipo: "Consulta", origem: "Telefone" },
  { d: 0, hhmm: "15:00", pacienteId: "p6", profissionalId: "pro2", procedimentoId: "pc9", status: "cancelado", tipo: "Sessão de pacote", origem: "Agendamento online" },
  { d: 0, hhmm: "16:00", pacienteId: "p5", profissionalId: "pro1", procedimentoId: "pc5", status: "faltou", tipo: "Retorno", origem: "Recepção" },
  { d: 0, hhmm: "16:40", pacienteId: "p2", profissionalId: "pro1", procedimentoId: "pc1", status: "confirmado", tipo: "Consulta", origem: "Recepção" },

  // ---- AMANHÃ e semana --------------------------------------------------
  { d: 2, hhmm: "09:00", pacienteId: "p7", profissionalId: "pro3", procedimentoId: "pc4", status: "confirmado", tipo: "Sessão de pacote", origem: "Agendamento online" },
  { d: 2, hhmm: "10:00", pacienteId: "p1", profissionalId: "pro1", procedimentoId: "pc5", status: "confirmado", tipo: "Procedimento", origem: "WhatsApp" },
  { d: 2, hhmm: "14:30", pacienteId: "p3", profissionalId: "pro1", procedimentoId: "pc7", status: "aguardando", tipo: "Retorno", origem: "Recepção", obs: "2ª sessão de bioestimulador" },
  { d: 3, hhmm: "11:00", pacienteId: "p2", profissionalId: "pro3", procedimentoId: "pc3", status: "confirmado", tipo: "Sessão de pacote", origem: "Agendamento online" },
  { d: 3, hhmm: "15:30", pacienteId: "p8", profissionalId: "pro1", procedimentoId: "pc5", status: "confirmado", tipo: "Procedimento", origem: "WhatsApp", obs: "Conversão do lead — 1ª aplicação" },
  { d: 4, hhmm: "09:30", pacienteId: "p4", profissionalId: "pro3", procedimentoId: "pc4", status: "confirmado", tipo: "Retorno", origem: "Recepção" },
  { d: 5, hhmm: "10:00", pacienteId: "p6", profissionalId: "pro2", procedimentoId: "pc9", status: "confirmado", tipo: "Sessão de pacote", origem: "Agendamento online" },
  { d: 5, hhmm: "16:00", pacienteId: "p1", profissionalId: "pro1", procedimentoId: "pc1", status: "confirmado", tipo: "Consulta", origem: "Recepção" },

  // ---- semana anterior (histórico / mês) ------------------------------
  { d: -2, hhmm: "10:00", pacienteId: "p2", profissionalId: "pro3", procedimentoId: "pc3", status: "concluido", tipo: "Sessão de pacote", origem: "Agendamento online" },
  { d: -3, hhmm: "14:00", pacienteId: "p3", profissionalId: "pro1", procedimentoId: "pc7", status: "concluido", tipo: "Procedimento", origem: "Recepção" },
  { d: -6, hhmm: "09:00", pacienteId: "p4", profissionalId: "pro3", procedimentoId: "pc4", status: "concluido", tipo: "Procedimento", origem: "WhatsApp" },
  { d: -8, hhmm: "11:00", pacienteId: "p7", profissionalId: "pro3", procedimentoId: "pc4", status: "concluido", tipo: "Sessão de pacote", origem: "Recepção" },
  { d: 9, hhmm: "10:30", pacienteId: "p7", profissionalId: "pro3", procedimentoId: "pc4", status: "confirmado", tipo: "Sessão de pacote", origem: "Agendamento online" },
  { d: 12, hhmm: "14:00", pacienteId: "p1", profissionalId: "pro1", procedimentoId: "pc10", status: "confirmado", tipo: "Sessão de pacote", origem: "WhatsApp" },
];

let n = 0;
export const APPOINTMENTS: Appointment[] = SEEDS.map((s) => {
  const proc = procedureById(s.procedimentoId)!;
  const inicio = at(s.d, s.hhmm);
  return {
    id: `ap${++n}`,
    inicio,
    fim: addMinutes(inicio, proc.duracaoMin),
    pacienteId: s.pacienteId,
    profissionalId: s.profissionalId,
    procedimentoId: s.procedimentoId,
    salaId: proc.salaId,
    status: s.status,
    tipo: s.tipo,
    origem: s.origem,
    observacao: s.obs,
  };
});

export function appointmentById(id: string): Appointment | undefined {
  return APPOINTMENTS.find((a) => a.id === id);
}
