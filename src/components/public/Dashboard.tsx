"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navigation from "../Navigation";
import CountdownHighlight, { SpecialDate } from "./CountdownHighlight";
import DateReminders from "./DateReminders";
import LoveJar from "./LoveJar";
import MemoryTimeline from "./MemoryTimeline";
import PhotoGallery from "./PhotoGallery";

import LoveLetters from "./LoveLetters";
import ReasonsSheMatters from "./ReasonsSheMatters";
import DailyNoteSection from "./DailyNoteSection";
import MoodCheckSection from "./MoodCheckSection";
import RomanticPlayer from "./RomanticPlayer";
import AICopilot from "./AICopilot";
import CountdownBanner from "./CountdownBanner";
import DatePlanCard from "./DatePlanCard";
import LoveNotesSection from "./LoveNotesSection";
import { GalleryItem } from "./PhotoGallery";
import { createClient } from "@/lib/supabase/client";
import type { DailyMessage, MoodKey, DatePlan, LoveNote, SiteSettings } from "@/lib/types";

interface DashboardProps {
  initialDailyMessage: DailyMessage;
  moodMessages: Record<MoodKey, string>;
  onResetIntro: () => void;
  activeDatePlan: DatePlan | null;
  loveNotes: LoveNote[];
  siteSettings: SiteSettings | null;
}

const DEFAULT_DATES: SpecialDate[] = [
  {
    id: "1",
    title: "Vanshika's Birthday",
    date: "2026-07-12",
    tag: "birthday",
    note: "Celebrating the most beautiful soul in the universe."
  },
  {
    id: "2",
    title: "Our Anniversary",
    date: "2026-09-24",
    tag: "anniversary",
    note: "The day we chose each other. The start of something beautiful."
  },
  {
    id: "3",
    title: "The Day We Met",
    date: "2026-03-14",
    tag: "meeting",
    note: "A simple hello that changed my entire universe forever."
  },
  {
    id: "4",
    title: "Our Next Adventure",
    // 10 days from simulated time (2026-06-05) is 2026-06-15
    date: "2026-06-15",
    tag: "date",
    note: "Counting down the seconds until I see your smile again."
  },
  {
    id: "5",
    title: "Sweetest Kiss Memory",
    date: "2026-10-18",
    tag: "moment",
    note: "A memory forever etched in my mind."
  }
];

// Legacy plan type used internally for the AI copilot drawer
type LegacyDatePlan = {
  time?: string; place?: string; activity?: string;
  dress?: string; budget?: string; notes?: string; mood?: string;
};
const DEFAULT_PLAN: LegacyDatePlan = {};

export default function Dashboard({ initialDailyMessage, moodMessages, onResetIntro, activeDatePlan, loveNotes, siteSettings }: DashboardProps) {
  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [plan, setPlan] = useState<LegacyDatePlan>(DEFAULT_PLAN);
  const [dailyMessage, setDailyMessage] = useState<DailyMessage>(initialDailyMessage);
  const [loaded, setLoaded] = useState(false);

  // Sync dates and planner with Supabase database and local storage fallback
  useEffect(() => {
    const loadInitialData = async () => {
      const supabase = createClient();
      if (!supabase) {
        setLoaded(true);
        return;
      }

      try {
        // 1. Fetch Dates Milestones
        const { data: dbDates, error: datesError } = await supabase
          .from("dates_milestones")
          .select("*")
          .order("created_at", { ascending: true });
        
        if (dbDates && dbDates.length > 0) {
          setDates(dbDates as SpecialDate[]);
          localStorage.setItem("rv_dates", JSON.stringify(dbDates));
        } else {
          // Fallback to local storage or defaults
          const savedDates = localStorage.getItem("rv_dates");
          if (savedDates) {
            try {
              const parsed = JSON.parse(savedDates);
              setDates(parsed);
              await supabase.from("dates_milestones").upsert(parsed);
            } catch (e) {
              setDates(DEFAULT_DATES);
              await supabase.from("dates_milestones").upsert(DEFAULT_DATES);
            }
          } else {
            setDates(DEFAULT_DATES);
            await supabase.from("dates_milestones").upsert(DEFAULT_DATES);
            localStorage.setItem("rv_dates", JSON.stringify(DEFAULT_DATES));
          }
        }

        // 2. Fetch Date Planner Info
        const { data: dbPlan } = await supabase
          .from("date_planners")
          .select("plan_data")
          .eq("id", 1)
          .maybeSingle();

        if (dbPlan && dbPlan.plan_data) {
          setPlan(dbPlan.plan_data as LegacyDatePlan);
          localStorage.setItem("rv_plan", JSON.stringify(dbPlan.plan_data));
        } else {
          const savedPlan = localStorage.getItem("rv_plan");
          if (savedPlan) {
            try {
              const parsed = JSON.parse(savedPlan);
              setPlan(parsed);
              await supabase.from("date_planners").upsert({ id: 1, plan_data: parsed });
            } catch (e) {
              setPlan(DEFAULT_PLAN);
              await supabase.from("date_planners").upsert({ id: 1, plan_data: DEFAULT_PLAN });
            }
          } else {
            setPlan(DEFAULT_PLAN);
            await supabase.from("date_planners").upsert({ id: 1, plan_data: DEFAULT_PLAN });
            localStorage.setItem("rv_plan", JSON.stringify(DEFAULT_PLAN));
          }
        }
      } catch (err) {
        console.error("Supabase load skipped/failed:", err);
      } finally {
        setLoaded(true);
      }
    };

    loadInitialData();
  }, []);

  // Listen to realtime broadcasts
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase.channel("rv_realtime_sync");
    
    channel
      .on("broadcast", { event: "daily_message_update" }, (payload) => {
        setDailyMessage(prev => ({
          ...prev,
          content: payload.payload.content,
          id: prev.id + "_updated_" + Date.now()
        }));
      })
      .on("broadcast", { event: "planner_update" }, (payload) => {
        setPlan(payload.payload.plan);
        localStorage.setItem("rv_plan", JSON.stringify(payload.payload.plan));
      })
      .on("broadcast", { event: "dates_update" }, (payload) => {
        setDates(payload.payload.dates);
        localStorage.setItem("rv_dates", JSON.stringify(payload.payload.dates));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleSetDates = async (newDates: SpecialDate[]) => {
    setDates(newDates);
    localStorage.setItem("rv_dates", JSON.stringify(newDates));

    const supabase = createClient();
    if (supabase) {
      // Clean and overwrite with updated milestones array
      await supabase.from("dates_milestones").delete().neq("id", "0");
      if (newDates.length > 0) {
        await supabase.from("dates_milestones").upsert(
          newDates.map(d => ({
            id: d.id,
            title: d.title,
            date: d.date,
            tag: d.tag,
            note: d.note
          }))
        );
      }
      // Broadcast update to anyone else on the page in real-time
      const channel = supabase.channel("rv_realtime_sync");
      channel.send({
        type: "broadcast",
        event: "dates_update",
        payload: { dates: newDates }
      });
    }
  };

  const handleUpdateDailyMessage = async (newText: string) => {
    setDailyMessage(prev => ({
      ...prev,
      content: newText,
      id: prev.id + "_updated_" + Date.now()
    }));

    const supabase = createClient();
    if (supabase) {
      await supabase
        .from("daily_messages")
        .insert({ content: newText, is_published: true });

      // Broadcast update to anyone else on the page in real-time
      const channel = supabase.channel("rv_realtime_sync");
      channel.send({
        type: "broadcast",
        event: "daily_message_update",
        payload: { content: newText }
      });
    }
  };

  const handleAddMilestoneDate = async (newDate: SpecialDate) => {
    const updatedDates = [...dates, newDate];
    await handleSetDates(updatedDates);
  };

  const handleAddScrapbookPhoto = async (newPhoto: GalleryItem) => {
    const supabase = createClient();
    if (supabase) {
      await supabase.from("gallery_photos").upsert({
        id: newPhoto.id,
        title: newPhoto.title,
        date: newPhoto.date,
        location: newPhoto.location,
        description: newPhoto.description,
        rotation: newPhoto.rotation,
        color_grad: newPhoto.color_grad,
        image_url: newPhoto.image_url || null
      });
    }
  };

  if (!loaded) {
    return (
      <div className="min-h-screen bg-[#080405] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-[#c97b84] border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          <span className="text-fluid-xs uppercase font-bold tracking-widest text-[#8a7679]">
            Assembling Dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080405] pb-24 relative overflow-x-hidden pt-24">
      {/* Background visual layers */}
      <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
        <div className="ambient-glow-orb glow-wine w-[500px] h-[500px] top-10 left-[-100px]" />
        <div className="ambient-glow-orb glow-rose w-[400px] h-[400px] bottom-20 right-[-100px]" />
        <div className="ambient-glow-orb glow-gold w-[300px] h-[300px] top-[40%] left-[50%] -translate-x-1/2 opacity-15" />
      </div>

      {/* Floating navigation dock */}
      <Navigation
        theme="blush"
        setTheme={() => {}}
        visitStreak={7}
        onResetIntro={onResetIntro}
      />

      {/* ── Countdown Banner (from admin settings) ───────────────── */}
      {siteSettings?.sections_visible?.countdown !== false && siteSettings?.countdown_date && (
        <CountdownBanner
          targetDate={siteSettings.countdown_date}
          label={siteSettings.countdown_label ?? "Days until our next chapter"}
        />
      )}

      <main id="dashboard" className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center pt-8 mb-12"
        >
          <span className="text-fluid-base font-bold uppercase tracking-[0.25em] text-[#e8c59a] block mb-2">
            Sanctuary Entrance
          </span>
          <h1 className="font-serif text-fluid-5xl md:text-6xl text-[#fdfaf6] font-normal leading-tight">
            {siteSettings?.welcome_text ?? "Our Shared Universe"}
          </h1>
          <div className="w-12 h-[1.5px] bg-[#c97b84] mx-auto mt-4" />
        </motion.div>

        {/* Today's Message (SSR/Supabase component restyled) */}
        {siteSettings?.sections_visible?.dailyNote !== false && (
          <DailyNoteSection key={dailyMessage.id} initial={dailyMessage} />
        )}

        {/* Live Countdown Clock Widget */}
        <CountdownHighlight dates={dates} />

        {/* Mood Check-In Widget (Supabase connection restyled) */}
        {siteSettings?.sections_visible?.mood !== false && (
          <MoodCheckSection moodMessages={moodMessages} />
        )}

        {/* Custom YouTube Romantic Music Player */}
        {siteSettings?.sections_visible?.music !== false && <RomanticPlayer />}

        {/* ── Published Date Plan Invitation ─────────────────────── */}
        {siteSettings?.sections_visible?.dateplan !== false && activeDatePlan && (
          <section style={{ padding: "4rem 0" }}>
            <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
              <span style={{ fontFamily: "var(--font-sans)", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em", color: "var(--rose-gold-dim)", display: "block", marginBottom: "0.6rem" }}>Our Next Date</span>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400, color: "var(--moonlight)" }}>An Invitation for You</h2>
            </div>
            <DatePlanCard plan={activeDatePlan} />
          </section>
        )}

        {/* Date Reminders Widget (CRUD dates timeline) */}
        <DateReminders dates={dates} setDates={handleSetDates} />

        {/* Dynamic Sweet Capsule Love Jar */}
        {siteSettings?.sections_visible?.vouchers !== false && <LoveJar />}

        {/* ── Published Love Notes ──────────────────────────────── */}
        {siteSettings?.sections_visible?.lovenotes !== false && loveNotes.length > 0 && (
          <LoveNotesSection notes={loveNotes} />
        )}

        {/* Alternating Memory Timeline */}
        {siteSettings?.sections_visible?.memories !== false && <MemoryTimeline />}

        {/* Polaroid Scrapbook Gallery */}
        {siteSettings?.sections_visible?.gallery !== false && <PhotoGallery />}



        {/* Wax Sealed Envelope Reveals */}
        <LoveLetters />

        {/* Reasons She Matters storytelling list */}
        <ReasonsSheMatters />

      </main>

      {/* Realtime AI Copilot Drawer */}
      <AICopilot
        onUpdateDailyNote={handleUpdateDailyMessage}
        onUpdateDatePlanner={(newPlan: LegacyDatePlan) => setPlan(newPlan)}
        onAddMilestoneDate={handleAddMilestoneDate}
        onAddScrapbookPhoto={handleAddScrapbookPhoto}
        currentPlan={plan}
      />

      {/* Dashboard Footer */}
      <footer className="w-full text-center py-12 border-t border-white/5 relative z-10 mt-16">
        <p className="text-fluid-xs uppercase tracking-[0.25em] text-[#8a7679]">
          Made with love · Rishi & Vanshika · 2026
        </p>
      </footer>
    </div>
  );
}
