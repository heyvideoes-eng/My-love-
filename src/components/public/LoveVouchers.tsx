"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Ticket, Star, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export interface LoveVoucher {
  id: string;
  title: string;
  description: string;
  category: "coupon" | "challenge" | "vow" | "activity";
  status: "active" | "claimed" | "redeemed";
  emoji: string;
}

const DEFAULT_VOUCHERS: LoveVoucher[] = [
  {
    id: "v1",
    title: "Midnight Ice Cream Run",
    description: "Redeem this for a late-night drive to grab your favorite double chocolate scoop!",
    category: "coupon",
    status: "active",
    emoji: "🍦"
  },
  {
    id: "v2",
    title: "No-Phone Date Night",
    description: "A full dinner date where both of our phones stay completely face-down and silent.",
    category: "challenge",
    status: "active",
    emoji: "🚫📱"
  },
  {
    id: "v3",
    title: "Yes Day for 1 Hour",
    description: "For one whole hour, I will agree to absolutely any cute favor or request you make.",
    category: "coupon",
    status: "active",
    emoji: "👑"
  },
  {
    id: "v4",
    title: "To always make you laugh",
    description: "A cozy promise to find ways to make you giggle, even on tiring Tuesdays.",
    category: "vow",
    status: "active",
    emoji: "😂"
  }
];

export default function LoveVouchers() {
  const [vouchers, setVouchers] = useState<LoveVoucher[]>(DEFAULT_VOUCHERS);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    const loadVouchers = async () => {
      const supabase = createClient();
      if (!supabase) return;

      try {
        const { data, error } = await supabase
          .from("love_vouchers")
          .select("*")
          .order("created_at", { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          setVouchers(data as LoveVoucher[]);
          localStorage.setItem("rv_vouchers", JSON.stringify(data));
        } else {
          // Table empty, insert seeds
          setVouchers(DEFAULT_VOUCHERS);
          localStorage.setItem("rv_vouchers", JSON.stringify(DEFAULT_VOUCHERS));
          await supabase.from("love_vouchers").insert(DEFAULT_VOUCHERS);
        }
      } catch (err) {
        console.warn("Could not load from Supabase love_vouchers, using fallback storage:", err);
        const cached = localStorage.getItem("rv_vouchers");
        if (cached) {
          try {
            setVouchers(JSON.parse(cached));
          } catch {
            setVouchers(DEFAULT_VOUCHERS);
          }
        }
      }
    };

    loadVouchers();
  }, []);

  // Subscribe to realtime changes
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

    const channel = supabase
      .channel("love_vouchers_realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "love_vouchers" },
        async () => {
          const { data } = await supabase
            .from("love_vouchers")
            .select("*")
            .order("created_at", { ascending: true });
          if (data && data.length > 0) {
            setVouchers(data as LoveVoucher[]);
            localStorage.setItem("rv_vouchers", JSON.stringify(data));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClaim = async (id: string) => {
    setClaimingId(id);
    const updated = vouchers.map(v => v.id === id ? { ...v, status: "claimed" as const } : v);
    setVouchers(updated);
    localStorage.setItem("rv_vouchers", JSON.stringify(updated));

    const supabase = createClient();
    if (supabase) {
      try {
        await supabase
          .from("love_vouchers")
          .update({ status: "claimed", updated_at: new Date().toISOString() })
          .eq("id", id);
      } catch (err) {
        console.error("Failed to update status in Supabase:", err);
      }
    }
    setTimeout(() => setClaimingId(null), 1000);
  };

  const filteredVouchers = vouchers.filter(
    v => categoryFilter === "all" || v.category === categoryFilter
  );

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "coupon": return "bg-[#ebdce0] text-[#b64b59] border-[#e2cbd1]";
      case "challenge": return "bg-[#e2e8f0] text-[#475569] border-[#cbd5e1]";
      case "vow": return "bg-[#fef3c7] text-[#b45309] border-[#fde68a]";
      default: return "bg-[#ecfdf5] text-[#047857] border-[#d1fae5]";
    }
  };

  return (
    <section id="love-vouchers" className="py-20 relative border-t border-white/5">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-fluid-base font-bold uppercase tracking-[0.25em] text-[#e8c59a] block mb-2">
            Interactive Shelf
          </span>
          <h2 className="font-serif text-fluid-4xl md:text-fluid-5xl text-[#fdfaf6] font-normal">
            Cute Coupons & Love Vouchers
          </h2>
          <p className="text-fluid-sm text-[#8a7679] max-w-md mx-auto mt-3 font-medium uppercase tracking-wider">
            Rishi drops cute favors, challenges, and promises here. Click to claim and redeem them!
          </p>
        </div>

        {/* Categories Tab Selector */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {[
            { id: "all", label: "All Capsules" },
            { id: "coupon", label: "Love Coupons 🎟️" },
            { id: "challenge", label: "Challenges 🚫" },
            { id: "vow", label: "Promises 📜" },
            { id: "activity", label: "Date Ideas 🚗" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCategoryFilter(tab.id)}
              className={`px-4 py-1.5 rounded-full text-fluid-base font-bold tracking-wider uppercase border transition-all cursor-pointer ${
                categoryFilter === tab.id
                  ? "bg-[#c97b84] text-[#331f22] border-[#c97b84] shadow-sm"
                  : "bg-white/5 text-[#8a7679] border-white/5 hover:bg-white/10 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Voucher Cards Shelf */}
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredVouchers.map(voucher => (
              <motion.div
                key={voucher.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                className={`relative rounded-2xl p-6 border backdrop-blur-md overflow-hidden flex flex-col justify-between min-h-[170px] shadow-sm transition-all duration-300 ${
                  voucher.status === "redeemed"
                    ? "bg-[#faf5f5]/30 border-white/5 opacity-50"
                    : voucher.status === "claimed"
                    ? "bg-gradient-to-br from-[#ebdce0]/40 to-[#c97b84]/15 border-[#c97b84]/30"
                    : "bg-[#faf5f5]/10 border-white/10"
                }`}
              >
                {/* Visual Accent */}
                <div className="absolute right-0 top-0 w-24 h-24 bg-[#c97b84]/5 blur-2xl rounded-full pointer-events-none" />

                {/* Card Top Details */}
                <div>
                  <div className="flex justify-between items-start gap-3 mb-3">
                    <span className="text-fluid-4xl filter drop-shadow-md select-none">{voucher.emoji}</span>
                    <span className={`px-2 py-0.5 text-fluid-2xs font-bold uppercase tracking-wider rounded border ${getCategoryBadgeColor(voucher.category)}`}>
                      {voucher.category}
                    </span>
                  </div>

                  <h3 className="font-serif text-fluid-2xl text-[#fdfaf6] font-normal leading-snug mb-1.5">
                    {voucher.title}
                  </h3>
                  <p className="text-fluid-base text-[#8a7679] leading-relaxed mb-4">
                    {voucher.description}
                  </p>
                </div>

                {/* Card Bottom CTA */}
                <div className="flex items-center justify-between border-t border-white/5 pt-3">
                  <span className="text-fluid-2xs font-bold uppercase tracking-widest text-[#e8c59a] flex items-center gap-1">
                    {voucher.status === "active" && (
                      <>
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Ready to Claim</span>
                      </>
                    )}
                    {voucher.status === "claimed" && (
                      <>
                        <Sparkles className="w-3.5 h-3.5 animate-spin text-[#c97b84]" />
                        <span className="text-[#c97b84]">Pending Approval</span>
                      </>
                    )}
                    {voucher.status === "redeemed" && (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#10b981]" />
                        <span className="text-[#10b981]">Redeemed</span>
                      </>
                    )}
                  </span>

                  {voucher.status === "active" && (
                    <button
                      onClick={() => handleClaim(voucher.id)}
                      disabled={claimingId === voucher.id}
                      className="px-3.5 py-1 rounded-full bg-gradient-to-r from-[#e8c59a] to-[#c97b84] text-[#331f22] text-fluid-xs font-bold uppercase tracking-wider hover:brightness-105 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      <span>{claimingId === voucher.id ? "Claiming..." : "Claim Voucher"}</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredVouchers.length === 0 && (
          <div className="text-center py-12 bg-white/5 border border-white/5 rounded-2xl">
            <AlertCircle className="w-8 h-8 text-[#8a7679] mx-auto mb-2 opacity-50" />
            <p className="text-[#8a7679] text-fluid-base font-semibold uppercase tracking-wider">
              No capsules in this category yet.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
