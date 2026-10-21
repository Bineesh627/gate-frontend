import React from "react";
import { Link } from "react-router-dom";
import { Navigation, Phone } from "lucide-react";
import { directionsUrl } from "@/lib/gateData";
import SectionTitle from "@/components/site/SectionTitle";
import { useMarket } from "@/context/MarketContext";

export default function DirectionsStrip({ content }) {
  const { stores } = useMarket();

  if (!stores || stores.length === 0) return null;

  const title = content?.directions_title || "One tap to the door.";
  const blurb = content?.directions_subtitle || "Directions, phone lines and opening hours for every Gate store.";

  return (
    <section className="mx-auto max-w-7xl px-5 py-28 lg:px-8 lg:py-36">
      <SectionTitle
        kicker="Quick links"
        title={title}
        blurb={blurb}
        align="center"
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stores?.map((s) => (
          <div
            key={s.slug}
            className="rounded-3xl border border-black/10 p-6 transition-all duration-300 hover:-translate-y-1.5 hover:border-[#007BB5]/40 hover:shadow-xl"
          >
            <Link to={`/stores/${s.slug}`} className="font-heading text-xl font-extrabold tracking-tight hover:text-[#007BB5]">
              {s.name.replace("Gate — ", "")}
            </Link>
            <p className="mt-2 text-sm text-black/55 leading-[1.6]">{s.address}</p>
            <p className="mt-3 text-sm font-semibold text-[#007BB5]">{s.hours}</p>
            <div className="mt-5 flex gap-2">
              <a
                href={directionsUrl(s)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E65100] px-4 py-2.5 text-sm font-semibold text-white"
              >
                <Navigation className="h-4 w-4" /> Directions
              </a>
              <a
                href={`tel:${String(s.phone || "").replace(/\s/g, "")}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold"
              >
                <Phone className="h-4 w-4" /> Call
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}