"use client";

import { useEffect, useState } from "react";
import { ArrowDown } from "lucide-react";
import { motion } from "framer-motion";

export default function Hero() {
  const [timeStr, setTimeStr] = useState("");
  const [greeting, setGreeting] = useState("Hello");

  useEffect(() => {
    const updateTimeAndGreeting = () => {
      const now = new Date();
      
      // Formatting time
      setTimeStr(now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      }));

      // Time-based greeting
      const hour = now.getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good afternoon");
      } else if (hour >= 17 && hour < 22) {
        setGreeting("Good evening");
      } else {
        setGreeting("Good night");
      }
    };

    updateTimeAndGreeting();
    const interval = setInterval(updateTimeAndGreeting, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header id="hero" className="min-height-hero flex flex-col justify-center items-center text-center px-6 relative overflow-hidden select-none">
      
      {/* Dynamic Date & Time Floating Overlay */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-24 flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/[0.07] text-foreground/50 text-xs font-semibold tracking-wider uppercase"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-ping"></span>
        <span>{timeStr || "00:00"}</span>
        <span className="opacity-25">•</span>
        <span>Rishi & Vanshika</span>
      </motion.div>

      {/* Main Copy Elements */}
      <div className="max-w-2xl z-10 flex flex-col items-center">
        <motion.span 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.8 }}
          transition={{ delay: 0.3, duration: 1.2 }}
          className="text-xs font-bold uppercase tracking-[0.25em] text-accent-rose-dark mb-4"
        >
          {greeting}, Vanshika.
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-serif text-5xl md:text-7xl font-bold text-foreground leading-[1.05] tracking-tight mb-6"
        >
          For Vanshika.
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ delay: 0.9, duration: 1.4 }}
          className="text-base md:text-lg text-foreground/80 font-medium tracking-wide max-w-md mb-8"
        >
          Just a quiet, personal space made only for you. Evolving softly every day.
        </motion.p>

        <motion.a 
          href="#daily-note"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.2, duration: 1.0 }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border border-accent-rose/55 bg-background/50 text-xs font-bold uppercase tracking-wider text-foreground hover:bg-accent-rose hover:border-accent-rose hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-accent-rose/25"
        >
          Open daily note
        </motion.a>
      </div>

      {/* Floating scroll indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.8, duration: 1.0 }}
        className="absolute bottom-10 flex flex-col items-center gap-2 text-foreground/50 text-[10px] tracking-[0.2em] uppercase font-bold"
      >
        <span>scroll down</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ArrowDown className="w-3.5 h-3.5" />
        </motion.div>
      </motion.div>
    </header>
  );
}
