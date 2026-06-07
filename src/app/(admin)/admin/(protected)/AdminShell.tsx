"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

// ─── Navigation structure ─────────────────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: "Content",
    items: [
      { href: "/admin",             label: "Overview",      icon: "▣" },
      { href: "/admin/messages",    label: "Daily Note",    icon: "✎" },
      { href: "/admin/notes",       label: "Love Notes",    icon: "♡" },
      { href: "/admin/memories",    label: "Memories",      icon: "◌" },
      { href: "/admin/reminders",   label: "Reminders",     icon: "◷" },
      { href: "/admin/planner",     label: "Date Planner",  icon: "⊡" },
      { href: "/admin/gallery",     label: "Gallery",       icon: "⊞" },
      { href: "/admin/music",       label: "Music",         icon: "♪" },
      { href: "/admin/love-jar",    label: "Love Jar",      icon: "⬡" },
      { href: "/admin/moods",       label: "Mood Responses",icon: "◇" },
    ],
  },
  {
    label: "Intelligence",
    items: [
      { href: "/admin/ai",          label: "AI Copilot",    icon: "⚡" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/admin/settings",    label: "Site Settings", icon: "⚙" },
      { href: "/admin/preview",     label: "Preview",       icon: "↗" },
    ],
  },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
// We use inline styles + data-admin attribute to completely isolate from the
// romantic theme in globals.css. No Tailwind leakage possible here.
const C = {
  // layout
  shell:    { display: "flex", minHeight: "100dvh", background: "#f1f5f9", fontFamily: "'Satoshi', 'Inter', system-ui, sans-serif" } as React.CSSProperties,
  sidebar:  (collapsed: boolean): React.CSSProperties => ({
    width: collapsed ? 64 : 256, flexShrink: 0,
    background: "#0f172a", display: "flex", flexDirection: "column",
    position: "sticky", top: 0, height: "100dvh", overflow: "hidden",
    transition: "width 0.22s cubic-bezier(0.4,0,0.2,1)", zIndex: 30,
  }),
  brand:    { padding: "1.25rem 0 1rem", borderBottom: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 } as React.CSSProperties,
  brandRow: { display: "flex", alignItems: "center", gap: "0.65rem", padding: "0 1rem" } as React.CSSProperties,
  brandDot: { width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: "0.8rem" } as React.CSSProperties,
  brandText:{ overflow: "hidden", whiteSpace: "nowrap" as const },
  brandTitle:{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: "#f8fafc", letterSpacing: "0.01em" } as React.CSSProperties,
  brandSub: { display: "block", fontSize: "0.6rem", color: "#64748b", fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.1em" },

  nav:      { flex: 1, overflowY: "auto" as const, padding: "0.75rem 0.5rem 1rem" },
  navGroup: { marginBottom: "1.25rem" } as React.CSSProperties,
  navLabel: (collapsed: boolean): React.CSSProperties => ({
    fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.12em",
    textTransform: "uppercase", color: "#475569",
    padding: "0 0.75rem", marginBottom: "0.35rem",
    display: "block", opacity: collapsed ? 0 : 1, transition: "opacity 0.15s",
    whiteSpace: "nowrap",
  }),
  navLink:  (active: boolean, collapsed: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: "0.65rem",
    padding: collapsed ? "0.7rem" : "0.55rem 0.75rem",
    borderRadius: 8, textDecoration: "none",
    fontWeight: active ? 600 : 400, fontSize: "0.8rem",
    color: active ? "#f8fafc" : "#94a3b8",
    background: active ? "rgba(99,102,241,0.18)" : "transparent",
    borderLeft: active ? "2px solid #6366f1" : "2px solid transparent",
    transition: "all 0.15s ease",
    justifyContent: collapsed ? "center" : "flex-start",
    position: "relative",
    whiteSpace: "nowrap",
    overflow: "hidden",
  }),
  navIcon:  { fontSize: "0.95rem", lineHeight: 1, flexShrink: 0, width: 18, textAlign: "center" as const },
  navLabelText: (collapsed: boolean): React.CSSProperties => ({
    overflow: "hidden", whiteSpace: "nowrap", transition: "opacity 0.15s",
    opacity: collapsed ? 0 : 1, maxWidth: collapsed ? 0 : 160,
  }),

  footer:   { padding: "0.75rem 0.5rem", borderTop: "1px solid rgba(255,255,255,0.06)", flexShrink: 0 } as React.CSSProperties,
  footerInner: (collapsed: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: "0.6rem",
    padding: "0.5rem", borderRadius: 8, background: "rgba(255,255,255,0.03)",
    overflow: "hidden",
  }),
  avatar:   { width: 28, height: 28, borderRadius: 8, background: "linear-gradient(135deg,#6366f1,#8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.7rem", color: "#fff", fontWeight: 700, flexShrink: 0 } as React.CSSProperties,
  userText: (collapsed: boolean): React.CSSProperties => ({
    overflow: "hidden", flex: 1, opacity: collapsed ? 0 : 1,
    transition: "opacity 0.15s", whiteSpace: "nowrap",
  }),
  userEmail: { display: "block", fontSize: "0.68rem", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis" } as React.CSSProperties,
  signOut:  { fontSize: "0.62rem", color: "#ef4444", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", display: "block", marginTop: "1px" } as React.CSSProperties,

  collapseBtn: { position: "absolute" as const, right: -12, top: "50%", transform: "translateY(-50%)", zIndex: 40, width: 24, height: 24, borderRadius: "50%", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", fontSize: "0.7rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },

  // main content area
  rightPanel: { flex: 1, display: "flex", flexDirection: "column" as const, minWidth: 0 },
  topbar:   { background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, position: "sticky" as const, top: 0, zIndex: 20 } as React.CSSProperties,
  topbarLeft: { display: "flex", alignItems: "center", gap: "0.6rem" } as React.CSSProperties,
  topbarBreadcrumb: { fontSize: "0.78rem", color: "#64748b" } as React.CSSProperties,
  topbarActions: { display: "flex", alignItems: "center", gap: "0.75rem" } as React.CSSProperties,
  topbarBtn: (variant: "primary" | "outline"): React.CSSProperties => ({
    padding: "0.4rem 0.9rem", borderRadius: 7, fontSize: "0.72rem", fontWeight: 600,
    cursor: "pointer", border: "none", fontFamily: "inherit", textDecoration: "none",
    display: "inline-flex", alignItems: "center", gap: "0.35rem",
    background: variant === "primary" ? "#6366f1" : "transparent",
    color: variant === "primary" ? "#fff" : "#64748b",
    border: variant === "outline" ? "1px solid #e2e8f0" : "none",
  } as React.CSSProperties),

  main:     { flex: 1, padding: "1.75rem 2rem", overflow: "auto" } as React.CSSProperties,
};

export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  // Derive current page label for topbar breadcrumb
  const currentNav = NAV_GROUPS.flatMap(g => g.items).find(item =>
    item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
  );

  const initials = (user.email ?? "A")[0].toUpperCase();

  return (
    // data-admin isolates this from the romantic globals.css
    <div data-admin="true" style={C.shell}>
      {/* ── Sidebar ──────────────────────────────────────────────── */}
      <aside style={C.sidebar(collapsed)}>
        {/* Brand */}
        <div style={C.brand}>
          <div style={C.brandRow}>
            <div style={C.brandDot}>✦</div>
            <div style={C.brandText}>
              <span style={C.brandTitle}>Vanshika Admin</span>
              <span style={C.brandSub}>Control Panel</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={C.nav}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label} style={C.navGroup}>
              <span style={C.navLabel(collapsed)}>{group.label}</span>
              {group.items.map(({ href, label, icon }) => {
                const active = href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(href);
                return (
                  <Link key={href} href={href} style={C.navLink(active, collapsed)} title={collapsed ? label : undefined}>
                    <span style={C.navIcon}>{icon}</span>
                    <span style={C.navLabelText(collapsed)}>{label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer user block */}
        <div style={C.footer}>
          <div style={C.footerInner(collapsed)}>
            <div style={C.avatar}>{initials}</div>
            <div style={C.userText(collapsed)}>
              <span style={C.userEmail}>{user.email}</span>
              <button onClick={handleSignOut} style={C.signOut}>Sign out</button>
            </div>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(v => !v)}
          style={{ ...C.collapseBtn, right: -12 }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label="Toggle sidebar"
        >
          {collapsed ? "›" : "‹"}
        </button>
      </aside>

      {/* ── Right panel ───────────────────────────────────────────── */}
      <div style={C.rightPanel}>
        {/* Topbar */}
        <header style={C.topbar}>
          <div style={C.topbarLeft}>
            <span style={{ fontSize: "1rem", color: "#94a3b8" }}>Admin</span>
            {currentNav && (
              <>
                <span style={{ color: "#e2e8f0" }}>/</span>
                <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b" }}>
                  {currentNav.label}
                </span>
              </>
            )}
          </div>
          <div style={C.topbarActions}>
            <Link
              href="/"
              target="_blank"
              style={C.topbarBtn("outline")}
            >
              ↗ View Live Site
            </Link>
            <Link
              href="/admin/preview"
              style={C.topbarBtn("primary")}
            >
              Preview
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main style={C.main}>{children}</main>
      </div>
    </div>
  );
}
