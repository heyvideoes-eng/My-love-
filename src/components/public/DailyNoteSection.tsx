"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { DailyMessage } from "@/lib/types";
import { MessageSquare, Heart } from "lucide-react";

interface Props {
  initial: DailyMessage;
}

export default function DailyNoteSection({ initial }: Props) {
  const [message, setMessage] = useState<DailyMessage>(initial);
  const [isNew, setIsNew] = useState(false);

  // Supabase Realtime subscription
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel("daily_messages_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "daily_messages",
          filter: "is_published=eq.true",
        },
        (payload) => {
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            setIsNew(true);
            setMessage(payload.new as DailyMessage);
            setTimeout(() => setIsNew(false), 4000);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div id="daily-note" className="w-full relative z-10 my-8">
      
      {/* Background glow shadow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(201,123,132,0.03)] to-transparent rounded-3xl filter blur-xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="glass-panel p-8 md:p-10 relative overflow-hidden"
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#c97b84]/50 to-transparent" />
        
        <div className="flex flex-col items-center text-center">
          
          {/* Header kicker */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-fluid-2xs uppercase font-bold tracking-widest text-[#e8c59a] mb-6">
            <MessageSquare className="w-3.5 h-3.5 text-[#c97b84]" />
            <span>Today's Whispers</span>
          </div>

          {/* Realtime "updated" toast banner inside the note */}
          <AnimatePresence>
            {isNew && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-16 bg-[#c97b84]/20 border border-[#c97b84]/40 text-[#e5b0b6] px-3.5 py-1 rounded-full text-fluid-2xs uppercase font-bold tracking-widest animate-pulse"
              >
                Just Updated in Real-Time
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main message card container */}
          <div className="relative max-w-2xl px-6 md:px-10 py-4">
            {/* Elegant Serif quote mark */}
            <span 
              className="absolute left-[-10px] top-[-15px] font-serif text-8xl text-[rgba(201,123,132,0.15)] leading-none select-none"
              aria-hidden="true"
            >
              “
            </span>

            <AnimatePresence mode="wait">
              <motion.p
                key={message.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.6 }}
                className="font-serif text-fluid-2xl md:text-fluid-4xl text-[#fdfaf6] italic font-light leading-relaxed relative z-10"
              >
                {message.content}
              </motion.p>
            </AnimatePresence>

            <span 
              className="absolute right-[-10px] bottom-[-25px] font-serif text-8xl text-[rgba(201,123,132,0.15)] leading-none select-none"
              aria-hidden="true"
            >
              ”
            </span>
          </div>

          {/* Author line */}
          <div className="flex items-center gap-3 mt-10">
            <div className="w-8 h-[1px] bg-white/10" />
            <span className="font-serif text-[#e5b0b6] italic text-fluid-lg font-semibold flex items-center gap-1.5">
              <span>Rishi</span>
              <Heart className="w-3 h-3 fill-current text-[#c97b84]" />
            </span>
            <div className="w-8 h-[1px] bg-white/10" />
          </div>

        </div>
      </motion.div>
    </div>
  );
}
