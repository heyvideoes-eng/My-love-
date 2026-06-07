"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { GalleryItem, DEFAULT_GALLERY } from "@/components/public/PhotoGallery";
import { Plus, Trash, Edit2, Camera, Save } from "lucide-react";

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null);

  // Form fields
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [rotation, setRotation] = useState("0deg");
  const [colorGrad, setColorGrad] = useState("from-[#2A0812] to-[#5c1322]");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadGallery = async () => {
      const supabase = createClient();
      if (!supabase) return;

      const { data } = await supabase
        .from("gallery_photos")
        .select("*")
        .order("created_at", { ascending: true });

      if (data) {
        setItems(data as GalleryItem[]);
      }
    };
    loadGallery();
  }, []);

  const handleSaveItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location || !description) return;
    setIsSaving(true);
    setMessage("");

    const supabase = createClient();
    if (supabase) {
      let finalImageUrl = imageUrl;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('Gallery images')
          .upload(fileName, imageFile);

        if (uploadError) {
          setMessage("Image upload failed: " + uploadError.message);
          setIsSaving(false);
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from('Gallery images')
          .getPublicUrl(fileName);

        finalImageUrl = publicUrlData.publicUrl;
      }

      const payload = {
        id: editingItem ? editingItem.id : crypto.randomUUID(),
        title,
        date,
        location,
        description,
        rotation,
        color_grad: colorGrad,
        image_url: finalImageUrl || null
      };

      const { error } = await supabase
        .from("gallery_photos")
        .upsert(payload);

      if (error) {
        setMessage("Database error: " + error.message);
      } else {
        setMessage("Snapshot updated successfully!");
        setEditingItem(null);
        // Reset fields
        setTitle("");
        setDate("");
        setLocation("");
        setDescription("");
        setRotation("0deg");
        setColorGrad("from-[#2A0812] to-[#5c1322]");
        setImageUrl("");
        setImageFile(null);
        
        // Refetch
        const { data } = await supabase
          .from("gallery_photos")
          .select("*")
          .order("created_at", { ascending: true });
        if (data) setItems(data as GalleryItem[]);
      }
    } else {
      setMessage("Database client unavailable.");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this photo snapshot?")) {
      const supabase = createClient();
      if (supabase) {
        const { error } = await supabase
          .from("gallery_photos")
          .delete()
          .eq("id", id);
        
        if (error) {
          setMessage("Delete error: " + error.message);
        } else {
          setMessage("Snapshot deleted successfully!");
          setItems(prev => prev.filter(item => item.id !== id));
        }
      }
    }
  };

  const handleEditClick = (item: GalleryItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setDate(item.date);
    setLocation(item.location);
    setDescription(item.description);
    setRotation(item.rotation);
    setColorGrad(item.color_grad);
    setImageUrl(item.image_url || "");
    setImageFile(null);
  };

  return (
    <div style={{ maxWidth: 860, fontFamily: "inherit" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.3rem" }}>
        Polaroid Scrapbook Manager
      </h1>
      <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "2rem" }}>
        Add new pictures, configure narratives, and manage Vanshika's scrapbook stream.
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
        {/* Gallery Form */}
        <form onSubmit={handleSaveItem} style={{ display: "flex", flexDirection: "column", gap: "1rem", background: "#fff", padding: "1.5rem", borderRadius: 12, border: "1px solid #e2e8f0" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", marginBottom: "0.5rem" }}>
            {editingItem ? "Edit Photo Snapshot" : "Add New Polaroid Snap"}
          </h2>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Starry Night Stroll"
              required
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Date Text</label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. June 12, 2025"
                required
                style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Mall Road"
                required
                style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Picture Image</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                    // Clear the manual URL if they select a file
                    setImageUrl(""); 
                  }
                }}
                style={{ padding: "0.4rem", border: "1px dashed #cbd5e1", borderRadius: 8, width: "100%", background: "#f8fafc", fontSize: "0.8rem" }}
              />
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
                <span style={{ fontSize: "0.7rem", color: "#64748b" }}>OR PAST URL</span>
                <div style={{ flex: 1, height: "1px", background: "#e2e8f0" }}></div>
              </div>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => {
                  setImageUrl(e.target.value);
                  if (e.target.value) setImageFile(null); // Clear file if they type a URL
                }}
                placeholder="e.g. https://images.unsplash.com/..."
                style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
              />
            </div>
            <span style={{ fontSize: "0.65rem", color: "#94a3b8", display: "block", marginTop: "0.4rem" }}>
              Upload an image file directly (saved to Supabase Storage), or paste a public URL.
            </span>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write the narrative behind this snap..."
              required
              rows={4}
              style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff", resize: "none" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Tilt Rotation</label>
              <select
                value={rotation}
                onChange={(e) => setRotation(e.target.value)}
                style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
              >
                <option value="0deg">Straight (0deg)</option>
                <option value="-2deg">Left tilt (-2deg)</option>
                <option value="3deg">Right tilt (3deg)</option>
                <option value="-1.5deg">Slight left (-1.5deg)</option>
                <option value="2.5deg">Slight right (2.5deg)</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: "0.3rem" }}>Glow Gradient</label>
              <select
                value={colorGrad}
                onChange={(e) => setColorGrad(e.target.value)}
                style={{ padding: "0.6rem 0.8rem", border: "1px solid #cbd5e1", borderRadius: 8, width: "100%", color: "#000", background: "#fff" }}
              >
                <option value="from-[#2A0812] to-[#5c1322]">Midnight Wine</option>
                <option value="from-[#3a1c1c] to-[#a85c65]">Warm Blush</option>
                <option value="from-[#11221b] to-[#1c3a2f]">Emerald Forrest</option>
                <option value="from-[#2d1b0c] to-[#e8c59a]/30">Golden Hour</option>
                <option value="from-[#0d1b2a] to-[#2a0812]">Classic Indigo</option>
              </select>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
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
              {isSaving ? "Saving..." : editingItem ? "Save Changes" : "Create Snap"}
            </button>
            {editingItem && (
              <button
                type="button"
                onClick={() => {
                  setEditingItem(null);
                  setTitle("");
                  setDate("");
                  setLocation("");
                  setDescription("");
                  setRotation("0deg");
                  setColorGrad("from-[#2A0812] to-[#5c1322]");
                  setImageUrl("");
                  setImageFile(null);
                }}
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

        {/* Gallery Cards Stream */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {items.map((item) => (
            <div
              key={item.id}
              style={{
                background: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: "1.2rem",
                display: "flex",
                gap: "1rem",
                alignItems: "center"
              }}
            >
              {/* Photo representation */}
              <div style={{ width: 80, height: 80, borderRadius: 6, background: "#1c1416", overflow: "hidden", flexShrink: 0, position: "relative" }}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #2A0812, #5c1322)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Camera className="w-4 h-4 text-white/40" />
                  </div>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", margin: 0 }}>
                  {item.title}
                </h3>
                <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: 500 }}>
                  {item.date} · {item.location}
                </span>
                <p style={{ fontSize: "0.78rem", color: "#64748b", marginTop: "0.25rem", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", textOverflow: "ellipsis" }}>
                  {item.description}
                </p>
              </div>

              <div style={{ display: "flex", gap: "0.25rem" }}>
                <button
                  type="button"
                  onClick={() => handleEditClick(item)}
                  style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", padding: "0.25rem" }}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", padding: "0.25rem" }}
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
