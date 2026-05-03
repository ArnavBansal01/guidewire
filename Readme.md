# GigAssure

AI-powered parametric income insurance for gig workers — automated, zero-touch
protection that pays out when measurable environmental disruptions reduce a
worker's ability to earn.

---

## Overview

GigAssure protects delivery partners from sudden income loss caused by
external events (heavy rain, extreme heat, severe pollution, curfews). Workers
subscribe to short weekly micro-policies. When a parametric trigger occurs in
their zone and a verified income drop is detected, GigAssure automatically
generates an instant payout with minimal to no manual intervention.

Key goals:
- Fast, zero-touch claims for honest workers
- Sustainable weekly pricing and capped payouts
- Robust anti-spoofing / fraud defenses to protect the pool

---

## Features

- Weekly micro-policies with dynamic AI pricing
- Parametric triggers (Weather, AQI, Curfew) for automatic claims
- Zero-touch claims workflow (99% automated)
- Multi-dimensional Proof of Presence (sensor fusion, IP-to-geo, EXIF checks)
- Admin dashboard and automation engine for monitoring & approvals

---

## How It Works (zero-touch flow)

1. Worker registers and subscribes to a weekly plan.
2. AI profiles local risk and suggests a dynamic weekly premium.
3. Every minute a scheduler evaluates weather/AQI feeds for parametric
   thresholds.
4. If a trigger occurs, the system validates the worker's recent activity and
   income drop via platform integrations and telemetry.
5. For trusted users, claims are auto-created and payouts are routed
   (Razorpay sandbox in development). Suspicious signals apply "Adaptive
   Friction" (quick secondary validation such as a short live photo/video).

---

## Parametric Triggers

- Heavy Rain: > 50 mm in 24 hours
- Extreme Heat: > 45°C
- Severe Pollution: AQI > 400
- Curfew / Lockdown: Government or traffic API notification

Payouts require both a trigger and verified activity/income drop in the
affected zone.

---

## Pricing (example weekly plans)

- Basic: ₹35/week — max payout ₹350 (cap ₹150/day)
- Standard: ₹50/week — max payout ₹600 (cap ₹250/day)
- Premium: ₹80/week — max payout ₹1000 (cap ₹400/day)

AI dynamic pricing adjusts premiums week-to-week based on localized risk
forecasts.

---

## Fraud Prevention & Adaptive Friction

- Sensor fusion: accelerometer & GPS consistency checks
- OS mock-location detection and velocity/timestamp sanity checks
- IP-to-geo correlation and device fingerprint clustering
- Adaptive Friction: low-friction secondary proof (EXIF-verified photo/video)
- Fixed weekly cycles + 48-hour enrollment blackout to prevent adverse
  selection

---

## Tech Stack

- Frontend: React / PWA (Next.js in design notes)
- Backend: Node.js / Express
- Database: Firebase Firestore (Phase 2) / MongoDB noted in research
- AI/ML: Python + Scikit-learn for risk & fraud models
- Scheduler: Node Cron for automation
- Payments: Razorpay (sandbox)

---

## API & Project Structure (high level)

Key backend endpoints (see backend implementation for exact routes):

- `/api/admin/claims` — fetch and manage claims
- `/api/admin/workers` — worker queries and flags
- `/api/calculate-premium` — dynamic premium calculation

Typical layout:

```
backend/
  src/
    controllers/
    services/
    routes/
  .env
src/ (frontend)
  App.tsx
  pages/
  components/
```

---

## Getting Started (development)

1. Install dependencies (root + backend):

```bash
npm install
cd backend
npm install
```

2. Start the frontend and backend in parallel (example):

```bash
# from project root
npm run dev        # frontend (Vite/React)
cd backend && npm run dev  # backend server
```

3. Configure environment variables: copy the backend `.env.example` to
   `.env` and set Firebase, Razorpay sandbox keys, and API credentials for
   weather/AQI providers.

---

## Running the Automation

- A cron-based scheduler evaluates triggers and creates claims. Check
  `backend/src/services/cronService.js` (or similar) to tune the cadence in
  development.

---

## Phase Status & Roadmap

- Phase 1: Research, architecture, and Market Crash defense — completed.
- Phase 2: Automation, registration, policy management, and zero-touch
  claims — implemented in the repo (see `phase2.md`).
- Phase 3: Production-ready fraud models, native mobile client, and platform
  integrations.

---

## Contributing

Contributions welcome. Open issues for bugs, feature requests, or help with
AI model training. Follow repo conventions and run tests if present before
opening a PR.

---

## References

- Phase 1 research: phase1.md
- Phase 2 implementation notes: phase2.md
- Demo video: https://youtu.be/QV6Blrvcf2E

---

## License & Contact

For questions or collaboration: contact the authors via the repository.
