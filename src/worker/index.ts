import { repo } from "../db/repo";
import { monitoringService } from "../services/monitoring-service";
import { adapterRegistry } from "../services/adapters/registry";
import { logger } from "../lib/logger";

async function runWorkerLoop() {
  logger.info("AdScope Background Worker Service initialized.");

  // Periodic health check and monitor evaluator loop
  const interval = setInterval(async () => {
    try {
      const workspaces = repo.getWorkspaces();
      for (const ws of workspaces) {
        logger.debug({ workspaceId: ws.id }, "Evaluating workspace watch rules");
        await monitoringService.evaluateMonitors(ws.id);
      }
    } catch (err: any) {
      logger.error({ err: err.message }, "Error during background worker cycle");
    }
  }, 60000); // Every minute

  process.on("SIGINT", () => {
    clearInterval(interval);
    logger.info("Worker gracefully shutting down");
    process.exit(0);
  });
}

runWorkerLoop();
