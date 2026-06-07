"use client";

import { useEffect, useState } from "react";
import { Award, Zap, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface VisitCounterProps {
  streak: number;
  setStreak: (s: number) => void;
}

export default function VisitCounter({ streak, setStreak }: VisitCounterProps) {
  const [totalVisits, setTotalVisits] = useState(0);

  useEffect(() => {
    const todayStr = new Date().toDateString();
    
    // Total visits counter
    const storedTotal = localStorage.getItem("vanshika_total_visits");
    let total = storedTotal ? parseInt(storedTotal) : 0;
    
    const lastVisitDate = localStorage.getItem("vanshika_last_visit_date");
    
    if (lastVisitDate !== todayStr) {
      // Increment total visits only once per day
      total += 1;
      localStorage.setItem("vanshika_total_visits", total.toString());
      localStorage.setItem("vanshika_last_visit_date", todayStr);
      
      // Calculate streak
      const storedStreak = localStorage.getItem("vanshika_visit_streak");
      let currentStreak = storedStreak ? parseInt(storedStreak) : 0;
      
      if (lastVisitDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        if (lastVisitDate === yesterdayStr) {
          currentStreak += 1;
        } else {
          currentStreak = 1; // reset streak if gap
        }
      } else {
        currentStreak = 1; // first ever visit
      }
      
      localStorage.setItem("vanshika_visit_streak", currentStreak.toString());
      setStreak(currentStreak);
    } else {
      // Already visited today
      const storedStreak = localStorage.getItem("vanshika_visit_streak");
      if (storedStreak) setStreak(parseInt(storedStreak));
    }
    
    setTotalVisits(total);
  }, []);

  return (
    <section id="streaks" className="py-24 relative z-10 px-6">
      <div className="max-w-md mx-auto bg-background/45 backdrop-blur-xl border border-foreground/10 p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent-gold/[0.02] to-transparent pointer-events-none"></div>

        <span className="text-[10px] font-bold uppercase tracking-widest text-accent-rose-dark block mb-6">
          Your Romantic Streak
        </span>

        {/* Circular Glowing Streak Widget */}
        <div className="relative w-40 h-40 flex items-center justify-center mb-6">
          {/* Outer glowing background ring */}
          <div className="absolute inset-0 rounded-full border border-foreground/[0.04] bg-foreground/[0.01]"></div>
          
          {/* Animated SVG Ring */}
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-foreground/[0.07]"
              strokeWidth="2"
              fill="transparent"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-accent-rose"
              strokeWidth="3.5"
              fill="transparent"
              strokeDasharray="276"
              initial={{ strokeDashoffset: 276 }}
              animate={{ strokeDashoffset: 276 - (Math.min(streak, 7) / 7) * 276 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              strokeLinecap="round"
            />
          </svg>

          {/* Central content */}
          <div className="absolute flex flex-col items-center">
            <motion.span 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="font-serif text-5xl font-bold text-foreground"
            >
              {streak}
            </motion.span>
            <span className="text-[9px] uppercase font-bold tracking-widest text-foreground/45 mt-0.5">
              days active
            </span>
          </div>
        </div>

        <h3 className="font-serif text-2xl font-bold text-foreground mb-2">
          Keep the light burning
        </h3>
        
        <p className="text-sm text-foreground/70 leading-relaxed font-medium mb-6">
          You have checked in here <span className="text-accent-rose-dark font-bold">{totalVisits} times</span> to read Rishi&apos;s daily thoughts.
        </p>

        {/* Badges footer row */}
        <div className="w-full border-t border-foreground/[0.07] pt-6 flex items-center justify-center gap-6 text-foreground/60 text-xs font-semibold uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-accent-gold" />
            <span>Streak {streak}d</span>
          </div>
          <span className="opacity-20">•</span>
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-accent-rose-dark" />
            <span>Visits {totalVisits}</span>
          </div>
        </div>

      </div>
    </section>
  );
}
