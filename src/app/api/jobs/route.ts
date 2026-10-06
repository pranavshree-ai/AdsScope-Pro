import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";
import { queueService } from "@/queue/queue";

export async function GET() {
  try {
    const session = await getSessionContext();
    const jobs = repo.getJobs(session.workspace.id);
    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const body = await req.json();

    const jobId = await queueService.enqueue({
      workspaceId: session.workspace.id,
      type: body.type || "sync_ads",
      payload: body.payload || {},
    });

    return NextResponse.json({ success: true, message: "Job enqueued", jobId });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
