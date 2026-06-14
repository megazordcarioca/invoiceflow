import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { AsaasWebhookEvent } from "@/lib/asaas";

export async function POST(request: Request) {
  const body = (await request.json()) as AsaasWebhookEvent;
  const event = body.event;

  const supabase = createClient();

  try {
    const subscriptionId = body.subscription?.id || body.payment?.subscription;

    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscription ID" }, { status: 400 });
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id, user_id, plan, status")
      .eq("asaas_subscription_id", subscriptionId)
      .single();

    if (!sub) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    switch (event) {
      case "PAYMENT_RECEIVED":
      case "PAYMENT_CONFIRMED":
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            current_period_start: new Date().toISOString(),
          })
          .eq("id", sub.id);
        break;

      case "PAYMENT_OVERDUE":
        await supabase.from("subscriptions").update({ status: "past_due" }).eq("id", sub.id);
        break;

      case "PAYMENT_REFUNDED":
      case "PAYMENT_CANCELED":
      case "SUBSCRIPTION_CANCELED":
        await supabase
          .from("subscriptions")
          .update({ status: "canceled", plan: "free" })
          .eq("id", sub.id);
        break;

      default:
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
