import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";
import { strategyService } from "@/services/strategy-service";
import { hasSufficientCredits } from "@/lib/plans";
import { z } from "zod";

const GenerateStrategySchema = z.object({
  nicheId: z.string().min(1),
  brandProfile: z.object({
    productName: z.string().min(2),
    description: z.string().min(5),
    targetAudience: z.string().min(5),
    usp: z.string().min(5),
    pricePoint: z.string().default("$39 - $79"),
  }),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const { searchParams } = new URL(req.url);
    const nicheId = searchParams.get("nicheId") || undefined;

    const strategies = repo.getStrategies(session.workspace.id, nicheId);
    return NextResponse.json({ success: true, strategies });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionContext();

    if (!hasSufficientCredits(session.workspace.aiCreditsBalance, 50)) {
      return NextResponse.json(
        {
          success: false,
          error: "Insufficient AI credits balance (50 credits required). Please upgrade your subscription.",
        },
        { status: 402 }
      );
    }

    const body = await req.json();
    const validated = GenerateStrategySchema.parse(body);

    const strategy = await strategyService.generateStrategy({
      workspaceId: session.workspace.id,
      nicheId: validated.nicheId,
      brandProfile: validated.brandProfile,
    });

    return NextResponse.json({ success: true, strategy });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
