import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { Image } from "@/components/ui/image";
import SectionTitle from "@/components/site/SectionTitle";

export default function CampaignHighlights() {
  const { campaigns } = useMarket();

  if (!campaigns || campaigns.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-7xl px-5 py-28 lg:px-8 lg:py-40">
      <SectionTitle
        kicker="Active seasonal campaigns"
        title="Big seasons, big feature halls."
        blurb="Each campaign takes over whole sections of our stores for weeks at a time. Browse the digital circular, then come see it in the aisles."
      />

      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {campaigns.map((c, i) => (
          <motion.div
            key={c.id}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <Link
              to="/promotions"
              className="group block overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_20px_60px_-35px_rgba(0,0,0,0.3)] transition-transform duration-500 hover:-translate-y-2"
            >
              <div className="relative overflow-hidden">
                <Image src={c.cover} alt={c.title} className="h-64 w-full transition-transform duration-700 group-hover:scale-105" fittingType="fill" />
                <span className="absolute left-5 top-5 rounded-full bg-white/95 px-4 py-1.5 font-heading text-[11px] font-bold uppercase tracking-[0.18em] text-[#E65100]">
                  {c.season.split("·")[0].trim()}
                </span>
              </div>
              <div className="p-7">
                <h3 className="font-heading text-2xl font-extrabold leading-tight tracking-tight">{c.title}</h3>
                <p className="mt-3 text-black/60 leading-[1.6]">{c.blurb}</p>
                <span className="mt-6 inline-flex items-center gap-1.5 font-semibold text-[#007BB5]">
                  View circular <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}