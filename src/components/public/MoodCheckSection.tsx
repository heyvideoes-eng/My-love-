"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type MoodKey, MOOD_LABELS, MOOD_EMOJIS } from "@/lib/types";
import { Sparkles, Heart } from "lucide-react";

interface Props {
  moodMessages: Record<MoodKey, string>;
}

const MOODS: MoodKey[] = [
  "soft",
  "beautiful",
  "peaceful",
  "tiring",
  "heavy",
  "chaotic",
];

export default function MoodCheckSection({ moodMessages }: Props) {
  const [selected, setSelected] = useState<MoodKey | null>(null);

  return (
    <section
      aria-label="How are you feeling today?"
      className="py-16 relative"
    >
      <div className="max-w-2xl mx-auto text-center px-4">
        
        {/* Heading */}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-fluid-base font-bold uppercase tracking-[0.25em] text-[#c97b84] block mb-2"
        >
          Daily Check-in
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="font-serif text-fluid-4xl md:text-fluid-5xl text-[#fdfaf6] font-normal mb-8"
        >
          How are you feeling today, Vanshika?
        </motion.h2>

        {/* Mood pills Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3 mb-8"
        >
          {MOODS.map((mood, i) => {
            const active = selected === mood;
            return (
              <motion.button
                key={mood}
                initial={{ opacity: 0, y: 8 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.08 * i }}
                onClick={() => setSelected(active ? null : mood)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-fluid-base font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                  active
                    ? "bg-[rgba(201,123,132,0.18)] border-[#c97b84] text-[#e5b0b6] scale-105 shadow-md"
                    : "bg-white/5 border-white/10 text-[#8a7679] hover:bg-white/10 hover:text-[#fdfaf6]"
                }`}
                aria-pressed={active}
              >
                <span aria-hidden="true" className="text-fluid-base text-[#e8c59a]">
                  {MOOD_EMOJIS[mood]}
                </span>
                <span>{MOOD_LABELS[mood]}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Response message drawer */}
        <AnimatePresence mode="wait">
          {selected && (
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="glass-panel p-6 md:p-8 relative mt-6 border-[#c97b84]/30 bg-[rgba(26,12,16,0.3)]"
            >
              {/* Note highlight ornament */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c97b84]/60 to-transparent" />
              
              <p className="font-serif text-fluid-2xl md:text-fluid-3xl text-[#fdfaf6] italic font-light leading-relaxed mb-6">
                &ldquo;{moodMessages[selected]}&rdquo;
              </p>
              
              <div className="flex items-center justify-center gap-1.5 text-fluid-2xs uppercase tracking-[0.2em] text-[#8a7679]/70 font-bold">
                <Heart className="w-3 h-3 fill-current text-[#c97b84] animate-pulse" />
                <span>Rishi</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
