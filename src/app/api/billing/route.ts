import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";
import { PLAN_LIMITS, PlanTier } from "@/lib/plans";
import { z } from "zod";

const UpgradeSchema = z.object({
  planTier: z.enum(["free_trial", "starter", "pro", "agency"]),
});

export async function GET() {
  try {
    const session = await getSessionContext();
    const currentTier = session.workspace.planTier;
    const limits = PLAN_LIMITS[currentTier];

    const competitors = repo.getCompetitors(session.workspace.id);
    const niches = repo.getNiches(session.workspace.id);
    const usageLedger = repo.getUsageLedger(session.workspace.id);

    return NextResponse.json({
      success: true,
      currentTier,
      limits,
      balance: session.workspace.aiCreditsBalance,
      usage: {
        competitorsCount: competitors.length,
        nichesCount: niches.length,
        creditsConsumedTotal: usageLedger.reduce((acc, curr) => acc + curr.creditsConsumed, 0),
      },
      allPlans: PLAN_LIMITS,
      recentLedger: usageLedger.slice(0, 10),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const body = await req.json();
    const { planTier } = UpgradeSchema.parse(body);

    const bonusCredits: Record<PlanTier, number> = {
      free_trial: 50,
      starter: 250,
      pro: 1000,
      agency: 5000,
    };

    const updated = repo.updateWorkspace(session.workspace.id, {
      planTier,
      aiCreditsBalance: session.workspace.aiCreditsBalance + bonusCredits[planTier],
    });

    repo.recordAudit(session.workspace.id, "upgrade_plan", "workspace", session.workspace.id, {
      from: session.workspace.planTier,
      to: planTier,
    });

    return NextResponse.json({
      success: true,
      message: `Successfully upgraded to ${PLAN_LIMITS[planTier].name}!`,
      workspace: updated,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
