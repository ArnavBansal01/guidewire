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

export const CITY_TO_STATE: Record<string, string> = {
  Delhi: "Delhi",
  Mumbai: "Maharashtra",
  Bangalore: "Karnataka",
  Bengaluru: "Karnataka",
  Hyderabad: "Telangana",
  Chennai: "Tamil Nadu",
  Kolkata: "West Bengal",
  Pune: "Maharashtra",
  Ahmedabad: "Gujarat",
};

export const STATE_COMPENSATION: Record<string, number> = {
  Delhi: 12,
  Maharashtra: 10,
  Karnataka: 11,
  Telangana: 9,
  "Tamil Nadu": 9,
  "West Bengal": 8,
  Gujarat: 7,
};

const MIN_WEEKLY_PREMIUM = 25;

export type PricingBreakdown = {
  basePrice: number;
  city: string;
  state: string;
  stateCompensation: number;
  cityAdjustment: number;
  weeklyPrice: number;
  duration: number;
};

export type FinalPriceResult = {
  total: number;
  breakdown: PricingBreakdown;
};

export type CalculateFinalPriceInput = {
  basePrice: number;
  city?: string;
  state?: string;
  duration: number;
};

export const getCityMultiplier = (city: string): number => {
  return CITY_MULTIPLIERS[city] ?? 1;
};

export const getStateFromCity = (city: string): string => {
  const normalizedCity = city.trim();

  if (!normalizedCity) {
    return "Unknown State";
  }

  return CITY_TO_STATE[normalizedCity] ?? normalizedCity;
};

export const getStateCompensation = (state: string): number => {
  const normalizedState = state.trim();

  if (!normalizedState) {
    return 8;
  }

  return STATE_COMPENSATION[normalizedState] ?? 8;
};

export const calculateFinalPrice = ({
  basePrice,
  city = "",
  state,
  duration,
}: CalculateFinalPriceInput): FinalPriceResult => {
  const safeBasePrice = Number.isFinite(basePrice) ? Math.max(basePrice, 0) : 0;
  const safeDuration = Number.isFinite(duration)
    ? Math.max(1, Math.round(duration))
    : 1;

  const resolvedState =
    (state?.trim() || getStateFromCity(city)).trim() || "Unknown State";
  const stateCompensation = getStateCompensation(resolvedState);
  const weeklyPrice = Math.max(
    safeBasePrice + stateCompensation,
    MIN_WEEKLY_PREMIUM,
  );
  const total = weeklyPrice * safeDuration;

  return {
    total,
    breakdown: {
      basePrice: safeBasePrice,
      city,
      state: resolvedState,
      stateCompensation,
      cityAdjustment: stateCompensation,
      weeklyPrice,
      duration: safeDuration,
    },
  };
};
