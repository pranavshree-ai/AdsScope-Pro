import { describe, it, expect, beforeEach } from "vitest";
import { repo } from "../src/db/repo";
import { strategyService } from "../src/services/strategy-service";

describe("Strategy Grounding & Verifiable Citations Validation", () => {
  const wsId = "ws_grounding_suite";
  let testNicheId: string;
  let validAdIds: string[] = [];

  beforeEach(() => {
    // 1. Create clean workspace
    repo.createWorkspace({
      id: wsId,
      name: "Grounding Suite Workspace",
      slug: "grounding-suite",
      planTier: "pro",
      aiCreditsBalance: 500,
    });

    // 2. Create niche
    const niche = repo.createNiche(wsId, {
      name: "Smart Hydration & Electrolytes",
      category: "D2C Wellness",
    });
    testNicheId = niche.id;

    // 3. Create competitor
    const competitor = repo.createCompetitor(wsId, {
      nicheId: testNicheId,
      name: "Electrolyte Co",
      domain: "electrolyte.co",
    });

    // 4. Ingest verified competitor ads
    const ad1 = repo.upsertAd({
      workspaceId: wsId,
      competitorId: competitor.id,
      platform: "meta",
      externalAdId: "meta_elec_101",
      advertiserName: "Electrolyte Co",
      headline: "Stop drinking plain water that flushes your minerals",
      adCopy: "Electrolytes without artificial sweeteners or food coloring. 30-day money back guarantee.",
      activeDays: 95,
      contentHash: "hash_elec_1",
    });

    const ad2 = repo.upsertAd({
      workspaceId: wsId,
      competitorId: competitor.id,
      platform: "meta",
      externalAdId: "meta_elec_102",
      advertiserName: "Electrolyte Co",
      headline: "The 3 PM Brain Fog Fix for Founders",
      adCopy: "Real Himalayan salt and magnesium malate. Backed by 5,000+ verified customer reviews.",
      activeDays: 140,
      contentHash: "hash_elec_2",
    });

    validAdIds = [ad1.ad.id, ad2.ad.id];
  });

  it("ensures every generated strategy concept cites existing ads belonging to the exact same workspace", async () => {
    const strategy = await strategyService.generateStrategy({
      workspaceId: wsId,
      nicheId: testNicheId,
      brandProfile: {
        productName: "Mineral Pure Electrolytes",
        description: "Zero-sugar clinical hydration powder",
        targetAudience: "Runners and crossfit athletes",
        usp: "1000mg sodium, zero stevia aftertaste",
        pricePoint: "$45/box",
      },
    });

    expect(strategy).toBeDefined();
    expect(strategy.workspaceId).toBe(wsId);
    expect(strategy.items).toBeDefined();
    expect(strategy.items!.length).toBe(10);

    // Verify citation integrity on every single concept
    for (const concept of strategy.items!) {
      expect(concept.citedAdIds).toBeDefined();
      expect(concept.citedAdIds.length).toBeGreaterThan(0);

      for (const citedAdId of concept.citedAdIds) {
        // Must exist in DB
        const adInDb = repo.getAd(citedAdId, wsId);
        expect(adInDb).toBeDefined();

        // Must strictly belong to the same workspace
        expect(adInDb?.workspaceId).toBe(wsId);

        // Must not belong to an external or other tenant
        expect(adInDb?.workspaceId).not.toBe("different_tenant_workspace");
      }
    }
  });

  it("prevents ungrounded strategy generation when no competitor ads exist in niche", async () => {
    // Create an empty niche with zero competitor ads
    const emptyNiche = repo.createNiche(wsId, {
      name: "Empty Niche With No Ads",
      category: "Test",
    });

    await expect(
      strategyService.generateStrategy({
        workspaceId: wsId,
        nicheId: emptyNiche.id,
        brandProfile: {
          productName: "Test Product",
          description: "Test description",
          targetAudience: "Test audience",
          usp: "Test USP",
          pricePoint: "$10",
        },
      })
    ).rejects.toThrow("Cannot generate strategy without collected competitor ads");
  });
});
