"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Search, Music, Heart, Plus, Trash2, Sparkles, Disc } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRealtimeData } from "@/hooks/useRealtimeData";
import { MusicTrack } from "@/lib/types";

// ─── Song Type Definition ───────────────────────────────────────────────────
export interface YouTubeSong {
  id: string;
  title: string;
  videoId: string;
  thumbnail: string;
  channel: string;
  duration?: string;
  moods: string[];
  times: ("morning" | "afternoon" | "evening" | "night")[];
  weight: number;
  dateNightBias?: boolean;
  peacefulBias?: boolean;
}

// ─── Rich Curated Local Bollywood Dataset ────────────────────────────────────
const CURATED_BOLLYWOOD_SONGS: YouTubeSong[] = [
  {
    id: "kb-kesariya",
    title: "Kesariya (Brahmastra)",
    videoId: "BddP6PYo2gs",
    thumbnail: "https://img.youtube.com/vi/BddP6PYo2gs/0.jpg",
    channel: "Sony Music India",
    duration: "4:28",
    moods: ["cozy", "romantic", "peaceful"],
    times: ["afternoon", "evening"],
    weight: 9,
    dateNightBias: true
  },
  {
    id: "kb-tumhiho",
    title: "Tum Hi Ho (Aashiqui 2)",
    videoId: "Umqb9CsnXPM",
    thumbnail: "https://img.youtube.com/vi/Umqb9CsnXPM/0.jpg",
    channel: "T-Series",
    duration: "4:22",
    moods: ["romantic", "surprise", "elegant"],
    times: ["night"],
    weight: 10
  },
  {
    id: "kb-raataan",
    title: "Raataan Lambiyan (Shershaah)",
    videoId: "gvyUuxdRdW4",
    thumbnail: "https://img.youtube.com/vi/gvyUuxdRdW4/0.jpg",
    channel: "Sony Music India",
    duration: "3:50",
    moods: ["romantic", "cozy", "peaceful"],
    times: ["evening", "night"],
    weight: 10,
    dateNightBias: true
  },
  {
    id: "kb-agartum",
    title: "Agar Tum Saath Ho (Tamasha)",
    videoId: "xRb8hqwN1yg",
    thumbnail: "https://img.youtube.com/vi/xRb8hqwN1yg/0.jpg",
    channel: "T-Series",
    duration: "5:41",
    moods: ["elegant", "casual", "romantic"],
    times: ["evening"],
    weight: 8
  },
  {
    id: "kb-kabira",
    title: "Kabira (Yeh Jawaani Hai Deewani)",
    videoId: "j6muwUGVf2c",
    thumbnail: "https://img.youtube.com/vi/j6muwUGVf2c/0.jpg",
    channel: "T-Series",
    duration: "3:43",
    moods: ["peaceful", "casual", "cozy"],
    times: ["afternoon"],
    weight: 9,
    peacefulBias: true
  },
  {
    id: "kb-zaalima",
    title: "Zaalima (Raees)",
    videoId: "huxhqpciZt4",
    thumbnail: "https://img.youtube.com/vi/huxhqpciZt4/0.jpg",
    channel: "Zee Music Company",
    duration: "4:59",
    moods: ["romantic", "surprise"],
    times: ["evening"],
    weight: 9,
    dateNightBias: true
  },
  {
    id: "kb-teraban",
    title: "Tera Ban Jaunga (Kabir Singh)",
    videoId: "H6JtC2N4_24",
    thumbnail: "https://img.youtube.com/vi/H6JtC2N4_24/0.jpg",
    channel: "T-Series",
    duration: "4:00",
    moods: ["romantic", "elegant"],
    times: ["night"],
    weight: 10
  },
  {
    id: "kb-dildiyan",
    title: "Dil Diyan Gallan (Tiger Zinda Hai)",
    videoId: "Me5B36SjGss",
    thumbnail: "https://img.youtube.com/vi/Me5B36SjGss/0.jpg",
    channel: "YRF",
    duration: "4:20",
    moods: ["romantic", "cozy", "peaceful"],
    times: ["evening", "night"],
    weight: 10,
    dateNightBias: true
  },
  {
    id: "kb-tumsehi",
    title: "Tum Se Hi (Jab We Met)",
    videoId: "tM0sRECvebc",
    thumbnail: "https://img.youtube.com/vi/tM0sRECvebc/0.jpg",
    channel: "T-Series",
    duration: "5:21",
    moods: ["cozy", "peaceful", "casual"],
    times: ["morning"],
    weight: 9,
    peacefulBias: true
  },
  {
    id: "kb-hawayein",
    title: "Hawayein (Jab Harry Met Sejal)",
    videoId: "cYOB941gyOd",
    thumbnail: "https://img.youtube.com/vi/cYOB941gyOd/0.jpg",
    channel: "Sony Music India",
    duration: "4:50",
    moods: ["romantic", "peaceful", "long-drive"],
    times: ["evening"],
    weight: 9,
    dateNightBias: true
  },
  {
    id: "kb-peeloon",
    title: "Pee Loon (Once Upon A Time In Mumbaai)",
    videoId: "kX_zL9fA7jA",
    thumbnail: "https://img.youtube.com/vi/kX_zL9fA7jA/0.jpg",
    channel: "T-Series",
    duration: "4:47",
    moods: ["romantic", "surprise", "cozy"],
    times: ["night"],
    weight: 10
  },
  {
    id: "kb-samjhawan",
    title: "Samjhawan (Humpty Sharma Ki Dulhania)",
    videoId: "H2f7MZyAk9A",
    thumbnail: "https://img.youtube.com/vi/H2f7MZyAk9A/0.jpg",
    channel: "Dharma Productions",
    duration: "4:29",
    moods: ["romantic", "elegant", "cozy"],
    times: ["night"],
    weight: 10
  },
  {
    id: "kb-pehlanasha",
    title: "Pehla Nasha (Jo Jeeta Wahi Sikandar)",
    videoId: "4TDSK2E4Hls",
    thumbnail: "https://img.youtube.com/vi/4TDSK2E4Hls/0.jpg",
    channel: "Venus",
    duration: "4:50",
    moods: ["peaceful", "casual", "cozy"],
    times: ["morning"],
    weight: 9,
    peacefulBias: true
  },
  {
    id: "kb-khudajaane",
    title: "Khuda Jaane (Bachna Ae Haseeno)",
    videoId: "2K_7b8_b5nQ",
    thumbnail: "https://img.youtube.com/vi/2K_7b8_b5nQ/0.jpg",
    channel: "YRF",
    duration: "5:30",
    moods: ["romantic", "elegant", "surprise"],
    times: ["evening"],
    weight: 9,
    dateNightBias: true
  }
];

export default function RomanticPlayer() {
  const { data: dbTracks, loading } = useRealtimeData<MusicTrack>("music_tracks", "display_order", true);

  const availableSongs = useMemo(() => {
    const publishedDbTracks = dbTracks.filter((t) => t.is_published && t.youtube_id);
    if (publishedDbTracks.length > 0) {
      return publishedDbTracks.map((track) => ({
        id: track.id,
        title: track.title,
        videoId: track.youtube_id || "",
        thumbnail: track.thumbnail_url || `https://img.youtube.com/vi/${track.youtube_id}/0.jpg`,
        channel: track.artist || "Unknown Artist",
        moods: track.mood_tag ? [track.mood_tag] : ["romantic"],
        times: ["morning", "afternoon", "evening", "night"] as ("morning" | "afternoon" | "evening" | "night")[],
        weight: track.is_featured ? 10 : 8,
        dateNightBias: track.mood_tag === "romantic",
        peacefulBias: track.mood_tag === "peaceful",
      }));
    }
    return CURATED_BOLLYWOOD_SONGS;
  }, [dbTracks]);

  const [player, setPlayer] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSong, setCurrentSong] = useState<YouTubeSong>(CURATED_BOLLYWOOD_SONGS[0]);
  const [queue, setQueue] = useState<YouTubeSong[]>([
    CURATED_BOLLYWOOD_SONGS[0],
    CURATED_BOLLYWOOD_SONGS[2],
    CURATED_BOLLYWOOD_SONGS[7]
  ]);
  const [queueIndex, setQueueIndex] = useState(0);

  // Initialize from DB once loaded
  const [hasInitializedDb, setHasInitializedDb] = useState(false);
  useEffect(() => {
    if (!loading && availableSongs !== CURATED_BOLLYWOOD_SONGS) {
      if (!hasInitializedDb) {
        setCurrentSong(availableSongs[0]);
        setQueue(availableSongs);
        setHasInitializedDb(true);
      } else {
        // Auto-append any newly added songs from the DB to the live queue
        setQueue((prevQueue) => {
          const newSongs = availableSongs.filter((s) => !prevQueue.some((q) => q.videoId === s.videoId));
          if (newSongs.length > 0) {
            return [...prevQueue, ...newSongs];
          }
          return prevQueue;
        });
      }
    }
  }, [loading, availableSongs, hasInitializedDb]);

  // Playback state variables
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(60);
  const [isMuted, setIsMuted] = useState(false);
  
  // Search & Recommendations
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<YouTubeSong[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dailyPick, setDailyPick] = useState<YouTubeSong | null>(null);
  const [playedHistory, setPlayedHistory] = useState<string[]>([]);

  // Ref handles for timers
  const progressInterval = useRef<any>(null);
  const isApiLoaded = useRef(false);

  // ─── 1. Load YouTube IFrame API ───────────────────────────────────────────
  useEffect(() => {
    if (isApiLoaded.current) return;
    isApiLoaded.current = true;

    // Dynamically inject script
    if (!(window as any).YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      // Callback when script is ready
      (window as any).onYouTubeIframeAPIReady = () => {
        initializePlayer();
      };
    } else {
      initializePlayer();
    }

    // Run Daily Pick Algorithm on Mount
    const pick = getDailyBollywoodPick();
    setDailyPick(pick);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, []);

  // Sync current song from queue index changes
  useEffect(() => {
    if (queue.length > 0 && queueIndex >= 0 && queueIndex < queue.length) {
      const target = queue[queueIndex];
      setCurrentSong(target);
      if (player && player.loadVideoById) {
        player.loadVideoById(target.videoId);
        setIsPlaying(true);
      }
    }
  }, [queueIndex, queue]);

  const initializePlayer = () => {
    try {
      const ytPlayer = new (window as any).YT.Player("youtube-hidden-frame", {
        height: "1",
        width: "1",
        videoId: currentSong.videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0
        },
        events: {
          onReady: (e: any) => {
            setPlayer(e.target);
            e.target.setVolume(volume);
          },
          onStateChange: (e: any) => {
            // YT.PlayerState.PLAYING === 1
            if (e.data === 1) {
              setIsPlaying(true);
              setDuration(e.target.getDuration());
              startProgressTimer();
            } 
            // YT.PlayerState.PAUSED === 2, ENDED === 0
            else {
              setIsPlaying(false);
              stopProgressTimer();
              if (e.data === 0) {
                // Auto-advance
                handleNext();
              }
            }
          }
        }
      });
    } catch (err) {
      console.error("Could not load YouTube Player Iframe API", err);
    }
  };

  // Progress tracking timers
  const startProgressTimer = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
    progressInterval.current = setInterval(() => {
      if (player && player.getCurrentTime) {
        setCurrentTime(player.getCurrentTime());
      }
    }, 500);
  };

  const stopProgressTimer = () => {
    if (progressInterval.current) clearInterval(progressInterval.current);
  };

  // ─── 2. Weighted Scoring Recommendation Algorithm ──────────────────────────
  const scoreSong = (song: YouTubeSong, timeOfDay: string, dayOfWeek: number, activeMood: string, history: string[]): number => {
    let score = song.weight; // Base rank (1-10)

    // Time of day matching (+5)
    if (song.times.includes(timeOfDay as any)) {
      score += 5;
    }

    // Mood matching (+5)
    if (song.moods.includes(activeMood)) {
      score += 5;
    }

    // Day of week matching (+3)
    // Friday (5) & Saturday (6) favor Date Night
    if ((dayOfWeek === 5 || dayOfWeek === 6) && song.dateNightBias) {
      score += 3;
    }
    // Sunday (0) favors Peaceful/Memory tracks
    if (dayOfWeek === 0 && song.peacefulBias) {
      score += 3;
    }

    // History penalty: avoid repeats (-25)
    if (history.includes(song.id)) {
      score -= 25;
    }

    return score;
  };

  const getDailyBollywoodPick = (): YouTubeSong => {
    const now = new Date();
    const hour = now.getHours();
    const day = now.getDay();
    
    // 1. Determine time context
    let timeOfDay: "morning" | "afternoon" | "evening" | "night" = "evening";
    if (hour >= 5 && hour < 12) timeOfDay = "morning";
    else if (hour >= 12 && hour < 17) timeOfDay = "afternoon";
    else if (hour >= 17 && hour < 22) timeOfDay = "evening";
    else timeOfDay = "night";

    // 2. Fetch current mood from localStorage if available (falls back to romantic)
    let activeMood = "romantic";
    try {
      const savedPlan = localStorage.getItem("rv_plan");
      if (savedPlan) {
        const parsed = JSON.parse(savedPlan);
        if (parsed.mood) activeMood = parsed.mood;
      }
    } catch (e) {}

    // 3. Score all songs
    let bestSong = availableSongs[0];
    let maxScore = -Infinity;

    availableSongs.forEach((song) => {
      const score = scoreSong(song, timeOfDay, day, activeMood, playedHistory);
      if (score > maxScore) {
        maxScore = score;
        bestSong = song;
      }
    });

    return bestSong;
  };

  const searchYouTubeSongs = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setShowDropdown(true);

    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      
      if (data.items) {
        setSearchResults(data.items);
        setIsSearching(false);
        return;
      }
    } catch (err) {
      console.error("Realtime search API route failed, falling back to local dataset matching", err);
    }

    // Offline / Fallback local search matching
    setTimeout(() => {
      const q = query.toLowerCase();
      const matches = availableSongs.filter(
        (song) =>
          song.title.toLowerCase().includes(q) ||
          song.channel.toLowerCase().includes(q)
      );
      setSearchResults(matches.slice(0, 5));
      setIsSearching(false);
    }, 200);
  };

  // ─── 4. Playback Controls ──────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (!player) return;
    if (isPlaying) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  };

  const handleNext = () => {
    if (queueIndex < queue.length - 1) {
      setQueueIndex(queueIndex + 1);
    } else {
      // Loop to beginning of queue
      setQueueIndex(0);
    }
  };

  const handlePrev = () => {
    if (queueIndex > 0) {
      setQueueIndex(queueIndex - 1);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (player && player.seekTo) {
      player.seekTo(time, true);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseInt(e.target.value);
    setVolume(vol);
    if (player && player.setVolume) {
      player.setVolume(vol);
    }
  };

  const handleToggleMute = () => {
    if (!player) return;
    if (isMuted) {
      player.unMute();
      setIsMuted(false);
    } else {
      player.mute();
      setIsMuted(true);
    }
  };

  // ─── 5. Queue Operations ──────────────────────────────────────────────────
  const playInstant = (song: YouTubeSong) => {
    // Add to played history
    setPlayedHistory((prev) => [...prev.slice(-6), song.id]);

    // Check if song already in queue
    const indexInQueue = queue.findIndex((q) => q.videoId === song.videoId);
    if (indexInQueue !== -1) {
      setQueueIndex(indexInQueue);
    } else {
      // Insert song after current index and play it
      const newQueue = [...queue];
      newQueue.splice(queueIndex + 1, 0, song);
      setQueue(newQueue);
      setTimeout(() => setQueueIndex(queueIndex + 1), 50);
    }
    setShowDropdown(false);
    setSearchQuery("");
  };

  const addToQueue = (song: YouTubeSong) => {
    if (queue.some((q) => q.videoId === song.videoId)) return;
    setQueue([...queue, song]);
    setShowDropdown(false);
    setSearchQuery("");
  };

  const removeFromQueue = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (queue.length <= 1) return; // Keep at least one song
    
    const newQueue = queue.filter((_, i) => i !== idx);
    setQueue(newQueue);

    if (queueIndex === idx) {
      setQueueIndex(Math.max(0, idx - 1));
    } else if (queueIndex > idx) {
      setQueueIndex(queueIndex - 1);
    }
  };

  // Formatter helper
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <section id="romantic-music" className="py-12 relative border-t border-white/5">
      
      {/* Hidden iframe target for YouTube embedded playback */}
      <div id="youtube-hidden-frame" className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-fluid-base font-bold uppercase tracking-[0.25em] text-[#c97b84] block mb-2">
            Soundtrack
          </span>
          <h2 className="font-serif text-fluid-4xl md:text-fluid-5xl text-[#fdfaf6] font-normal">
            Your Private Melodies
          </h2>
        </div>

        {/* Player grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left: Premium Audio-Style Player Card (7 cols) */}
          <div className="lg:col-span-7">
            <div className="glass-panel p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden">
              
              {/* Highlight line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#e8c59a]/50 to-transparent" />
              
              {/* Top part: Song info & Rotating Vinyl */}
              <div className="flex flex-col sm:flex-row items-center gap-6 mb-8">
                
                {/* Rotating vinyl disk disc */}
                <div className="relative w-28 h-28 flex-shrink-0 select-none">
                  {/* Outer vinyl border */}
                  <div className={`w-full h-full rounded-full bg-black border-4 border-white/5 flex items-center justify-center shadow-2xl relative overflow-hidden ${
                    isPlaying ? "animate-spin" : ""
                  }`} style={{ animationDuration: "12s" }}>
                    
                    {/* Vinyl Grooves lines */}
                    <div className="absolute inset-2 border border-white/5 rounded-full" />
                    <div className="absolute inset-4 border border-white/5 rounded-full" />
                    <div className="absolute inset-6 border border-white/5 rounded-full" />
                    
                    {/* Center image */}
                    <div className="w-10 h-10 rounded-full bg-[#1c1416] overflow-hidden border border-white/10 relative z-10">
                      {currentSong.thumbnail ? (
                        <img src={currentSong.thumbnail} alt="" className="w-full h-full object-cover opacity-75" />
                      ) : (
                        <Disc className="w-full h-full p-2 text-[#e8c59a]" />
                      )}
                    </div>
                  </div>
                  {/* Stylus pin head */}
                  <div className="absolute top-0 right-0 w-4 h-4 rounded-full bg-white/20 border border-white/25 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#c97b84]" />
                  </div>
                </div>

                {/* Info titles */}
                <div className="text-center sm:text-left flex-grow">
                  <span className="text-fluid-2xs uppercase tracking-widest text-[#c97b84] font-bold block mb-1">
                    Playing from queue
                  </span>
                  <h3 className="font-serif text-fluid-2xl md:text-fluid-3xl text-[#fdfaf6] font-normal leading-snug truncate max-w-sm">
                    {currentSong.title}
                  </h3>
                  <p className="text-fluid-base text-[#8a7679] mt-1 font-semibold truncate max-w-sm">
                    {currentSong.channel}
                  </p>
                </div>
              </div>

              {/* Middle part: Waveform Seek Bar */}
              <div className="flex flex-col gap-2.5 mb-8">
                
                {/* Seek input range slider */}
                <div className="relative w-full h-1.5 rounded-full bg-white/5 overflow-hidden flex items-center group">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                  />
                  {/* Process highlight bar */}
                  <div 
                    className="h-full bg-gradient-to-r from-[#e8c59a] to-[#c97b84] pointer-events-none relative z-10"
                    style={{ width: `${(currentTime / (duration || 100)) * 100}%` }}
                  />
                </div>

                {/* Time values row */}
                <div className="flex justify-between items-center text-fluid-xs font-bold text-[#8a7679]">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Bottom part: Playback Controls */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                
                {/* Play, skip, back */}
                <div className="flex items-center gap-5">
                  <button
                    onClick={handlePrev}
                    className="p-2.5 rounded-full bg-white/3 border border-white/5 hover:bg-white/8 text-[#fdfaf6] hover:text-[#e8c59a] transition-all cursor-pointer"
                    title="Previous Song"
                  >
                    <SkipBack className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handlePlayPause}
                    className="p-4 rounded-full bg-gradient-to-r from-[#e8c59a] to-[#c97b84] text-[#080405] hover:scale-105 transition-transform shadow-lg shadow-[#c97b84]/15 cursor-pointer"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current" />}
                  </button>

                  <button
                    onClick={handleNext}
                    className="p-2.5 rounded-full bg-white/3 border border-white/5 hover:bg-white/8 text-[#fdfaf6] hover:text-[#e8c59a] transition-all cursor-pointer"
                    title="Next Song"
                  >
                    <SkipForward className="w-4 h-4" />
                  </button>
                </div>

                {/* Mute and volume slider */}
                <div className="flex items-center gap-3 bg-white/3 border border-white/5 px-4 py-2 rounded-full">
                  <button
                    onClick={handleToggleMute}
                    className="text-[#fdfaf6]/70 hover:text-[#e8c59a] transition-colors cursor-pointer"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 accent-[#c97b84] bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Search, Recommendations, and Queue (5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            
            {/* Search Input Card */}
            <div className="glass-panel p-4 relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    searchYouTubeSongs(e.target.value);
                  }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search Bollywood romantic songs..."
                  className="premium-input pl-10"
                />
                <Search className="w-4 h-4 text-[#8a7679] absolute left-3.5 top-3" />
              </div>

              {/* Search Results Dropdown overlay */}
              <AnimatePresence>
                {showDropdown && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="absolute left-0 right-0 top-16 bg-[#160e10]/95 border border-white/10 rounded-2xl shadow-2xl p-2 z-30 flex flex-col gap-1 max-h-[260px] overflow-y-auto"
                  >
                    {isSearching ? (
                      <div className="text-center py-4 text-fluid-base text-[#8a7679]">Searching...</div>
                    ) : searchResults.length === 0 ? (
                      <div className="text-center py-4 text-fluid-base text-[#8a7679]">No matches found.</div>
                    ) : (
                      searchResults.map((song) => (
                        <div
                          key={song.id}
                          className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                          onClick={() => playInstant(song)}
                        >
                          <img src={song.thumbnail} alt="" className="w-9 h-9 rounded object-cover flex-shrink-0" />
                          <div className="flex-grow min-w-0">
                            <p className="text-fluid-sm text-[#fdfaf6] font-semibold truncate leading-normal">{song.title}</p>
                            <p className="text-fluid-2xs text-[#8a7679] truncate">{song.channel}</p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addToQueue(song);
                            }}
                            className="p-1.5 rounded-full hover:bg-white/10 text-[#e8c59a] cursor-pointer"
                            title="Add to queue"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Daily Pick Banner */}
            {dailyPick && (
              <div 
                onClick={() => playInstant(dailyPick)}
                className="bg-gradient-to-r from-[#2a0812] to-[#160e10] border border-[#c97b84]/30 rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer hover:border-[#c97b84] transition-all select-none"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#c97b84]/15 flex items-center justify-center text-[#c97b84] flex-shrink-0">
                    <Sparkles className="w-4 h-4 fill-current animate-pulse" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-fluid-3xs font-bold uppercase tracking-widest text-[#e8c59a] block mb-0.5">
                      Daily confession pick
                    </span>
                    <p className="text-fluid-base text-[#fdfaf6] font-semibold truncate max-w-[190px]">
                      {dailyPick.title}
                    </p>
                  </div>
                </div>
                <span className="text-fluid-2xs uppercase tracking-wider text-[#c97b84] font-bold flex-shrink-0">
                  Play →
                </span>
              </div>
            )}

            {/* Queue List Cards */}
            <div className="glass-panel p-4 flex-grow flex flex-col gap-3">
              <h4 className="text-fluid-2xs uppercase tracking-widest text-[#8a7679] font-bold border-b border-white/5 pb-2">
                Playlist Queue ({queue.length} Songs)
              </h4>

              <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                {queue.map((song, idx) => {
                  const active = queueIndex === idx;
                  return (
                    <div
                      key={idx}
                      onClick={() => setQueueIndex(idx)}
                      className={`flex items-center justify-between p-2 rounded-xl border transition-colors cursor-pointer ${
                        active
                          ? "bg-[rgba(201,123,132,0.1)] border-[#c97b84]/30 text-[#e5b0b6]"
                          : "bg-white/2 border-transparent hover:bg-white/5 text-[#8a7679] hover:text-[#fdfaf6]"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-fluid-xs font-mono opacity-50 flex-shrink-0 w-3">{idx + 1}</span>
                        <div className="min-w-0">
                          <p className={`text-fluid-sm font-semibold truncate ${active ? "text-[#fdfaf6]" : ""}`}>
                            {song.title}
                          </p>
                          <p className="text-fluid-2xs opacity-60 truncate">{song.channel}</p>
                        </div>
                      </div>
                      
                      {queue.length > 1 && (
                        <button
                          onClick={(e) => removeFromQueue(idx, e)}
                          className="p-1 rounded hover:bg-white/10 text-[#8a7679] hover:text-[#c97b84]"
                          title="Remove from queue"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
export { CURATED_BOLLYWOOD_SONGS };
