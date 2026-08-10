import { useState, useCallback } from "react";
import { FunctionsHttpError } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";
import type { Machine, Pricing, Recommendation } from "../types";

export function useOptimization() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runOptimization = useCallback(
    async (machines: Machine[], pricing: Pricing[]) => {
      try {
        setLoading(true);
        setError(null);
        setRecommendations([]);

        // Send machines and pricing (without sensitive IDs / created_at) to the edge function
        const machinesPayload = machines.map((m) => ({
          id: m.id,
          name: m.name,
          power_kw: m.power_kw,
          start_hour: m.start_hour,
          end_hour: m.end_hour,
          is_flexible: m.is_flexible,
        }));

        const pricingPayload = pricing.map((p) => ({
          id: p.id,
          type: p.type,
          start_hour: p.start_hour,
          end_hour: p.end_hour,
          rate_per_kwh: p.rate_per_kwh,
        }));

        const { data, error: fnError } = await supabase.functions.invoke(
          "analyze-optimization",
          {
            body: {
              machines: machinesPayload,
              pricing: pricingPayload,
            },
          },
        );

        if (fnError) {
          if (fnError instanceof FunctionsHttpError) {
            const errBody = await fnError.context.json();
            throw new Error(
              errBody?.error ?? "Edge Function returned an error.",
            );
          }
          throw fnError;
        }

        const result = data as { recommendations: Recommendation[] };
        if (!result?.recommendations || !Array.isArray(result.recommendations)) {
          throw new Error("Invalid response from optimization engine");
        }

        setRecommendations(result.recommendations);
      } catch (e) {
        setError(
          e instanceof Error
            ? e.message
            : "Something went wrong. Please try again.",
        );
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const clearResults = useCallback(() => {
    setRecommendations([]);
    setError(null);
  }, []);

  return { recommendations, loading, error, runOptimization, clearResults };
}
