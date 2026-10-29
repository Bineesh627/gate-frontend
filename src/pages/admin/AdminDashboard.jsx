import React, { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import {
  Sliders,
  FileText,
  BookOpen,
  Store,
  Tag,
  Inbox,
  LogOut,
  ExternalLink,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  Upload,
  Search,
  X,
  Layers,
  Sparkles,
  Menu,
  User,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  ImageIcon,
  Check,
  Lock,
  Briefcase,
  ShieldCheck,
  RefreshCw,
  Info,
} from "lucide-react";
import { marketApi } from "@/api/marketApi";
import { useMarket } from "@/context/MarketContext";
import Logo from "@/components/site/Logo";
import VisualRichEditor from "@/components/admin/VisualRichEditor";
import CareersAdminSection from "@/components/admin/CareersAdminSection";
import StoreMapPicker from "@/components/admin/StoreMapPicker";
import HeroBannersAdminSection from "@/components/admin/HeroBannersAdminSection";
import FlyersAdminSection from "@/components/admin/FlyersAdminSection";

// Time dropdown presets
const OPEN_TIME_OPTIONS = [
  { label: "6:00 AM", val: "6:00 AM", hour: 6 },
  { label: "6:30 AM", val: "6:30 AM", hour: 6 },
  { label: "7:00 AM", val: "7:00 AM", hour: 7 },
  { label: "7:30 AM", val: "7:30 AM", hour: 7 },
  { label: "8:00 AM", val: "8:00 AM", hour: 8 },
  { label: "8:30 AM", val: "8:30 AM", hour: 8 },
  { label: "9:00 AM", val: "9:00 AM", hour: 9 },
  { label: "9:30 AM", val: "9:30 AM", hour: 9 },
  { label: "10:00 AM", val: "10:00 AM", hour: 10 },
  { label: "10:30 AM", val: "10:30 AM", hour: 10 },
  { label: "11:00 AM", val: "11:00 AM", hour: 11 },
];

const CLOSE_TIME_OPTIONS = [
  { label: "6:00 PM", val: "6:00 PM", hour: 18 },
  { label: "6:30 PM", val: "6:30 PM", hour: 18 },
  { label: "7:00 PM", val: "7:00 PM", hour: 19 },
  { label: "7:30 PM", val: "7:30 PM", hour: 19 },
  { label: "8:00 PM", val: "8:00 PM", hour: 20 },
  { label: "8:30 PM", val: "8:30 PM", hour: 20 },
  { label: "9:00 PM", val: "9:00 PM", hour: 21 },
  { label: "9:30 PM", val: "9:30 PM", hour: 21 },
  { label: "10:00 PM", val: "10:00 PM", hour: 22 },
  { label: "10:30 PM", val: "10:30 PM", hour: 22 },
  { label: "11:00 PM", val: "11:00 PM", hour: 23 },
  { label: "11:30 PM", val: "11:30 PM", hour: 23 },
  { label: "12:00 AM (Midnight)", val: "12:00 AM", hour: 24 },
  { label: "12:30 AM", val: "12:30 AM", hour: 24 },
  { label: "1:00 AM", val: "1:00 AM", hour: 25 },
  { label: "1:30 AM", val: "1:30 AM", hour: 25 },
  { label: "2:00 AM", val: "2:00 AM", hour: 26 },
];

const DAY_PRESETS = [
  "Daily",
  "Mon – Fri",
  "Mon – Sat",
  "Mon – Sun",
  "Sun – Thu",
  "Weekends (Fri – Sat)",
  "Weekends (Sat – Sun)",
];

const VALID_TABS = [
  "settings",
  "banners",
  "stores",
  "blogs",
  "campaigns",
  "pages",
  "careers",
  "inquiries",
  "profile",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { tab, action, id } = useParams();
  const { refreshSettings, refreshStores, refreshCampaigns } = useMarket();

  // Active tab driven by URL parameter
  const activeTab = tab && VALID_TABS.includes(tab) ? tab : "settings";
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [adminUser, setAdminUser] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  // Redirect /admin or invalid tab to /admin/settings
  useEffect(() => {
    if (!tab || !VALID_TABS.includes(tab)) {
      navigate("/admin/settings", { replace: true });
    }
  }, [tab, navigate]);

  // ==========================================
  // POSTS & ARTICLES STATE
  // ==========================================
  const [blogs, setBlogs] = useState([]);
  const [blogSearch, setBlogSearch] = useState("");
  const [isEditingPost, setIsEditingPost] = useState(false);
  const [currentPostId, setCurrentPostId] = useState(null);
  const [postTitle, setPostTitle] = useState("");
  const [postSlug, setPostSlug] = useState("");
  const [postSlugManual, setPostSlugManual] = useState(false);
  const [postCategory, setPostCategory] = useState("");
  const [postStack, setPostStack] = useState("");
  const [stackInput, setStackInput] = useState("");
  const [postDate, setPostDate] = useState(new Date().toISOString().split("T")[0]);
  const [postReadTime, setPostReadTime] = useState("");
  const [postImage, setPostImage] = useState("");
  const [postImageAlt, setPostImageAlt] = useState("");
  const [postExcerpt, setPostExcerpt] = useState("");
  const [postBodyText, setPostBodyText] = useState("");
  const [postMetaTitle, setPostMetaTitle] = useState("");
  const [postMetaDescription, setPostMetaDescription] = useState("");
  const [postMetaKeywords, setPostMetaKeywords] = useState("");
  const [savingPost, setSavingPost] = useState(false);

  // ==========================================
  // SITE SETTINGS STATE (WITH TIME BUILDER & CLEAN COPYRIGHT)
  // ==========================================
  const [settings, setSettings] = useState({
    social_links: { instagram: "", facebook: "", youtube: "", twitter: "", tiktok: "" },
    copyright_text: "",
    footer_about: "",
    contact_email: "",
    contact_phone: "",
    contact_whatsapp: "",
    seo_global: { meta_title: "", meta_description: "", meta_keywords: "", og_image: "" },
  });
  const [savingSettings, setSavingSettings] = useState(false);

  // ==========================================
  // PAGES CMS & SEO STATE
  // ==========================================
  const [selectedPage, setSelectedPage] = useState("home");
  const [pageCms, setPageCms] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    content: {},
  });
  const [savingPage, setSavingPage] = useState(false);
  const [syncingSeo, setSyncingSeo] = useState(false);

  // ==========================================
  // STORES STATE (WITH SELECTABLE HOURS BUILDER)
  // ==========================================
  const [storesList, setStoresList] = useState([]);
  const [storeViewMode, setStoreViewMode] = useState("list"); // "list" | "form"
  const [storeModalOpen, setStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [storeForm, setStoreForm] = useState({
    name: "",
    slug: "",
    city: "",
    address: "",
    phone: "",
    hours: "",
    open_hour: "",
    close_hour: "",
    highlightsText: "",
    image: "",
    image_alt: "",
    tagline: "",
    lat: "",
    lng: "",
  });

  // Store modal hours selector state
  const [storeHoursDays, setStoreHoursDays] = useState("");
  const [storeHoursOpen, setStoreHoursOpen] = useState("");
  const [storeHoursClose, setStoreHoursClose] = useState("");
  const [manualStoreHours, setManualStoreHours] = useState(false);

  // ==========================================
  // CAMPAIGNS STATE
  // ==========================================
  const [campaignsList, setCampaignsList] = useState([]);
  const [campaignModalOpen, setCampaignModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [campaignForm, setCampaignForm] = useState({
    campaign_id: "",
    title: "",
    season: "",
    blurb: "",
    cover: "",
    cover_alt: "",
    branches: [],
  });

  // ==========================================
  // INQUIRIES & CAREERS STATE
  // ==========================================
  const [inquiries, setInquiries] = useState([]);
  const [pendingCareersCount, setPendingCareersCount] = useState(0);

  // ==========================================
  // ADMIN PROFILE STATE
  // ==========================================
  const [profileForm, setProfileForm] = useState({ username: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Upload helper
  const [uploading, setUploading] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Helper to sanitize copyright text (remove replacement char or mojibake Â©)
  const sanitizeCopyright = (text) => {
    if (!text) return "";
    return text.replace(/Â©/g, "©").replace(/[\uFFFD?]/g, "©").trim();
  };

  // Session expired modal states
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [reauthEmail, setReauthEmail] = useState("");
  const [reauthPassword, setReauthPassword] = useState("");
  const [reauthLoading, setReauthLoading] = useState(false);
  const [reauthError, setReauthError] = useState("");

  const handleReauth = async (e) => {
    e?.preventDefault();
    setReauthLoading(true);
    setReauthError("");
    try {
      const email = (reauthEmail || adminUser?.email || "").trim();
      if (!email) {
        setReauthError("Please enter your admin email.");
        setReauthLoading(false);
        return;
      }
      const res = await marketApi.login(email, reauthPassword);
      if (res?.success) {
        setShowSessionModal(false);
        showToast("Session restored successfully!");
        if (res.admin) {
          setAdminUser(res.admin);
          setReauthEmail(res.admin.email || "");
        }
        await loadAllData();
      } else {
        setReauthError(res?.message || "Invalid credentials");
      }
    } catch (err) {
      setReauthError(err.message || "Failed to re-authenticate");
    } finally {
      setReauthLoading(false);
    }
  };

  // Auth check & load data
  useEffect(() => {
    const initAdminAuth = async () => {
      if (!marketApi.isAdminAuthenticated()) {
        navigate("/admin/login?expired=1");
        return;
      }
      try {
        const meRes = await marketApi.getAdminMe();
        if (meRes?.admin) {
          setAdminUser(meRes.admin);
          setReauthEmail(meRes.admin.email || "");
          setProfileForm({
            username: meRes.admin.username || "",
            email: meRes.admin.email || "",
          });
        }
      } catch (err) {
        marketApi.logout();
        navigate("/admin/login?expired=1");
        return;
      }
      loadAllData();
    };

    initAdminAuth();
  }, [navigate]);

  // Listen for background 401 expiration events
  useEffect(() => {
    const handleAuthExpired = () => {
      setShowSessionModal(true);
    };
    window.addEventListener("market-admin-auth-expired", handleAuthExpired);
    return () => window.removeEventListener("market-admin-auth-expired", handleAuthExpired);
  }, []);

  const loadAllData = async () => {
    try {
      const setRes = await marketApi.getSettings();
      if (setRes?.success && setRes.settings) {
        const cleanCopyright = sanitizeCopyright(setRes.settings.copyright_text);

        setSettings((prev) => ({
          ...prev,
          ...setRes.settings,
          contact_phone: setRes.settings.contact_phone != null ? String(setRes.settings.contact_phone) : "",
          contact_whatsapp: setRes.settings.contact_whatsapp != null ? String(setRes.settings.contact_whatsapp) : "",
          copyright_text: cleanCopyright,
          footer_about: setRes.settings.footer_about != null ? String(setRes.settings.footer_about) : "",
          social_links: { ...prev.social_links, ...(setRes.settings.social_links || {}) },
          seo_global: { ...prev.seo_global, ...(setRes.settings.seo_global || {}) },
        }));
      }

      const storesRes = await marketApi.getStores();
      if (storesRes?.success) setStoresList(storesRes.stores);

      const blogsRes = await marketApi.getBlogs();
      if (blogsRes?.success) setBlogs(blogsRes.blogs);

      const campsRes = await marketApi.getCampaigns();
      if (campsRes?.success) setCampaignsList(campsRes.campaigns);

      const inqRes = await marketApi.getInquiries();
      if (inqRes?.success) setInquiries(inqRes.inquiries);

      try {
        const appsRes = await marketApi.adminGetApplications();
        if (appsRes?.success) {
          const pending = appsRes.applications?.filter((a) => a.status === "pending").length || 0;
          setPendingCareersCount(pending);
        }
      } catch (err) {
        console.warn("Could not load initial applications count:", err);
      }

      loadPageContent(selectedPage);
    } catch (err) {
      console.error("Failed to load admin data:", err);
    }
  };

  const loadPageContent = async (page) => {
    try {
      const res = await marketApi.getPage(page);
      if (res?.success && res.page) {
        setPageCms({
          meta_title: res.page.meta_title || "",
          meta_description: res.page.meta_description || "",
          meta_keywords: res.page.meta_keywords || "",
          content: res.page.content || {},
        });
      } else {
        setPageCms({ meta_title: "", meta_description: "", meta_keywords: "", content: {} });
      }
    } catch {
      setPageCms({ meta_title: "", meta_description: "", meta_keywords: "", content: {} });
    }
  };

  const handlePageChange = (newPage) => {
    setSelectedPage(newPage);
    navigate(`/admin/pages/${newPage}`);
  };

  // Sync selectedPage with URL when activeTab is pages
  useEffect(() => {
    if (activeTab === "pages") {
      const pageToLoad = action || "home";
      setSelectedPage(pageToLoad);
      loadPageContent(pageToLoad);
    }
  }, [activeTab, action]);

  // Synchronize Store Hours builder
  const updateStoreHoursFromBuilder = (days, open, close) => {
    setStoreHoursDays(days);
    setStoreHoursOpen(open);
    setStoreHoursClose(close);
    const combined = open && close ? `${days ? `${days} · ` : ""}${open} – ${close}` : "";
    const openOpt = OPEN_TIME_OPTIONS.find((o) => o.val === open);
    const closeOpt = CLOSE_TIME_OPTIONS.find((c) => c.val === close);

    setStoreForm((prev) => ({
      ...prev,
      hours: combined,
      open_hour: openOpt ? String(openOpt.hour) : "",
      close_hour: closeOpt ? String(closeOpt.hour) : "",
    }));
  };

  // File Upload Helper
  const handleFileUpload = async (e, callback, folder = "") => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await marketApi.uploadFile(file, folder);
      if (res?.success && res.url) {
        callback(res.url);
        showToast("Image uploaded successfully!");
      }
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
      try {
        if (e?.target) e.target.value = "";
      } catch {
        // Ignore input reset error
      }
    }
  };

  // ==========================================
  // POST & ARTICLE EDITOR ACTIONS
  // ==========================================
  const resetPostForm = () => {
    setCurrentPostId(null);
    setPostTitle("");
    setPostSlug("");
    setPostSlugManual(false);
    setPostCategory("");
    setPostStack("");
    setStackInput("");
    setPostDate(new Date().toISOString().split("T")[0]);
    setPostReadTime("");
    setPostImage("");
    setPostImageAlt("");
    setPostExcerpt("");
    setPostBodyText("");
    setPostMetaTitle("");
    setPostMetaDescription("");
    setPostMetaKeywords("");
  };

  const normalizeBodyToHtml = (body) => {
    if (!body) return "";
    let parsed = body;
    if (typeof body === "string") {
      try {
        const json = JSON.parse(body);
        if (Array.isArray(json) || typeof json === "string") {
          parsed = json;
        }
      } catch {
        parsed = body;
      }
    }
    if (Array.isArray(parsed)) {
      return parsed
        .map((p) => {
          if (!p) return "";
          const str = String(p).trim();
          if (
            str.startsWith("<p") ||
            str.startsWith("<h") ||
            str.startsWith("<div") ||
            str.startsWith("<ul") ||
            str.startsWith("<ol") ||
            str.startsWith("<blockquote")
          ) {
            return str;
          }
          return `<p>${str}</p>`;
        })
        .join("");
    }
    const str = String(parsed);
    if (
      str.includes("<p>") ||
      str.includes("<p ") ||
      str.includes("<h2>") ||
      str.includes("<h3>") ||
      str.includes("<h1>") ||
      str.includes("<div>")
    ) {
      return str;
    }
    return str
      .split(/\n\s*\n/)
      .map((p) => `<p>${p.trim()}</p>`)
      .join("");
  };

  const populatePostForm = (blog) => {
    setCurrentPostId(blog.id);
    setPostTitle(blog.title || "");
    setPostSlug(blog.slug || "");
    setPostSlugManual(true);
    setPostCategory(blog.category || "");
    setPostStack(blog.stack || "");
    setStackInput("");
    setPostDate(blog.date || new Date().toISOString().split("T")[0]);
    setPostReadTime(blog.read || blog.read_time || "");
    setPostImage(blog.image || "");
    setPostImageAlt(blog.image_alt || "");
    setPostExcerpt(blog.excerpt || "");
    setPostBodyText(normalizeBodyToHtml(blog.body));
    setPostMetaTitle(blog.meta_title || "");
    setPostMetaDescription(blog.meta_description || "");
    setPostMetaKeywords(blog.meta_keywords || "");
  };

  // Sync blog editor state with URL params
  useEffect(() => {
    if (activeTab === "blogs") {
      if (action === "new") {
        setIsEditingPost(true);
        if (currentPostId !== null) {
          resetPostForm();
        }
      } else if (action === "edit" && id) {
        setIsEditingPost(true);
        const found = blogs.find((b) => String(b.id) === String(id) || b.slug === id);
        if (found && currentPostId !== found.id) {
          populatePostForm(found);
        }
      } else {
        setIsEditingPost(false);
      }
    }
  }, [activeTab, action, id, blogs]);

  const handleOpenNewPost = () => {
    resetPostForm();
    navigate("/admin/blogs/new");
  };

  const handleOpenEditPost = (blog) => {
    populatePostForm(blog);
    navigate(`/admin/blogs/edit/${blog.id || blog.slug}`);
  };

  const handleTitleChange = (val) => {
    setPostTitle(val);
    if (!postSlugManual) {
      const generated = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setPostSlug(generated);
    }
    const words = (val + " " + postBodyText).trim().split(/\s+/).length;
    const minutes = Math.max(1, Math.round(words / 180));
    setPostReadTime(`${minutes} min read`);
  };

  const handleAddStackTag = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const val = stackInput.trim().replace(/^,+|,+$/g, "");
      if (val) {
        const existing = postStack ? postStack.split(",").map((s) => s.trim()).filter(Boolean) : [];
        if (!existing.includes(val)) {
          setPostStack([...existing, val].join(", "));
        }
        setStackInput("");
      }
    }
  };

  const handleRemoveStackTag = (tagToRemove) => {
    const existing = postStack.split(",").map((s) => s.trim()).filter(Boolean);
    const updated = existing.filter((s) => s !== tagToRemove).join(", ");
    setPostStack(updated);
  };

  const handleSavePost = async () => {
    if (!postTitle.trim()) {
      alert("Please enter an article title.");
      return;
    }
    const slug = postSlug.trim() || postTitle.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    setSavingPost(true);
    const payload = {
      title: postTitle,
      slug,
      category: postCategory,
      stack: postStack,
      date: postDate,
      read_time: postReadTime,
      image: postImage,
      image_alt: postImageAlt || postTitle,
      excerpt: postExcerpt,
      body: postBodyText ? [postBodyText] : [],
      meta_title: postMetaTitle || postTitle,
      meta_description: postMetaDescription || postExcerpt,
      meta_keywords: postMetaKeywords || postStack,
    };

    try {
      if (currentPostId) {
        await marketApi.updateBlog(currentPostId, payload);
        showToast("Article updated successfully!");
      } else {
        await marketApi.createBlog(payload);
        showToast("Article published successfully!");
      }
      navigate("/admin/blogs");
      const res = await marketApi.getBlogs();
      if (res?.success) setBlogs(res.blogs);
    } catch (err) {
      alert("Failed to save article: " + err.message);
    } finally {
      setSavingPost(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    try {
      await marketApi.deleteBlog(id);
      showToast("Article deleted.");
      const res = await marketApi.getBlogs();
      if (res?.success) setBlogs(res.blogs);
    } catch (err) {
      alert(err.message);
    }
  };

  // ==========================================
  // PROFILE & PASSWORD ACTIONS
  // ==========================================
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await marketApi.updateAdminProfile(profileForm);
      if (res?.success) {
        setAdminUser(res.admin);
        showToast("Admin profile details updated successfully!");
      }
    } catch (err) {
      alert("Failed to update profile: " + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New password and confirmation do not match!");
      return;
    }
    setSavingPassword(true);
    try {
      await marketApi.changeAdminPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      showToast("Password updated successfully!");
    } catch (err) {
      alert("Failed to update password: " + err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  // ==========================================
  // SETTINGS & PAGE CMS ACTIONS
  // ==========================================
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await marketApi.updateSettings(settings);
      await refreshSettings();
      showToast("Site settings & Footer updated successfully!");
    } catch (err) {
      alert("Failed to save settings: " + err.message);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    setSavingPage(true);
    try {
      await marketApi.updatePage(selectedPage, {
        content: pageCms.content,
        meta_title: pageCms.meta_title,
        meta_description: pageCms.meta_description,
        meta_keywords: pageCms.meta_keywords,
      });
      showToast(`Page '${selectedPage}' content & SEO updated!`);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingPage(false);
    }
  };

  const handleRegenerateSeo = async () => {
    setSyncingSeo(true);
    try {
      const res = await marketApi.regenerateSeoFiles();
      showToast(res?.message || "SEO, AEO, and GEO files synchronized successfully!");
    } catch (err) {
      alert(err.message || "Failed to regenerate SEO files");
    } finally {
      setSyncingSeo(false);
    }
  };

  // ==========================================
  // STORES ACTIONS & URL SYNC
  // ==========================================
  const resetStoreForm = () => {
    setEditingStore(null);
    setStoreForm({
      name: "",
      slug: "",
      city: "",
      address: "",
      phone: "",
      hours: "",
      open_hour: "",
      close_hour: "",
      highlightsText: "",
      image: "",
      image_alt: "",
      tagline: "",
      lat: "",
      lng: "",
    });
    setStoreHoursDays("");
    setStoreHoursOpen("");
    setStoreHoursClose("");
    setManualStoreHours(false);
  };

  const populateStoreForm = (st) => {
    setEditingStore(st);
    const hl = Array.isArray(st.highlights) ? st.highlights.join("\n") : (st.highlights || "");
    const coords = Array.isArray(st.coords) ? st.coords : [];
    const cleanHours = (st.hours || "").replace(/[\uFFFD]/g, "·");

    setStoreForm({
      name: st.name || "",
      slug: st.slug || "",
      city: st.city || "",
      address: st.address || "",
      phone: st.phone || "",
      hours: cleanHours,
      open_hour: st.open_hour ?? st.open ?? "",
      close_hour: st.close_hour ?? st.close ?? "",
      highlightsText: hl,
      image: st.image || "",
      image_alt: st.image_alt || "",
      tagline: st.tagline || "",
      lat: coords[0] !== undefined ? coords[0] : "",
      lng: coords[1] !== undefined ? coords[1] : "",
    });

    const parts = cleanHours.split(/\s*·\s*|\s*-\s*|\s*–\s*/);
    if (parts.length >= 3) {
      setStoreHoursDays(parts[0].trim() || "");
      setStoreHoursOpen(parts[1].trim() || "");
      setStoreHoursClose(parts[2].trim() || "");
    } else {
      setStoreHoursDays("");
      setStoreHoursOpen("");
      setStoreHoursClose("");
    }
    setManualStoreHours(false);
  };

  // Sync store editor state with URL params
  useEffect(() => {
    if (activeTab === "stores") {
      if (action === "new") {
        setStoreViewMode("form");
        if (editingStore !== null) {
          resetStoreForm();
        }
      } else if (action === "edit" && id) {
        setStoreViewMode("form");
        const found = storesList.find((s) => String(s.id) === String(id) || s.slug === id);
        if (found && editingStore?.id !== found.id) {
          populateStoreForm(found);
        }
      } else {
        setStoreViewMode("list");
      }
    }
  }, [activeTab, action, id, storesList]);

  const openNewStoreModal = () => {
    resetStoreForm();
    navigate("/admin/stores/new");
  };

  const openEditStoreModal = (st) => {
    populateStoreForm(st);
    navigate(`/admin/stores/edit/${st.id || st.slug}`);
  };

  const handleSaveStore = async (e) => {
    e.preventDefault();
    const highlights = storeForm.highlightsText.split("\n").map((h) => h.trim()).filter(Boolean);
    const coords = [parseFloat(storeForm.lat) || 25.1121, parseFloat(storeForm.lng) || 55.1965];
    const payload = {
      name: storeForm.name,
      slug: storeForm.slug,
      city: storeForm.city,
      address: storeForm.address,
      phone: storeForm.phone,
      hours: storeForm.hours,
      open_hour: parseInt(storeForm.open_hour, 10),
      close_hour: parseInt(storeForm.close_hour, 10),
      highlights,
      coords,
      image: storeForm.image,
      image_alt: storeForm.image_alt || storeForm.name,
      tagline: storeForm.tagline,
    };
    try {
      if (editingStore) {
        await marketApi.updateStore(editingStore.id, payload);
        showToast("Store updated successfully!");
      } else {
        await marketApi.createStore(payload);
        showToast("Store created successfully!");
      }
      navigate("/admin/stores");
      await refreshStores();
      const res = await marketApi.getStores();
      if (res?.success) setStoresList(res.stores);
    } catch (err) {
      if (
        err.message?.includes("Invalid or expired token") ||
        err.message?.includes("token") ||
        err.message?.includes("Access denied") ||
        err.message?.includes("401")
      ) {
        setShowSessionModal(true);
        return;
      }
      alert("Failed to save store: " + err.message);
    }
  };

  const handleDeleteStore = async (id) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;
    try {
      await marketApi.deleteStore(id);
      showToast("Store deleted!");
      await refreshStores();
      const res = await marketApi.getStores();
      if (res?.success) setStoresList(res.stores);
    } catch (err) {
      if (
        err.message?.includes("Invalid or expired token") ||
        err.message?.includes("token") ||
        err.message?.includes("Access denied") ||
        err.message?.includes("401")
      ) {
        setShowSessionModal(true);
        return;
      }
      alert("Failed to delete store: " + err.message);
    }
  };

  // ==========================================
  // CAMPAIGNS ACTIONS (MODAL)
  // ==========================================
  const openNewCampaignModal = () => {
    setEditingCampaign(null);
    setCampaignForm({
      campaign_id: "",
      title: "",
      season: "",
      blurb: "",
      cover: "",
      cover_alt: "",
      branches: [],
    });
    setCampaignModalOpen(true);
  };

  const openEditCampaignModal = (camp) => {
    setEditingCampaign(camp);
    setCampaignForm({
      campaign_id: camp.id || camp.campaign_id,
      title: camp.title || "",
      season: camp.season || "",
      blurb: camp.blurb || "",
      cover: camp.cover || "",
      cover_alt: camp.cover_alt || "",
      branches: Array.isArray(camp.branches) ? camp.branches : [],
    });
    setCampaignModalOpen(true);
  };

  const handleSaveCampaign = async (e) => {
    e.preventDefault();
    try {
      if (editingCampaign) {
        await marketApi.updateCampaign(editingCampaign.db_id || editingCampaign.id, campaignForm);
        showToast("Campaign updated!");
      } else {
        await marketApi.createCampaign(campaignForm);
        showToast("Campaign created!");
      }
      setCampaignModalOpen(false);
      await refreshCampaigns();
      const res = await marketApi.getCampaigns();
      if (res?.success) setCampaignsList(res.campaigns);
    } catch (err) {
      alert("Failed to save campaign: " + err.message);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Delete this campaign?")) return;
    try {
      await marketApi.deleteCampaign(id);
      showToast("Campaign deleted!");
      await refreshCampaigns();
      const res = await marketApi.getCampaigns();
      if (res?.success) setCampaignsList(res.campaigns);
    } catch (err) {
      alert("Failed to delete campaign: " + err.message);
    }
  };

  // Inquiries
  const handleMarkInquiryRead = async (id) => {
    try {
      await marketApi.updateInquiryStatus(id, "read");
      const res = await marketApi.getInquiries();
      if (res?.success) setInquiries(res.inquiries);
      showToast("Status marked as read");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteInquiry = async (id) => {
    if (!window.confirm("Delete this inquiry?")) return;
    try {
      await marketApi.deleteInquiry(id);
      const res = await marketApi.getInquiries();
      if (res?.success) setInquiries(res.inquiries);
      showToast("Inquiry deleted");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogout = () => {
    marketApi.logout();
    navigate("/admin/login");
  };

  const filteredBlogs = blogs.filter(
    (b) =>
      b.title?.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.stack?.toLowerCase().includes(blogSearch.toLowerCase()) ||
      b.category?.toLowerCase().includes(blogSearch.toLowerCase())
  );

  const unreadInquiriesCount = inquiries.filter((i) => i.status === "unread").length;
  const currentYear = new Date().getFullYear();
  const copyrightPreview = (settings.copyright_text || "© {year} Gate Hypermarket. All rights reserved.")
    .replace(/Â©/g, "©")
    .replace("{year}", String(currentYear));

  return (
    <div className="min-h-screen bg-[#F1F5F9] flex text-[#0F172A] font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-[#007BB5] px-5 py-3.5 text-sm font-semibold text-white shadow-2xl animate-bounce">
          <CheckCircle2 className="h-5 w-5" />
          {toastMessage}
        </div>
      )}

      {/* MOBILE BACKDROP */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* ========================================================
          SIDEBAR NAVIGATION (DESKTOP & MOBILE RESPONSIVE)
      ======================================================== */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#07131B] text-white flex flex-col transition-all duration-300 ease-in-out border-r border-white/5 shadow-2xl lg:shadow-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center justify-between border-b border-white/10">
          <Logo light />
          <button
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition-colors"
            title="Close Sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5">
          {[
            { id: "settings", label: "Site & Footer Settings", icon: Sliders },
            { id: "banners", label: "Hero Banners", icon: ImageIcon },
            { id: "stores", label: "Stores & Hours", icon: Store },
            { id: "blogs", label: "Posts & Articles", icon: BookOpen },
            { id: "campaigns", label: "Flyers & Campaigns", icon: Tag },
            { id: "pages", label: "Pages CMS & SEO", icon: FileText },
            { id: "careers", label: "Careers & Jobs", icon: Briefcase, badge: pendingCareersCount, badgeColor: "bg-amber-500" },
            { id: "inquiries", label: "Inquiries", icon: Inbox, badge: unreadInquiriesCount, badgeColor: "bg-red-500" },
            { id: "profile", label: "Admin Profile", icon: User },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  navigate(`/admin/${item.id}`);
                  if (typeof window !== "undefined" && window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${active
                    ? "bg-[#007BB5] text-white shadow-md shadow-[#007BB5]/30 font-bold"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`h-4.5 w-4.5 ${active ? "text-white" : "text-white/60"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${item.badgeColor ? `${item.badgeColor} text-white` : "bg-white/15 text-white"
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Logout at Bottom */}
        <div className="p-4 border-t border-white/10 bg-[#040C12]">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-full bg-[#E65100] flex items-center justify-center font-bold text-white text-sm shadow-md">
              {(adminUser?.username || "A").substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="block font-semibold text-xs text-white truncate">
                {adminUser?.username || "Admin"}
              </span>
              <span className="block text-[11px] text-white/50 truncate">
                {adminUser?.email || ""}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              target="_blank"
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-white/10 py-2 text-xs font-semibold text-white/80 hover:bg-white/20 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> View Site
            </Link>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20 transition-colors"
              title="Log Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ========================================================
          MAIN CONTENT VIEWPORT
      ======================================================== */}
      <main
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${sidebarOpen ? "lg:pl-64" : "pl-0"
          }`}
      >
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/80 transition-all"
              title={sidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span>Gate Hypermarket</span>
              <span>/</span>
              <span className="text-[#007BB5] capitalize font-bold">
                {activeTab === "blogs" && isEditingPost
                  ? currentPostId
                    ? "Edit Article"
                    : "Add New Article"
                  : activeTab === "banners"
                    ? "Home Hero Banners"
                    : activeTab === "careers"
                      ? "Careers & Recruitment"
                      : activeTab === "stores" && storeViewMode === "form"
                        ? editingStore
                          ? "Edit Store Branch"
                          : "Add New Store"
                        : activeTab === "campaigns"
                          ? action === "new" || action === "add"
                            ? "Add New Flyer"
                            : action === "edit"
                              ? "Edit Flyer"
                              : "Flyers & Campaigns"
                          : activeTab}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === "campaigns" && (!action || action === "list") && (
              <button
                onClick={() => navigate("/admin/campaigns/new")}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E65100] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#E65100]/25 hover:bg-[#d44700]"
              >
                <Plus className="h-4 w-4" /> Add Flyer
              </button>
            )}
            {activeTab === "campaigns" && (action === "new" || action === "add" || action === "edit") && (
              <button
                onClick={() => navigate("/admin/campaigns")}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                ← Back to Flyers List
              </button>
            )}
            {activeTab === "blogs" && !isEditingPost && (
              <button
                onClick={handleOpenNewPost}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E65100] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#E65100]/25 hover:bg-[#d44700]"
              >
                <Plus className="h-4 w-4" /> Add New Post
              </button>
            )}
            {activeTab === "stores" && storeViewMode === "list" && (
              <button
                onClick={openNewStoreModal}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#E65100] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#E65100]/25 hover:bg-[#d44700]"
              >
                <Plus className="h-4 w-4" /> Add Store
              </button>
            )}
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" /> Visit Site
            </Link>
          </div>
        </header>

        {/* Viewport Content */}
        <div className="p-6 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {/* ========================================================
              TAB 1: SITE & FOOTER SETTINGS (WITH HOURS BUILDER & CLEAN COPYRIGHT)
          ======================================================== */}
          {activeTab === "settings" && (
            <div className="space-y-8">
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <div className="border-b border-slate-100 pb-5 mb-8">
                  <h2 className="font-heading text-2xl font-black text-slate-900">
                    Site &amp; Footer Settings
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage footer social links, copyright, and global contact information.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-8">
                  {/* FOOTER ABOUT / BRAND BIO */}
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#007BB5] mb-4 flex items-center gap-2">
                      <Info className="h-4 w-4" /> Footer About Text
                    </h3>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4 max-w-2xl">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label htmlFor="settings-footer-about" className="text-xs font-bold uppercase text-slate-700">
                            About / Bio Description (Footer)
                          </label>
                          <span className="text-[11px] text-slate-400 font-medium">
                            {(settings.footer_about || "").length} characters
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mb-3">
                          A brief introduction displayed directly underneath the Gate Hypermarket logo in the website footer.
                        </p>
                        <textarea
                          id="settings-footer-about"
                          name="footer_about"
                          rows={3}
                          value={settings.footer_about || ""}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              footer_about: e.target.value,
                            })
                          }
                          className="w-full bg-white rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#007BB5] focus:ring-3 focus:ring-[#007BB5]/10 outline-none transition-all resize-y"
                          placeholder="e.g. A growing hypermarket chain serving Dubai and Ajman with fresh halls, seasonal campaigns and neighbourhood value."
                        />
                      </div>

                      {/* Live Footer Preview */}
                      <div className="bg-[#0B1A22] p-4 rounded-xl border border-slate-800 space-y-2">
                        <span className="text-white/40 font-semibold block text-[11px] uppercase tracking-wider">
                          Live Footer Preview
                        </span>
                        <div className="max-w-xs pt-1">
                          <Logo light />
                          {settings.footer_about ? (
                            <p className="mt-4 text-xs text-white/60 leading-relaxed break-words">
                              {settings.footer_about}
                            </p>
                          ) : (
                            <p className="mt-4 text-xs text-white/30 italic">
                              No about description set (only logo will be shown in footer).
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="font-heading text-base font-bold text-[#007BB5] mb-4 flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Social Media Links (Footer)
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      <div>
                        <label htmlFor="settings-instagram" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          Instagram URL
                        </label>
                        <input
                          id="settings-instagram"
                          name="instagram"
                          type="url"
                          value={settings.social_links?.instagram || ""}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              social_links: { ...settings.social_links, instagram: e.target.value },
                            })
                          }
                          className="w-full rounded-xl bg-slate-50/50 border border-slate-200 px-4 py-2.5 text-sm focus:bg-white focus:border-[#007BB5] focus:ring-3 focus:ring-[#007BB5]/10 outline-none transition-all"
                          placeholder="https://instagram.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-facebook" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          Facebook URL
                        </label>
                        <input
                          id="settings-facebook"
                          name="facebook"
                          type="url"
                          value={settings.social_links?.facebook || ""}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              social_links: { ...settings.social_links, facebook: e.target.value },
                            })
                          }
                          className="w-full rounded-xl bg-slate-50/50 border border-slate-200 px-4 py-2.5 text-sm focus:bg-white focus:border-[#007BB5] focus:ring-3 focus:ring-[#007BB5]/10 outline-none transition-all"
                          placeholder="https://facebook.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-tiktok" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          TikTok URL
                        </label>
                        <input
                          id="settings-tiktok"
                          name="tiktok"
                          type="url"
                          value={settings.social_links?.tiktok || ""}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              social_links: { ...settings.social_links, tiktok: e.target.value },
                            })
                          }
                          className="w-full rounded-xl bg-slate-50/50 border border-slate-200 px-4 py-2.5 text-sm focus:bg-white focus:border-[#007BB5] focus:ring-3 focus:ring-[#007BB5]/10 outline-none transition-all"
                          placeholder="https://tiktok.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-youtube" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          YouTube URL
                        </label>
                        <input
                          id="settings-youtube"
                          name="youtube"
                          type="url"
                          value={settings.social_links?.youtube || ""}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              social_links: { ...settings.social_links, youtube: e.target.value },
                            })
                          }
                          className="w-full rounded-xl bg-slate-50/50 border border-slate-200 px-4 py-2.5 text-sm focus:bg-white focus:border-[#007BB5] focus:ring-3 focus:ring-[#007BB5]/10 outline-none transition-all"
                          placeholder="https://youtube.com"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-twitter" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          Twitter / X URL
                        </label>
                        <input
                          id="settings-twitter"
                          name="twitter"
                          type="url"
                          value={settings.social_links?.twitter || ""}
                          onChange={(e) =>
                            setSettings({
                              ...settings,
                              social_links: { ...settings.social_links, twitter: e.target.value },
                            })
                          }
                          className="w-full rounded-xl bg-slate-50/50 border border-slate-200 px-4 py-2.5 text-sm focus:bg-white focus:border-[#007BB5] focus:ring-3 focus:ring-[#007BB5]/10 outline-none transition-all"
                          placeholder="https://twitter.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* COPYRIGHT NOTICE */}
                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="font-heading text-base font-bold text-[#007BB5] mb-4 flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" /> Copyright Notice
                    </h3>

                    {/* COPYRIGHT TEXT WITH LIVE PREVIEW & SANITIZER */}
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4 max-w-2xl">
                      <div className="flex items-center justify-between">
                        <label htmlFor="settings-copyright-text" className="text-xs font-bold uppercase text-slate-700">
                          Copyright Notice (Footer)
                        </label>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              const current = (settings.copyright_text || "").replace(/Â©/g, "©");
                              if (!current.includes("©")) {
                                setSettings({ ...settings, copyright_text: `© ${current}`.trim() });
                              }
                            }}
                            className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded font-bold hover:bg-slate-100 text-slate-700 shadow-xs transition-colors"
                            title="Insert copyright symbol"
                          >
                            + ©
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const current = (settings.copyright_text || "").replace(/Â©/g, "©");
                              if (!current.includes("{year}")) {
                                setSettings({ ...settings, copyright_text: `${current} {year}`.trim() });
                              }
                            }}
                            className="text-[11px] bg-white border border-slate-200 px-2.5 py-1 rounded font-bold text-[#007BB5] hover:bg-slate-100 shadow-xs transition-colors"
                            title="Insert dynamic year tag"
                          >
                            + {"{year}"}
                          </button>
                        </div>
                      </div>

                      <input
                        id="settings-copyright-text"
                        name="copyright_text"
                        type="text"
                        value={settings.copyright_text}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            copyright_text: sanitizeCopyright(e.target.value),
                          })
                        }
                        className="w-full bg-white rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#007BB5] outline-none"
                        placeholder="© {year} Gate Hypermarket. All rights reserved."
                      />

                      {/* Live Preview Box */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-xs">
                        <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider">
                          Live Frontend Preview:
                        </span>
                        <span className="font-semibold text-slate-800 block text-xs">
                          {copyrightPreview}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="font-heading text-base font-bold text-[#007BB5] mb-4">
                      Customer Contact Details
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label htmlFor="settings-contact-email" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          Email Address
                        </label>
                        <input
                          id="settings-contact-email"
                          name="contact_email"
                          type="email"
                          value={settings.contact_email || ""}
                          onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                          className="w-full rounded-xl bg-slate-50/50 border border-slate-200 px-4 py-2.5 text-sm focus:bg-white focus:border-[#007BB5] outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-contact-phone" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          Phone Number
                        </label>
                        <input
                          id="settings-contact-phone"
                          name="contact_phone"
                          type="text"
                          value={settings.contact_phone || ""}
                          onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                          className="w-full rounded-xl bg-slate-50/50 border border-slate-200 px-4 py-2.5 text-sm focus:bg-white focus:border-[#007BB5] outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="settings-contact-whatsapp" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                          WhatsApp Number
                        </label>
                        <input
                          id="settings-contact-whatsapp"
                          name="contact_whatsapp"
                          type="text"
                          value={settings.contact_whatsapp || ""}
                          onChange={(e) => setSettings({ ...settings, contact_whatsapp: e.target.value })}
                          className="w-full rounded-xl bg-slate-50/50 border border-slate-200 px-4 py-2.5 text-sm focus:bg-white focus:border-[#007BB5] outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100">
                    <button
                      type="submit"
                      disabled={savingSettings}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#E65100] px-8 py-3.5 font-heading font-bold text-white shadow-lg shadow-[#E65100]/25 hover:bg-[#d44700] transition-transform hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      <Save className="h-5 w-5" />
                      {savingSettings ? "Saving Settings..." : "Save Settings"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB: HERO BANNERS (STORE-MAPPED DESKTOP & MOBILE)
          ======================================================== */}
          {activeTab === "banners" && (
            <HeroBannersAdminSection onNotify={showToast} />
          )}

          {/* ========================================================
              TAB 2: EXECUTIVE ADMIN PROFILE & SECURITY
          ======================================================== */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              {/* Executive Hero Banner Card */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#07131B] via-[#0B1A22] to-[#007BB5] p-8 text-white shadow-md">
                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 rounded-2xl bg-[#E65100] flex items-center justify-center font-heading text-3xl font-black text-white shadow-xl ring-4 ring-white/20">
                      {(adminUser?.username || "A").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2.5">
                        <h2 className="font-heading text-2xl font-black tracking-tight">
                          {adminUser?.username || "Administrator"}
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-0.5 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                          <Check className="h-3 w-3" /> Active
                        </span>
                      </div>
                      <p className="text-white/70 text-sm mt-0.5">{adminUser?.email || ""}</p>
                      <p className="text-white/50 text-xs mt-2">Gate Hypermarket Administration &amp; Staff Account</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2-Column Profile & Security Forms */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Profile Information — View Only */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-[#007BB5]/10 text-[#007BB5] flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-lg text-slate-900">
                          Profile Information
                        </h3>
                        <p className="text-xs text-slate-500">Your administrator account details.</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                          Username
                        </label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <div className="w-full rounded-xl bg-slate-100 border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 cursor-default select-all">
                            {profileForm.username || adminUser?.username || "—"}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                          Email Address (Login)
                        </label>
                        <div className="relative">
                          <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <div className="w-full rounded-xl bg-slate-100 border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-slate-700 cursor-default select-all">
                            {profileForm.email || adminUser?.email || "—"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6">
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Lock className="h-3.5 w-3.5" />
                      Profile details are managed by the system administrator.
                    </p>
                  </div>
                </div>

                {/* Password & Security Form */}
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                        <KeyRound className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-heading font-black text-lg text-slate-900">
                          Change Password
                        </h3>
                        <p className="text-xs text-slate-500">Keep your administrator account secure.</p>
                      </div>
                    </div>

                    <form id="password-form" onSubmit={handleChangePassword} className="space-y-4">
                      <div>
                        <label htmlFor="admin-current-password" className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                          Current Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            id="admin-current-password"
                            name="currentPassword"
                            type={showCurrentPass ? "text" : "password"}
                            autoComplete="current-password"
                            required
                            value={passwordForm.currentPassword}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                            }
                            className="w-full rounded-xl bg-slate-50/50 border border-slate-200 pl-10 pr-10 py-2.5 text-sm font-medium focus:bg-white focus:border-[#007BB5] outline-none transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showCurrentPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="admin-new-password" className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                          New Password
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            id="admin-new-password"
                            name="newPassword"
                            type={showNewPass ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={passwordForm.newPassword}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                            }
                            className="w-full rounded-xl bg-slate-50/50 border border-slate-200 pl-10 pr-10 py-2.5 text-sm font-medium focus:bg-white focus:border-[#007BB5] outline-none transition-all"
                            placeholder="••••••••"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPass(!showNewPass)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showNewPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="admin-confirm-password" className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <input
                            id="admin-confirm-password"
                            name="confirmPassword"
                            type={showNewPass ? "text" : "password"}
                            autoComplete="new-password"
                            required
                            value={passwordForm.confirmPassword}
                            onChange={(e) =>
                              setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                            }
                            className="w-full rounded-xl bg-slate-50/50 border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium focus:bg-white focus:border-[#007BB5] outline-none transition-all"
                            placeholder="••••••••"
                          />
                        </div>
                      </div>
                    </form>
                  </div>

                  <div className="pt-6 border-t border-slate-100 mt-6">
                    <button
                      type="submit"
                      form="password-form"
                      disabled={savingPassword}
                      className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50"
                    >
                      <Lock className="h-4 w-4" />
                      {savingPassword ? "Updating..." : "Change Password"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3: STORES & HOURS — LIST VIEW
          ======================================================== */}
          {activeTab === "stores" && storeViewMode === "list" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-8">
                <div>
                  <h2 className="font-heading text-2xl font-black text-slate-900">
                    Stores &amp; Branch Locations
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Manage store names, operating hours, direct lines, and highlights.
                  </p>
                </div>
                <button
                  onClick={openNewStoreModal}
                  className="inline-flex items-center gap-2 rounded-2xl bg-[#E65100] px-6 py-3 font-heading font-bold text-white shadow-lg shadow-[#E65100]/25 hover:bg-[#d44700]"
                >
                  <Plus className="h-5 w-5" /> Add New Store
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
                      <th className="pb-3">Store Name</th>
                      <th className="pb-3">City</th>
                      <th className="pb-3">Direct Phone</th>
                      <th className="pb-3">Operating Hours</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {storesList.map((s) => (
                      <tr key={s.id || s.slug} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 pr-4">
                          <div className="flex items-center gap-3">
                            {s.image ? (
                              <img
                                src={marketApi.resolveAssetUrl(s.image)}
                                alt={s.image_alt || s.name}
                                className="h-12 w-16 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const placeholder = e.currentTarget.nextElementSibling;
                                  if (placeholder instanceof HTMLElement) placeholder.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="h-12 w-16 rounded-xl bg-slate-100 border border-slate-200 items-center justify-center text-slate-400 shrink-0"
                              style={{ display: s.image ? "none" : "flex" }}
                            >
                              <Store className="h-5 w-5" />
                            </div>
                            <div>
                              <span className="font-heading font-bold text-base block text-slate-900">
                                {s.name}
                              </span>
                              <span className="text-xs text-slate-500 truncate max-w-xs block">
                                {s.address}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 pr-4 font-semibold text-[#007BB5]">{s.city}</td>
                        <td className="py-4 pr-4 text-slate-600 font-mono text-xs">{s.phone}</td>
                        <td className="py-4 pr-4">
                          <span className="inline-flex items-center gap-1.5 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                            <Clock className="h-3 w-3 text-[#007BB5]" /> {s.hours}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openEditStoreModal(s)}
                            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:text-[#007BB5] hover:border-[#007BB5] hover:bg-[#007BB5]/5"
                            title="Edit"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteStore(s.id)}
                            className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================
              TAB 3b: STORES — ADD / EDIT FORM PAGE (replaces modal)
          ======================================================== */}
          {activeTab === "stores" && storeViewMode === "form" && (
            <div className="space-y-6">
              {/* Back navigation bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                <button
                  onClick={() => navigate("/admin/stores")}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#007BB5]"
                >
                  <ArrowLeft className="h-4 w-4" /> Back to All Stores
                </button>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#007BB5]/10 px-3 py-1 text-xs font-semibold text-[#007BB5] border border-[#007BB5]/20">
                  <Store className="h-3.5 w-3.5" />
                  {editingStore ? `Editing: ${editingStore.name}` : "New Store Branch"}
                </span>
              </div>

              {/* Form page */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                <div className="border-b border-slate-100 pb-5 mb-8">
                  <h2 className="font-heading text-2xl font-black text-slate-900">
                    {editingStore ? "Edit Store Branch" : "Add New Store Branch"}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Configure branch name, address, phone line, operating hours, and map location.
                  </p>
                </div>

                <form onSubmit={handleSaveStore} className="space-y-6">
                  {/* Name & Slug */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="store-name" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Store Name *
                      </label>
                      <input
                        id="store-name"
                        name="name"
                        type="text"
                        required
                        value={storeForm.name}
                        onChange={(e) => {
                          const name = e.target.value;
                          const slug = name
                            .toLowerCase()
                            .replace(/gate\s*—\s*/g, "")
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/(^-|-$)/g, "");
                          setStoreForm({
                            ...storeForm,
                            name,
                            slug: editingStore ? storeForm.slug : slug,
                          });
                        }}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#007BB5] outline-none"
                        placeholder="Gate — Al Barsha"
                      />
                    </div>
                    <div>
                      <label htmlFor="store-slug" className="block text-xs font-bold uppercase text-slate-600 mb-1">Slug *</label>
                      <input
                        id="store-slug"
                        name="slug"
                        type="text"
                        required
                        value={storeForm.slug}
                        onChange={(e) => setStoreForm({ ...storeForm, slug: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#007BB5] outline-none"
                        placeholder="al-barsha"
                      />
                    </div>
                  </div>

                  {/* City & Phone */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="store-city" className="block text-xs font-bold uppercase text-slate-600 mb-1">City</label>
                      <input
                        id="store-city"
                        name="city"
                        type="text"
                        value={storeForm.city}
                        onChange={(e) => setStoreForm({ ...storeForm, city: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                        placeholder="Dubai or Ajman"
                      />
                    </div>
                    <div>
                      <label htmlFor="store-phone" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Direct Phone Line *
                      </label>
                      <input
                        id="store-phone"
                        name="phone"
                        type="text"
                        required
                        value={storeForm.phone}
                        onChange={(e) => setStoreForm({ ...storeForm, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                        placeholder="+971 4 399 1100"
                      />
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="store-address" className="block text-xs font-bold uppercase text-slate-600 mb-1">Address *</label>
                    <input
                      id="store-address"
                      name="address"
                      type="text"
                      required
                      value={storeForm.address}
                      onChange={(e) => setStoreForm({ ...storeForm, address: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                      placeholder="Al Barsha 1, Sheikh Zayed Road Service Rd, Dubai, UAE"
                    />
                  </div>

                  {/* ====================================================
                      MAP LOCATION PICKER
                  ==================================================== */}
                  <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-7 w-7 rounded-lg bg-[#E65100]/10 flex items-center justify-center">
                        <Globe className="h-4 w-4 text-[#E65100]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold uppercase text-slate-700 block">
                          Map Location Picker
                        </span>
                        <span className="text-[11px] text-slate-500">
                          Click on the map or drag the marker to set the exact store location
                        </span>
                      </div>
                    </div>

                    <StoreMapPicker
                      lat={storeForm.lat}
                      lng={storeForm.lng}
                      onChange={(newLat, newLng) =>
                        setStoreForm((prev) => ({ ...prev, lat: newLat, lng: newLng }))
                      }
                    />

                    {/* Manual coordinate inputs */}
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <label htmlFor="store-lat" className="text-[11px] font-semibold text-slate-500 block mb-1">
                          Latitude (or type manually):
                        </label>
                        <input
                          id="store-lat"
                          name="lat"
                          type="number"
                          step="any"
                          value={storeForm.lat}
                          onChange={(e) => setStoreForm({ ...storeForm, lat: e.target.value })}
                          className="w-full bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono outline-none focus:border-[#007BB5]"
                          placeholder="25.1121"
                        />
                      </div>
                      <div>
                        <label htmlFor="store-lng" className="text-[11px] font-semibold text-slate-500 block mb-1">
                          Longitude (or type manually):
                        </label>
                        <input
                          id="store-lng"
                          name="lng"
                          type="number"
                          step="any"
                          value={storeForm.lng}
                          onChange={(e) => setStoreForm({ ...storeForm, lng: e.target.value })}
                          className="w-full bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs font-mono outline-none focus:border-[#007BB5]"
                          placeholder="55.1965"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Operating Hours Builder */}
                  <div className="rounded-2xl bg-slate-50 p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-[#007BB5]" /> Operating Hours Builder
                      </span>
                      <button
                        type="button"
                        onClick={() => setManualStoreHours(!manualStoreHours)}
                        className="text-[11px] text-[#007BB5] hover:underline font-semibold"
                      >
                        {manualStoreHours ? "Use Dropdown Selectors" : "Type Manually"}
                      </button>
                    </div>

                    {!manualStoreHours ? (
                      <div className="space-y-3">
                        <div>
                          <span className="text-[11px] font-semibold text-slate-500 block mb-1">Days Preset:</span>
                          <div className="flex flex-wrap gap-1.5">
                            {DAY_PRESETS.map((dp) => (
                              <button
                                type="button"
                                key={dp}
                                onClick={() => updateStoreHoursFromBuilder(dp, storeHoursOpen, storeHoursClose)}
                                className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-all ${storeHoursDays === dp
                                    ? "bg-[#007BB5] text-white shadow-xs"
                                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                                  }`}
                              >
                                {dp}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="store-hours-open" className="text-[11px] font-semibold text-slate-500 block mb-1">
                              Opening Time:
                            </label>
                            <select
                              id="store-hours-open"
                              name="hours_open"
                              value={storeHoursOpen}
                              onChange={(e) =>
                                updateStoreHoursFromBuilder(storeHoursDays, e.target.value, storeHoursClose)
                              }
                              className="w-full bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-[#007BB5]"
                            >
                              <option value="">Select Opening Time</option>
                              {OPEN_TIME_OPTIONS.map((o) => (
                                <option key={o.val} value={o.val}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label htmlFor="store-hours-close" className="text-[11px] font-semibold text-slate-500 block mb-1">
                              Closing Time:
                            </label>
                            <select
                              id="store-hours-close"
                              name="hours_close"
                              value={storeHoursClose}
                              onChange={(e) =>
                                updateStoreHoursFromBuilder(storeHoursDays, storeHoursOpen, e.target.value)
                              }
                              className="w-full bg-white rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold outline-none focus:border-[#007BB5]"
                            >
                              <option value="">Select Closing Time</option>
                              {CLOSE_TIME_OPTIONS.map((c) => (
                                <option key={c.val} value={c.val}>
                                  {c.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <input
                        id="store-hours-manual"
                        name="hours"
                        aria-label="Store operating hours"
                        type="text"
                        value={storeForm.hours}
                        onChange={(e) => setStoreForm({ ...storeForm, hours: e.target.value })}
                        className="w-full bg-white rounded-xl border border-slate-200 px-4 py-2 text-xs outline-none"
                        placeholder="Daily · 8:00 AM – 12:00 AM"
                      />
                    )}

                    <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Formatted Schedule:</span>
                      <span className="font-bold text-[#007BB5] bg-[#007BB5]/10 px-2.5 py-1 rounded-md">
                        {storeForm.hours}
                      </span>
                    </div>
                  </div>

                  {/* Image & Alt */}
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="store-image" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Store Image URL / Upload
                      </label>
                      <div className="flex gap-2">
                        <input
                          id="store-image"
                          name="image"
                          type="text"
                          placeholder="/uploads/stores/... or https://..."
                          value={storeForm.image}
                          onChange={(e) => setStoreForm({ ...storeForm, image: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#007BB5]"
                        />
                        <label htmlFor="store-image-file" className="cursor-pointer inline-flex items-center gap-1.5 rounded-xl bg-[#007BB5] text-white px-3 py-2 text-xs font-semibold hover:bg-[#006699] transition-colors shrink-0 shadow-xs">
                          <Upload className="h-3.5 w-3.5" />
                          {uploading ? "..." : "Upload"}
                          <input
                            id="store-image-file"
                            name="image_file"
                            aria-label="Upload store image"
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) =>
                              handleFileUpload(e, (url) => setStoreForm((prev) => ({ ...prev, image: url })), "stores")
                            }
                          />
                        </label>
                      </div>

                      {/* Store Image Live Preview */}
                      <div className="mt-2 relative h-28 w-full rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                        {storeForm.image ? (
                          <>
                            <img
                              src={marketApi.resolveAssetUrl(storeForm.image)}
                              alt={storeForm.image_alt || storeForm.name || "Store preview"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fallback = e.currentTarget.nextElementSibling;
                                if (fallback instanceof HTMLElement) fallback.style.display = "flex";
                              }}
                            />
                            <div className="hidden h-full w-full items-center justify-center text-xs text-rose-500 bg-rose-50 font-medium">
                              Image failed to load
                            </div>
                            <button
                              type="button"
                              onClick={() => setStoreForm((prev) => ({ ...prev, image: "" }))}
                              className="absolute top-1.5 right-1.5 rounded-full bg-slate-900/70 p-1 text-white hover:bg-slate-900 transition-colors"
                              title="Remove image"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-slate-400 text-xs">
                            <ImageIcon className="h-6 w-6 text-slate-300" />
                            <span>No store image selected</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <label htmlFor="store-image-alt" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                        Store Image Alt Text
                      </label>
                      <input
                        id="store-image-alt"
                        name="image_alt"
                        type="text"
                        value={storeForm.image_alt}
                        onChange={(e) => setStoreForm({ ...storeForm, image_alt: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#007BB5]"
                        placeholder="Gate Al Barsha flagship building"
                      />
                    </div>
                  </div>

                  {/* Tagline */}
                  <div>
                    <label htmlFor="store-tagline" className="block text-xs font-bold uppercase text-slate-600 mb-1">Tagline</label>
                    <input
                      id="store-tagline"
                      name="tagline"
                      type="text"
                      value={storeForm.tagline}
                      onChange={(e) => setStoreForm({ ...storeForm, tagline: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs outline-none"
                      placeholder="Our flagship store — the widest seasonal range in Dubai."
                    />
                  </div>

                  {/* Highlights */}
                  <div>
                    <label htmlFor="store-highlights" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Highlights (One per line)
                    </label>
                    <textarea
                      id="store-highlights"
                      name="highlights"
                      rows={3}
                      value={storeForm.highlightsText}
                      onChange={(e) => setStoreForm({ ...storeForm, highlightsText: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-xs outline-none"
                      placeholder={"Largest fresh produce hall\nIn-house bakery\nFree 2-hour parking"}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => navigate("/admin/stores")}
                      className="rounded-2xl border border-slate-200 px-6 py-2.5 text-sm font-semibold hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-2xl bg-[#E65100] px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#E65100]/25 hover:bg-[#d44700]"
                    >
                      {editingStore ? "Update Store" : "Create Store"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}


          {/* ========================================================
              TAB 4: POSTS & ARTICLES
          ======================================================== */}
          {activeTab === "blogs" && (
            <>
              {isEditingPost ? (
                /* Full Post Editor */
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
                    <button
                      onClick={() => navigate("/admin/blogs")}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#007BB5]"
                    >
                      <ArrowLeft className="h-4 w-4" /> Back to All Articles
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                      </span>
                      {postSlug && (
                        <Link
                          to={`/blog/${postSlug}`}
                          target="_blank"
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" /> Preview
                        </Link>
                      )}
                      <button
                        onClick={handleSavePost}
                        disabled={savingPost}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#E65100] px-6 py-2.5 font-heading text-sm font-bold text-white shadow-lg shadow-[#E65100]/25 hover:bg-[#d44700] disabled:opacity-50"
                      >
                        <Save className="h-4 w-4" />
                        {savingPost ? "Saving..." : currentPostId ? "Update Article" : "Publish Article"}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
                    <div className="space-y-6">
                      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                        <label htmlFor="blog-title" className="sr-only">Article Title</label>
                        <input
                          id="blog-title"
                          name="title"
                          type="text"
                          value={postTitle}
                          onChange={(e) => handleTitleChange(e.target.value)}
                          placeholder="Add article title..."
                          className="w-full font-heading text-3xl sm:text-4xl font-black text-slate-900 outline-none border-b border-slate-100 pb-4 placeholder:text-slate-300"
                        />
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <Globe className="h-4 w-4 text-[#007BB5]" />
                          <label htmlFor="blog-slug" className="font-semibold text-slate-400 cursor-pointer">Permalink:</label>
                          <span className="text-slate-500">http://localhost:5173/blog/</span>
                          <input
                            id="blog-slug"
                            name="slug"
                            type="text"
                            value={postSlug}
                            onChange={(e) => {
                              setPostSlug(e.target.value);
                              setPostSlugManual(true);
                            }}
                            className="bg-white border border-slate-200 px-2 py-0.5 rounded text-[#007BB5] font-semibold outline-none text-xs"
                          />
                        </div>
                      </div>

                      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                          <span className="font-heading font-bold text-sm uppercase tracking-wider text-slate-700">
                            Article Body Content (Visual Editor)
                          </span>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Format text visually — bold looks bold, headings look big. No raw HTML tags needed.
                          </p>
                        </div>

                        {/* WYSIWYG Visual Editor */}
                        <VisualRichEditor
                          value={postBodyText}
                          onChange={setPostBodyText}
                          readTime={postReadTime}
                          placeholder="Start typing your article here... Highlight text and click Bold, Italic, Mark, or Headings to format instantly."
                        />
                      </div>

                      {/* Excerpt */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-2">
                        <label htmlFor="blog-excerpt" className="block font-heading font-bold text-sm text-slate-700">
                          Excerpt / Summary
                        </label>
                        <textarea
                          id="blog-excerpt"
                          name="excerpt"
                          rows={3}
                          value={postExcerpt}
                          onChange={(e) => setPostExcerpt(e.target.value)}
                          placeholder="Write a catchy 1-2 sentence summary of this article..."
                          className="w-full rounded-2xl border border-slate-200 p-4 text-sm outline-none focus:border-[#007BB5]"
                        />
                      </div>

                      {/* SEO Preview */}
                      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-6">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                          <h4 className="font-heading font-black text-lg text-[#007BB5] flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-[#E65100]" />
                            Search Engine Optimization (SEO)
                          </h4>
                          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            Snippet Preview
                          </span>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-1.5 font-sans">
                          <div className="text-xs text-slate-700 flex items-center gap-1.5">
                            <span className="text-slate-800">www.gateuae.com</span>
                            <span className="text-slate-400">› blog › {postSlug || "your-slug"}</span>
                          </div>
                          <h5 className="text-lg text-[#1a0dab] font-medium hover:underline cursor-pointer truncate">
                            {postMetaTitle || postTitle || "Your Article Title"} | Gate Hypermarket
                          </h5>
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {postMetaDescription || postExcerpt || "Enter an SEO meta description below..."}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label htmlFor="blog-meta-title" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                              SEO Meta Title
                            </label>
                            <input
                              id="blog-meta-title"
                              name="meta_title"
                              type="text"
                              value={postMetaTitle}
                              onChange={(e) => setPostMetaTitle(e.target.value)}
                              placeholder={postTitle || "Title used for search engines and browser tabs"}
                              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#007BB5]"
                            />
                          </div>

                          <div>
                            <label htmlFor="blog-meta-desc" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                              SEO Meta Description
                            </label>
                            <textarea
                              id="blog-meta-desc"
                              name="meta_description"
                              rows={2}
                              value={postMetaDescription}
                              onChange={(e) => setPostMetaDescription(e.target.value)}
                              placeholder={postExcerpt || "Meta description for Google search snippets"}
                              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#007BB5]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Inspector */}
                    <div className="space-y-6">
                      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                        <h4 className="font-heading font-extrabold text-base border-b border-slate-100 pb-3">
                          Publish Settings
                        </h4>
                        <div>
                          <label htmlFor="blog-post-date" className="block text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-[#007BB5]" /> Publish Date
                          </label>
                          <input
                            id="blog-post-date"
                            name="post_date"
                            type="date"
                            value={postDate}
                            onChange={(e) => setPostDate(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <div>
                          <label htmlFor="blog-read-time" className="block text-xs font-bold uppercase text-slate-500 mb-1 flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-[#007BB5]" /> Read Time
                          </label>
                          <input
                            id="blog-read-time"
                            name="read_time"
                            type="text"
                            value={postReadTime}
                            onChange={(e) => setPostReadTime(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none"
                          />
                        </div>

                        <button
                          onClick={handleSavePost}
                          disabled={savingPost}
                          className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#E65100] py-3 text-sm font-bold text-white shadow-md shadow-[#E65100]/25 hover:bg-[#d44700]"
                        >
                          <Save className="h-4 w-4" />
                          {savingPost ? "Publishing..." : currentPostId ? "Update Article" : "Publish Now"}
                        </button>
                      </div>

                      {/* Featured Image & Alt */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
                        <h4 className="font-heading font-extrabold text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                          <ImageIcon className="h-4 w-4 text-[#007BB5]" /> Featured Image &amp; Alt
                        </h4>

                        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 aspect-video relative flex items-center justify-center">
                          {postImage ? (
                            <>
                              <img
                                src={marketApi.resolveAssetUrl(postImage)}
                                alt={postImageAlt || "Post preview"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const fallback = e.currentTarget.nextElementSibling;
                                  if (fallback instanceof HTMLElement) fallback.style.display = "flex";
                                }}
                              />
                              <div className="hidden h-full w-full items-center justify-center text-xs text-rose-500 bg-rose-50 font-medium">
                                Image failed to load
                              </div>
                              <button
                                type="button"
                                onClick={() => setPostImage("")}
                                className="absolute top-2 left-2 rounded-full bg-slate-900/70 p-1.5 text-white hover:bg-slate-900 transition-colors z-10"
                                title="Remove image"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </>
                          ) : (
                            <span className="text-xs text-slate-400">No image chosen</span>
                          )}
                          <label htmlFor="blog-image-file" className="absolute bottom-2 right-2 cursor-pointer inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-bold text-white backdrop-blur hover:bg-slate-900 transition-colors z-10">
                            <Upload className="h-3.5 w-3.5" />
                            {uploading ? "Uploading..." : "Upload New"}
                            <input
                              id="blog-image-file"
                              name="post_image_file"
                              aria-label="Upload featured article image"
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, (url) => setPostImage(url), "blogs")}
                            />
                          </label>
                        </div>

                        <div>
                          <label htmlFor="blog-image-alt" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                            Image Alt Option (SEO) *
                          </label>
                          <input
                            id="blog-image-alt"
                            name="image_alt"
                            type="text"
                            value={postImageAlt}
                            onChange={(e) => setPostImageAlt(e.target.value)}
                            placeholder="Descriptive alt text for image..."
                            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#007BB5]"
                          />
                        </div>
                      </div>

                      {/* Category */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                        <h4 className="font-heading font-extrabold text-base border-b border-slate-100 pb-3">
                          Category
                        </h4>
                        <div className="space-y-2">
                          {["Seasonal Recipes", "Family Shopping Guides", "Community Tips", "Health & Living"].map(
                            (cat) => {
                              const catId = `blog-category-${cat.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
                              return (
                                <label key={cat} htmlFor={catId} className="flex items-center gap-2.5 text-xs font-medium cursor-pointer">
                                  <input
                                    id={catId}
                                    type="radio"
                                    name="category"
                                    value={cat}
                                    checked={postCategory === cat}
                                    onChange={() => setPostCategory(cat)}
                                    className="accent-[#007BB5] h-4 w-4"
                                  />
                                  {cat}
                                </label>
                              );
                            }
                          )}
                        </div>
                      </div>

                      {/* Stack / Tags */}
                      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
                        <h4 className="font-heading font-extrabold text-base border-b border-slate-100 pb-3 flex items-center gap-2">
                          <Layers className="h-4 w-4 text-[#007BB5]" /> Stack &amp; Tags
                        </h4>
                        <input
                          id="blog-stack-input"
                          name="stackInput"
                          aria-label="Type article tag and press Enter"
                          type="text"
                          value={stackInput}
                          onChange={(e) => setStackInput(e.target.value)}
                          onKeyDown={handleAddStackTag}
                          placeholder="Type tag and press Enter..."
                          className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-[#007BB5]"
                        />

                        <div className="flex flex-wrap gap-1.5 pt-2">
                          {postStack
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                            .map((tag) => (
                              <span
                                key={tag}
                                className="inline-flex items-center gap-1.5 rounded-full bg-[#007BB5]/10 px-3 py-1 text-xs font-bold text-[#007BB5]"
                              >
                                {tag}
                                <button
                                  type="button"
                                  onClick={() => handleRemoveStackTag(tag)}
                                  className="text-[#007BB5] hover:text-red-500 rounded-full"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Posts List */
                <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 mb-8">
                    <div>
                      <h2 className="font-heading text-2xl font-black text-slate-900">All Posts &amp; Articles</h2>
                      <p className="text-sm text-slate-500 mt-1">
                        Manage your published articles, stack tags, image alt text, and SEO ranking.
                      </p>
                    </div>
                    <button
                      onClick={handleOpenNewPost}
                      className="inline-flex items-center gap-2 rounded-2xl bg-[#E65100] px-6 py-3.5 font-heading font-bold text-white shadow-lg shadow-[#E65100]/25 hover:bg-[#d44700]"
                    >
                      <Plus className="h-5 w-5" /> Add New Article
                    </button>
                  </div>

                  <div className="mb-6 relative max-w-md">
                    <label htmlFor="blog-search" className="sr-only">Search articles</label>
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="blog-search"
                      name="blogSearch"
                      type="text"
                      value={blogSearch}
                      onChange={(e) => setBlogSearch(e.target.value)}
                      placeholder="Search posts by title, category, or stack tag..."
                      className="w-full rounded-2xl border border-slate-200 pl-11 pr-4 py-2.5 text-sm outline-none focus:border-[#007BB5]"
                    />
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
                          <th className="pb-3">Title &amp; URL</th>
                          <th className="pb-3">Category</th>
                          <th className="pb-3">Stack / Tags</th>
                          <th className="pb-3">Image Alt</th>
                          <th className="pb-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredBlogs.map((b) => (
                          <tr key={b.id || b.slug} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-4 pr-4">
                              <div className="flex items-center gap-3">
                                {b.image ? (
                                  <img
                                    src={marketApi.resolveAssetUrl(b.image)}
                                    alt={b.image_alt || b.title}
                                    className="h-12 w-16 rounded-xl object-cover border border-slate-200 bg-slate-100 shrink-0"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                      const placeholder = e.currentTarget.nextElementSibling;
                                      if (placeholder instanceof HTMLElement) placeholder.style.display = "flex";
                                    }}
                                  />
                                ) : null}
                                <div
                                  className="h-12 w-16 rounded-xl bg-slate-100 border border-slate-200 items-center justify-center text-slate-400 shrink-0"
                                  style={{ display: b.image ? "none" : "flex" }}
                                >
                                  <BookOpen className="h-5 w-5" />
                                </div>
                                <div>
                                  <button
                                    onClick={() => handleOpenEditPost(b)}
                                    className="font-heading font-bold text-base text-left hover:text-[#007BB5] block transition-colors"
                                  >
                                    {b.title}
                                  </button>
                                  <span className="text-xs text-slate-400">/blog/{b.slug}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 pr-4 font-semibold text-[#007BB5]">{b.category}</td>
                            <td className="py-4 pr-4">
                              {b.stack ? (
                                <div className="flex flex-wrap gap-1">
                                  {b.stack.split(",").map((s, idx) => (
                                    <span
                                      key={idx}
                                      className="rounded-full bg-[#007BB5]/10 px-2.5 py-0.5 text-xs font-bold text-[#007BB5]"
                                    >
                                      {s.trim()}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">—</span>
                              )}
                            </td>
                            <td className="py-4 pr-4 text-xs text-slate-600 max-w-xs truncate">
                              {b.image_alt || <span className="text-slate-400 italic">None</span>}
                            </td>
                            <td className="py-4 text-right space-x-2 whitespace-nowrap">
                              <button
                                onClick={() => handleOpenEditPost(b)}
                                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-[#007BB5] hover:bg-[#007BB5]/10"
                              >
                                <Edit2 className="h-3.5 w-3.5 inline mr-1" /> Edit
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(b.id)}
                                className="rounded-xl border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                                title="Delete"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ========================================================
              TAB 5: PAGES CMS & SEO
          ======================================================== */}
          {activeTab === "pages" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="border-b border-slate-100 pb-5 mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-heading text-2xl font-black text-slate-900">Pages Content &amp; SEO</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Manage metadata, keywords, and live AI/crawler discoverability across all website pages.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateSeo}
                    disabled={syncingSeo}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                    title="Synchronizes sitemap.xml, robots.txt, llms.txt, aeo.json, and geo.json with the live database"
                  >
                    <RefreshCw className={`h-4 w-4 ${syncingSeo ? "animate-spin" : ""}`} />
                    {syncingSeo ? "Regenerating..." : "Sync & Regenerate SEO Files"}
                  </button>
                </div>

                {/* SEO Files Quick Status Bar */}
                <div className="mt-4 p-3 bg-blue-50/60 border border-blue-100 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2 font-semibold text-[#007BB5]">
                    <Globe className="h-4 w-4" />
                    <span>Live Database-Generated SEO Endpoints:</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white rounded-lg border border-blue-200 text-[#007BB5] hover:bg-blue-50 font-mono text-[11px] font-medium inline-flex items-center gap-1"
                    >
                      sitemap.xml <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white rounded-lg border border-blue-200 text-[#007BB5] hover:bg-blue-50 font-mono text-[11px] font-medium inline-flex items-center gap-1"
                    >
                      robots.txt <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href="/llms.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white rounded-lg border border-blue-200 text-[#007BB5] hover:bg-blue-50 font-mono text-[11px] font-medium inline-flex items-center gap-1"
                    >
                      llms.txt <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href="/aeo.json"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white rounded-lg border border-blue-200 text-[#007BB5] hover:bg-blue-50 font-mono text-[11px] font-medium inline-flex items-center gap-1"
                    >
                      aeo.json <ExternalLink className="h-3 w-3" />
                    </a>
                    <a
                      href="/geo.json"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-white rounded-lg border border-blue-200 text-[#007BB5] hover:bg-blue-50 font-mono text-[11px] font-medium inline-flex items-center gap-1"
                    >
                      geo.json <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {["home", "about", "careers", "contact", "promotions", "stores", "blog"].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePageChange(p)}
                      className={`rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${selectedPage === p
                          ? "bg-[#007BB5] text-white shadow-md shadow-[#007BB5]/25"
                          : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                        }`}
                    >
                      {p} Page
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSavePage} className="space-y-6">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-4">
                  <h3 className="font-heading text-base font-bold text-[#007BB5]">
                    SEO &amp; Meta Tags for {selectedPage.toUpperCase()} Page
                  </h3>
                  <div>
                    <label htmlFor="cms-meta-title" className="block text-xs font-bold uppercase text-slate-600 mb-1">Page Meta Title</label>
                    <input
                      id="cms-meta-title"
                      name="meta_title"
                      type="text"
                      value={pageCms.meta_title}
                      onChange={(e) => setPageCms({ ...pageCms, meta_title: e.target.value })}
                      placeholder="Title displayed in browser tabs and search engine results"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-[#007BB5] outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="cms-meta-desc" className="block text-xs font-bold uppercase text-slate-600 mb-1">Page Meta Description</label>
                    <textarea
                      id="cms-meta-desc"
                      name="meta_description"
                      rows={2}
                      value={pageCms.meta_description}
                      onChange={(e) => setPageCms({ ...pageCms, meta_description: e.target.value })}
                      placeholder="Brief summary displayed under search engine links (150-160 characters)"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-[#007BB5] outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="cms-meta-keywords" className="block text-xs font-bold uppercase text-slate-600 mb-1">Page Meta Keywords</label>
                    <input
                      id="cms-meta-keywords"
                      name="meta_keywords"
                      type="text"
                      value={pageCms.meta_keywords || ""}
                      onChange={(e) => setPageCms({ ...pageCms, meta_keywords: e.target.value })}
                      placeholder="Comma-separated keywords (e.g. gate careers, jobs dubai, retail vacancies)"
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-[#007BB5] outline-none"
                    />
                  </div>
                </div>

                {selectedPage === "careers" && (
                  <div className="space-y-4">
                    <h3 className="font-heading text-base font-bold text-slate-900">Careers Page Header &amp; Copy</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="cms-hero-kicker" className="block text-xs font-bold uppercase text-slate-500 mb-1">Hero Kicker / Badge</label>
                        <input
                          id="cms-hero-kicker"
                          name="hero_kicker"
                          type="text"
                          value={pageCms.content?.hero_kicker || ""}
                          onChange={(e) =>
                            setPageCms({
                              ...pageCms,
                              content: { ...pageCms.content, hero_kicker: e.target.value },
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none bg-white"
                          placeholder="Careers at Gate Hypermarket"
                        />
                      </div>
                      <div>
                        <label htmlFor="cms-hero-title" className="block text-xs font-bold uppercase text-slate-500 mb-1">Hero Title</label>
                        <input
                          id="cms-hero-title"
                          name="hero_title"
                          type="text"
                          value={pageCms.content?.hero_title || ""}
                          onChange={(e) =>
                            setPageCms({
                              ...pageCms,
                              content: { ...pageCms.content, hero_title: e.target.value },
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none bg-white"
                          placeholder="Build your future with a growing retail family."
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label htmlFor="cms-hero-blurb" className="block text-xs font-bold uppercase text-slate-500 mb-1">Hero Blurb / Subtitle</label>
                        <textarea
                          id="cms-hero-blurb"
                          name="hero_blurb"
                          rows={2}
                          value={pageCms.content?.hero_blurb || ""}
                          onChange={(e) =>
                            setPageCms({
                              ...pageCms,
                              content: { ...pageCms.content, hero_blurb: e.target.value },
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none bg-white"
                          placeholder="We are hiring passionate team players across our four hypermarket stores in Dubai and Ajman..."
                        />
                      </div>
                    </div>
                  </div>
                )}

                {selectedPage === "home" && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#007BB5] shadow-xs">
                          <ImageIcon className="h-5 w-5" />
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-800">Separate Desktop &amp; Mobile Hero Banner</p>
                          <p className="text-[11px] text-slate-500">Upload responsive high-res desktop &amp; mobile hero banners with live device simulation.</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate("/admin/banners")}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#007BB5] text-white px-4 py-2 text-xs font-bold shadow-xs hover:bg-[#006a9d] transition-colors"
                      >
                        Manage Hero Banners &rarr;
                      </button>
                    </div>

                    <h3 className="font-heading text-base font-bold text-slate-900">Home Page Content Points</h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="cms-hero-badge" className="block text-xs font-bold uppercase text-slate-500 mb-1">Hero Badge Text</label>
                        <input
                          id="cms-hero-badge"
                          name="hero_badge"
                          type="text"
                          value={pageCms.content.hero_badge || ""}
                          onChange={(e) =>
                            setPageCms({
                              ...pageCms,
                              content: { ...pageCms.content, hero_badge: e.target.value },
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                        />
                      </div>
                      <div>
                        <label htmlFor="cms-hero-highlight" className="block text-xs font-bold uppercase text-slate-500 mb-1">Hero Highlight Text</label>
                        <input
                          id="cms-hero-highlight"
                          name="hero_title_highlight"
                          type="text"
                          value={pageCms.content.hero_title_highlight || ""}
                          onChange={(e) =>
                            setPageCms({
                              ...pageCms,
                              content: { ...pageCms.content, hero_title_highlight: e.target.value },
                            })
                          }
                          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    disabled={savingPage}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#E65100] px-8 py-3.5 font-heading font-bold text-white shadow-lg shadow-[#E65100]/25 hover:bg-[#d44700]"
                  >
                    <Save className="h-5 w-5" />
                    {savingPage ? "Saving..." : `Save ${selectedPage.toUpperCase()} Content`}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================
              TAB 6: CAMPAIGNS
          ======================================================== */}
          {activeTab === "campaigns" && (
            <FlyersAdminSection
              showToast={showToast}
              action={action}
              id={id}
              onNavigate={(path) => navigate(path)}
              onCampaignsUpdated={async () => {
                await refreshCampaigns();
                const res = await marketApi.getCampaigns();
                if (res?.success) setCampaignsList(res.campaigns);
              }}
            />
          )}

          {/* ========================================================
              TAB 6: CAREERS & JOBS MANAGEMENT
          ======================================================== */}
          {activeTab === "careers" && (
            <CareersAdminSection
              showToast={showToast}
              onPendingCountChange={setPendingCareersCount}
              currentSubTab={action === "applications" ? "applications" : "jobs"}
              onSubTabChange={(newTab) => navigate(`/admin/careers/${newTab}`)}
            />
          )}

          {/* ========================================================
              TAB 7: INQUIRIES
          ======================================================== */}
          {activeTab === "inquiries" && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
              <div className="border-b border-slate-100 pb-5 mb-8">
                <h2 className="font-heading text-2xl font-black text-slate-900">Customer Contact Messages</h2>
                <p className="text-sm text-slate-500 mt-1">Messages submitted from the public Contact page.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Branch</th>
                      <th className="pb-3">Message</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 pr-3 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(inq.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-4 pr-3">
                          <span className="font-bold block text-slate-900">{inq.name}</span>
                          <a href={`mailto:${inq.email}`} className="text-xs text-[#007BB5] hover:underline">
                            {inq.email}
                          </a>
                        </td>
                        <td className="py-4 pr-3 text-xs font-semibold capitalize text-slate-700">{inq.branch}</td>
                        <td className="py-4 pr-3 text-sm text-slate-700 max-w-xs">{inq.message}</td>
                        <td className="py-4 pr-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-bold uppercase ${inq.status === "unread" ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                              }`}
                          >
                            {inq.status}
                          </span>
                        </td>
                        <td className="py-4 text-right space-x-2 whitespace-nowrap">
                          {inq.status === "unread" && (
                            <button
                              onClick={() => handleMarkInquiryRead(inq.id)}
                              className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50"
                            >
                              Mark Read
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteInquiry(inq.id)}
                            className="rounded-xl border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>




      {/* Session Expired / Re-authentication Modal */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-slate-900">Session Expired</h3>
                <p className="text-xs text-slate-500">Sign in to continue your administrative session</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-5">
              Your security token has expired or is invalid. Please sign in below to resume managing stores and content without losing your page.
            </p>

            {reauthError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {reauthError}
              </div>
            )}

            <form onSubmit={handleReauth} className="space-y-4">
              <div>
                <label htmlFor="reauth-email" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Admin Email
                </label>
                <input
                  id="reauth-email"
                  name="email"
                  autoComplete="email"
                  type="email"
                  required
                  value={reauthEmail || adminUser?.email || ""}
                  onChange={(e) => setReauthEmail(e.target.value)}
                  placeholder="Enter admin email"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#007BB5]"
                />
              </div>

              <div>
                <label htmlFor="reauth-password" className="block text-xs font-bold uppercase text-slate-500 mb-1">
                  Password
                </label>
                <input
                  id="reauth-password"
                  name="password"
                  autoComplete="current-password"
                  type="password"
                  required
                  autoFocus
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#007BB5]"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowSessionModal(false);
                    marketApi.logout();
                    navigate("/admin/login?expired=1");
                  }}
                  className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Go to Login
                </button>
                <button
                  type="submit"
                  disabled={reauthLoading}
                  className="flex-1 rounded-xl bg-[#E65100] py-2.5 text-xs font-bold text-white shadow hover:bg-[#d44700] disabled:opacity-50"
                >
                  {reauthLoading ? "Verifying..." : "Sign In & Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
