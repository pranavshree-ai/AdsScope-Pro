import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { repo } from "@/db/repo";
import { monitoringService } from "@/services/monitoring-service";
import { z } from "zod";

const CreateMonitorSchema = z.object({
  competitorId: z.string().optional(),
  nicheId: z.string().optional(),
  ruleType: z.enum(["new_ad", "new_offer", "velocity_spike", "ad_stopped"]),
  config: z.object({
    thresholdDays: z.number().default(7),
    slackWebhook: z.string().optional(),
    emailNotification: z.boolean().default(true),
  }),
});

export async function GET() {
  try {
    const session = await getSessionContext();
    const monitors = repo.getMonitors(session.workspace.id);
    return NextResponse.json({ success: true, monitors });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionContext();
    const body = await req.json();
    const validated = CreateMonitorSchema.parse(body);

    const monitor = repo.createMonitor(session.workspace.id, validated);
    repo.recordAudit(session.workspace.id, "create_monitor", "monitor", monitor.id);

    return NextResponse.json({ success: true, monitor });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
