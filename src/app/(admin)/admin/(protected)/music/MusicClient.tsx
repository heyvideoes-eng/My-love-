"use client";

import { useState, useTransition } from "react";
import type { MusicTrack } from "@/lib/types";

interface Props { tracks: MusicTrack[] }

const MOODS = ["tender", "upbeat", "romantic", "nostalgic", "calm", "joyful", "intense"];

export default function MusicClient({ tracks: initial }: Props) {
  const [tracks, setTracks] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MusicTrack | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; title: string; artist: string; thumbnail: string }[]>([]);
  const [searching, setSearching] = useState(false);
  const [saving, startSaving] = useTransition();

  const blank: MusicTrack = { id: "", title: "", artist: null, youtube_id: null, thumbnail_url: null, mood_tag: null, is_featured: false, display_order: 0, is_published: false, created_at: "", updated_at: "" };
  const form = editing ?? blank;

  const handleSearch = async () => {
    if (!search.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/youtube/search?q=${encodeURIComponent(search)}&limit=6`);
      const data = await res.json();
      setSearchResults(data.results ?? []);
    } catch { setSearchResults([]); }
    setSearching(false);
  };

  const selectResult = (r: { id: string; title: string; artist: string; thumbnail: string }) => {
    setEditing(prev => ({ ...(prev ?? blank), title: r.title, artist: r.artist, youtube_id: r.id, thumbnail_url: r.thumbnail }));
    setShowForm(true);
    setSearchResults([]);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      id: editing?.id || undefined,
      title: fd.get("title") as string,
      artist: fd.get("artist") as string,
      youtube_id: form.youtube_id,
      thumbnail_url: form.thumbnail_url,
      mood_tag: fd.get("mood_tag") as string,
      is_featured: fd.get("is_featured") === "on",
      is_published: fd.get("is_published") === "on",
    };
    startSaving(async () => {
      const res = await fetch("/api/music", { method: body.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.track) setTracks(prev => body.id ? prev.map(t => t.id === body.id ? data.track : t) : [data.track, ...prev]);
      setEditing(null);
      setShowForm(false);
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this track?")) return;
    await fetch("/api/music", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setTracks(prev => prev.filter(t => t.id !== id));
  };

  const togglePublish = async (t: MusicTrack) => {
    const res = await fetch("/api/music", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: t.id, is_published: !t.is_published }) });
    const data = await res.json();
    if (data.track) setTracks(prev => prev.map(x => x.id === t.id ? data.track : x));
  };

  const toggleFeatured = async (t: MusicTrack) => {
    const res = await fetch("/api/music", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: t.id, is_featured: !t.is_featured }) });
    const data = await res.json();
    if (data.track) setTracks(prev => prev.map(x => x.id === t.id ? data.track : x));
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <h1 className="adm-heading">Music</h1>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="adm-btn adm-btn-primary">+ Add Track</button>
      </div>
      <p className="adm-subheading">Manage the playlist and featured song on Vanshika&apos;s page.</p>

      {/* ── YouTube Search ─────────────────────────────────────────── */}
      <div className="adm-section" style={{ marginBottom: "1.5rem" }}>
        <div className="adm-section-header"><span className="adm-section-title">♪ Search YouTube</span></div>
        <div style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1rem" }}>
            <input className="adm-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for a song…" onKeyDown={e => e.key === "Enter" && handleSearch()} />
            <button onClick={handleSearch} className="adm-btn adm-btn-primary" disabled={searching}>
              {searching ? <span className="adm-spinner" /> : "Search"}
            </button>
          </div>
          {searchResults.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.75rem" }}>
              {searchResults.map(r => (
                <button key={r.id} onClick={() => selectResult(r)} style={{ cursor: "pointer", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "0.75rem", textAlign: "left", transition: "all 0.15s" }}>
                  {r.thumbnail && <img src={r.thumbnail} alt={r.title} style={{ width: "100%", borderRadius: 6, marginBottom: "0.5rem", display: "block" }} />}
                  <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.4, marginBottom: "0.2rem" }}>{r.title.slice(0, 60)}</p>
                  <p style={{ fontSize: "0.68rem", color: "#64748b" }}>{r.artist}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Form ──────────────────────────────────────────────────── */}
      {showForm && (
        <div className="adm-section" style={{ marginBottom: "1.5rem" }}>
          <div className="adm-section-header">
            <span className="adm-section-title">{editing?.id ? "Edit Track" : "Add Track"}</span>
            <button onClick={() => { setShowForm(false); setEditing(null); }} className="adm-btn adm-btn-outline" style={{ padding: "0.3rem 0.7rem", fontSize: "0.68rem" }}>Cancel</button>
          </div>
          <form onSubmit={handleSave} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
            {form.thumbnail_url && (
              <img src={form.thumbnail_url} alt="thumbnail" style={{ width: 120, borderRadius: 8, border: "1px solid #e2e8f0" }} />
            )}
            {form.youtube_id && (
              <div style={{ fontSize: "0.75rem", color: "#64748b", background: "#f1f5f9", padding: "0.4rem 0.75rem", borderRadius: 6 }}>
                YouTube ID: <strong>{form.youtube_id}</strong>
              </div>
            )}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label className="adm-label">Song Title *</label>
                <input name="title" className="adm-input" required defaultValue={form.title} placeholder="Song title…" />
              </div>
              <div>
                <label className="adm-label">Artist</label>
                <input name="artist" className="adm-input" defaultValue={form.artist ?? ""} placeholder="Artist name…" />
              </div>
            </div>
            <div>
              <label className="adm-label">Mood Tag</label>
              <select name="mood_tag" className="adm-select" defaultValue={form.mood_tag ?? ""}>
                <option value="">— none —</option>
                {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: "1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <label className="adm-toggle"><input name="is_featured" type="checkbox" defaultChecked={form.is_featured} /><span className="adm-toggle-slider" /></label>
                <span style={{ fontSize: "0.8rem", color: "#475569" }}>Song of the Day ⭐</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                <label className="adm-toggle"><input name="is_published" type="checkbox" defaultChecked={form.is_published} /><span className="adm-toggle-slider" /></label>
                <span style={{ fontSize: "0.8rem", color: "#475569" }}>Publish to playlist</span>
              </div>
            </div>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
              {saving ? "Saving…" : editing?.id ? "Update Track" : "Add Track"}
            </button>
          </form>
        </div>
      )}

      {/* ── Track list ────────────────────────────────────────────── */}
      <div className="adm-section">
        {tracks.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No tracks yet. Search YouTube and add songs.</div>
        ) : (
          tracks.map(t => (
            <div key={t.id} className="adm-row" style={{ alignItems: "center" }}>
              {t.thumbnail_url
                ? <img src={t.thumbnail_url} alt={t.title} style={{ width: 48, height: 36, borderRadius: 6, objectFit: "cover", flexShrink: 0 }} />
                : <div style={{ width: 48, height: 36, borderRadius: 6, background: "#1e293b", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", flexShrink: 0 }}>♪</div>
              }
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>{t.title}</span>
                  {t.is_featured && <span style={{ fontSize: "0.65rem", background: "#f59e0b", color: "#fff", padding: "0.1rem 0.45rem", borderRadius: 100, fontWeight: 700 }}>Song of Day</span>}
                  {t.mood_tag && <span style={{ fontSize: "0.68rem", color: "#94a3b8" }}>{t.mood_tag}</span>}
                </div>
                {t.artist && <span style={{ fontSize: "0.75rem", color: "#64748b" }}>{t.artist}</span>}
              </div>
              <div style={{ display: "flex", gap: "0.35rem", alignItems: "center" }}>
                <span className={`adm-badge ${t.is_published ? "adm-badge-live" : "adm-badge-draft"}`}>{t.is_published ? "Live" : "Draft"}</span>
                <button onClick={() => toggleFeatured(t)} className="adm-btn adm-btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.65rem" }}>
                  {t.is_featured ? "Unfeature" : "⭐ Feature"}
                </button>
                <button onClick={() => togglePublish(t)} className="adm-btn adm-btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.65rem" }}>
                  {t.is_published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => { setEditing(t); setShowForm(true); }} className="adm-btn adm-btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.65rem" }}>Edit</button>
                <button onClick={() => handleDelete(t.id)} className="adm-btn adm-btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.65rem" }}>Del</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
