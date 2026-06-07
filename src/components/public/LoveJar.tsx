"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const DEFAULT_REASONS = [
  "I love the way your laugh immediately makes my entire day brighter.",
  "The quiet comfort we share on ordinary walks is my absolute favorite place to be.",
  "Your determination to do your best is so inspiring, but your gentle heart is what I love most.",
  "I love how you remember the small details about things I say, even from weeks ago.",
  "No matter how chaotic the day gets, thinking of you is my instant calm.",
  "Your smile has this effortless way of making everything feel like it's going to be alright.",
  "I love that we can talk about absolutely anything for hours, and it still feels like minutes.",
  "You are, quietly, one of the most remarkable people I have ever known.",
  "I love how you wear your heart on your sleeve, showing your genuine, beautiful self.",
  "Even on the most ordinary Tuesdays, everything feels special when you're around."
];

export default function LoveJar() {
  const [reasons, setReasons] = useState<string[]>(DEFAULT_REASONS);
  const [currentReason, setCurrentReason] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState(false);

  // Sync reasons with Supabase database
  useEffect(() => {
    const loadReasons = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("love_jar_notes")
        .select("message")
        .order("created_at", { ascending: true });

      if (data && data.length > 0) {
        setReasons(data.map(d => d.message));
      } else {
        setReasons(DEFAULT_REASONS);
        // Seed default reasons if table is blank
        await supabase.from("love_jar_notes").insert(
          DEFAULT_REASONS.map(msg => ({
            id: crypto.randomUUID(),
            message: msg
          }))
        );
      }
    };

    loadReasons();
  }, []);

  // Set up Realtime Sync for Love Jar updates
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel("love_jar_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "love_jar_notes" },
        async () => {
          const { data } = await supabase
            .from("love_jar_notes")
            .select("message")
            .order("created_at", { ascending: true });
          if (data && data.length > 0) {
            setReasons(data.map(d => d.message));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const drawReason = () => {
    if (isShaking || reasons.length === 0) return;
    setIsShaking(true);
    setCurrentReason(null);

    // Shake for 600ms, then pick a random reason from the live list
    setTimeout(() => {
      setIsShaking(false);
      const randomIndex = Math.floor(Math.random() * reasons.length);
      setCurrentReason(reasons[randomIndex]);
    }, 600);
  };

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto my-12">
      <div className="text-center">
        <h3 className="font-serif text-fluid-4xl font-normal text-[#fdfaf6] mb-1">
          The Sweet Capsule Jar
        </h3>
        <p className="text-fluid-xs uppercase tracking-wider text-[#c97b84] font-bold">
          Tap the glass to retrieve a secret note from Rishi
        </p>
      </div>

      <div className="relative flex flex-col items-center justify-center min-h-[160px] w-full">
        {/* Glowing aura behind the jar */}
        <div className="absolute w-36 h-36 bg-[#c97b84]/5 blur-3xl rounded-full pointer-events-none" />

        {/* Jar trigger button */}
        <motion.button
          onClick={drawReason}
          className="relative focus:outline-none cursor-pointer"
          animate={
            isShaking
              ? {
                  x: [0, -6, 6, -6, 6, -4, 4, 0],
                  y: [0, 2, -2, 2, -2, 1, -1, 0],
                  rotate: [0, -3, 3, -3, 3, -1, 1, 0],
                }
              : {}
          }
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Draw a reason from the love jar"
        >
          {/* Jar SVG */}
          <svg
            className="w-32 h-36 filter drop-shadow-md"
            viewBox="0 0 100 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Jar Lid (Gold) */}
            <rect
              x="32"
              y="8"
              width="36"
              height="10"
              rx="3"
              fill="var(--rose-gold)"
              className="transition-colors duration-300"
            />
            {/* Lid rim */}
            <rect x="30" y="18" width="40" height="4" rx="1" fill="rgba(232, 197, 154, 0.3)" />

            {/* Jar Body (Glassmorphism) */}
            <path
              d="M30,22 L70,22 C74,22 76,24 76,28 L76,32 C76,38 83,46 85,56 L88,92 C90,110 80,124 50,124 C20,124 10,110 12,92 L15,56 C17,46 24,38 24,32 L24,28 C24,24 26,22 30,22 Z"
              fill="rgba(255, 255, 255, 0.08)"
              stroke="rgba(201, 123, 132, 0.22)"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            
            {/* Secondary glass reflection */}
            <path
              d="M18,92 C16,106 24,118 45,120"
              stroke="rgba(255, 255, 255, 0.15)"
              strokeWidth="1.5"
              strokeLinecap="round"
              fill="none"
            />

            {/* Decorative Gold String/Tag */}
            <path
              d="M29,26 C38,29 62,23 71,26"
              fill="none"
              stroke="var(--rose-gold)"
              strokeWidth="1.5"
            />
            <path
              d="M62,26 L66,45 L58,45 Z"
              fill="var(--rose)"
              opacity="0.85"
            />
            <circle cx="62" cy="27" r="1.5" fill="rgba(232, 197, 154, 0.6)" />

            {/* Floating Hearts inside Jar */}
            <motion.path
              d="M50 64 C50 64 47 60 44 60 C41.5 60 39.5 62 39.5 64.5 C39.5 68 44 72 50 75 C56 72 60.5 68 60.5 64.5 C60.5 62 58.5 60 56 60 C53 60 50 64 50 64 Z"
              fill="var(--rose)"
              animate={{
                y: [0, -6, 0],
                scale: [1, 1.08, 1],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.path
              d="M36 82 C36 82 33.5 78.5 31 78.5 C29 78.5 27.5 80 27.5 82 C27.5 85 31 88.5 36 91 C41 88.5 44.5 85 44.5 82 C44.5 80 43 78.5 41 78.5 C38.5 78.5 36 82 36 82 Z"
              fill="var(--wine)"
              opacity="0.8"
              animate={{
                y: [0, -4, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 2.2,
                repeat: Infinity,
                delay: 0.4,
                ease: "easeInOut",
              }}
            />
            <motion.path
              d="M64 86 C64 86 61.5 82.5 59 82.5 C57 82.5 55.5 84 55.5 86 C55.5 89 59 92.5 64 95 C69 92.5 72.5 89 72.5 86 C72.5 84 71 82.5 69 82.5 C66.5 82.5 64 86 64 86 Z"
              fill="var(--rose-gold)"
              opacity="0.9"
              animate={{
                y: [0, -5, 0],
                scale: [1, 1.06, 1],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                delay: 0.8,
                ease: "easeInOut",
              }}
            />
          </svg>
        </motion.button>
      </div>

      {/* Message Reveal Area */}
      <div className="w-full min-h-[90px] flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {currentReason ? (
            <motion.div
              key={currentReason}
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.96 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="bg-white/90 backdrop-blur-md border border-[rgba(201,123,132,0.18)] p-5 rounded-2xl shadow-sm text-center w-full relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-rose to-accent-gold" />
              <p className="font-serif text-fluid-xl md:text-fluid-2xl italic text-[#331f22] leading-relaxed">
                &ldquo;{currentReason}&rdquo;
              </p>
              <div className="flex items-center justify-center gap-1.5 mt-3 text-fluid-xs uppercase font-bold tracking-widest text-[#a64555]">
                <Heart className="w-3 h-3 fill-current text-[#b64b59]" />
                <span>Rishi</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="prompt"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.55 }}
              exit={{ opacity: 0 }}
              className="text-center text-fluid-base text-[#7c6569] font-medium tracking-wide"
            >
              {isShaking ? "Shaking the capsule jar..." : "Tap the glass to retrieve a note"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
