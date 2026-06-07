"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Memory } from "@/lib/types";
import { Plus, Trash, Edit2, Save, MoveUp, MoveDown } from "lucide-react";

export default function AdminMemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [dateLabel, setDateLabel] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadMemories = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("memories")
        .select("*")
        .order("display_order", { ascending: true });

      if (data) {
        setMemories(data as Memory[]);
      }
    };
    loadMemories();
  }, []);

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateLabel || !description) return;
    setIsSaving(true);
    setMessage("");

    const supabase = createClient();
    if (supabase) {
      const payload = {
        id: editingMemory ? editingMemory.id : undefined,
        title,
        date_label: dateLabel,
        description,
        is_published: true,
        display_order: editingMemory ? editingMemory.display_order : memories.length
      };

      const { error } = await supabase
        .from("memories")
        .upsert(payload);

      if (error) {
        setMessage("Database error: " + error.message);
      } else {
        setMessage("Memory timeline node saved successfully!");
        setEditingMemory(null);
        setTitle("");
        setDateLabel("");
        setDescription("");
        
        // Refetch
        const { data } = await supabase
          .from("memories")
          .select("*")
          .order("display_order", { ascending: true });
        if (data) setMemories(data as Memory[]);
      }
    } else {
      setMessage("Database client unavailable.");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this memory milestone from the timeline?")) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase
          .from("memories")
          .delete()
          .eq("id", id);

        if (error) {
          setMessage("Delete error: " + error.message);
        } else {
          setMessage("Memory node deleted successfully!");
          setMemories(prev => prev.filter(m => m.id !== id));
        }
      }
    }
  };

  const handleEditClick = (m: Memory) => {
    setEditingMemory(m);
    setTitle(m.title);
    setDateLabel(m.date_label);
    setDescription(m.description);
    setDisplayOrder(m.display_order);
  };

  return (
    <div style={{ maxWidth: 860, fontFamily: "inherit" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
        Story Timeline Manager
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2rem" }}>
        Configure the vertical interactive timeline milestones.
      </p>

      {message && (
        <div style={{
          padding: "1rem",
          background: message.includes("error") || message.includes("Database") ? "#fef2f2" : "#f0fdf4",
          color: message.includes("error") || message.includes("Database") ? "#991b1b" : "#166534",
          borderRadius: 8,
          fontSize: "0.85rem",
          fontWeight: 600,
          marginBottom: "1.5rem"
        }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "2rem", alignItems: "start" }}>
        {/* Form Container */}
        <form onSubmit={handleSaveMemory} style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#fff", padding: "1.5rem", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>
            {editingMemory ? "Edit Memory Story" : "Add Memory Story Node"}
          </h2>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. The Day We First Met"
              required
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Date Label</label>
            <input
              type="text"
              value={dateLabel}
              onChange={(e) => setDateLabel(e.target.value)}
              placeholder="e.g. October 2025"
              required
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Narrative Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the sweet story entry..."
              required
              rows={5}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff", resize: "none" }}
            />
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
              {isSaving ? "Saving..." : editingMemory ? "Save Changes" : "Create Node"}
            </button>
            {editingMemory && (
              <button
                type="button"
                onClick={() => {
                  setEditingMemory(null);
                  setTitle("");
                  setDateLabel("");
                  setDescription("");
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
          {memories.map((m) => (
            <div
              key={m.id}
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
              <div>
                <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "#c97b84", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  {m.date_label}
                </span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "0.2rem 0" }}>
                  {m.title}
                </h3>
                <p style={{ fontSize: "0.8rem", color: "#64748b", lineHeight: 1.6 }}>
                  {m.description}
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleEditClick(m)}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.25rem" }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(m.id)}
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
