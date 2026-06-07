import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { LoveNote } from "@/lib/types";
import NotesClient from "./NotesClient";

export default async function AdminNotesPage() {
  const supabase = await createServerSupabaseClient();
  let notes: LoveNote[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("love_notes")
      .select("*")
      .order("created_at", { ascending: false });
    notes = (data ?? []) as LoveNote[];
  }

  return <NotesClient notes={notes} />;
}
