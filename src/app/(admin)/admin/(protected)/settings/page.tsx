"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const [id, setId] = useState<string | null>(null);
  const [metaText, setMetaText] = useState("Private edition");
  const [updatedText, setUpdatedText] = useState("Updated daily");
  const [labelText, setLabelText] = useState("A quiet, living love letter");
  const [titlePrefix, setTitlePrefix] = useState("Vanshika,");
  const [titleEmphasis, setTitleEmphasis] = useState("this is yours");
  const [subtitle, setSubtitle] = useState("A soft, private space for your mornings,\nyour nights, and all the in-between.");
  const [btnText, setBtnText] = useState("Open today's note");
  
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadSettings = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();

      if (data) {
        setId(data.id);
        setMetaText(data.meta_text);
        setUpdatedText(data.updated_text);
        setLabelText(data.label_text);
        setTitlePrefix(data.title_prefix);
        setTitleEmphasis(data.title_emphasis);
        setSubtitle(data.subtitle);
        setBtnText(data.btn_text);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    const supabase = createClient();
    if (supabase) {
      const payload = {
        ...(id ? { id } : {}), // only pass id if it exists
        meta_text: metaText,
        updated_text: updatedText,
        label_text: labelText,
        title_prefix: titlePrefix,
        title_emphasis: titleEmphasis,
        subtitle,
        btn_text: btnText
      };

      let error;
      if (id) {
        const { error: updateError } = await supabase.from("site_settings").update(payload).eq('id', id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase.from("site_settings").insert(payload);
        error = insertError;
      }

      if (error) {
        setMessage("Database error: " + error.message);
      } else {
        setMessage("Settings updated successfully! Changes are live immediately.");
      }
    }
    setIsSaving(false);
  };

  return (
    <div style={{ maxWidth: 860, fontFamily: "inherit" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
        Site Settings & Hero Configuration
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2rem" }}>
        Update the main text of the website instantly. These changes apply globally and sync in real-time.
      </p>

      {message && (
        <div style={{
          padding: "1rem",
          background: message.includes("error") ? "#fef2f2" : "#f0fdf4",
          color: message.includes("error") ? "#991b1b" : "#166534",
          borderRadius: 8,
          fontSize: "0.85rem",
          fontWeight: 600,
          marginBottom: "1.5rem"
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#fff", padding: "1.5rem", borderRadius: 12, border: "1px solid #e2e8f0" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Meta Left (e.g., "Private edition")</label>
            <input
              type="text"
              value={metaText}
              onChange={(e) => setMetaText(e.target.value)}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", background: "#fff" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Meta Right (e.g., "Updated daily")</label>
            <input
              type="text"
              value={updatedText}
              onChange={(e) => setUpdatedText(e.target.value)}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", background: "#fff" }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Floating Label</label>
          <input
            type="text"
            value={labelText}
            onChange={(e) => setLabelText(e.target.value)}
            style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", background: "#fff" }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Title Prefix (e.g., "Vanshika,")</label>
            <input
              type="text"
              value={titlePrefix}
              onChange={(e) => setTitlePrefix(e.target.value)}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", background: "#fff" }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Title Emphasis (e.g., "this is yours")</label>
            <input
              type="text"
              value={titleEmphasis}
              onChange={(e) => setTitleEmphasis(e.target.value)}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", background: "#fff" }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Subtitle</label>
          <textarea
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            rows={3}
            style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", background: "#fff", resize: "none" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Call to Action Button</label>
          <input
            type="text"
            value={btnText}
            onChange={(e) => setBtnText(e.target.value)}
            style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", background: "#fff" }}
          />
        </div>

        <button
          type="submit"
          disabled={isSaving}
          style={{
            padding: "0.75rem 1.2rem",
            background: "#1e293b",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
            marginTop: "1rem"
          }}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  );
}
