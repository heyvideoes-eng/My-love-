"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Heart, Eye } from "lucide-react";
import { useRealtimeData } from "@/hooks/useRealtimeData";

export interface GalleryItem {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  rotation: string;
  color_grad: string;
  image_url?: string;
}

const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "1",
    title: "Starry Night Stroll",
    date: "June 12, 2025",
    location: "Observatory Ridge",
    description: "Wrapped under a blanket of stars, talking about nothing and everything. The universe felt infinitely large, yet completely contained in that single moment we shared.",
    rotation: "-2deg",
    color_grad: "from-[#2A0812] to-[#5c1322]"
  },
  {
    id: "2",
    title: "The Waffle Standoff",
    date: "July 24, 2025",
    location: "Corner Bakery Cafe",
    description: "An intense negotiation over who got the last piece of the strawberry Nutella waffle. (Spoiler: Vanshika won, as she always deserves to).",
    rotation: "3deg",
    color_grad: "from-[#3a1c1c] to-[#a85c65]"
  },
  {
    id: "3",
    title: "Rainy Road Walks",
    date: "October 19, 2025",
    location: "Mall Road",
    description: "One tiny shared umbrella, chilly autumn wind, and wet shoes. We ended up running into a warm bookstore, laughing at how soaked we were.",
    rotation: "-3deg",
    color_grad: "from-[#11221b] to-[#1c3a2f]"
  },
  {
    id: "4",
    title: "Lost in Old Books",
    date: "November 22, 2025",
    location: "The Archivist Library",
    description: "Spending hours pulling dusty volumes off shelves, reading each other the strangest sentences we could find, and finding peace in the smell of old paper.",
    rotation: "1.5deg",
    color_grad: "from-[#2d1b0c] to-[#e8c59a]/30"
  },
  {
    id: "5",
    title: "Midnight Car Rides",
    date: "December 30, 2025",
    location: "Ring Road Express",
    description: "Driving slowly through empty city lanes, window rolled halfway down, warm air blowing, playing our favorite lo-fi tracks on repeat.",
    rotation: "-1.5deg",
    color_grad: "from-[#0d1b2a] to-[#2a0812]"
  },
  {
    id: "6",
    title: "Warm Coffee Evenings",
    date: "February 14, 2026",
    location: "Hearth Cafe",
    description: "Sitting opposite each other in the corner booth, hands wrapped around warm mugs. The ambient chatter of the cafe faded, leaving just our whispers.",
    rotation: "2.5deg",
    color_grad: "from-[#2A0812] to-[#c5a782]/40"
  }
];

export default function PhotoGallery() {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const { data: items } = useRealtimeData<GalleryItem>(
    "gallery_photos",
    "created_at",
    true,
    DEFAULT_GALLERY
  );

  return (
    <section id="gallery" className="py-20 relative border-t border-white/5 bg-[rgba(26,12,16,0.03)]">
      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-16">
          <span className="text-fluid-base font-bold uppercase tracking-[0.25em] text-[#c97b84] block mb-2">
            Scrapbook
          </span>
          <h2 className="font-serif text-fluid-4xl md:text-fluid-5xl text-[#fdfaf6] font-normal">
            Our Gallery of Memories
          </h2>
          <p className="text-fluid-lg text-[#8a7679] mt-3">
            A visual directory of snapshots from our journey. Click on any card to slide out the letter/story behind the memory.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 pt-6">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="flex justify-center"
              style={{ "--rotation": item.rotation } as React.CSSProperties}
            >
              <div
                onClick={() => setSelectedItem(item)}
                className="polaroid-card w-full max-w-[290px] select-none"
              >
                {/* Polaroid Image Container */}
                <div className="polaroid-img-placeholder relative bg-[#1c1416]">
                  {item.image_url ? (
                    <img 
                      src={item.image_url} 
                      alt={item.title} 
                      className="absolute inset-0 w-full h-full object-contain bg-[#1c1416]"
                    />
                  ) : (
                    <>
                      {/* Glowing gradient background fallback */}
                      <div className={`absolute inset-0 bg-gradient-to-br ${item.color_grad} opacity-60`} />
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-10 text-[#fdfaf6]/30">
                        <Camera className="w-8 h-8 stroke-[1.2]" />
                        <span className="text-fluid-2xs uppercase tracking-[0.2em] font-bold">Snapshot {index + 1}</span>
                      </div>
                    </>
                  )}

                  {/* Eye details button overlay */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20 text-white gap-2 text-fluid-base font-semibold uppercase tracking-wider cursor-pointer">
                    <Eye className="w-4 h-4" />
                    <span>View Detail</span>
                  </div>
                </div>

                {/* Polaroid Info */}
                <div className="polaroid-date">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Memory detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedItem(null)}
              className="absolute inset-0 bg-[#080405]/95 backdrop-blur-sm"
            />

            {/* Lightbox Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-2xl bg-[#160e10] border border-[rgba(232,197,154,0.15)] rounded-2xl overflow-hidden relative z-10 shadow-2xl flex flex-col md:flex-row h-auto md:h-[400px]"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white/80 hover:text-white transition-colors cursor-pointer z-30"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Pane: Visual Polaroid Style */}
              <div className="w-full md:w-1/2 bg-[#0c0507] flex items-center justify-center p-6 relative overflow-hidden min-h-[200px] md:min-h-0">
                {selectedItem.image_url ? (
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-br ${selectedItem.color_grad} opacity-40`} />
                )}
                
                <div className="polaroid-card w-[220px] pointer-events-none transform -rotate-2 scale-105 shadow-2xl">
                  <div className="polaroid-img-placeholder w-full aspect-square bg-[#1c1416] relative">
                    {selectedItem.image_url ? (
                      <img 
                        src={selectedItem.image_url} 
                        alt={selectedItem.title} 
                        className="absolute inset-0 w-full h-full object-contain bg-[#1c1416]"
                      />
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-[#c97b84]/10" />
                        <Camera className="w-8 h-8 text-[#2c1f22]/30 stroke-[1.2] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                      </>
                    )}
                  </div>
                  <div className="polaroid-caption text-fluid-lg">{selectedItem.title}</div>
                  <div className="polaroid-date text-fluid-2xs">{selectedItem.date}</div>
                </div>
              </div>

              {/* Right Pane: Narrative memory notes */}
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-[rgba(20,10,12,0.45)]">
                <div>
                  <span className="text-fluid-2xs uppercase tracking-widest text-[#e8c59a] font-bold block mb-1">
                    Memory Log
                  </span>
                  <h3 className="font-serif text-fluid-4xl text-[#fdfaf6] font-normal leading-tight mb-2">
                    {selectedItem.title}
                  </h3>
                  
                  <div className="flex items-center gap-1.5 text-fluid-2xs uppercase tracking-wider text-[#8a7679] font-bold mb-5">
                    <span>{selectedItem.date}</span>
                    <span>•</span>
                    <span className="text-[#c97b84]">{selectedItem.location}</span>
                  </div>

                  <p className="text-fluid-base text-[#8a7679] leading-relaxed italic pr-2 font-medium">
                    “{selectedItem.description}”
                  </p>
                </div>

                <div className="flex items-center gap-1.5 border-t border-white/5 pt-4 mt-6 text-fluid-2xs uppercase tracking-wider text-[#e8c59a]/60 font-bold">
                  <Heart className="w-3.5 h-3.5 fill-current text-[#c97b84]" />
                  <span>Captured in our hearts forever</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
export { DEFAULT_GALLERY };
