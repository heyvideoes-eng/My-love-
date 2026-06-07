"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { DatePlan } from "@/lib/types";

interface Props {
  plan: DatePlan;
}

const MOOD_GRADIENTS: Record<string, string> = {
  romantic:   "linear-gradient(135deg, #fdf0f1 0%, #f9cacf 100%)",
  cozy:       "linear-gradient(135deg, #fdf4eb 0%, #f7dcc6 100%)",
  surprise:   "linear-gradient(135deg, #f6edfd 0%, #eacdfc 100%)",
  elegant:    "linear-gradient(135deg, #fdfaf0 0%, #f6e8cc 100%)",
  casual:     "linear-gradient(135deg, #effbf4 0%, #ccf6da 100%)",
  "long-drive": "linear-gradient(135deg, #eff7fb 0%, #cce8f6 100%)",
  movie:      "linear-gradient(135deg, #fdf0f0 0%, #fccacb 100%)",
  cafe:       "linear-gradient(135deg, #fbf2eb 0%, #f7dac6 100%)",
};

const MOOD_ACCENT: Record<string, string> = {
  romantic: "#c97b84", cozy: "#c5874f", surprise: "#9b6fc8",
  elegant: "#c5a030", casual: "#4d9e72", "long-drive": "#4d8db0",
  movie: "#c95a5a", cafe: "#b57b47",
};

const MOOD_ICONS: Record<string, string> = {
  romantic: "♥", cozy: "☕", surprise: "✨", elegant: "◈",
  casual: "◌", "long-drive": "⊳", movie: "▶", cafe: "⊙",
};

export default function DatePlanCard({ plan }: Props) {
  const [checklistState, setChecklistState] = useState<boolean[]>(
    (plan.checklist ?? []).map(() => false)
  );
  const [expanded, setExpanded] = useState(false);

  const accent  = MOOD_ACCENT[plan.mood]  ?? "#c97b84";
  const bg      = MOOD_GRADIENTS[plan.mood] ?? MOOD_GRADIENTS.romantic;

  const toggleCheck = (i: number) =>
    setChecklistState(prev => prev.map((v, idx) => idx === i ? !v : v));

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      viewport={{ once: true }}
      style={{
        background: bg,
        borderRadius: 24,
        overflow: "hidden",
        boxShadow: `0 20px 60px -10px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)`,
        maxWidth: 520,
        margin: "0 auto",
        position: "relative",
      }}
    >
      {/* Top accent stripe */}
      <div style={{ height: 4, background: `linear-gradient(90deg, ${accent}, transparent)` }} />

      {/* Header */}
      <div style={{ padding: "2rem 2rem 1.5rem" }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", color: accent, display: "block", marginBottom: "0.4rem" }}>
              Date Invitation ✦
            </span>
            <h3 style={{ fontFamily: "var(--font-serif)", fontSize: "1.6rem", color: "#2c1f22", lineHeight: 1.2, margin: 0 }}>
              {plan.title}
            </h3>
          </div>
          <div style={{
            width: 52, height: 52, borderRadius: "50%",
            background: `radial-gradient(circle, ${accent}33 0%, ${accent}11 100%)`,
            border: `1px solid ${accent}33`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.3rem", color: accent, flexShrink: 0,
          }}>
            {MOOD_ICONS[plan.mood] ?? "♥"}
          </div>
        </div>

        {/* Meta row */}
        <div style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
          {plan.plan_date && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>When</span>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", color: "#2c1f22", marginTop: "0.1rem" }}>
                {new Date(plan.plan_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                {plan.plan_time && ` · ${plan.plan_time}`}
              </span>
            </div>
          )}
          {plan.place && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>Where</span>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", color: "#2c1f22", marginTop: "0.1rem" }}>{plan.place}</span>
            </div>
          )}
          {plan.budget && (
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "0.6rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8" }}>Budget</span>
              <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.95rem", color: "#2c1f22", marginTop: "0.1rem" }}>{plan.budget}</span>
            </div>
          )}
        </div>
      </div>

      {/* Dashed divider */}
      <div style={{ borderTop: `1px dashed ${accent}44`, margin: "0 2rem" }} />

      {/* Body */}
      <div style={{ padding: "1.5rem 2rem" }}>
        {plan.activity && (
          <p style={{ fontFamily: "var(--font-sans)", fontSize: "0.88rem", color: "#4a3035", lineHeight: 1.7, marginBottom: "1rem" }}>
            {plan.activity}
          </p>
        )}

        {plan.notes && (
          <AnimatePresence>
            {(!expanded && plan.notes.length > 200) ? (
              <p style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#4a3035", lineHeight: 1.7, fontStyle: "italic" }}>
                &ldquo;{plan.notes.slice(0, 200)}…&rdquo;
                <button onClick={() => setExpanded(true)} style={{ background: "none", border: "none", cursor: "pointer", color: accent, fontSize: "0.75rem", fontWeight: 600, marginLeft: "0.35rem" }}>
                  Read more
                </button>
              </p>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", color: "#4a3035", lineHeight: 1.7, fontStyle: "italic" }}
              >
                &ldquo;{plan.notes}&rdquo;
              </motion.p>
            )}
          </AnimatePresence>
        )}

        {/* Checklist */}
        {plan.checklist?.length > 0 && (
          <div style={{ marginTop: "1.25rem" }}>
            <span style={{ fontSize: "0.62rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#94a3b8", display: "block", marginBottom: "0.65rem" }}>
              Things to look forward to
            </span>
            {(plan.checklist as string[]).map((item, i) => (
              <motion.div
                key={i}
                style={{ display: "flex", alignItems: "center", gap: "0.65rem", marginBottom: "0.5rem", cursor: "pointer" }}
                onClick={() => toggleCheck(i)}
                whileTap={{ scale: 0.98 }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 5,
                  border: `1.5px solid ${checklistState[i] ? accent : "#d1b7bb"}`,
                  background: checklistState[i] ? accent : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, transition: "all 0.2s",
                }}>
                  {checklistState[i] && <span style={{ color: "#fff", fontSize: "0.65rem", lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{
                  fontSize: "0.83rem", color: checklistState[i] ? "#94a3b8" : "#3b2226",
                  textDecoration: checklistState[i] ? "line-through" : "none",
                  transition: "all 0.2s",
                }}>
                  {item}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer mood tag */}
      <div style={{ padding: "0.75rem 2rem 1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to right, ${accent}44, transparent)` }} />
        <span style={{ fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: accent }}>
          {plan.mood} mood
        </span>
        <div style={{ flex: 1, height: 1, background: `linear-gradient(to left, ${accent}44, transparent)` }} />
      </div>
    </motion.div>
  );
}
