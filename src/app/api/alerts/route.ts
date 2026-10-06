import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";

export async function GET() {
  try {
    const session = await getSessionContext();
    const alerts = repo.getAlerts(session.workspace.id);
    const unreadCount = alerts.filter((a) => a.status === "unread").length;
    return NextResponse.json({ success: true, unreadCount, alerts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const { alertId } = await req.json();

    repo.markAlertRead(alertId, session.workspace.id);
    return NextResponse.json({ success: true, message: "Alert marked as read" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
