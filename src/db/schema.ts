import { pgTable, text, timestamp, integer, boolean, jsonb, uuid } from "drizzle-orm/pg-core";

// 1. Workspaces (Tenants)
export const workspaces = pgTable("workspaces", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  planTier: text("plan_tier").notNull().default("free_trial"), // 'free_trial' | 'starter' | 'pro' | 'agency'
  aiCreditsBalance: integer("ai_credits_balance").notNull().default(100),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 2. Users
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("user"), // 'user' | 'superadmin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 3. Memberships (Workspaces <-> Users RBAC)
export const memberships = pgTable("memberships", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: text("role").notNull().default("member"), // 'owner' | 'admin' | 'member'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 4. Niches
export const niches = pgTable("niches", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: text("category").notNull(),
  region: text("region").notNull().default("US"),
  language: text("language").notNull().default("en"),
  targetAudience: text("target_audience"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 5. Competitors
export const competitors = pgTable("competitors", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  nicheId: text("niche_id").notNull().references(() => niches.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  domain: text("domain").notNull(),
  pageIdMeta: text("page_id_meta"),
  advertiserIdGoogle: text("advertiser_id_google"),
  tiktokHandle: text("tiktok_handle"),
  logoUrl: text("logo_url"),
  isActive: boolean("is_active").notNull().default(true),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 6. Competitor Domains
export const competitorDomains = pgTable("competitor_domains", {
  id: text("id").primaryKey(),
  competitorId: text("competitor_id").notNull().references(() => competitors.id, { onDelete: "cascade" }),
  domain: text("domain").notNull(),
  detectedFrom: text("detected_from").notNull().default("ad_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 7. Ad Sources & Health
export const adSources = pgTable("ad_sources", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // 'meta' | 'google' | 'tiktok'
  status: text("status").notNull().default("active"), // 'active' | 'rate_limited' | 'error'
  lastSyncAt: timestamp("last_sync_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 8. Ads
export const ads = pgTable("ads", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  competitorId: text("competitor_id").notNull().references(() => competitors.id, { onDelete: "cascade" }),
  platform: text("platform").notNull(), // 'meta' | 'google' | 'tiktok'
  externalAdId: text("external_ad_id").notNull(),
  advertiserName: text("advertiser_name").notNull(),
  creativeUrl: text("creative_url"),
  thumbnailUrl: text("thumbnail_url"),
  adCopy: text("ad_copy"),
  headline: text("headline"),
  cta: text("cta"),
  format: text("format").notNull().default("image"), // 'image' | 'video' | 'carousel' | 'text'
  firstSeenAt: timestamp("first_seen_at").defaultNow().notNull(),
  lastSeenAt: timestamp("last_seen_at").defaultNow().notNull(),
  activeDays: integer("active_days").notNull().default(1),
  region: text("region").default("US"),
  language: text("language").default("en"),
  contentHash: text("content_hash").notNull(),
  creativeHash: text("creative_hash"),
  landingPageUrl: text("landing_page_url"),
  rawPayload: jsonb("raw_payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 9. Ad Snapshots (Historical track)
export const adSnapshots = pgTable("ad_snapshots", {
  id: text("id").primaryKey(),
  adId: text("ad_id").notNull().references(() => ads.id, { onDelete: "cascade" }),
  snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
  isActive: boolean("is_active").notNull().default(true),
  spendRange: text("spend_range"),
  impressionsRange: text("impressions_range"),
});

// 10. Landing Pages
export const landingPages = pgTable("landing_pages", {
  id: text("id").primaryKey(),
  adId: text("ad_id").notNull().references(() => ads.id, { onDelete: "cascade" }),
  destinationUrl: text("destination_url").notNull(),
  statusCode: integer("status_code").default(200),
  headline: text("headline"),
  offer: text("offer"),
  pricingCues: text("pricing_cues"),
  socialProof: text("social_proof"),
  pageText: text("page_text"),
  capturedAt: timestamp("captured_at").defaultNow().notNull(),
});

// 11. Analyses (Per Ad LLM deconstruction)
export const analyses = pgTable("analyses", {
  id: text("id").primaryKey(),
  adId: text("ad_id").notNull().references(() => ads.id, { onDelete: "cascade" }),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  hookType: text("hook_type").notNull(), // 'curiosity' | 'pain_point' | 'social_proof' | 'fomo' | 'contrarian' | 'direct_offer' | 'how_to'
  angle: text("angle").notNull(),
  offer: text("offer").notNull(),
  cta: text("cta").notNull(),
  emotionalDriver: text("emotional_driver").notNull(),
  objectionHandled: text("objection_handled").notNull(),
  targetAudienceHints: text("target_audience_hints").notNull(),
  creativeFormat: text("creative_format").notNull(),
  funnelStage: text("funnel_stage").notNull(), // 'top' | 'middle' | 'bottom'
  confidenceScore: integer("confidence_score").default(95),
  promptVersion: text("prompt_version").notNull().default("v1.0"),
  modelName: text("model_name").notNull().default("claude-3-5-sonnet"),
  tokensUsed: integer("tokens_used").default(450),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 12. Insights (Niche-level & Competitor aggregations)
export const insights = pgTable("insights", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  nicheId: text("niche_id").notNull().references(() => niches.id, { onDelete: "cascade" }),
  competitorId: text("competitor_id"),
  hookDistribution: jsonb("hook_distribution"),
  angleDistribution: jsonb("angle_distribution"),
  formatDistribution: jsonb("format_distribution"),
  longevityWinners: jsonb("longevity_winners"),
  creativeVelocity: jsonb("creative_velocity"),
  whitespaceGaps: jsonb("whitespace_gaps"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 13. Strategies
export const strategies = pgTable("strategies", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  nicheId: text("niche_id").notNull().references(() => niches.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  brandProfile: jsonb("brand_profile").notNull(),
  positioningGaps: jsonb("positioning_gaps").notNull(),
  twoWeekTestPlan: jsonb("two_week_test_plan").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// 14. Strategy Items (Concept ideas citing specific ads)
export const strategyItems = pgTable("strategy_items", {
  id: text("id").primaryKey(),
  strategyId: text("strategy_id").notNull().references(() => strategies.id, { onDelete: "cascade" }),
  conceptTitle: text("concept_title").notNull(),
  hook: text("hook").notNull(),
  copyVariants: jsonb("copy_variants").notNull(),
  creativeDirection: text("creative_direction").notNull(),
  angle: text("angle").notNull(),
  funnelStage: text("funnel_stage").notNull(),
  citedAdIds: jsonb("cited_ad_ids").notNull(), // Array of Ad IDs proving grounding
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 15. Monitors (Watch rules)
export const monitors = pgTable("monitors", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  competitorId: text("competitor_id"),
  nicheId: text("niche_id"),
  ruleType: text("rule_type").notNull(), // 'new_ad' | 'new_offer' | 'velocity_spike' | 'ad_stopped'
  config: jsonb("config").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 16. Alerts
export const alerts = pgTable("alerts", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  monitorId: text("monitor_id").references(() => monitors.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  message: text("message").notNull(),
  severity: text("severity").notNull().default("info"), // 'info' | 'warning' | 'alert'
  channel: text("channel").notNull().default("in_app"), // 'in_app' | 'slack' | 'email'
  status: text("status").notNull().default("unread"), // 'unread' | 'read'
  payload: jsonb("payload"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 17. Reports
export const reports = pgTable("reports", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  nicheId: text("niche_id").notNull().references(() => niches.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  reportType: text("report_type").notNull().default("competitive_audit"),
  data: jsonb("data").notNull(),
  pdfUrl: text("pdf_url"),
  isWhiteLabel: boolean("is_white_label").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 18. Jobs
export const jobs = pgTable("jobs", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 'sync_ads' | 'analyze_ad' | 'generate_strategy' | 'check_monitors'
  status: text("status").notNull().default("queued"), // 'queued' | 'running' | 'completed' | 'failed'
  progress: integer("progress").notNull().default(0),
  payload: jsonb("payload"),
  result: jsonb("result"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  finishedAt: timestamp("finished_at"),
});

// 19. Usage Ledger (Credit accounting & cost tracking)
export const usageLedger = pgTable("usage_ledger", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id"),
  eventType: text("event_type").notNull(), // 'ai_analysis' | 'strategy_generation' | 'ad_sync'
  creditsConsumed: integer("credits_consumed").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// 20. Audit Log
export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  workspaceId: text("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  userId: text("user_id"),
  action: text("action").notNull(),
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id").notNull(),
  diff: jsonb("diff"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
