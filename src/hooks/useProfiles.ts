import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface ProfileRow {
  id: string;
  full_name: string;
  role: "admin" | "paciente";
}

export function useProfiles() {
  const [data, setData] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("profiles").select("id, full_name, role").order("full_name");
    setError(error?.message ?? null);
    setData(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
