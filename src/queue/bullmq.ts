import { Queue, Worker, Job as BullJob } from "bullmq";
import Redis from "ioredis";
import { repo } from "../db/repo";
import { ingestionService } from "../services/ingestion-service";
import { llmService } from "../services/llm-service";
import { monitoringService } from "../services/monitoring-service";
import { strategyService } from "../services/strategy-service";
import { logger } from "../lib/logger";

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

let redisConnection: Redis | null = null;
let isRedisAvailable = false;

try {
  redisConnection = new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    retryStrategy: (times) => {
      if (times > 3) return null; // stop reconnecting if redis not running locally
      return Math.min(times * 200, 2000);
    },
    lazyConnect: true,
  });

  redisConnection.on("error", (err) => {
    logger.debug({ err: err.message }, "Redis connection offline, using fallback in-memory executor");
    isRedisAvailable = false;
  });

  redisConnection.connect().then(() => {
    isRedisAvailable = true;
    logger.info("Connected to Redis successfully for BullMQ");
  }).catch(() => {
    isRedisAvailable = false;
  });
} catch (err: any) {
  logger.warn({ err: err.message }, "Redis connection failed, running in resilient standalone mode");
}

// 1. Primary Collection Queue with 3 Exponential Backoff Retries
export const collectionQueue = new Queue("adscope-collection-queue", {
  connection: (redisConnection as any) || { host: "localhost", port: 6379 },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 2000, // 2s, 4s, 8s
    },
    removeOnComplete: 200,
    removeOnFail: false, // Keep in failed set for inspection
  },
});

// 2. Dead-Letter Queue (DLQ) for permanently failed jobs after all retries
export const deadLetterQueue = new Queue("adscope-dead-letter-queue", {
  connection: (redisConnection as any) || { host: "localhost", port: 6379 },
  defaultJobOptions: {
    removeOnComplete: false,
  },
});

// Helper to push to dead letter queue
export async function sendToDeadLetterQueue(jobId: string, type: string, payload: any, error: Error) {
  logger.error({ jobId, type, error: error.message }, "Job exceeded max retry attempts -> forwarding to Dead-Letter Queue");
  try {
    if (isRedisAvailable && deadLetterQueue) {
      await deadLetterQueue.add("dead-letter-job", {
        originalJobId: jobId,
        type,
        payload,
        failedAt: new Date().toISOString(),
        error: error.message,
        stack: error.stack,
      });
    }
  } catch (dlqErr) {
    logger.error({ dlqErr }, "Failed to write to BullMQ dead-letter queue");
  }
}

// BullMQ Worker Executor Function
export async function executeJobTask(type: string, payload: any, workspaceId: string) {
  if (type === "sync_ads") {
    const competitor = repo.getCompetitor(payload.competitorId, workspaceId);
    if (!competitor) throw new Error(`Competitor ${payload.competitorId} not found`);
    return await ingestionService.ingestCompetitorAds(workspaceId, competitor, payload.platform || "meta");
  } else if (type === "analyze_ad") {
    const ad = repo.getAd(payload.adId, workspaceId);
    if (!ad) throw new Error(`Ad ${payload.adId} not found`);
    return await llmService.analyzeAd(ad, workspaceId);
  } else if (type === "generate_strategy") {
    return await strategyService.generateStrategy({
      workspaceId,
      nicheId: payload.nicheId,
      brandProfile: payload.brandProfile,
    });
  } else if (type === "check_monitors") {
    return await monitoringService.evaluateMonitors(workspaceId);
  }
  throw new Error(`Unknown job type: ${type}`);
}

// Initialize BullMQ Worker Service
export function createBullMQWorker() {
  if (!isRedisAvailable || !redisConnection) {
    logger.info("BullMQ Worker running with resilient fallback event loop");
    return null;
  }

  const worker = new Worker(
    "adscope-collection-queue",
    async (job: BullJob) => {
      logger.info({ jobId: job.id, name: job.name, attempt: job.attemptsMade + 1 }, "Processing BullMQ job");
      const { type, payload, workspaceId } = job.data;
      return await executeJobTask(type, payload, workspaceId);
    },
    {
      connection: redisConnection,
      concurrency: 5,
    }
  );

  worker.on("completed", (job) => {
    logger.info({ jobId: job.id }, "BullMQ Job completed successfully");
  });

  worker.on("failed", async (job, err) => {
    if (job) {
      logger.warn({ jobId: job.id, attemptsMade: job.attemptsMade, error: err.message }, "BullMQ Job attempt failed");
      if (job.attemptsMade >= (job.opts.attempts || 3)) {
        await sendToDeadLetterQueue(job.id || "unknown", job.data.type, job.data.payload, err);
      }
    }
  });

  return worker;
}
