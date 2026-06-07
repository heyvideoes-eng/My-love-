"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    if (!supabase) {
      setError("Supabase is not configured. Add keys to .env.local.");
      setLoading(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f8fafc",
        padding: "2rem",
        fontFamily: "'Manrope', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "2.5rem",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo mark */}
        <div style={{ marginBottom: "2rem" }}>
          <span
            style={{
              display: "block",
              fontFamily: "var(--font-serif, Georgia, serif)",
              fontSize: "1.5rem",
              color: "#1e293b",
              fontStyle: "italic",
            }}
          >
            For V.
          </span>
          <span
            style={{
              fontSize: "0.75rem",
              color: "#64748b",
              fontWeight: 500,
              letterSpacing: "0.05em",
            }}
          >
            Admin dashboard
          </span>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label
              htmlFor="email"
              style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="rishi@example.com"
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                fontSize: "0.9rem",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
                background: "#f9fafb",
                color: "#111827",
                fontFamily: "inherit",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.4rem" }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={{
                width: "100%",
                padding: "0.65rem 0.85rem",
                fontSize: "0.9rem",
                border: "1px solid #d1d5db",
                borderRadius: 8,
                outline: "none",
                background: "#f9fafb",
                color: "#111827",
                fontFamily: "inherit",
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: "0.8rem", color: "#dc2626", background: "#fef2f2", padding: "0.6rem 0.85rem", borderRadius: 6 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: "0.5rem",
              padding: "0.75rem",
              background: loading ? "#94a3b8" : "#1e293b",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "inherit",
              letterSpacing: "0.04em",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ marginTop: "2rem", fontSize: "0.7rem", color: "#94a3b8", textAlign: "center" }}>
          This page is not linked from the public site.
        </p>
      </div>
    </div>
  );
}
