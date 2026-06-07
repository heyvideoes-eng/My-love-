import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Reminder } from "@/lib/types";
import RemindersClient from "./RemindersClient";

export default async function AdminRemindersPage() {
  const supabase = await createServerSupabaseClient();
  let reminders: Reminder[] = [];
  if (supabase) {
    const { data } = await supabase.from("reminders").select("*").order("event_date", { ascending: true });
    reminders = (data ?? []) as Reminder[];
  }
  return <RemindersClient reminders={reminders} />;
}
