import { createClient } from "@/lib/supabase/server";
import {
  createCustomer,
  findCustomerByEmail,
  createSubscription,
  isApiKeyMissing,
  getSandboxUrl,
} from "@/lib/asaas";
import { NextResponse } from "next/server";

const PLAN_PRICES: Record<string, { value: number; description: string }> = {
  pro: { value: 49, description: "InvoiceFlow Pro - Mensal" },
  business: { value: 99, description: "InvoiceFlow Business - Mensal" },
};

export async function POST(request: Request) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (isApiKeyMissing()) {
    return NextResponse.json(
      {
        error: "Asaas not configured. Set ASAAS_API_KEY in environment.",
        sandboxUrl: getSandboxUrl(),
      },
      { status: 503 }
    );
  }

  const { plan, billingType = "PIX" } = await request.json();

  if (!PLAN_PRICES[plan]) {
    return NextResponse.json({ error: "Invalid plan. Must be 'pro' or 'business'." }, { status: 400 });
  }

  if (!["CREDIT_CARD", "BOLETO", "PIX"].includes(billingType)) {
    return NextResponse.json({ error: "Invalid billing type" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  let customerId: string;
  const existing = await findCustomerByEmail(user.email!);

  if (existing) {
    customerId = existing.id;
  } else {
    const customer = await createCustomer(
      profile?.name || user.email?.split("@")[0] || "User",
      user.email!
    );
    customerId = customer.id;
  }

  const nextDueDate = new Date();
  nextDueDate.setDate(nextDueDate.getDate() + 1);
  const dueDateStr = nextDueDate.toISOString().split("T")[0];

  const priceInfo = PLAN_PRICES[plan];
  const subscription = await createSubscription({
    customerId,
    value: priceInfo.value,
    nextDueDate: dueDateStr,
    cycle: "MONTHLY",
    billingType: billingType as "CREDIT_CARD" | "BOLETO" | "PIX",
    description: priceInfo.description,
  });

  const { error: upsertError } = await supabase.from("subscriptions").upsert(
    {
      user_id: user.id,
      asaas_customer_id: customerId,
      asaas_subscription_id: subscription.id,
      plan,
      status: "active",
      current_period_start: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (upsertError) {
    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({
    subscriptionId: subscription.id,
    plan,
    sandboxUrl: getSandboxUrl(),
    message: "Assinatura criada no Asaas. Complete o pagamento no painel do Asaas.",
  });
}

export const dynamic = "force-dynamic";
