"use client";

import Link from "next/link";

export default function AdminPreviewPage() {
  return (
    <div style={{ maxWidth: 1100 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
        <h1 className="adm-heading">Preview</h1>
        <div style={{ display: "flex", gap: "0.65rem" }}>
          <Link href="/" target="_blank" className="adm-btn adm-btn-outline">↗ Open in New Tab</Link>
        </div>
      </div>
      <p className="adm-subheading">Live preview of what Vanshika sees. Only published content appears here.</p>

      {/* Info bar */}
      <div style={{ background: "#fef9c3", border: "1px solid #fde047", borderRadius: 10, padding: "0.75rem 1.1rem", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "0.85rem" }}>⚠️</span>
        <p style={{ fontSize: "0.78rem", color: "#854d0e" }}>
          This preview shows the live published version of Vanshika&apos;s page. Unpublished drafts will <strong>not</strong> appear until you publish them from the respective section.
        </p>
      </div>

      {/* Quick publish buttons */}
      <div className="adm-section" style={{ marginBottom: "1.25rem" }}>
        <div className="adm-section-header"><span className="adm-section-title">Quick Navigation</span></div>
        <div style={{ padding: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {[
            { href: "/admin/messages",  label: "Daily Messages" },
            { href: "/admin/notes",     label: "Love Notes" },
            { href: "/admin/memories",  label: "Memories" },
            { href: "/admin/reminders", label: "Reminders" },
            { href: "/admin/planner",   label: "Date Planner" },
            { href: "/admin/gallery",   label: "Gallery" },
            { href: "/admin/music",     label: "Music" },
            { href: "/admin/settings",  label: "Site Settings" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} className="adm-btn adm-btn-outline" style={{ fontSize: "0.75rem" }}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* iframe preview */}
      <div style={{ border: "1px solid #e2e8f0", borderRadius: 16, overflow: "hidden", background: "#000", boxShadow: "0 20px 60px rgba(0,0,0,0.12)" }}>
        {/* Browser chrome */}
        <div style={{ background: "#1e293b", padding: "0.65rem 1rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#f59e0b" }} />
            <div style={{ width: 12, height: 12, borderRadius: "50%", background: "#10b981" }} />
          </div>
          <div style={{ flex: 1, background: "#0f172a", borderRadius: 6, padding: "0.3rem 0.75rem", fontSize: "0.72rem", color: "#64748b", textAlign: "center" }}>
            vanshika.app/
          </div>
          <Link href="/" target="_blank" style={{ fontSize: "0.68rem", color: "#94a3b8", textDecoration: "none" }}>↗ Open</Link>
        </div>
        <iframe
          src="/"
          style={{ width: "100%", height: "80vh", border: "none", display: "block" }}
          title="Vanshika page preview"
        />
      </div>
    </div>
  );
}
