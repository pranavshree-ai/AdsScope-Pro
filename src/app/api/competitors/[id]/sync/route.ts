import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";
import { queueService } from "@/queue/queue";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionContext();

    const competitor = repo.getCompetitor(id, session.workspace.id);
    if (!competitor) {
      return NextResponse.json({ success: false, error: "Competitor not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    const platform = body.platform || "meta";

    const jobId = await queueService.enqueue({
      workspaceId: session.workspace.id,
      type: "sync_ads",
      payload: { competitorId: competitor.id, platform },
    });

    return NextResponse.json({ success: true, message: "Sync job enqueued", jobId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
