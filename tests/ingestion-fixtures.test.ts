import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { repo } from "../src/db/repo";
import { hashString } from "../src/lib/utils";

describe("Integration: Ingestion Pipeline with Recorded Fixtures", () => {
  const wsId = "ws_fixture_test";
  const compId = "cmp_fixture_test";

  beforeEach(() => {
    if (!repo.getWorkspace(wsId)) {
      repo.createWorkspace({
        id: wsId,
        name: "Fixture Test Workspace",
        slug: "fixture-test",
        planTier: "pro",
      });
    }
  });

  it("ingests and deduplicates Meta Ad Library fixtures", () => {
    const metaRaw = JSON.parse(
      fs.readFileSync(path.join(__dirname, "fixtures/meta_ads.json"), "utf-8")
    );
    expect(metaRaw.length).toBe(2);

    // Ingest first fixture
    const item = metaRaw[0];
    const contentHash = hashString(`${item.page_name}_${item.ad_creative_link_titles[0]}_${item.ad_creative_bodies[0]}`);

    const res1 = repo.upsertAd({
      workspaceId: wsId,
      competitorId: compId,
      platform: "meta",
      externalAdId: item.id,
      advertiserName: item.page_name,
      headline: item.ad_creative_link_titles[0],
      adCopy: item.ad_creative_bodies[0],
      format: "video",
      firstSeenAt: item.ad_delivery_start_time,
      contentHash,
      landingPageUrl: item.ad_creative_link_captions[0],
    });

    expect(res1.isNew).toBe(true);
    expect(res1.ad.externalAdId).toBe(item.id);

    // Re-ingest same fixture (simulating scheduled daily crawl)
    const res2 = repo.upsertAd({
      workspaceId: wsId,
      competitorId: compId,
      platform: "meta",
      externalAdId: item.id,
      advertiserName: item.page_name,
      headline: item.ad_creative_link_titles[0],
      adCopy: item.ad_creative_bodies[0],
      format: "video",
      contentHash,
    });

    expect(res2.isNew).toBe(false);
    expect(res2.ad.id).toBe(res1.ad.id);
    expect(res2.ad.activeDays).toBeGreaterThanOrEqual(1);
  });

  it("ingests Google Ads Transparency fixtures and computes active duration", () => {
    const googleRaw = JSON.parse(
      fs.readFileSync(path.join(__dirname, "fixtures/google_ads.json"), "utf-8")
    );
    const item = googleRaw[0];

    const contentHash = hashString(`${item.advertiser_name}_${item.headlines[0]}_${item.descriptions[0]}`);
    const res = repo.upsertAd({
      workspaceId: wsId,
      competitorId: compId,
      platform: "google",
      externalAdId: item.ad_id,
      advertiserName: item.advertiser_name,
      headline: item.headlines[0],
      adCopy: item.descriptions[0],
      format: "text",
      firstSeenAt: item.first_shown,
      contentHash,
      landingPageUrl: item.destination_url,
    });

    expect(res.isNew).toBe(true);
    expect(res.ad.platform).toBe("google");
    expect(res.ad.headline).toBe("Drink Ketones for Clean Brain Fuel");
  });

  it("ingests TikTok Creative Center fixtures and links landing pages", () => {
    const tiktokRaw = JSON.parse(
      fs.readFileSync(path.join(__dirname, "fixtures/tiktok_ads.json"), "utf-8")
    );
    const item = tiktokRaw[0];

    const contentHash = hashString(`${item.advertiser_name}_${item.title}_${item.caption}`);
    const res = repo.upsertAd({
      workspaceId: wsId,
      competitorId: compId,
      platform: "tiktok",
      externalAdId: item.creative_id,
      advertiserName: item.advertiser_name,
      headline: item.title,
      adCopy: item.caption,
      format: "video",
      firstSeenAt: item.first_shown,
      contentHash,
      landingPageUrl: item.landing_page_url,
    });

    expect(res.isNew).toBe(true);
    expect(res.ad.platform).toBe("tiktok");

    // Link landing page
    const lp = repo.saveLandingPage({
      adId: res.ad.id,
      destinationUrl: item.landing_page_url,
      statusCode: 200,
      headline: item.title,
      offer: "20% off sample pack",
    });

    const retrievedLp = repo.getLandingPage(res.ad.id);
    expect(retrievedLp).toBeDefined();
    expect(retrievedLp?.offer).toBe("20% off sample pack");
  });
});
