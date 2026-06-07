"use client";

import { motion } from "framer-motion";
import HeartParticleCanvas from "./HeartParticleCanvas";
import { Heart } from "lucide-react";

interface IntroScreenProps {
  onEnter: () => void;
}

export default function IntroScreen({ onEnter }: IntroScreenProps) {
  // Stagger configurations for child elements
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.25,
        delayChildren: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      filter: "blur(15px)",
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 35, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 1.4,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  const lineVariants = {
    hidden: { width: 0, opacity: 0 },
    visible: {
      width: 60,
      opacity: 0.3,
      transition: { duration: 1.5, delay: 1.2, ease: "easeInOut" as const },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-0 w-full h-full bg-[#080405] z-50 flex flex-col justify-center items-center text-center overflow-hidden select-none"
    >
      {/* Cinematic Heart Particle Field Canvas */}
      <HeartParticleCanvas />

      {/* Atmospheric glow orbs */}
      <div className="ambient-glow-orb glow-wine w-[400px] h-[400px] top-1/4 left-1/4 animate-pulse-slow" />
      <div className="ambient-glow-orb glow-rose w-[350px] h-[350px] bottom-1/4 right-1/4 animate-pulse-slow" style={{ animationDelay: "-3s" }} />

      {/* Main Intro Content wrapper */}
      <div className="z-10 max-w-3xl px-6 flex flex-col items-center gap-0">
        
        {/* Editorial Sub-Eyebrow */}
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-2 px-3 py-1 rounded-full border border-[rgba(232,197,154,0.3)] bg-[rgba(255,255,255,0.05)] text-fluid-xs uppercase font-bold tracking-[0.25em] text-[#e8c59a] mb-8"
        >
          <Heart className="w-2.5 h-2.5 fill-current text-[#c97b84] animate-pulse" />
          <span>Rishi & Vanshika</span>
          <span className="opacity-50">•</span>
          <span>Private Edition</span>
        </motion.div>

        {/* Narrative Kicker */}
        <motion.span
          variants={itemVariants}
          className="text-fluid-base font-bold uppercase tracking-[0.3em] text-[#c97b84] mb-3"
        >
          Dedicated to you
        </motion.span>

        {/* Immersive Main Title */}
        <motion.h1
          variants={itemVariants}
          className="font-serif text-fluid-5xl md:text-8xl text-[#fdfaf6] font-normal leading-[1.05] tracking-tight mb-5"
        >
          Vanshika,
          <br />
          <span className="text-gradient font-light">our world awaits.</span>
        </motion.h1>

        {/* Ornamental separator */}
        <div className="flex items-center gap-3 my-6 h-4">
          <motion.div variants={lineVariants} className="h-[1px] bg-[#e8c59a]" />
          <motion.span
            variants={itemVariants}
            className="text-fluid-3xs tracking-[0.4em] uppercase text-[#e8c59a]/50"
          >
            ✦
          </motion.span>
          <motion.div variants={lineVariants} className="h-[1px] bg-[#e8c59a]" />
        </div>

        {/* Storytelling Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-fluid-lg md:text-fluid-xl text-[#8a7679] font-medium tracking-wide max-w-md mb-12 leading-relaxed"
        >
          A quiet digital sanctuary built to hold our reminders, our memories, and our dates. Made with all my love.
        </motion.p>

        {/* Entry CTA */}
        <motion.div variants={itemVariants}>
          <button
            onClick={onEnter}
            className="btn-rose-gold animate-pulse-gold group"
            aria-label="Enter our private dashboard"
          >
            <span>Open Our Story</span>
            <motion.span
              className="inline-block transition-transform duration-300 group-hover:translate-x-1"
            >
              →
            </motion.span>
          </button>
        </motion.div>
      </div>

      {/* Cinematic Footer Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 2, duration: 1.2 }}
        className="absolute bottom-8 text-fluid-2xs uppercase tracking-[0.3em] text-[#8a7679] font-semibold"
      >
        Designed with care · 2026
      </motion.div>
    </motion.div>
  );
}
