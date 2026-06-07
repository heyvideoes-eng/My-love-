"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash, Edit2 } from "lucide-react";

interface Milestone {
  id: string;
  title: string;
  date_string: string;
  description: string;
  icon_type: string;
}

export default function AdminTimelinePage() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [editingItem, setEditingItem] = useState<Milestone | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [dateString, setDateString] = useState("");
  const [kicker, setKicker] = useState("");
  const [description, setDescription] = useState("");

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadTimeline = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("memory_timeline")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) {
        setItems(data as Milestone[]);
      }
    };
    loadTimeline();
  }, []);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dateString || !description) return;
    setIsSaving(true);
    setMessage("");

    const supabase = createClient();
    if (supabase) {
      const payload = {
        id: editingItem ? editingItem.id : crypto.randomUUID(),
        title,
        date_string: dateString,
        description,
        icon_type: kicker || 'Milestone'
      };

      const { error } = await supabase
        .from("memory_timeline")
        .upsert(payload);

      if (error) {
        setMessage("Database error: " + error.message);
      } else {
        setMessage("Timeline milestone updated successfully!");
        setEditingItem(null);
        // Reset fields
        setTitle("");
        setDateString("");
        setKicker("");
        setDescription("");
        
        // Refetch
        const { data } = await supabase
          .from("memory_timeline")
          .select("*")
          .order("created_at", { ascending: true });
        if (data) setItems(data as Milestone[]);
      }
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this milestone?")) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase
          .from("memory_timeline")
          .delete()
          .eq("id", id);
        
        if (error) {
          setMessage("Delete error: " + error.message);
        } else {
          setMessage("Milestone deleted successfully!");
          setItems(prev => prev.filter(item => item.id !== id));
        }
      }
    }
  };

  const handleEditClick = (item: Milestone) => {
    setEditingItem(item);
    setTitle(item.title);
    setDateString(item.date_string);
    setKicker(item.icon_type);
    setDescription(item.description);
  };

  return (
    <div style={{ maxWidth: 860, fontFamily: "inherit" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
        Memory Timeline Manager
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2rem" }}>
        Add new milestones to the public timeline. Changes are reflected instantly.
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

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "2rem", alignItems: "start" }}>
        {/* Form */}
        <form onSubmit={handleSaveItem} style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#fff", padding: "1.5rem", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>
            {editingItem ? "Edit Milestone" : "Add New Milestone"}
          </h2>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Our First Walk"
              required
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", background: "#fff" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Date Text</label>
              <input
                type="text"
                value={dateString}
                onChange={(e) => setDateString(e.target.value)}
                placeholder="e.g. April 22, 2025"
                required
                style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", background: "#fff" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Kicker/Theme</label>
              <input
                type="text"
                value={kicker}
                onChange={(e) => setKicker(e.target.value)}
                placeholder="e.g. The Beginning"
                style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", background: "#fff" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the narrative behind this milestone..."
              required
              rows={4}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", background: "#fff", resize: "none" }}
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
              {isSaving ? "Saving..." : editingItem ? "Save Changes" : "Create Milestone"}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setTitle("");
                  setDateString("");
                  setKicker("");
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

        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "1.2rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                    {item.title}
                  </h3>
                  <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>
                    {item.date_string} • {item.icon_type}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button
                    type="button"
                    onClick={() => handleEditClick(item)}
                    style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.25rem" }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id)}
                    style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.25rem" }}
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: "0.78rem", color: "#64748b", margin: 0, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", textOverflow: "ellipsis" }}>
                {item.description}
              </p>
            </div>
          ))}
          {items.length === 0 && (
             <div style={{ padding: "2rem", textAlign: "center", border: "1px dashed #cbd5e1", borderRadius: 12, color: "#94a3b8", fontSize: "0.85rem" }}>
               No milestones added yet. The default ones will show on the public page until you add your first one.
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
