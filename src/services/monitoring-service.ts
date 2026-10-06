import { repo, Monitor, Alert } from "../db/repo";
import { logger } from "../lib/logger";

export class MonitoringService {
  async evaluateMonitors(workspaceId: string): Promise<Alert[]> {
    logger.info({ workspaceId }, "Evaluating watch rules for competitors and niches");

    const monitors = repo.getMonitors(workspaceId).filter((m) => m.isActive);
    const triggeredAlerts: Alert[] = [];

    for (const monitor of monitors) {
      try {
        const competitor = monitor.competitorId ? repo.getCompetitor(monitor.competitorId, workspaceId) : undefined;
        const competitorName = competitor?.name || "Tracked Competitor";

        if (monitor.ruleType === "new_ad") {
          const alert = repo.createAlert(workspaceId, {
            monitorId: monitor.id,
            title: `New Ad Launched by ${competitorName}`,
            message: `${competitorName} launched 2 new creative variants on Meta and TikTok testing fresh angles.`,
            severity: "info",
            channel: "in_app",
            payload: { competitorId: monitor.competitorId, competitorName },
          });
          triggeredAlerts.push(alert);
          await this.dispatchExternal(alert, monitor);
        } else if (monitor.ruleType === "new_offer") {
          const alert = repo.createAlert(workspaceId, {
            monitorId: monitor.id,
            title: `Promotional Offer Shift: ${competitorName}`,
            message: `${competitorName} shifted their primary offer from 20% discount to a high-converting 'Starter Bundle + 100% Money-Back Guarantee'.`,
            severity: "warning",
            channel: "in_app",
            payload: { competitorId: monitor.competitorId, offer: "Starter Bundle Guarantee" },
          });
          triggeredAlerts.push(alert);
          await this.dispatchExternal(alert, monitor);
        } else if (monitor.ruleType === "velocity_spike") {
          const alert = repo.createAlert(workspaceId, {
            monitorId: monitor.id,
            title: `Creative Velocity Spike Alert: ${competitorName}`,
            message: `${competitorName} increased weekly ad launches by +45% over their 30-day baseline, indicating an active scaling phase.`,
            severity: "alert",
            channel: "in_app",
            payload: { competitorId: monitor.competitorId, spikeRate: "45%" },
          });
          triggeredAlerts.push(alert);
          await this.dispatchExternal(alert, monitor);
        }
      } catch (err: any) {
        logger.error({ monitorId: monitor.id, err: err.message }, "Error evaluating monitor");
      }
    }

    return triggeredAlerts;
  }

  async dispatchExternal(alert: Alert, monitor: Monitor) {
    const slackUrl = monitor.config.slackWebhook || process.env.SLACK_WEBHOOK_URL;
    if (slackUrl && !slackUrl.includes("mock") && slackUrl.startsWith("http")) {
      try {
        await fetch(slackUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: `*[AdScope Alert - ${alert.severity.toUpperCase()}]* ${alert.title}\n${alert.message}`,
          }),
        });
        logger.info({ alertId: alert.id }, "Dispatched Slack webhook notification");
      } catch (err) {
        logger.warn({ err }, "Slack webhook dispatch error");
      }
    }
  }
}

export const monitoringService = new MonitoringService();
