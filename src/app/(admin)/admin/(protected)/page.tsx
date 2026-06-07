import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

// ─── Admin Overview Dashboard ─────────────────────────────────────────────────

export default async function AdminOverviewPage() {
  const supabase = await createServerSupabaseClient();

  let counts = {
    publishedMessages: 0,
    draftMessages: 0,
    memories: 0,
    aiGenerations: 0,
    reminders: 0,
    loveNotes: 0,
    musicTracks: 0,
    datePlans: 0,
  };
  let latestMessage = "";
  let upcomingReminders: { title: string; event_date: string; event_type: string; priority: string }[] = [];
  let recentNotes: { title: string | null; content: string; is_ai_generated: boolean }[] = [];

  if (supabase) {
    const [pub, draft, mem, ai, latest, remCount, notes, music, plans, upcomingRem, recentNote] =
      await Promise.all([
        supabase.from("daily_messages").select("id", { count: "exact" }).eq("is_published", true),
        supabase.from("daily_messages").select("id", { count: "exact" }).eq("is_published", false),
        supabase.from("memories").select("id", { count: "exact" }).eq("is_published", true),
        supabase.from("ai_generations").select("id", { count: "exact" }),
        supabase.from("daily_messages").select("content").eq("is_published", true).order("created_at", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("reminders").select("id", { count: "exact" }),
        supabase.from("love_notes").select("id", { count: "exact" }).eq("is_published", true),
        supabase.from("music_tracks").select("id", { count: "exact" }).eq("is_published", true),
        supabase.from("date_plans").select("id", { count: "exact" }).eq("is_published", true),
        supabase.from("reminders").select("title,event_date,event_type,priority").gte("event_date", new Date().toISOString().slice(0, 10)).order("event_date", { ascending: true }).limit(3),
        supabase.from("love_notes").select("title,content,is_ai_generated").order("created_at", { ascending: false }).limit(3),
      ]);

    counts = {
      publishedMessages: pub.count ?? 0,
      draftMessages: draft.count ?? 0,
      memories: mem.count ?? 0,
      aiGenerations: ai.count ?? 0,
      reminders: remCount.count ?? 0,
      loveNotes: notes.count ?? 0,
      musicTracks: music.count ?? 0,
      datePlans: plans.count ?? 0,
    };
    latestMessage = latest.data?.content ?? "";
    upcomingReminders = (upcomingRem.data ?? []) as typeof upcomingReminders;
    recentNotes = (recentNote.data ?? []) as typeof recentNotes;
  }

  const stats = [
    { label: "Published Messages", value: counts.publishedMessages, href: "/admin/messages", icon: "✎", color: "#6366f1" },
    { label: "Draft Messages",     value: counts.draftMessages,     href: "/admin/messages", icon: "○", color: "#94a3b8" },
    { label: "Memories",           value: counts.memories,          href: "/admin/memories", icon: "◌", color: "#ec4899" },
    { label: "AI Generations",     value: counts.aiGenerations,     href: "/admin/ai",       icon: "⚡", color: "#8b5cf6" },
    { label: "Reminders",          value: counts.reminders,         href: "/admin/reminders",icon: "◷", color: "#f59e0b" },
    { label: "Love Notes",         value: counts.loveNotes,         href: "/admin/notes",    icon: "♡", color: "#ef4444" },
    { label: "Music Tracks",       value: counts.musicTracks,       href: "/admin/music",    icon: "♪", color: "#10b981" },
    { label: "Date Plans",         value: counts.datePlans,         href: "/admin/planner",  icon: "⊡", color: "#0ea5e9" },
  ];

  const quickActions = [
    { href: "/admin/messages",  label: "+ New Note" },
    { href: "/admin/notes",     label: "+ Love Note" },
    { href: "/admin/reminders", label: "+ Reminder" },
    { href: "/admin/planner",   label: "+ Date Plan" },
    { href: "/admin/ai",        label: "⚡ AI Copilot" },
  ];

  const priorityColor = (p: string) =>
    p === "high" ? "#ef4444" : p === "medium" ? "#f59e0b" : "#94a3b8";

  const eventIcon = (t: string) =>
    t === "anniversary" ? "♥" : t === "birthday" ? "🎂" : t === "special" ? "✦" : "○";

  return (
    <div style={{ maxWidth: 960 }}>
      <h1 className="adm-heading">Overview</h1>
      <p className="adm-subheading">Your control center — manage everything that appears on Vanshika&apos;s page.</p>

      {/* ── Quick Actions ──────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
        {quickActions.map(({ href, label }) => (
          <Link key={href} href={href} className="adm-btn adm-btn-outline">
            {label}
          </Link>
        ))}
      </div>

      {/* ── Stats grid ──────────────────────────────────────────────── */}
      <div className="adm-grid-4" style={{ marginBottom: "2rem" }}>
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="adm-stat">
            <span style={{ fontSize: "1.1rem", color: s.color, display: "block", marginBottom: "0.3rem" }}>{s.icon}</span>
            <span className="adm-stat-num" style={{ color: s.color }}>{s.value}</span>
            <span className="adm-stat-label">{s.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Two-column info row ──────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.5rem" }}>

        {/* Live message */}
        <div className="adm-section">
          <div className="adm-section-header">
            <span className="adm-section-title">Currently Live on Vanshika&apos;s Page</span>
            <Link href="/admin/messages" className="adm-btn adm-btn-outline" style={{ padding: "0.3rem 0.7rem", fontSize: "0.68rem" }}>Edit</Link>
          </div>
          <div style={{ padding: "1.25rem" }}>
            {latestMessage ? (
              <p style={{ fontSize: "0.95rem", color: "#374151", lineHeight: 1.7, fontStyle: "italic" }}>
                &ldquo;{latestMessage}&rdquo;
              </p>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No message published yet.</p>
            )}
          </div>
        </div>

        {/* Upcoming reminders */}
        <div className="adm-section">
          <div className="adm-section-header">
            <span className="adm-section-title">Upcoming Reminders</span>
            <Link href="/admin/reminders" className="adm-btn adm-btn-outline" style={{ padding: "0.3rem 0.7rem", fontSize: "0.68rem" }}>View All</Link>
          </div>
          {upcomingReminders.length === 0 ? (
            <div style={{ padding: "1.25rem" }}>
              <p style={{ color: "#94a3b8", fontSize: "0.85rem" }}>No upcoming reminders.</p>
              <Link href="/admin/reminders" className="adm-btn adm-btn-primary" style={{ marginTop: "0.75rem", fontSize: "0.72rem" }}>+ Add Reminder</Link>
            </div>
          ) : (
            upcomingReminders.map((r) => (
              <div key={r.event_date + r.title} className="adm-row" style={{ flexDirection: "column", gap: "0.25rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ color: priorityColor(r.priority), fontSize: "0.85rem" }}>{eventIcon(r.event_type)}</span>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#1e293b" }}>{r.title}</span>
                  <span className={`adm-badge adm-badge-${r.priority}`} style={{ marginLeft: "auto" }}>{r.priority}</span>
                </div>
                <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                  {new Date(r.event_date).toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Recent Love Notes ─────────────────────────────────────── */}
      {recentNotes.length > 0 && (
        <div className="adm-section">
          <div className="adm-section-header">
            <span className="adm-section-title">Recent Love Notes</span>
            <Link href="/admin/notes" className="adm-btn adm-btn-outline" style={{ padding: "0.3rem 0.7rem", fontSize: "0.68rem" }}>Manage</Link>
          </div>
          {recentNotes.map((n, i) => (
            <div key={i} className="adm-row">
              <div style={{ flex: 1 }}>
                {n.title && <span style={{ fontWeight: 600, fontSize: "0.82rem", color: "#1e293b", display: "block" }}>{n.title}</span>}
                <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.6, marginTop: "0.2rem" }}>
                  {n.content.slice(0, 120)}{n.content.length > 120 ? "…" : ""}
                </p>
              </div>
              {n.is_ai_generated && <span className="adm-badge adm-badge-ai">AI</span>}
            </div>
          ))}
        </div>
      )}

      {/* ── Content Health ─────────────────────────────────────────── */}
      <div className="adm-section">
        <div className="adm-section-header">
          <span className="adm-section-title">Content Health</span>
        </div>
        <div style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Daily Messages", count: counts.publishedMessages, href: "/admin/messages" },
            { label: "Memories",       count: counts.memories,          href: "/admin/memories" },
            { label: "Love Notes",     count: counts.loveNotes,         href: "/admin/notes" },
            { label: "Music Tracks",   count: counts.musicTracks,       href: "/admin/music" },
            { label: "Date Plans",     count: counts.datePlans,         href: "/admin/planner" },
          ].map(({ label, count, href }) => (
            <Link
              key={label}
              href={href}
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "0.7rem 1rem", borderRadius: 8, border: "1px solid",
                borderColor: count === 0 ? "rgba(239,68,68,0.3)" : "#e2e8f0",
                background: count === 0 ? "rgba(239,68,68,0.04)" : "#f8fafc",
                textDecoration: "none",
              }}
            >
              <span style={{ fontSize: "0.78rem", color: "#475569", fontWeight: 500 }}>{label}</span>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: count === 0 ? "#ef4444" : "#1e293b" }}>
                {count === 0 ? "Empty" : count}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
