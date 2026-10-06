import { adapterRegistry } from "./adapters/registry";
import { PlatformType, RawAdPayload } from "./adapters/types";
import { repo, Competitor } from "../db/repo";
import { hashString } from "../lib/utils";
import { landingPageService } from "./landing-page-service";
import { logger } from "../lib/logger";

export interface IngestionResult {
  competitorId: string;
  competitorName: string;
  platform: PlatformType;
  totalFetched: number;
  newAdsCount: number;
  updatedAdsCount: number;
  durationMs: number;
}

export class IngestionService {
  async ingestCompetitorAds(
    workspaceId: string,
    competitor: Competitor,
    platform: PlatformType = "meta"
  ): Promise<IngestionResult> {
    const startTime = Date.now();
    logger.info({ workspaceId, competitor: competitor.name, platform }, "Starting ad ingestion pipeline");

    const adapter = adapterRegistry.getAdapter(platform);
    const rawAds = await adapter.fetchAds({
      id: competitor.id,
      name: competitor.name,
      domain: competitor.domain,
      pageIdMeta: competitor.pageIdMeta,
      advertiserIdGoogle: competitor.advertiserIdGoogle,
      tiktokHandle: competitor.tiktokHandle,
    });

    let newCount = 0;
    let updatedCount = 0;

    for (const raw of rawAds) {
      // Compute content hash for deduplication
      const contentHash = hashString(`${raw.advertiserName}_${raw.headline || ""}_${raw.adCopy || ""}_${raw.format}`);
      const creativeHash = raw.creativeUrl ? hashString(raw.creativeUrl) : undefined;

      const { ad, isNew } = repo.upsertAd({
        workspaceId,
        competitorId: competitor.id,
        platform: raw.platform,
        externalAdId: raw.externalAdId,
        advertiserName: raw.advertiserName,
        headline: raw.headline,
        adCopy: raw.adCopy,
        cta: raw.cta,
        format: raw.format,
        creativeUrl: raw.creativeUrl,
        thumbnailUrl: raw.thumbnailUrl,
        region: raw.region,
        language: raw.language,
        contentHash,
        creativeHash,
        landingPageUrl: raw.landingPageUrl,
        rawPayload: raw.rawJson,
      });

      if (isNew) {
        newCount++;
        // Asynchronously capture landing page if URL exists
        if (raw.landingPageUrl) {
          landingPageService
            .captureLandingPage(raw.landingPageUrl)
            .then((lpData) => {
              repo.saveLandingPage({
                adId: ad.id,
                ...lpData,
              });
            })
            .catch((err) => logger.warn({ err, url: raw.landingPageUrl }, "Landing page capture error"));
        }
      } else {
        updatedCount++;
      }
    }

    // Update competitor last sync time
    repo.updateCompetitor(competitor.id, workspaceId, {
      lastSyncedAt: new Date().toISOString(),
    });

    const durationMs = Date.now() - startTime;
    logger.info(
      { competitor: competitor.name, newCount, updatedCount, durationMs },
      "Ingestion pipeline completed successfully"
    );

    return {
      competitorId: competitor.id,
      competitorName: competitor.name,
      platform,
      totalFetched: rawAds.length,
      newAdsCount: newCount,
      updatedAdsCount: updatedCount,
      durationMs,
    };
  }
}

export const ingestionService = new IngestionService();
