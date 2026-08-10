import { useMemo } from "react";
import { TrendingDown, DollarSign, ArrowRight } from "lucide-react";
import type { Machine, Pricing, Recommendation } from "../types";

interface SavingsSummaryProps {
  machines: Machine[];
  pricing: Pricing[];
  recommendations: Recommendation[];
}

function hoursInTier(
  start: number,
  end: number,
  tierStart: number,
  tierEnd: number,
): number {
  let h = 0;
  for (let i = start; i !== end; i = (i + 1) % 24) {
    if (tierEnd > tierStart) {
      if (i >= tierStart && i < tierEnd) h++;
    } else {
      // wraps midnight
      if (i >= tierStart || i < tierEnd) h++;
    }
  }
  return h;
}

function computeMonthlyCost(
  machines: Machine[],
  pricing: Pricing[],
  scheduleOverride?: Map<number, { start: number; end: number }>,
): number {
  const peak = pricing.find((p) => p.type === "peak");
  const offPeak = pricing.find((p) => p.type === "off_peak");
  if (!peak || !offPeak) return 0;

  let total = 0;
  for (const m of machines) {
    const sched = scheduleOverride?.get(m.id);
    const start = sched?.start ?? m.start_hour;
    const end = sched?.end ?? m.end_hour;

    const peakHours = hoursInTier(start, end, peak.start_hour, peak.end_hour);
    const offPeakHours =
      hoursInTier(start, end, offPeak.start_hour, offPeak.end_hour) -
      peakHours; // avoid double-count

    total +=
      (m.power_kw * peakHours * peak.rate_per_kwh +
        m.power_kw * offPeakHours * offPeak.rate_per_kwh) *
      30;
  }
  return total;
}

export default function SavingsSummary({
  machines,
  pricing,
  recommendations,
}: SavingsSummaryProps) {
  const { before, after, savings } = useMemo(() => {
    const override = new Map<number, { start: number; end: number }>();
    for (const r of recommendations) {
      if (!r.keep_as_is) {
        override.set(r.machine_id, {
          start: r.recommended_start,
          end: r.recommended_end,
        });
      }
    }

    const beforeCost = computeMonthlyCost(machines, pricing);
    const afterCost = computeMonthlyCost(machines, pricing, override);
    return {
      before: beforeCost,
      after: afterCost,
      savings: beforeCost - afterCost,
    };
  }, [machines, pricing, recommendations]);

  const savingsPercent =
    before > 0 ? ((savings / before) * 100).toFixed(1) : "0";

  return (
    <div className="bg-savings-bg border border-savings/30 rounded-xl p-5 shadow-md">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-savings/15 flex items-center justify-center shrink-0">
            <TrendingDown size={22} className="text-savings" />
          </div>
          <div>
            <p className="font-heading text-sm font-semibold text-savings uppercase tracking-wider">
              Monthly Savings
            </p>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold text-foreground tabular-nums">
                ${savings.toFixed(0)}
              </span>
              <span className="text-sm text-savings font-medium">
                / month ({savingsPercent}%)
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="text-center">
            <p className="text-muted-light text-xs mb-0.5">Before</p>
            <p className="text-foreground font-semibold tabular-nums">
              ${before.toFixed(0)}
            </p>
          </div>
          <ArrowRight size={16} className="text-muted-light shrink-0" />
          <div className="text-center">
            <p className="text-muted-light text-xs mb-0.5">After</p>
            <p className="text-savings font-semibold tabular-nums">
              ${after.toFixed(0)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-muted-light text-xs mb-0.5">You save</p>
            <p className="text-savings font-bold text-lg tabular-nums">
              <DollarSign size={14} className="inline" />
              {(before - after).toFixed(0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
