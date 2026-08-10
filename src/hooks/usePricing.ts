import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Pricing } from "../types";

export function usePricing() {
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPricing = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("pricing")
        .select("*")
        .order("id", { ascending: true });
      if (err) throw err;
      setPricing(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load pricing");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPricing();
  }, [fetchPricing]);

  const updatePricing = useCallback(
    async (id: number, rate_per_kwh: number, start_hour: number, end_hour: number) => {
      const { error: err } = await supabase
        .from("pricing")
        .update({ rate_per_kwh, start_hour, end_hour } as unknown as Record<string, unknown>)
        .eq("id", id);
      if (err) throw err;
      setPricing((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, rate_per_kwh, start_hour, end_hour } : p,
        ),
      );
    },
    [],
  );

  return { pricing, loading, error, refetch: fetchPricing, updatePricing };
}
