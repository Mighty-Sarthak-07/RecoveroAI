# RecoveroAI — Autonomous Revenue Recovery Platform

[![Next.js](https://img.shields.io/badge/Next.js-16.3.4-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45.2-green?style=flat-square)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Serverless-336791?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Google Gemini](https://img.shields.io/badge/AI_Engine-Gemini_2.5_Flash-orange?style=flat-square&logo=google)](https://ai.google.dev/)
[![Vitest](https://img.shields.io/badge/Tests-20%2F20_Passing-brightgreen?style=flat-square&logo=vitest)](https://vitest.dev/)

> **Find revenue that's slipping away. Win it back.**  
> RecoveroAI is an autonomous, policy-bounded revenue recovery engine designed for Indian and global merchants. It detects revenue leaks across payments, subscriptions, invoices, and mandates, diagnoses root causes with Google Gemini AI, enforces strict deterministic merchant guardrails, and automates multi-channel resolution.

---

## Key Highlights

- **Unified 12-State Recovery Machine**: Handles payment failures, checkout drop-offs, subscription churn, corporate invoices, e-mandates, voice follow-ups, and promises-to-pay under a single auditable lifecycle.
- **AI-Powered Diagnostics**: Utilizes **Google Gemini 2.5 Flash** (`@google/genai`) to synthesize payment metadata, historical retry behavior, and customer lifetime value into targeted candidate interventions.
- **Deterministic Policy Gatekeeper (Kill Switch)**: 10 hard merchant safety rules that prevent duplicate charges, enforce contact consent, restrict calling hours to 10:00 AM – 7:00 PM IST, and escalate high-value transactions above merchant thresholds.
- **Empathetic Hinglish Voice Recovery**: Automated conversational IVR adapter that negotiates commitments and captures structured customer intent (`PAY_NOW`, `TRY_LATER`, `DISPUTE`).
- **Complete Settlement Verification**: Independent bank and gateway verification prior to marking revenue as recovered.
- **Immutable Audit Trail**: Every webhook, AI inference, policy check, and provider dispatch is stored with cryptographically timestamped records.

---

## Architecture & Lifecycle

```
Merchant Command Center
          │
          ▼
Revenue Leak Detected (Webhooks / Simulation)
          │
          ▼
Risk Engine (0–100 Score & Priority Assignment)
          │
          ▼
AI Root-Cause Diagnosis (Gemini 2.5 Flash)
          │
          ▼
Policy Gatekeeper (10 Deterministic Merchant Rules)
    ├── ALLOW ──────────────┐
    └── BLOCK / ESCALATE ───┼──► Human Operator Queue
                            │
                            ▼
Action Orchestrator (Retry / WhatsApp / Email / Voice)
          │
          ▼
Customer Resolution / Bank Settlement
          │
          ▼
Outcome Verifier (Reconciliation Check)
          │
          ▼
Revenue Marked RECOVERED & Analytics Updated
```

---

## 7 Core Recovery Workflows

| # | Workflow | Primary Trigger | Recovery Mechanism | Safety Guardrail |
|---|---|---|---|---|
| **1** | **Payment Degradation** | `payment_failed` (Card/UPI/NetBanking) | Smart retry with optimal gateway routing | Max 4 retries, cooling interval |
| **2** | **Checkout Drop-off** | Abandoned high-intent checkout session | Personalized WhatsApp/Email payment link with 1-click checkout | Consent check, single reminder cap |
| **3** | **Subscription Churn** | Recurring renewal failure / expired card | Grace-period card update prompt + localized notification | Churn prevention policy, no over-contact |
| **4** | **B2B Receivables Chaser** | Corporate invoice overdue (1–60+ days) | Multi-touch aging cadence (friendly → firm → account owner escalation) | Max 3 reminders/month, escalation on 30d+ |
| **5** | **Mandate Retry Sequencer** | NACH / e-Mandate / UPI AutoPay debit failure | Liquidity-aware re-presentment on salary cycles (1st–5th) | Mandatory 72-hour cooling period |
| **6** | **Hinglish Voice Recovery** | High-touch unpaid case requiring verbal contact | Conversational IVR in natural Hinglish with intent detection | Call window 10:00 AM – 7:00 PM IST only |
| **7** | **Promise-to-Pay Tracker** | Customer commits to pay on future date | Automated morning reminder on due date + payment verification | Escalation if promise broken after 24h grace |

---

## Tech Stack

- **Framework**: [Next.js 16.3.4](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **UI & Styling**: [React 19.2.8](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) (Neon Serverless with PgBouncer connection pooling) + [Drizzle ORM 0.45.2](https://orm.drizzle.team/)
- **AI / LLM Engine**: [Google Gemini 2.5 Flash](https://ai.google.dev/) via official `@google/genai` SDK
- **Testing**: [Vitest 4.1.11](https://vitest.dev/) (Unit & workflow test suites)
- **TypeScript**: Strict mode with TypeScript 5.x

---

## Project Structure

```
recovero/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/       # Merchant Overview & KPI Command Center
│   │   ├── recoveries/      # Recovery Cases Ledger & Case Detail View
│   │   ├── payments/        # Live Payment Stream & Gateway Status
│   │   ├── subscriptions/   # Recurring Subscription Churn Hub
│   │   ├── b2b/             # B2B Corporate Receivables Chaser
│   │   ├── mandates/        # e-Mandate & NACH Retry Sequencer
│   │   ├── voice/           # Hinglish Voice Recovery Sessions & Audio Simulator
│   │   ├── promises/        # Promise-to-Pay Commitment Ledger
│   │   ├── analytics/       # Recovery Rate & Financial Funnel Analytics
│   │   ├── audit/           # Immutable Audit Trail with Actor Filtering
│   │   └── simulation/      # High-Volume Synthetic Event Simulator
│   ├── api/                 # REST Endpoints for Cases, Workflows & Webhooks
│   └── page.tsx             # Public Product Overview & Architecture Tour
│
├── src/
│   ├── components/          # Production UI Component Hierarchy
│   ├── db/
│   │   ├── schema.ts        # 14 Normalized Relational Tables
│   │   └── index.ts         # Resilient PgBouncer PostgreSQL Connection Client
│   ├── lib/
│   │   ├── agent/           # Google Gemini AI Recovery Decision Agent
│   │   ├── policy/          # Deterministic Policy Gatekeeper (10 Rules)
│   │   ├── risk/            # Explainable 0–100 Risk Scoring Engine
│   │   ├── cost/            # Recovery Economics & Net ROI Optimizer
│   │   ├── recovery/        # State Machine, Orchestrator & Verifier
│   │   ├── workflows/       # Domain-Specific Logic for all 7 Streams
│   │   └── providers/       # Pluggable Communication, Voice & Gateway Adapters
│   └── types/               # Strict TypeScript Models & Domain Enums
│
└── scripts/
    └── seed.ts              # 14 Realistic Production Recovery Fixtures
```

---

## Getting Started

### Prerequisites

- **Node.js**: `v20.x` or later (LTS recommended)
- **Package Manager**: `npm` (v10+)
- **PostgreSQL Database**: Local PostgreSQL instance or a [Neon Serverless](https://neon.tech/) connection string
- **Google Gemini API Key**: Obtainable from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/recovero.git
cd recovero
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
# PostgreSQL Connection (Neon or local)
DATABASE_URL="postgresql://user:password@ep-sample-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Google Gemini API Key
GEMINI_API_KEY="your_gemini_api_key_here"

# Application Environment
NODE_ENV="development"
PORT=3000
```

### 3. Database Migration & Realistic Seeding

Push the schema to your database and load realistic demo scenarios:

```bash
# Push Drizzle schema to PostgreSQL
npx drizzle-kit push:pg

# Seed realistic demo data across all 7 workflows
npx tsx scripts/seed.ts
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the Command Center.

---

## Verification & Testing

RecoveroAI includes automated unit test suites covering the core state machine, policy gatekeeper, risk scoring, cost engine, and domain workflows:

```bash
# Run Vitest test suite
npx vitest run

# Run TypeScript compiler check
npx tsc --noEmit

# Run ESLint check
npm run lint

# Build production bundle
npm run build
```

---

## Pre-Seeded Interactive Scenarios

When you run `npx tsx scripts/seed.ts`, the following realistic scenarios are populated:

1. **Hero Recovery Case (Rahul Sharma — ₹2,499)**:
   - Debit card declined for insufficient funds during renewal.
   - Diagnosed by Gemini AI $\rightarrow$ Approved within policy $\rightarrow$ Delayed retry scheduled $\rightarrow$ Verified and marked `RECOVERED`.
2. **Policy Block / Kill Switch Demo (Vikram Malhotra — ₹200,000)**:
   - High-value failure with 4 prior retry attempts.
   - Automatically blocked by `RULE_1_MAX_RETRIES` and `RULE_2_HIGH_VALUE` $\rightarrow$ Escalated to Human Collections Specialist without charging.
3. **B2B Corporate Invoice (TechCorp Global — ₹85,000)**:
   - 12 days overdue on annual enterprise contract.
   - Multi-channel cadence dispatched with audit logging.
4. **Mandate Retry Sequencer (Rahul Sharma — ₹2,499)**:
   - NACH e-Mandate debit failure queued for liquidity-aware cooling window.
5. **Hinglish Voice Recovery Session (Rahul Sharma)**:
   - Conversational IVR where customer responds *"Kal subah 10 baje pakka kar dunga"*.
   - Natural language intent parsed as `TRY_LATER` $\rightarrow$ Automated Promise-to-Pay created.

---

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/analytics` | Returns real-time recovery metrics, funnel counts, and channel breakdown |
| `GET` | `/api/recoveries` | Lists recovery cases filtered by workflow and status |
| `GET` | `/api/recoveries/:id` | Returns complete case snapshot, customer context, and audit log |
| `POST` | `/api/recoveries/:id/run-agent` | Triggers Google Gemini AI diagnosis & candidate action recommendation |
| `POST` | `/api/recoveries/:id/execute` | Executes an approved action through provider adapters |
| `POST` | `/api/recoveries/:id/verify` | Verifies settlement and marks case as `RECOVERED` |
| `POST` | `/api/demo/generate` | Generates a fresh batch of synthetic multi-channel revenue leak events |
| `POST` | `/api/voice/sessions` | Initiates a simulated Hinglish conversational voice recovery call |
| `POST` | `/api/promises/:id/verify` | Verifies fulfillment of a recorded Promise-to-Pay |

---

## Security & Reliability Principles

- **Prepared Statement Safety**: Database connection handles PgBouncer transaction pooling seamlessly with `prepare: false` to prevent pool desynchronization.
- **Idempotency Guarantee**: All incoming payment and webhook events are deduplicated against unique transaction identifiers in `raw_events`.
- **Zero Hallucination Actions**: The AI suggests candidate actions, but all actions must pass through deterministic TypeScript policy rules before execution.
- **No In-Memory Schedulers**: Retries and future actions rely on persistent database timestamps (`nextActionAt`) rather than ephemeral timers.

---

## License

MIT License. Designed and developed for modern revenue teams and financial infrastructure.
