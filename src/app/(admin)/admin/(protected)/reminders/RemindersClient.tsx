"use client";

import { useState, useTransition } from "react";
import type { Reminder } from "@/lib/types";

const EVENT_TYPES = ["anniversary", "birthday", "special", "custom"] as const;
const PRIORITIES  = ["high", "medium", "low"] as const;

interface Props { reminders: Reminder[] }

export default function RemindersClient({ reminders: initial }: Props) {
  const [reminders, setReminders] = useState(initial);
  const [editing, setEditing]     = useState<Reminder | null>(null);
  const [showForm, setShowForm]   = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, startSaving]     = useTransition();

  const blank: Reminder = { id: "", title: "", event_type: "special", event_date: "", emotional_note: null, priority: "medium", is_ai_suggested: false, is_published: false, created_at: "", updated_at: "" };
  const form = editing ?? blank;

  const handleGenerateNote = async () => {
    if (!form.title) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "reminder", prompt: `${form.event_type} called "${form.title}"` }),
      });
      const data = await res.json();
      if (data.draft) {
        setEditing(prev => ({ ...(prev ?? blank), emotional_note: data.draft }));
      }
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd   = new FormData(e.currentTarget);
    const body = {
      id:            editing?.id || undefined,
      title:         fd.get("title") as string,
      event_type:    fd.get("event_type") as string,
      event_date:    fd.get("event_date") as string,
      emotional_note:fd.get("emotional_note") as string,
      priority:      fd.get("priority") as string,
      is_published:  fd.get("is_published") === "on",
    };
    startSaving(async () => {
      const res  = await fetch("/api/reminders", { method: body.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.reminder) {
        setReminders(prev => body.id ? prev.map(r => r.id === body.id ? data.reminder : r) : [data.reminder, ...prev]);
      }
      setEditing(null);
      setShowForm(false);
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this reminder?")) return;
    await fetch("/api/reminders", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const togglePublish = async (r: Reminder) => {
    const res  = await fetch("/api/reminders", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: r.id, is_published: !r.is_published }) });
    const data = await res.json();
    if (data.reminder) setReminders(prev => prev.map(x => x.id === r.id ? data.reminder : x));
  };

  const priorityColor = (p: string) => p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#64748b";
  const eventIcon = (t: string) => t === "anniversary" ? "♥" : t === "birthday" ? "🎂" : t === "special" ? "✦" : "○";

  const sorted = [...reminders].sort((a, b) => a.event_date.localeCompare(b.event_date));

  return (
    <div style={{ maxWidth: 860 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <h1 className="adm-heading">Reminders</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="adm-btn adm-btn-primary">+ Add Reminder</button>
      </div>
      <p className="adm-subheading">Schedule important dates with emotional notes for Vanshika&apos;s page.</p>

      {/* ── Form ──────────────────────────────────────────────────── */}
      {showForm && (
        <div className="adm-section" style={{ marginBottom: "1.5rem" }}>
          <div className="adm-section-header">
            <span className="adm-section-title">{editing?.id ? "Edit Reminder" : "New Reminder"}</span>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="adm-btn adm-btn-outline" style={{ padding: "0.3rem 0.7rem", fontSize: "0.68rem" }}>Cancel</button>
          </div>
          <form onSubmit={handleSave} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="adm-label">Event Title *</label>
              <input name="title" className="adm-input" required defaultValue={form.title} onChange={e => setEditing(prev => ({ ...(prev ?? blank), title: e.target.value }))} placeholder="Our Anniversary, Her Birthday…" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label className="adm-label">Type</label>
                <select name="event_type" className="adm-select" defaultValue={form.event_type} onChange={e => setEditing(prev => ({ ...(prev ?? blank), event_type: e.target.value as Reminder["event_type"] }))}>
                  {EVENT_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="adm-label">Date *</label>
                <input name="event_date" type="date" className="adm-input" required defaultValue={form.event_date} />
              </div>
              <div>
                <label className="adm-label">Priority</label>
                <select name="priority" className="adm-select" defaultValue={form.priority}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <label className="adm-label" style={{ marginBottom: 0 }}>Emotional Note</label>
                <button type="button" onClick={handleGenerateNote} className="adm-btn adm-btn-ai" disabled={aiLoading} style={{ padding: "0.3rem 0.7rem", fontSize: "0.68rem" }}>
                  {aiLoading ? <><span className="adm-spinner" style={{ width: 12, height: 12 }} /> Generating…</> : "⚡ AI Generate"}
                </button>
              </div>
              <textarea name="emotional_note" className="adm-textarea" rows={4} value={form.emotional_note ?? ""} onChange={e => setEditing(prev => ({ ...(prev ?? blank), emotional_note: e.target.value }))} placeholder="A personal note that appears alongside this reminder on Vanshika's page…" />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <label className="adm-toggle">
                <input name="is_published" type="checkbox" defaultChecked={form.is_published} />
                <span className="adm-toggle-slider" />
              </label>
              <span style={{ fontSize: "0.8rem", color: "#475569" }}>Show on Vanshika&apos;s page</span>
            </div>
            <div>
              <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                {saving ? "Saving…" : editing?.id ? "Update Reminder" : "Save Reminder"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── List ──────────────────────────────────────────────────── */}
      <div className="adm-section">
        {sorted.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>
            No reminders yet. Add important dates for Vanshika.
          </div>
        ) : (
          sorted.map(r => (
            <div key={r.id} className="adm-row" style={{ alignItems: "flex-start" }}>
              <div style={{ fontSize: "1.2rem", color: priorityColor(r.priority), flexShrink: 0, marginTop: "0.1rem" }}>
                {eventIcon(r.event_type)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1e293b" }}>{r.title}</span>
                  <span className={`adm-badge adm-badge-${r.priority}`}>{r.priority}</span>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{r.event_type}</span>
                </div>
                <span style={{ fontSize: "0.78rem", color: "#64748b", display: "block" }}>
                  {new Date(r.event_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
                {r.emotional_note && (
                  <p style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.35rem", fontStyle: "italic", lineHeight: 1.6 }}>
                    &ldquo;{r.emotional_note.slice(0, 160)}{r.emotional_note.length > 160 ? "…" : ""}&rdquo;
                  </p>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end", flexShrink: 0 }}>
                <span className={`adm-badge ${r.is_published ? "adm-badge-live" : "adm-badge-draft"}`}>
                  {r.is_published ? "Live" : "Draft"}
                </span>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button onClick={() => { setEditing(r); setShowForm(true); }} className="adm-btn adm-btn-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem" }}>Edit</button>
                  <button onClick={() => togglePublish(r)} className="adm-btn adm-btn-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem" }}>
                    {r.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => handleDelete(r.id)} className="adm-btn adm-btn-danger" style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem" }}>Del</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
