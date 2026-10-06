import { describe, it, expect } from "vitest";
import { repo } from "../../src/db/repo";
import { discoveryService } from "../../src/services/discovery-service";
import { strategyService } from "../../src/services/strategy-service";
import { monitoringService } from "../../src/services/monitoring-service";
import { emailDigestService } from "../../src/services/email-digest-service";
import { stripeService } from "../../src/services/stripe-service";

describe("E2E User Journey & SaaS Lifecycle", () => {
  const wsId = "ws_e2e_journey";

  it("1. User Onboarding, Niche Creation & Competitor Auto-Discovery", async () => {
    // A. Create workspace
    const ws = repo.createWorkspace({
      id: wsId,
      name: "E2E Performance Labs",
      slug: "e2e-performance",
      planTier: "pro",
      aiCreditsBalance: 500,
    });
    expect(ws.id).toBe(wsId);

    // B. Create Niche
    const niche = repo.createNiche(wsId, {
      name: "E2E Adaptogenic Coffee",
      category: "D2C Functional Beverage",
      region: "US",
    });
    expect(niche.name).toBe("E2E Adaptogenic Coffee");

    // C. Run Auto-Discovery across ad libraries
    const suggestions = await discoveryService.discoverCompetitors({
      nicheName: niche.name,
      category: niche.category,
      seedKeywords: ["Ryze", "Four Sigmatic", "Mushroom Coffee"],
    });
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions[0].confidenceScore).toBeGreaterThan(50);

    // D. Approve competitor
    const top = suggestions[0];
    const competitor = repo.createCompetitor(wsId, {
      nicheId: niche.id,
      name: top.name,
      domain: top.domain,
      pageIdMeta: top.platformId,
    });
    expect(competitor.domain).toBe(top.domain);
  });

  it("2. Ad Ingestion & Explorer Filtering Flow", () => {
    const competitors = repo.getCompetitors(wsId);
    const comp = competitors[0];

    // Ingest simulated ads
    const ad1 = repo.upsertAd({
      workspaceId: wsId,
      competitorId: comp.id,
      platform: "meta",
      externalAdId: "meta_e2e_ad_101",
      advertiserName: comp.name,
      headline: "Stop drinking 4 cups of bitter coffee that ruin your sleep",
      adCopy: "Ceremonial matcha and lion's mane for 7 hours of smooth flow.",
      format: "video",
      activeDays: 92,
      contentHash: "hash_e2e_1",
    });

    const ad2 = repo.upsertAd({
      workspaceId: wsId,
      competitorId: comp.id,
      platform: "tiktok",
      externalAdId: "tiktok_e2e_ad_102",
      advertiserName: comp.name,
      headline: "POV: You quit coffee and started nootropics",
      adCopy: "No jitters, no crash. Claim your starter pack.",
      format: "video",
      activeDays: 14,
      contentHash: "hash_e2e_2",
    });

    // Test Ad Explorer multi-filter
    const metaAds = repo.getAds(wsId, { platform: "meta" });
    expect(metaAds.length).toBeGreaterThanOrEqual(1);

    const winners = repo.getAds(wsId, { minActiveDays: 60 });
    expect(winners.length).toBeGreaterThanOrEqual(1);
    expect(winners[0].activeDays).toBeGreaterThanOrEqual(60);
  });

  it("3. Evidence-Grounded Strategy Generation Flow", async () => {
    const niches = repo.getNiches(wsId);
    const niche = niches[0];

    const strategy = await strategyService.generateStrategy({
      workspaceId: wsId,
      nicheId: niche.id,
      brandProfile: {
        productName: "Aura Brew Adaptogenic Elixir",
        description: "Cold-brew organic mushroom coffee",
        targetAudience: "Designers and developers",
        usp: "Zero afternoon crash with pure Alpha-GPC",
        pricePoint: "$42/box",
      },
    });

    expect(strategy).toBeDefined();
    expect(strategy.items).toBeDefined();
    expect(strategy.items!.length).toBe(10);

    // Verify all 10 concepts are grounded in verified ads
    for (const item of strategy.items!) {
      expect(item.citedAdIds.length).toBeGreaterThan(0);
      for (const id of item.citedAdIds) {
        const found = repo.getAd(id, wsId);
        expect(found).toBeDefined();
      }
    }
  });

  it("4. Surveillance Monitoring, Alerts & Weekly Email Digest Flow", async () => {
    // Create monitor rule
    const monitor = repo.createMonitor(wsId, {
      ruleType: "velocity_spike",
      config: { emailNotification: true },
    });
    expect(monitor.ruleType).toBe("velocity_spike");

    // Evaluate monitors
    const triggeredAlerts = await monitoringService.evaluateMonitors(wsId);
    expect(triggeredAlerts.length).toBeGreaterThanOrEqual(1);

    // Verify alert in notification feed
    const alerts = repo.getAlerts(wsId);
    expect(alerts.length).toBeGreaterThanOrEqual(1);

    // Dispatch weekly email digest
    const digestResult = await emailDigestService.dispatchWeeklyDigest(wsId);
    expect(digestResult.success).toBe(true);
    expect(digestResult.recipient).toBeDefined();
  });

  it("5. Stripe Webhook Signature Verification & Tier Upgrade", async () => {
    const mockWebhookPayload = {
      id: "evt_test_webhook_123",
      type: "checkout.session.completed",
      data: {
        object: {
          id: "cs_test_123",
          client_reference_id: wsId,
          customer: "cus_test_cust_123",
          subscription: "sub_test_sub_123",
          metadata: {
            workspaceId: wsId,
            planTier: "agency",
          },
        },
      },
    };

    const verifiedEvent = stripeService.verifyWebhookSignature(
      JSON.stringify(mockWebhookPayload),
      "mock_signature_header"
    );
    expect(verifiedEvent.type).toBe("checkout.session.completed");

    const result = await stripeService.handleWebhookEvent(verifiedEvent);
    expect(result.handled).toBe(true);

    const updatedWs = repo.getWorkspace(wsId);
    expect(updatedWs?.planTier).toBe("agency");
    expect(updatedWs?.stripeCustomerId).toBe("cus_test_cust_123");
  });
});
