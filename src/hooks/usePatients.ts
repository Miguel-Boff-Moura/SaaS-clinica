import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface PatientRow {
  id: string;
  nome: string;
  telefone: string;
  email: string;
}

export function usePatients() {
  const [data, setData] = useState<PatientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("patients")
      .select("id, nome, telefone, email")
      .order("nome");
    setError(error?.message ?? null);
    setData(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function create(input: { nome: string; telefone: string; email?: string }) {
    const { data, error } = await supabase.from("patients").insert(input).select("id, nome, telefone, email").single();
    if (error) return { data: null, error: error.message };
    await reload();
    return { data, error: null };
  }

  return { data, loading, error, create, reload };
}
