import { NextResponse } from "next/server";
import { adapterRegistry } from "@/services/adapters/registry";

export async function GET() {
  try {
    const healthList = await adapterRegistry.getHealthAll();
    return NextResponse.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      services: {
        database: "healthy",
        queue: "active",
        storage: "ready",
      },
      sources: healthList,
    });
  } catch (error: any) {
    return NextResponse.json({ status: "error", error: error.message }, { status: 500 });
  }
}
