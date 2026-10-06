import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";
import { canAddCompetitor } from "@/lib/plans";
import { queueService } from "@/queue/queue";
import { z } from "zod";

const CreateCompetitorSchema = z.object({
  nicheId: z.string().min(1),
  name: z.string().min(2),
  domain: z.string().min(3),
  pageIdMeta: z.string().optional(),
  advertiserIdGoogle: z.string().optional(),
  tiktokHandle: z.string().optional(),
  logoUrl: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const nicheId = searchParams.get("nicheId") || undefined;

    const competitors = repo.getCompetitors(session.workspace.id, nicheId);
    return NextResponse.json({ success: true, competitors });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const currentCompetitors = repo.getCompetitors(session.workspace.id);

    if (!canAddCompetitor(currentCompetitors.length, session.workspace.planTier)) {
      return NextResponse.json(
        {
          success: false,
          error: "Competitor tracking limit reached for your plan tier. Please upgrade to track more competitors.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = CreateCompetitorSchema.parse(body);

    const competitor = repo.createCompetitor(session.workspace.id, validated);
    repo.recordAudit(session.workspace.id, "create_competitor", "competitor", competitor.id);

    // Automatically trigger initial collection job
    await queueService.enqueue({
      workspaceId: session.workspace.id,
      type: "sync_ads",
      payload: { competitorId: competitor.id, platform: "meta" },
    });

    return NextResponse.json({ success: true, competitor });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
