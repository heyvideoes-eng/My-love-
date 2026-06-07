import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  FALLBACK_DAILY_MESSAGE,
  FALLBACK_MOOD_MESSAGES,
  type DailyMessage,
  type MoodKey,
  type DatePlan,
  type LoveNote,
  type SiteSettings,
} from "@/lib/types";
import MainClientPage from "@/components/public/MainClientPage";

export default async function Home() {
  const supabase = await createServerSupabaseClient();

  // ── Daily message ─────────────────────────────────────────────────
  let dailyMessage: DailyMessage = FALLBACK_DAILY_MESSAGE;
  // ── Mood messages ─────────────────────────────────────────────────
  let moodMessages = { ...FALLBACK_MOOD_MESSAGES };
  // ── Date plan ─────────────────────────────────────────────────────
  let activeDatePlan: DatePlan | null = null;
  // ── Love notes ────────────────────────────────────────────────────
  let loveNotes: LoveNote[] = [];
  // ── Site settings ─────────────────────────────────────────────────
  let siteSettings: SiteSettings | null = null;

  if (supabase) {
    const [msgRes, moodRes, planRes, notesRes, settingsRes] = await Promise.all([
      supabase
        .from("daily_messages")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("mood_messages")
        .select("mood, content")
        .eq("is_published", true),
      supabase
        .from("date_plans")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("love_notes")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle(),
    ]);

    if (msgRes.data)     dailyMessage  = msgRes.data as DailyMessage;
    if (planRes.data)    activeDatePlan = planRes.data as DatePlan;
    if (notesRes.data)   loveNotes = notesRes.data as LoveNote[];
    if (settingsRes.data) siteSettings = settingsRes.data as SiteSettings;

    if (moodRes.data) {
      moodRes.data.forEach((row) => {
        moodMessages[row.mood as MoodKey] = row.content;
      });
    }
  }

  return (
    <MainClientPage
      initialDailyMessage={dailyMessage}
      moodMessages={moodMessages}
      activeDatePlan={activeDatePlan}
      loveNotes={loveNotes}
      siteSettings={siteSettings}
    />
  );
}
