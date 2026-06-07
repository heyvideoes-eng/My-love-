"use client";

import { useState, useTransition } from "react";
import type { SiteSettings } from "@/lib/types";

interface Props { settings: SiteSettings | null }

const SECTIONS = [
  { key: "hero",      label: "Hero / Intro" },
  { key: "dailyNote", label: "Daily Note" },
  { key: "mood",      label: "Mood Selector" },
  { key: "memories",  label: "Memory Timeline" },
  { key: "gallery",   label: "Gallery" },
  { key: "music",     label: "Music Player" },
  { key: "dateplan",  label: "Date Invitation" },
  { key: "lovenotes", label: "Love Notes" },
  { key: "vouchers",  label: "Love Vouchers" },
  { key: "countdown", label: "Countdown Banner" },
  { key: "reminders", label: "Reminders" },
] as const;

export default function SettingsClient({ settings: initial }: Props) {
  const DEFAULT_VIS = Object.fromEntries(SECTIONS.map(s => [s.key, true]));

  const [welcomeText,   setWelcomeText]   = useState(initial?.welcome_text   ?? "For You, Vanshika");
  const [countdownDate, setCountdownDate] = useState(initial?.countdown_date ?? "");
  const [countdownLabel,setCountdownLabel]= useState(initial?.countdown_label ?? "Days until our next chapter");
  const [visibility,    setVisibility]    = useState<Record<string, boolean>>(initial?.sections_visible ?? DEFAULT_VIS);
  const [saved,         setSaved]         = useState(false);
  const [saving,        startSaving]      = useTransition();

  const toggleSection = (key: string) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = () => {
    startSaving(async () => {
      await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          welcome_text:     welcomeText,
          countdown_date:   countdownDate || null,
          countdown_label:  countdownLabel,
          sections_visible: visibility,
        }),
      });
      setSaved(true);
    });
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 className="adm-heading">Site Settings</h1>
      <p className="adm-subheading">Control what appears on Vanshika&apos;s page and personalize the experience.</p>

      {/* ── Welcome Text ─────────────────────────────────────────── */}
      <div className="adm-section" style={{ marginBottom: "1.25rem" }}>
        <div className="adm-section-header"><span className="adm-section-title">Welcome Text</span></div>
        <div style={{ padding: "1.25rem" }}>
          <label className="adm-label">Hero Welcome Line</label>
          <input className="adm-input" value={welcomeText} onChange={e => { setWelcomeText(e.target.value); setSaved(false); }} placeholder="For You, Vanshika" />
          <p style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.35rem" }}>This appears as the main heading on Vanshika&apos;s page.</p>
        </div>
      </div>

      {/* ── Countdown ────────────────────────────────────────────── */}
      <div className="adm-section" style={{ marginBottom: "1.25rem" }}>
        <div className="adm-section-header"><span className="adm-section-title">Countdown Timer</span></div>
        <div style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.9rem" }}>
          <div>
            <label className="adm-label">Target Date</label>
            <input type="date" className="adm-input" value={countdownDate ?? ""} onChange={e => { setCountdownDate(e.target.value); setSaved(false); }} />
          </div>
          <div>
            <label className="adm-label">Countdown Label</label>
            <input className="adm-input" value={countdownLabel} onChange={e => { setCountdownLabel(e.target.value); setSaved(false); }} placeholder="Days until our next chapter" />
          </div>
        </div>
      </div>

      {/* ── Section Visibility ───────────────────────────────────── */}
      <div className="adm-section" style={{ marginBottom: "1.25rem" }}>
        <div className="adm-section-header">
          <span className="adm-section-title">Section Visibility</span>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button onClick={() => { setVisibility(Object.fromEntries(SECTIONS.map(s => [s.key, true]))); setSaved(false); }} className="adm-btn adm-btn-outline" style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem" }}>All On</button>
            <button onClick={() => { setVisibility(Object.fromEntries(SECTIONS.map(s => [s.key, false]))); setSaved(false); }} className="adm-btn adm-btn-outline" style={{ fontSize: "0.65rem", padding: "0.25rem 0.5rem" }}>All Off</button>
          </div>
        </div>
        {SECTIONS.map(({ key, label }) => (
          <div key={key} className="adm-row" style={{ alignItems: "center" }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 500, fontSize: "0.85rem", color: "#1e293b" }}>{label}</span>
              <span style={{ fontSize: "0.7rem", color: "#94a3b8", display: "block" }}>{`sections_visible.${key}`}</span>
            </div>
            <label className="adm-toggle">
              <input type="checkbox" checked={visibility[key] ?? true} onChange={() => toggleSection(key)} />
              <span className="adm-toggle-slider" />
            </label>
          </div>
        ))}
      </div>

      {/* ── Save ─────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button onClick={handleSave} className="adm-btn adm-btn-primary" disabled={saving}>
          {saving ? "Saving…" : "Save Settings"}
        </button>
        {saved && <span style={{ fontSize: "0.78rem", color: "#10b981", fontWeight: 600 }}>✓ Settings saved</span>}
      </div>
    </div>
  );
}
