import { createBrowserClient } from "@supabase/ssr";

// ─── Browser-side Supabase client ────────────────────────────────────────────
// Safe to use in Client Components — only uses NEXT_PUBLIC_ env vars.

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    // Return null when Supabase isn't configured — callers handle gracefully
    return null;
  }

  return createBrowserClient(url, key);
}

export const isSupabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
