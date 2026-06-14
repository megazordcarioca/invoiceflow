import { getMobileUser } from "@/lib/supabase/mobile";
import { NextRequest, NextResponse } from "next/server";

// GET /api/push-tokens — list tokens for the authenticated user
export async function GET(request: NextRequest) {
  const { client, user } = await getMobileUser(request);
  if (!user || !client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await client
    .from("push_tokens")
    .select("id, token, platform, created_at")
    .eq("user_id", user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// POST /api/push-tokens — register an Expo push token
// Body: { token: string, platform: "ios" | "android" | "web" }
export async function POST(request: NextRequest) {
  const { client, user } = await getMobileUser(request);
  if (!user || !client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { token, platform } = body as { token: string; platform: string };

  if (!token || !platform) {
    return NextResponse.json({ error: "token and platform are required" }, { status: 400 });
  }
  if (!["ios", "android", "web"].includes(platform)) {
    return NextResponse.json({ error: "platform must be ios, android, or web" }, { status: 400 });
  }

  const { data, error } = await client
    .from("push_tokens")
    .upsert({ user_id: user.id, token, platform }, { onConflict: "user_id,token" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
