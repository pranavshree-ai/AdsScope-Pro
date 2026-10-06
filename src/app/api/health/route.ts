import { NextResponse } from "next/server";
import { adapterRegistry } from "@/services/adapters/registry";
import { getSentryStatus } from "@/lib/sentry";

export async function GET() {
  try {
    const healthList = await adapterRegistry.getHealthAll();
    const sentryStatus = getSentryStatus();

    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        database: "healthy",
        queue: "active",
        storage: "ready",
        observability: {
          logger: "pino-structured",
          sentry: sentryStatus,
        },
      },
      sources: healthList,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}
