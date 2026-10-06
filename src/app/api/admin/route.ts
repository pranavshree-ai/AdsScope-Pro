import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";
import { adapterRegistry } from "@/services/adapters/registry";

export async function GET() {
  try {
    const session = await getSessionContext();

    const workspaces = repo.getWorkspaces();
    const sourcesHealth = await adapterRegistry.getHealthAll();

    const tenantsOverview = workspaces.map((ws) => {
      const competitors = repo.getCompetitors(ws.id);
      const ads = repo.getAds(ws.id);
      const analyses = repo.getAnalyses(ws.id);
      const strategies = repo.getStrategies(ws.id);
      const ledger = repo.getUsageLedger(ws.id);
      const creditsUsed = ledger.reduce((acc, curr) => acc + curr.creditsConsumed, 0);

      // Estimated cost calculation ($0.003 per credit)
      const estimatedCost = (creditsUsed * 0.003).toFixed(2);

      return {
        id: ws.id,
        name: ws.name,
        slug: ws.slug,
        planTier: ws.planTier,
        aiCreditsBalance: ws.aiCreditsBalance,
        competitorsCount: competitors.length,
        adsCount: ads.length,
        analysesCount: analyses.length,
        strategiesCount: strategies.length,
        creditsUsed,
        estimatedCostUsd: `$${estimatedCost}`,
        createdAt: ws.createdAt,
      };
    });

    return NextResponse.json({
      success: true,
      currentUserRole: session.user.role,
      summary: {
        totalTenants: workspaces.length,
        totalAdsAcrossTenants: tenantsOverview.reduce((a, b) => a + b.adsCount, 0),
        totalStrategiesGenerated: tenantsOverview.reduce((a, b) => a + b.strategiesCount, 0),
      },
      sourcesHealth,
      tenants: tenantsOverview,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
