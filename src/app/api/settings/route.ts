import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { data, error } = await supabase.from("site_settings").select("*").limit(1).maybeSingle();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(request: Request) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const updates = await request.json();

  // Upsert — find the single row first
  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();

  if (existing?.id) {
    const { data, error } = await supabase.from("site_settings").update(updates).eq("id", existing.id).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: data });
  } else {
    const { data, error } = await supabase.from("site_settings").insert(updates).select().single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ settings: data });
  }
}
