"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { LoveNote } from "@/lib/types";

interface Props {
  notes: LoveNote[];
}

const CATEGORY_COLORS: Record<string, { bg: string; accent: string; text: string }> = {
  letter:       { bg: "rgba(99,102,241,0.06)",  accent: "#6366f1", text: "Letter" },
  reason:       { bg: "rgba(236,72,153,0.06)",  accent: "#ec4899", text: "Reason" },
  "micro-note": { bg: "rgba(16,185,129,0.06)",  accent: "#10b981", text: "Note" },
  vow:          { bg: "rgba(245,158,11,0.06)",  accent: "#f59e0b", text: "Vow" },
};

export default function LoveNotesSection({ notes }: Props) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  if (notes.length === 0) return null;

  const active = notes[activeIdx];
  const cfg = CATEGORY_COLORS[active.category] ?? CATEGORY_COLORS.letter;

  return (
    <section style={{ padding: "5rem 1.5rem", textAlign: "center" }}>
      {/* Section label */}
      <motion.span
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.65rem",
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.2em",
          color: "var(--rose-gold-dim)",
          display: "block",
          marginBottom: "1rem",
        }}
      >
        ✦ Words for You
      </motion.span>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1 }}
        style={{
          fontFamily: "var(--font-serif)",
          fontSize: "clamp(2rem, 5vw, 3.2rem)",
          fontWeight: 400,
          color: "var(--moonlight)",
          marginBottom: "3rem",
          lineHeight: 1.2,
        }}
      >
        Notes I wrote for you
      </motion.h2>

      {/* Category tabs */}
      <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
        {notes.map((note, i) => {
          const c = CATEGORY_COLORS[note.category] ?? CATEGORY_COLORS.letter;
          return (
            <motion.button
              key={note.id}
              whileTap={{ scale: 0.96 }}
              onClick={() => { setActiveIdx(i); setIsOpen(false); }}
              style={{
                padding: "0.4rem 1rem",
                borderRadius: 100,
                border: `1px solid ${i === activeIdx ? c.accent : "rgba(255,255,255,0.12)"}`,
                background: i === activeIdx ? c.bg : "transparent",
                color: i === activeIdx ? c.accent : "var(--muted-mauve)",
                fontFamily: "var(--font-sans)",
                fontSize: "0.72rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {c.text}{note.title ? ` · ${note.title.slice(0, 20)}` : ""}
            </motion.button>
          );
        })}
      </div>

      {/* Note card */}
      <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-glow)",
              borderRadius: 24,
              padding: "2.5rem",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Accent orb */}
            <div style={{
              position: "absolute", top: -40, right: -40,
              width: 140, height: 140, borderRadius: "50%",
              background: `radial-gradient(circle, ${cfg.accent}22 0%, transparent 70%)`,
              pointerEvents: "none",
            }} />

            {/* Category badge */}
            <span style={{
              fontSize: "0.62rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.14em",
              color: cfg.accent,
              display: "block",
              marginBottom: "1.25rem",
            }}>
              {cfg.text}
            </span>

            {/* Title */}
            {active.title && (
              <h3 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.4rem",
                fontWeight: 400,
                color: "var(--moonlight)",
                marginBottom: "1rem",
                lineHeight: 1.3,
              }}>
                {active.title}
              </h3>
            )}

            {/* Content — truncated unless opened */}
            <div style={{ position: "relative" }}>
              <p style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1rem",
                lineHeight: 1.85,
                color: "var(--moonlight)",
                fontStyle: "italic",
                maxHeight: isOpen ? "none" : "7.5em",
                overflow: "hidden",
                transition: "max-height 0.4s ease",
              }}>
                &ldquo;{active.content}&rdquo;
              </p>
              {!isOpen && active.content.length > 280 && (
                <div style={{
                  position: "absolute", bottom: 0, left: 0, right: 0, height: 60,
                  background: "linear-gradient(to top, var(--bg-card), transparent)",
                }} />
              )}
            </div>

            {active.content.length > 280 && (
              <button
                onClick={() => setIsOpen(v => !v)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: "var(--font-sans)", fontSize: "0.72rem", fontWeight: 600,
                  color: cfg.accent, marginTop: "0.75rem", display: "block",
                  letterSpacing: "0.05em",
                }}
              >
                {isOpen ? "Show less" : "Read full letter ↓"}
              </button>
            )}

            {/* Mood tag */}
            {active.mood_tag && (
              <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border-glow)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${cfg.accent}33, transparent)` }} />
                <span style={{ fontSize: "0.62rem", color: "var(--muted-mauve)", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }}>{active.mood_tag}</span>
                <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, ${cfg.accent}33, transparent)` }} />
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation dots */}
        {notes.length > 1 && (
          <div style={{ display: "flex", justifyContent: "center", gap: "0.5rem", marginTop: "1.5rem" }}>
            {notes.map((_, i) => (
              <button
                key={i}
                onClick={() => { setActiveIdx(i); setIsOpen(false); }}
                style={{
                  width: i === activeIdx ? 20 : 6,
                  height: 6,
                  borderRadius: 100,
                  background: i === activeIdx ? "var(--rose)" : "rgba(255,255,255,0.2)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  padding: 0,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
