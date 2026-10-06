import fs from "fs";
import path from "path";
import { generateId } from "../lib/utils";
import { logger } from "../lib/logger";

const DATA_FILE = path.join(process.cwd(), ".adscope_data.json");

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  planTier: "free_trial" | "starter" | "pro" | "agency";
  aiCreditsBalance: number;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: "user" | "superadmin";
  createdAt: string;
}

export interface Membership {
  id: string;
  workspaceId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  createdAt: string;
}

export interface Niche {
  id: string;
  workspaceId: string;
  name: string;
  category: string;
  region: string;
  language: string;
  targetAudience?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Competitor {
  id: string;
  workspaceId: string;
  nicheId: string;
  name: string;
  domain: string;
  pageIdMeta?: string;
  advertiserIdGoogle?: string;
  tiktokHandle?: string;
  logoUrl?: string;
  isActive: boolean;
  lastSyncedAt?: string;
  createdAt: string;
}

export interface Ad {
  id: string;
  workspaceId: string;
  competitorId: string;
  platform: "meta" | "google" | "tiktok";
  externalAdId: string;
  advertiserName: string;
  creativeUrl?: string;
  thumbnailUrl?: string;
  adCopy?: string;
  headline?: string;
  cta?: string;
  format: "image" | "video" | "carousel" | "text";
  firstSeenAt: string;
  lastSeenAt: string;
  activeDays: number;
  region: string;
  language: string;
  contentHash: string;
  creativeHash?: string;
  landingPageUrl?: string;
  rawPayload?: any;
  createdAt: string;
}

export interface LandingPage {
  id: string;
  adId: string;
  destinationUrl: string;
  statusCode: number;
  headline?: string;
  offer?: string;
  pricingCues?: string;
  socialProof?: string;
  pageText?: string;
  capturedAt: string;
}

export interface AdAnalysis {
  id: string;
  adId: string;
  workspaceId: string;
  hookType: "curiosity" | "pain_point" | "social_proof" | "fomo" | "contrarian" | "direct_offer" | "how_to";
  angle: string;
  offer: string;
  cta: string;
  emotionalDriver: string;
  objectionHandled: string;
  targetAudienceHints: string;
  creativeFormat: string;
  funnelStage: "top" | "middle" | "bottom";
  confidenceScore: number;
  promptVersion: string;
  modelName: string;
  tokensUsed: number;
  createdAt: string;
}

export interface NicheInsights {
  id: string;
  workspaceId: string;
  nicheId: string;
  competitorId?: string;
  hookDistribution: Record<string, number>;
  angleDistribution: Record<string, number>;
  formatDistribution: Record<string, number>;
  longevityWinners: any[];
  creativeVelocity: any[];
  whitespaceGaps: any[];
  updatedAt: string;
}

export interface Strategy {
  id: string;
  workspaceId: string;
  nicheId: string;
  title: string;
  brandProfile: {
    productName: string;
    description: string;
    targetAudience: string;
    usp: string;
    pricePoint: string;
  };
  positioningGaps: Array<{
    gap: string;
    opportunity: string;
    recommendedAngle: string;
    evidenceAdIds: string[];
  }>;
  twoWeekTestPlan: Array<{
    dayRange: string;
    hypothesis: string;
    conceptIds: string[];
    kpi: string;
  }>;
  items?: StrategyItem[];
  createdAt: string;
  updatedAt: string;
}

export interface StrategyItem {
  id: string;
  strategyId: string;
  conceptTitle: string;
  hook: string;
  copyVariants: string[];
  creativeDirection: string;
  angle: string;
  funnelStage: "top" | "middle" | "bottom";
  citedAdIds: string[];
  createdAt: string;
}

export interface Monitor {
  id: string;
  workspaceId: string;
  competitorId?: string;
  nicheId?: string;
  ruleType: "new_ad" | "new_offer" | "velocity_spike" | "ad_stopped";
  config: {
    thresholdDays?: number;
    slackWebhook?: string;
    emailNotification?: boolean;
  };
  isActive: boolean;
  createdAt: string;
}

export interface Alert {
  id: string;
  workspaceId: string;
  monitorId?: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "alert";
  channel: "in_app" | "slack" | "email";
  status: "unread" | "read";
  payload?: any;
  createdAt: string;
}

export interface Job {
  id: string;
  workspaceId: string;
  type: "sync_ads" | "analyze_ad" | "generate_strategy" | "check_monitors" | "discover_competitors";
  status: "queued" | "running" | "completed" | "failed";
  progress: number;
  payload?: any;
  result?: any;
  errorMessage?: string;
  createdAt: string;
  finishedAt?: string;
}

export interface UsageRecord {
  id: string;
  workspaceId: string;
  userId?: string;
  eventType: "ai_analysis" | "strategy_generation" | "ad_sync";
  creditsConsumed: number;
  metadata?: any;
  createdAt: string;
}

export interface AuditRecord {
  id: string;
  workspaceId: string;
  userId?: string;
  action: string;
  resourceType: string;
  resourceId: string;
  diff?: any;
  ipAddress?: string;
  createdAt: string;
}

interface StorageSchema {
  workspaces: Workspace[];
  users: User[];
  memberships: Membership[];
  niches: Niche[];
  competitors: Competitor[];
  ads: Ad[];
  landingPages: LandingPage[];
  analyses: AdAnalysis[];
  insights: NicheInsights[];
  strategies: Strategy[];
  strategyItems: StrategyItem[];
  monitors: Monitor[];
  alerts: Alert[];
  jobs: Job[];
  usageLedger: UsageRecord[];
  auditLogs: AuditRecord[];
}

function getInitialStorage(): StorageSchema {
  return {
    workspaces: [],
    users: [],
    memberships: [],
    niches: [],
    competitors: [],
    ads: [],
    landingPages: [],
    analyses: [],
    insights: [],
    strategies: [],
    strategyItems: [],
    monitors: [],
    alerts: [],
    jobs: [],
    usageLedger: [],
    auditLogs: [],
  };
}

class Repository {
  private data: StorageSchema;

  constructor() {
    this.data = this.loadData();
  }

  private loadData(): StorageSchema {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, "utf-8");
        return JSON.parse(raw);
      }
    } catch (err) {
      logger.error({ err }, "Error reading data file, resetting to initial state");
    }
    const initial = getInitialStorage();
    this.saveData(initial);
    return initial;
  }

  private saveData(data: StorageSchema) {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      logger.error({ err }, "Failed to persist data file");
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // Workspaces
  getWorkspaces(): Workspace[] {
    return this.data.workspaces;
  }

  getWorkspace(id: string): Workspace | undefined {
    return this.data.workspaces.find((w) => w.id === id || w.slug === id);
  }

  createWorkspace(payload: Partial<Workspace>): Workspace {
    const ws: Workspace = {
      id: payload.id || generateId("ws"),
      name: payload.name || "Default Workspace",
      slug: payload.slug || "default-workspace",
      planTier: payload.planTier || "pro",
      aiCreditsBalance: payload.aiCreditsBalance ?? 500,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...payload,
    };
    this.data.workspaces.push(ws);
    this.persist();
    return ws;
  }

  updateWorkspace(id: string, updates: Partial<Workspace>): Workspace | undefined {
    const idx = this.data.workspaces.findIndex((w) => w.id === id);
    if (idx === -1) return undefined;
    this.data.workspaces[idx] = {
      ...this.data.workspaces[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
    return this.data.workspaces[idx];
  }

  // Users & Memberships
  getUser(idOrEmail: string): User | undefined {
    return this.data.users.find((u) => u.id === idOrEmail || u.email === idOrEmail);
  }

  createUser(payload: Partial<User>): User {
    const user: User = {
      id: payload.id || generateId("usr"),
      email: payload.email || "user@example.com",
      name: payload.name || "Alex Rivera",
      avatarUrl: payload.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      role: payload.role || "user",
      createdAt: new Date().toISOString(),
      ...payload,
    };
    this.data.users.push(user);
    this.persist();
    return user;
  }

  getMemberships(workspaceId: string): Membership[] {
    return this.data.memberships.filter((m) => m.workspaceId === workspaceId);
  }

  createMembership(workspaceId: string, userId: string, role: "owner" | "admin" | "member"): Membership {
    const mem: Membership = {
      id: generateId("mem"),
      workspaceId,
      userId,
      role,
      createdAt: new Date().toISOString(),
    };
    this.data.memberships.push(mem);
    this.persist();
    return mem;
  }

  // Niches (Tenant Isolated)
  getNiches(workspaceId: string): Niche[] {
    return this.data.niches.filter((n) => n.workspaceId === workspaceId);
  }

  getNiche(id: string, workspaceId: string): Niche | undefined {
    return this.data.niches.find((n) => n.id === id && n.workspaceId === workspaceId);
  }

  createNiche(workspaceId: string, payload: Partial<Niche>): Niche {
    const n: Niche = {
      id: payload.id || generateId("nic"),
      workspaceId,
      name: payload.name || "Clean Energy Drinks",
      category: payload.category || "Beverage & Wellness",
      region: payload.region || "US",
      language: payload.language || "en",
      targetAudience: payload.targetAudience || "High performers, fitness enthusiasts, entrepreneurs",
      description: payload.description || "D2C natural caffeine & nootropic functional beverages",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...payload,
    };
    this.data.niches.push(n);
    this.persist();
    return n;
  }

  // Competitors (Tenant Isolated)
  getCompetitors(workspaceId: string, nicheId?: string): Competitor[] {
    return this.data.competitors.filter(
      (c) => c.workspaceId === workspaceId && (!nicheId || c.nicheId === nicheId)
    );
  }

  getCompetitor(id: string, workspaceId: string): Competitor | undefined {
    return this.data.competitors.find((c) => c.id === id && c.workspaceId === workspaceId);
  }

  createCompetitor(workspaceId: string, payload: Partial<Competitor>): Competitor {
    const c: Competitor = {
      id: payload.id || generateId("cmp"),
      workspaceId,
      nicheId: payload.nicheId || "",
      name: payload.name || "Brand X",
      domain: payload.domain || "brandx.com",
      pageIdMeta: payload.pageIdMeta,
      advertiserIdGoogle: payload.advertiserIdGoogle,
      tiktokHandle: payload.tiktokHandle,
      logoUrl: payload.logoUrl,
      isActive: payload.isActive ?? true,
      lastSyncedAt: payload.lastSyncedAt || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      ...payload,
    };
    this.data.competitors.push(c);
    this.persist();
    return c;
  }

  updateCompetitor(id: string, workspaceId: string, updates: Partial<Competitor>): Competitor | undefined {
    const idx = this.data.competitors.findIndex((c) => c.id === id && c.workspaceId === workspaceId);
    if (idx === -1) return undefined;
    this.data.competitors[idx] = { ...this.data.competitors[idx], ...updates };
    this.persist();
    return this.data.competitors[idx];
  }

  // Ads (Tenant Isolated)
  getAds(
    workspaceId: string,
    filters?: {
      nicheId?: string;
      competitorId?: string;
      platform?: string;
      format?: string;
      search?: string;
      minActiveDays?: number;
      hookType?: string;
    }
  ): Ad[] {
    let list = this.data.ads.filter((a) => a.workspaceId === workspaceId);

    if (filters?.competitorId) {
      list = list.filter((a) => a.competitorId === filters.competitorId);
    }
    if (filters?.nicheId) {
      const compIds = this.getCompetitors(workspaceId, filters.nicheId).map((c) => c.id);
      list = list.filter((a) => compIds.includes(a.competitorId));
    }
    if (filters?.platform) {
      list = list.filter((a) => a.platform === filters.platform);
    }
    if (filters?.format) {
      list = list.filter((a) => a.format === filters.format);
    }
    if (filters?.minActiveDays) {
      list = list.filter((a) => a.activeDays >= filters.minActiveDays!);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (a) =>
          a.advertiserName.toLowerCase().includes(q) ||
          (a.adCopy && a.adCopy.toLowerCase().includes(q)) ||
          (a.headline && a.headline.toLowerCase().includes(q))
      );
    }
    return list;
  }

  getAd(id: string, workspaceId: string): Ad | undefined {
    return this.data.ads.find((a) => a.id === id && a.workspaceId === workspaceId);
  }

  upsertAd(adData: Partial<Ad> & { workspaceId: string; competitorId: string; externalAdId: string }): {
    ad: Ad;
    isNew: boolean;
  } {
    const existingIdx = this.data.ads.findIndex(
      (a) =>
        a.workspaceId === adData.workspaceId &&
        a.platform === adData.platform &&
        a.externalAdId === adData.externalAdId
    );

    if (existingIdx >= 0) {
      const prev = this.data.ads[existingIdx];
      const now = new Date();
      const firstSeen = new Date(prev.firstSeenAt);
      const diffDays = Math.max(
        1,
        Math.round((now.getTime() - firstSeen.getTime()) / (1000 * 60 * 60 * 24))
      );

      this.data.ads[existingIdx] = {
        ...prev,
        ...adData,
        lastSeenAt: now.toISOString(),
        activeDays: adData.activeDays !== undefined ? adData.activeDays : diffDays,
      };
      this.persist();
      return { ad: this.data.ads[existingIdx], isNew: false };
    }

    const newAd: Ad = {
      id: adData.id || generateId("ad"),
      workspaceId: adData.workspaceId,
      competitorId: adData.competitorId,
      platform: adData.platform || "meta",
      externalAdId: adData.externalAdId,
      advertiserName: adData.advertiserName || "Competitor",
      creativeUrl: adData.creativeUrl,
      thumbnailUrl: adData.thumbnailUrl,
      adCopy: adData.adCopy,
      headline: adData.headline,
      cta: adData.cta,
      format: adData.format || "image",
      firstSeenAt: adData.firstSeenAt || new Date().toISOString(),
      lastSeenAt: adData.lastSeenAt || new Date().toISOString(),
      activeDays: adData.activeDays || 1,
      region: adData.region || "US",
      language: adData.language || "en",
      contentHash: adData.contentHash || generateId("hash"),
      creativeHash: adData.creativeHash,
      landingPageUrl: adData.landingPageUrl,
      rawPayload: adData.rawPayload,
      createdAt: new Date().toISOString(),
    };
    this.data.ads.push(newAd);
    this.persist();
    return { ad: newAd, isNew: true };
  }

  // Analyses
  getAnalyses(workspaceId: string, adId?: string): AdAnalysis[] {
    return this.data.analyses.filter(
      (an) => an.workspaceId === workspaceId && (!adId || an.adId === adId)
    );
  }

  getAnalysisForAd(adId: string, workspaceId: string): AdAnalysis | undefined {
    return this.data.analyses.find((an) => an.adId === adId && an.workspaceId === workspaceId);
  }

  saveAnalysis(analysisData: Omit<AdAnalysis, "id" | "createdAt">): AdAnalysis {
    const existingIdx = this.data.analyses.findIndex(
      (a) => a.adId === analysisData.adId && a.workspaceId === analysisData.workspaceId
    );

    const an: AdAnalysis = {
      id: generateId("ana"),
      createdAt: new Date().toISOString(),
      ...analysisData,
    };

    if (existingIdx >= 0) {
      this.data.analyses[existingIdx] = an;
    } else {
      this.data.analyses.push(an);
    }
    this.persist();
    return an;
  }

  // Insights
  getInsights(workspaceId: string, nicheId: string): NicheInsights | undefined {
    return this.data.insights.find((i) => i.workspaceId === workspaceId && i.nicheId === nicheId);
  }

  saveInsights(insightsData: Omit<NicheInsights, "id" | "updatedAt">): NicheInsights {
    const existingIdx = this.data.insights.findIndex(
      (i) => i.workspaceId === insightsData.workspaceId && i.nicheId === insightsData.nicheId
    );

    const ins: NicheInsights = {
      id: generateId("ins"),
      updatedAt: new Date().toISOString(),
      ...insightsData,
    };

    if (existingIdx >= 0) {
      this.data.insights[existingIdx] = ins;
    } else {
      this.data.insights.push(ins);
    }
    this.persist();
    return ins;
  }

  // Strategies
  getStrategies(workspaceId: string, nicheId?: string): Strategy[] {
    const strats = this.data.strategies.filter(
      (s) => s.workspaceId === workspaceId && (!nicheId || s.nicheId === nicheId)
    );
    return strats.map((s) => ({
      ...s,
      items: this.data.strategyItems.filter((item) => item.strategyId === s.id),
    }));
  }

  getStrategy(id: string, workspaceId: string): Strategy | undefined {
    const strat = this.data.strategies.find((s) => s.id === id && s.workspaceId === workspaceId);
    if (!strat) return undefined;
    return {
      ...strat,
      items: this.data.strategyItems.filter((item) => item.strategyId === strat.id),
    };
  }

  saveStrategy(
    strategyData: Omit<Strategy, "id" | "createdAt" | "updatedAt" | "items">,
    items?: Array<Omit<StrategyItem, "id" | "strategyId" | "createdAt">>
  ): Strategy {
    const id = generateId("str");
    const strat: Strategy = {
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...strategyData,
    };

    this.data.strategies.push(strat);

    if (items && items.length > 0) {
      for (const item of items) {
        this.data.strategyItems.push({
          id: generateId("sti"),
          strategyId: id,
          createdAt: new Date().toISOString(),
          ...item,
        });
      }
    }
    this.persist();
    return this.getStrategy(id, strategyData.workspaceId)!;
  }

  // Landing pages
  getLandingPage(adId: string): LandingPage | undefined {
    return this.data.landingPages.find((lp) => lp.adId === adId);
  }

  saveLandingPage(lpData: Omit<LandingPage, "id" | "capturedAt">): LandingPage {
    const existingIdx = this.data.landingPages.findIndex((l) => l.adId === lpData.adId);
    const lp: LandingPage = {
      id: generateId("lp"),
      capturedAt: new Date().toISOString(),
      ...lpData,
    };
    if (existingIdx >= 0) {
      this.data.landingPages[existingIdx] = lp;
    } else {
      this.data.landingPages.push(lp);
    }
    this.persist();
    return lp;
  }

  // Monitors & Alerts
  getMonitors(workspaceId: string): Monitor[] {
    return this.data.monitors.filter((m) => m.workspaceId === workspaceId);
  }

  createMonitor(workspaceId: string, monitorData: Partial<Monitor>): Monitor {
    const m: Monitor = {
      id: generateId("mon"),
      workspaceId,
      ruleType: monitorData.ruleType || "new_ad",
      config: monitorData.config || {},
      isActive: monitorData.isActive ?? true,
      createdAt: new Date().toISOString(),
      ...monitorData,
    };
    this.data.monitors.push(m);
    this.persist();
    return m;
  }

  getAlerts(workspaceId: string): Alert[] {
    return this.data.alerts
      .filter((a) => a.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createAlert(workspaceId: string, alertData: Partial<Alert>): Alert {
    const alert: Alert = {
      id: generateId("alt"),
      workspaceId,
      title: alertData.title || "New Ad Alert",
      message: alertData.message || "A competitor launched a new ad.",
      severity: alertData.severity || "info",
      channel: alertData.channel || "in_app",
      status: alertData.status || "unread",
      payload: alertData.payload,
      createdAt: new Date().toISOString(),
      ...alertData,
    };
    this.data.alerts.push(alert);
    this.persist();
    return alert;
  }

  markAlertRead(id: string, workspaceId: string) {
    const alert = this.data.alerts.find((a) => a.id === id && a.workspaceId === workspaceId);
    if (alert) {
      alert.status = "read";
      this.persist();
    }
  }

  // Jobs
  getJobs(workspaceId: string): Job[] {
    return this.data.jobs
      .filter((j) => j.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  createJob(workspaceId: string, jobData: Partial<Job>): Job {
    const job: Job = {
      id: generateId("job"),
      workspaceId,
      type: jobData.type || "sync_ads",
      status: jobData.status || "queued",
      progress: jobData.progress || 0,
      payload: jobData.payload,
      createdAt: new Date().toISOString(),
      ...jobData,
    };
    this.data.jobs.push(job);
    this.persist();
    return job;
  }

  updateJob(id: string, workspaceId: string, updates: Partial<Job>): Job | undefined {
    const idx = this.data.jobs.findIndex((j) => j.id === id && j.workspaceId === workspaceId);
    if (idx === -1) return undefined;
    this.data.jobs[idx] = { ...this.data.jobs[idx], ...updates };
    this.persist();
    return this.data.jobs[idx];
  }

  // Usage & Audit
  recordUsage(workspaceId: string, eventType: UsageRecord["eventType"], credits: number, metadata?: any): UsageRecord {
    const rec: UsageRecord = {
      id: generateId("usg"),
      workspaceId,
      eventType,
      creditsConsumed: credits,
      metadata,
      createdAt: new Date().toISOString(),
    };
    this.data.usageLedger.push(rec);

    // Deduct credits from workspace
    const ws = this.getWorkspace(workspaceId);
    if (ws) {
      ws.aiCreditsBalance = Math.max(0, ws.aiCreditsBalance - credits);
      this.updateWorkspace(ws.id, { aiCreditsBalance: ws.aiCreditsBalance });
    }

    this.persist();
    return rec;
  }

  getUsageLedger(workspaceId: string): UsageRecord[] {
    return this.data.usageLedger
      .filter((u) => u.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  recordAudit(workspaceId: string, action: string, resourceType: string, resourceId: string, diff?: any): AuditRecord {
    const rec: AuditRecord = {
      id: generateId("aud"),
      workspaceId,
      action,
      resourceType,
      resourceId,
      diff,
      createdAt: new Date().toISOString(),
    };
    this.data.auditLogs.push(rec);
    this.persist();
    return rec;
  }

  getAuditLogs(workspaceId: string): AuditRecord[] {
    return this.data.auditLogs
      .filter((a) => a.workspaceId === workspaceId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const repo = new Repository();
