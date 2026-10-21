import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Navigation, Phone, Clock, MapPin, Check, ArrowLeft } from "lucide-react";
import { mapEmbed, directionsUrl, getStore as fallbackGetStore } from "@/lib/gateData";
import { Image } from "@/components/ui/image";
import StoreGallery from "@/components/stores/StoreGallery";
import SEO from "@/components/site/SEO";
import { useMarket } from "@/context/MarketContext";
import { marketApi } from "@/api/marketApi";

export default function StoreDetail() {
  const { slug } = useParams();
  const { stores } = useMarket();
  const [store, setStore] = useState(() => {
    return stores?.find((s) => s.slug === slug) || fallbackGetStore(slug);
  });

  useEffect(() => {
    marketApi.getStore(slug)
      .then((res) => {
        if (res?.success && res.store) {
          setStore(res.store);
        }
      })
      .catch(() => {
        const found = stores?.find((s) => s.slug === slug) || fallbackGetStore(slug);
        if (found) setStore(found);
      });
  }, [slug, stores]);

  if (!store) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <h1 className="font-heading text-4xl font-extrabold">Store not found</h1>
        <Link to="/stores" className="mt-6 inline-flex rounded-full bg-[#007BB5] px-6 py-3 font-semibold text-white">
          Back to store finder
        </Link>
      </div>
    );
  }

  const hour = new Date().getHours();
  const openNow =
    store.close > 24
      ? hour >= store.open || hour < store.close - 24
      : hour >= store.open && hour < store.close;

  const highlights = Array.isArray(store.highlights) ? store.highlights : [];

  return (
    <div className="pb-28">
      <SEO
        title={`${store.name} | Gate Hypermarket Locations`}
        description={`${store.tagline || store.name} located at ${store.address}. Hours: ${store.hours}. Direct line: ${store.phone}.`}
        keywords={`${store.name}, ${store.city} hypermarket, supermarket ${store.city}, gate store hours`}
        ogImage={store.image}
      />

      <section className="relative h-[52vh] min-h-[380px] w-full overflow-hidden bg-[#0B1A22]">
        <Image
          src={store.image}
          alt={store.image_alt || store.name}
          className="absolute inset-0 h-full w-full"
          fittingType="fill"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/30" />
        <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-12 lg:px-8">
          <Link to="/stores" className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-white/75 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> All stores
          </Link>
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#007BB5] px-4 py-2 text-sm font-bold text-white">
            <span className={`h-2.5 w-2.5 rounded-full ${openNow ? "bg-[#7CFFA8]" : "bg-[#FFB27C]"}`} />
            {openNow ? "Open now" : "Closed — opens soon"}
          </span>
          <h1 className="mt-5 font-heading text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-6xl">
            {store.name}
          </h1>
          <p className="mt-3 max-w-xl text-lg text-white/75 leading-[1.6]">{store.tagline}</p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.1fr]">
          <div>
            <h2 className="font-heading text-3xl font-extrabold tracking-tight">Visit us</h2>
            <ul className="mt-8 space-y-6">
              <li className="flex gap-4">
                <MapPin className="mt-1 h-5 w-5 shrink-0 text-[#E65100]" />
                <div>
                  <span className="block font-heading font-bold">Address</span>
                  <span className="text-black/60 leading-[1.6]">{store.address}</span>
                </div>
              </li>
              <li className="flex gap-4">
                <Phone className="mt-1 h-5 w-5 shrink-0 text-[#E65100]" />
                <div>
                  <span className="block font-heading font-bold">Direct line</span>
                  <a href={`tel:${String(store.phone || "").replace(/\s/g, "")}`} className="text-[#007BB5] font-semibold">
                    {store.phone}
                  </a>
                </div>
              </li>
              <li className="flex gap-4">
                <Clock className="mt-1 h-5 w-5 shrink-0 text-[#E65100]" />
                <div>
                  <span className="block font-heading font-bold">Operating hours</span>
                  <span className="text-black/60">{store.hours}</span>
                </div>
              </li>
            </ul>

            {highlights.length > 0 && (
              <div className="mt-9 space-y-3">
                {highlights.map((h) => (
                  <p key={h} className="flex items-center gap-3 font-semibold">
                    <Check className="h-5 w-5 text-[#007BB5]" /> {h}
                  </p>
                ))}
              </div>
            )}

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={directionsUrl(store)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-[#E65100] px-7 py-4 font-heading font-bold text-white shadow-lg shadow-[#E65100]/25 transition-transform hover:-translate-y-1"
              >
                <Navigation className="h-5 w-5" /> One-tap navigation
              </a>
              <Link
                to="/promotions"
                className="inline-flex items-center gap-2 rounded-full border border-black/15 px-7 py-4 font-heading font-bold transition-colors hover:border-[#007BB5] hover:text-[#007BB5]"
              >
                This branch's flyer
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-[32px] border border-black/10 shadow-xl">
            <iframe
              title={`Map of ${store.name}`}
              src={mapEmbed(store)}
              className="h-[420px] w-full lg:h-full lg:min-h-[520px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <StoreGallery store={store} />

        <div className="mt-24 border-t border-black/10 pt-14">
          <h3 className="font-heading text-2xl font-extrabold tracking-tight">Other Gate stores</h3>
          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            {stores
              ?.filter((s) => s.slug !== store.slug)
              .map((s) => (
                <Link
                  key={s.slug}
                  to={`/stores/${s.slug}`}
                  className="rounded-2xl border border-black/10 p-6 transition-all hover:-translate-y-1 hover:border-[#007BB5]/50"
                >
                  <span className="font-heading text-lg font-bold">{s.name.replace("Gate — ", "")}</span>
                  <span className="mt-1 block text-sm text-black/50">{s.hours}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>
    </div>
  );
}