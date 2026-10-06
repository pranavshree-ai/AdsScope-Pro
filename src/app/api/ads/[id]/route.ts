import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSessionContext();

    const ad = repo.getAd(id, session.workspace.id);
    if (!ad) {
      return NextResponse.json({ success: false, error: "Ad not found" }, { status: 404 });
    }

    const analysis = repo.getAnalysisForAd(ad.id, session.workspace.id);
    const landingPage = repo.getLandingPage(ad.id);
    const competitor = repo.getCompetitor(ad.competitorId, session.workspace.id);

    return NextResponse.json({
      success: true,
      ad: {
        ...ad,
        analysis: analysis || null,
        landingPage: landingPage || null,
        competitor: competitor || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
