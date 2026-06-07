"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Plus, Trash, Edit2, Check, Sparkles, RefreshCcw } from "lucide-react";
import { LoveVoucher } from "@/components/public/LoveVouchers";

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState<LoveVoucher[]>([]);
  const [editingVoucher, setEditingVoucher] = useState<LoveVoucher | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<LoveVoucher["category"]>("coupon");
  const [status, setStatus] = useState<LoveVoucher["status"]>("active");
  const [emoji, setEmoji] = useState("🎫");

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadVouchers = async () => {
    const supabase = createClient();
    if (!supabase) return;

    const { data } = await supabase
      .from("love_vouchers")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) {
      setVouchers(data as LoveVoucher[]);
    }
  };

  useEffect(() => {
    loadVouchers();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    setIsSaving(true);
    setMessage("");

    const supabase = createClient();
    if (supabase) {
      const payload = {
        id: editingVoucher ? editingVoucher.id : crypto.randomUUID(),
        title: title.trim(),
        description: description.trim(),
        category,
        status,
        emoji: emoji.trim() || "🎫",
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from("love_vouchers")
        .upsert(payload);

      if (error) {
        setMessage("Database error: " + error.message);
      } else {
        setMessage(editingVoucher ? "Voucher updated successfully!" : "New voucher created!");
        handleCancelEdit();
        loadVouchers();
      }
    } else {
      setMessage("Database client unavailable.");
    }
    setIsSaving(false);
  };

  const handleApproveClaim = async (v: LoveVoucher) => {
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase
        .from("love_vouchers")
        .update({ status: "redeemed", updated_at: new Date().toISOString() })
        .eq("id", v.id);

      if (error) {
        setMessage("Approval error: " + error.message);
      } else {
        setMessage(`Claim for "${v.title}" approved!`);
        loadVouchers();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this voucher?")) return;
    const supabase = createClient();
    if (supabase) {
      const { error } = await supabase
        .from("love_vouchers")
        .delete()
        .eq("id", id);

      if (error) {
        setMessage("Delete error: " + error.message);
      } else {
        setMessage("Voucher deleted successfully!");
        setVouchers(prev => prev.filter(v => v.id !== id));
      }
    }
  };

  const handleEditClick = (v: LoveVoucher) => {
    setEditingVoucher(v);
    setTitle(v.title);
    setDescription(v.description);
    setCategory(v.category);
    setStatus(v.status);
    setEmoji(v.emoji);
  };

  const handleCancelEdit = () => {
    setEditingVoucher(null);
    setTitle("");
    setDescription("");
    setCategory("coupon");
    setStatus("active");
    setEmoji("🎫");
  };

  return (
    <div style={{ maxWidth: 860, fontFamily: "inherit" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
        Love Vouchers Configurator
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2rem" }}>
        Create, edit, and approve romantic coupons, relationship promises, and mutual challenges for Vanshika.
      </p>

      {message && (
        <div style={{
          padding: "1rem",
          background: message.includes("error") || message.includes("Database") ? "#fef2f2" : "#f0fdf4",
          color: message.includes("error") || message.includes("Database") ? "#991b1b" : "#166534",
          borderRadius: 8,
          fontSize: "0.85rem",
          fontWeight: 600,
          marginBottom: "1.5rem"
        }}>
          {message}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "2rem", alignItems: "start" }}>
        {/* Form Column */}
        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#fff", padding: "1.5rem", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>
            {editingVoucher ? "Edit Voucher Capsule" : "Drop New Voucher Capsule"}
          </h2>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Voucher Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 10-Minute Head Massage"
              required
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Voucher Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail exactly what this coupon, promise, or challenge entails..."
              required
              rows={4}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff", resize: "none" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as LoveVoucher["category"])}
                style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
              >
                <option value="coupon">Coupon 🎟️</option>
                <option value="challenge">Challenge 🚫</option>
                <option value="vow">Promise 📜</option>
                <option value="activity">Date Idea 🚗</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Emoji Symbol</label>
              <input
                type="text"
                value={emoji}
                onChange={(e) => setEmoji(e.target.value)}
                placeholder="e.g. 💆‍♀️"
                style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
              />
            </div>
          </div>

          {editingVoucher && (
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Current Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as LoveVoucher["status"])}
                style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
              >
                <option value="active">Active (Available)</option>
                <option value="claimed">Claimed (Pending Approval)</option>
                <option value="redeemed">Redeemed (Completed)</option>
              </select>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <button
              type="submit"
              disabled={isSaving}
              style={{
                flex: 1,
                padding: "0.65rem 1.2rem",
                background: "#1e293b",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {isSaving ? "Saving..." : editingVoucher ? "Save Capsule" : "Drop Voucher"}
            </button>
            {editingVoucher && (
              <button
                type="button"
                onClick={handleCancelEdit}
                style={{
                  padding: "0.65rem 1.2rem",
                  background: "#fff",
                  color: "#64748b",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Voucher Stream list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {vouchers.map((v) => (
            <div
              key={v.id}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "1.2rem",
                display: "flex",
                gap: "1rem",
                alignItems: "start"
              }}
            >
              <div style={{ fontSize: "1.75rem", userSelect: "none" }}>{v.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.25rem" }}>
                  <h3 style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                    {v.title}
                  </h3>
                  <span style={{
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    padding: "0.1rem 0.35rem",
                    borderRadius: 4,
                    textTransform: "uppercase",
                    background: v.status === "claimed" ? "#fef3c7" : v.status === "redeemed" ? "#d1fae5" : "#f1f5f9",
                    color: v.status === "claimed" ? "#b45309" : v.status === "redeemed" ? "#065f46" : "#64748b"
                  }}>
                    {v.status}
                  </span>
                </div>
                <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: 500, textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>
                  {v.category}
                </span>
                <p style={{ fontSize: "0.8rem", color: "#475569", margin: 0, lineHeight: 1.4 }}>
                  {v.description}
                </p>

                {/* Approve Button if Claimed */}
                {v.status === "claimed" && (
                  <button
                    onClick={() => handleApproveClaim(v)}
                    style={{
                      marginTop: "0.75rem",
                      padding: "0.35rem 0.75rem",
                      background: "#10b981",
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.25rem"
                    }}
                  >
                    <Check className="w-3 h-3" />
                    <span>Approve Claim</span>
                  </button>
                )}
              </div>

              <div style={{ display: "flex", gap: "0.25rem", flexShrink: 0 }}>
                <button
                  type="button"
                  onClick={() => handleEditClick(v)}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.25rem" }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(v.id)}
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.25rem" }}
                >
                  <Trash className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
