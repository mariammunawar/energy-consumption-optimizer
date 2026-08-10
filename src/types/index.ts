export interface Machine {
  id: number;
  name: string;
  power_kw: number;
  start_hour: number;
  end_hour: number;
  is_flexible: boolean;
  created_at: string;
}

export interface MachineInput {
  name: string;
  power_kw: number;
  start_hour: number;
  end_hour: number;
  is_flexible: boolean;
}

export interface Pricing {
  id: number;
  type: "peak" | "off_peak";
  start_hour: number;
  end_hour: number;
  rate_per_kwh: number;
}

export interface PricingInput {
  type: "peak" | "off_peak";
  start_hour: number;
  end_hour: number;
  rate_per_kwh: number;
}

export interface Recommendation {
  machine_name: string;
  machine_id: number;
  current_start: number;
  current_end: number;
  recommended_start: number;
  recommended_end: number;
  keep_as_is: boolean;
  explanation: string;
}

export interface OptimizationResult {
  recommendations: Recommendation[];
}
