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

## 🌟 Key Features & Phase 4 Real Voice Agent

- **Unified 12-State Recovery Engine**: Handles payment failures, checkout drop-offs, subscription churn, corporate invoices, e-mandates, voice follow-ups, and promises-to-pay under a single auditable lifecycle.
- **🎙️ Real Hinglish Voice Recovery Agent**:
  - **Speech-to-Text Microphone**: Built-in Web Speech API (`hi-IN`) microphone for real-time Hinglish voice transcription.
  - **Gemini AI Intent Parser**: Classifies speech into 6 structured intents (`PAY_NOW`, `TRY_LATER`, `DECLINE`, `NEEDS_HELP`, `HUMAN_AGENT`, `WRONG_NUMBER`).
  - **Text-to-Speech Spoken Audio**: Synthesizes natural empathetic Hindi/English agent responses directly in browser audio.
  - **Automated Workflow Execution**: Dispatches WhatsApp payment links (`PAY_NOW`), records `Promise-to-Pay` commitments (`TRY_LATER`), escalates billing queries (`NEEDS_HELP`/`HUMAN_AGENT`), or blocks cases (`DECLINE`).
- **Deterministic Policy Gatekeeper (10 Rules)**: Hard merchant safety rules checking consent, calling hours (10:00 AM – 7:00 PM IST), retry limits, cooldown periods, and maximum amount thresholds.
- **Responsive & Animated UI**: Fully responsive sidebar drawer and topbar navigation across mobile, tablet, and desktop screens with smooth micro-animations.
- **Complete Settlement Verification**: Independent bank and gateway verification prior to marking revenue as recovered.
- **Immutable Audit Trail**: Every webhook, AI inference, policy check, and provider dispatch is stored with cryptographically timestamped records.

---

## 🏗️ Architecture & Flow

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
Action Orchestrator (Smart Retry / WhatsApp / Hinglish Voice Agent)
          │
          ▼
Customer Speech & Intent Parsing (PAY_NOW | TRY_LATER | DECLINE)
          │
          ▼
Outcome Executed & Database Logged (Promise Tracker / Audit Trail)
```

---

## ⚡ 7 Core Recovery Workflows

| # | Workflow | Primary Trigger | Recovery Mechanism | Safety Guardrail |
|---|---|---|---|---|
| **1** | **Payment Degradation** | `payment_failed` (Card/UPI/NetBanking) | Smart retry with optimal gateway routing | Max 4 retries, cooling interval |
| **2** | **Checkout Drop-off** | Abandoned high-intent checkout session | Personalized WhatsApp/Email payment link with 1-click checkout | Consent check, single reminder cap |
| **3** | **Subscription Churn** | Recurring renewal failure / expired card | Grace-period card update prompt + localized notification | Churn prevention policy, no over-contact |
| **4** | **B2B Receivables Chaser** | Corporate invoice overdue (1–60+ days) | Multi-touch aging cadence (friendly → firm → account owner escalation) | Max 3 reminders/month, escalation on 30d+ |
| **5** | **Mandate Retry Sequencer** | NACH / e-Mandate / UPI AutoPay debit failure | Liquidity-aware re-presentment on salary cycles (1st–5th) | Mandatory 72-hour cooling period |
| **6** | **Hinglish Voice Recovery** | High-touch unpaid case requiring verbal contact | Conversational IVR in natural Hinglish with speech STT & TTS | Call window 10:00 AM – 7:00 PM IST only |
| **7** | **Promise-to-Pay Tracker** | Customer commits to pay on future date | Automated morning reminder on due date + payment verification | Escalation if promise broken after 24h grace |

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16.3.4](https://nextjs.org/) (App Router, Turbopack, Server Actions)
- **UI & Styling**: [React 19.2.8](https://react.dev/), [Tailwind CSS 4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Database & ORM**: [PostgreSQL](https://www.postgresql.org/) (Neon Serverless with PgBouncer connection pooling) + [Drizzle ORM 0.45.2](https://orm.drizzle.team/)
- **AI / LLM Engine**: [Google Gemini 2.5 Flash](https://ai.google.dev/) via official `@google/genai` SDK
- **Testing**: [Vitest 4.1.11](https://vitest.dev/) (Unit & workflow test suites)
- **TypeScript**: Strict mode with TypeScript 5.x

---

## 🚀 Getting Started & Deployment

### 1. Installation

```bash
git clone https://github.com/your-username/recovero.git
cd recovero
npm install
```

### 2. Environment Setup

Create `.env`:

```env
DATABASE_URL="postgresql://user:password@neon.tech/neondb?sslmode=require"
GEMINI_API_KEY="your_gemini_api_key_here"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### 3. Database Migration & Seed

```bash
# Push Drizzle schema to PostgreSQL
npx drizzle-kit push:pg

# Seed realistic demo dataset
npx tsx scripts/seed.ts
```

### 4. Development & Testing

```bash
# Start development server
npm run dev

# Run Vitest test suite
npx vitest run

# Run TypeScript type check
npx tsc --noEmit
```

### 5. Production Deployment Commands

#### Deploy on Vercel
```bash
npm i -g vercel
vercel --prod
```

#### Production Build & Run (Node.js / VPS)
```bash
npm run build
npm run start
```

---

## 📄 License

MIT License. Designed and built for modern revenue teams and financial infrastructure.
