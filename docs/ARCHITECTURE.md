# AdScope Architecture Documentation

## System Overview
AdScope is a multi-tenant competitive advertising intelligence platform engineered to discover, ingest, analyze, and synthesize competitor advertising strategies across digital ad platforms (Meta Ad Library, Google Ads Transparency Center, TikTok Creative Center).

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Layer                          │
│  Next.js 15 App Router (React 19, Tailwind, Lucide, Recharts)│
└───────────────────────────────┬─────────────────────────────┘
                                │ HTTP / Server Actions
┌───────────────────────────────▼─────────────────────────────┐
│                       API & App Layer                       │
│  - Multi-tenant Tenant Isolation                            │
│  - Workspaces, RBAC (Owner, Admin, Member)                  │
│  - REST Route Handlers (/api/niches, /api/ads, etc.)        │
│  - Usage Metering & Plan Limits (Free, Starter, Pro, Agency)│
└───────────────────────────────┬─────────────────────────────┘
                                │
        ┌───────────────────────┴───────────────────────┐
        ▼                                               ▼
┌───────────────────────────────┐     ┌───────────────────────────────┐
│       Database Layer          │     │        Queue & Worker         │
│  - PostgreSQL + pgvector      │     │  - Redis + BullMQ Queues      │
│  - Drizzle ORM                │     │  - In-process Async Fallback  │
│  - Tenant Scoped Access       │     │  - Idempotent Ingestion       │
└───────────────────────────────┘     └───────────────┬───────────────┘
                                                      │
                       ┌──────────────────────────────┼──────────────────────────────┐
                       ▼                              ▼                              ▼
        ┌────────────────────────────┐ ┌────────────────────────────┐ ┌────────────────────────────┐
        │  Provider Adapters Layer   │ │    Landing Page Capture    │ │   AI Intelligence Engine   │
        │ - Meta Ad Library Adapter  │ │ - Destination URL Extract  │ │ - LLMService (Claude / API)│
        │ - Google Transparency      │ │ - Offer & Social Proof     │ │ - Structured Zod Schemas   │
        │ - TikTok Creative Center   │ │ - Rate-limited Fetcher     │ │ - Grounded Strategy Synth  │
        └────────────────────────────┘ └────────────────────────────┘ └────────────────────────────┘
```

## Key Architectural Principles

1. **Provider Adapter Abstraction**
   Every ad source implements the `AdSourceAdapter` interface (`searchCompetitor`, `fetchAds`, `getHealth`). Core business logic never touches raw platform formats. New platforms can be mounted via provider registry in minutes.

2. **Tenant Isolation at Query Boundary**
   All analytical and operational entities (`niches`, `competitors`, `ads`, `analyses`, `strategies`, `monitors`, `usage_ledger`) strictly enforce `workspace_id`. Cross-tenant queries are structurally prevented.

3. **Multi-layer Deduplication**
   - Perceptual/content hashes prevent duplicate record insertion.
   - Embeddings and cosine similarity group creative mutations.
   - Run durations (`first_seen_at`, `last_seen_at`, `active_days`) are tracked cumulatively over recurring snapshot synchronizations.

4. **Strictly Grounded Strategy Synthesis**
   Strategy concepts and positioning gap recommendations MUST cite verifiable ad IDs (`cited_ad_ids`). Ungrounded hallucinated concepts are rejected by schema validation.

5. **Resilient Dual-Mode Operation**
   The platform operates seamlessly in two environments:
   - **Production Enterprise**: Full PostgreSQL container, Redis BullMQ background worker daemon, and external cloud services.
   - **Standalone / Zero-Config Demo**: Embedded resilient storage & in-process queue runner capable of instant zero-setup demonstration with rich industry fixtures.
