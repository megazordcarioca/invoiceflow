import { getMobileUser } from "@/lib/supabase/mobile";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

const BUCKET = "logos";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// POST /api/upload/logo
// Accepts multipart/form-data with a "file" field.
export async function POST(request: NextRequest) {
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
    return NextResponse.json({ error: "Unsupported file type. Use jpeg, png, or webp." }, { status: 415 });
  }

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const filename = `logo-${Date.now()}.${ext}`;
  const path = `${user.id}/${filename}`;

  const arrayBuffer = await file.arrayBuffer();
  const { error: uploadError } = await client.storage
    .from(BUCKET)
    .upload(path, arrayBuffer, { contentType: file.type, upsert: true });

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

  const { data: urlData } = client.storage.from(BUCKET).getPublicUrl(path);
  const logoUrl = urlData.publicUrl;

  const { error: profileError } = await client
    .from("profiles")
    .update({ logo_url: logoUrl })
    .eq("id", user.id);

  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 });

  return NextResponse.json({ logo_url: logoUrl }, { status: 201 });
}

// DELETE /api/upload/logo
export async function DELETE(request: NextRequest) {
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

  // 1. Get current logo_url to find the path
  const { data: profile } = await client
    .from("profiles")
    .select("logo_url")
    .eq("id", user.id)
    .single();

  if (profile?.logo_url) {
    // Extract path from public URL
    // Public URL format: .../storage/v1/object/public/logos/user_id/filename
    const urlParts = profile.logo_url.split("/");
    const filename = urlParts[urlParts.length - 1];
    const path = `${user.id}/${filename}`;

    await client.storage.from(BUCKET).remove([path]);
  }

  // 2. Clear logo_url in profile
  const { error: updateError } = await client
    .from("profiles")
    .update({ logo_url: null })
    .eq("id", user.id);

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });

  return NextResponse.json({ message: "Logo deleted successfully" });
}
