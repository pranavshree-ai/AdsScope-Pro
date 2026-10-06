import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/db/repo";
import { z } from "zod";

const CreateWorkspaceSchema = z.object({
  name: z.string().min(2, "Workspace name must be at least 2 characters"),
  slug: z.string().min(2).optional(),
  planTier: z.enum(["free_trial", "starter", "pro", "agency"]).default("starter"),
});

export async function GET() {
  const workspaces = repo.getWorkspaces();
  return NextResponse.json({ success: true, workspaces });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = CreateWorkspaceSchema.parse(body);

    const slug = validated.slug || validated.name.toLowerCase().replace(/[^a-z0-9]/g, "-");
    const ws = repo.createWorkspace({
      name: validated.name,
      slug,
      planTier: validated.planTier,
      aiCreditsBalance: validated.planTier === "agency" ? 5000 : validated.planTier === "pro" ? 1000 : 250,
    });

    const res = NextResponse.json({ success: true, workspace: ws });
    res.cookies.set("adscope_active_workspace", ws.id, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
