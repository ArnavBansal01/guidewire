// ─── Strict Types ────────────────────────────────────────────────────────────

/** Real-time environmental sensor readings */
export type EnvironmentalConditions = {
  temp: number;
  rainProb: number;
  aqi: number;
};

/** A single line-item in the surcharge breakdown */
export type SurchargeBreakdownItem = {
  factor: string;
  impact: string;
  amount: number;
};

/** Result of the pure environmental surcharge calculation */
export type EnvironmentalSurchargeResult = {
  liveRiskScore: number;
  liveSurcharge: number;
  breakdown: SurchargeBreakdownItem[];
};

/** Full final-price result combining base price + environmental surcharge */
export type FinalPriceResult = {
  basePrice: number;
  liveSurcharge: number;
  weeklyPremium: number;
  total: number;
  duration: number;
  liveRiskScore: number;
  breakdown: SurchargeBreakdownItem[];
};

export type CalculateFinalPriceInput = {
  basePrice: number;
  duration: number;
  liveData?: Partial<EnvironmentalConditions> | null;
};

// ─── Pure Helpers ────────────────────────────────────────────────────────────

const toSafeNumber = (value: unknown): number => {
  const numeric = typeof value === "number" ? value : Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

// ─── Core Algorithm ──────────────────────────────────────────────────────────

/**
 * Calculates a dynamic environmental surcharge based on real-time conditions.
 *
 * The surcharge is composed of:
 *   1. A **variable component** derived from a composite risk score (0–100)
 *      weighted across rain (45%), heat (30%), and AQI (25%).
 *   2. **Trigger bonuses** for specific severe thresholds on each axis.
 *   3. A **compound disruption bonus** when 2+ triggers fire simultaneously.
 *
 * This function is pure — no side-effects, no mock data, no base price.
 */
export const calculateEnvironmentalSurcharge = (
  conditions?: Partial<EnvironmentalConditions> | null,
): EnvironmentalSurchargeResult => {
  const temp = toSafeNumber(conditions?.temp);
  const rainProb = toSafeNumber(conditions?.rainProb);
  const aqi = toSafeNumber(conditions?.aqi);

  const breakdown: SurchargeBreakdownItem[] = [];

  // ── Severity scores (0–1 range) ──
  const rainSeverity = clamp(rainProb / 100, 0, 1);
  const heatSeverity = clamp((temp - 30) / 15, 0, 1);
  const aqiSeverity = clamp((aqi - 50) / 250, 0, 1);

  // ── Composite risk score (0–100) ──
  const liveRiskScore = Math.round(
    (rainSeverity * 0.45 + heatSeverity * 0.3 + aqiSeverity * 0.25) * 100,
  );

  // ── Variable surcharge from risk score ──
  const variableSurcharge = Math.round(liveRiskScore * 0.35);
  breakdown.push({
    factor: `Live disruption score (${liveRiskScore}/100)`,
    impact: `+₹${variableSurcharge}`,
    amount: variableSurcharge,
  });

  // ── Trigger bonuses ──
  let triggerBonus = 0;

  if (rainProb > 80) {
    triggerBonus += 6;
    breakdown.push({
      factor: "Extreme rain probability (>80%)",
      impact: "+₹6",
      amount: 6,
    });
  } else if (rainProb > 60) {
    triggerBonus += 4;
    breakdown.push({
      factor: "High rain probability (>60%)",
      impact: "+₹4",
      amount: 4,
    });
  }

  if (temp > 45) {
    triggerBonus += 6;
    breakdown.push({
      factor: "Severe heat (>45°C)",
      impact: "+₹6",
      amount: 6,
    });
  } else if (temp > 40) {
    triggerBonus += 3;
    breakdown.push({
      factor: "Extreme heat (>40°C)",
      impact: "+₹3",
      amount: 3,
    });
  }

  if (aqi > 200) {
    triggerBonus += 8;
    breakdown.push({
      factor: "Hazardous AQI (>200)",
      impact: "+₹8",
      amount: 8,
    });
  } else if (aqi > 150) {
    triggerBonus += 4;
    breakdown.push({
      factor: "Poor AQI (>150)",
      impact: "+₹4",
      amount: 4,
    });
  }

  // ── Compound disruption bonus ──
  const severeTriggerCount = [rainProb > 60, temp > 40, aqi > 150].filter(
    Boolean,
  ).length;
  if (severeTriggerCount >= 2) {
    triggerBonus += 5;
    breakdown.push({
      factor: "Compound disruption signal",
      impact: "+₹5",
      amount: 5,
    });
  }

  const liveSurcharge = Math.max(0, variableSurcharge + triggerBonus);

  return {
    liveRiskScore,
    liveSurcharge,
    breakdown,
  };
};

// ─── Final Price Calculator ──────────────────────────────────────────────────

/**
 * Computes the final premium price.
 *
 *   Final = (basePrice + liveSurcharge) × duration
 *
 * `basePrice` must be sourced from plans.ts at the call site.
 * This function never hardcodes a base price.
 */
export const calculateFinalPrice = (
  input: CalculateFinalPriceInput,
): FinalPriceResult => {
  const { basePrice, duration, liveData } = input;
  const safeBasePrice = Number.isFinite(basePrice) ? Math.max(basePrice, 0) : 0;
  const safeDuration = Number.isFinite(duration)
    ? Math.max(1, Math.round(duration))
    : 1;

  const surchargeResult = calculateEnvironmentalSurcharge(liveData);
  const weeklyPremium = safeBasePrice + surchargeResult.liveSurcharge;
  const total = weeklyPremium * safeDuration;

  return {
    basePrice: safeBasePrice,
    liveSurcharge: surchargeResult.liveSurcharge,
    weeklyPremium,
    total,
    duration: safeDuration,
    liveRiskScore: surchargeResult.liveRiskScore,
    breakdown: surchargeResult.breakdown,
  };
};
