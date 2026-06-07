import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { MusicTrack } from "@/lib/types";
import MusicClient from "./MusicClient";

export default async function AdminMusicPage() {
  const supabase = await createServerSupabaseClient();
  let tracks: MusicTrack[] = [];
  if (supabase) {
    const { data } = await supabase.from("music_tracks").select("*").order("display_order", { ascending: true });
    tracks = (data ?? []) as MusicTrack[];
  }
  return <MusicClient tracks={tracks} />;
}
