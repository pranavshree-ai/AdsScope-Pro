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

    const strategy = repo.getStrategy(id, session.workspace.id);
    if (!strategy) {
      return NextResponse.json({ success: false, error: "Strategy not found" }, { status: 404 });
    }

    // Resolve cited ads across all concepts
    const citedAdIds = new Set<string>();
    strategy.items?.forEach((item) => {
      item.citedAdIds.forEach((adId) => citedAdIds.add(adId));
    });
    strategy.positioningGaps.forEach((gap) => {
      gap.evidenceAdIds?.forEach((adId) => citedAdIds.add(adId));
    });

    const citedAds = Array.from(citedAdIds).map((adId) => repo.getAd(adId, session.workspace.id)).filter(Boolean);

    return NextResponse.json({
      success: true,
      strategy,
      citedAds,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
