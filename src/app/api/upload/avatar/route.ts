import { getMobileUser } from "@/lib/supabase/mobile";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const BUCKET = "avatars";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// POST /api/upload/avatar
// Accepts multipart/form-data with a "file" field.
// Works with both cookie-based (web) and Bearer token (mobile) sessions.
export async function POST(request: NextRequest) {
  // Try mobile auth first (Bearer token), fall back to cookie auth
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

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "file is required" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 413 });
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Unsupported file type. Use jpeg, png, webp, or gif." }, { status: 415 });
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const path = `${user.id}/avatar.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(path);
  const avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;

  const { error: profileError } = await client
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  return NextResponse.json({ avatar_url: avatarUrl }, { status: 201 });
}
