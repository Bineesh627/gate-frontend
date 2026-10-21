import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, Clock, MapPin, Navigation } from "lucide-react";
import { Image } from "@/components/ui/image";
import { directionsUrl } from "@/lib/gateData";

export default function StoreCard({ store, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="group overflow-hidden rounded-[28px] border border-black/5 bg-white shadow-[0_20px_60px_-38px_rgba(0,0,0,0.35)] transition-transform duration-500 hover:-translate-y-2"
    >
      <Link to={`/stores/${store.slug}`} className="block overflow-hidden">
        <Image src={store.image} alt={store.name} className="h-60 w-full transition-transform duration-700 group-hover:scale-105" fittingType="fill" />
      </Link>
      <div className="p-7">
        <span className="font-heading text-xs font-bold uppercase tracking-[0.24em] text-[#007BB5]">{store.city}</span>
        <h3 className="mt-2 font-heading text-2xl font-extrabold tracking-tight">{store.name}</h3>
        <p className="mt-3 flex items-start gap-2 text-black/60 leading-[1.6]">
          <MapPin className="mt-1 h-4 w-4 shrink-0 text-[#E65100]" /> {store.address}
        </p>
        <p className="mt-2 flex items-center gap-2 font-semibold text-[#007BB5]">
          <Clock className="h-4 w-4" /> {store.hours}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to={`/stores/${store.slug}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#007BB5] px-5 py-3 text-sm font-semibold text-white"
          >
            Store page <ArrowUpRight className="h-4 w-4" />
          </Link>
          <a
            href={directionsUrl(store)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#E65100] px-5 py-3 text-sm font-semibold text-white"
          >
            <Navigation className="h-4 w-4" /> Directions
          </a>
        </div>
      </div>
    </motion.div>
  );
}