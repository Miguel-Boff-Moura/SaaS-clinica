import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface RoomRow {
  id: string;
  nome: string;
  tipo: string;
}

export function useRooms() {
  const [data, setData] = useState<RoomRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase.from("rooms").select("id, nome, tipo").order("nome");
    setError(error?.message ?? null);
    setData(data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, loading, error, reload };
}
