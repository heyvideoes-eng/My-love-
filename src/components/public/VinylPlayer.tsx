"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, SkipForward, SkipBack, Heart } from "lucide-react";
import { motion } from "framer-motion";

interface Track {
  title: string;
  artist: string;
  url: string;
}

const PLAYLIST: Track[] = [
  {
    title: "Coffee & Mornings",
    artist: "Rishi & Vanshika",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    title: "Quiet Walks",
    artist: "Soft Lo-Fi Chill",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    title: "Late Night Conversations",
    artist: "Midnight Melodies",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  },
];

export default function VinylPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [trackIndex, setTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrack = PLAYLIST[trackIndex];

  // Initialize audio on mount
  useEffect(() => {
    const audio = new Audio(currentTrack.url);
    audio.volume = 0.25; // comfortable background level
    audioRef.current = audio;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const onEnded = () => {
      handleNext();
    };

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audioRef.current = null;
    };
  }, [trackIndex]);

  // Handle play/pause toggle
  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().catch((err) => {
        console.log("Audio playback was blocked or failed:", err);
      });
      setIsPlaying(true);
    }
  };

  // Skip to next track
  const handleNext = () => {
    setIsPlaying(false);
    setTrackIndex((prev) => (prev + 1) % PLAYLIST.length);
    setCurrentTime(0);
    // Auto play next song
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 150);
  };

  // Skip to previous track
  const handlePrev = () => {
    setIsPlaying(false);
    setTrackIndex((prev) => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
    setCurrentTime(0);
    // Auto play previous song
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
      }
    }, 150);
  };

  // Handle progress bar scrubbing
  const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newTime = (clickX / rect.width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Formatting helpers
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
      <div className="text-center">
        <h3 className="font-serif text-fluid-3xl font-bold text-foreground mb-1">
          Rishi's Playlist
        </h3>
        <p className="text-fluid-base uppercase tracking-wider text-accent-rose-dark font-semibold">
          Songs that make me think of you
        </p>
      </div>

      <div className="bg-white/50 backdrop-blur-md border border-foreground/10 p-6 rounded-3xl w-full shadow-sm flex flex-col md:flex-row items-center gap-6">
        {/* Vinyl Disc Container */}
        <div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
          {/* Vinyl Disc */}
          <motion.div
            className="w-32 h-32 rounded-full bg-zinc-950 flex items-center justify-center relative shadow-lg"
            style={{
              background: "radial-gradient(circle, #27272a 20%, #09090b 60%, #020202 70%)",
            }}
            animate={
              isPlaying
                ? { rotate: 360 }
                : { rotate: 0 }
            }
            transition={{
              repeat: Infinity,
              duration: 8,
              ease: "linear",
            }}
          >
            {/* Grooves */}
            <div className="absolute inset-2 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
            <div className="absolute inset-7 rounded-full border border-white/5 pointer-events-none" />

            {/* Label */}
            <div className="w-12 h-12 rounded-full bg-accent-rose flex items-center justify-center border-4 border-zinc-900 z-10">
              <Heart className="w-4 h-4 text-white fill-current animate-pulse" />
            </div>
          </motion.div>

          {/* Needle Arm */}
          <motion.div
            className="absolute top-0 right-2 w-10 h-20 origin-[25px_10px] pointer-events-none z-20"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 80'><path d='M10,0 L30,0 L30,40 L18,55 L18,70 L12,70 L12,55 L2,40 Z' fill='%23C9A96E' stroke='%232C1F22' stroke-width='1.5'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundSize: "contain",
            }}
            animate={{
              rotate: isPlaying ? 5 : -25,
            }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />
        </div>

        {/* Playback Controls & Info */}
        <div className="flex-grow w-full flex flex-col items-center md:items-start">
          <div className="text-center md:text-left mb-3">
            <span className="font-serif text-fluid-2xl font-bold text-zinc-900 block truncate max-w-[200px]">
              {currentTrack.title}
            </span>
            <span className="text-fluid-xs uppercase font-bold tracking-wider text-accent-rose-dark/80 block">
              {currentTrack.artist}
            </span>
          </div>

          {/* Playback Progress */}
          <div className="w-full flex items-center gap-2 mb-4">
            <span className="text-fluid-xs font-mono text-zinc-500 w-8 text-right">
              {formatTime(currentTime)}
            </span>
            <div
              onClick={handleProgressChange}
              className="flex-grow h-1.5 bg-zinc-200 rounded-full cursor-pointer relative overflow-hidden"
            >
              <div
                style={{ width: `${progressPercent}%` }}
                className="h-full bg-accent-rose rounded-full"
              />
            </div>
            <span className="text-fluid-xs font-mono text-zinc-500 w-8">
              {formatTime(duration)}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-full text-zinc-700 hover:text-accent-rose hover:bg-zinc-100 transition-colors"
              aria-label="Previous track"
            >
              <SkipBack className="w-4 h-4 fill-current" />
            </button>

            <button
              onClick={togglePlay}
              className="w-10 h-10 rounded-full bg-accent-rose hover:bg-rose-deep text-white flex items-center justify-center shadow-md shadow-rose-200 transition-all hover:scale-105"
              aria-label={isPlaying ? "Pause music" : "Play music"}
            >
              {isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-1.5 rounded-full text-zinc-700 hover:text-accent-rose hover:bg-zinc-100 transition-colors"
              aria-label="Next track"
            >
              <SkipForward className="w-4 h-4 fill-current" />
            </button>
          </div>

          {/* Visualizer Spectrum (animated row of bars) */}
          <div className="h-6 flex items-end gap-1 mt-4">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-accent-rose rounded-full"
                animate={{
                  height: isPlaying
                    ? [4, Math.random() * 16 + 8, 4]
                    : 4,
                }}
                transition={{
                  repeat: Infinity,
                  duration: isPlaying ? 0.4 + i * 0.08 : 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
