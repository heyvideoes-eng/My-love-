"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Save } from "lucide-react";

interface MoodResponse {
  id: number;
  mood: string;
  content: string;
}

export default function AdminMoodsPage() {
  const [moods, setMoods] = useState<MoodResponse[]>([]);
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadMoods = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("mood_messages")
        .select("*")
        .order("mood", { ascending: true });

      if (data) {
        setMoods(data as MoodResponse[]);
      }
    };
    loadMoods();
  }, []);

  const handleSaveMood = async (id: number, content: string) => {
    setIsSaving(true);
    setMessage("");

    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase
        .from("mood_messages")
        .update({ content })
        .eq("id", id);

      if (error) {
        setMessage("Database error: " + error.message);
      } else {
        setMessage("Mood message updated and saved!");
      }
    } else {
      setMessage("Database client unavailable.");
    }
    setIsSaving(false);
  };

  const handleTextChange = (id: number, content: string) => {
    setMoods(prev => prev.map(m => m.id === id ? { ...m, content } : m));
  };

  return (
    <div style={{ maxWidth: 860, fontFamily: "inherit" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
        Mood Preset Configurator
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2rem" }}>
        Customize the response messages corresponding to Vanshika's mood check-ins.
      </p>

      {message && (
        <div style={{
          padding: "1rem",
          background: message.includes("error") ? "#fef2f2" : "#f0fdf4",
          color: message.includes("error") ? "#991b1b" : "#166534",
          borderRadius: 8,
          fontSize: "0.85rem",
          fontWeight: 600,
          marginBottom: "1.5rem"
        }}>
          {message}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {moods.map((m) => (
          <div
            key={m.id}
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{
                fontSize: "0.78rem",
                fontWeight: 700,
                textTransform: "uppercase",
                color: "#c97b84",
                letterSpacing: "0.08em"
              }}>
                Mood: {m.mood}
              </span>
              <button
                type="button"
                onClick={() => handleSaveMood(m.id, m.content)}
                style={{
                  padding: "0.4rem 0.85rem",
                  background: "#1e293b",
                  color: "#fff",
                  border: "none",
                  borderRadius: 6,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save response</span>
              </button>
            </div>
            
            <textarea
              value={m.content}
              onChange={(e) => handleTextChange(m.id, e.target.value)}
              placeholder={`Write the responsive text for mood: ${m.mood}...`}
              rows={3}
              style={{
                width: "100%",
                padding: "0.6rem 0.8rem",
                fontSize: "0.88rem",
                border: "1px solid #cbd5e1",
                borderRadius: 8,
                color: "#334155",
                background: "#f8fafc",
                fontFamily: "inherit",
                lineHeight: 1.5,
                resize: "none"
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
