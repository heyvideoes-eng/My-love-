"use client";

import { useEffect, useState } from "react";
import { Heart, RefreshCw, Bookmark, Trash2, Quote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DailyMessage() {
  const [message, setMessage] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFavDrawer, setShowFavDrawer] = useState(false);

  const fetchNote = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/daily-message", { cache: "no-store" });
      const data = await res.json();
      setMessage(data.message);
      setIsGenerated(!!data.isGeneratedByAI);
    } catch (e) {
      console.error(e);
      setMessage("I hope your day feels warm and calm, Vanshika. I'm always thinking of you. - Rishi");
      setIsGenerated(false);
    } finally {
      setTimeout(() => setLoading(false), 600); // smooth transition delay
    }
  };

  useEffect(() => {
    fetchNote();
    // Load favorites from local storage
    const stored = localStorage.getItem("vanshika_fav_notes");
    if (stored) {
      try {
        setFavorites(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleToggleFavorite = () => {
    if (!message) return;
    let updated;
    if (favorites.includes(message)) {
      updated = favorites.filter(f => f !== message);
    } else {
      updated = [...favorites, message];
    }
    setFavorites(updated);
    localStorage.setItem("vanshika_fav_notes", JSON.stringify(updated));
  };

  const handleRemoveFavorite = (msg: string) => {
    const updated = favorites.filter(f => f !== msg);
    setFavorites(updated);
    localStorage.setItem("vanshika_fav_notes", JSON.stringify(updated));
  };

  const isFavorited = favorites.includes(message);

  return (
    <section id="daily-note" className="py-24 relative z-10 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="font-serif text-3xl md:text-4xl font-bold mb-2 text-foreground"
          >
            Today&apos;s Daily Note
          </motion.h2>
          <p className="text-xs uppercase tracking-[0.15em] text-accent-rose-dark font-bold">
            A small reminder just for you
          </p>
        </div>

        {/* Note Card */}
        <div className="relative bg-background/45 backdrop-blur-xl border border-foreground/10 p-8 md:p-12 rounded-3xl shadow-xl overflow-hidden min-h-[260px] flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-accent-rose/[0.04] to-transparent pointer-events-none"></div>
          
          <div className="quote-marks select-none absolute top-4 left-6 text-7xl font-serif text-accent-rose/25 leading-none">“</div>
          
          <div className="w-full flex-1 flex flex-col justify-center py-6">
            <AnimatePresence mode="wait">
              {loading ? (
                <motion.div 
                  key="shimmer"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-3.5 items-center w-full"
                >
                  <div className="h-4 bg-foreground/10 rounded-full w-[85%] animate-pulse"></div>
                  <div className="h-4 bg-foreground/10 rounded-full w-[65%] animate-pulse"></div>
                </motion.div>
              ) : (
                <motion.p 
                  key="content"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5 }}
                  className="font-serif text-xl md:text-2xl font-medium italic text-foreground text-center relative z-10 leading-relaxed"
                >
                  {message}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Action Row */}
          <div className="border-t border-foreground/[0.07] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
            <div className="flex items-center gap-3">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                isGenerated ? "bg-accent-rose/15 text-accent-rose-dark" : "bg-accent-gold/15 text-accent-gold"
              }`}>
                {isGenerated ? "AI Generated" : "Warm Reminder"}
              </span>
              <span className="text-xs text-foreground/45">By Rishi</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Favorites Drawer Toggle */}
              {favorites.length > 0 && (
                <button
                  onClick={() => setShowFavDrawer(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-foreground/[0.03] border border-foreground/[0.07] text-xs font-semibold text-foreground/60 hover:bg-foreground/[0.08]"
                >
                  <Bookmark className="w-3.5 h-3.5 text-accent-gold" />
                  <span>Favs ({favorites.length})</span>
                </button>
              )}

              {/* Toggle Favorite */}
              <button
                onClick={handleToggleFavorite}
                disabled={loading}
                className={`p-2 rounded-full border transition-all ${
                  isFavorited 
                    ? "bg-accent-rose/20 border-accent-rose text-accent-rose-dark scale-105" 
                    : "bg-foreground/[0.03] border-foreground/[0.07] text-foreground/60 hover:bg-foreground/[0.08]"
                }`}
                title={isFavorited ? "Remove from Favorites" : "Add to Favorites"}
              >
                <Heart className={`w-4 h-4 ${isFavorited ? "fill-current" : ""}`} />
              </button>

              {/* Refresh Note */}
              <button
                onClick={fetchNote}
                disabled={loading}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-foreground/[0.07] bg-foreground/[0.03] text-xs font-semibold text-foreground/75 hover:bg-foreground/[0.08] transition-all"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                <span>New Note</span>
              </button>
            </div>
          </div>
        </div>

        {/* Favorites Slide-Out Drawer Overlay */}
        <AnimatePresence>
          {showFavDrawer && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFavDrawer(false)}
                className="absolute inset-0 bg-background/40 backdrop-blur-sm"
              />
              
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md h-full bg-background border-l border-border shadow-2xl p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center pb-4 border-b border-border">
                    <h3 className="font-serif text-2xl font-bold flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-accent-gold" />
                      Saved Notes
                    </h3>
                    <button 
                      onClick={() => setShowFavDrawer(false)}
                      className="text-xs uppercase font-bold tracking-wider hover:opacity-60 text-foreground/60"
                    >
                      Close
                    </button>
                  </div>
                  
                  <div className="overflow-y-auto max-h-[calc(100vh-140px)] py-4 flex flex-col gap-4">
                    {favorites.map((fav, i) => (
                      <div key={i} className="group relative bg-foreground/[0.02] border border-foreground/[0.05] p-4 rounded-2xl flex items-start gap-3 hover:bg-foreground/[0.04] transition-all">
                        <Quote className="w-4 h-4 text-accent-rose-dark/30 shrink-0 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-serif italic text-foreground/80 leading-relaxed mb-2 pr-6">{fav}</p>
                          <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-bold">Saved Note</span>
                        </div>
                        <button
                          onClick={() => handleRemoveFavorite(fav)}
                          className="absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-500/10 hover:text-red-500 transition-all"
                          title="Delete Note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-border pt-4 text-center text-[10px] text-foreground/40 font-semibold uppercase tracking-wider">
                  Vanshika&apos;s Private Library
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </section>
  );
}
