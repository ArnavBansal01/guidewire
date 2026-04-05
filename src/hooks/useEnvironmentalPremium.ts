import { useState, useEffect, useCallback, useRef } from "react";
import type {
  EnvironmentalConditions,
  SurchargeBreakdownItem,
} from "../utils/PremiumLogic";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const REFRESH_INTERVAL_MS = 60_000;
const CACHE_KEY = "envPremiumCache";

/** Shape of the data returned by the backend /api/calculate-premium endpoint */
type BackendPremiumResponse = {
  success?: boolean;
  city?: string;
  liveData?: Partial<EnvironmentalConditions>;
  finalPremium?: number;
  liveRiskScore?: number;
  liveSurcharge?: number;
  breakdown?: Array<{ factor: string; impact: string }>;
  basePrice?: number;
};

/** Cache-friendly shape stored in localStorage and exposed to consumers */
export type EnvironmentalPremiumData = {
  liveData: EnvironmentalConditions;
  liveRiskScore: number;
  liveSurcharge: number;
  breakdown: SurchargeBreakdownItem[];
  fetchedAt: number;
};

export type UseEnvironmentalPremiumResult = {
  data: EnvironmentalPremiumData | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
};

/**
 * Parses the raw API numeric value of an impact string like "+₹6" into a number.
 */
const parseImpactAmount = (impact: string): number => {
  const match = impact.replace(/[^\d.-]/g, "");
  const num = Number(match);
  return Number.isFinite(num) ? num : 0;
};

/**
 * Shared hook that fetches live environmental data from the backend
 * and returns surcharge/breakdown data.
 *
 * Consumers pass their profile-derived parameters; the hook handles:
 *   - Initial fetch + 60s auto-refresh
 *   - localStorage caching for instant mount
 *   - Cleanup on unmount or param change
 *
 * Usage:
 *   const { data, loading, error, refresh } = useEnvironmentalPremium({
 *     city: profile?.city,
 *     platform: profile?.platform,
 *     deliveries: profile?.avgDailyDeliveries,
 *   });
 */
export const useEnvironmentalPremium = (params: {
  city?: string | null;
  platform?: string | null;
  deliveries?: number | null;
}): UseEnvironmentalPremiumResult => {
  const { city, platform, deliveries } = params;

  const [data, setData] = useState<EnvironmentalPremiumData | null>(() => {
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      return cached ? (JSON.parse(cached) as EnvironmentalPremiumData) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async () => {
    if (!city) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/calculate-premium`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          city,
          platform: platform || "Zomato",
          deliveries: deliveries || 20,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch environmental data");
      }

      const raw: BackendPremiumResponse = await response.json();
      if (!mountedRef.current) return;

      const result: EnvironmentalPremiumData = {
        liveData: {
          temp: Number(raw.liveData?.temp ?? 0),
          rainProb: Number(raw.liveData?.rainProb ?? 0),
          aqi: Number(raw.liveData?.aqi ?? 0),
        },
        liveRiskScore:
          typeof raw.liveRiskScore === "number" &&
          Number.isFinite(raw.liveRiskScore)
            ? raw.liveRiskScore
            : 0,
        liveSurcharge:
          typeof raw.liveSurcharge === "number" &&
          Number.isFinite(raw.liveSurcharge)
            ? raw.liveSurcharge
            : 0,
        breakdown: Array.isArray(raw.breakdown)
          ? raw.breakdown.map((item) => ({
              factor:
                typeof item.factor === "string" ? item.factor : "Unknown",
              impact: typeof item.impact === "string" ? item.impact : "+₹0",
              amount: parseImpactAmount(
                typeof item.impact === "string" ? item.impact : "0",
              ),
            }))
          : [],
        fetchedAt: Date.now(),
      };

      setData(result);
      localStorage.setItem(CACHE_KEY, JSON.stringify(result));
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : "Unknown error");
      setData(null);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [city, platform, deliveries]);

  useEffect(() => {
    mountedRef.current = true;

    if (!city) {
      setData(null);
      setLoading(false);
      setError(null);
      return;
    }

    fetchData();
    const intervalId = setInterval(fetchData, REFRESH_INTERVAL_MS);

    return () => {
      mountedRef.current = false;
      clearInterval(intervalId);
    };
  }, [city, platform, deliveries, fetchData]);

  return { data, loading, error, refresh: fetchData };
};
