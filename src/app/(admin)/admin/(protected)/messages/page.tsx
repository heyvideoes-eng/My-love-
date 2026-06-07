import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export default async function AdminMessagesPage() {
  const supabase = await createAdminSupabaseClient();

  if (!supabase) {
    return (
      <div style={{ maxWidth: 860 }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}>
          Daily Messages
        </h1>
        <p style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.5rem" }}>
          Supabase is not configured. Add keys to .env.local.
        </p>
      </div>
    );
  }

  const { data: latest } = await supabase
    .from("daily_messages")
    .select("id, content, created_at")
    .eq("is_published", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: recent } = await supabase
    .from("daily_messages")
    .select("id, content, created_at, is_published")
    .order("created_at", { ascending: false })
    .limit(5);

  async function saveDailyMessage(formData: FormData) {
    "use server";
    const content = String(formData.get("content") ?? "").trim();
    const mode = String(formData.get("mode") ?? "update");
    const messageId = String(formData.get("messageId") ?? "").trim();

    if (!content) return;

    const admin = await createAdminSupabaseClient();
    if (!admin) return;

    if (mode === "publishNew") {
      await admin.from("daily_messages").update({ is_published: false }).eq("is_published", true);
      await admin.from("daily_messages").insert({
        content,
        is_published: true,
        is_ai_generated: false,
      });
    } else if (messageId) {
      await admin
        .from("daily_messages")
        .update({ content, is_published: true, updated_at: new Date().toISOString() })
        .eq("id", messageId);
    } else {
      await admin.from("daily_messages").insert({
        content,
        is_published: true,
        is_ai_generated: false,
      });
    }

    revalidatePath("/");
    revalidatePath("/admin/messages");
  }

  return (
    <div style={{ maxWidth: 860 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
        Daily Messages
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2rem" }}>
        Update the live note that appears on the public site.
      </p>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e2e8f0",
          borderRadius: 12,
          padding: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <span
          style={{
            display: "block",
            fontSize: "0.7rem",
            fontWeight: 600,
            color: "#94a3b8",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "0.75rem",
          }}
        >
          Currently live
        </span>
        <p style={{ fontSize: "1rem", color: "#374151", lineHeight: 1.7, fontStyle: "italic" }}>
          {latest?.content ? `"${latest.content}"` : "No published message yet."}
        </p>
      </div>

      <form action={saveDailyMessage} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        <input type="hidden" name="messageId" value={latest?.id ?? ""} />

        <label style={{ fontSize: "0.78rem", fontWeight: 600, color: "#374151" }}>
          Edit message
        </label>
        <textarea
          name="content"
          defaultValue={latest?.content ?? ""}
          placeholder="Write today's message for Vanshika..."
          required
          rows={6}
          style={{
            width: "100%",
            padding: "0.85rem 1rem",
            fontSize: "0.95rem",
            border: "1px solid #d1d5db",
            borderRadius: 10,
            outline: "none",
            background: "#f9fafb",
            color: "#111827",
            fontFamily: "inherit",
            lineHeight: 1.6,
          }}
        />

        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <button
            type="submit"
            name="mode"
            value="update"
            style={{
              padding: "0.7rem 1.2rem",
              background: "#1e293b",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Update live message
          </button>
          <button
            type="submit"
            name="mode"
            value="publishNew"
            style={{
              padding: "0.7rem 1.2rem",
              background: "#fff",
              color: "#1e293b",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              fontSize: "0.8rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Publish as new entry
          </button>
        </div>
      </form>

      {recent && recent.length > 0 && (
        <div style={{ marginTop: "2.5rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.75rem" }}>
            Recent messages
          </h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {recent.map((item) => (
              <div
                key={item.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: "0.85rem 1rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                    {item.is_published ? "Live" : "Draft"}
                  </span>
                  <span style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                    {new Date(item.created_at).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <p style={{ fontSize: "0.9rem", color: "#374151", lineHeight: 1.6, fontStyle: "italic" }}>
                  {item.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
