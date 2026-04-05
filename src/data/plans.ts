export type PlanTier = {
  id: "basic" | "standard" | "premium";
  name: string;
  /** Display label used on the landing page (e.g. "Live") */
  price: string;
  /** Numeric base premium in ₹/week — single source of truth for pricing */
  basePrice: number;
  maxPayout: number;
  maxDailyPayout: number;
  period: string;
  features: string[];
  cta: string;
  popular: boolean;
};

export const plans: PlanTier[] = [
  {
    id: "basic",
    name: "GigAssure Basic",
    price: "Live",
    basePrice: 25,
    maxPayout: 350,
    maxDailyPayout: 150,
    period: "/week",
    features: [
      "Maximum payout: ₹350/week",
      "Capped at ₹150/day",
      "Covers: Rain, Heat, AQI & Curfews",
      "Zero manual paperwork",
      "Dynamic premium adjustments",
    ],
    cta: "Start Basic",
    popular: false,
  },
  {
    id: "standard",
    name: "GigAssure Standard",
    price: "Live",
    basePrice: 40,
    maxPayout: 600,
    maxDailyPayout: 250,
    period: "/week",
    features: [
      "Maximum payout: ₹600/week",
      "Capped at ₹250/day",
      "Covers: Rain, Heat, AQI & Curfews",
      "Instant payout via Razorpay",
      "Adaptive friction protection",
    ],
    cta: "Start Standard",
    popular: true,
  },
  {
    id: "premium",
    name: "GigAssure Premium",
    price: "Live",
    basePrice: 60,
    maxPayout: 1000,
    maxDailyPayout: 400,
    period: "/week",
    features: [
      "Maximum payout: ₹1000/week",
      "Capped at ₹400/day",
      "Covers: Rain, Heat, AQI & Curfews",
      "Priority instant payout",
      "Multi-dimensional presence verification",
    ],
    cta: "Start Premium",
    popular: false,
  },
];

/** Resolve a plan by its id */
export const getPlanById = (
  id: string | null | undefined,
): PlanTier | undefined => {
  if (!id) return undefined;
  const normalized = id.toLowerCase().trim();
  return plans.find(
    (p) =>
      p.id === normalized ||
      p.name.toLowerCase().includes(normalized) ||
      normalized.includes(p.id),
  );
};
