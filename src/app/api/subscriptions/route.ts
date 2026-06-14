import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getUserPlan } from "@/lib/plans";

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const planInfo = await getUserPlan(user.id);

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return NextResponse.json({
    plan: planInfo.plan,
    label: planInfo.label,
    invoicesPerMonth: planInfo.invoicesPerMonth,
    subscription: sub || null,
  });
}

export async function DELETE() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ status: "canceled", plan: "free" })
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, plan: "free" });
}

export const dynamic = "force-dynamic";
