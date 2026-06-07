"use client";

import { useState, useTransition } from "react";
import type { DatePlan } from "@/lib/types";

const MOODS = ["romantic", "cozy", "surprise", "elegant", "casual", "long-drive", "movie", "cafe"] as const;
const MOOD_ICONS: Record<string, string> = {
  romantic: "♥", cozy: "☕", surprise: "✨", elegant: "◈",
  casual: "◌", "long-drive": "⊳", movie: "▶", cafe: "⊙",
};

interface Props { plans: DatePlan[] }

export default function PlannerClient({ plans: initial }: Props) {
  const [plans, setPlans] = useState(initial);
  const [editing, setEditing] = useState<DatePlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [checklistItem, setChecklistItem] = useState("");
  const [checklist, setChecklist] = useState<string[]>([]);
  const [saving, startSaving] = useTransition();

  const blank: DatePlan = { id: "", title: "", plan_date: null, plan_time: null, place: null, mood: "romantic", activity: null, budget: null, notes: null, checklist: [], is_published: false, is_ai_enhanced: false, created_at: "", updated_at: "" };
  const form = editing ?? blank;

  const handleEdit = (plan: DatePlan) => {
    setEditing(plan);
    setChecklist(plan.checklist ?? []);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditing(null);
    setChecklist([]);
    setShowForm(true);
  };

  const handleAIEnhance = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "plan",
          prompt: `Create a ${form.mood} date plan. Place: ${form.place ?? "not specified"}. Activity: ${form.activity ?? "not specified"}. Budget: ${form.budget ?? "not specified"}.`,
        }),
      });
      const data = await res.json();
      if (data.draft) {
        setEditing(prev => ({ ...(prev ?? blank), notes: data.draft, is_ai_enhanced: true }));
      }
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const handleGenerateChecklist = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "checklist", prompt: `${form.mood} date at ${form.place ?? "unknown venue"}` }),
      });
      const data = await res.json();
      if (data.draft) {
        const items = data.draft.split("\n").filter((l: string) => l.trim()).map((l: string) => l.replace(/^[-•*]\s*/, "").trim());
        setChecklist(items);
      }
    } catch { /* ignore */ }
    setAiLoading(false);
  };

  const addChecklistItem = () => {
    if (checklistItem.trim()) {
      setChecklist(prev => [...prev, checklistItem.trim()]);
      setChecklistItem("");
    }
  };

  const removeChecklistItem = (i: number) => setChecklist(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = {
      id: editing?.id || undefined,
      title: fd.get("title") as string,
      plan_date: fd.get("plan_date") as string,
      plan_time: fd.get("plan_time") as string,
      place: fd.get("place") as string,
      mood: fd.get("mood") as string,
      activity: fd.get("activity") as string,
      budget: fd.get("budget") as string,
      notes: fd.get("notes") as string,
      checklist,
      is_published: fd.get("is_published") === "on",
      is_ai_enhanced: form.is_ai_enhanced,
    };
    startSaving(async () => {
      const res = await fetch("/api/planner", { method: body.id ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.plan) setPlans(prev => body.id ? prev.map(p => p.id === body.id ? data.plan : p) : [data.plan, ...prev]);
      setEditing(null);
      setShowForm(false);
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this date plan?")) return;
    await fetch("/api/planner", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  const togglePublish = async (plan: DatePlan) => {
    const res = await fetch("/api/planner", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: plan.id, is_published: !plan.is_published }) });
    const data = await res.json();
    if (data.plan) setPlans(prev => prev.map(p => p.id === plan.id ? data.plan : p));
  };

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <h1 className="adm-heading">Date Planner</h1>
        <button onClick={handleNew} className="adm-btn adm-btn-primary">+ New Plan</button>
      </div>
      <p className="adm-subheading">Create and publish romantic date invitations for Vanshika.</p>

      {/* ── Form ──────────────────────────────────────────────────── */}
      {showForm && (
        <div className="adm-section" style={{ marginBottom: "1.5rem" }}>
          <div className="adm-section-header">
            <span className="adm-section-title">{editing?.id ? "Edit Date Plan" : "New Date Plan"}</span>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button onClick={handleAIEnhance} className="adm-btn adm-btn-ai" disabled={aiLoading} style={{ fontSize: "0.68rem", padding: "0.3rem 0.7rem" }}>
                {aiLoading ? <span className="adm-spinner" style={{ width: 12, height: 12 }} /> : "⚡ AI Enhance"}
              </button>
              <button onClick={() => { setShowForm(false); setEditing(null); }} className="adm-btn adm-btn-outline" style={{ padding: "0.3rem 0.7rem", fontSize: "0.68rem" }}>Cancel</button>
            </div>
          </div>
          <form onSubmit={handleSave} style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label className="adm-label">Title *</label>
              <input name="title" className="adm-input" required defaultValue={form.title} placeholder="Our Special Evening…" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label className="adm-label">Date</label>
                <input name="plan_date" type="date" className="adm-input" defaultValue={form.plan_date ?? ""} />
              </div>
              <div>
                <label className="adm-label">Time</label>
                <input name="plan_time" className="adm-input" defaultValue={form.plan_time ?? ""} placeholder="7:30 PM" />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <div>
                <label className="adm-label">Place</label>
                <input name="place" className="adm-input" defaultValue={form.place ?? ""} placeholder="Café Roastery, Marine Drive…" />
              </div>
              <div>
                <label className="adm-label">Budget</label>
                <input name="budget" className="adm-input" defaultValue={form.budget ?? ""} placeholder="₹1,200 approx." />
              </div>
            </div>

            <div>
              <label className="adm-label">Mood</label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {MOODS.map(m => (
                  <label key={m} style={{ cursor: "pointer" }}>
                    <input type="radio" name="mood" value={m} defaultChecked={form.mood === m} style={{ display: "none" }} onChange={() => setEditing(prev => ({ ...(prev ?? blank), mood: m }))} />
                    <span style={{ display: "inline-block", padding: "0.4rem 0.85rem", borderRadius: 100, fontSize: "0.75rem", fontWeight: 600, border: "1px solid #e2e8f0", cursor: "pointer", background: form.mood === m ? "#6366f1" : "#fff", color: form.mood === m ? "#fff" : "#475569", transition: "all 0.15s" }}>
                      {MOOD_ICONS[m]} {m}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="adm-label">Activity</label>
              <textarea name="activity" className="adm-textarea" rows={3} defaultValue={form.activity ?? ""} placeholder="What you'll be doing together…" />
            </div>

            <div>
              <label className="adm-label">Notes / AI Enhanced Description</label>
              {form.is_ai_enhanced && <span className="adm-badge adm-badge-ai" style={{ marginBottom: "0.4rem", display: "inline-flex" }}>AI Enhanced</span>}
              <textarea name="notes" className="adm-textarea" rows={5} value={form.notes ?? ""} onChange={e => setEditing(prev => ({ ...(prev ?? blank), notes: e.target.value }))} placeholder="Additional details, special touches, dress code…" />
            </div>

            {/* Checklist */}
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                <label className="adm-label" style={{ marginBottom: 0 }}>Checklist</label>
                <button type="button" onClick={handleGenerateChecklist} className="adm-btn adm-btn-ai" disabled={aiLoading} style={{ fontSize: "0.65rem", padding: "0.25rem 0.6rem" }}>⚡ AI Generate</button>
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <input className="adm-input" value={checklistItem} onChange={e => setChecklistItem(e.target.value)} placeholder="Add item…" onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addChecklistItem())} />
                <button type="button" onClick={addChecklistItem} className="adm-btn adm-btn-outline">Add</button>
              </div>
              {checklist.map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem 0.6rem", borderRadius: 6, background: "#f8fafc", border: "1px solid #e2e8f0", marginBottom: "0.35rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#10b981" }}>☑</span>
                  <span style={{ flex: 1, fontSize: "0.82rem", color: "#374151" }}>{item}</span>
                  <button type="button" onClick={() => removeChecklistItem(i)} style={{ background: "none", border: "none", cursor: "pointer", color: "#ef4444", fontSize: "0.75rem" }}>×</button>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <label className="adm-toggle">
                <input name="is_published" type="checkbox" defaultChecked={form.is_published} />
                <span className="adm-toggle-slider" />
              </label>
              <span style={{ fontSize: "0.8rem", color: "#475569" }}>Publish to Vanshika&apos;s page</span>
            </div>
            <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
              {saving ? "Saving…" : editing?.id ? "Update Plan" : "Save Plan"}
            </button>
          </form>
        </div>
      )}

      {/* ── Plans list ────────────────────────────────────────────── */}
      <div className="adm-section">
        {plans.length === 0 ? (
          <div style={{ padding: "2rem", textAlign: "center", color: "#94a3b8" }}>No date plans yet. Create one above!</div>
        ) : (
          plans.map(plan => (
            <div key={plan.id} className="adm-row" style={{ alignItems: "flex-start" }}>
              <div style={{ fontSize: "1.4rem", flexShrink: 0, color: "#6366f1" }}>{MOOD_ICONS[plan.mood] ?? "◌"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
                  <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1e293b" }}>{plan.title}</span>
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase" }}>{plan.mood}</span>
                  {plan.is_ai_enhanced && <span className="adm-badge adm-badge-ai">AI</span>}
                </div>
                {(plan.plan_date || plan.place) && (
                  <span style={{ fontSize: "0.78rem", color: "#64748b", display: "block" }}>
                    {plan.plan_date && new Date(plan.plan_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                    {plan.place && ` · ${plan.place}`}
                    {plan.plan_time && ` · ${plan.plan_time}`}
                  </span>
                )}
                {plan.checklist?.length > 0 && (
                  <span style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.2rem", display: "block" }}>{plan.checklist.length} checklist items</span>
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", alignItems: "flex-end", flexShrink: 0 }}>
                <span className={`adm-badge ${plan.is_published ? "adm-badge-live" : "adm-badge-draft"}`}>{plan.is_published ? "Live" : "Draft"}</span>
                <div style={{ display: "flex", gap: "0.35rem" }}>
                  <button onClick={() => handleEdit(plan)} className="adm-btn adm-btn-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem" }}>Edit</button>
                  <button onClick={() => togglePublish(plan)} className="adm-btn adm-btn-outline" style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem" }}>{plan.is_published ? "Unpublish" : "Publish"}</button>
                  <button onClick={() => handleDelete(plan.id)} className="adm-btn adm-btn-danger" style={{ padding: "0.25rem 0.6rem", fontSize: "0.68rem" }}>Del</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
