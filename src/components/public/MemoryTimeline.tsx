"use client";

import { motion } from "framer-motion";
import { Heart, Calendar, Sparkles } from "lucide-react";
import { useRealtimeData } from "@/hooks/useRealtimeData";

interface Milestone {
  id: number;
  title: string;
  date: string;
  description: string;
  kicker: string;
}

const MILESTONES: Milestone[] = [
  {
    id: 1,
    title: "How We Met",
    date: "March 14, 2025",
    kicker: "The Spark",
    description: "A simple hello that blossomed into hours of effortless conversation, leaving us both with a sense that something extraordinary had just begun."
  },
  {
    id: 2,
    title: "Our First Walk",
    date: "April 22, 2025",
    kicker: "The Beginning",
    description: "Strolling through quiet trails, matching steps, and discovering that the silence between our words felt just as warm and comfortable as the talk itself."
  },
  {
    id: 3,
    title: "Late Night Conversations",
    date: "May 30, 2025",
    kicker: "Deep Nights",
    description: "When the rest of the world fell silent, we built our own quiet sanctuary through voice notes and messages, sharing dreams we had never spoken aloud."
  },
  {
    id: 4,
    title: "Spontaneous Laughter",
    date: "June 28, 2025",
    kicker: "Sweet Moments",
    description: "A completely random inside joke that erupted into uncontrollable laughter, forever etching the sound of your joy into the archives of my mind."
  },
  {
    id: 5,
    title: "Everyday Magic",
    date: "October 12, 2025",
    kicker: "Ordinary Tuesdays",
    description: "Realizing that the ordinary days of doing absolutely nothing special with you are, in fact, the most special and memorable days of all."
  }
];

export default function MemoryTimeline() {
  const { data: timelineData } = useRealtimeData<any>(
    "memory_timeline",
    "created_at",
    true,
    MILESTONES.map(m => ({
      id: String(m.id),
      title: m.title,
      date_string: m.date,
      description: m.description,
      icon_type: m.kicker,
      created_at: new Date().toISOString()
    }))
  );

  return (
    <section id="memories" className="py-20 relative border-t border-white/5">
      {/* Background glow */}
      <div className="absolute top-1/2 left-10 w-[300px] h-[300px] bg-[#c97b84]/5 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Title */}
        <div className="text-center mb-16">
          <span className="text-fluid-base font-bold uppercase tracking-[0.25em] text-[#c97b84] block mb-2">
            The Journey
          </span>
          <h2 className="font-serif text-fluid-4xl md:text-fluid-5xl text-[#fdfaf6] font-normal">
            Our Memory Timeline
          </h2>
          <p className="text-fluid-lg text-[#8a7679] mt-3">
            A chronological anthology of milestones we've built, capturing the growth of our story together.
          </p>
        </div>

        {/* Timeline Path */}
        <div className="relative">
          {/* Vertical line indicator */}
          <div className="absolute left-4 md:left-1/2 top-4 bottom-4 w-[1px] bg-gradient-to-b from-[rgba(232,197,154,0.3)] via-[rgba(201,123,132,0.3)] to-transparent border-dashed border-t-0 border-b-0 border-l border-white/10 -translate-x-1/2" />

          {/* Milestones list */}
          <div className="flex flex-col gap-12">
            {timelineData.map((m, idx) => {
              const isEven = idx % 2 === 0;

              return (
                <div
                  key={m.id}
                  className={`flex flex-col md:flex-row items-stretch relative ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  
                  {/* Timeline node point */}
                  <div className="absolute left-4 md:left-1/2 top-7 w-5 h-5 rounded-full bg-[#160e10] border-2 border-[#e8c59a] -translate-x-1/2 flex items-center justify-center shadow-lg z-10">
                    <Heart className="w-2 h-2 text-[#c97b84] fill-current animate-pulse" />
                  </div>

                  {/* Card Panel */}
                  <div className={`w-full md:w-[46%] pl-10 md:pl-0 ${
                    isEven ? "md:text-right md:pr-10" : "md:pl-10"
                  }`}>
                    <motion.div
                      initial={{ opacity: 0, x: isEven ? 25 : -25, y: 15 }}
                      whileInView={{ opacity: 1, x: 0, y: 0 }}
                      viewport={{ once: true, margin: "-100px" }}
                      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as const }}
                      className="glass-panel p-6 md:p-8 hover:glass-panel-active hover:scale-[1.01]"
                    >
                      {/* Meta header */}
                      <div className={`flex items-center gap-2 mb-3 text-fluid-xs font-bold uppercase tracking-widest text-[#e8c59a] ${
                        isEven ? "md:justify-end" : ""
                      }`}>
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{m.date_string || m.date}</span>
                        <span className="opacity-30">•</span>
                        <span>{m.icon_type || m.kicker || 'Memory'}</span>
                      </div>

                      {/* Title */}
                      <h4 className="font-serif text-fluid-3xl text-[#fdfaf6] font-normal mb-3">
                        {m.title}
                      </h4>

                      {/* Description */}
                      <p className="text-fluid-base text-[#8a7679] leading-relaxed font-medium">
                        {m.description}
                      </p>

                      {/* Footer Badge counter */}
                      <div className={`flex items-center gap-1.5 mt-5 text-fluid-3xs font-bold uppercase tracking-[0.2em] text-[#8a7679]/40 ${
                        isEven ? "md:justify-end" : ""
                      }`}>
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Milestone 0{idx + 1}</span>
                      </div>
                    </motion.div>
                  </div>

                  {/* Spacer for desktop layout alignment */}
                  <div className="hidden md:block w-[8%]" />
                  <div className="hidden md:block w-[46%]" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
export { MILESTONES };
