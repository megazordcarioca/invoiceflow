import { getMobileUser } from "@/lib/supabase/mobile";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/push-tokens/[token] — unregister a specific push token
export async function DELETE(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  const { client, user } = await getMobileUser(request);
  if (!user || !client) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await client
    .from("push_tokens")
    .delete()
    .eq("user_id", user.id)
    .eq("token", decodeURIComponent(params.token));

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
