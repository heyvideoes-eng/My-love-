"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Calendar, Heart } from "lucide-react";

export interface SpecialDate {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  tag: "birthday" | "anniversary" | "meeting" | "date" | "moment";
  note?: string;
}

interface CountdownHighlightProps {
  dates: SpecialDate[];
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  eventTitle: string;
  eventDate: string;
  eventNote?: string;
  tag: string;
  isToday: boolean;
}

export default function CountdownHighlight({ dates }: CountdownHighlightProps) {
  const [timeLeft, setTimeLeft] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      let nextEvent: SpecialDate | null = null;
      let minDiff = Infinity;
      let targetDateObj = new Date();

      for (const d of dates) {
        // Parse date
        const parts = d.date.split("-");
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);

        let eventDate = new Date(year, month, day, 0, 0, 0);

        // For yearly recurring events (birthday, anniversary, meeting), 
        // if they have already passed in the current year, check next year.
        if (d.tag === "birthday" || d.tag === "anniversary" || d.tag === "meeting") {
          eventDate.setFullYear(now.getFullYear());
          if (eventDate.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
            eventDate.setFullYear(now.getFullYear() + 1);
          }
        }

        const diff = eventDate.getTime() - now.getTime();

        // If the event is today
        const isSameDay = 
          eventDate.getDate() === now.getDate() &&
          eventDate.getMonth() === now.getMonth() &&
          eventDate.getFullYear() === now.getFullYear();

        if (isSameDay) {
          minDiff = 0;
          nextEvent = d;
          targetDateObj = eventDate;
        } else if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          nextEvent = d;
          targetDateObj = eventDate;
        }
      }

      if (!nextEvent) {
        setTimeLeft(null);
        return;
      }

      const isToday = minDiff === 0;

      if (isToday) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          eventTitle: nextEvent.title,
          eventDate: nextEvent.date,
          eventNote: nextEvent.note,
          tag: nextEvent.tag,
          isToday: true
        });
      } else {
        const diffMs = targetDateObj.getTime() - now.getTime();
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diffMs / 1000 / 60) % 60);
        const seconds = Math.floor((diffMs / 1000) % 60);

        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          eventTitle: nextEvent.title,
          eventDate: nextEvent.date,
          eventNote: nextEvent.note,
          tag: nextEvent.tag,
          isToday: false
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [dates]);

  if (!timeLeft) return null;

  const getTagEmoji = (tag: string) => {
    switch (tag) {
      case "birthday": return "🎂";
      case "anniversary": return "💍";
      case "meeting": return "✨";
      case "date": return "🍷";
      default: return "💝";
    }
  };

  return (
    <div className="w-full relative z-10 my-10">
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(232,197,154,0.03)] via-[rgba(201,123,132,0.05)] to-transparent rounded-3xl filter blur-xl pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="glass-panel glass-panel-active p-8 md:p-10 flex flex-col items-center text-center relative overflow-hidden"
      >
        {/* Subtle glowing lines */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#e8c59a] to-transparent opacity-60" />

        {timeLeft.isToday ? (
          <div className="py-6 flex flex-col items-center">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="w-16 h-16 rounded-full bg-[#c97b84]/20 flex items-center justify-center mb-6 border border-[#c97b84]/40 text-[#c97b84]"
            >
              <Heart className="w-8 h-8 fill-current" />
            </motion.div>
            <span className="text-fluid-base font-bold uppercase tracking-[0.25em] text-[#e8c59a] mb-2">
              Today is the day!
            </span>
            <h2 className="font-serif text-fluid-4xl md:text-fluid-5xl text-[#fdfaf6] font-normal leading-tight mb-4">
              Happy {timeLeft.eventTitle}!
            </h2>
            {timeLeft.eventNote && (
              <p className="text-[#8a7679] italic max-w-md text-fluid-lg">{timeLeft.eventNote}</p>
            )}
          </div>
        ) : (
          <div className="w-full flex flex-col items-center">
            
            {/* Title & Tag */}
            <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-fluid-xs uppercase font-bold tracking-widest text-[#e8c59a] mb-5">
              <span>{getTagEmoji(timeLeft.tag)}</span>
              <span>{timeLeft.tag} Countdown</span>
            </div>

            <h3 className="font-serif text-fluid-3xl md:text-fluid-5xl text-[#fdfaf6] font-normal mb-1">
              Counting down to: {timeLeft.eventTitle}
            </h3>
            
            <p className="text-fluid-base text-[#8a7679] uppercase tracking-wider mb-8">
              Target date: {new Date(timeLeft.eventDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>

            {/* Countdown Grid */}
            <div className="grid grid-cols-4 gap-3 md:gap-6 max-w-xl w-full">
              {[
                { value: timeLeft.days, label: "Days" },
                { value: timeLeft.hours, label: "Hours" },
                { value: timeLeft.minutes, label: "Minutes" },
                { value: timeLeft.seconds, label: "Seconds" }
              ].map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-[rgba(10,5,6,0.5)] border border-[rgba(232,197,154,0.08)] rounded-xl py-3.5 px-2 md:py-5 flex flex-col items-center shadow-inner relative overflow-hidden"
                >
                  <span className="font-serif text-fluid-3xl md:text-fluid-5xl font-normal text-[#e8c59a] tabular-nums tracking-tight">
                    {String(item.value).padStart(2, "0")}
                  </span>
                  <span className="text-fluid-2xs md:text-fluid-xs uppercase tracking-widest text-[#8a7679] font-bold mt-1.5">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Event note preview */}
            {timeLeft.eventNote && (
              <p className="text-[#8a7679] text-fluid-base italic mt-8 max-w-md leading-relaxed">
                “{timeLeft.eventNote}”
              </p>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
