"use client";

import { useState, useEffect, useRef } from "react";
import { Moon, Sun, CloudRain, Coffee, Sparkles, Volume2, VolumeX, Music, Heart, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NavigationProps {
  theme: string;
  setTheme: (theme: string) => void;
  visitStreak: number;
  onResetIntro?: () => void;
  onOpenAdmin?: () => void;
}

const SOUNDS = [
  { id: "piano", name: "Soft Melodies", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" },
  { id: "rain", name: "Rainy Vibe", url: "https://assets.mixkit.co/active_storage/sfx/2433/2433-84.wav" },
  { id: "vinyl", name: "Vinyl Crackle", url: "https://assets.mixkit.co/active_storage/sfx/123/123-84.wav" }
];

export default function Navigation({ theme, setTheme, visitStreak, onResetIntro, onOpenAdmin }: NavigationProps) {
  const [soundActive, setSoundActive] = useState(false);
  const [selectedSound, setSelectedSound] = useState("piano");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Monitor scroll to add shadow/border line
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleToggleSound = () => {
    if (!audioRef.current) return;
    if (soundActive) {
      audioRef.current.pause();
      setSoundActive(false);
    } else {
      audioRef.current.play().catch(e => console.log("Sound play blocked:", e));
      setSoundActive(true);
    }
  };

  const handleSelectSound = (soundId: string) => {
    setSelectedSound(soundId);
    setIsDropdownOpen(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      const sound = SOUNDS.find(s => s.id === soundId);
      if (sound) {
        audioRef.current.src = sound.url;
        audioRef.current.load();
        if (soundActive) {
          audioRef.current.play().catch(e => console.log("Sound play blocked:", e));
        }
      }
    }
  };

  useEffect(() => {
    const audio = new Audio(SOUNDS.find(s => s.id === selectedSound)?.url);
    audio.loop = true;
    audio.volume = 0.12; // Keeps the soundtrack ambient and soft
    audioRef.current = audio;

    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  const themes = [
    { id: "morning", name: "Morning Glow", icon: Sun, color: "text-amber-400" },
    { id: "rainy", name: "Rainy Vibe", icon: CloudRain, color: "text-blue-400" },
    { id: "blush", name: "Soft Blush", icon: Sparkles, color: "text-rose-300" },
    { id: "midnight", name: "Midnight Calm", icon: Moon, color: "text-purple-400" },
    { id: "coffee", name: "Coffee Mood", icon: Coffee, color: "text-amber-700" }
  ];

  // Quick helper to scroll to section
  const handleScrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <motion.nav 
      initial={{ y: -70, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 w-[92%] max-w-6xl z-40 transition-all duration-300 rounded-full ${
        isScrolled 
          ? "bg-[rgba(13,7,9,0.85)] border border-[rgba(232,197,154,0.15)] shadow-2xl backdrop-blur-md" 
          : "bg-[rgba(13,7,9,0.4)] border border-[rgba(255,255,255,0.03)] backdrop-blur-sm"
      }`}
    >
      <div className="px-6 h-14 flex items-center justify-between gap-4">
        
        {/* Left Side: Logo and day-streak */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onResetIntro} 
            className="font-serif text-xl md:text-2xl font-bold tracking-tight text-[#fdfaf6] hover:text-[#c97b84] transition-colors cursor-pointer"
          >
            For V<span className="text-[#c97b84]">.</span>
          </button>
          
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[rgba(201,123,132,0.1)] border border-[rgba(201,123,132,0.2)] text-[#e5b0b6] text-[10px] font-bold uppercase tracking-wider">
            <Heart className="w-3 h-3 fill-current text-[#c97b84] animate-pulse" />
            <span>{visitStreak} Day Streak</span>
          </div>
        </div>

        {/* Center: Desktop Navigation links */}
        <div className="hidden lg:flex items-center gap-6 text-[11px] font-bold uppercase tracking-widest text-[#8a7679]">
          <button onClick={() => handleScrollTo("dashboard")} className="hover:text-[#fdfaf6] transition-colors cursor-pointer">Dashboard</button>
          <button onClick={() => handleScrollTo("date-reminders")} className="hover:text-[#fdfaf6] transition-colors cursor-pointer">Dates</button>
          <button onClick={() => handleScrollTo("date-planner")} className="hover:text-[#fdfaf6] transition-colors cursor-pointer">Planner</button>
          <button onClick={() => handleScrollTo("memories")} className="hover:text-[#fdfaf6] transition-colors cursor-pointer">Timeline</button>
          <button onClick={() => handleScrollTo("gallery")} className="hover:text-[#fdfaf6] transition-colors cursor-pointer">Gallery</button>
          <button onClick={() => handleScrollTo("love-letters")} className="hover:text-[#fdfaf6] transition-colors cursor-pointer">Letters</button>
          <button onClick={() => handleScrollTo("reasons")} className="hover:text-[#fdfaf6] transition-colors cursor-pointer">Reasons</button>
        </div>

        {/* Right Side: Soundscape, Mood presets toggle */}
        <div className="flex items-center gap-3 relative">
          
          {/* Sound toggle button */}
          <button
            onClick={handleToggleSound}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              soundActive 
                ? "bg-[rgba(201,123,132,0.15)] border-[#c97b84] text-[#e5b0b6] scale-105" 
                : "bg-white/5 border-white/10 text-[#fdfaf6]/70 hover:bg-white/10"
            }`}
            title={soundActive ? "Mute music" : "Play music"}
          >
            {soundActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
          
          {/* Active Sound Selector Dropdown toggle */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#fdfaf6]/80 hover:bg-white/10 cursor-pointer"
          >
            <Music className="w-3 h-3 text-[#c97b84]" />
            <span className="capitalize hidden md:inline">{selectedSound}</span>
          </button>

          {/* Admin Control Center Trigger */}
          {onOpenAdmin && (
            <button
              onClick={onOpenAdmin}
              className="p-2 rounded-full bg-white/5 border border-white/10 text-[#fdfaf6]/70 hover:bg-white/10 hover:text-[#c97b84] hover:border-[#c97b84]/40 transition-all cursor-pointer"
              title="Admin Control Center"
            >
              <Lock className="w-3.5 h-3.5" />
            </button>
          )}

          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 top-12 w-40 bg-[#1c1416]/95 border border-white/10 rounded-2xl shadow-2xl p-1.5 z-50 flex flex-col gap-0.5"
              >
                {SOUNDS.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelectSound(s.id)}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                      selectedSound === s.id 
                        ? "bg-[rgba(201,123,132,0.15)] text-[#e5b0b6]" 
                        : "text-[#8a7679] hover:bg-white/5 hover:text-[#fdfaf6]"
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}
