import { NextRequest, NextResponse } from "next/server";
import { stripeService } from "@/services/stripe-service";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("stripe-signature");

    const event = stripeService.verifyWebhookSignature(rawBody, signature);
    const result = await stripeService.handleWebhookEvent(event);

    return NextResponse.json({ received: true, ...result });
  } catch (err: any) {
    logger.error({ err: err.message }, "Stripe webhook signature verification failed");
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 });
  }
}
