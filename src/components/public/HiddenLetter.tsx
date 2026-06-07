"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HiddenLetter() {
  const [revealed, setRevealed] = useState(false);

  return (
    <section
      aria-label="Hidden message"
      className="reveal-section section"
    >
      <div style={{ maxWidth: 560, margin: "0 auto" }}>
        {/* Label */}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="section-kicker muted kicker-loose"
        >
          One last thing
        </motion.span>

        {/* Seal */}
        <AnimatePresence mode="wait">
          {!revealed ? (
            <motion.button
              key="seal"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.5 }}
              onClick={() => setRevealed(true)}
              aria-label="Open the hidden message"
              id="reveal-seal-btn"
              style={{
                display: "inline-flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "1rem",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
            >
              {/* Seal ring */}
              <motion.div
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: "50%",
                  border: "1.5px solid var(--gold-faint)",
                  background: "var(--ivory)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  transition: "border-color 0.3s, box-shadow 0.3s",
                }}
                whileHover={{
                  borderColor: "var(--rose)",
                  boxShadow: "0 8px 36px rgba(201, 123, 132, 0.18)",
                }}
              >
                {/* Inner ring */}
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 8,
                    borderRadius: "50%",
                    border: "1px solid var(--blush)",
                    pointerEvents: "none",
                  }}
                />
                {/* Glyph */}
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontSize: "1.6rem",
                    color: "var(--rose)",
                    fontStyle: "italic",
                    lineHeight: 1,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  V
                </span>
              </motion.div>

              <span
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.65rem",
                  color: "var(--ink-faint)",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                Open this note
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0",
              }}
            >
              {/* Small rose ornament */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.8rem",
                  color: "var(--rose)",
                  marginBottom: "1.5rem",
                  lineHeight: 1,
                }}
                aria-hidden="true"
              >
                ♡
              </motion.div>

              <p
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "clamp(1.6rem, 4vw, 2.4rem)",
                  fontWeight: 400,
                  color: "var(--ink)",
                  lineHeight: 1.45,
                  maxWidth: "22ch",
                  margin: "0 auto",
                }}
              >
                You are loved —{" "}
                <em style={{ fontStyle: "italic", color: "var(--rose-deep)" }}>
                  deeply, sincerely,
                </em>{" "}
                and on every ordinary Tuesday too.
              </p>

              <p
                style={{
                  marginTop: "2rem",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.65rem",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "var(--ink-faint)",
                }}
              >
                Always, Rishi
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
