"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { Heart, Calendar } from "lucide-react";

const MEMORIES = [
  {
    id: 1,
    title: "How We Met",
    date: "The Spark",
    desc: "A simple conversation that turned into hours of shared laughter and instant connection."
  },
  {
    id: 2,
    title: "Our First Date",
    date: "The Connection",
    desc: "Quiet afternoon walks and warm conversations, where time felt like it stood completely still."
  },
  {
    id: 3,
    title: "The Late Conversations",
    date: "Deep Nights",
    desc: "When the rest of the world slept, and we built our own calm universe through words."
  },
  {
    id: 4,
    title: "Coffee & Mornings",
    date: "Simple Comfort",
    desc: "Cherishing the early walks and warm cups, where we found our rhythm together."
  },
  {
    id: 5,
    title: "That Random Laugh",
    date: "Sweet Moments",
    desc: "A completely spontaneous joke that reminded me how beautiful your smile sounds."
  }
];

export default function MemoryTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <section id="timeline" className="py-24 overflow-hidden relative z-10 px-6">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-foreground">
            Our Story Rail
          </h2>
          <p className="text-xs uppercase tracking-[0.15em] text-accent-rose-dark font-bold">
            Drag horizontally to explore our milestones
          </p>
        </div>

        {/* Draggable Rail Container */}
        <div ref={containerRef} className="cursor-grab active:cursor-grabbing">
          <motion.div 
            drag="x"
            dragConstraints={{ left: -600, right: 0 }}
            className="flex gap-6 w-max px-4 py-8"
          >
            {MEMORIES.map(m => (
              <motion.div
                key={m.id}
                whileHover={{ y: -8, scale: 1.02 }}
                className="w-[280px] md:w-[320px] bg-background/45 backdrop-blur-xl border border-foreground/10 p-6 md:p-8 rounded-3xl shadow-lg relative flex flex-col justify-between select-none"
              >
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent-gold/[0.03] to-transparent pointer-events-none rounded-3xl"></div>
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-accent-gold">
                      <Calendar className="w-3 h-3" />
                      {m.date}
                    </span>
                    <Heart className="w-4 h-4 text-accent-rose-dark/30 fill-current" />
                  </div>
                  
                  <h3 className="font-serif text-xl font-bold text-foreground mb-3">
                    {m.title}
                  </h3>
                  
                  <p className="text-sm text-foreground/80 leading-relaxed font-medium">
                    {m.desc}
                  </p>
                </div>
                
                <div className="mt-8 pt-4 border-t border-foreground/[0.07] text-[10px] text-foreground/40 font-semibold uppercase tracking-wider">
                  Milestone 0{m.id}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
