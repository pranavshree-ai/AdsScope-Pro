# AdScope - Production Competitive Ad Intelligence Platform

> **AdScope** is a multi-tenant SaaS web application for competitive advertising intelligence. Users define a niche and competitors; the system automatically discovers, collects, analyzes, and monitors competitor ads from public ad libraries (Meta Ad Library, Google Ads Transparency Center, TikTok Creative Center), deconstructs them with structured AI rails, and generates data-backed, grounded ad strategies.

---

## Key Highlights

- **Multi-Tenant SaaS Architecture**: Workspaces with RBAC (Owner, Admin, Member), tenant isolation enforced at the query boundary, subscription tiers (Free Trial, Starter, Pro, Agency), and automated usage metering.
- **Provider-Adapter Ingestion**: Clean interface (`AdSourceAdapter`) wrapping official APIs (Meta Graph API, Google Transparency, TikTok Creative Center) with robust fallback datasets and zero personal data collection.
- **Idempotent Ingestion & Deduplication**: Perceptual/content hashes, duration tracking (`first_seen_at`, `last_seen_at`, `active_days`), and historical spend/impression snapshots.
- **Landing Page Parser**: Destination URL extraction capturing headline, offer, pricing cues, and social proof indicators.
- **AI Deconstruction Engine**: Structured Zod schema extraction for hook type (`contrarian`, `social_proof`, `curiosity`, `direct_offer`, `how_to`, `pain_point`), angle, offer, CTA, emotional driver, objection handled, and funnel stage.
- **Whitespace & Longevity Aggregations**: Automatically computes the top 10% longevity winners, competitor creative velocity (weekly ad launch rate), and underserved whitespace market gaps.
- **100% Grounded Strategy Lab**: Generates positioning gaps, 10 distinct ad concepts, and a 2-week testing roadmap. Every single concept strictly cites underlying competitor ads (`cited_ad_ids`).
- **Surveillance & Alerting**: Real-time watch rules (`new_ad`, `new_offer`, `velocity_spike`, `ad_stopped`) with in-app notifications and Slack incoming webhook dispatch.

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router) + TypeScript Strict, Tailwind CSS, Lucide Icons, Recharts
- **Backend**: Next.js Route Handlers + Node Background Worker Daemon
- **Database**: PostgreSQL with Drizzle ORM (schema in `src/db/schema.ts`) + In-memory/persisted fallback for instant zero-dependency execution
- **Queues**: BullMQ & Redis queues with asynchronous in-process queue runner
- **AI/LLM**: Anthropic Claude 3.5 Sonnet behind an internal `LLMService` with strict Zod validation, prompt versioning, and cost logging
- **DevOps**: Docker, Docker Compose, Vitest test suite, GitHub Actions CI

---

---

## 🔒 Confidential Data, Security & Secrets Policy

To ensure production security and prevent credential leakage:
- **`node_modules/` is strictly excluded from Git**: Dependencies are not committed to the repository and are resolved via `npm install` or during Docker image construction.
- **`.env` and secret files are strictly excluded**: Local environment files containing sensitive API tokens (`.env`, `.env*.local`, `*.pem`, `*.key`) are included in `.gitignore` and **must never be committed to GitHub**.
- **Template Configuration via `.env.example`**: All required environment variables are documented with safe placeholders in [`.env.example`](.env.example).

### Setting Up Your Environment
To configure your local environment, copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Environment Variables Reference

| Variable | Description | Default / Example | Confidential? |
|---|---|---|:---:|
| `NODE_ENV` | Application environment (`development` / `production`) | `development` | No |
| `DATABASE_URL` | PostgreSQL connection string (supports `pgvector`) | `postgresql://adscope:adscope_secret@localhost:5432/adscope_db` | **Yes (in prod)** |
| `REDIS_URL` | Redis connection URL for BullMQ queue & worker | `redis://localhost:6379` | **Yes (in prod)** |
| `AUTH_SECRET` | 32+ character JWT secret for multi-tenant sessions | Auto-generated or custom | **Yes** |
| `LLM_PROVIDER` | AI Provider (`mock`, `anthropic`, `openai`) | `mock` (zero-cost offline testing) | No |
| `ANTHROPIC_API_KEY` | Anthropic Claude API key for strategy generation | `sk-ant-...` | **Yes** |
| `OPENAI_API_KEY` | OpenAI API key for embeddings & fallback | `sk-proj-...` | **Yes** |
| `STRIPE_SECRET_KEY` | Stripe secret API key for billing & subscriptions | `sk_test_...` | **Yes** |
| `STRIPE_WEBHOOK_SECRET`| Stripe webhook HMAC signing secret | `whsec_...` | **Yes** |
| `SENTRY_DSN` | Sentry DSN for application telemetry & exception logging | `https://...@sentry.io/...` | **Yes** |
| `SLACK_WEBHOOK_URL` | Incoming webhook URL for surveillance alerts | `https://hooks.slack.com/services/...` | **Yes** |
| `DEFAULT_ALERT_EMAIL` | Destination email for weekly digests & alert notifications | `notifications@adscope.internal` | No |

---

## Quick Start (Zero-Setup Demo)

AdScope is equipped with a seeded demo dataset and fallback adapters so you can explore the full platform locally without configuring external API keys.

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/pranavshree-ai/AdsScope-Pro.git
cd AdsScope-Pro
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with any live API keys if testing live providers
```

### 3. Seed Demo Data
```bash
npm run db:seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Running with Docker Compose

To run the full stack with PostgreSQL (pgvector), Redis, Next.js Web App, and Worker:

```bash
docker-compose up --build
```
This boots:
- Web App on `http://localhost:3000`
- Worker service on background daemon
- PostgreSQL on port `5432`
- Redis on port `6379`

---

## Running Test Suite

AdScope features a comprehensive unit and integration test suite (Vitest):

```bash
npm run test
```

Type checking:
```bash
npx tsc --noEmit
```

---

## Project Structure

```
├── .github/workflows/ci.yml     # Automated CI pipeline
├── docs/
│   ├── ARCHITECTURE.md          # Architectural decisions & system diagrams
│   └── COMPLIANCE.md            # Zero-personal-data & public ToS policy
├── src/
│   ├── app/
│   │   ├── (dashboard)/...      # App router pages: /, /niches, /explorer, etc.
│   │   ├── api/...              # Tenant-isolated REST route handlers
│   │   └── globals.css          # Design system & dark obsidian theme
│   ├── components/              # Navbar, Sidebar, modals, drawers
│   ├── db/
│   │   ├── schema.ts            # Drizzle PostgreSQL schema (20 tables)
│   │   ├── repo.ts              # Tenant-scoped repository abstraction
│   │   └── seed.ts              # Demo data seed script
│   ├── lib/
│   │   ├── auth.ts              # Multi-tenant session context & RBAC
│   │   ├── plans.ts             # SaaS limits and entitlement checks
│   │   └── logger.ts            # Pino structured logger
│   ├── services/
│   │   ├── adapters/            # Meta, Google, TikTok provider adapters
│   │   ├── discovery-service.ts # Competitor auto-discovery
│   │   ├── ingestion-service.ts # Idempotent crawl, hash, & active days
│   │   ├── llm-service.ts       # Claude API + Zod schema validation
│   │   ├── analytics-service.ts # Whitespace & longevity aggregations
│   │   ├── strategy-service.ts  # Grounded strategy engine
│   │   └── monitoring-service.ts# Watch rules & Slack alerts
│   └── queue/                   # Background queue orchestrator
└── tests/
    └── adscope.test.ts          # Vitest unit & integration test suite
```

---

## Compliance & Safe Public Data Collection

AdScope collects **strictly publicly mandated commercial transparency records** (Meta Ad Library, Google Ads Transparency Center, TikTok Commercial Content). 

**We NEVER collect or store:**
- Personal individual profiles
- Social media user comments, emails, or phone numbers
- Private browsing cookies or demographic tracking

For full legal and compliance architecture, read **[docs/COMPLIANCE.md](docs/COMPLIANCE.md)**.
