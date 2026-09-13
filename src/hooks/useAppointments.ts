import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type AppointmentStatus =
  | "confirmado"
  | "aguardando"
  | "em_atendimento"
  | "concluido"
  | "cancelado"
  | "faltou";

export interface AppointmentRow {
  id: string;
  inicio: string;
  fim: string;
  paciente_id: string;
  profissional_id: string;
  procedimento_id: string;
  sala_id: string;
  status: AppointmentStatus;
  tipo: string;
  origem: string;
  observacao: string | null;
  data_retorno: string | null;
  data_manutencao: string | null;
}

export interface NewAppointmentInput {
  inicio: string;
  fim: string;
  paciente_id: string;
  profissional_id: string;
  procedimento_id: string;
  sala_id: string;
  tipo: string;
  origem: string;
  observacao?: string;
}

export function useAppointments() {
  const [data, setData] = useState<AppointmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("appointments")
      .select("id, inicio, fim, paciente_id, profissional_id, procedimento_id, sala_id, status, tipo, origem, observacao, data_retorno, data_manutencao")
      .order("inicio");
    setError(error?.message ?? null);
    setData(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function create(input: NewAppointmentInput) {
    const { error } = await supabase.from("appointments").insert(input);
    if (error) {
      const conflito = error.code === "23P01"; // exclusion constraint violation
      return { error: conflito ? "Horário indisponível — já existe agendamento nesse período." : error.message };
    }
    await reload();
    return { error: null };
  }

  async function updateStatus(id: string, status: AppointmentStatus) {
    const { error } = await supabase.from("appointments").update({ status }).eq("id", id);
    if (error) return { error: error.message };
    await reload();
    return { error: null };
  }

  async function updateReturnDates(id: string, input: { data_retorno: string | null; data_manutencao: string | null }) {
    const { error } = await supabase.from("appointments").update(input).eq("id", id);
    if (error) return { error: error.message };
    await reload();
    return { error: null };
  }

  return { data, loading, error, create, updateStatus, updateReturnDates, reload };
}
