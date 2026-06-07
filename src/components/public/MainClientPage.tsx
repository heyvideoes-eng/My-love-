"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import IntroScreen from "./IntroScreen";
import Dashboard from "./Dashboard";
import type { DailyMessage, MoodKey, DatePlan, LoveNote, SiteSettings } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

interface MainClientPageProps {
  initialDailyMessage: DailyMessage;
  moodMessages: Record<MoodKey, string>;
  activeDatePlan: DatePlan | null;
  loveNotes: LoveNote[];
  siteSettings: SiteSettings | null;
}

export default function MainClientPage({
  initialDailyMessage,
  moodMessages: initialMoodMessages,
  activeDatePlan: initialActiveDatePlan,
  loveNotes: initialLoveNotes,
  siteSettings: initialSiteSettings,
}: MainClientPageProps) {
  const [isEntered, setIsEntered] = useState(false);
  const [loading, setLoading] = useState(true);

  const [dailyMessage, setDailyMessage] = useState(initialDailyMessage);
  const [moodMessages, setMoodMessages] = useState(initialMoodMessages);
  const [activeDatePlan, setActiveDatePlan] = useState(initialActiveDatePlan);
  const [loveNotes, setLoveNotes] = useState(initialLoveNotes);
  const [siteSettings, setSiteSettings] = useState(initialSiteSettings);

  // Check if they already entered in this browser session
  useEffect(() => {
    const entered = sessionStorage.getItem("rv_entered");
    if (entered === "true") {
      setIsEntered(true);
    }
    setLoading(false);
  }, []);

  // Supabase Realtime Subscription for top-level props
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase.channel('main_client_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, async () => {
        const { data } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
        if (data) setSiteSettings(data as SiteSettings);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_messages' }, async () => {
        const { data } = await supabase.from('daily_messages').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
        if (data) setDailyMessage(data as DailyMessage);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mood_messages' }, async () => {
        const { data } = await supabase.from('mood_messages').select('mood, content').eq('is_published', true);
        if (data) {
          const newMoods = { ...initialMoodMessages };
          data.forEach((row) => { newMoods[row.mood as MoodKey] = row.content; });
          setMoodMessages(newMoods);
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'date_plans' }, async () => {
        const { data } = await supabase.from('date_plans').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
        setActiveDatePlan(data ? (data as DatePlan) : null);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'love_notes' }, async () => {
        const { data } = await supabase.from('love_notes').select('*').eq('is_published', true).order('created_at', { ascending: false }).limit(12);
        if (data) setLoveNotes(data as LoveNote[]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [initialMoodMessages]);

  const handleEnter = () => {
    setIsEntered(true);
    sessionStorage.setItem("rv_entered", "true");
  };

  const handleResetIntro = () => {
    setIsEntered(false);
    sessionStorage.removeItem("rv_entered");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#faf5f5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-[#c97b84] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <span className="text-fluid-xs uppercase font-bold tracking-widest text-[#8a7679]">
            Loading…
          </span>
        </div>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!isEntered ? (
        <IntroScreen key="intro" onEnter={handleEnter} />
      ) : (
        <Dashboard
          key="dashboard"
          initialDailyMessage={dailyMessage}
          moodMessages={moodMessages}
          onResetIntro={handleResetIntro}
          activeDatePlan={activeDatePlan}
          loveNotes={loveNotes}
          siteSettings={siteSettings}
        />
      )}
    </AnimatePresence>
  );
}
