"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { SpecialDate } from "@/components/public/CountdownHighlight";
import { Plus, Trash, Edit2, Calendar, Save } from "lucide-react";

export default function AdminDatesPage() {
  const [dates, setDates] = useState<SpecialDate[]>([]);
  const [editingDate, setEditingDate] = useState<SpecialDate | null>(null);
  
  // Form fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [tag, setTag] = useState<SpecialDate["tag"]>("date");
  const [note, setNote] = useState("");

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadDates = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("dates_milestones")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) {
        setDates(data as SpecialDate[]);
      }
    };
    loadDates();
  }, []);

  const handleSaveDates = async (newDates: SpecialDate[]) => {
    setIsSaving(true);
    setMessage("");

    const supabase = createClient();
    if (supabase) {
      // Clear and re-populate milestones
      await supabase.from("dates_milestones").delete().neq("id", "0");
      if (newDates.length > 0) {
        const { error } = await supabase.from("dates_milestones").upsert(
          newDates.map(d => ({
            id: d.id,
            title: d.title,
            date: d.date,
            tag: d.tag,
            note: d.note
          }))
        );

        if (error) {
          setMessage("Database error: " + error.message);
          setIsSaving(false);
          return;
        }
      }

      // Broadcast update
      const channel = supabase.channel("rv_realtime_sync");
      await channel.subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.send({
            type: "broadcast",
            event: "dates_update",
            payload: { dates: newDates }
          });
          setMessage("Milestone dates updated and synced in real-time!");
        }
      });
    } else {
      setMessage("Database client unavailable.");
    }
    setIsSaving(false);
  };

  const handleAddOrEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    let updatedDates: SpecialDate[] = [];

    if (editingDate) {
      // Edit
      updatedDates = dates.map(d =>
        d.id === editingDate.id ? { ...d, title, date, tag, note } : d
      );
      setEditingDate(null);
    } else {
      // Add
      const newD: SpecialDate = {
        id: crypto.randomUUID(),
        title,
        date,
        tag,
        note
      };
      updatedDates = [...dates, newD];
    }

    setDates(updatedDates);
    handleSaveDates(updatedDates);

    // Reset fields
    setTitle("");
    setDate("");
    setTag("date");
    setNote("");
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this milestone reminder?")) {
      const updated = dates.filter(d => d.id !== id);
      setDates(updated);
      handleSaveDates(updated);
    }
  };

  const handleEditClick = (d: SpecialDate) => {
    setEditingDate(d);
    setTitle(d.title);
    setDate(d.date);
    setTag(d.tag);
    setNote(d.note || "");
  };

  return (
    <div style={{ maxWidth: 860, fontFamily: "inherit" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
        Milestone Dates Manager
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2rem" }}>
        Add, update, or remove special dates for counting down.
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
        {/* Date Form */}
        <form onSubmit={handleAddOrEdit} style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#fff", padding: "1.5rem", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>
            {editingDate ? "Edit Milestone" : "Add New Milestone"}
          </h2>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Vanshika's Birthday"
              required
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Target Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Category Tag</label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value as any)}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
            >
              <option value="birthday">Birthday 🎂</option>
              <option value="anniversary">Anniversary 💍</option>
              <option value="meeting">First Meeting ✨</option>
              <option value="date">Date Night 🍷</option>
              <option value="moment">Special Moment 💝</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Optional Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Write a sweet summary note..."
              rows={3}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff", resize: "none" }}
            />
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <button
              type="submit"
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
              {editingDate ? "Save Changes" : "Create Milestone"}
            </button>
            {editingDate && (
              <button
                type="button"
                onClick={() => {
                  setEditingDate(null);
                  setTitle("");
                  setDate("");
                  setTag("date");
                  setNote("");
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

        {/* Dates List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {dates.map((d) => (
            <div
              key={d.id}
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
                <span style={{
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: d.tag === "birthday" ? "#b45309" : d.tag === "anniversary" ? "#be123c" : "#1d4ed8",
                  letterSpacing: "0.05em"
                }}>
                  {d.tag}
                </span>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#1e293b", margin: "0.2rem 0" }}>
                  {d.title}
                </h3>
                <span style={{ fontSize: "0.78rem", color: "#64748b", fontWeight: 500 }}>
                  {new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
                {d.note && (
                  <p style={{ fontSize: "0.8rem", color: "#64748b", fontStyle: "italic", marginTop: "0.5rem" }}>
                    &ldquo;{d.note}&rdquo;
                  </p>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.25rem" }}>
                <button
                  type="button"
                  onClick={() => handleEditClick(d)}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.25rem" }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(d.id)}
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
