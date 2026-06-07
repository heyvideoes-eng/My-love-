import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { DatePlan } from "@/lib/types";
import PlannerClient from "./PlannerClient";

export default async function AdminPlannerPage() {
  const supabase = await createServerSupabaseClient();
  let plans: DatePlan[] = [];
  if (supabase) {
    const { data } = await supabase.from("date_plans").select("*").order("created_at", { ascending: false });
    plans = (data ?? []) as DatePlan[];
  }
  return <PlannerClient plans={plans} />;
}
