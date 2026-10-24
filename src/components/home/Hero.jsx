import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { marketApi } from "@/api/marketApi";

export default function Hero({ content }) {
  const [banner, setBanner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Monitor device viewport width
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch active hero banner from API
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    marketApi
      .getActiveHeroBanner()
      .then((res) => {
        if (!isCancelled && res?.success && res.banner) {
          setBanner(res.banner);
        }
      })
      .catch((err) => {
        console.warn("Failed to load active hero banner:", err);
      })
      .finally(() => {
        if (!isCancelled) setLoading(false);
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // Derived content variables with fallbacks
  const badge =
    banner?.badge || content?.hero_badge || "GATE UAE. YOUR VALUE STORE";
  const line1 =
    banner?.title || content?.hero_title_line1 || "Great Finds.";
  const line2 =
    banner?.title_line2 || content?.hero_title_line2 || "";
  const highlight =
    banner?.title_highlight || content?.hero_title_highlight || "Everyday Value.";
  const subtitle =
    banner?.subtitle ||
    content?.hero_subtitle ||
    "Discover great value across home and kitchen essentials, garments, toys, stationery, personal care, DIY and more. Explore exciting offers and everyday finds at your nearest GATE store.";

  const ctaPrimaryText =
    banner?.cta_primary_text ||
    content?.hero_cta_primary ||
    "Explore Latest Offers";
  const ctaPrimaryLink = banner?.cta_primary_link || "/promotions";

  const ctaSecondaryText =
    banner?.cta_secondary_text ||
    content?.hero_cta_secondary ||
    "Find Your Nearest Store";
  const ctaSecondaryLink = banner?.cta_secondary_link || "/stores";

  // Images and separate alt options for desktop and mobile views
  const rawDesktop = banner?.desktop_image || content?.hero_image || "";
  const rawMobile = banner?.mobile_image || banner?.desktop_image || content?.hero_image || "";
  const desktopImage = marketApi.resolveAssetUrl(rawDesktop);
  const mobileImage = marketApi.resolveAssetUrl(rawMobile);
  const desktopAlt =
    banner?.desktop_alt ||
    banner?.alt_text ||
    content?.hero_image_alt ||
    "";
  const mobileAlt =
    banner?.mobile_alt ||
    banner?.alt_text ||
    content?.hero_image_alt ||
    "";

  return (
    <section
      id="home-hero-section"
      className="relative min-h-[92vh] w-full overflow-hidden bg-[#0B1A22] lg:min-h-[100vh]"
    >
      {/* Dynamic Responsive Picture (Desktop vs Mobile Views) */}
      {(desktopImage || mobileImage) && (
        <AnimatePresence mode="wait">
          <motion.div
            key={banner?.id || "hero-banner"}
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 h-full w-full"
          >
            <picture className="block h-full w-full">
              {/* Mobile View Screen Size (<768px) */}
              {mobileImage && (
                <source
                  media="(max-width: 767px)"
                  srcSet={mobileImage}
                  type="image/jpeg"
                />
              )}
              {/* Desktop View Screen Size (>=768px) */}
              {desktopImage && (
                <source
                  media="(min-width: 768px)"
                  srcSet={desktopImage}
                  type="image/jpeg"
                />
              )}
              {/* Dynamic Alt text mapped to current device view */}
              <img
                src={desktopImage || mobileImage}
                alt={isMobile ? mobileAlt : desktopAlt}
                className="h-full w-full object-cover object-center"
                loading="eager"
              />
            </picture>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Atmospheric Overlays for optimal text legibility and brand richness */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/85" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#007BB5]/45 via-black/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-radial-at-c from-transparent via-transparent to-black/60" />

      {/* Main Hero Content */}
      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center px-5 pb-36 pt-24 lg:min-h-[100vh] lg:px-8">
        {/* Badges strip: Promotion badge */}
        <div className="flex flex-wrap items-center gap-2.5">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="inline-flex w-fit items-center gap-2.5 rounded-full bg-[#E65100] px-4 py-2 font-heading text-xs font-bold uppercase tracking-[0.2em] text-white shadow-lg shadow-[#E65100]/30 sm:px-5 sm:py-2.5"
          >
            <span className="h-2 w-2 rotate-45 bg-white" />
            {badge}
          </motion.span>

          {/* Device view indicator for clarity */}
          <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-black/40 px-3 py-1 text-[11px] font-medium text-white/70 backdrop-blur-xs border border-white/10">
            <Sparkles className="h-3 w-3 text-[#FFB703]" />
            {isMobile ? "Mobile View" : "Desktop View"}
          </span>
        </div>

        {/* Dynamic Animated Headline */}
        <motion.h1
          key={`headline-${banner?.id || "hero"}`}
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 max-w-5xl font-heading text-[12vw] font-black uppercase leading-[0.92] tracking-tight text-white sm:mt-8 sm:text-[8.5vw] lg:text-[6.2vw]"
        >
          {line1}
          {line2 ? (
            <>
              <br />
              {line2}
            </>
          ) : null}
          {highlight ? (
            <>
              <br />
              <span className="text-[#4CC9F0] drop-shadow-sm">{highlight}</span>
            </>
          ) : null}
        </motion.h1>

        {/* Dynamic Subtitle */}
        <motion.p
          key={`sub-${banner?.id || "hero"}`}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.25 }}
          className="mt-6 max-w-xl text-base leading-[1.6] text-white/85 sm:mt-8 sm:text-lg lg:text-xl"
        >
          {subtitle}
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35 }}
          className="mt-9 flex flex-col gap-3.5 sm:mt-11 sm:flex-row sm:items-center"
        >
          <Link
            to={ctaPrimaryLink}
            className="group inline-flex items-center justify-center gap-3 rounded-full bg-[#E65100] px-8 py-4 font-heading text-base font-bold text-white shadow-2xl shadow-[#E65100]/30 transition-all duration-300 hover:-translate-y-1 hover:bg-[#d84a00] sm:px-9 sm:py-5 sm:text-lg"
          >
            {ctaPrimaryText}
            <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
          <Link
            to={ctaSecondaryLink}
            className="inline-flex items-center justify-center gap-3 rounded-full border border-white/40 px-8 py-4 font-heading text-base font-bold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white hover:text-[#1A1A1A] sm:px-9 sm:py-5 sm:text-lg"
          >
            {ctaSecondaryText}
          </Link>
        </motion.div>
      </div>

      {/* Down arrow scroll cue */}
      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-white/50 lg:block">
        <ChevronDown className="h-7 w-7 animate-bounce" />
      </div>
    </section>
  );
}