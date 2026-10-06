export type PlatformType = "meta" | "google" | "tiktok";

export interface DiscoveredCompetitor {
  name: string;
  domain: string;
  platformId?: string;
  platform: PlatformType;
  confidenceScore: number;
  adCountEstimated: number;
  sampleHeadline?: string;
}

export interface RawAdPayload {
  externalAdId: string;
  platform: PlatformType;
  advertiserName: string;
  headline?: string;
  adCopy?: string;
  cta?: string;
  format: "image" | "video" | "carousel" | "text";
  creativeUrl?: string;
  thumbnailUrl?: string;
  firstSeenAt: string;
  lastSeenAt: string;
  activeDays: number;
  region: string;
  language: string;
  landingPageUrl?: string;
  rawJson?: any;
}

export interface SourceHealthStatus {
  platform: PlatformType;
  status: "active" | "rate_limited" | "error" | "maintenance";
  latencyMs: number;
  rateLimitRemaining?: number;
  lastCheckAt: string;
  errorMessage?: string;
}

export interface CompetitorRef {
  id: string;
  name: string;
  domain: string;
  pageIdMeta?: string;
  advertiserIdGoogle?: string;
  tiktokHandle?: string;
}

export interface FetchAdsOptions {
  limit?: number;
  sinceDays?: number;
  region?: string;
}

export interface AdSourceAdapter {
  readonly platform: PlatformType;
  readonly name: string;
  searchCompetitor(query: string, options?: { region?: string }): Promise<DiscoveredCompetitor[]>;
  fetchAds(competitor: CompetitorRef, options?: FetchAdsOptions): Promise<RawAdPayload[]>;
  getHealth(): Promise<SourceHealthStatus>;
}
