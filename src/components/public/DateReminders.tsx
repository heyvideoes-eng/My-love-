"use client";

import { useState } from "react";
import { SpecialDate } from "./CountdownHighlight";
import { Plus, Trash2, Edit2, Calendar, Sparkles, X, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DateRemindersProps {
  dates: SpecialDate[];
  setDates: (dates: SpecialDate[]) => void;
}

export default function DateReminders({ dates, setDates }: DateRemindersProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDate, setEditingDate] = useState<SpecialDate | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [tag, setTag] = useState<SpecialDate["tag"]>("date");
  const [note, setNote] = useState("");

  // Calculate days remaining helper
  const getDaysRemaining = (d: SpecialDate) => {
    const now = new Date();
    const parts = d.date.split("-");
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;
    const day = parseInt(parts[2]);

    let targetDate = new Date(year, month, day, 0, 0, 0);

    // Yearly recurring logic
    if (d.tag === "birthday" || d.tag === "anniversary" || d.tag === "meeting") {
      targetDate.setFullYear(now.getFullYear());
      if (targetDate.getTime() < now.getTime() - 24 * 60 * 60 * 1000) {
        targetDate.setFullYear(now.getFullYear() + 1);
      }
    }

    const isToday = 
      targetDate.getDate() === now.getDate() &&
      targetDate.getMonth() === now.getMonth() &&
      targetDate.getFullYear() === now.getFullYear();

    if (isToday) return 0;

    const diffMs = targetDate.getTime() - now.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Find the next upcoming date ID to add priority styling
  const getUpcomingDateId = () => {
    let nextId = "";
    let minDays = Infinity;

    dates.forEach((d) => {
      const days = getDaysRemaining(d);
      if (days >= 0 && days < minDays) {
        minDays = days;
        nextId = d.id;
      }
    });

    return nextId;
  };

  const upcomingId = getUpcomingDateId();

  // Open modal for adding
  const handleOpenAdd = () => {
    setEditingDate(null);
    setTitle("");
    setDate("");
    setTag("date");
    setNote("");
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (d: SpecialDate) => {
    setEditingDate(d);
    setTitle(d.title);
    setDate(d.date);
    setTag(d.tag);
    setNote(d.note || "");
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this special reminder?")) {
      const updated = dates.filter((d) => d.id !== id);
      setDates(updated);
    }
  };

  // Submit form handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    if (editingDate) {
      // Edit mode
      const updated = dates.map((d) =>
        d.id === editingDate.id ? { ...d, title, date, tag, note } : d
      );
      setDates(updated);
    } else {
      // Add mode
      const newDate: SpecialDate = {
        id: crypto.randomUUID(),
        title,
        date,
        tag,
        note,
      };
      setDates([...dates, newDate]);
    }

    setIsModalOpen(false);
  };

  // Helpers for tag badges
  const getTagStyles = (tag: string) => {
    switch (tag) {
      case "birthday":
        return { bg: "bg-amber-500/10 border-amber-500/20 text-amber-400", label: "🎂 Birthday" };
      case "anniversary":
        return { bg: "bg-rose-500/10 border-rose-500/20 text-rose-400", label: "💍 Anniversary" };
      case "meeting":
        return { bg: "bg-blue-500/10 border-blue-500/20 text-blue-400", label: "✨ First Met" };
      case "date":
        return { bg: "bg-green-500/10 border-green-500/20 text-green-400", label: "🍷 Date Night" };
      default:
        return { bg: "bg-purple-500/10 border-purple-500/20 text-purple-400", label: "💝 Moment" };
    }
  };

  return (
    <section id="date-reminders" className="py-20 relative">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-fluid-base font-bold uppercase tracking-[0.25em] text-[#c97b84] block mb-2">
              Timeline of Us
            </span>
            <h2 className="font-serif text-fluid-4xl md:text-fluid-5xl text-[#fdfaf6] font-normal leading-tight">
              Dates We Keep in Mind
            </h2>
            <p className="text-fluid-lg text-[#8a7679] mt-2 max-w-md">
              A private ledger of milestones, birthdays, and upcoming opportunities to create new memories together.
            </p>
          </div>

          <button
            onClick={handleOpenAdd}
            className="btn-outline self-start md:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Special Date</span>
          </button>
        </div>

        {/* Reminders Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {dates.map((d) => {
              const daysLeft = getDaysRemaining(d);
              const isUpcoming = d.id === upcomingId;
              const { bg, label } = getTagStyles(d.tag);

              return (
                <motion.div
                  layout
                  key={d.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.5 }}
                  className={`glass-panel p-6 flex flex-col justify-between relative overflow-hidden group ${
                    isUpcoming ? "glass-panel-active" : ""
                  }`}
                >
                  {/* Subtle top indicator for next event */}
                  {isUpcoming && (
                    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#e8c59a] to-[#c97b84] animate-pulse" />
                  )}

                  <div>
                    {/* Top row: Badge and CRUD buttons */}
                    <div className="flex items-center justify-between mb-5">
                      <span className={`text-fluid-2xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${bg}`}>
                        {label}
                      </span>
                      
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button
                          onClick={() => handleOpenEdit(d)}
                          className="p-1.5 rounded-full hover:bg-white/5 text-[#8a7679] hover:text-[#e8c59a] transition-colors cursor-pointer"
                          title="Edit reminder"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(d.id)}
                          className="p-1.5 rounded-full hover:bg-white/5 text-[#8a7679] hover:text-[#c97b84] transition-colors cursor-pointer"
                          title="Delete reminder"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-serif text-fluid-3xl text-[#fdfaf6] font-normal leading-snug mb-1">
                      {d.title}
                    </h4>

                    {/* Date label */}
                    <p className="text-fluid-xs text-[#8a7679] uppercase tracking-wider font-semibold mb-3">
                      {new Date(d.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>

                    {/* Personal emotional note */}
                    {d.note && (
                      <p className="text-fluid-base text-[#8a7679] italic leading-relaxed mb-6 font-medium">
                        “{d.note}”
                      </p>
                    )}
                  </div>

                  {/* Days Ticker Footer */}
                  <div className="border-t border-white/5 pt-4 mt-auto flex items-center justify-between">
                    <span className="text-fluid-2xs uppercase tracking-widest text-[#8a7679] font-bold">
                      {daysLeft === 0 ? "Celebrating Today!" : "Days Remaining"}
                    </span>
                    <span className="font-serif text-fluid-3xl text-[#e8c59a] font-normal">
                      {daysLeft === 0 ? (
                        <span className="text-[#c97b84] animate-pulse">♥</span>
                      ) : (
                        `${daysLeft}d`
                      )}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Modal Overlay for Add / Edit */}
        <AnimatePresence>
          {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsModalOpen(false)}
                className="absolute inset-0 bg-[#080405]/90 backdrop-blur-sm"
              />

              {/* Form container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="w-full max-w-md bg-[#160e10] border border-[rgba(232,197,154,0.15)] rounded-2xl p-6 relative z-10 shadow-2xl"
              >
                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-white/5 text-[#8a7679] hover:text-[#fdfaf6] transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>

                <h3 className="font-serif text-fluid-3xl text-[#fdfaf6] font-normal mb-5 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#c97b84]" />
                  <span>{editingDate ? "Edit Special Date" : "Add Special Date"}</span>
                </h3>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Title */}
                  <div>
                    <label className="premium-label">Event Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="E.g., Vanshika's Birthday, Our First Date..."
                      className="premium-input"
                      required
                    />
                  </div>

                  {/* Date Picker */}
                  <div>
                    <label className="premium-label">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="premium-input text-[#fdfaf6]"
                      required
                    />
                  </div>

                  {/* Tag Selector */}
                  <div>
                    <label className="premium-label">Category Tag</label>
                    <select
                      value={tag}
                      onChange={(e) => setTag(e.target.value as SpecialDate["tag"])}
                      className="premium-input"
                    >
                      <option value="birthday">Birthday 🎂</option>
                      <option value="anniversary">Anniversary 💍</option>
                      <option value="meeting">First Meeting ✨</option>
                      <option value="date">Date Night 🍷</option>
                      <option value="moment">Special Moment 💝</option>
                    </select>
                  </div>

                  {/* Note */}
                  <div>
                    <label className="premium-label">Optional Note</label>
                    <textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Write a sweet reminder or why this day is special..."
                      className="premium-input h-20 resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-rose-gold w-full justify-center mt-2 cursor-pointer"
                  >
                    {editingDate ? "Save Changes" : "Create Reminder"}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
