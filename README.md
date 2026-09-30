# StrataCloud Infrastructure — Revenue Intelligence & Commercial Analytics Engine

A production-grade, portfolio-safe commercial intelligence application demonstrating advanced enterprise revenue operations (RevOps), financial planning & analysis (FP&A) modeling, BigQuery SQL data architecture, and publication-tier interactive data visualization.

---

## 1. Executive Summary

This application models the commercial operations and financial performance of **StrataCloud Infrastructure Inc.**—a high-growth B2B distributed compute, RPC data fabric, and cryptographic key management platform.

Unlike default business intelligence software or generic tutorial dashboards, this project addresses the complex mathematical and operational disconnect between **CRM bookings (TCV/ACV)** and **GAAP P&L recognized revenue (ASC 606)** over time.

### Core Value Demonstrated:
- **Commercial Acumen**: Reasoning through ARR bridges, NRR expansion curves, multi-year contract backlog, and quota coverage.
- **Data Engineering & SQL Mastery**: Production-grade CTE pipelines featuring calendar spines, window function lags, and unioned multi-grain semantic views.
- **Product Design & Information Architecture**: High-density fintech aesthetic, bespoke D3/SVG flow and waterfall visualizations, and slide-out drill-down ledgers.

---

## 2. Privacy & Synthetic Data Guarantee

> [!IMPORTANT]
> **Strict Privacy Standard**: All accounts, opportunity amounts, contract terms, pricing structures, and sales personnel in this project are **100% synthetically generated** using a deterministic pseudorandom seed (`#881273`). No proprietary corporate records, customer names, credentials, or internal company datasets are present.

---

## 3. Key Analytical Concepts Demonstrated

### A. Closed Won → Revenue Realization Engine
In enterprise contracts, signing a deal in Salesforce is not revenue. This engine simulates the **four distinct phases** of commercial realization:
1. **Commercial Execution**: Booking of Total Contract Value (TCV) and Annualized Contract Value (ACV).
2. **Provisioning & Ramp Friction**: 14 to 45 days of VPC peering, node deployment, and KMS key generation, which causes in-year revenue slippage.
3. **ASC 606 Straight-Line Amortization**: Ratable monthly recognition ($\text{ACV} / 12$) matching economic delivery.
4. **Multi-Year Committed Backlog**: Locking in unearned contract value for subsequent fiscal years as carried-in baseline.

### B. Annual Recurring Revenue (ARR) Waterfall Bridge
Decomposes net ARR growth across discrete commercial drivers:
$$\text{Ending ARR} = \text{Beginning Base} + \text{New Logo Land} + \text{Expansion / Upsell} - \text{Contraction} - \text{Logo Churn}$$
- Calculates trailing twelve-month **Net Revenue Retention (NRR: 117.8%)** and **Gross Revenue Retention (GRR: 94.2%)**.

### C. Predictive Dual-Horizon Runway & Quota Pacing
- **Dual-Zone Horizon**: Smooth transition from verified historical actuals (solid boundary) into forward committed contracts and probability-weighted pipeline.
- **Stage Probability Weighting**: Normalized pipeline conversion rates:
  - *Qualifying*: 10%
  - *Technical Evaluation*: 30%
  - *Proposal & Quote*: 60%
  - *Negotiation & Legal*: 80%
  - *Closed Won*: 100%
- **Dynamic Scenario Modeler**: Interactive testing across **Conservative** (0.75x win rate, lagged ramp), **Base** (1.0x), and **Aggressive** (1.25x win rate, accelerated ramp) commercial environments.
- **Quarterly Quota Attainment Schedule**: Tracking quota targets against projected revenue across Q1–Q4 to surface forward target gaps before quarters close.

### D. Multi-Dimensional Concentration & Vintage Cohorts
- **Cross-Dimensional Exploration**: Slicing by Product Family, Geographic Theater (Americas, EMEA, APAC), Customer Tier, and Revenue Type.
- **Longitudinal Cohort Net Retention (NRR) Heatmap**: Visualizing client expansion from contract inception ($M_0$ through $M_{24}$) to evaluate product stickiness.

---

## 4. SQL & Data Architecture (BigQuery / Snowflake)

The application includes an in-app **SQL & Data Architecture Inspector** displaying the warehouse transformations that power the data model:
1. **Calendar Spine & Revenue Recognition Schedule**: Uses `GENERATE_DATE_ARRAY` to fan point-in-time closed contracts across continuous active calendar months.
2. **ARR Bridge & Cohort Movements**: Uses `LAG()` and `PARTITION BY` window functions to isolate new logo additions, account expansion, contraction, and churn without self-joins.
3. **Unioned Multi-Grain Semantic Layer**: Unifies granular deal-level records with pre-aggregated period summary grains and dimensional share percentages for sub-second UI responsiveness.

---

## 5. Technology Stack & Design System

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 with tailored financial UI tokens (deep navy background `#0B0F17`, slate structural containers, emerald actuals `#10B981`, electric cyan `#38BDF8`, and amber quota markers `#F59E0B`).
- **Data Visualization**: Bespoke SVG and D3 math for custom waterfall bridges, multi-stage ramp flows, and dual-zone area charts.
- **Iconography**: Lucide React.
- **State Management**: Reactive state store with URL hash synchronization (`#overview`, `#closed-won`, `#forecast`, `#breakdown`, `#accounts`, `#sql`).

---

## 6. Project Structure

```
revenue-analytics-portfolio-demo/
├── docs/
│   └── reference-analysis.md         # Phase 1 architectural reference & sanitization report
├── src/
│   ├── types/
│   │   └── revenue.ts                 # Domain interfaces (Account, Opportunity, Schedule)
│   ├── data/
│   │   ├── syntheticData.ts           # Deterministic PRNG and synthetic data generator
│   │   └── sqlSnippets.ts             # BigQuery CTE queries & architectural takeaways
│   ├── lib/
│   │   ├── analytics.ts               # Calculation engine (ARR bridge, KPIs, pacing)
│   │   └── formatters.ts              # Currency, date, and percentage formatters
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx             # Global brand header, scenario switcher, time grain
│   │   │   ├── Navigation.tsx         # Tab navigation with live deal badges
│   │   │   └── FilterBar.tsx          # Cross-filters (region, product, segment, weighting)
│   │   ├── common/
│   │   │   ├── MetricCard.tsx         # Executive KPI card with micro-sparklines
│   │   │   ├── Badge.tsx              # Normalized status badges
│   │   │   └── Drawer.tsx             # Slide-out account/opportunity inspection drawer
│   │   ├── charts/
│   │   │   ├── ClosedWonFlowChart.tsx # Bespoke Closed Won → Revenue realization flow
│   │   │   ├── ArrWaterfallChart.tsx  # Bespoke ARR bridge waterfall
│   │   │   ├── ForecastHorizonChart.tsx# Dual-zone time-series runway
│   │   │   ├── RevenueMixChart.tsx    # Donut composition with dimension shares
│   │   │   └── CohortHeatmap.tsx      # Vintage cohort net retention heatmap
│   │   └── views/
│   │       ├── OverviewView.tsx       # Executive revenue summary
│   │       ├── ClosedWonToRevView.tsx # Dedicated Closed Won → Revenue engine & simulator
│   │       ├── ForecastView.tsx       # Predictive forecast & quarterly quota schedule
│   │       ├── BreakdownView.tsx      # Multi-dimensional portfolio matrix & cohorts
│   │       ├── AccountsView.tsx       # Account 360 & deal ledger with drill-down
│   │       └── SqlArchitectureView.tsx# Production BigQuery CTE pipeline inspector
│   ├── App.tsx                        # Main application container & reactive store
│   ├── main.tsx                       # Entry point
│   └── index.css                      # Tailwind v4 styles and typography
├── dist/                              # Production build output
├── package.json
├── vite.config.ts
└── tsconfig.json
```

---

## 7. Running Locally

```bash
# Clone or navigate to the directory
cd /Users/donatasstarkus/Developer/revenue-analytics-portfolio-demo

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev

# Or build and preview production bundle
npm run build
npm run preview -- --port 4173
```

Access the application in your browser at:
`http://localhost:4173/` (or `http://localhost:5173/` in dev mode).

---

## 8. Portfolio Context

This project serves as an interactive portfolio exhibit demonstrating:
- The ability to bridge the gap between commercial sales data, corporate financial accounting, and high-performance software engineering.
- Deep comprehension of recurring revenue dynamics (ARR, NRR, GRR, ramp delays, multi-year backlog, and ASC 606 revenue recognition).
- Full-stack execution: from data modeling and warehouse query optimization to publication-grade interface engineering.
