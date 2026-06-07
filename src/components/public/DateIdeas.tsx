"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Shuffle, Coffee, Compass, Moon, Utensils, Heart } from "lucide-react";

interface DateIdea {
  id: number;
  title: string;
  category: "cozy" | "drive" | "cafe" | "dinner" | "walk";
  description: string;
  dressCode: string;
  budget: string;
  note: string;
}

const DATE_IDEAS: DateIdea[] = [
  {
    id: 1,
    title: "Rustic Pasta & Cozy Blanket Fort",
    category: "cozy",
    description: "Roll out homemade pasta dough, simmer a slow-cooked marinara sauce, and construct a premium blanket fort in the living room with fairy lights for a cozy movie marathon.",
    dressCode: "Comfy Pajamas & Fluffy Socks",
    budget: "Low Budget Cute",
    note: "Pick a movie trilogy we both haven't seen in a while."
  },
  {
    id: 2,
    title: "Acrylic Paint & Prosecco Duel",
    category: "cozy",
    description: "Set up two blank canvases opposite each other. Paint portraits of one another without showing the canvas until the timer rings. Sip on chilled prosecco to boost creativity.",
    dressCode: "Old tees you don't mind getting paint on",
    budget: "Creative & Sweet",
    note: "Abstract interpretations are highly encouraged for laughs!"
  },
  {
    id: 3,
    title: "Midnight Cocoa & Stargazing",
    category: "drive",
    description: "Pack a thermos of thick, homemade hot chocolate, load up a collaborative lo-fi playlist, and drive out past the city lights to a quiet ridge for stargazing.",
    dressCode: "Warm Hoodies & Beanies",
    budget: "Gas & Chocolate",
    note: "Bring the heavy fleece blanket for the car hood."
  },
  {
    id: 4,
    title: "Dawn Patrol & Fresh Croissants",
    category: "drive",
    description: "Set an alarm for 4:30 AM, drive out to the highest sunrise lookout point while the city is dead quiet, watch the golden rays break, and hunt down the first open bakery.",
    dressCode: "Casual Throw-on Layered Wear",
    budget: "Early Morning Fuel",
    note: "The quiet driving conversations during dawn are the best part."
  },
  {
    id: 5,
    title: "Boardgames & Pour-Overs",
    category: "cafe",
    description: "Pack a compact tabletop card game, search for a hidden, quiet alleyway espresso bar, order single-origin pour-overs, and play under soft background jazz.",
    dressCode: "Smart Casual & Oversized Knits",
    budget: "Coffee Shop Prices",
    note: "The loser of the game buys the evening pastry."
  },
  {
    id: 6,
    title: "The Book Blind Date",
    category: "cafe",
    description: "Visit a sprawling multi-story bookstore café. Spend 30 minutes selecting a book you believe the other will absolutely love. Buy them, write a secret dedicatory note on the first page, and read together over warm waffles.",
    dressCode: "Classic Editorial Trench & Denims",
    budget: "A New Book & Waffles",
    note: "No peeking at each other's book choices until checkout!"
  },
  {
    id: 7,
    title: "Candlelight Degustation Menu",
    category: "dinner",
    description: "Dress up in your absolute finest attire, book a corner booth at a dimly-lit fine dining cellar, and enjoy a curated multi-course culinary tasting experience.",
    dressCode: "Formal: Elegant Dress & Suit jacket",
    budget: "Luxury Splurge",
    note: "Order a dessert to share even if we are full."
  },
  {
    id: 8,
    title: "Lakefront Picnic & Shared Headphone Stroll",
    category: "walk",
    description: "Pack a wood-board picnic basket with cheeses, grapes, and crackers. Take a slow walk around a peaceful lake trail, watch the golden hour paint the water, and split a pair of headphones playing our shared songs.",
    dressCode: "Flowy Summer Casuals",
    budget: "Picnic Prep",
    note: "Time the walk so we arrive at the main dock right at sunset."
  }
];

export default function DateIdeas() {
  const [activeTab, setActiveTab] = useState<DateIdea["category"] | "all">("all");
  const [shuffling, setShuffling] = useState(false);
  const [currentIdea, setCurrentIdea] = useState<DateIdea>(DATE_IDEAS[0]);

  // Filter ideas
  const filteredIdeas = activeTab === "all" 
    ? DATE_IDEAS 
    : DATE_IDEAS.filter(idea => idea.category === activeTab);

  // Shuffle handler with 3D card-flip animation
  const handleShuffle = () => {
    if (shuffling) return;
    setShuffling(true);

    // Filter potential new ideas (exclude the current one to ensure change)
    const candidates = filteredIdeas.filter(idea => idea.id !== currentIdea.id);
    const sourcePool = candidates.length > 0 ? candidates : filteredIdeas;
    const randomIndex = Math.floor(Math.random() * sourcePool.length);
    const chosenIdea = sourcePool[randomIndex];

    setTimeout(() => {
      setCurrentIdea(chosenIdea);
      setShuffling(false);
    }, 350); // Mid-way through flip animation
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case "cozy": return <Coffee className="w-4 h-4" />;
      case "drive": return <Moon className="w-4 h-4" />;
      case "cafe": return <Coffee className="w-4 h-4" style={{ transform: "rotate(10deg)" }} />;
      case "dinner": return <Utensils className="w-4 h-4" />;
      default: return <Compass className="w-4 h-4" />;
    }
  };

  return (
    <section id="date-ideas" className="py-20 relative border-t border-white/5">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <span className="text-fluid-base font-bold uppercase tracking-[0.25em] text-[#c97b84] block mb-2">
            Inspiration
          </span>
          <h2 className="font-serif text-fluid-4xl md:text-fluid-5xl text-[#fdfaf6] font-normal">
            Spontaneous Date Ideas
          </h2>
          <p className="text-fluid-lg text-[#8a7679] mt-3">
            Stuck on what to do next? Choose a vibe and shuffle the deck to generate a personalized date recommendation.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {[
            { id: "all", label: "✨ All Vibes" },
            { id: "cozy", label: "☕ Cozy Indoor" },
            { id: "drive", label: "🚗 Long Drive" },
            { id: "cafe", label: "🥞 Café Hop" },
            { id: "dinner", label: "🥂 Luxury Dinner" },
            { id: "walk", label: "🌅 Sunset Walk" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                // Immediately select first idea in that category
                const pool = tab.id === "all" 
                  ? DATE_IDEAS 
                  : DATE_IDEAS.filter(idea => idea.category === tab.id);
                setCurrentIdea(pool[0]);
              }}
              className={`px-4 py-2 rounded-full text-fluid-xs font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-[rgba(232,197,154,0.15)] border-[#e8c59a] text-[#e8c59a] scale-105"
                  : "bg-white/5 border-white/10 text-[#8a7679] hover:text-[#fdfaf6] hover:bg-white/10"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Deck Card Display Area */}
        <div className="flex flex-col items-center gap-8">
          
          {/* 3D Flip Anim Container */}
          <div className="perspective-[1000px] w-full max-w-md min-h-[300px] aspect-[4/3] md:aspect-auto md:h-[300px]">
            <motion.div
              animate={{ rotateY: shuffling ? 180 : 0 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
              className="w-full h-full relative preserve-3d"
            >
              
              {/* Front Face: Date Details */}
              <div className="absolute inset-0 w-full h-full backface-hidden glass-panel p-8 flex flex-col justify-between overflow-hidden">
                {/* Glowing border line */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#c97b84] to-transparent" />
                
                <div>
                  {/* Category icon and title */}
                  <div className="flex items-center gap-2 text-fluid-xs font-bold uppercase tracking-widest text-[#e8c59a] mb-4">
                    {getCategoryIcon(currentIdea.category)}
                    <span>{currentIdea.category} Option</span>
                  </div>

                  <h3 className="font-serif text-fluid-3xl md:text-fluid-4xl text-[#fdfaf6] font-normal leading-snug mb-3">
                    {currentIdea.title}
                  </h3>

                  <p className="text-fluid-base text-[#8a7679] leading-relaxed font-medium">
                    {currentIdea.description}
                  </p>
                </div>

                {/* Meta details footer */}
                <div className="border-t border-white/5 pt-4 flex flex-col gap-1.5 mt-auto">
                  <div className="flex justify-between items-center text-fluid-xs">
                    <span className="text-[#8a7679] font-bold uppercase tracking-widest">Dress Suggestion</span>
                    <span className="text-[#fdfaf6] font-semibold">{currentIdea.dressCode}</span>
                  </div>
                  <div className="flex justify-between items-center text-fluid-xs">
                    <span className="text-[#8a7679] font-bold uppercase tracking-widest">Budget Vibe</span>
                    <span className="text-[#e8c59a] font-semibold">{currentIdea.budget}</span>
                  </div>
                  {currentIdea.note && (
                    <div className="text-fluid-2xs text-[#c97b84] italic mt-1 font-medium">
                      Note: {currentIdea.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Back Face: Card Shuffling State */}
              <div className="absolute inset-0 w-full h-full backface-hidden [transform:rotateY(180deg)] glass-panel p-8 flex items-center justify-center bg-gradient-to-br from-[#1c0d10] to-[#0d0708]">
                <div className="flex flex-col items-center gap-3">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                    className="w-10 h-10 rounded-full border-2 border-t-[#e8c59a] border-r-transparent border-b-transparent border-l-transparent"
                  />
                  <span className="text-fluid-xs uppercase font-bold tracking-widest text-[#8a7679]">
                    Shuffling Vibes...
                  </span>
                </div>
              </div>

            </motion.div>
          </div>

          {/* Action Button */}
          <button
            onClick={handleShuffle}
            disabled={shuffling}
            className="btn-rose-gold cursor-pointer"
          >
            <Shuffle className="w-4 h-4" />
            <span>Shuffle Vibe Idea</span>
          </button>
        </div>
      </div>
    </section>
  );
}
export { DATE_IDEAS };
