"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  targetDate: string | null;
  label: string;
}

function getDaysUntil(target: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(target);
  end.setHours(0, 0, 0, 0);
  const diff = end.getTime() - today.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function CountdownBanner({ targetDate, label }: Props) {
  const [days, setDays] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (targetDate) {
      setDays(getDaysUntil(targetDate));
      const interval = setInterval(() => {
        setDays(getDaysUntil(targetDate));
      }, 60_000);
      return () => clearInterval(interval);
    }
  }, [targetDate]);

  if (!targetDate || !mounted || days === null) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "1.25rem",
          padding: "0.75rem 2rem",
          background: "linear-gradient(90deg, rgba(201,123,132,0.08) 0%, rgba(232,197,154,0.08) 50%, rgba(201,123,132,0.08) 100%)",
          borderTop: "1px solid rgba(201,123,132,0.15)",
          borderBottom: "1px solid rgba(201,123,132,0.15)",
        }}
      >
        {/* Glow orbs */}
        <div style={{ position: "absolute", left: "15%", top: 0, width: 80, height: "100%", background: "radial-gradient(ellipse, rgba(201,123,132,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: "15%", top: 0, width: 80, height: "100%", background: "radial-gradient(ellipse, rgba(232,197,154,0.15) 0%, transparent 70%)", pointerEvents: "none" }} />

        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{ color: "var(--rose)", fontSize: "0.9rem" }}
        >
          ♥
        </motion.span>

        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          <motion.span
            key={days}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "1.6rem",
              fontWeight: 500,
              color: "var(--rose)",
              letterSpacing: "-0.02em",
            }}
          >
            {days === 0 ? "Today" : days}
          </motion.span>
          {days > 0 && (
            <span style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.72rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--muted-mauve)",
            }}>
              {days === 1 ? "day" : "days"}
            </span>
          )}
        </div>

        <span style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.78rem",
          color: "var(--muted-mauve)",
          letterSpacing: "0.04em",
        }}>
          {days === 0 ? "✦ Today is the day ✦" : label}
        </span>

        <motion.span
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          style={{ color: "var(--rose-gold)", fontSize: "0.9rem" }}
        >
          ✦
        </motion.span>
      </motion.div>
    </AnimatePresence>
  );
}
