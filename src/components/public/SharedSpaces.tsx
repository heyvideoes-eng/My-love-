"use client";

import { motion } from "framer-motion";
import LoveJar from "./LoveJar";
import VinylPlayer from "./VinylPlayer";
import OpenWhenLetters from "../OpenWhenLetters";

export default function SharedSpaces() {
  return (
    <section
      aria-label="Shared spaces and letters"
      className="section border-t border-b border-accent-rose/10"
      style={{
        paddingBlock: "clamp(6rem, 12vw, 10rem)",
        backgroundColor: "var(--parchment)",
        position: "relative",
      }}
    >
      {/* Background soft glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-rose/[0.01] to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16 max-w-xl mx-auto">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="section-kicker"
          >
            Interactive Space
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="section-title spaced"
          >
            Little reminders of us.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="section-subtitle"
          >
            Shared music, sweet notes, and letters
          </motion.p>
        </div>

        {/* Top Grid: Playlist & Love Jar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 items-start mb-24">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <VinylPlayer />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="w-full"
          >
            <LoveJar />
          </motion.div>
        </div>

        {/* Bottom Area: Open When Letters */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="border-t border-accent-rose/10 pt-16"
        >
          <OpenWhenLetters />
        </motion.div>

      </div>
    </section>
  );
}
