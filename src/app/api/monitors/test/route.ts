import { NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { monitoringService } from "@/services/monitoring-service";

export async function POST() {
  try {
    const session = await getSessionContext();
    const alerts = await monitoringService.evaluateMonitors(session.workspace.id);
    return NextResponse.json({ success: true, count: alerts.length, alerts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
