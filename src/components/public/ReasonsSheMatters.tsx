"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";

interface Reason {
  id: number;
  title: string;
  description: string;
}

const REASONS: Reason[] = [
  {
    id: 1,
    title: "Your Infinite Empathy",
    description: "The way you hold space for other people, always listening, always understanding. You bring an effortless comfort to everyone around you, seeing the world with gentle eyes."
  },
  {
    id: 2,
    title: "Your Quiet Resilience",
    description: "You navigate life's challenges with a soft, steady strength that leaves me in absolute awe. You don't feel the need to prove anything to the world, you just quietly rise."
  },
  {
    id: 3,
    title: "The Sound of Your Laughter",
    description: "A spontaneous, honest burst of pure joy that instantly shifts the energy of any room. It is, and always will be, the sweetest and most comforting music to my ears."
  },
  {
    id: 4,
    title: "Your Playful Heart",
    description: "How you find wonder in the simplest everyday occurrences — an interesting book, a good cup of coffee, or a rainy afternoon, turning mundane seconds into lasting memories."
  },
  {
    id: 5,
    title: "The Comfort of Your Presence",
    description: "Just sitting next to you in absolute silence feels more complete and peaceful than a thousand conversations with anyone else. With you, I am entirely, quietly home."
  }
];

export default function ReasonsSheMatters() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.18,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1] as const,
      },
    },
  };

  return (
    <section id="reasons" className="py-24 relative border-t border-white/5 bg-[rgba(26,12,16,0.15)]">
      {/* Background glow orb */}
      <div className="absolute bottom-10 right-10 w-[250px] h-[250px] bg-[#e8c59a]/3 rounded-full filter blur-[100px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-20">
          <span className="text-fluid-base font-bold uppercase tracking-[0.25em] text-[#c97b84] block mb-2">
            Sanctuary
          </span>
          <h2 className="font-serif text-fluid-4xl md:text-fluid-5xl text-[#fdfaf6] font-normal">
            Why You Matter to Me
          </h2>
          <p className="text-fluid-lg text-[#8a7679] mt-3">
            A small, sincere anthology of the qualities and moments that make you who you are, and why you hold my entire heart.
          </p>
        </div>

        {/* Reasons List Container */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-6"
        >
          {REASONS.map((item, idx) => (
            <motion.div
              variants={itemVariants}
              key={item.id}
              className="glass-panel p-6 md:p-8 flex flex-col md:flex-row items-baseline gap-4 md:gap-8 group hover:glass-panel-active hover:translate-x-1"
            >
              {/* Number Kicker */}
              <div className="font-serif text-fluid-4xl md:text-fluid-5xl text-[#c97b84]/50 group-hover:text-[#c97b84] font-light italic transition-colors leading-none">
                0{item.id}
              </div>

              {/* Text Area */}
              <div className="flex flex-col gap-2">
                <h4 className="font-serif text-fluid-2xl md:text-fluid-3xl text-[#fdfaf6] font-normal leading-snug">
                  {item.title}
                </h4>
                
                <p className="text-fluid-base md:text-fluid-lg text-[#8a7679] leading-relaxed font-medium">
                  {item.description}
                </p>
              </div>

              {/* Heart ornament on hover */}
              <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300 ml-auto self-center">
                <Heart className="w-4 h-4 text-[#c97b84] fill-current animate-pulse" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Closing emotional prompt */}
        <div className="mt-16 flex flex-col items-center text-center gap-3">
          <div className="w-10 h-[1px] bg-[#e8c59a]/30" />
          <p className="font-serif text-fluid-2xl text-[#e5b0b6] italic font-light">
            “And after all of it, the list is still just beginning.”
          </p>
        </div>

      </div>
    </section>
  );
}
export { REASONS };
