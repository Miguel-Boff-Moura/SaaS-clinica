import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface StockItem {
  id: string;
  nome: string;
  categoria: string;
  unidade: string;
  quantidade: number;
  estoque_minimo: number;
  validade: string | null;
}

export interface StockMovement {
  id: string;
  item_id: string;
  tipo: "entrada" | "saida";
  quantidade: number;
  motivo: string;
  created_at: string;
}

export function useStock() {
  const [items, setItems] = useState<StockItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    const [itemsRes, movementsRes] = await Promise.all([
      supabase.from("stock_items").select("id, nome, categoria, unidade, quantidade, estoque_minimo, validade").order("nome"),
      supabase.from("stock_movements").select("id, item_id, tipo, quantidade, motivo, created_at").order("created_at", { ascending: false }).limit(20),
    ]);
    setError(itemsRes.error?.message ?? movementsRes.error?.message ?? null);
    setItems(itemsRes.data ?? []);
    setMovements(movementsRes.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createItem(input: { nome: string; categoria: string; unidade: string; estoque_minimo: number; validade?: string }) {
    const { error } = await supabase.from("stock_items").insert(input);
    if (error) return { error: error.message };
    await reload();
    return { error: null };
  }

  async function registerMovement(input: { item_id: string; tipo: "entrada" | "saida"; quantidade: number; motivo: string }) {
    const { error } = await supabase.from("stock_movements").insert(input);
    if (error) {
      const negativo = error.code === "P0001"; // raise exception (estoque negativo)
      return { error: negativo ? "Saída maior que o estoque disponível." : error.message };
    }
    await reload();
    return { error: null };
  }

  return { items, movements, loading, error, createItem, registerMovement };
}
