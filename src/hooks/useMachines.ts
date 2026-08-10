import { useState, useEffect, useCallback } from "react";
import { supabase } from "../lib/supabase";
import type { Machine, MachineInput } from "../types";

export function useMachines() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMachines = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("machines")
        .select("*")
        .order("created_at", { ascending: true });
      if (err) throw err;
      setMachines(data ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load machines");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  const addMachine = useCallback(
    async (input: MachineInput) => {
      const { data, error: err } = await supabase
        .from("machines")
        .insert(input as unknown as Record<string, unknown>)
        .select()
        .single();
      if (err) throw err;
      setMachines((prev) => [...prev, data as Machine]);
      return data as Machine;
    },
    [],
  );

  const updateMachine = useCallback(
    async (id: number, input: Partial<MachineInput>) => {
      const { error: err } = await supabase
        .from("machines")
        .update(input as unknown as Record<string, unknown>)
        .eq("id", id);
      if (err) throw err;
      setMachines((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...input } : m)),
      );
    },
    [],
  );

  const deleteMachine = useCallback(async (id: number) => {
    const { error: err } = await supabase
      .from("machines")
      .delete()
      .eq("id", id);
    if (err) throw err;
    setMachines((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return {
    machines,
    loading,
    error,
    refetch: fetchMachines,
    addMachine,
    updateMachine,
    deleteMachine,
  };
}
