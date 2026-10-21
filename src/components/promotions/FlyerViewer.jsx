import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2, X } from "lucide-react";
import FlyerPage from "./FlyerPage";

export default function FlyerViewer({ campaign }) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [full, setFull] = useState(false);

  const pages = React.useMemo(() => {
    if (Array.isArray(campaign?.pages) && campaign.pages.length > 0) {
      return campaign.pages;
    }
    if (campaign?.cover) {
      return [{ image: campaign.cover, alt: campaign.cover_alt || campaign.title }];
    }
    return [];
  }, [campaign]);

  const total = pages.length;

  useEffect(() => {
    setI(0);
    setZoom(1);
  }, [campaign?.id]);

  const go = (next) => {
    if (next < 0 || next >= total) return;
    setDir(next > i ? 1 : -1);
    setI(next);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") go(i + 1);
      if (e.key === "ArrowLeft") go(i - 1);
      if (e.key === "Escape") setFull(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [i, total]);

  if (total === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs max-w-xl mx-auto">
        <h4 className="font-heading text-lg font-bold text-slate-800">Circular Pages Coming Soon</h4>
        <p className="mt-2 text-sm text-slate-500">
          The seasonal flyer pages for {campaign?.title || "this campaign"} are being updated. Visit our store to explore all in-aisle offers!
        </p>
      </div>
    );
  }

  const stage = (
    <div className={full ? "flex h-full w-full flex-col justify-center" : ""}>
      <div
        className="relative mx-auto w-full"
        style={{ perspective: "2000px", maxWidth: full ? "min(100vw, 900px)" : "780px" }}
      >
        <div
          className="relative aspect-[3/4] w-full overflow-hidden rounded-3xl shadow-[0_40px_100px_-30px_rgba(0,0,0,0.55)] transition-transform duration-500"
          style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
        >
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={i}
              custom={dir}
              initial={{ rotateY: dir > 0 ? -95 : 95, opacity: 0.2 }}
              animate={{ rotateY: 0, opacity: 1 }}
              exit={{ rotateY: dir > 0 ? 95 : -95, opacity: 0.2 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformStyle: "preserve-3d", transformOrigin: dir > 0 ? "left center" : "right center" }}
              className="absolute inset-0"
            >
              <FlyerPage page={pages[i]} campaign={campaign} index={i} total={total} />
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => go(i - 1)}
          disabled={i === 0}
          aria-label="Previous page"
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-xl transition-transform hover:scale-110 disabled:opacity-30 lg:-left-7"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => go(i + 1)}
          disabled={i === total - 1}
          aria-label="Next page"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-xl transition-transform hover:scale-110 disabled:opacity-30 lg:-right-7"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      <div className="mx-auto mt-8 flex w-full max-w-xl flex-wrap items-center justify-center gap-3">
        <div className="flex items-center gap-1 rounded-full bg-black/5 p-1">
          <button onClick={() => setZoom((z) => Math.max(0.8, +(z - 0.15).toFixed(2)))} aria-label="Zoom out" className="rounded-full p-2.5 hover:bg-white">
            <ZoomOut className="h-5 w-5" />
          </button>
          <span className="w-14 text-center text-sm font-semibold">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom((z) => Math.min(2, +(z + 0.15).toFixed(2)))} aria-label="Zoom in" className="rounded-full p-2.5 hover:bg-white">
            <ZoomIn className="h-5 w-5" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {pages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => go(idx)}
              aria-label={`Page ${idx + 1}`}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                idx === i ? "w-8 bg-[#E65100]" : "w-2.5 bg-black/20 hover:bg-black/40"
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => setFull((v) => !v)}
          className="inline-flex items-center gap-2 rounded-full bg-[#007BB5] px-5 py-3 text-sm font-semibold text-white"
        >
          {full ? <X className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          {full ? "Exit fullscreen" : "Fullscreen"}
        </button>
      </div>
    </div>
  );

  if (full) {
    return (
      <div className="fixed inset-0 z-[100] overflow-auto bg-[#0B1A22] p-5 sm:p-10">
        <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center text-white">
          {stage}
        </div>
      </div>
    );
  }

  return stage;
}