import { AdSourceAdapter, PlatformType, SourceHealthStatus } from "./types";
import { MetaAdLibraryAdapter } from "./meta-adapter";
import { GoogleAdsTransparencyAdapter } from "./google-adapter";
import { TikTokCreativeCenterAdapter } from "./tiktok-adapter";
import { logger } from "../../lib/logger";

class AdapterRegistry {
  private adapters: Map<PlatformType, AdSourceAdapter> = new Map();

  constructor() {
    this.register(new MetaAdLibraryAdapter());
    this.register(new GoogleAdsTransparencyAdapter());
    this.register(new TikTokCreativeCenterAdapter());
  }

  register(adapter: AdSourceAdapter) {
    this.adapters.set(adapter.platform, adapter);
    logger.info({ platform: adapter.platform, name: adapter.name }, "Registered AdSourceAdapter");
  }

  getAdapter(platform: PlatformType): AdSourceAdapter {
    const adapter = this.adapters.get(platform);
    if (!adapter) {
      throw new Error(`No adapter registered for platform: ${platform}`);
    }
    return adapter;
  }

  getAllAdapters(): AdSourceAdapter[] {
    return Array.from(this.adapters.values());
  }

  async getHealthAll(): Promise<SourceHealthStatus[]> {
    const results = await Promise.all(
      this.getAllAdapters().map(async (adapter) => {
        try {
          return await adapter.getHealth();
        } catch (err: any) {
          return {
            platform: adapter.platform,
            status: "error" as const,
            latencyMs: 999,
            errorMessage: err.message,
            lastCheckAt: new Date().toISOString(),
          };
        }
      })
    );
    return results;
  }
}

export const adapterRegistry = new AdapterRegistry();
