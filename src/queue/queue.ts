import { repo } from "../db/repo";
import { ingestionService } from "../services/ingestion-service";
import { llmService } from "../services/llm-service";
import { monitoringService } from "../services/monitoring-service";
import { strategyService } from "../services/strategy-service";
import { logger } from "../lib/logger";

export type JobType = "sync_ads" | "analyze_ad" | "generate_strategy" | "check_monitors" | "discover_competitors";

export interface EnqueueJobOptions {
  workspaceId: string;
  type: JobType;
  payload: any;
}

export class QueueService {
  async enqueue(options: EnqueueJobOptions): Promise<string> {
    const job = repo.createJob(options.workspaceId, {
      type: options.type,
      status: "queued",
      progress: 0,
      payload: options.payload,
    });

    logger.info({ jobId: job.id, type: options.type, workspaceId: options.workspaceId }, "Enqueued background job");

    // Process asynchronously without blocking HTTP caller
    setImmediate(() => {
      this.processJob(job.id, options.workspaceId, options.type, options.payload);
    });

    return job.id;
  }

  private async processJob(jobId: string, workspaceId: string, type: JobType, payload: any) {
    try {
      repo.updateJob(jobId, workspaceId, { status: "running", progress: 20 });
      logger.info({ jobId, type }, "Executing background job");

      let result: any = null;

      if (type === "sync_ads") {
        const competitor = repo.getCompetitor(payload.competitorId, workspaceId);
        if (competitor) {
          result = await ingestionService.ingestCompetitorAds(workspaceId, competitor, payload.platform || "meta");
        }
      } else if (type === "analyze_ad") {
        const ad = repo.getAd(payload.adId, workspaceId);
        if (ad) {
          result = await llmService.analyzeAd(ad, workspaceId);
        }
      } else if (type === "generate_strategy") {
        result = await strategyService.generateStrategy({
          workspaceId,
          nicheId: payload.nicheId,
          brandProfile: payload.brandProfile,
        });
      } else if (type === "check_monitors") {
        result = await monitoringService.evaluateMonitors(workspaceId);
      }

      repo.updateJob(jobId, workspaceId, {
        status: "completed",
        progress: 100,
        result,
        finishedAt: new Date().toISOString(),
      });
      logger.info({ jobId, type }, "Background job completed successfully");
    } catch (err: any) {
      logger.error({ jobId, type, err: err.message }, "Background job failed");
      repo.updateJob(jobId, workspaceId, {
        status: "failed",
        errorMessage: err.message,
        finishedAt: new Date().toISOString(),
      });
    }
  }
}

export const queueService = new QueueService();
