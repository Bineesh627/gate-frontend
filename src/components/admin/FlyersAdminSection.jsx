import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Upload,
  Eye,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  FileText,
  MapPin,
  Tag,
  Save,
  ExternalLink,
  X,
  Layers,
  RefreshCw,
  Store,
  Calendar,
  Check,
  Search,
  ArrowLeft,
} from "lucide-react";
import { marketApi } from "@/api/marketApi";

export default function FlyersAdminSection({
  showToast,
  onCampaignsUpdated,
  action,
  id,
  onNavigate,
}) {
  const [stores, setStores] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPages, setUploadingPages] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  // Active view: "list" (View Flyers List) or "form" (Add / Edit Flyer)
  const [viewMode, setViewMode] = useState(
    action === "new" || action === "add" || action === "edit" ? "form" : "list"
  );

  // Search & Branch Filter for Flyers List
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Editor Form State
  const [currentDbId, setCurrentDbId] = useState(null);
  const [campaignId, setCampaignId] = useState("");
  const [title, setTitle] = useState("");
  const [season, setSeason] = useState("");
  const [blurb, setBlurb] = useState("");
  const [cover, setCover] = useState("");
  const [coverAlt, setCoverAlt] = useState("");
  const [associatedBranches, setAssociatedBranches] = useState([]);
  const [isActive, setIsActive] = useState(true);

  // Pages array: [{ page_number: 1, image: "", alt: "" }]
  const [pages, setPages] = useState([]);

  // File input refs
  const multiFileInputRef = useRef(null);
  const singleCoverInputRef = useRef(null);
  const singlePageInputRefs = useRef({});

  // Load stores and campaigns
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [storesRes, campaignsRes] = await Promise.all([
        marketApi.getStores().catch(() => ({ success: false, stores: [] })),
        marketApi.getCampaigns(true).catch(() => ({ success: false, campaigns: [] })),
      ]);

      const stList = storesRes?.stores || [];
      const campList = campaignsRes?.campaigns || [];

      setStores(stList);
      setCampaigns(campList);

      // Default associated branches for new campaign
      if (stList.length > 0 && associatedBranches.length === 0) {
        setAssociatedBranches(stList.map((s) => s.slug));
      }
    } catch (err) {
      console.error("Failed to load flyer admin data:", err);
      showToast?.("Failed to load stores or campaigns: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Synchronize viewMode and form state with URL params (action & id)
  useEffect(() => {
    if (action === "new" || action === "add") {
      setViewMode("form");
      if (currentDbId !== null) {
        resetFormToNew();
      }
    } else if (action === "edit" && id) {
      setViewMode("form");
      const found = campaigns.find(
        (c) => String(c.id || c.db_id) === String(id) || c.campaign_id === id
      );
      if (found && currentDbId !== (found.db_id || found.id)) {
        populateForm(found);
      }
    } else {
      setViewMode("list");
    }
  }, [action, id, campaigns]);

  // Navigate helpers
  const goToList = () => {
    if (onNavigate) {
      onNavigate("/admin/campaigns");
    } else {
      setViewMode("list");
    }
  };

  const goToNew = () => {
    resetFormToNew();
    if (onNavigate) {
      onNavigate("/admin/campaigns/new");
    } else {
      setViewMode("form");
    }
  };

  const goToEdit = (camp) => {
    populateForm(camp);
    const targetId = camp.id || camp.db_id || camp.campaign_id;
    if (onNavigate) {
      onNavigate(`/admin/campaigns/edit/${targetId}`);
    } else {
      setViewMode("form");
    }
  };

  // Populate campaign for editing
  const populateForm = (camp) => {
    if (!camp) {
      resetFormToNew();
      return;
    }
    setCurrentDbId(camp.db_id || camp.id);
    setCampaignId(camp.campaign_id || camp.id || "");
    setTitle(camp.title || "");
    setSeason(camp.season || "");
    setBlurb(camp.blurb || "");
    setCover(camp.cover || "");
    setCoverAlt(camp.cover_alt || camp.title || "");
    setAssociatedBranches(
      Array.isArray(camp.branches)
        ? camp.branches
        : stores.map((s) => s.slug)
    );
    setIsActive(camp.is_active !== false);

    // Normalize pages
    let rawPages = [];
    if (Array.isArray(camp.pages)) {
      rawPages = camp.pages;
    } else if (typeof camp.pages === "string") {
      try {
        rawPages = JSON.parse(camp.pages);
      } catch {
        rawPages = [];
      }
    }

    const formattedPages = (Array.isArray(rawPages) ? rawPages : []).map((p, idx) => {
      if (typeof p === "string") {
        return {
          page_number: idx + 1,
          image: p,
          alt: `${camp.title || "Flyer"} — Page ${idx + 1}`,
        };
      }
      return {
        page_number: p.page_number || idx + 1,
        image: p.image || p.url || "",
        alt: p.alt || `${camp.title || "Flyer"} — Page ${idx + 1}`,
      };
    });

    setPages(formattedPages);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Reset form to start a new campaign
  const resetFormToNew = () => {
    setCurrentDbId(null);
    setCampaignId("");
    setTitle("");
    setSeason("");
    setBlurb("");
    setCover("");
    setCoverAlt("");
    setAssociatedBranches(
      selectedBranch !== "all" ? [selectedBranch] : stores.map((s) => s.slug)
    );
    setIsActive(true);
    setPages([]);
    setUploadProgress("");
  };

  // Handle Multi-Image Upload (Natural Sort 1 to N)
  const processFiles = async (fileList) => {
    const rawFiles = Array.from(fileList || []).filter((f) =>
      f.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|svg|avif)$/i.test(f.name)
    );

    if (rawFiles.length === 0) {
      alert("Please select valid image files (JPG, PNG, WebP).");
      return;
    }

    // Natural sort: page1, page2, page10 instead of page1, page10, page2
    const sortedFiles = rawFiles.sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: "base" })
    );

    setUploadingPages(true);
    setUploadProgress(`Uploading ${sortedFiles.length} flyer images...`);

    try {
      const res = await marketApi.uploadMultipleFiles(sortedFiles, "flyers");
      if (res?.success && Array.isArray(res.files) && res.files.length > 0) {
        const newUploadedPages = res.files.map((f, i) => {
          const pageNum = pages.length + i + 1;
          const cleanName = f.originalname
            ? f.originalname.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
            : `Page ${pageNum}`;
          return {
            page_number: pageNum,
            image: f.url,
            alt: `${title || "Gate Hypermarket Flyer"} — ${cleanName}`,
          };
        });

        const combined = [...pages, ...newUploadedPages].map((p, idx) => ({
          ...p,
          page_number: idx + 1,
        }));

        setPages(combined);

        // Auto-assign Page 1 as cover if no cover is set
        if (!cover && combined.length > 0) {
          setCover(combined[0].image);
          setCoverAlt(combined[0].alt || `${title || "Flyer"} Cover`);
        }

        showToast?.(`Added ${newUploadedPages.length} flyer page image(s) in order!`);
      } else {
        throw new Error(res?.message || "Upload did not return file details.");
      }
    } catch (err) {
      console.error("Flyer upload error:", err);
      alert("Failed to upload flyer images: " + err.message);
    } finally {
      setUploadingPages(false);
      setUploadProgress("");
      if (multiFileInputRef.current) {
        multiFileInputRef.current.value = "";
      }
    }
  };

  const handleFileInputChange = (e) => {
    processFiles(e.target.files);
  };

  // Drag and Drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Replace a single page image
  const handleReplaceSinglePage = async (index, file) => {
    if (!file) return;
    try {
      const res = await marketApi.uploadFile(file, "flyers");
      if (res?.success && res.url) {
        setPages((prev) => {
          const updated = [...prev];
          updated[index] = { ...updated[index], image: res.url };
          return updated;
        });
        showToast?.(`Page ${index + 1} image updated.`);
      }
    } catch (err) {
      alert("Failed to replace image: " + err.message);
    }
  };

  // Update specific page field (alt or image)
  const handleUpdatePage = (index, field, value) => {
    setPages((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // Reordering pages
  const handleMovePageUp = (index) => {
    if (index === 0) return;
    setPages((prev) => {
      const updated = [...prev];
      const temp = updated[index - 1];
      updated[index - 1] = updated[index];
      updated[index] = temp;
      return updated.map((p, i) => ({ ...p, page_number: i + 1 }));
    });
  };

  const handleMovePageDown = (index) => {
    if (index === pages.length - 1) return;
    setPages((prev) => {
      const updated = [...prev];
      const temp = updated[index + 1];
      updated[index + 1] = updated[index];
      updated[index] = temp;
      return updated.map((p, i) => ({ ...p, page_number: i + 1 }));
    });
  };

  const handleDeletePage = (index) => {
    setPages((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.map((p, i) => ({ ...p, page_number: i + 1 }));
    });
  };

  // Branch checkbox toggle
  const handleToggleBranch = (slug) => {
    setAssociatedBranches((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleSelectAllBranches = () => {
    if (associatedBranches.length === stores.length) {
      setAssociatedBranches([]);
    } else {
      setAssociatedBranches(stores.map((s) => s.slug));
    }
  };

  // Save Campaign & Flyer Pages
  const handleSaveCampaign = async (e) => {
    e?.preventDefault();
    if (!title.trim()) {
      alert("Please provide a Campaign Title.");
      return;
    }

    const genSlug =
      campaignId.trim() ||
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const orderedPages = pages.map((p, idx) => ({
      page_number: idx + 1,
      image: p.image,
      alt: p.alt || `${title} — Page ${idx + 1}`,
    }));

    const finalCover = (orderedPages.length > 0 ? orderedPages[0].image : "") || cover || "";
    const finalCoverAlt = (orderedPages.length > 0 ? orderedPages[0].alt : "") || coverAlt || `${title} Flyer Cover`;

    const finalBranches =
      associatedBranches.length > 0
        ? associatedBranches
        : stores.map((s) => s.slug);

    setSaving(true);
    try {
      const payload = {
        campaign_id: genSlug,
        title: title.trim(),
        season: season.trim(),
        blurb: blurb.trim(),
        cover: finalCover,
        cover_alt: finalCoverAlt,
        branches: finalBranches,
        pages: orderedPages,
        is_active: isActive,
      };

      if (currentDbId) {
        await marketApi.updateCampaign(currentDbId, payload);
        showToast?.(`Campaign "${title}" updated with ${orderedPages.length} flyer page(s)!`);
      } else {
        await marketApi.createCampaign(payload);
        showToast?.(`New Campaign "${title}" created with ${orderedPages.length} flyer page(s)!`);
      }

      await loadData();
      if (onCampaignsUpdated) onCampaignsUpdated();
      // Return smoothly to the flyers list
      goToList();
    } catch (err) {
      alert("Failed to save flyer campaign: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete Campaign
  const handleDeleteCampaign = async (delId, campTitle) => {
    if (!window.confirm(`Are you sure you want to delete campaign "${campTitle}"?`)) return;
    try {
      await marketApi.deleteCampaign(delId);
      showToast?.(`Campaign "${campTitle}" deleted successfully.`);
      if (currentDbId === delId) {
        resetFormToNew();
      }
      await loadData();
      if (onCampaignsUpdated) onCampaignsUpdated();
    } catch (err) {
      alert("Failed to delete campaign: " + err.message);
    }
  };

  // Toggle Campaign active status directly from the list
  const handleToggleActive = async (camp) => {
    const newStatus = !(camp.is_active !== false);
    try {
      await marketApi.updateCampaign(camp.db_id || camp.id, {
        campaign_id: camp.campaign_id || camp.id,
        title: camp.title,
        season: camp.season,
        blurb: camp.blurb,
        cover: camp.cover,
        cover_alt: camp.cover_alt,
        branches: Array.isArray(camp.branches) ? camp.branches : [],
        pages: Array.isArray(camp.pages) ? camp.pages : [],
        is_active: newStatus,
      });
      showToast?.(`Flyer "${camp.title}" is now ${newStatus ? "Active & Visible" : "Hidden"}.`);
      await loadData();
      if (onCampaignsUpdated) onCampaignsUpdated();
    } catch (err) {
      showToast?.("Failed to toggle status: " + err.message);
    }
  };

  // Filter campaigns for the branch tab and search bar
  const filteredCampaigns = campaigns.filter((c) => {
    // Branch filter
    if (selectedBranch !== "all") {
      const branches = Array.isArray(c.branches) ? c.branches : [];
      if (!branches.includes(selectedBranch)) return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (c.title || "").toLowerCase().includes(q);
      const matchSeason = (c.season || "").toLowerCase().includes(q);
      const matchBlurb = (c.blurb || "").toLowerCase().includes(q);
      const matchBranches = (Array.isArray(c.branches) ? c.branches.join(" ") : "")
        .toLowerCase()
        .includes(q);
      if (!matchTitle && !matchSeason && !matchBlurb && !matchBranches) return false;
    }
    return true;
  });

  const totalPagesAcrossCampaigns = campaigns.reduce((acc, c) => {
    let pCount = 0;
    if (Array.isArray(c.pages)) pCount = c.pages.length;
    else if (typeof c.pages === "string") {
      try {
        pCount = JSON.parse(c.pages).length;
      } catch {
        pCount = 0;
      }
    }
    return acc + pCount;
  }, 0);

  const activeCampaignsCount = campaigns.filter((c) => c.is_active !== false).length;

  return (
    <div className="space-y-6">
      {/* ========================================================
          TOP NAVIGATION SUBTABS BAR:
          1. "View Flyers List"
          2. "Add / Edit Flyer"
      ======================================================== */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-2 pt-2 rounded-t-3xl shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goToList}
            className={`flex items-center gap-2.5 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
              viewMode === "list"
                ? "border-[#007BB5] text-[#007BB5]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Flyers List</span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                viewMode === "list"
                  ? "bg-[#007BB5]/10 text-[#007BB5]"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {campaigns.length}
            </span>
          </button>

          <button
            type="button"
            onClick={goToNew}
            className={`flex items-center gap-2.5 px-6 py-4 text-sm font-bold border-b-2 transition-all ${
              viewMode === "form"
                ? "border-[#E65100] text-[#E65100]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {currentDbId && viewMode === "form" ? (
              <>
                <Edit2 className="h-4 w-4" />
                <span>Edit Flyer</span>
                <span className="rounded-full bg-orange-100 px-2 py-0.5 text-[11px] font-bold text-[#E65100]">
                  Active Edit
                </span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Add New Flyer</span>
              </>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 pr-4">
          <a
            href="/promotions"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/70 px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-sky-50 hover:text-[#007BB5] transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" /> View Public Site
          </a>
        </div>
      </div>

      {/* ========================================================
          PAGE 1: VIEW FLYERS LIST
      ======================================================== */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Quick Stats Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Flyers
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-50 text-[#007BB5]">
                  <Layers className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 font-heading">
                {campaigns.length}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Configured promotional circulars</p>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Active &amp; Live
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-emerald-900 font-heading">
                {activeCampaignsCount}
              </div>
              <p className="mt-0.5 text-xs text-emerald-700/80">Visible on public customer site</p>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Pages
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-50 text-[#E65100]">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 font-heading">
                {totalPagesAcrossCampaigns}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Catalog image pages hosted</p>
            </div>

            <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Store Branches
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                  <Store className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-2 text-2xl font-black text-slate-900 font-heading">
                {stores.length}
              </div>
              <p className="mt-0.5 text-xs text-slate-500">Dubai &amp; Ajman locations</p>
            </div>
          </div>

          {/* Filtering, Search & Action Bar */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-black text-slate-900">
                  Flyers &amp; Campaigns List
                </h2>
                <p className="text-xs text-slate-500">
                  Manage all promotional circulars, review multi-page brochures, or quickly create a new one.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={goToNew}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#E65100] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#E65100]/25 hover:bg-[#d44700] transition-all"
                >
                  <Plus className="h-4 w-4" /> + Add New Flyer
                </button>
              </div>
            </div>

            {/* Branch Pills and Search Row */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-3 border-t border-slate-100">
              {/* Branch Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedBranch("all")}
                  className={`inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                    selectedBranch === "all"
                      ? "bg-slate-900 text-white shadow-xs"
                      : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <span>All Branches</span>
                  <span className="rounded-full bg-white/20 px-2 py-0.2 text-[10px]">
                    {campaigns.length}
                  </span>
                </button>

                {stores.map((s) => {
                  const isSelected = selectedBranch === s.slug;
                  const count = campaigns.filter((c) =>
                    Array.isArray(c.branches) ? c.branches.includes(s.slug) : false
                  ).length;

                  return (
                    <button
                      type="button"
                      key={s.slug}
                      onClick={() => setSelectedBranch(s.slug)}
                      className={`inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                        isSelected
                          ? "bg-[#007BB5] text-white shadow-md shadow-[#007BB5]/20"
                          : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <MapPin className="h-3 w-3 opacity-70" />
                      <span>{s.name.replace("Gate — ", "")}</span>
                      <span
                        className={`rounded-full px-2 py-0.2 text-[10px] ${
                          isSelected ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search Query Input */}
              <div className="relative min-w-[240px]">
                <label htmlFor="flyer-search-query" className="sr-only">
                  Search flyers
                </label>
                <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  id="flyer-search-query"
                  name="searchQuery"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search flyers by name or branch..."
                  aria-label="Search flyers by name or branch"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/60 pl-9 pr-4 py-2 text-xs font-medium text-slate-900 outline-none focus:border-[#007BB5] focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Flyers Table / Cards */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            {loading ? (
              <div className="py-16 text-center">
                <RefreshCw className="mx-auto h-8 w-8 animate-spin text-[#007BB5] mb-2" />
                <p className="text-xs font-bold text-slate-500">Loading flyers and campaigns...</p>
              </div>
            ) : filteredCampaigns.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                  <Layers className="h-7 w-7" />
                </div>
                <h4 className="font-heading text-base font-bold text-slate-800">
                  No promotional flyers found
                </h4>
                <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                  {searchQuery || selectedBranch !== "all"
                    ? "Try adjusting your branch filter or search keywords."
                    : "No flyers currently exist in the database. Add your first promotional circular to get started."}
                </p>
                <button
                  type="button"
                  onClick={goToNew}
                  className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#E65100] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#E65100]/25 hover:bg-[#d44700]"
                >
                  <Plus className="h-4 w-4" /> + Create Your First Flyer
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
                      <th className="pb-3.5 pr-4">Cover</th>
                      <th className="pb-3.5 pr-4">Flyer Title &amp; Validity</th>
                      <th className="pb-3.5 pr-4">Store Branches</th>
                      <th className="pb-3.5 pr-4 text-center">Pages</th>
                      <th className="pb-3.5 pr-4 text-center">Public Status</th>
                      <th className="pb-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredCampaigns.map((c) => {
                      let pageCount = 0;
                      if (Array.isArray(c.pages)) pageCount = c.pages.length;
                      else if (typeof c.pages === "string") {
                        try {
                          pageCount = JSON.parse(c.pages).length;
                        } catch {
                          pageCount = 0;
                        }
                      }

                      const isFlyerActive = c.is_active !== false;
                      const coverImg =
                        c.cover ||
                        (Array.isArray(c.pages) && c.pages[0]?.image) ||
                        "/placeholder.jpg";

                      return (
                        <tr
                          key={c.id || c.db_id}
                          className="hover:bg-slate-50/70 transition-colors group"
                        >
                          {/* Cover Thumbnail */}
                          <td className="py-4 pr-4">
                            <div
                              onClick={() => setPreviewImage(coverImg)}
                              className="relative h-16 w-12 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs cursor-pointer group/thumb shrink-0"
                              title="Click to view cover preview"
                            >
                              <img
                                src={coverImg}
                                alt={c.cover_alt || c.title}
                                className="h-full w-full object-contain group-hover/thumb:scale-110 transition-transform"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                <Eye className="h-4 w-4 text-white" />
                              </div>
                            </div>
                          </td>

                          {/* Title & Season */}
                          <td className="py-4 pr-4 min-w-[200px]">
                            <span className="font-heading font-black text-slate-900 block text-sm">
                              {c.title}
                            </span>
                            {c.season && (
                              <div className="mt-0.5 flex items-center gap-1.5 text-xs text-[#007BB5] font-semibold">
                                <Calendar className="h-3 w-3" />
                                <span>{c.season}</span>
                              </div>
                            )}
                            {c.blurb && (
                              <p className="mt-1 text-xs text-slate-500 line-clamp-1 max-w-sm">
                                {c.blurb}
                              </p>
                            )}
                          </td>

                          {/* Branches */}
                          <td className="py-4 pr-4 min-w-[160px]">
                            <div className="flex flex-wrap gap-1">
                              {(Array.isArray(c.branches) ? c.branches : []).map((b) => (
                                <span
                                  key={b}
                                  className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 capitalize"
                                >
                                  <MapPin className="h-2.5 w-2.5 text-slate-400" />
                                  {b.replace("gate-", "").replace("-", " ")}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Pages Count */}
                          <td className="py-4 pr-4 text-center">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 font-mono text-xs font-bold text-[#007BB5]">
                              <FileText className="h-3 w-3" />
                              {pageCount} {pageCount === 1 ? "page" : "pages"}
                            </span>
                          </td>

                          {/* Status & Quick Toggle */}
                          <td className="py-4 pr-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleToggleActive(c)}
                              title={
                                isFlyerActive
                                  ? "Click to deactivate/hide flyer"
                                  : "Click to activate flyer"
                              }
                              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all shadow-2xs ${
                                isFlyerActive
                                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                              }`}
                            >
                              <span
                                className={`h-2 w-2 rounded-full ${
                                  isFlyerActive ? "bg-emerald-500" : "bg-slate-400"
                                }`}
                              />
                              <span>{isFlyerActive ? "Active" : "Hidden"}</span>
                            </button>
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              {/* Edit Flyer */}
                              <button
                                type="button"
                                onClick={() => goToEdit(c)}
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:border-[#007BB5] hover:text-[#007BB5] transition-colors shadow-2xs"
                                title="Edit Flyer Details & Pages"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span>Edit</span>
                              </button>

                              {/* View on Public site */}
                              <a
                                href={`/promotions?branch=${
                                  Array.isArray(c.branches) && c.branches[0]
                                    ? c.branches[0]
                                    : "all"
                                }&campaign=${c.campaign_id || c.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-sky-50 hover:text-[#007BB5] transition-colors shadow-2xs"
                                title="Preview Flyer on Public Website"
                              >
                                <ExternalLink className="h-3.5 w-3.5" />
                                <span>View</span>
                              </a>

                              {/* Delete Flyer */}
                              <button
                                type="button"
                                onClick={() => handleDeleteCampaign(c.db_id || c.id, c.title)}
                                className="rounded-xl border border-red-200 bg-white p-1.5 text-red-600 hover:bg-red-50 transition-colors shadow-2xs"
                                title="Delete Flyer Campaign"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================
          PAGE 2: ADD / EDIT FLYER (DEDICATED FULL FORM PAGE)
      ======================================================== */}
      {viewMode === "form" && (
        <div className="space-y-6">
          {/* Top Breadcrumb & Back Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={goToList}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors shadow-xs"
                title="Back to Flyers List"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                      currentDbId
                        ? "bg-[#007BB5]/10 text-[#007BB5]"
                        : "bg-[#E65100]/10 text-[#E65100]"
                    }`}
                  >
                    {currentDbId ? "Edit Campaign" : "Add New Flyer"}
                  </span>
                  {currentDbId && (
                    <span className="font-mono text-[11px] text-slate-400">
                      ID: {campaignId || currentDbId}
                    </span>
                  )}
                </div>
                <h2 className="mt-1 font-heading text-xl font-black text-slate-900">
                  {currentDbId ? `Editing: ${title || "Flyer Campaign"}` : "Add New Flyer Circular"}
                </h2>
                <p className="text-xs text-slate-500">
                  Configure campaign info, upload ordered pages (1 to N), set targeted store branches, and publish.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 self-end sm:self-center">
              <button
                type="button"
                onClick={goToList}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel &amp; Return
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveCampaign}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#E65100] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[#E65100]/25 hover:bg-[#d44700] disabled:opacity-50 transition-all"
              >
                <Save className="h-4 w-4" />
                {saving
                  ? "Saving Flyer..."
                  : currentDbId
                  ? "Update Flyer"
                  : "Save & Publish Flyer"}
              </button>
            </div>
          </div>

          {/* Form Card */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xs space-y-8">
            {/* ========================================================
                SECTION 1: CAMPAIGN DETAILS
            ======================================================== */}
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <Tag className="h-4 w-4 text-[#007BB5]" />
                <h3 className="font-heading text-base font-bold text-slate-900">
                  1. Campaign Information &amp; Validity
                </h3>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                {/* Title */}
                <div>
                  <label htmlFor="flyer-campaign-title" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Campaign Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="flyer-campaign-title"
                    name="title"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      if (!currentDbId) {
                        setCampaignId(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "")
                        );
                      }
                    }}
                    placeholder="e.g. Mega Weekend Savings"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#007BB5] focus:bg-white focus:ring-2 focus:ring-[#007BB5]/20"
                  />
                </div>

                {/* Valid Dates / Season */}
                <div>
                  <label htmlFor="flyer-season" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Season Duration / Validity Dates
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      id="flyer-season"
                      name="season"
                      type="text"
                      value={season}
                      onChange={(e) => setSeason(e.target.value)}
                      placeholder="e.g. Valid: 16 Oct – 26 Oct 2026"
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-xs font-semibold text-slate-900 outline-none focus:border-[#007BB5] focus:bg-white focus:ring-2 focus:ring-[#007BB5]/20"
                    />
                  </div>
                </div>

                {/* URL Slug */}
                <div>
                  <label htmlFor="flyer-campaign-id" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Flyer URL Slug
                  </label>
                  <input
                    id="flyer-campaign-id"
                    name="campaignId"
                    type="text"
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    placeholder="mega-weekend-savings"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-[#007BB5] focus:bg-white"
                  />
                </div>

                {/* Short Blurb */}
                <div>
                  <label htmlFor="flyer-blurb" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                    Short Description / Blurb
                  </label>
                  <input
                    id="flyer-blurb"
                    name="blurb"
                    type="text"
                    value={blurb}
                    onChange={(e) => setBlurb(e.target.value)}
                    placeholder="e.g. Fresh produce, butchery, dairy &amp; household essentials."
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-xs font-medium text-slate-900 outline-none focus:border-[#007BB5] focus:bg-white"
                  />
                </div>

                {/* Store Branches Assignment */}
                <div className="sm:col-span-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Applicable Store Branches:
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllBranches}
                      className="text-xs font-bold text-[#007BB5] hover:underline"
                    >
                      {associatedBranches.length === stores.length
                        ? "Deselect All"
                        : "Select All Branches"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {stores.map((st) => {
                      const checked = associatedBranches.includes(st.slug);
                      return (
                        <button
                          type="button"
                          key={st.slug}
                          onClick={() => handleToggleBranch(st.slug)}
                          className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                            checked
                              ? "bg-[#007BB5] text-white shadow-xs"
                              : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          <div
                            className={`flex h-4 w-4 items-center justify-center rounded ${
                              checked ? "bg-white text-[#007BB5]" : "border border-slate-300"
                            }`}
                          >
                            {checked && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          {st.name} ({st.city})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================
                SECTION 2: MULTI-PAGE FLYER PAGES UPLOAD (1 TO N)
            ======================================================== */}
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-[#007BB5]" />
                    <h3 className="font-heading text-base font-bold text-slate-900">
                      2. Flyer Pages (1 to N Order) &amp; SEO Alt Text
                    </h3>
                    <span className="rounded-full bg-slate-900 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-400">
                      {pages.length} {pages.length === 1 ? "Page" : "Pages"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Upload multiple flyer images at once. Natural sorting automatically preserves page numbers 1 to N.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="flyer-multi-file-input" className="sr-only">
                    Upload multiple flyer images
                  </label>
                  <input
                    id="flyer-multi-file-input"
                    name="flyer_multi_files"
                    ref={multiFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileInputChange}
                    aria-label="Upload multiple flyer images"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingPages}
                    onClick={() => multiFileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#007BB5] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-[#007BB5]/25 hover:bg-[#006699] disabled:opacity-50 transition-all"
                  >
                    {uploadingPages ? (
                      <>
                        <RefreshCw className="h-4 w-4 animate-spin" /> Uploading Pages...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" /> + Select Multiple Images
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Upload Dropzone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => multiFileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-[#007BB5] bg-sky-50/70 scale-[1.01]"
                    : "border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50"
                }`}
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-[#007BB5] mb-3">
                  <Upload className="h-7 w-7" />
                </div>
                <p className="font-heading text-sm font-bold text-slate-800">
                  Drag &amp; drop multiple flyer pages here, or click to browse
                </p>
                <p className="mt-1 text-xs text-slate-500 max-w-md">
                  Supports JPEG, PNG, WebP. Select all pages at once (e.g. 01.jpg, 02.jpg...) — they will automatically be arranged in order.
                </p>

                {uploadingPages && (
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-sky-100 px-4 py-2 text-xs font-bold text-[#007BB5]">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>{uploadProgress || "Uploading images..."}</span>
                  </div>
                )}
              </div>

              {/* Pages Cards List */}
              {pages.length > 0 && (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500 px-2">
                    <span>Page Order &amp; Preview</span>
                    <span>SEO Alt Text &amp; Controls</span>
                  </div>

                  {pages.map((p, index) => (
                    <div
                      key={index}
                      className="group relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-3.5 transition-all hover:border-[#007BB5]/50 hover:shadow-xs"
                    >
                      {/* Left: Badge, Thumbnail & Image Path */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Order Badge */}
                        <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl bg-slate-900 font-mono text-white shadow-inner">
                          <span className="text-[9px] uppercase tracking-wider text-slate-400">Page</span>
                          <span className="text-base font-black text-amber-400 leading-none">
                            {index + 1}
                          </span>
                        </div>

                        {/* Thumbnail preview with click zoom */}
                        <div
                          onClick={() => setPreviewImage(p.image)}
                          className="group/thumb relative h-16 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-900 cursor-pointer shadow-xs"
                          title="Click to view full preview"
                        >
                          {p.image ? (
                            <>
                              <img
                                src={p.image}
                                alt={p.alt || `Page ${index + 1}`}
                                className="h-full w-full object-contain group-hover/thumb:scale-105 transition-transform"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity">
                                <Eye className="h-4 w-4 text-white" />
                              </div>
                            </>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400">
                              No Pic
                            </div>
                          )}
                        </div>

                        {/* Image path input & replace button */}
                        <div className="flex-1 min-w-0 max-w-xs">
                          <div className="flex items-center justify-between mb-1">
                            <label htmlFor={`flyer-page-image-path-${index}`} className="text-[10px] font-bold uppercase text-slate-500 cursor-pointer">
                              {index === 0 ? "Page 1 (Cover Page)" : `Page ${index + 1}`}
                            </label>
                            <label htmlFor={`flyer-page-replace-${index}`} className="text-[10px] font-bold text-[#007BB5] hover:underline cursor-pointer">
                              Replace Image
                            </label>
                            <input
                              id={`flyer-page-replace-${index}`}
                              name={`flyer_page_replace_${index}`}
                              type="file"
                              accept="image/*"
                              ref={(el) => (singlePageInputRefs.current[index] = el)}
                              onChange={(e) =>
                                handleReplaceSinglePage(index, e.target.files?.[0])
                              }
                              aria-label={`Replace image for page ${index + 1}`}
                              className="hidden"
                            />
                          </div>
                          <input
                            id={`flyer-page-image-path-${index}`}
                            name={`flyer_page_path_${index}`}
                            type="text"
                            value={p.image}
                            onChange={(e) => handleUpdatePage(index, "image", e.target.value)}
                            placeholder="/uploads/flyer-page.jpg"
                            aria-label={`Image path for page ${index + 1}`}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-mono text-slate-700 outline-none focus:border-[#007BB5] focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Middle: Alt Text Input */}
                      <div className="flex-1 min-w-[220px]">
                        <label htmlFor={`flyer-page-alt-text-${index}`} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 mb-1">
                          <FileText className="h-3.5 w-3.5 text-[#007BB5]" />
                          Alt Text (SEO &amp; Accessibility)
                        </label>
                        <input
                          id={`flyer-page-alt-text-${index}`}
                          name={`flyer_page_alt_${index}`}
                          type="text"
                          value={p.alt}
                          onChange={(e) => handleUpdatePage(index, "alt", e.target.value)}
                          placeholder={`e.g. ${title || "Flyer"} Page ${index + 1} - Weekly Offers`}
                          aria-label={`Alt text for page ${index + 1}`}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3.5 py-1.5 text-xs font-medium text-slate-900 outline-none focus:border-[#007BB5] focus:bg-white focus:ring-1 focus:ring-[#007BB5]"
                        />
                      </div>

                      {/* Right: Reorder & Delete */}
                      <div className="flex items-center gap-1.5 shrink-0 self-end md:self-center">
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMovePageUp(index)}
                          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition-colors"
                          title="Move Page Up"
                        >
                          <ArrowUp className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          disabled={index === pages.length - 1}
                          onClick={() => handleMovePageDown(index)}
                          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-30 transition-colors"
                          title="Move Page Down"
                        >
                          <ArrowDown className="h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePage(index)}
                          className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Page"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ========================================================
                SECTION 3: PUBLISH & SAVE ACTIONS
            ======================================================== */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-slate-200">
              <label htmlFor="flyer-is-active" className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800">
                <input
                  id="flyer-is-active"
                  name="isActive"
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded accent-[#007BB5]"
                />
                <span>Campaign is Active &amp; Visible on Public Website</span>
              </label>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={goToList}
                  className="rounded-2xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel &amp; Return
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveCampaign}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#E65100] px-8 py-3 text-xs font-bold text-white shadow-lg shadow-[#E65100]/25 hover:bg-[#d44700] disabled:opacity-50 transition-all"
                >
                  <Save className="h-4 w-4" />
                  {saving
                    ? "Saving Flyer..."
                    : currentDbId
                    ? "Update Flyer Campaign"
                    : "Save & Publish Flyer"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          IMAGE PREVIEW MODAL
      ======================================================== */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-slate-900 p-2 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/90"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewImage}
              alt="Preview"
              className="max-h-[85vh] w-auto rounded-xl object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
