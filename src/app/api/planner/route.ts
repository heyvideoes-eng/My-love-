import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { data, error } = await supabase.from("date_plans").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans: data });
}

export async function POST(request: Request) {
  const supabase = await createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const body = await request.json();
  const { data, error } = await supabase.from("date_plans").insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: data });
}

export async function PATCH(request: Request) {
  const supabase = await createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { id, ...updates } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const { data, error } = await supabase.from("date_plans").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: data });
}

export async function DELETE(request: Request) {
  const supabase = await createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const { id } = await request.json();
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });
  const { error } = await supabase.from("date_plans").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
