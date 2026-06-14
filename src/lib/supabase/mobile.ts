import { createClient as createSupabaseClient, SupabaseClient, User } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

// For mobile clients (Expo/React Native), auth arrives as a Bearer token
// in the Authorization header instead of a cookie session.
export function createMobileClient(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  const client = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );

  return client;
}

export async function getMobileUser(request: NextRequest) {
  const client = createMobileClient(request);
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return { client: null, user: null };
  return { client, user };
}

// Dual-auth: Bearer token (mobile) takes precedence, falls back to cookie session (web).
// Returns the authenticated supabase client and user for use in route handlers.
export async function resolveAuth(
  request: NextRequest
): Promise<{ supabase: SupabaseClient; user: User } | { supabase: null; user: null }> {
  const authHeader = request.headers.get("authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const { client, user } = await getMobileUser(request);
    if (client && user) return { supabase: client, user };
    return { supabase: null, user: null };
  }

  // Cookie-based (web SSR)
  const supabase = createServerClient() as unknown as SupabaseClient;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase: null, user: null };
  return { supabase, user };
}
