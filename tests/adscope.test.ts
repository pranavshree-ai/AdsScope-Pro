import { describe, it, expect, beforeEach } from "vitest";
import { AdAnalysisSchema } from "../src/services/llm-service";
import { repo } from "../src/db/repo";
import { hashString } from "../src/lib/utils";
import { canAddCompetitor, canAddNiche, hasSufficientCredits, PLAN_LIMITS } from "../src/lib/plans";
import { adapterRegistry } from "../src/services/adapters/registry";
import { strategyService } from "../src/services/strategy-service";

describe("AdScope Core Engine Tests", () => {
  beforeEach(() => {
    // Ensure demo workspace and sample competitor exist
    const ws = repo.getWorkspace("ws_test");
    if (!ws) {
      repo.createWorkspace({
        id: "ws_test",
        name: "Test Lab",
        slug: "test-lab",
        planTier: "pro",
        aiCreditsBalance: 200,
      });
    }
  });

  describe("1. AI Analysis Schema Validation (Zod)", () => {
    it("successfully validates compliant analysis outputs", () => {
      const validPayload = {
        hookType: "contrarian",
        angle: "Coffee Replacement Protocol",
        offer: "30% Off First Box",
        cta: "Shop Now",
        emotionalDriver: "Relief from fatigue",
        objectionHandled: "Does it cause jitters or heart palpitations?",
        targetAudienceHints: "High performers aged 25-40",
        creativeFormat: "founder_story",
        funnelStage: "top",
        confidenceScore: 95,
      };

      const result = AdAnalysisSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it("rejects invalid hook types or missing fields", () => {
      const invalidPayload = {
        hookType: "invalid_hook_category",
        angle: "Short",
      };

      const result = AdAnalysisSchema.safeParse(invalidPayload);
      expect(result.success).toBe(false);
    });
  });

  describe("2. Idempotent Ingestion & Deduplication", () => {
    it("hashes strings deterministically", () => {
      const hash1 = hashString("Why coffee causes crashes");
      const hash2 = hashString("Why coffee causes crashes");
      const hash3 = hashString("Different copy entirely");

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
    });

    it("deduplicates ads with identical external IDs and updates active days", () => {
      const wsId = "ws_test";
      const compId = "cmp_test_01";

      const first = repo.upsertAd({
        workspaceId: wsId,
        competitorId: compId,
        platform: "meta",
        externalAdId: "meta_unique_test_123",
        advertiserName: "Test Brand",
        firstSeenAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        contentHash: "hash_test_1",
      });

      expect(first.isNew).toBe(true);

      // Re-inserting same ad simulates consecutive day crawl
      const second = repo.upsertAd({
        workspaceId: wsId,
        competitorId: compId,
        platform: "meta",
        externalAdId: "meta_unique_test_123",
        advertiserName: "Test Brand",
        contentHash: "hash_test_1",
      });

      expect(second.isNew).toBe(false);
      expect(second.ad.activeDays).toBeGreaterThanOrEqual(29);
    });
  });

  describe("3. SaaS Plan Limits & Quota Enforcement", () => {
    it("enforces competitor limits for Free Trial tier", () => {
      expect(canAddCompetitor(2, "free_trial")).toBe(true);
      expect(canAddCompetitor(3, "free_trial")).toBe(false);
      expect(canAddCompetitor(4, "free_trial")).toBe(false);
    });

    it("enforces niche limits for Starter tier", () => {
      expect(canAddNiche(2, "starter")).toBe(true);
      expect(canAddNiche(3, "starter")).toBe(false);
    });

    it("validates credit sufficiency", () => {
      expect(hasSufficientCredits(50, 50)).toBe(true);
      expect(hasSufficientCredits(49, 50)).toBe(false);
      expect(hasSufficientCredits(0, 50)).toBe(false);
    });
  });

  describe("4. Provider Adapters Integration", () => {
    it("registers all official ad adapters and returns health", async () => {
      const adapters = adapterRegistry.getAllAdapters();
      expect(adapters.length).toBeGreaterThanOrEqual(3);

      const health = await adapterRegistry.getHealthAll();
      expect(health.length).toBeGreaterThanOrEqual(3);
      for (const h of health) {
        expect(h.status).toBe("active");
        expect(h.latencyMs).toBeGreaterThan(0);
      }
    });

    it("performs discovery search across adapters", async () => {
      const meta = adapterRegistry.getAdapter("meta");
      const results = await meta.searchCompetitor("energy drink");
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].confidenceScore).toBeGreaterThan(50);
    });
  });

  describe("5. Grounded Strategy Generator Citations", () => {
    it("enforces verifiable cited_ad_ids on all generated concepts", async () => {
      const ws = repo.getWorkspace("ws_acme_growth");
      if (!ws) return;

      const niche = repo.getNiches(ws.id)[0];
      if (!niche) return;

      const strategy = await strategyService.generateStrategy({
        workspaceId: ws.id,
        nicheId: niche.id,
        brandProfile: {
          productName: "Test Beverage",
          description: "Nootropic sparkling water for coders",
          targetAudience: "Engineers",
          usp: "Clean energy without crash",
          pricePoint: "$3.00",
        },
      });

      expect(strategy).toBeDefined();
      expect(strategy.items).toBeDefined();
      expect(strategy.items!.length).toBe(10);

      // Verify each concept has cited ads
      for (const item of strategy.items!) {
        expect(item.citedAdIds).toBeDefined();
        expect(item.citedAdIds.length).toBeGreaterThan(0);
      }
    });
  });
});
