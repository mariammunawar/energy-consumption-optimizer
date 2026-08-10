import { useState, useCallback } from "react";
import { ChevronDown, ChevronUp, Edit3, Check, X } from "lucide-react";
import type { Pricing } from "../types";

function formatHour(h: number): string {
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:00 ${ampm}`;
}

interface PricingCardProps {
  pricing: Pricing[];
  loading: boolean;
  onUpdate: (
    id: number,
    rate_per_kwh: number,
    start_hour: number,
    end_hour: number,
  ) => Promise<void>;
}

export default function PricingCard({
  pricing,
  loading,
  onUpdate,
}: PricingCardProps) {
  const [expanded, setExpanded] = useState(true);
  const [editing, setEditing] = useState(false);

  // Local form state
  const [formValues, setFormValues] = useState<
    Record<number, { rate: number; start: number; end: number }>
  >({});

  const startEditing = useCallback(() => {
    setFormValues(
      Object.fromEntries(
        pricing.map((p) => [
          p.id,
          { rate: p.rate_per_kwh, start: p.start_hour, end: p.end_hour },
        ]),
      ),
    );
    setEditing(true);
  }, [pricing]);

  const cancelEditing = useCallback(() => {
    setEditing(false);
  }, []);

  const saveAll = useCallback(async () => {
    const promises = pricing.map((p) => {
      const vals = formValues[p.id];
      if (!vals) return Promise.resolve();
      return onUpdate(p.id, vals.rate, vals.start, vals.end);
    });
    await Promise.all(promises);
    setEditing(false);
  }, [pricing, formValues, onUpdate]);

  const updateField = useCallback(
    (id: number, field: "rate" | "start" | "end", value: number) => {
      setFormValues((prev) => ({
        ...prev,
        [id]: { ...prev[id], [field]: value },
      }));
    },
    [],
  );

  const peak = pricing.find((p) => p.type === "peak");
  const offPeak = pricing.find((p) => p.type === "off_peak");

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl p-6 shadow-md animate-pulse">
        <div className="h-6 w-48 bg-muted rounded mb-4" />
        <div className="h-4 w-64 bg-muted rounded" />
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl shadow-md overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between p-5 hover:bg-muted/20 transition-colors duration-200 cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="font-heading text-lg font-semibold text-foreground">
            Energy Pricing
          </span>
          {!editing && peak && offPeak && (
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="px-2 py-0.5 rounded-md bg-peak-bg text-peak font-medium">
                Peak: {formatHour(peak.start_hour)}–{formatHour(peak.end_hour)}{" "}
                ${peak.rate_per_kwh.toFixed(2)}/kWh
              </span>
              <span className="px-2 py-0.5 rounded-md bg-offpeak-bg text-offpeak font-medium">
                Off-peak: {formatHour(offPeak.start_hour)}–
                {formatHour(offPeak.end_hour)} ${offPeak.rate_per_kwh.toFixed(2)}
                /kWh
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-muted-light">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-border">
          <div className="grid sm:grid-cols-2 gap-4 mt-4">
            {pricing.map((p) => {
              const vals = formValues[p.id];
              const isPeak = p.type === "peak";

              return (
                <div
                  key={p.id}
                  className={`p-4 rounded-lg border ${
                    isPeak
                      ? "border-peak/30 bg-peak-bg/40"
                      : "border-offpeak/30 bg-offpeak-bg/40"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`text-xs font-heading uppercase tracking-wider font-semibold ${
                        isPeak ? "text-peak" : "text-offpeak"
                      }`}
                    >
                      {p.type === "peak" ? "Peak Hours" : "Off-Peak Hours"}
                    </span>
                  </div>

                  {editing ? (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-muted-light mb-1">
                          Time Range
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={23}
                            value={vals?.start ?? p.start_hour}
                            onChange={(e) =>
                              updateField(p.id, "start", Number(e.target.value))
                            }
                            className="w-16 px-2 py-1.5 rounded-md border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                          />
                          <span className="text-muted-light text-sm">to</span>
                          <input
                            type="number"
                            min={0}
                            max={23}
                            value={vals?.end ?? p.end_hour}
                            onChange={(e) =>
                              updateField(p.id, "end", Number(e.target.value))
                            }
                            className="w-16 px-2 py-1.5 rounded-md border border-border bg-background text-foreground text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-muted-light mb-1">
                          Rate ($/kWh)
                        </label>
                        <input
                          type="number"
                          min={0}
                          step={0.01}
                          value={vals?.rate ?? p.rate_per_kwh}
                          onChange={(e) =>
                            updateField(p.id, "rate", Number(e.target.value))
                          }
                          className="w-28 px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-foreground font-medium">
                        {formatHour(p.start_hour)} – {formatHour(p.end_hour)}
                      </p>
                      <p className="text-muted-light text-sm">
                        ${p.rate_per_kwh.toFixed(2)} / kWh
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2 mt-4">
            {editing ? (
              <>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-muted-light hover:text-foreground hover:border-muted transition-all duration-200 cursor-pointer text-sm"
                >
                  <X size={16} />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveAll}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer text-sm font-medium"
                >
                  <Check size={16} />
                  Save Pricing
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={startEditing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-border text-muted-light hover:text-foreground hover:border-muted transition-all duration-200 cursor-pointer text-sm"
              >
                <Edit3 size={14} />
                Edit Pricing
              </button>
            )}
          </div>
        </div>
      )}

      {/* Collapsed peek */}
      {!expanded && peak && offPeak && (
        <div className="px-5 pb-4 flex items-center gap-3 text-sm text-muted-light">
          <span className="px-2 py-0.5 rounded-md bg-peak-bg/60 text-peak text-xs font-medium">
            Peak {formatHour(peak.start_hour)}–{formatHour(peak.end_hour)} @ $
            {peak.rate_per_kwh.toFixed(2)}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-offpeak-bg/60 text-offpeak text-xs font-medium">
            Off-peak {formatHour(offPeak.start_hour)}–
            {formatHour(offPeak.end_hour)} @ ${offPeak.rate_per_kwh.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
