"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mail, X, BookOpen } from "lucide-react";

interface Letter {
  id: number;
  trigger: string;
  emoji: string;
  content: string;
  closing: string;
}

const LETTERS: Letter[] = [
  {
    id: 1,
    trigger: "Open when... you miss me",
    emoji: "🌙",
    content: "Hey beautiful. If you're reading this, it means distance or busy hours are keeping us temporarily apart, but I want you to close your eyes and take a deep breath. My heart never actually leaves your side. Every quiet moment, every night sky I look at, I find myself thinking of you. You are my home, Vanshika. The space between us is just temporary, but what we hold is forever. I am always, always yours.",
    closing: "Close your eyes, I'm right there."
  },
  {
    id: 2,
    trigger: "Open when... you've had a tiring day",
    emoji: "🍵",
    content: "My love, I know today drained your energy and felt heavy. Take off the armor, let your shoulders drop, and put the day behind you. You did enough. You are enough. Wrap yourself in cozy blankets, sip some warm water, and let your mind go quiet. You don't have to carry the weight of the world on your own. Sleep early tonight, let your body rest. I am here, holding you close in my thoughts.",
    closing: "Rest well, my sweet girl."
  },
  {
    id: 3,
    trigger: "Open when... you need a quick smile",
    emoji: "🌻",
    content: "Just in case you forgot today: your laugh is my absolute favorite sound in the world, your smile can light up the darkest of rooms, and you are, without a single doubt, the most remarkable person that has ever walked into my life. If you need a reason to smile right now, let it be the fact that you make me the happiest person alive just by existing. Smile for me, Vanshika — the world is brighter when you do.",
    closing: "You make my heart skip beats."
  },
  {
    id: 4,
    trigger: "Open when... you're feeling excited",
    emoji: "🎉",
    content: "Oh, I love this! I can practically see the glow in your eyes from here. Tell me everything, I want to hear every single detail! Whatever victory, small or huge, has happened — I am standing in the front row cheering for you, as I always will be. Keep shining, my star. You deserve every ounce of success and joy that comes your way. Let's celebrate soon!",
    closing: "Can't wait to celebrate you."
  }
];

export default function LoveLetters() {
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);
  const [isOpenAnimation, setIsOpenAnimation] = useState(false);

  const handleOpenLetter = (letter: Letter) => {
    setSelectedLetter(letter);
    setIsOpenAnimation(true);
  };

  return (
    <section id="love-letters" className="py-20 relative border-t border-white/5">
      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-fluid-base font-bold uppercase tracking-[0.25em] text-[#c97b84] block mb-2">
            Letters
          </span>
          <h2 className="font-serif text-fluid-4xl md:text-fluid-5xl text-[#fdfaf6] font-normal">
            Open When Letters
          </h2>
          <p className="text-fluid-lg text-[#8a7679] mt-3">
            Click on any wax-sealed envelope below. Read these letters whenever you need a reminder of my love, whatever mood you're in.
          </p>
        </div>

        {/* Envelope Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center">
          {LETTERS.map((letter) => (
            <motion.div
              whileHover={{ y: -6 }}
              key={letter.id}
              onClick={() => handleOpenLetter(letter)}
              className="w-full max-w-[220px] min-h-[160px] h-auto bg-[#1c1416] border border-[rgba(232,197,154,0.1)] rounded-xl relative shadow-lg cursor-pointer flex flex-col justify-between p-4 group overflow-hidden"
            >
              {/* Envelope Flap Overlay representation */}
              <div className="absolute top-0 left-0 right-0 h-[60px] bg-gradient-to-b from-white/3 to-transparent border-b border-white/5 origin-top scale-y-95 group-hover:scale-y-100 transition-transform duration-300" />
              
              <div className="text-fluid-3xl mt-4 z-10">{letter.emoji}</div>
              
              <div className="z-10 mt-auto">
                <h4 className="text-fluid-xs uppercase font-bold tracking-widest text-[#e8c59a] group-hover:text-[#fdfaf6] transition-colors mb-1.5">
                  {letter.trigger}
                </h4>
                
                {/* Wax seal simulation */}
                <div className="flex items-center justify-between">
                  <span className="text-fluid-3xs text-[#8a7679] uppercase tracking-wider font-semibold">
                    Wax Seal
                  </span>
                  
                  {/* Wax Seal component */}
                  <div className="wax-seal" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Cinematic Letter Open Overlay */}
      <AnimatePresence>
        {selectedLetter && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedLetter(null)}
              className="absolute inset-0 bg-[#080405]/95 backdrop-blur-sm"
            />

            {/* Letter Modal Sheet */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-xl bg-[#fdfaf6] text-[#2c1f22] rounded-2xl p-8 md:p-10 relative z-10 shadow-2xl paper-grain border border-[#e8c59a]/20"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedLetter(null)}
                className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-black/5 text-[#8a7679] hover:text-[#2c1f22] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Letter Content */}
              <div className="flex flex-col gap-6 select-text pt-4">
                {/* Header */}
                <div className="flex items-center gap-2 text-fluid-xs font-bold uppercase tracking-[0.2em] text-[#a85c65] border-b border-[#2c1f22]/5 pb-4">
                  <BookOpen className="w-4 h-4" />
                  <span>Private Correspondence</span>
                  <span>•</span>
                  <span>{selectedLetter.trigger.split("... ")[1]}</span>
                </div>

                {/* Body Text */}
                <p className="font-serif text-fluid-2xl md:text-fluid-2xl font-normal leading-relaxed text-[#2c1f22]/90 indent-8">
                  {selectedLetter.content}
                </p>

                {/* Closing signature */}
                <div className="border-t border-[#2c1f22]/5 pt-6 mt-4 flex justify-between items-end">
                  <div>
                    <span className="text-fluid-xs text-[#8a7679] uppercase tracking-wider font-bold block mb-1">Closing</span>
                    <p className="font-serif text-fluid-lg italic text-[#a85c65] font-semibold">
                      {selectedLetter.closing}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-fluid-3xs text-[#8a7679] uppercase tracking-widest font-bold block mb-1">With Love,</span>
                    <p className="font-serif text-fluid-2xl font-bold tracking-tight text-[#2c1f22]">
                      Rishi<span className="text-[#a85c65]">.</span>
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
export { LETTERS };
