"use client";

import { useState } from "react";

type PromptType = "note" | "reminder" | "plan" | "microcopy" | "summarize" | "music";

const PROMPT_CONFIGS: Record<PromptType, { label: string; icon: string; placeholder: string; description: string }> = {
  note:      { label: "Love Note",     icon: "♡", placeholder: "e.g. 'Write a poetic letter about why she makes ordinary days feel special'", description: "Generate heartfelt love notes, letters, or micro-messages." },
  reminder:  { label: "Reminder Copy", icon: "◷", placeholder: "e.g. 'Romantic copy for our 6-month anniversary reminder'",             description: "Generate emotional copy for reminder notes." },
  plan:      { label: "Date Plan",     icon: "⊡", placeholder: "e.g. 'Plan a cozy at-home cinema night with candles and her favourite snacks'", description: "Generate an AI-enhanced date plan description." },
  microcopy: { label: "Microcopy",     icon: "✎", placeholder: "e.g. 'A 10-word tagline for the hero section of the site'",             description: "Short emotional phrases, taglines, and UI copy." },
  summarize: { label: "Summarize",     icon: "◌", placeholder: "Paste a raw memory note here to have AI polish it into something beautiful…", description: "Polish a raw memory description into something elegant." },
  music:     { label: "Music Rec.",    icon: "♪", placeholder: "e.g. 'Recommend 3 songs for a tender late-night mood'",                 description: "Get AI-curated song recommendations by mood." },
};

interface HistoryItem {
  type: PromptType;
  prompt: string;
  draft: string;
  timestamp: string;
}

export default function AICopilotPage() {
  const [activeType, setActiveType] = useState<PromptType>("note");
  const [prompt, setPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [saved, setSaved] = useState(false);
  const [saveTarget, setSaveTarget] = useState<"notes" | "messages" | "none">("notes");

  const config = PROMPT_CONFIGS[activeType];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setDraft("");
    setSaved(false);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: activeType, prompt }),
      });
      const data = await res.json();
      const text = data.draft ?? "Failed to generate. Please try again.";
      setDraft(text);
      setHistory(prev => [{ type: activeType, prompt, draft: text, timestamp: new Date().toLocaleTimeString() }, ...prev.slice(0, 9)]);
    } catch {
      setDraft("An error occurred. Check your API configuration.");
    }
    setLoading(false);
  };

  const handleAccept = async () => {
    if (!draft || saveTarget === "none") { setSaved(true); return; }
    try {
      if (saveTarget === "notes") {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: draft, category: "letter", is_ai_generated: true, is_published: false }),
        });
      } else if (saveTarget === "messages") {
        await fetch("/api/ai/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "save_message", content: draft }),
        });
      }
      setSaved(true);
    } catch { /* ignore */ }
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <h1 className="adm-heading">AI Copilot</h1>
      <p className="adm-subheading">Your intelligence layer — generate, refine, and save content with NVIDIA AI.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "1.5rem", alignItems: "start" }}>
        {/* ── Main Generator ─────────────────────────────────────── */}
        <div>
          {/* Type selector */}
          <div className="adm-tabs">
            {(Object.entries(PROMPT_CONFIGS) as [PromptType, typeof PROMPT_CONFIGS[PromptType]][]).map(([type, cfg]) => (
              <button
                key={type}
                className={`adm-tab${activeType === type ? " active" : ""}`}
                onClick={() => { setActiveType(type); setDraft(""); setSaved(false); setPrompt(""); }}
              >
                {cfg.icon} {cfg.label}
              </button>
            ))}
          </div>

          {/* Description */}
          <p style={{ fontSize: "0.82rem", color: "#64748b", marginBottom: "1rem" }}>{config.description}</p>

          {/* Prompt input */}
          <div className="adm-section" style={{ marginBottom: "1rem" }}>
            <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label className="adm-label">Your Prompt</label>
              <textarea
                className="adm-textarea"
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder={config.placeholder}
                rows={4}
                onKeyDown={e => e.key === "Enter" && e.metaKey && handleGenerate()}
              />
              <button onClick={handleGenerate} className="adm-btn adm-btn-ai" disabled={loading || !prompt.trim()}>
                {loading ? <><span className="adm-spinner" /> Generating with NVIDIA AI…</> : `⚡ Generate ${config.label}`}
              </button>
            </div>
          </div>

          {/* Output */}
          {draft && (
            <div className="adm-section">
              <div className="adm-section-header">
                <span className="adm-section-title">AI Output — Review before saving</span>
                {saved && <span className="adm-badge adm-badge-live">Saved ✓</span>}
              </div>
              <div style={{ padding: "1.25rem" }}>
                <div className="adm-ai-box" style={{ marginBottom: "1rem" }}>
                  <textarea
                    className="adm-textarea"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    rows={10}
                    style={{ background: "transparent", border: "none", padding: 0, boxShadow: "none", resize: "vertical", fontStyle: "italic", fontSize: "0.92rem" }}
                  />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
                  <select className="adm-select" value={saveTarget} onChange={e => setSaveTarget(e.target.value as typeof saveTarget)} style={{ width: "auto", fontSize: "0.75rem" }}>
                    <option value="notes">Save to Love Notes (draft)</option>
                    <option value="messages">Save to Daily Messages (draft)</option>
                    <option value="none">Copy only — don&apos;t save</option>
                  </select>
                  <button onClick={handleAccept} className="adm-btn adm-btn-success" disabled={saved}>
                    {saved ? "✓ Accepted" : "Accept & Save"}
                  </button>
                  <button onClick={() => { setDraft(""); setSaved(false); }} className="adm-btn adm-btn-danger">
                    Discard
                  </button>
                  <button onClick={() => navigator.clipboard?.writeText(draft)} className="adm-btn adm-btn-outline">
                    Copy
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Session History ─────────────────────────────────────── */}
        <div>
          <div className="adm-section">
            <div className="adm-section-header">
              <span className="adm-section-title">Session History</span>
              {history.length > 0 && (
                <button onClick={() => setHistory([])} className="adm-btn adm-btn-outline" style={{ padding: "0.25rem 0.5rem", fontSize: "0.62rem" }}>Clear</button>
              )}
            </div>
            {history.length === 0 ? (
              <div style={{ padding: "1.25rem", color: "#94a3b8", fontSize: "0.8rem" }}>
                Your AI generations this session will appear here.
              </div>
            ) : (
              history.map((item, i) => (
                <div
                  key={i}
                  className="adm-row"
                  style={{ cursor: "pointer", flexDirection: "column", alignItems: "flex-start", gap: "0.3rem" }}
                  onClick={() => { setDraft(item.draft); setPrompt(item.prompt); setActiveType(item.type); setSaved(false); }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", width: "100%" }}>
                    <span style={{ fontSize: "0.75rem", color: "#6366f1" }}>{PROMPT_CONFIGS[item.type].icon}</span>
                    <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#1e293b" }}>{PROMPT_CONFIGS[item.type].label}</span>
                    <span style={{ fontSize: "0.62rem", color: "#94a3b8", marginLeft: "auto" }}>{item.timestamp}</span>
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "#64748b", lineHeight: 1.5 }}>
                    {item.draft.slice(0, 100)}…
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Tips */}
          <div className="adm-section" style={{ marginTop: "1rem" }}>
            <div className="adm-section-header"><span className="adm-section-title">Tips</span></div>
            <div style={{ padding: "1rem" }}>
              {[
                "⌘ + Enter to generate",
                "Edit the output before accepting",
                "Always preview before publishing",
                "AI drafts save as unpublished",
              ].map((tip, i) => (
                <div key={i} style={{ fontSize: "0.72rem", color: "#64748b", padding: "0.3rem 0", borderBottom: "1px solid #f1f5f9" }}>{tip}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
