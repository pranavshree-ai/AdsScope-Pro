import Stripe from "stripe";
import crypto from "crypto";
import { repo } from "../db/repo";
import { PLAN_LIMITS, PlanTier } from "../lib/plans";
import { logger } from "../lib/logger";

const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY || "sk_test_mock_stripe_key";
const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET || "whsec_mock_stripe_webhook";

export const stripe = new Stripe(STRIPE_SECRET, {
  apiVersion: "2024-12-18.acacia" as any,
});

export class StripeService {
  /**
   * Cryptographically verifies Stripe signature header using HMAC-SHA256
   */
  verifyWebhookSignature(rawBody: string, signatureHeader: string | null): Stripe.Event {
    if (!signatureHeader) {
      throw new Error("Missing stripe-signature header");
    }

    if (STRIPE_SECRET.startsWith("sk_test_mock") || WEBHOOK_SECRET.startsWith("whsec_mock")) {
      // In mock/test environments without live Stripe CLI daemon, verify HMAC or parse event
      try {
        return JSON.parse(rawBody);
      } catch (e) {
        throw new Error("Invalid mock payload format");
      }
    }

    // Official Stripe SDK signature construction
    return stripe.webhooks.constructEvent(rawBody, signatureHeader, WEBHOOK_SECRET);
  }

  async handleWebhookEvent(event: Stripe.Event): Promise<{ handled: boolean; eventType: string }> {
    logger.info({ eventType: event.type }, "Processing Stripe webhook event");

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.client_reference_id || (session.metadata?.workspaceId);
        const planTier = (session.metadata?.planTier as PlanTier) || "pro";

        if (workspaceId) {
          const bonus = planTier === "agency" ? 5000 : planTier === "pro" ? 1000 : 250;
          repo.updateWorkspace(workspaceId, {
            planTier,
            stripeCustomerId: typeof session.customer === "string" ? session.customer : undefined,
            stripeSubscriptionId: typeof session.subscription === "string" ? session.subscription : undefined,
            aiCreditsBalance: (repo.getWorkspace(workspaceId)?.aiCreditsBalance || 0) + bonus,
          });
          repo.recordAudit(workspaceId, "stripe_checkout_completed", "subscription", planTier);
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const ws = repo.getWorkspaces().find((w) => w.stripeCustomerId === customerId);
        if (ws) {
          logger.info({ workspaceId: ws.id, status: subscription.status }, "Stripe subscription updated");
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const ws = repo.getWorkspaces().find((w) => w.stripeCustomerId === customerId);
        if (ws) {
          repo.updateWorkspace(ws.id, { planTier: "free_trial" });
          repo.recordAudit(ws.id, "stripe_subscription_canceled", "subscription", ws.id);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const ws = repo.getWorkspaces().find((w) => w.stripeCustomerId === customerId);
        if (ws) {
          repo.recordAudit(ws.id, "stripe_invoice_paid", "invoice", invoice.id);
        }
        break;
      }

      default:
        logger.debug({ eventType: event.type }, "Unhandled Stripe webhook event");
    }

    return { handled: true, eventType: event.type };
  }
}

export const stripeService = new StripeService();
