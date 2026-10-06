import { NextRequest, NextResponse } from "next/server";
import { repo } from "@/db/repo";

export async function POST(req: NextRequest) {
  try {
    const { workspaceId } = await req.json();
    const ws = repo.getWorkspace(workspaceId);
    if (!ws) {
      return NextResponse.json({ success: false, error: "Workspace not found" }, { status: 404 });
    }

    const res = NextResponse.json({ success: true, workspace: ws });
    res.cookies.set("adscope_active_workspace", ws.id, { path: "/", maxAge: 60 * 60 * 24 * 30 });
    return res;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
