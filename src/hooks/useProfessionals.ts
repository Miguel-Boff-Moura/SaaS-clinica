import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface Professional {
  id: string;
  nome: string;
  especialidade: string;
}

export function useProfessionals() {
  const [data, setData] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("professionals")
      .select("id, nome, especialidade")
      .order("nome");
    setError(error?.message ?? null);
    setData(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function create(input: { nome: string; especialidade: string }) {
    const { error } = await supabase.from("professionals").insert(input);
    if (error) return { error: error.message };
    await reload();
    return { error: null };
  }

  return { data, loading, error, create, reload };
}
