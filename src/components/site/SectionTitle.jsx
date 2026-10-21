import React from "react";
import { motion } from "framer-motion";

export default function SectionTitle({ kicker = "", title = "", blurb = "", align = "left", light = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: align === "center" ? 0 : -40 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`max-w-2xl ${align === "center" ? "mx-auto text-center" : ""}`}
    >
      {kicker && (
        <span className="inline-flex items-center gap-2 font-heading text-xs font-bold uppercase tracking-[0.28em] text-[#007BB5]">
          <span className="h-2 w-2 rotate-45 bg-[#E65100]" />
          {kicker}
        </span>
      )}
      <h2
        className={`mt-5 font-heading text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl ${
          light ? "text-white" : "text-[#1A1A1A]"
        }`}
      >
        {title}
      </h2>
      {blurb && (
        <p className={`mt-5 text-lg leading-[1.6] ${light ? "text-white/70" : "text-black/60"}`}>
          {blurb}
        </p>
      )}
    </motion.div>
  );
}