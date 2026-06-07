"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import type { Memory } from "@/lib/types";

interface Props {
  initial: Memory[];
}

export default function MemoryRailSection({ initial }: Props) {
  const [memories, setMemories] = useState<Memory[]>(initial);
  const constraintsRef = useRef<HTMLDivElement>(null);

  // ── Realtime subscription ────────────────────────────────────────
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel("memories_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "memories" },
        async () => {
          // Refetch the full sorted list on any change
          const { data } = await supabase
            .from("memories")
            .select("*")
            .eq("is_published", true)
            .order("display_order");
          if (data) setMemories(data as Memory[]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (memories.length === 0) return null;

  return (
    <section
      aria-label="Our memories"
      className="memory-section"
    >
      {/* Section header */}
      <div
        style={{
          padding: "0 clamp(1.5rem, 6vw, 5rem)",
          marginBottom: "4rem",
          maxWidth: 780,
        }}
      >
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="section-kicker"
        >
          Memories
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="section-title"
        >
          Our story, so far.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="section-subtitle"
        >
          Drag to explore
        </motion.p>
      </div>

      {/* Draggable rail */}
      <div ref={constraintsRef} style={{ overflow: "hidden" }}>
        <motion.div
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          style={{
            display: "flex",
            gap: "1.5rem",
            paddingInline: "clamp(1.5rem, 6vw, 5rem)",
            paddingBottom: "1rem",
            cursor: "grab",
            width: "max-content",
          }}
          whileDrag={{ cursor: "grabbing" }}
        >
          {memories.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="memory-card"
            >
              {/* Date label */}
              <span
                style={{
                  display: "block",
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.6rem",
                  fontWeight: 600,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  color: "var(--gold)",
                  marginBottom: "1.2rem",
                }}
              >
                {m.date_label}
              </span>

              {/* Title */}
              <h3
                style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.3rem",
                  fontWeight: 400,
                  color: "var(--ink)",
                  marginBottom: "0.75rem",
                  lineHeight: 1.2,
                }}
              >
                {m.title}
              </h3>

              {/* Description */}
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "0.88rem",
                  color: "var(--ink-light)",
                  lineHeight: 1.7,
                }}
              >
                {m.description}
              </p>

              {/* Decorative bottom line */}
              <div
                aria-hidden="true"
                style={{
                  marginTop: "1.5rem",
                  height: 1,
                  background:
                    "linear-gradient(90deg, var(--gold-faint), transparent)",
                }}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
