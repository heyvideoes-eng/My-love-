"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRealtimeData } from "@/hooks/useRealtimeData";

const AmbientCanvas = dynamic(() => import("@/components/AmbientCanvas"), {
  ssr: false,
});

// ─── Arrow Down SVG ──────────────────────────────────────────────────────────
function ArrowDown() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
      style={{ width: 14, height: 14 }}
    >
      <path
        d="M8 3v10M3.5 8.5l4.5 4.5 4.5-4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export interface SiteSettings {
  id: string;
  meta_text: string;
  updated_text: string;
  label_text: string;
  title_prefix: string;
  title_emphasis: string;
  subtitle: string;
  btn_text: string;
}

export default function HeroSection() {
  const noteRef = useRef<HTMLElement | null>(null);

  const { data: settings } = useRealtimeData<SiteSettings>(
    "site_settings",
    "created_at",
    false
  );

  const config = settings?.[0] || {
    meta_text: "Private edition",
    updated_text: "Updated daily",
    label_text: "A quiet, living love letter",
    title_prefix: "Vanshika,",
    title_emphasis: "this is yours",
    subtitle: "A soft, private space for your mornings,\nyour nights, and all the in-between.",
    btn_text: "Open today's note"
  };

  useEffect(() => {
    noteRef.current = document.getElementById("daily-note");
  }, []);

  const scrollToNote = () => {
    noteRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section
      aria-label="Hero"
      className="hero section"
    >
      {/* Three.js ambient canvas — behind everything */}
      <AmbientCanvas />

      {/* Atmospheric orbs */}
      <div aria-hidden="true" className="hero-orb left" />
      <div aria-hidden="true" className="hero-orb right" />

      {/* Radial fade — keeps text legible over the 3D form */}
      <div aria-hidden="true" className="hero-veil" />

      {/* Content */}
      <div className="hero-content">
        {/* Meta capsule */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="hero-meta"
        >
          <span>{config.meta_text}</span>
          <span className="hero-meta-dot" />
          <span>{config.updated_text}</span>
        </motion.div>

        {/* Label */}
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hero-label"
        >
          {config.label_text}
        </motion.span>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="hero-title"
        >
          {config.title_prefix}
          <br />
          <em>{config.title_emphasis}</em>
        </motion.h1>

        {/* Ornamental divider */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.9 }}
          aria-hidden="true"
          className="hero-divider"
        >
          {[3, 48, 5, 48, 3].map((size, i) =>
            i % 2 === 0 ? (
              <span
                key={i}
                className="dot"
              />
            ) : (
              <span
                key={i}
                className="line"
              />
            )
          )}
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="hero-subtitle"
        >
          {config.subtitle.split('\n').map((line, i) => (
            <span key={i}>
              {line}
              {i === 0 && <br />}
            </span>
          ))}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.1, ease: [0.16, 1, 0.3, 1] }}
          className="hero-cta"
        >
          <button
            onClick={scrollToNote}
            id="hero-read-btn"
            aria-label="Scroll to read the letter"
            className="btn-primary"
          >
            {config.btn_text} <ArrowDown />
          </button>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="hero-scroll"
      >
        <span>Scroll</span>
        <motion.span
          aria-hidden="true"
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
        >
          <ArrowDown />
        </motion.span>
      </motion.div>
    </section>
  );
}
