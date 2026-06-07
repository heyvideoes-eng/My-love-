"use client";

import { useState, useEffect, useRef } from "react";
import { X, Lock, Check, Sparkles, Calendar, BookOpen, Camera, FileText, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { SpecialDate } from "./CountdownHighlight";
import type { DatePlan } from "@/lib/types";
import { CURATED_BOLLYWOOD_SONGS } from "./RomanticPlayer";

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  
  // States from Dashboard to edit
  dailyMessageText: string;
  setDailyMessageText: (text: string) => void;
  dates: SpecialDate[];
  setDates: (dates: SpecialDate[]) => void;
  plan: DatePlan;
  setPlan: (plan: DatePlan) => void;
}

export default function AdminPanel({
  isOpen,
  onClose,
  dailyMessageText,
  setDailyMessageText,
  dates,
  setDates,
  plan,
  setPlan
}: AdminPanelProps) {
  const [password, setPassword] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  // Active settings tab
  const [activeTab, setActiveTab] = useState<"daily" | "planner" | "dates">("daily");
  
  // Temporary edit states
  const [msgInput, setMsgInput] = useState(dailyMessageText);
  const [planInput, setPlanInput] = useState<DatePlan>({ ...plan });
  
  // Realtime Broadcast Channel ref
  const channelRef = useRef<any>(null);

  // Initialize Supabase Broadcast Channel
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    // Join a broadcast channel for Rishi & Vanshika's real-time sync
    const channel = supabase.channel("rv_realtime_sync");
    
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        channelRef.current = channel;
      }
    });

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  // Update inputs if props change
  useEffect(() => {
    setMsgInput(dailyMessageText);
  }, [dailyMessageText]);

  useEffect(() => {
    setPlanInput({ ...plan });
  }, [plan]);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === "love" || password.toLowerCase() === "vanshika") {
      setIsUnlocked(true);
      setErrorMsg("");
    } else {
      setErrorMsg("Incorrect Password. Try 'love' or 'vanshika'.");
    }
  };

  // ─── Realtime Broadcast Trigger Helper ────────────────────────────────────
  const broadcastChange = (event: string, payload: any) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event,
        payload
      });
    }
  };

  // ─── Form Submission Handlers ─────────────────────────────────────────────
  const handleSaveDailyMessage = (e: React.FormEvent) => {
    e.preventDefault();
    setDailyMessageText(msgInput);
    
    // Broadcast the real-time update
    broadcastChange("daily_message_update", { content: msgInput });
    
    // Attempt database update for daily message if Supabase is connected
    const supabase = createClient();
    if (supabase) {
      supabase
        .from("daily_messages")
        .insert({ content: msgInput, is_published: true })
        .then(({ error }) => {
          if (error) console.log("DB update skipped:", error.message);
        });
    }
    
    alert("Daily Message updated and broadcasted in real-time!");
  };

  const handleSavePlanner = (e: React.FormEvent) => {
    e.preventDefault();
    setPlan(planInput);
    localStorage.setItem("rv_plan", JSON.stringify(planInput));
    
    // Broadcast real-time update
    broadcastChange("planner_update", { plan: planInput });
    alert("Planner Ticket updated and broadcasted in real-time!");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Drawer Sheet */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="w-full max-w-md bg-[#12090b] border-l border-white/10 h-full relative z-10 flex flex-col shadow-2xl overflow-hidden"
          >
            
            {/* Drawer Header */}
            <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#180d10]">
              <h2 className="font-serif text-fluid-3xl text-[#fdfaf6] font-normal flex items-center gap-2">
                <Lock className="w-5 h-5 text-[#c97b84]" />
                <span>Control Center</span>
              </h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-white/5 text-[#8a7679] hover:text-[#fdfaf6] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Lock Screen Case */}
            {!isUnlocked ? (
              <div className="flex-grow flex flex-col justify-center px-8 text-center">
                <div className="w-12 h-12 rounded-full bg-[#c97b84]/10 border border-[#c97b84]/30 flex items-center justify-center text-[#c97b84] mx-auto mb-6">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-fluid-2xl text-[#fdfaf6] mb-2">Password Protected</h3>
                <p className="text-fluid-base text-[#8a7679] mb-8">
                  Enter password to unlock real-time dashboard controllers.
                </p>

                <form onSubmit={handleUnlock} className="flex flex-col gap-3 max-w-xs mx-auto w-full">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter admin password..."
                    className="premium-input text-center"
                    autoFocus
                  />
                  {errorMsg && (
                    <span className="text-fluid-xs font-bold text-[#c97b84]">{errorMsg}</span>
                  )}
                  <button type="submit" className="btn-rose-gold justify-center mt-2 cursor-pointer">
                    Unlock Dashboard
                  </button>
                </form>
              </div>
            ) : (
              // Main Admin Workspace
              <div className="flex-grow flex flex-col overflow-hidden">
                
                {/* Tabs selection */}
                <div className="flex border-b border-white/5 bg-[#160d10] p-1 gap-1">
                  {[
                    { id: "daily", label: "Today's Note", icon: FileText },
                    { id: "planner", label: "Date Planner", icon: Calendar },
                    { id: "dates", label: "Milestones", icon: Sparkles }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-fluid-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-[rgba(201,123,132,0.12)] text-[#e5b0b6]"
                          : "text-[#8a7679] hover:bg-white/5 hover:text-[#fdfaf6]"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      <span>{tab.label.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>

                {/* Workspace body */}
                <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
                  
                  {/* Tab 1: Daily Message */}
                  {activeTab === "daily" && (
                    <form onSubmit={handleSaveDailyMessage} className="flex flex-col gap-4">
                      <div>
                        <span className="text-fluid-2xs uppercase tracking-widest text-[#e8c59a] font-bold block mb-1">
                          Today's live message
                        </span>
                        <h4 className="font-serif text-fluid-2xl text-[#fdfaf6] mb-3">
                          Write Daily Note to Vanshika
                        </h4>
                        <textarea
                          value={msgInput}
                          onChange={(e) => setMsgInput(e.target.value)}
                          placeholder="Type today's message here..."
                          className="premium-input h-32 resize-none leading-relaxed"
                          required
                        />
                      </div>

                      <button type="submit" className="btn-rose-gold justify-center cursor-pointer">
                        <Send className="w-3.5 h-3.5" />
                        <span>Update and Broadcast Note</span>
                      </button>
                    </form>
                  )}

                  {/* Tab 2: Date Planner ticket config */}
                  {activeTab === "planner" && (
                    <form onSubmit={handleSavePlanner} className="flex flex-col gap-4">
                      <div>
                        <span className="text-fluid-2xs uppercase tracking-widest text-[#e8c59a] font-bold block mb-1">
                          Live Ticket configuration
                        </span>
                        <h4 className="font-serif text-fluid-2xl text-[#fdfaf6] mb-3">
                          Plan Today's Date
                        </h4>
                      </div>

                      {/* Time & Place */}
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="premium-label">Time</label>
                          <input
                            type="text"
                            value={planInput.plan_time || ""}
                            onChange={(e) => setPlanInput({ ...planInput, plan_time: e.target.value })}
                            className="premium-input"
                          />
                        </div>
                        <div>
                          <label className="premium-label">Place</label>
                          <input
                            type="text"
                            value={planInput.place || ""}
                            onChange={(e) => setPlanInput({ ...planInput, place: e.target.value })}
                            className="premium-input"
                          />
                        </div>
                      </div>

                      {/* Activity */}
                      <div>
                        <label className="premium-label">Activity</label>
                        <input
                          type="text"
                          value={planInput.activity || ""}
                          onChange={(e) => setPlanInput({ ...planInput, activity: e.target.value })}
                          className="premium-input"
                        />
                      </div>

                      {/* Title & Budget */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="premium-label">Title</label>
                          <input
                            type="text"
                            value={planInput.title || ""}
                            onChange={(e) => setPlanInput({ ...planInput, title: e.target.value })}
                            className="premium-input text-fluid-sm"
                          />
                        </div>
                        <div>
                          <label className="premium-label">Budget</label>
                          <input
                            type="text"
                            value={planInput.budget || ""}
                            onChange={(e) => setPlanInput({ ...planInput, budget: e.target.value })}
                            className="premium-input text-fluid-sm"
                          />
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <label className="premium-label">Notes</label>
                        <textarea
                          value={planInput.notes || ""}
                          onChange={(e) => setPlanInput({ ...planInput, notes: e.target.value })}
                          className="premium-input h-16 resize-none"
                        />
                      </div>

                      {/* Mood */}
                      <div>
                        <label className="premium-label">Date Mood</label>
                        <select
                          value={planInput.mood}
                          onChange={(e) => setPlanInput({ ...planInput, mood: e.target.value as any })}
                          className="premium-input"
                        >
                          <option value="cozy">Cozy ☕</option>
                          <option value="romantic">Romantic 🌹</option>
                          <option value="surprise">Surprise ✨</option>
                          <option value="elegant">Elegant 🥂</option>
                          <option value="casual">Casual 👟</option>
                          <option value="long-drive">Midnight Drive 🚗</option>
                          <option value="movie">Cinema 🍿</option>
                          <option value="cafe">Café Hop 🥞</option>
                        </select>
                      </div>

                      <button type="submit" className="btn-rose-gold justify-center mt-2 cursor-pointer">
                        <span>Save & Broadcast Ticket</span>
                      </button>
                    </form>
                  )}

                  {/* Tab 3: Timeline & Milestones shortcut info */}
                  {activeTab === "dates" && (
                    <div className="flex flex-col gap-4 text-center py-6 px-4">
                      <div className="w-12 h-12 rounded-full bg-[#e8c59a]/10 border border-[#e8c59a]/30 flex items-center justify-center text-[#e8c59a] mx-auto mb-4">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <h4 className="font-serif text-fluid-2xl text-[#fdfaf6] mb-1">
                        Timeline & Dates Management
                      </h4>
                      <p className="text-fluid-base text-[#8a7679] leading-relaxed">
                        To add, edit, or delete date milestones and timeline events, you can use the **inline controls** directly on the respective cards on the dashboard page.
                      </p>
                      <p className="text-fluid-xs text-[#c97b84] font-bold">
                        Changes are saved and broadcasted globally instantly on submission!
                      </p>
                    </div>
                  )}

                </div>
              </div>
            )}

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
export { CURATED_BOLLYWOOD_SONGS };
