"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash, Edit2, Save } from "lucide-react";

interface LoveJarNote {
  id: string;
  message: string;
  category: string;
  created_at?: string;
}

export default function AdminLoveJarPage() {
  const [notes, setNotes] = useState<LoveJarNote[]>([]);
  const [editingNote, setEditingNote] = useState<LoveJarNote | null>(null);

  // Form fields
  const [messageText, setMessageText] = useState("");
  const [category, setCategory] = useState("compliment");

  const [statusMsg, setStatusMsg] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadNotes = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("love_jar_notes")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) {
        setNotes(data as LoveJarNote[]);
      }
    };
    loadNotes();
  }, []);

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setIsSaving(true);
    setStatusMsg("");

    const supabase = createClient();
    if (supabase) {
      const payload = {
        id: editingNote ? editingNote.id : crypto.randomUUID(),
        message: messageText.trim(),
        category
      };

      const { error } = await supabase
        .from("love_jar_notes")
        .upsert(payload);

      if (error) {
        setStatusMsg("Database error: " + error.message);
      } else {
        setStatusMsg("Sweet capsule capsule saved and broadcasted successfully!");
        setEditingNote(null);
        setMessageText("");
        setCategory("compliment");
        
        // Refetch
        const { data } = await supabase
          .from("love_jar_notes")
          .select("*")
          .order("created_at", { ascending: true });
        if (data) setNotes(data as LoveJarNote[]);
      }
    } else {
      setStatusMsg("Database client unavailable.");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this sweet reason capsule?")) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase
          .from("love_jar_notes")
          .delete()
          .eq("id", id);

        if (error) {
          setStatusMsg("Delete error: " + error.message);
        } else {
          setStatusMsg("Sweet capsule deleted successfully!");
          setNotes(prev => prev.filter(n => n.id !== id));
        }
      }
    }
  };

  const handleEditClick = (n: LoveJarNote) => {
    setEditingNote(n);
    setMessageText(n.message);
    setCategory(n.category);
  };

  return (
    <div style={{ maxWidth: 860, fontFamily: "inherit" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
        Love Jar Caps Configurator
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2rem" }}>
        Manage the sweet messages, compliments, and date coupons inside the virtual Love Jar.
      </p>

      {statusMsg && (
        <div style={{
          padding: "1rem",
          background: statusMsg.includes("error") || statusMsg.includes("Database") ? "#fef2f2" : "#f0fdf4",
          color: statusMsg.includes("error") || statusMsg.includes("Database") ? "#991b1b" : "#166534",
          borderRadius: 8,
          fontSize: "0.85rem",
          fontWeight: 600,
          marginBottom: "1.5rem"
        }}>
          {statusMsg}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "2rem", alignItems: "start" }}>
        {/* Form Container */}
        <form onSubmit={handleSaveNote} style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#fff", padding: "1.5rem", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>
            {editingNote ? "Edit Message Capsule" : "Drop New Message Capsule"}
          </h2>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Note Message</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="e.g. Your laugh is my absolute favorite sound in the whole universe..."
              required
              rows={5}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff", resize: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Message Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
            >
              <option value="compliment">Compliment 💖</option>
              <option value="quote">Romantic Quote 📖</option>
              <option value="coupon">Love Coupon 🎫</option>
              <option value="memory">Sweet Memory 💭</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 1,
                padding: "0.65rem 1.2rem",
                background: "#1e293b",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {isSaving ? "Saving..." : editingNote ? "Save Capsule" : "Drop in Jar"}
            </button>
            {editingNote && (
              <button
                type="button"
                onClick={() => {
                  setEditingNote(null);
                  setMessageText("");
                  setCategory("compliment");
                }}
                style={{
                  padding: "0.65rem 1.2rem",
                  background: "#fff",
                  color: "#64748b",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Timeline Items list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {notes.map((n) => (
            <div
              key={n.id}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "1.2rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start"
              }}
            >
              <div style={{ flex: 1, marginRight: "1rem" }}>
                <span style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: n.category === "coupon" ? "#c2410c" : n.category === "quote" ? "#0369a1" : "#be123c",
                  letterSpacing: "0.05em",
                  display: "block",
                  marginBottom: "0.3rem"
                }}>
                  {n.category}
                </span>
                <p style={{ fontSize: "0.85rem", color: "#334155", lineHeight: 1.5, margin: 0, fontStyle: "italic" }}>
                  &ldquo;{n.message}&rdquo;
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleEditClick(n)}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.25rem" }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(n.id)}
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.25rem" }}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
