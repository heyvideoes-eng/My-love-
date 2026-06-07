"use client";

import { useState, useEffect } from "react";
import { Sparkles, Cloud, Battery, ShieldAlert, HeartHandshake, Sunset } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOODS = [
  { id: "soft", label: "Soft", icon: Sparkles, color: "text-rose-400 bg-rose-500/5 border-rose-500/20" },
  { id: "tiring", label: "Tiring", icon: Battery, color: "text-amber-500 bg-amber-500/5 border-amber-500/20" },
  { id: "chaotic", label: "Chaotic", icon: ShieldAlert, color: "text-red-400 bg-red-500/5 border-red-500/20" },
  { id: "beautiful", label: "Beautiful", icon: Sunset, color: "text-amber-400 bg-amber-400/5 border-amber-400/20" },
  { id: "heavy", label: "Heavy", icon: Cloud, color: "text-indigo-400 bg-indigo-500/5 border-indigo-500/20" },
  { id: "peaceful", label: "Peaceful", icon: HeartHandshake, color: "text-emerald-400 bg-emerald-500/5 border-emerald-500/20" }
];

const RESPONSES: Record<string, string> = {
  soft: "I'm so glad. Take this gentle, beautiful energy and rest softly. You deserve quiet moments that make you smile.",
  tiring: "Today drained your battery, didn't it? Put the day behind you, curl up, and rest properly tonight. The world can wait for tomorrow.",
  chaotic: "Sounds like a whirlwind of noise. Let this space be your quiet anchor. Take a deep breath—the chaos is temporary, you've survived it all.",
  beautiful: "I love that today was beautiful. Keep that glow on your face, Vanshika. I hope it rolls into tomorrow as well.",
  heavy: "If today felt heavy on your heart, let me carry a tiny bit of it for you. Sleep early tonight and allow your mind to fully rest.",
  peaceful: "A peaceful mind is such a rare, sweet treasure. Enjoy the quiet evening, and remember how valuable these calm days are."
};

export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [moodHistory, setMoodHistory] = useState<Record<string, string>>({});

  useEffect(() => {
    const stored = localStorage.getItem("vanshika_mood_log");
    if (stored) {
      try {
        setMoodHistory(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSelectMood = (moodId: string) => {
    setSelectedMood(moodId);
    
    // Save to local history with today's date
    const today = new Date().toDateString();
    const updated = { ...moodHistory, [today]: moodId };
    setMoodHistory(updated);
    localStorage.setItem("vanshika_mood_log", JSON.stringify(updated));
  };

  return (
    <section id="moods" className="py-24 relative z-10 px-6 bg-foreground/[0.01] border-y border-foreground/[0.04]">
      <div className="max-w-3xl mx-auto">
        
        <div className="text-center mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-foreground">
            How was your day?
          </h2>
          <p className="text-xs uppercase tracking-[0.15em] text-accent-rose-dark font-bold">
            Select a feeling for a personal note
          </p>
        </div>

        {/* Mood Options Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          {MOODS.map(m => {
            const Icon = m.icon;
            const isSelected = selectedMood === m.id;
            return (
              <button
                key={m.id}
                onClick={() => handleSelectMood(m.id)}
                className={`flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-300 relative overflow-hidden ${
                  isSelected 
                    ? "bg-accent-rose/10 border-accent-rose text-accent-rose-dark scale-105 shadow-md" 
                    : "bg-background/45 backdrop-blur border-foreground/10 text-foreground hover:bg-foreground/[0.02]"
                }`}
              >
                <Icon className={`w-6 h-6 mb-3 ${isSelected ? "text-accent-rose-dark" : "text-foreground/70"}`} />
                <span className="text-sm font-semibold tracking-wide uppercase">{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Personalized Response Card */}
        <AnimatePresence mode="wait">
          {selectedMood && (
            <motion.div
              key={selectedMood}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
              className="bg-background/55 backdrop-blur-xl border border-accent-rose/30 p-8 rounded-3xl text-center shadow-lg relative"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent-rose/[0.02] to-transparent pointer-events-none"></div>
              
              <span className="text-[10px] font-bold uppercase tracking-wider text-accent-rose-dark block mb-3">
                A note for your {selectedMood} day
              </span>
              
              <p className="font-serif text-lg md:text-xl text-foreground italic leading-relaxed mb-6 max-w-xl mx-auto">
                &ldquo;{RESPONSES[selectedMood]}&rdquo;
              </p>
              
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-foreground/45 uppercase tracking-widest">
                <span>With care</span>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-rose"></span>
                <span>Rishi</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
