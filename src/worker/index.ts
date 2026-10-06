import { repo } from "../db/repo";
import { monitoringService } from "../services/monitoring-service";
import { adapterRegistry } from "../services/adapters/registry";
import { createBullMQWorker } from "../queue/bullmq";
import { logger } from "../lib/logger";

async function runWorkerDaemon() {
  logger.info("AdScope Background Worker Service starting up...");

  // 1. Initialize BullMQ Worker for queue consumption with DLQ & exponential retries
  const bullWorker = createBullMQWorker();

  // 2. Periodic scheduled evaluator loop for monitoring watch rules & health status
  const monitorInterval = setInterval(async () => {
    try {
      const workspaces = repo.getWorkspaces();
      for (const ws of workspaces) {
        logger.debug({ workspaceId: ws.id }, "Evaluating workspace watch rules");
        await monitoringService.evaluateMonitors(ws.id);
      }
    } catch (err: any) {
      logger.error({ err: err.message }, "Error during background worker cycle");
    }
  }, 60000); // 1 minute schedule

  // Graceful shutdown handling
  const shutdown = async () => {
    logger.info("Worker gracefully shutting down...");
    clearInterval(monitorInterval);
    if (bullWorker) {
      await bullWorker.close();
    }
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);

  logger.info("AdScope Background Worker Daemon is active and listening for jobs.");
}

runWorkerDaemon();
