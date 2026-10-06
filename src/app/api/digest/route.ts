import { NextRequest, NextResponse } from "next/server";
import { getSessionContext } from "@/lib/auth";
import { emailDigestService } from "@/services/email-digest-service";

export async function GET() {
  try {
    const session = await getSessionContext();
    const data = emailDigestService.generateDigestData(session.workspace.id);
    const html = emailDigestService.generateHtml(data);
    return NextResponse.json({ success: true, digest: data, previewHtml: html });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  try {
    const session = await getSessionContext();
    const result = await emailDigestService.dispatchWeeklyDigest(session.workspace.id);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
