import { createClient } from "@/lib/supabase/server";
import { getMobileUser } from "@/lib/supabase/mobile";
import { NextRequest, NextResponse } from "next/server";

// GET /api/invoices/updates?since=<ISO8601>
// Polling endpoint for mobile real-time: returns invoices updated after the given timestamp.
// Works with both cookie-based (web) and Bearer token (mobile) sessions.
// Clients should poll every 30-60s, storing the last `polled_at` from the response.
export async function GET(request: NextRequest) {
  let user: { id: string } | null = null;
  let client;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const mobileResult = await getMobileUser(request);
    user = mobileResult.user;
    client = mobileResult.client;
  } else {
    client = createClient();
    const { data } = await client.auth.getUser();
    user = data.user;
  }

  if (!user || !client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const since = searchParams.get("since");

  if (!since) {
    return NextResponse.json(
      { error: "since query param is required (ISO 8601 timestamp)" },
      { status: 400 }
    );
  }

  const sinceDate = new Date(since);
  if (isNaN(sinceDate.getTime())) {
    return NextResponse.json({ error: "since must be a valid ISO 8601 timestamp" }, { status: 400 });
  }

  const { data: invoices, error } = await client
    .from("invoices")
    .select("*, invoice_line_items(*)")
    .eq("user_id", user.id)
    .gt("updated_at", sinceDate.toISOString())
    .order("updated_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    updates: invoices,
    polled_at: new Date().toISOString(),
    count: invoices?.length ?? 0,
  });
}
