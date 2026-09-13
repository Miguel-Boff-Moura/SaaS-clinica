import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface PendenciaBaixa {
  id: string;
  valor: number;
  data: string;
  comprovante: string | null;
}

export interface PendenciaRow {
  id: string;
  paciente_id: string;
  descricao: string;
  valor_total: number;
  valor_pago: number;
  data_vencimento: string;
}

export function usePendencias() {
  const [data, setData] = useState<PendenciaRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pendencias")
      .select("id, paciente_id, descricao, valor_total, valor_pago, data_vencimento")
      .order("data_vencimento");
    setError(error?.message ?? null);
    setData(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function create(input: { paciente_id: string; descricao: string; valor_total: number; data_vencimento: string }) {
    const { error } = await supabase.from("pendencias").insert(input);
    if (error) return { error: error.message };
    await reload();
    return { error: null };
  }

  async function addBaixa(pendencia_id: string, input: { valor: number; data: string; comprovante?: string }) {
    const { error } = await supabase.from("pendencia_baixas").insert({ pendencia_id, ...input });
    if (error) return { error: error.message };
    await reload();
    return { error: null };
  }

  async function listBaixas(pendencia_id: string): Promise<PendenciaBaixa[]> {
    const { data } = await supabase
      .from("pendencia_baixas")
      .select("id, valor, data, comprovante")
      .eq("pendencia_id", pendencia_id)
      .order("data", { ascending: false });
    return data ?? [];
  }

  return { data, loading, error, create, addBaixa, listBaixas, reload };
}
