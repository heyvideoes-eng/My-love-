"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const NOTE_TEXTS = [
  "Sleep early today.",
  "Don't skip meals.",
  "Still thinking of your laugh.",
  "Drink some water.",
  "You are doing so well.",
  "Just a quiet reminder: you matter."
];

interface Note {
  id: number;
  text: string;
  x: number;
  y: number;
  delay: number;
  duration: number;
}

export default function FloatingNotes() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    // Generate notes with randomized positions on client mount
    const generated = NOTE_TEXTS.map((text, idx) => ({
      id: idx,
      text,
      // Random coordinates in viewport percentage
      x: Math.random() * 65 + 15,
      y: Math.random() * 70 + 15,
      delay: Math.random() * 5,
      duration: Math.random() * 6 + 12
    }));
    setNotes(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[2]">
      {notes.map(note => (
        <motion.div
          key={note.id}
          style={{
            left: `${note.x}%`,
            top: `${note.y}%`
          }}
          animate={{
            y: [0, -25, 0],
            x: [0, 15, 0],
            rotate: [0, 4, -4, 0]
          }}
          transition={{
            duration: note.duration,
            repeat: Infinity,
            delay: note.delay,
            ease: "easeInOut"
          }}
          className="absolute hidden md:block bg-background/35 backdrop-blur-md border border-foreground/[0.06] px-3.5 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider text-foreground/45 shadow-sm select-none"
        >
          {note.text}
        </motion.div>
      ))}
    </div>
  );
}
