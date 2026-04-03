export const CITY_MULTIPLIERS: Record<string, number> = {
  Delhi: 1.15,
  Mumbai: 1.2,
  Bangalore: 1.18,
  Hyderabad: 1.1,
  Chennai: 1.08,
  Kolkata: 1.05,
  Pune: 1.12,
  Ahmedabad: 1.06,
};

const ENGINE_BASELINE = 45;
const MIN_WEEKLY_PREMIUM = 25;

export type PricingBreakdown = {
  basePrice: number;
  cityMultiplier: number;
  cityAdjustment: number;
  riskAdjustment: number;
  weeklyPrice: number;
  duration: number;
};

export type FinalPriceResult = {
  total: number;
  breakdown: PricingBreakdown;
};

export type CalculateFinalPriceInput = {
  basePrice: number;
  city: string;
  duration: number;
  riskEnginePremium?: number;
};

export const getCityMultiplier = (city: string): number => {
  return CITY_MULTIPLIERS[city] ?? 1;
};

export const calculateFinalPrice = ({
  basePrice,
  city,
  duration,
  riskEnginePremium = ENGINE_BASELINE,
}: CalculateFinalPriceInput): FinalPriceResult => {
  const safeBasePrice = Number.isFinite(basePrice) ? Math.max(basePrice, 0) : 0;
  const safeDuration = Number.isFinite(duration)
    ? Math.max(1, Math.round(duration))
    : 1;

  const cityMultiplier = getCityMultiplier(city);
  const cityAdjustedBase = Math.round(safeBasePrice * cityMultiplier);
  const cityAdjustment = cityAdjustedBase - safeBasePrice;

  // Preserve calculator behavior: use engine premium as delta from a fixed baseline.
  const riskAdjustment = Number.isFinite(riskEnginePremium)
    ? Math.round(riskEnginePremium - ENGINE_BASELINE)
    : 0;

  const weeklyPrice = Math.max(
    cityAdjustedBase + riskAdjustment,
    MIN_WEEKLY_PREMIUM,
  );
  const total = weeklyPrice * safeDuration;

  return {
    total,
    breakdown: {
      basePrice: safeBasePrice,
      cityMultiplier,
      cityAdjustment,
      riskAdjustment,
      weeklyPrice,
      duration: safeDuration,
    },
  };
};
