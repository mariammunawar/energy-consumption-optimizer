import { useState, useCallback, useEffect, useRef } from "react";
import { X, Plus, Loader2 } from "lucide-react";
import type { Machine, MachineInput } from "../types";

interface AddMachineModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: MachineInput) => Promise<void>;
  editingMachine?: Machine | null;
}

export default function AddMachineModal({
  open,
  onClose,
  onSubmit,
  editingMachine,
}: AddMachineModalProps) {
  const [name, setName] = useState("");
  const [powerKw, setPowerKw] = useState("");
  const [startHour, setStartHour] = useState("8");
  const [endHour, setEndHour] = useState("17");
  const [isFlexible, setIsFlexible] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  const isEditing = !!editingMachine;

  useEffect(() => {
    if (open) {
      if (editingMachine) {
        setName(editingMachine.name);
        setPowerKw(String(editingMachine.power_kw));
        setStartHour(String(editingMachine.start_hour));
        setEndHour(String(editingMachine.end_hour));
        setIsFlexible(editingMachine.is_flexible);
      } else {
        setName("");
        setPowerKw("");
        setStartHour("8");
        setEndHour("17");
        setIsFlexible(true);
      }
      setError(null);
      setSubmitting(false);
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open, editingMachine]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmedName = name.trim();
      const power = Number(powerKw);
      const start = Number(startHour);
      const end = Number(endHour);

      if (!trimmedName) {
        setError("Please enter a machine name.");
        return;
      }
      if (!powerKw || power <= 0) {
        setError("Power must be a positive number.");
        return;
      }
      if (start < 0 || start > 23 || end < 0 || end > 23) {
        setError("Hours must be between 0 and 23.");
        return;
      }

      try {
        setSubmitting(true);
        await onSubmit({
          name: trimmedName,
          power_kw: power,
          start_hour: start,
          end_hour: end,
          is_flexible: isFlexible,
        });
        onClose();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to save machine.",
        );
      } finally {
        setSubmitting(false);
      }
    },
    [name, powerKw, startHour, endHour, isFlexible, onSubmit, onClose],
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose();
    },
    [onClose],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? "Edit machine" : "Add a machine"}
    >
      <div className="bg-surface border border-border rounded-2xl shadow-xl w-full max-w-md p-6 animate-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-semibold text-foreground">
            {isEditing ? "Edit Machine" : "Add Machine"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-light hover:text-foreground transition-colors duration-200 cursor-pointer p-1 rounded-md hover:bg-muted/30"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label
              htmlFor="machine-name"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Machine Name
            </label>
            <input
              ref={nameRef}
              id="machine-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "CNC Mill 3"'
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-ring transition-shadow text-sm"
            />
          </div>

          {/* Power */}
          <div>
            <label
              htmlFor="machine-power"
              className="block text-sm font-medium text-foreground mb-1.5"
            >
              Power Consumption (kW)
            </label>
            <input
              id="machine-power"
              type="number"
              min={0.1}
              step={0.1}
              value={powerKw}
              onChange={(e) => setPowerKw(e.target.value)}
              placeholder="e.g. 15.5"
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground placeholder-muted-light focus:outline-none focus:ring-2 focus:ring-ring transition-shadow text-sm"
            />
          </div>

          {/* Hours */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="machine-start"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                Start Hour (0–23)
              </label>
              <input
                id="machine-start"
                type="number"
                min={0}
                max={23}
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="machine-end"
                className="block text-sm font-medium text-foreground mb-1.5"
              >
                End Hour (0–23)
              </label>
              <input
                id="machine-end"
                type="number"
                min={0}
                max={23}
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-shadow text-sm"
              />
            </div>
          </div>

          {/* Flexible toggle */}
          <div className="flex items-center justify-between bg-background rounded-lg p-3 border border-border">
            <div>
              <p className="text-sm font-medium text-foreground">
                Flexible Schedule
              </p>
              <p className="text-xs text-muted-light mt-0.5">
                Can this machine be rescheduled to save costs?
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={isFlexible}
              onClick={() => setIsFlexible((f) => !f)}
              className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${
                isFlexible ? "bg-primary" : "bg-muted"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isFlexible ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-accent text-on-primary font-semibold hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Plus size={18} />
            )}
            {isEditing ? "Save Changes" : "Add Machine"}
          </button>
        </form>
      </div>
    </div>
  );
}
