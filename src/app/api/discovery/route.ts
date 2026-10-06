import { NextRequest, NextResponse } from "next/server";
import { discoveryService } from "@/services/discovery-service";
import { z } from "zod";

const DiscoverySchema = z.object({
  nicheName: z.string().min(2),
  category: z.string().min(2),
  seedKeywords: z.array(z.string()).default([]),
  region: z.string().default("US"),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = DiscoverySchema.parse(body);

    const suggestions = await discoveryService.discoverCompetitors(validated);
    return NextResponse.json({ success: true, suggestions });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
