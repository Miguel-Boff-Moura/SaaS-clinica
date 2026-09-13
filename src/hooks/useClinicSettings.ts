import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface ClinicSettings {
  nome: string;
  cnpj: string;
  responsavel: string;
  telefone: string;
  email: string;
}

export function useClinicSettings() {
  const [data, setData] = useState<ClinicSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clinic_settings")
      .select("nome, cnpj, responsavel, telefone, email")
      .eq("id", true)
      .single();
    setError(error?.message ?? null);
    setData(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function update(input: ClinicSettings) {
    const { error } = await supabase.from("clinic_settings").update(input).eq("id", true);
    if (error) return { error: error.message };
    await reload();
    return { error: null };
  }

  return { data, loading, error, update };
}
