import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";
import { analyticsService } from "@/services/analytics-service";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionContext();

    let insights = repo.getInsights(session.workspace.id, id);
    if (!insights) {
      insights = await analyticsService.aggregateNicheInsights(session.workspace.id, id);
    }

    return NextResponse.json({ success: true, insights });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
