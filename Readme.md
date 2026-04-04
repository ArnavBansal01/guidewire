# 🛡️ GigAssure: AI-Powered Parametric Income Insurance for Gig Workers


## Phase Submission Portal

Welcome to the official GigAssure hackathon submission index.

Phase 2 Submission: We have now moved from concept design into implementation-focused execution, including backend hardening, admin intelligence workflows, and live integration progress. Review the full submission here:
➡️ [Phase 2 Submission](phase2.md)

Phase 1 Submission: For the original architecture, problem framing, risk model, and core concept documentation, review:
➡️ [Phase 1 Submission](phase1.md)

## Phase Submission Portal

Welcome to the official GigAssure hackathon submission index.

Phase 2 Submission: We have now moved from concept design into implementation-focused execution, including backend hardening, admin intelligence workflows, and live integration progress. Review the full submission here:
➡️ [Phase 2 Submission](phase2.md)

Phase 1 Submission: For the original architecture, problem framing, risk model, and core concept documentation, review:
➡️ [Phase 1 Submission](phase1.md)

## 1. Executive Problem & Solution Overview

India’s gig economy relies on delivery partners whose daily wages are highly vulnerable to external disruptions (heavy rain, extreme heat, severe pollution, curfews). Studies show these disruptions reduce earnings by 20–30% during affected weeks.

**GigAssure** is an AI-powered parametric insurance platform that automatically compensates delivery workers for **lost income** when external disruptions impact their ability to work. _(Note: We strictly exclude coverage for health, accidents, or vehicle damage to focus purely on income protection)._

---

## 2. Target Persona & Application Workflow

**Persona:** Rahul, 27 | City: Delhi | Platform: Swiggy
**Profile:** Full-time partner completing 18–22 deliveries/day, earning ₹800–₹1000 daily.
**Vulnerability:** Heavy rainfall shuts restaurants early; extreme heat reduces outdoor hours; pollution limits stamina. Earnings drop by ₹200–₹300/day during these events.

### 🔄 The Zero-Touch Workflow (Rahul's Scenario)

1. **Optimized Onboarding:** Rahul registers via the web app.
2. **AI Risk Profiling:** The ML engine analyzes his localized risk (Delhi weather/AQI trends) to suggest a dynamic weekly premium.
3. **Policy Activation:** Rahul subscribes to a plan. Coverage locks in for the upcoming 7-day cycle.
4. **Parametric Automation (Real-time):** On Wednesday, Delhi hits an AQI of 450. GigAssure's API integration detects the threshold breach.
5. **Activity Validation:** The system queries simulated platform APIs to verify Rahul was active in the affected zone but suffered an order drop.
6. **Automatic Claim Initiation:** For 99% of trusted users, the claim triggers instantly with zero manual paperwork. (Note: If a user's device telemetry triggers a fraud alert, the system temporarily halts the auto-claim and applies 'Adaptive Friction', requiring a quick video upload to verify reality).
7. **Instant Payout:** Income protection payout is processed immediately via the Razorpay sandbox.

---

## 3. The Weekly Pricing Model & Parametric Triggers

Gig workers operate on weekly cash flows. Our dynamic Weekly Pricing Model matches this reality while maintaining a sustainable **Actuarial Loss Ratio** to protect the platform's liquidity pool:

- **Basic Plan:** ₹35/week → Maximum payout: ₹350 _(Capped at ₹150/day)_
- **Standard Plan:** ₹50/week → Maximum payout: ₹600 _(Capped at ₹250/day)_
- **Premium Plan:** ₹80/week → Maximum payout: ₹1000 _(Capped at ₹400/day)_

**AI Dynamic Pricing & Pool Defense:** Base premiums adjust dynamically via AI to offset localized cluster-claim risks during predictable seasonal events. (e.g., Normal week = ₹35; High rainfall forecast week = ₹60).

### ⚡ Parametric Disruption Triggers (Loss of Income Only)

Payouts are triggered strictly by measurable, external APIs:

- **Heavy Rain:** > 50 mm in 24 hours _(Weather API)_
- **Extreme Heat:** > 45°C _(Weather API)_
- **Severe Pollution:** AQI > 400 _(Air Quality API)_
- **Curfew:** Zone lockdown notification _(Traffic/Gov API)_

---

## 4. 🚨 Adversarial Defense & Anti-Spoofing (Market Crash Protocol)

**The Crisis:** A 500-user syndicate utilizing advanced fake GPS to simulate presence in a disruption zone and drain the liquidity pool.
**The Reality:** Simple GPS verification is dead. We utilize a **Multi-Dimensional Proof of Presence** model.

### 1. The Differentiation (Evaluating Physical Realism)

We counter algorithmic GPS "drift" and hardware spoofing by moving beyond simple location logic:

- **Sensor Fusion (Accelerometer vs. GPS):** If simulated GPS shows movement, but the device accelerometer/gyroscope reports absolute zero variance (phone sitting flat on a click-farm desk), the claim is instantly flagged.
- **Mock Location Flagging:** Our frontend actively polls native OS-level developer flags (e.g., Android's `isMockLocation` API) to detect coordinate injection.
- **Velocity Checks (The "Superman" Rule):** If a worker's last known authentic API ping was 20km away just two minutes prior, the time-space impossibility voids the claim.

### 2. The Data (Catching a Coordinated Ring)

Our Scikit-learn models cross-reference specific data points beyond basic GPS to catch macro-patterns:

- **IP-to-Geo Correlation:** Every API request captures the incoming IP. A massive mismatch between resolved IP geography and GPS payload triggers an instant ban.
- **Platform "Proof of Work" (Historical Baselines):** We validate simulated Platform APIs. A genuinely stranded worker has a history of completed deliveries leading up to the disruption. Fraud rings spin up inactive accounts right as the event starts. **No prior daily activity = No payout.**
- **Timestamp & Device Fingerprint Clustering:** If 500 claims trigger within the exact same 3-second window, from newly activated plans sharing identical device fingerprints, the AI categorizes it as a Sybil attack and isolates the pool.

### 3. The UX Balance (Protecting Honest Workers)

We use **Adaptive Friction** to protect honest workers experiencing genuine network drops:

- **Interactive Proof of Reality (EXIF Validation):** If telemetry is anomalous but the user has a high trust score, they are prompted for "Secondary Validation." The worker captures a 3-second live video or photo of the weather condition. We extract the **EXIF metadata** (original hardware timestamp and camera-sensor GPS tags) to ensure it was taken _in the moment_. Honest workers pass in 10 seconds; click farms cannot scale this manually.

---

## 5. Comprehensive Exploit Prevention & Sustainability

To ensure the insurance pool remains financially sustainable while strictly adhering to a worker-friendly **Weekly Model**, GigAssure implements the following logic:

- **Fixed Weekly Cycles & 48-Hour Enrollment Blackout (The Core Defense):** GigAssure operates on a **Universal Fixed Weekly Cycle** (e.g., Monday 12:00 AM to Sunday 11:59 PM). To prevent adverse selection (e.g., a worker checking a weather app on Sunday night and buying a policy for a storm hitting Monday morning), we enforce a strict 48-hour enrollment cutoff.
  - _How it works:_ To be covered for the upcoming Monday–Sunday cycle, a worker must subscribe by **Friday at 11:59 PM**.
  - _The Failsafe:_ Any policy purchased during the Saturday/Sunday blackout window is locked out of the immediate week and automatically rolls over to activate for the _following_ week's cycle. This completely neutralizes short-term weather forecasting exploits.
- **Threshold Gaming & Partial Day Mitigation:** Payouts are time-weighted (proportional to disruption duration) and require both the parametric threshold to be crossed _and_ an actual verified income drop.
- **Platform Demand Mismatch:** Suppresses payouts if a disruption (like light rain) actually increases delivery demand and the worker's earnings remain stable.
- **Zone Boundary Manipulation:** Validates actual delivery routes and order locations rather than relying on static GPS pings.
- **Multi-Trigger Abuse:** Restricts payouts to one compensation event per defined time window, even if multiple triggers (rain + pollution) occur simultaneously.

---

## 6. AI/ML Integration Architecture

1. **Risk Assessment:** ML models analyze historical weather/disruption data to estimate hyper-local risk levels.
2. **Dynamic Premium Pricing:** AI adjusts weekly premiums dynamically based on predicted disruption probabilities.
3. **Intelligent Fraud Detection:** Anomaly detection models run continuously to identify suspicious claims, repeated claim patterns, and adverse selection behaviors.

---

## 7. Platform Choice: Web vs. Mobile

GigAssure will initially launch as a **Progressive Web Application (PWA)** built on React/Next.js.

- **Justification:** A web platform allows for faster development, easier API testing, and immediate cross-device accessibility (iOS/Android) without App Store approval friction. Our decoupled architecture ensures a seamless future transition to a native mobile app.

---

## 8. Technology Stack & Dashboards

- **Frontend:** React / Next.js
- **Backend:** Node.js / Express
- **Database:** MongoDB
- **AI/ML:** Python, Scikit-learn
- **APIs:** Weather APIs, Traffic APIs
- **Payments:** Razorpay Sandbox

### Analytics Dashboards

- **Worker Dashboard:** Active policy, weekly premium, coverage status, claim history, and total income protected.
- **Admin Dashboard:** Total active policies, claim ratios, live fraud alerts, and predictive risk maps for upcoming weeks.

---

## 9. 6-Week Development Plan & Phase 1 Deliverables

- **Phase 1 (Current):** Research, Persona Definition, System Architecture, Idea Documentation, and Market Crash Defense.
- **Phase 2:** User registration, Policy creation, Dynamic premium calculation engine, Claim automation logic.
- **Phase 3:** Fraud detection models, Instant payout simulation, Dashboard development.

### Phase 1 Deliverables

- ✅ Idea Document (This README)
- ✅ GitHub Repository Structure
- 🎥 **[https://youtu.be/mCH__EvQ4JY]**
