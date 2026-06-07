"use client";

import { useState, useTransition } from "react";
import type { LoveNote } from "@/lib/types";

const CATEGORIES = ["letter", "reason", "micro-note", "vow"] as const;
const MOODS = ["tender", "passionate", "playful", "nostalgic", "poetic", "fierce"];

interface Props {
  notes: LoveNote[];
}

export default function NotesClient({ notes: initial }: Props) {
  const [notes, setNotes] = useState(initial);
  const [editing, setEditing] = useState<LoveNote | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiDraft, setAiDraft] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, startSaving] = useTransition();
  const [activeTab, setActiveTab] = useState<"all" | "draft" | "published">("all");

  const form = editing ?? {
    id: "", title: "", content: "", category: "letter" as const,
    mood_tag: "", is_published: false, is_ai_generated: false,
    created_at: "", updated_at: "",
  };

  const filtered = notes.filter(n =>
    activeTab === "all" ? true :
    activeTab === "draft" ? !n.is_published :
    n.is_published
  );

  const handleGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "note", prompt: aiPrompt }),
      });
      const data = await res.json();
      setAiDraft(data.draft ?? "");
    } catch {
      setAiDraft("Failed to generate. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const acceptDraft = () => {
    setEditing(prev => {
      const base = prev ?? { id: "", title: "", content: "", category: "letter" as const, mood_tag: "", is_published: false, is_ai_generated: true, created_at: "", updated_at: "" };
      return { ...base, content: aiDraft, is_ai_generated: true };
    });
    setShowForm(true);
    setAiDraft("");
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      id: editing?.id || undefined,
      title: fd.get("title") as string,
      content: fd.get("content") as string,
      category: fd.get("category") as string,
      mood_tag: fd.get("mood_tag") as string,
      is_published: fd.get("is_published") === "on",
      is_ai_generated: editing?.is_ai_generated ?? false,
    };

    startSaving(async () => {
      const res = await fetch("/api/notes", {
        method: body.id ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.note) {
        setNotes(prev => body.id
          ? prev.map(n => n.id === body.id ? data.note : n)
          : [data.note, ...prev]
        );
      }
      setEditing(null);
      setShowForm(false);
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this note permanently?")) return;
    await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  const togglePublish = async (note: LoveNote) => {
    const res = await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id, is_published: !note.is_published }),
    });
    const data = await res.json();
    if (data.note) setNotes(prev => prev.map(n => n.id === note.id ? data.note : n));
  };

  const categoryColor = (c: string) =>
    c === "letter" ? "#6366f1" : c === "reason" ? "#ec4899" : c === "micro-note" ? "#10b981" : "#f59e0b";

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <h1 className="adm-heading">Love Notes</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="adm-btn adm-btn-primary">
          + New Note
        </button>
      </div>
      <p className="adm-subheading">Write, generate, and publish love notes to Vanshika&apos;s page.</p>

      {/* ── AI Generator ────────────────────────────────────────────── */}
      <div className="adm-section" style={{ marginBottom: "1.5rem" }}>
        <div className="adm-section-header">
          <span className="adm-section-title">⚡ AI Generator</span>
        </div>
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <textarea
            className="adm-textarea"
            placeholder="Describe the note you want to generate... e.g. 'Write a tender love letter about late-night conversations'"
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            rows={3}
            style={{ minHeight: 80 }}
          />
          <button onClick={handleGenerate} className="adm-btn adm-btn-ai" disabled={aiLoading}>
            {aiLoading ? <><span className="adm-spinner" /> Generating…</> : "⚡ Generate with AI"}
          </button>
          {aiDraft && (
            <div className="adm-ai-box">
              <p style={{ whiteSpace: "pre-wrap", marginBottom: "1rem" }}>{aiDraft}</p>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button onClick={acceptDraft} className="adm-btn adm-btn-primary" style={{ fontSize: "0.72rem" }}>Accept &amp; Edit</button>
                <button onClick={() => setAiDraft("")} className="adm-btn adm-btn-outline" style={{ fontSize: "0.72rem" }}>Discard</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Form ────────────────────────────────────────────────────── */}
      {showForm && (
        <div className="adm-section" style={{ marginBottom: "1.5rem" }}>
          <div className="adm-section-header">
            <span className="adm-section-title">{editing?.id ? "Edit Note" : "New Note"}</span>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="adm-btn adm-btn-outline" style={{ padding: "0.3rem 0.7rem", fontSize: "0.68rem" }}>Cancel</button>
          </div>
          <form onSubmit={handleSave} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="adm-label">Title (optional)</label>
              <input name="title" className="adm-input" defaultValue={form.title ?? ""} placeholder="Give this note a title…" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label className="adm-label">Category</label>
                <select name="category" className="adm-select" defaultValue={form.category}>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="adm-label">Mood Tag</label>
                <select name="mood_tag" className="adm-select" defaultValue={form.mood_tag ?? ""}>
                  <option value="">— none —</option>
                  {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="adm-label">Content *</label>
              <textarea name="content" className="adm-textarea" required defaultValue={form.content} placeholder="Write from the heart…" rows={8} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <label className="adm-toggle">
                <input name="is_published" type="checkbox" defaultChecked={form.is_published} />
                <span className="adm-toggle-slider" />
              </label>
              <span style={{ fontSize: "0.8rem", color: "#475569" }}>Publish to Vanshika&apos;s page</span>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                {saving ? "Saving…" : editing?.id ? "Update Note" : "Save Note"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Notes list ──────────────────────────────────────────────── */}
      <div className="adm-tabs">
        {(["all", "draft", "published"] as const).map(t => (
          <button key={t} className={`adm-tab${activeTab === t ? " active" : ""}`} onClick={() => setActiveTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)} ({t === "all" ? notes.length : t === "draft" ? notes.filter(n => !n.is_published).length : notes.filter(n => n.is_published).length})
          </button>
        ))}
      </div>

      <div className="adm-section">
        {filtered.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No notes in this category.</div>
        ) : (
          filtered.map(note => (
            <div key={note.id} className="adm-row" style={{ alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.35rem", flexWrap: "wrap" }}>
                  {note.title && <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "#1e293b" }}>{note.title}</span>}
                  <span style={{ background: categoryColor(note.category), color: "#fff", fontSize: "0.6rem", padding: "0.15rem 0.5rem", borderRadius: 100, fontWeight: 700, textTransform: "uppercase" }}>{note.category}</span>
                  {note.is_ai_generated && <span className="adm-badge adm-badge-ai">AI</span>}
                  {note.mood_tag && <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{note.mood_tag}</span>}
                </div>
                <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.65 }}>
                  {note.content.slice(0, 180)}{note.content.length > 180 ? "…" : ""}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end", flexShrink: 0 }}>
                <span className={`adm-badge ${note.is_published ? "adm-badge-live" : "adm-badge-draft"}`}>
                  {note.is_published ? "Live" : "Draft"}
                </span>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button onClick={() => { setEditing(note); setShowForm(true); }} className="adm-btn adm-btn-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem" }}>Edit</button>
                  <button onClick={() => togglePublish(note)} className="adm-btn adm-btn-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem" }}>
                    {note.is_published ? "Unpublish" : "Publish"}
                  </button>
                  <button onClick={() => handleDelete(note.id)} className="adm-btn adm-btn-danger" style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem" }}>Del</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
