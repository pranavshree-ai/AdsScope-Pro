import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const { searchParams } = new URL(req.url);

    const nicheId = searchParams.get("nicheId") || undefined;
    const competitorId = searchParams.get("competitorId") || undefined;
    const platform = searchParams.get("platform") || undefined;
    const format = searchParams.get("format") || undefined;
    const search = searchParams.get("search") || undefined;
    const minActiveDays = searchParams.get("minActiveDays") ? parseInt(searchParams.get("minActiveDays")!) : undefined;
    const hookType = searchParams.get("hookType") || undefined;

    const ads = repo.getAds(session.workspace.id, {
      nicheId,
      competitorId,
      platform,
      format,
      search,
      minActiveDays,
      hookType,
    });

    const analyses = repo.getAnalyses(session.workspace.id);
    const analysisMap = new Map(analyses.map((a) => [a.adId, a]));

    const enriched = ads.map((ad) => {
      const an = analysisMap.get(ad.id);
      const lp = repo.getLandingPage(ad.id);
      return {
        ...ad,
        analysis: an || null,
        landingPage: lp || null,
      };
    });

    // Optional filter by hookType
    const filtered = hookType
      ? enriched.filter((a) => a.analysis?.hookType === hookType)
      : enriched;

    return NextResponse.json({ success: true, count: filtered.length, ads: filtered });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
