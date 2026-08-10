import { Edit3, Trash2, Zap, Clock } from "lucide-react";
import type { Machine, Recommendation } from "../types";

function formatHour(h: number): string {
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${hour}:00 ${ampm}`;
}

function hoursDuration(start: number, end: number): number {
  if (end > start) return end - start;
  return 24 - start + end;
}

interface MachineTableProps {
  machines: Machine[];
  recommendations: Recommendation[];
  onEdit: (machine: Machine) => void;
  onDelete: (id: number) => void;
}

export function EmptyMachineState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="text-center py-16 px-4">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-5">
        <Zap size={28} className="text-muted-light" />
      </div>
      <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
        No machines yet
      </h3>
      <p className="text-muted-light max-w-sm mx-auto mb-6 text-sm leading-relaxed">
        Add your factory machines here — tell us their power draw and current
        schedule so we can find ways to cut your electricity bill.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-on-primary font-semibold hover:opacity-90 active:scale-[0.97] transition-all duration-150 cursor-pointer text-sm"
      >
        <Zap size={16} />
        Add Your First Machine
      </button>
    </div>
  );
}

export default function MachineTable({
  machines,
  recommendations,
  onEdit,
  onDelete,
}: MachineTableProps) {
  // Lookup recommendations by machine_id
  const recMap = new Map<number, Recommendation>();
  for (const r of recommendations) {
    recMap.set(r.machine_id, r);
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface border-b border-border">
            <th className="text-left px-4 py-3 font-heading text-xs font-semibold text-muted-light uppercase tracking-wider">
              Machine
            </th>
            <th className="text-right px-4 py-3 font-heading text-xs font-semibold text-muted-light uppercase tracking-wider">
              Power
            </th>
            <th className="text-left px-4 py-3 font-heading text-xs font-semibold text-muted-light uppercase tracking-wider">
              Current Schedule
            </th>
            <th className="text-center px-4 py-3 font-heading text-xs font-semibold text-muted-light uppercase tracking-wider">
              Flexible
            </th>
            <th className="text-left px-4 py-3 font-heading text-xs font-semibold text-muted-light uppercase tracking-wider">
              Recommended
            </th>
            <th className="text-left px-4 py-3 font-heading text-xs font-semibold text-muted-light uppercase tracking-wider">
              Reasoning
            </th>
            <th className="text-right px-4 py-3 font-heading text-xs font-semibold text-muted-light uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {machines.map((machine, idx) => {
            const rec = recMap.get(machine.id);
            const isLast = idx === machines.length - 1;

            return (
              <tr
                key={machine.id}
                className={`${
                  idx % 2 === 0 ? "bg-background" : "bg-surface/50"
                } hover:bg-muted/20 transition-colors duration-150 ${!isLast ? "border-b border-border" : ""}`}
              >
                {/* Name */}
                <td className="px-4 py-3">
                  <div>
                    <p className="font-medium text-foreground">
                      {machine.name}
                    </p>
                  </div>
                </td>

                {/* Power */}
                <td className="px-4 py-3 text-right text-foreground font-medium tabular-nums">
                  {machine.power_kw} kW
                </td>

                {/* Current Schedule */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-muted-light shrink-0" />
                    <span className="text-foreground">
                      {formatHour(machine.start_hour)} –{" "}
                      {formatHour(machine.end_hour)}
                    </span>
                    <span className="text-xs text-muted-light ml-1">
                      ({hoursDuration(machine.start_hour, machine.end_hour)}h)
                    </span>
                  </div>
                </td>

                {/* Flexible */}
                <td className="px-4 py-3 text-center">
                  {machine.is_flexible ? (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-offpeak-bg/60 text-offpeak text-xs font-medium">
                      Flexible
                    </span>
                  ) : (
                    <span className="inline-block px-2.5 py-0.5 rounded-full bg-peak-bg/60 text-peak text-xs font-medium">
                      Fixed
                    </span>
                  )}
                </td>

                {/* Recommended */}
                <td className="px-4 py-3">
                  {rec ? (
                    rec.keep_as_is ? (
                      <span className="text-muted-light text-sm italic">
                        Keep as is
                      </span>
                    ) : (
                      <span className="text-savings font-medium">
                        {formatHour(rec.recommended_start)} –{" "}
                        {formatHour(rec.recommended_end)}
                      </span>
                    )
                  ) : (
                    <span className="text-muted-light text-sm">—</span>
                  )}
                </td>

                {/* Reasoning */}
                <td className="px-4 py-3 max-w-[260px]">
                  {rec ? (
                    <p className="text-sm text-muted-light leading-relaxed">
                      {rec.explanation}
                    </p>
                  ) : (
                    <span className="text-muted-light text-sm">—</span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(machine)}
                      className="p-1.5 rounded-md text-muted-light hover:text-foreground hover:bg-muted/30 transition-all duration-200 cursor-pointer"
                      title="Edit machine"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(machine.id)}
                      className="p-1.5 rounded-md text-muted-light hover:text-destructive hover:bg-destructive/10 transition-all duration-200 cursor-pointer"
                      title="Delete machine"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
