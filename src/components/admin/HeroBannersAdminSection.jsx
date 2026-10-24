import React, { useState, useEffect, useRef } from "react";
import {
  ImageIcon,
  Save,
  Upload,
  RefreshCw,
  Monitor,
  Smartphone,
  Eye,
  FileText,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { marketApi } from "@/api/marketApi";

export default function HeroBannersAdminSection({ onNotify }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [bannerId, setBannerId] = useState(null);

  // Desktop image & alt text
  const [desktopFile, setDesktopFile] = useState(null);
  const [desktopPreview, setDesktopPreview] = useState("");
  const [desktopAlt, setDesktopAlt] = useState("");

  // Mobile image & alt text
  const [mobileFile, setMobileFile] = useState(null);
  const [mobilePreview, setMobilePreview] = useState("");
  const [mobileAlt, setMobileAlt] = useState("");

  // Status
  const [isActive, setIsActive] = useState(true);

  // Live device simulator
  const [previewDevice, setPreviewDevice] = useState("desktop"); // "desktop" | "mobile"

  // File input refs
  const desktopInputRef = useRef(null);
  const mobileInputRef = useRef(null);

  // Load the single hero banner on mount
  const loadHeroBanner = async () => {
    try {
      setLoading(true);
      const res = await marketApi.getHeroBanners();
      let currentBanner = null;

      if (res?.success && res.banners?.length > 0) {
        // Pick active or first banner
        currentBanner = res.banners.find((b) => b.is_active) || res.banners[0];
      }

      if (currentBanner) {
        setBannerId(currentBanner.id);
        setDesktopPreview(currentBanner.desktop_image || "");
        setDesktopAlt(currentBanner.desktop_alt || currentBanner.alt_text || "");
        setMobilePreview(currentBanner.mobile_image || "");
        setMobileAlt(currentBanner.mobile_alt || currentBanner.alt_text || "");
        setIsActive(currentBanner.is_active ? true : false);
      } else {
        // No banner in database
        setBannerId(null);
        setDesktopPreview("");
        setDesktopAlt("");
        setMobilePreview("");
        setMobileAlt("");
        setIsActive(true);
      }
      setDesktopFile(null);
      setMobileFile(null);
    } catch (err) {
      console.error("Failed to load hero banner:", err);
      if (onNotify) onNotify("Failed to load hero banner: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHeroBanner();
  }, []);

  // Handle Desktop File Selection
  const handleDesktopFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDesktopFile(file);
      const url = URL.createObjectURL(file);
      setDesktopPreview(url);
    }
  };

  // Handle Mobile File Selection
  const handleMobileFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setMobileFile(file);
      const url = URL.createObjectURL(file);
      setMobilePreview(url);
    }
  };

  // Handle Form Submit / Save
  const handleSave = async (e) => {
    if (e) e.preventDefault();

    if (!desktopPreview && !desktopFile) {
      if (onNotify) onNotify("Please select or upload a Desktop View image.");
      return;
    }
    if (!mobilePreview && !mobileFile) {
      if (onNotify) onNotify("Please select or upload a Mobile View image.");
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();

      if (desktopFile) {
        formData.append("desktop_image", desktopFile);
      } else if (desktopPreview) {
        formData.append("desktop_image", desktopPreview);
      }

      if (mobileFile) {
        formData.append("mobile_image", mobileFile);
      } else if (mobilePreview) {
        formData.append("mobile_image", mobilePreview);
      }

      formData.append("desktop_alt", desktopAlt || "Gate Hypermarket desktop hero banner");
      formData.append("mobile_alt", mobileAlt || "Gate Hypermarket mobile hero banner");
      formData.append("is_active", String(isActive));

      if (bannerId) {
        await marketApi.updateHeroBanner(bannerId, formData);
        if (onNotify) onNotify("Hero banner updated successfully!");
      } else {
        const createRes = await marketApi.createHeroBanner(formData);
        if (createRes?.id) {
          setBannerId(createRes.id);
        }
        if (onNotify) onNotify("Hero banner created successfully!");
      }

      await loadHeroBanner();
    } catch (err) {
      console.error("Save hero banner error:", err);
      if (onNotify) onNotify("Failed to save hero banner: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-[#007BB5]" />
          <p className="text-xs font-semibold text-slate-500">Loading hero banner settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ========================================================= */}
      {/* TOP HEADER CARD                                           */}
      {/* ========================================================= */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#007BB5]/10 text-[#007BB5]">
              <ImageIcon className="h-6 w-6" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading text-2xl font-black text-slate-900">
                  Home Page Hero Banner
                </h2>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    isActive
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-600" : "bg-slate-400"}`} />
                  {isActive ? "Active on Website" : "Inactive"}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">
                Manage the single hero section for your homepage with separate high-resolution Desktop and Mobile view images.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={loadHeroBanner}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Reset
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#E65100] px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#E65100]/25 transition-all hover:bg-[#d44700] disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving Changes..." : "Save Hero Banner"}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* DUAL IMAGE EDITORS (DESKTOP & MOBILE SIDE BY SIDE)        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 1. DESKTOP VIEW BANNER CARD */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#007BB5]/10 text-[#007BB5]">
                  <Monitor className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-black text-slate-900">
                    Desktop View Image
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Rendered on desktop, laptops &amp; widescreen tablets
                  </span>
                </div>
              </div>
              <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-[#007BB5] border border-sky-200/70">
                16:9 Landscape · 1920×1080
              </span>
            </div>

            {/* Desktop Preview Container */}
            <div className="mt-5 space-y-3">
              <div className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 shadow-inner">
                {desktopPreview ? (
                  <>
                    <img
                      src={marketApi.resolveAssetUrl(desktopPreview)}
                      alt={desktopAlt || "Desktop Banner"}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => desktopInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2 text-xs font-bold text-slate-900 shadow-lg backdrop-blur-xs hover:bg-white"
                      >
                        <Upload className="h-4 w-4 text-[#007BB5]" />
                        Replace Image
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => desktopInputRef.current?.click()}
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-6 text-center"
                  >
                    <Upload className="h-10 w-10 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-white">Upload Desktop Banner</span>
                    <span className="text-[11px] text-slate-400 mt-1">Recommended: 1920 × 1080px (JPEG, PNG, WebP)</span>
                  </div>
                )}
              </div>

              {/* Upload & Action Buttons */}
              <label htmlFor="hero-desktop-banner-file" className="sr-only">
                Upload desktop banner image
              </label>
              <input
                id="hero-desktop-banner-file"
                name="desktop_banner_file"
                ref={desktopInputRef}
                type="file"
                accept="image/*"
                onChange={handleDesktopFileChange}
                aria-label="Upload desktop banner image"
                className="hidden"
              />

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => desktopInputRef.current?.click()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Upload className="h-4 w-4 text-[#007BB5]" />
                  {desktopPreview ? "Choose Different Desktop File" : "Upload Desktop File"}
                </button>

                {desktopFile && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    New file staged
                  </span>
                )}
              </div>

              {/* Desktop Alt Text */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <label htmlFor="hero-desktop-alt" className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <FileText className="h-3.5 w-3.5 text-[#007BB5]" />
                  Desktop Image Alt Text (SEO &amp; Accessibility)
                </label>
                <input
                  id="hero-desktop-alt"
                  name="desktopAlt"
                  type="text"
                  value={desktopAlt}
                  onChange={(e) => setDesktopAlt(e.target.value)}
                  placeholder="e.g. Gate Hypermarket modern grocery hall desktop banner"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20"
                />
                <p className="text-[11px] text-slate-400">
                  Screen readers and search engine crawlers read this text when displaying the desktop hero.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. MOBILE VIEW BANNER CARD */}
        <div className="flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <Smartphone className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="font-heading text-base font-black text-slate-900">
                    Mobile View Image
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Rendered on smartphones &amp; portrait mobile screens (&lt;768px)
                  </span>
                </div>
              </div>
              <span className="rounded-lg bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-200/70">
                9:16 Portrait · 800×1400
              </span>
            </div>

            {/* Mobile Preview Container */}
            <div className="mt-5 space-y-3">
              <div className="group relative mx-auto aspect-[9/13] w-full max-w-[220px] overflow-hidden rounded-2xl border-4 border-slate-800 bg-slate-900 shadow-md">
                {mobilePreview ? (
                  <>
                    <img
                      src={marketApi.resolveAssetUrl(mobilePreview)}
                      alt={mobileAlt || "Mobile Banner"}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => mobileInputRef.current?.click()}
                        className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-3 py-1.5 text-xs font-bold text-slate-900 shadow-lg backdrop-blur-xs hover:bg-white"
                      >
                        <Upload className="h-3.5 w-3.5 text-emerald-600" />
                        Replace
                      </button>
                    </div>
                  </>
                ) : (
                  <div
                    onClick={() => mobileInputRef.current?.click()}
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center p-4 text-center"
                  >
                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-white">Upload Mobile Banner</span>
                    <span className="text-[10px] text-slate-400 mt-1">Recommended: 800 × 1400px (Portrait)</span>
                  </div>
                )}
              </div>

              {/* Upload & Action Buttons */}
              <label htmlFor="hero-mobile-banner-file" className="sr-only">
                Upload mobile banner image
              </label>
              <input
                id="hero-mobile-banner-file"
                name="mobile_banner_file"
                ref={mobileInputRef}
                type="file"
                accept="image/*"
                onChange={handleMobileFileChange}
                aria-label="Upload mobile banner image"
                className="hidden"
              />

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => mobileInputRef.current?.click()}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <Upload className="h-4 w-4 text-emerald-600" />
                  {mobilePreview ? "Choose Different Mobile File" : "Upload Mobile File"}
                </button>

                {mobileFile && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    New file staged
                  </span>
                )}
              </div>

              {/* Mobile Alt Text */}
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5">
                <label htmlFor="hero-mobile-alt" className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <FileText className="h-3.5 w-3.5 text-emerald-600" />
                  Mobile Image Alt Text (SEO &amp; Accessibility)
                </label>
                <input
                  id="hero-mobile-alt"
                  name="mobileAlt"
                  type="text"
                  value={mobileAlt}
                  onChange={(e) => setMobileAlt(e.target.value)}
                  placeholder="e.g. Gate Hypermarket mobile smartphone fresh deals banner"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs font-medium text-slate-800 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
                />
                <p className="text-[11px] text-slate-400">
                  Screen readers and mobile search engines read this text on handheld devices.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* INTERACTIVE DEVICE SCREEN SIMULATOR                       */}
      {/* ========================================================= */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-[#0B1A22] text-white shadow-xl">
        {/* Simulator Control Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 text-[#FFB703]">
              <Eye className="h-4 w-4" />
            </span>
            <div>
              <h3 className="font-heading text-sm font-bold uppercase tracking-wider text-white">
                Live Responsive Device Simulator
              </h3>
              <p className="text-[11px] text-slate-400">
                Preview how the hero section dynamically switches between desktop and mobile screen sizes
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-2xl bg-black/40 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => setPreviewDevice("desktop")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                previewDevice === "desktop"
                  ? "bg-[#007BB5] text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Monitor className="h-4 w-4" />
              Desktop View (16:9)
            </button>
            <button
              type="button"
              onClick={() => setPreviewDevice("mobile")}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                previewDevice === "mobile"
                  ? "bg-emerald-600 text-white shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Smartphone className="h-4 w-4" />
              Mobile View (Phone)
            </button>
          </div>
        </div>

        {/* Simulator Viewport Container */}
        <div className="flex min-h-[380px] items-center justify-center p-6 sm:p-10">
          {previewDevice === "desktop" ? (
            <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
              {desktopPreview ? (
                <img
                  src={marketApi.resolveAssetUrl(desktopPreview)}
                  alt={desktopAlt || "Desktop Preview"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-slate-400">
                  Upload a Desktop Image to preview
                </div>
              )}
              {/* Overlay simulation */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs text-white">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1 font-semibold backdrop-blur-md border border-white/20 text-[11px]">
                  <Sparkles className="h-3 w-3 text-[#FFB703]" />
                  Active Desktop Hero View (≥768px)
                </span>
                <span className="text-[11px] text-white/70 italic truncate max-w-xs">
                  Alt: "{desktopAlt || "None"}"
                </span>
              </div>
            </div>
          ) : (
            <div className="relative aspect-[9/16] w-[260px] overflow-hidden rounded-[36px] border-[6px] border-slate-700 bg-black shadow-2xl">
              {/* Smartphone Speaker notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 h-3.5 w-24 rounded-full bg-slate-800 z-10" />

              {mobilePreview ? (
                <img
                  src={marketApi.resolveAssetUrl(mobilePreview)}
                  alt={mobileAlt || "Mobile Preview"}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-center text-xs text-slate-400">
                  Upload a Mobile Image to preview
                </div>
              )}
              {/* Overlay simulation */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-5 left-3 right-3 text-center">
                <span className="inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md border border-white/20">
                  <Sparkles className="h-2.5 w-2.5 text-[#FFB703]" />
                  Mobile Smartphone View (&lt;768px)
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* STATUS & SAVE FOOTER BAR                                  */}
      {/* ========================================================= */}
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <label htmlFor="hero-banner-is-active" className="flex items-center gap-3 cursor-pointer select-none">
          <input
            id="hero-banner-is-active"
            name="isActive"
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-5 w-5 rounded-md accent-[#007BB5] cursor-pointer"
          />
          <div>
            <span className="block text-sm font-bold text-slate-900">
              Hero Banner is Active
            </span>
            <span className="text-xs text-slate-500">
              When checked, this hero banner is displayed live on the homepage.
            </span>
          </div>
        </label>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#E65100] px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-lg shadow-[#E65100]/25 transition-all hover:bg-[#d44700] hover:-translate-y-0.5 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving Changes..." : "Save Hero Banner"}
        </button>
      </div>
    </div>
  );
}
