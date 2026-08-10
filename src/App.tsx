import { useState, useCallback } from "react";
import { Plus, Sparkles, Loader2, AlertTriangle } from "lucide-react";
import PricingCard from "./components/PricingCard";
import AddMachineModal from "./components/AddMachineModal";
import MachineTable, { EmptyMachineState } from "./components/MachineTable";
import SavingsSummary from "./components/SavingsSummary";
import { useMachines } from "./hooks/useMachines";
import { usePricing } from "./hooks/usePricing";
import { useOptimization } from "./hooks/useOptimization";
import type { Machine } from "./types";

export default function App() {
  const {
    machines,
    loading: machinesLoading,
    error: machinesError,
    addMachine,
    deleteMachine,
  } = useMachines();
  const { pricing, loading: pricingLoading, updatePricing } = usePricing();
  const {
    recommendations,
    loading: optimizing,
    error: optError,
    runOptimization,
    clearResults,
  } = useOptimization();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  const handleOpenAdd = useCallback(() => {
    setEditingMachine(null);
    setModalOpen(true);
  }, []);

  const handleOpenEdit = useCallback((machine: Machine) => {
    setEditingMachine(machine);
    setModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalOpen(false);
    setEditingMachine(null);
  }, []);

  const handleSubmitMachine = useCallback(
    async (input: Parameters<typeof addMachine>[0]) => {
      await addMachine(input);
    },
    [addMachine],
  );

  const handleRunOptimization = useCallback(async () => {
    if (machines.length === 0 || pricing.length === 0) return;
    await runOptimization(machines, pricing);
  }, [machines, pricing, runOptimization]);

  const hasResults = recommendations.length > 0;
  const showEmptyMachineState = machines.length === 0 && !machinesLoading;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
              <Sparkles size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-foreground leading-tight">
                Energy Optimizer
              </h1>
              <p className="text-xs text-muted-light hidden sm:block">
                Schedule smarter. Spend less.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleOpenAdd}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent text-on-primary font-semibold hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer text-sm"
          >
            <Plus size={17} />
            Add Machine
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Pricing Section */}
        <section>
          <PricingCard
            pricing={pricing}
            loading={pricingLoading}
            onUpdate={updatePricing}
          />
        </section>

        {/* Optimization CTA + Results */}
        <section className="space-y-4">
          {/* Savings Summary (shown after optimization) */}
          {hasResults && (
            <SavingsSummary
              machines={machines}
              pricing={pricing}
              recommendations={recommendations}
            />
          )}

          {/* Error from optimization */}
          {optError && (
            <div className="flex items-start gap-3 bg-destructive/10 border border-destructive/30 rounded-xl p-4 text-sm">
              <AlertTriangle
                size={18}
                className="text-destructive shrink-0 mt-0.5"
              />
              <div>
                <p className="font-medium text-destructive">
                  Optimization failed
                </p>
                <p className="text-muted-light mt-0.5">{optError}</p>
              </div>
              <button
                type="button"
                onClick={clearResults}
                className="ml-auto text-muted-light hover:text-foreground transition-colors cursor-pointer text-sm shrink-0"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Analyze button */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={
                optimizing || machines.length === 0 || pricing.length === 0
              }
              onClick={handleRunOptimization}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-on-primary font-semibold hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-primary/20"
            >
              {optimizing ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Analyze &amp; Optimize
                </>
              )}
            </button>

            {hasResults && !optimizing && (
              <button
                type="button"
                onClick={handleRunOptimization}
                className="text-sm text-muted-light hover:text-foreground transition-colors duration-200 cursor-pointer"
              >
                Re-run analysis
              </button>
            )}

            {machines.length === 0 && !machinesLoading && (
              <span className="text-sm text-muted-light">
                Add machines to start optimizing
              </span>
            )}
          </div>
        </section>

        {/* Machine Table Section */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-heading text-sm font-semibold text-muted-light uppercase tracking-wider">
              Machines ({machines.length})
            </h2>
          </div>

          {/* Error loading machines */}
          {machinesError && (
            <div className="text-center py-8 text-sm text-destructive">
              <AlertTriangle size={20} className="mx-auto mb-2" />
              Couldn't load machines: {machinesError}
            </div>
          )}

          {/* Loading skeleton */}
          {machinesLoading && (
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="animate-pulse space-y-3 p-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 bg-muted rounded" />
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {showEmptyMachineState && (
            <EmptyMachineState onAdd={handleOpenAdd} />
          )}

          {/* Machine table */}
          {!machinesLoading && machines.length > 0 && (
            <MachineTable
              machines={machines}
              recommendations={recommendations}
              onEdit={handleOpenEdit}
              onDelete={deleteMachine}
            />
          )}
        </section>
      </main>

      {/* Add/Edit Machine Modal */}
      <AddMachineModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmitMachine}
        editingMachine={editingMachine}
      />

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 sm:px-6 py-6 text-center text-xs text-muted-light border-t border-border mt-12">
        Energy Consumption Optimizer — built for factory operations managers
      </footer>
    </div>
  );
}
