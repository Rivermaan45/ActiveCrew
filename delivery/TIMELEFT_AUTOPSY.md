# Timeleft Autopsy — Timeline, Lessons & Citations

> **Purpose:** Understand exactly how Timeleft went from zero to €18M ARR in 27 months, what they tried that failed, and what ActiveCrew can learn.

---

## Complete Timeline

| Date | Event | Revenue/Metrics |
|------|-------|----------------|
| 2019 | Maxime Barbier forced out of MinuteBuzz after sale to TF1 | — |
| Apr 2020 | Launches Timeleft v1: dream-sharing social network | 5,000 dreams in 1 week |
| Sep 2020 | Formally co-founds with Adrien de Oliveira | — |
| 2021 | Seed round: FJ Labs + Kima Ventures (~$500K–1M) | — |
| 2021–22 | **Pivots to activities → groups → dating. ALL FAIL.** | — |
| Apr 2023 | Almost broke. 15-day test with Typeform + WhatsApp + Stripe | Near-zero runway |
| May 3, 2023 | **FIRST DINNER — 24 people in Lisbon** | €125 revenue in week 1 |
| Aug 2023 | Lisbon traction explodes | 20,000 subscribers, 6,000 participants |
| Sep 2023 | Expands to Paris, Marseille, Porto. CNN coverage | — |
| Dec 2023 | Monthly revenue milestone | €20K MRR |
| Jan 2024 | Barcelona opens via ads only — zero local team | — |
| 2024 | Opens ~1 city/day. Peaks at 325 cities | — |
| Jul 2024 | **Series A: $7M** (Redstone, Smash Capital, FJ Labs, Global Founders Capital) | — |
| Sep 2024 | Major milestone | **€1M MRR** — built entirely on Bubble + FlutterFlow |
| 2025 | Cuts to 220 cities (depth > breadth). ~100 employees | **€18M ARR**, 150K monthly participants, 3M+ total |

---

## What Failed Before Dinners (2020–2022)

1. **Dream-sharing social network** (2020) — novelty wore off in weeks
2. **Activity matching** (2021) — too fragmented, couldn't reach liquidity in any city
3. **Group activities** (2021–22) — coordination overhead killed conversion
4. **Dating features** (2022) — already a crowded market, no differentiation

**Key insight:** 3 years and 4+ pivots before product-market fit. The founders burned through most of their seed funding before discovering dinners.

---

## Why Dinners Worked (When Everything Else Didn't)

| Factor | Why It Matters |
|--------|---------------|
| **Single format** | One product (dinner for 6) vs. infinite activity types |
| **Charged from day 1** | €26/ticket = revenue-positive immediately |
| **Zero logistics** | Restaurant handles food, space, staff. Timeleft just fills seats |
| **Content machine** | Every dinner = 6 people with phones posting stories |
| **60% women** | Group format + public venue + curation = safety signal |
| **No cold-start** | You don't need "the other person" — the table fills regardless |

---

## Critical Lessons for ActiveCrew

### 1. Validate with zero code
Timeleft's first dinner used Typeform (signup) + WhatsApp (coordination) + Stripe (payment). No app, no backend, no infrastructure. **ActiveCrew should validate the session concept with manual concierge before building automation.**

### 2. Charge from day one
€125 in week 1. Not free-trial-to-premium. Not freemium. Direct payment. **ActiveCrew's per-session model ($15–25) mirrors this exactly.**

### 3. Single format beats marketplace
"70 sports" kills liquidity (see: Smatch). "Dinner for 6 strangers" is one product. **ActiveCrew should launch with 3 sports (Running, Tennis, Padel) in 1 neighborhood (Williamsburg).**

### 4. They tried activity matching and it failed
Timeleft explicitly attempted activities matching in 2021–2022 and abandoned it. **Counter-argument:** sports is a tighter niche than "activities" and has natural scheduling cadence (weekly runs, Saturday tennis). ActiveCrew is NOT a general activity matcher.

### 5. No-code can reach €1M MRR
Bubble + FlutterFlow powered the business to €1M/month. **Don't over-engineer. Ship fast, iterate based on user behavior.**

### 6. Content creates itself
Every session = content. **ActiveCrew must build this into the product: post-session photo prompts, recap stories, shareable cards.**

### 7. Hyper-local then expand
Lisbon → Paris → Barcelona. One city at a time. **ActiveCrew: Williamsburg → NYC → other cities.**

---

## Authoritative Citations

1. **Sifted (Jul 2024):** "Timeleft, the app that organises dinners with strangers, raises $7M Series A" — Details the fundraise from Redstone and Smash Capital, the €1M MRR milestone, and expansion to 150+ cities.
   SOURCE_NEEDED: [Sifted article URL — search "Timeleft Series A Sifted 2024"]

2. **TechCrunch (Sep 2023):** "Timeleft connects strangers for weekly dinners, now expanding across Europe" — Covers the Lisbon origin story, the Typeform+WhatsApp+Stripe MVP, and early traction of 20,000 subscribers.
   SOURCE_NEEDED: [TechCrunch article URL — search "Timeleft TechCrunch 2023 dinners strangers"]

3. **CNN Travel (Sep 2023):** "This app matches strangers for dinner — and it's taking Europe by storm" — CNN feature covering the cultural phenomenon and the 60% female user base.
   SOURCE_NEEDED: [CNN Travel article URL — search "CNN Timeleft dinner strangers 2023"]

---

## Risk Assessment for ActiveCrew

| Risk | Timeleft Analogy | Mitigation |
|------|-----------------|------------|
| Cold-start (empty sessions) | They solved it with manual seeding in Lisbon | Founder-run sessions, seed_mode endpoint, 50 virtual personas |
| Revenue model | They charged €26/dinner from day 1 | Charge $15–25/session from launch |
| Activity fragmentation | They abandoned activities for single-format dinners | Limit to 3 sports, expand slowly |
| Retention | Dinners are inherently novel each time | Sport-specific levels + reliability scores + streak system |
| Competition | No real competitor for dinner-for-strangers | GoodRec is closest for sports; differentiate with accountability stack |

---

*Last updated: March 2, 2026*
