import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface ProcedureRow {
  id: string;
  nome: string;
  categoria: string;
  duracao_min: number;
  preco: number;
}

export function useProcedures() {
  const [data, setData] = useState<ProcedureRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("procedures")
      .select("id, nome, categoria, duracao_min, preco")
      .order("nome");
    setError(error?.message ?? null);
    setData(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function create(input: { nome: string; categoria: string; duracao_min: number; preco: number }) {
    const { error } = await supabase.from("procedures").insert(input);
    if (error) return { error: error.message };
    await reload();
    return { error: null };
  }

  return { data, loading, error, create, reload };
}
