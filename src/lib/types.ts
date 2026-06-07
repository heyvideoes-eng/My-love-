// ─── Shared TypeScript types ─────────────────────────────────────────────────

export interface DailyMessage {
  id: string;
  content: string;
  is_published: boolean;
  is_ai_generated: boolean;
  scheduled_for: string | null;
  mood_context: string | null;
  created_at: string;
  updated_at: string;
}

export interface MoodMessage {
  id: string;
  mood: MoodKey;
  content: string;
  is_published: boolean;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface Memory {
  id: string;
  title: string;
  date_label: string;
  description: string;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIGeneration {
  id: string;
  prompt_type: "daily" | "mood" | "memory";
  prompt_sent: string;
  response_received: string;
  accepted: boolean;
  created_at: string;
}

export interface Reminder {
  id: string;
  title: string;
  event_type: "anniversary" | "birthday" | "special" | "custom";
  event_date: string;
  emotional_note: string | null;
  priority: "high" | "medium" | "low";
  is_ai_suggested: boolean;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatePlan {
  id: string;
  title: string;
  plan_date: string | null;
  plan_time: string | null;
  place: string | null;
  mood: "romantic" | "cozy" | "surprise" | "elegant" | "casual" | "long-drive" | "movie" | "cafe";
  activity: string | null;
  budget: string | null;
  notes: string | null;
  checklist: string[];
  is_published: boolean;
  is_ai_enhanced: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoveNote {
  id: string;
  title: string | null;
  content: string;
  category: "letter" | "reason" | "micro-note" | "vow";
  mood_tag: string | null;
  is_published: boolean;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string | null;
  youtube_id: string | null;
  thumbnail_url: string | null;
  mood_tag: string | null;
  is_featured: boolean;
  display_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryItem {
  id: string;
  caption: string | null;
  image_url: string;
  date_label: string | null;
  display_order: number;
  is_featured: boolean;
  is_published: boolean;
  created_at: string;
}

export interface SiteSettings {
  id: string;
  welcome_text: string;
  countdown_date: string | null;
  countdown_label: string;
  sections_visible: {
    hero: boolean;
    dailyNote: boolean;
    mood: boolean;
    memories: boolean;
    gallery: boolean;
    music: boolean;
    dateplan: boolean;
    lovenotes: boolean;
    vouchers: boolean;
    countdown: boolean;
    reminders: boolean;
  };
  updated_at: string;
}

export type MoodKey =
  | "soft"
  | "tiring"
  | "chaotic"
  | "beautiful"
  | "heavy"
  | "peaceful";

export const MOOD_LABELS: Record<MoodKey, string> = {
  soft: "Soft",
  tiring: "Tiring",
  chaotic: "Chaotic",
  beautiful: "Beautiful",
  heavy: "Heavy",
  peaceful: "Peaceful",
};

export const MOOD_EMOJIS: Record<MoodKey, string> = {
  soft: "✦",
  tiring: "◌",
  chaotic: "◈",
  beautiful: "◇",
  heavy: "▲",
  peaceful: "○",
};

// Fallback data used when Supabase is not configured
export const FALLBACK_DAILY_MESSAGE: DailyMessage = {
  id: "fallback",
  content:
    "You are, quietly, one of the most remarkable people I've ever known. Not because of any single thing — but because of the way all of it adds up.",
  is_published: true,
  is_ai_generated: false,
  scheduled_for: null,
  mood_context: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const FALLBACK_MOOD_MESSAGES: Record<MoodKey, string> = {
  soft:
    "I'm so glad. Take this gentle energy and let it carry you through the rest of the day. You deserve quiet moments that make you smile.",
  tiring:
    "Today drained your battery, didn't it? Put the day behind you and rest properly tonight. The world can wait for tomorrow.",
  chaotic:
    "Let this space be your quiet anchor. Take a deep breath — the chaos is temporary, and you've made it through all of it.",
  beautiful:
    "I love that today was beautiful. Keep that glow with you, Vanshika. I hope it rolls softly into tomorrow.",
  heavy:
    "If today felt heavy, let me carry a small part of it for you. Sleep early tonight and give your mind the rest it deserves.",
  peaceful:
    "A peaceful mind is such a rare, sweet treasure. Enjoy the quiet evening, and remember how valuable these calm days truly are.",
};

export const FALLBACK_MEMORIES: Memory[] = [
  {
    id: "1",
    title: "How We Met",
    date_label: "The Spark",
    description:
      "A simple conversation that turned into hours of shared laughter and instant, effortless connection.",
    display_order: 1,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "2",
    title: "Our First Walk",
    date_label: "The Beginning",
    description:
      "Quiet afternoon walks and warm conversations, where time felt like it stood completely still.",
    display_order: 2,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "3",
    title: "Late Night Talks",
    date_label: "Deep Nights",
    description:
      "When the rest of the world slept, we built our own calm universe through words alone.",
    display_order: 3,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "4",
    title: "That Random Laugh",
    date_label: "Sweet Moments",
    description:
      "A completely spontaneous joke that reminded me how beautiful your laugh sounds.",
    display_order: 4,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "5",
    title: "Ordinary Tuesdays",
    date_label: "Everyday",
    description:
      "The days when nothing special happened, but everything felt right because you were there.",
    display_order: 5,
    is_published: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];
