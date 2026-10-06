import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";
import { canAddNiche } from "@/lib/plans";
import { z } from "zod";

const CreateNicheSchema = z.object({
  name: z.string().min(2, "Name is required"),
  category: z.string().min(2, "Category is required"),
  region: z.string().default("US"),
  language: z.string().default("en"),
  targetAudience: z.string().optional(),
  description: z.string().optional(),
});

export async function GET() {
  try {
    const session = await getSessionContext();
    const niches = repo.getNiches(session.workspace.id);
    return NextResponse.json({ success: true, niches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const currentNiches = repo.getNiches(session.workspace.id);

    if (!canAddNiche(currentNiches.length, session.workspace.planTier)) {
      return NextResponse.json(
        { success: false, error: "Niche limit reached for your current plan tier. Please upgrade." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = CreateNicheSchema.parse(body);

    const niche = repo.createNiche(session.workspace.id, validated);
    repo.recordAudit(session.workspace.id, "create_niche", "niche", niche.id);

    return NextResponse.json({ success: true, niche });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
