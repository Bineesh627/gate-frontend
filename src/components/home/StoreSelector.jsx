import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, ArrowUpRight } from "lucide-react";
import { directionsUrl } from "@/lib/gateData";
import { Image } from "@/components/ui/image";
import { useMarket } from "@/context/MarketContext";

export default function StoreSelector({ selected, onSelect }) {
  const { stores } = useMarket();
  const store = stores?.find((s) => s.slug === selected) || stores?.[0];

  if (!store) return null;

  return (
    <section className="relative z-10 -mt-32 px-5 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-[32px] border border-white/60 bg-white/80 p-6 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="font-heading text-xs font-bold uppercase tracking-[0.28em] text-[#007BB5]">
               OUR STORES
            </span>
            <h3 className="mt-2 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl">
              Find Your Nearest GATE
            </h3>
          </div>
          <Link to="/stores" className="inline-flex items-center gap-1.5 font-semibold text-[#E65100]">
            All locations <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stores?.map((s) => {
            const on = s.slug === store.slug;
            return (
              <button
                key={s.slug}
                onClick={() => onSelect(s.slug)}
                className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
                  on
                    ? "border-[#007BB5] bg-[#007BB5] text-white shadow-xl shadow-[#007BB5]/25"
                    : "border-black/10 bg-white text-[#1A1A1A] hover:-translate-y-1 hover:border-[#007BB5]/40"
                }`}
              >
                <MapPin className={`h-5 w-5 ${on ? "text-white" : "text-[#E65100]"}`} />
                <span className="mt-3 block font-heading text-lg font-bold leading-tight">
                  {s.name.replace("Gate — ", "")}
                </span>
                <span className={`text-sm ${on ? "text-white/75" : "text-black/50"}`}>{s.city}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-7 grid gap-6 rounded-3xl bg-[#F5FAFD] p-6 md:grid-cols-[1.1fr_1fr] md:items-center">
          <div>
            <h4 className="font-heading text-2xl font-extrabold tracking-tight">{store.name}</h4>
            <p className="mt-2 text-black/60 leading-[1.6]">{store.tagline}</p>
            <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-[#007BB5]">
              <Clock className="h-4 w-4" /> {store.hours}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to={`/stores/${store.slug}`}
                className="rounded-full bg-[#007BB5] px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                Store details
              </Link>
              <a
                href={directionsUrl(store)}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-[#E65100] px-6 py-3 font-semibold text-white transition-transform hover:-translate-y-0.5"
              >
                Get directions
              </a>
            </div>
          </div>
          <Image
            src={store.image}
            alt={store.image_alt || store.name}
            className="h-52 w-full rounded-2xl md:h-60"
            fittingType="fill"
          />
        </div>
      </div>
    </section>
  );
}