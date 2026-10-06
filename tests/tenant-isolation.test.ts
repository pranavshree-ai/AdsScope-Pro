import { describe, it, expect, beforeEach } from "vitest";
import { repo } from "../src/db/repo";

describe("Security & Compliance: Multi-Tenant Isolation Enforcement", () => {
  const wsA = "tenant_alpha_corp";
  const wsB = "tenant_beta_enterprises";

  beforeEach(() => {
    repo.createWorkspace({ id: wsA, name: "Tenant Alpha Corp", slug: "alpha-corp", planTier: "starter" });
    repo.createWorkspace({ id: wsB, name: "Tenant Beta Enterprises", slug: "beta-ent", planTier: "pro" });
  });

  it("strictly isolates niches across tenants", () => {
    // Tenant B creates a confidential niche
    const nicheB = repo.createNiche(wsB, {
      name: "Confidential Biotech Niche",
      category: "Biotech",
    });

    // Tenant A queries niches
    const alphaNiches = repo.getNiches(wsA);
    const alphaDirectFetch = repo.getNiche(nicheB.id, wsA);

    expect(alphaNiches.find((n) => n.id === nicheB.id)).toBeUndefined();
    expect(alphaDirectFetch).toBeUndefined();
  });

  it("strictly isolates competitors across tenants", () => {
    const compB = repo.createCompetitor(wsB, {
      name: "Secret Competitor Target",
      domain: "secretbrand.com",
    });

    const alphaCompetitors = repo.getCompetitors(wsA);
    const alphaDirectComp = repo.getCompetitor(compB.id, wsA);

    expect(alphaCompetitors.find((c) => c.id === compB.id)).toBeUndefined();
    expect(alphaDirectComp).toBeUndefined();

    // Tenant A cannot mutate Tenant B competitor
    const unauthorizedUpdate = repo.updateCompetitor(compB.id, wsA, { name: "Hacked Name" });
    expect(unauthorizedUpdate).toBeUndefined();
  });

  it("strictly isolates ad creatives, copy, and intelligence", () => {
    const adB = repo.upsertAd({
      workspaceId: wsB,
      competitorId: "cmp_beta_01",
      platform: "meta",
      externalAdId: "meta_confidential_999",
      advertiserName: "Stealth Stealthy Inc",
      headline: "Proprietary $50M Scaling Strategy",
      contentHash: "hash_beta_secret",
    });

    const alphaAds = repo.getAds(wsA);
    const alphaDirectAd = repo.getAd(adB.ad.id, wsA);

    expect(alphaAds.find((a) => a.id === adB.ad.id)).toBeUndefined();
    expect(alphaDirectAd).toBeUndefined();
  });

  it("strictly isolates generated strategies and cited competitor ads", () => {
    const stratB = repo.saveStrategy(
      {
        workspaceId: wsB,
        nicheId: "nic_beta_01",
        title: "Beta Confidential Market Strategy",
        brandProfile: {
          productName: "Brand Beta",
          description: "Secret formula",
          targetAudience: "Enterprise",
          usp: "Speed",
          pricePoint: "$100",
        },
        positioningGaps: [],
        twoWeekTestPlan: [],
      },
      [
        {
          conceptTitle: "Secret Concept",
          hook: "Secret Hook",
          copyVariants: ["Variant 1"],
          creativeDirection: "Video",
          angle: "Confidential Angle",
          funnelStage: "top",
          citedAdIds: ["ad_123"],
        },
      ]
    );

    const alphaStrategies = repo.getStrategies(wsA);
    const alphaDirectStrat = repo.getStrategy(stratB.id, wsA);

    expect(alphaStrategies.find((s) => s.id === stratB.id)).toBeUndefined();
    expect(alphaDirectStrat).toBeUndefined();
  });

  it("strictly isolates surveillance watch rules, alerts, and audit logs", () => {
    const monitorB = repo.createMonitor(wsB, {
      ruleType: "new_offer",
      config: { emailNotification: true },
    });

    const alertB = repo.createAlert(wsB, {
      title: "Confidential Offer Shift for Beta",
      message: "Competitor lowered price to $19",
      severity: "alert",
    });

    const alphaMonitors = repo.getMonitors(wsA);
    const alphaAlerts = repo.getAlerts(wsA);

    expect(alphaMonitors.find((m) => m.id === monitorB.id)).toBeUndefined();
    expect(alphaAlerts.find((a) => a.id === alertB.id)).toBeUndefined();
  });
});
