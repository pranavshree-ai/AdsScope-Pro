import { adapterRegistry } from "./adapters/registry";
import { DiscoveredCompetitor } from "./adapters/types";
import { logger } from "../lib/logger";

export interface AutoDiscoveryRequest {
  nicheName: string;
  category: string;
  seedKeywords: string[];
  region?: string;
}

export class DiscoveryService {
  async discoverCompetitors(params: AutoDiscoveryRequest): Promise<DiscoveredCompetitor[]> {
    logger.info({ niche: params.nicheName, seeds: params.seedKeywords }, "Running competitor auto-discovery");

    const metaAdapter = adapterRegistry.getAdapter("meta");
    const googleAdapter = adapterRegistry.getAdapter("google");
    const tiktokAdapter = adapterRegistry.getAdapter("tiktok");

    const queryTerms = params.seedKeywords.length > 0 ? params.seedKeywords : [params.nicheName];
    const discoveredMap = new Map<string, DiscoveredCompetitor>();

    for (const term of queryTerms) {
      try {
        const [metaResults, googleResults, tiktokResults] = await Promise.all([
          metaAdapter.searchCompetitor(term, { region: params.region }),
          googleAdapter.searchCompetitor(term),
          tiktokAdapter.searchCompetitor(term),
        ]);

        const combined = [...metaResults, ...googleResults, ...tiktokResults];
        for (const item of combined) {
          const key = item.domain.toLowerCase();
          if (!discoveredMap.has(key)) {
            discoveredMap.set(key, item);
          } else {
            // Boost confidence if found across multiple platforms
            const existing = discoveredMap.get(key)!;
            existing.confidenceScore = Math.min(99, existing.confidenceScore + 5);
            existing.adCountEstimated += item.adCountEstimated;
          }
        }
      } catch (err) {
        logger.error({ err, term }, "Error during competitor discovery term search");
      }
    }

    return Array.from(discoveredMap.values()).sort((a, b) => b.confidenceScore - a.confidenceScore);
  }
}

export const discoveryService = new DiscoveryService();
