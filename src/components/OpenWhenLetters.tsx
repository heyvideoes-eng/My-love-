"use client";

import { useState } from "react";
import { Mail, MailOpen, AlertCircle, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LETTERS = [
  {
    id: "tired",
    title: "Open when tired",
    icon: Mail,
    salutation: "Dearest Vanshika,",
    body: [
      "I know you give your absolute best to everything you do, but please remember that it is okay to rest. The world's chaos will still be there tomorrow.",
      "Close your eyes, breathe, and put your worries aside. You've done more than enough today. I am so proud of how hard you try, but I love seeing you relaxed and happy even more.",
      "Sleep peacefully tonight. I'm holding you close in my thoughts."
    ]
  },
  {
    id: "overthinking",
    title: "Open when overthinking",
    icon: Mail,
    salutation: "My Dear Vanshika,",
    body: [
      "Breathe in. Breathe out. Your mind is running in circles right now, constructing worries that aren't real.",
      "You are stronger than you think, and things have a way of sorting themselves out. Let go of the need to control every outcome. You are safe, you are cared for, and you are never alone in this.",
      "Whatever it is, we will figure it out together. Just take it one quiet step at a time."
    ]
  },
  {
    id: "happy",
    title: "Open when happy",
    icon: Mail,
    salutation: "Vanshika,",
    body: [
      "I love seeing you smile. When you are happy, your entire spirit glows, and it makes my world feel infinitely brighter.",
      "Capture this feeling. Remember it, hold onto it, and let it carry you through the busier days. I hope you are celebrating whatever little victory occurred today.",
      "Keep shining, my favourite person."
    ]
  },
  {
    id: "missing",
    title: "Open when missing me",
    icon: Mail,
    salutation: "Hey Vanshika,",
    body: [
      "If you are reading this, I am probably thinking about you too. In fact, I statistically almost always am.",
      "Close your eyes and remember the calm of our walks, the sound of our conversations, and the warmth of simply being side by side. Distance doesn't change how much you mean to me.",
      "I am only a message away. Reach out whenever you're ready. I'm right here."
    ]
  }
];

export default function OpenWhenLetters() {
  const [activeLetter, setActiveLetter] = useState<typeof LETTERS[0] | null>(null);

  return (
    <div id="letters" className="relative z-10">
      <div className="max-w-4xl mx-auto">
        
        <div className="text-center mb-16">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-2 text-foreground">
            Open When...
          </h2>
          <p className="text-xs uppercase tracking-[0.15em] text-accent-rose-dark font-bold">
            Select a letter for when you need it most
          </p>
        </div>

        {/* Letters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {LETTERS.map(letter => {
            const Icon = activeLetter?.id === letter.id ? MailOpen : Mail;
            return (
              <button
                key={letter.id}
                onClick={() => setActiveLetter(letter)}
                className="group relative bg-background/45 backdrop-blur-xl border border-foreground/10 p-6 rounded-2xl flex flex-col items-center justify-between text-center transition-all duration-300 hover:border-accent-rose hover:scale-[1.03] hover:shadow-lg hover:shadow-accent-rose/5"
              >
                <div className="w-12 h-12 rounded-full bg-accent-rose/10 flex items-center justify-center mb-4 transition-transform group-hover:scale-110">
                  <Icon className="w-5 h-5 text-accent-rose-dark" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-foreground/80 group-hover:text-foreground">
                  {letter.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Full-Screen Letter View Modal */}
        <AnimatePresence>
          {activeLetter && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
              {/* Blur backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setActiveLetter(null)}
                className="absolute inset-0 bg-background/50 backdrop-blur-md"
              />

              {/* Envelope Letter Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-xl bg-white text-zinc-900 rounded-3xl shadow-2xl p-8 md:p-12 z-10 border border-zinc-100 flex flex-col justify-between overflow-hidden"
              >
                {/* Envelope lining accent */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-accent-rose to-accent-gold"></div>

                <div>
                  {/* Letter Header */}
                  <div className="flex justify-between items-start pb-6 border-b border-zinc-100 mb-6">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-accent-rose-dark">
                        Private Letter
                      </span>
                      <h4 className="font-serif text-2xl font-bold italic text-zinc-900 mt-1">
                        {activeLetter.salutation}
                      </h4>
                    </div>
                    <button
                      onClick={() => setActiveLetter(null)}
                      className="text-xs uppercase font-bold tracking-widest hover:opacity-60 text-zinc-400"
                    >
                      Close
                    </button>
                  </div>

                  {/* Letter Body */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 text-zinc-700 leading-relaxed font-sans text-sm md:text-base">
                    {activeLetter.body.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                </div>

                {/* Letter Footer */}
                <div className="border-t border-zinc-100 pt-6 mt-8 flex justify-between items-end">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                      Written with warmth
                    </span>
                    <span className="font-serif text-2xl font-bold italic text-accent-rose-dark">
                      Rishi
                    </span>
                  </div>
                  <Heart className="w-5 h-5 text-accent-rose-dark fill-current animate-pulse" />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
