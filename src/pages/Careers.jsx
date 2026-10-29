import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Briefcase,
  MapPin,
  Clock,
  Search,
  Filter,
  Award,
  HeartHandshake,
  TrendingUp,
  ShieldCheck,
  Building2,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { marketApi } from "@/api/marketApi";
import { useMarket } from "@/context/MarketContext";
import ApplyModal from "@/components/careers/ApplyModal";

export default function Careers() {
  const { stores } = useMarket();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pageCms, setPageCms] = useState(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("All");
  const [selectedLocation, setSelectedLocation] = useState("All");
  const [selectedType, setSelectedType] = useState("All");
  const [allDepartments, setAllDepartments] = useState(["All"]);

  // Fetch full jobs list once to populate dynamic department filters
  useEffect(() => {
    marketApi
      .getJobs({})
      .then((res) => {
        if (res?.success && Array.isArray(res.jobs)) {
          const uniqueDepts = Array.from(
            new Set(res.jobs.map((j) => j.department?.trim()).filter(Boolean))
          ).sort();
          setAllDepartments(["All", ...uniqueDepts]);
        }
      })
      .catch(() => { });
  }, []);

  // Apply Modal state
  const [selectedJobForModal, setSelectedJobForModal] = useState(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Open Application general form state
  const [openCvData, setOpenCvData] = useState({ name: "", email: "", phone: "", dept: "Retail & Sales" });
  const [openCvResume, setOpenCvResume] = useState(null);
  const [openCvSuccess, setOpenCvSuccess] = useState(false);
  const [openCvSubmitting, setOpenCvSubmitting] = useState(false);

  // Load CMS SEO & Content for Careers page
  useEffect(() => {
    marketApi
      .getPage("careers")
      .then((res) => {
        if (res?.success && res.page) {
          setPageCms(res.page);
          if (res.page.meta_title) {
            document.title = res.page.meta_title;
          }
          if (res.page.meta_description) {
            let meta = document.querySelector('meta[name="description"]');
            if (meta) meta.setAttribute("content", res.page.meta_description);
          }
          if (res.page.meta_keywords) {
            let meta = document.querySelector('meta[name="keywords"]');
            if (meta) {
              meta.setAttribute("content", res.page.meta_keywords);
            } else {
              const newMeta = document.createElement("meta");
              newMeta.name = "keywords";
              newMeta.content = res.page.meta_keywords;
              document.head.appendChild(newMeta);
            }
          }
        }
      })
      .catch(() => { });
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [searchTerm, selectedDept, selectedLocation, selectedType]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await marketApi.getJobs({
        search: searchTerm,
        department: selectedDept,
        location: selectedLocation,
        job_type: selectedType,
      });
      if (res?.success) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setError("Unable to load job postings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenApply = (job) => {
    setSelectedJobForModal(job);
    setIsApplyModalOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedDept("All");
    setSelectedLocation("All");
    setSelectedType("All");
  };

  // Dynamic departments derived from available active jobs in the database
  const dynamicDepartments = Array.from(
    new Set([...allDepartments, ...jobs.map((j) => j.department?.trim()).filter(Boolean)])
  );

  const jobTypes = ["All", "Full-Time", "Part-Time", "Shift-Based"];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ==========================================
          HERO SECTION
      ========================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#07131B] via-[#0B202D] to-[#0E2C3D] py-20 lg:py-28 text-white">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-[#007BB5]/15 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-[#E65100]/15 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-5 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-[#4CC9F0] backdrop-blur-md mb-6">
            <Sparkles className="h-4 w-4 text-[#E65100]" /> {pageCms?.content?.hero_kicker || "Careers at Gate Hypermarket"}
          </div>

          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            {pageCms?.content?.hero_title || (
              <>
                Build your future with a growing{" "}
                <span className="text-[#4CC9F0]">retail family</span>.
              </>
            )}
          </h1>

          <p className="mt-6 text-base sm:text-lg lg:text-xl text-white/70 max-w-2xl mx-auto font-normal leading-relaxed">
            {pageCms?.content?.hero_blurb ||
              "We are hiring passionate team players across our hypermarket stores. Join us for competitive salaries, UAE employment visa, medical cover, and rapid career growth."}
          </p>

          {/* Quick Stats Grid */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-sm">
              <Building2 className="h-6 w-6 text-[#4CC9F0] mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold font-heading">
                {stores && stores.length > 0 ? `${stores.length} ${stores.length === 1 ? "Branch" : "Branches"}` : "Growing Team"}
              </div>
              <div className="text-xs sm:text-sm text-white/60">
                {stores && stores.length > 0
                  ? Array.from(new Set(stores.map((s) => s.city).filter(Boolean))).join(" & ") || "Retail Stores"
                  : "UAE Hypermarkets"}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-sm">
              <Briefcase className="h-6 w-6 text-[#E65100] mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold font-heading">
                {jobs.length > 0 ? `${jobs.length}+ Roles` : "Multiple Roles"}
              </div>
              <div className="text-xs sm:text-sm text-white/60">Hiring Actively</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-sm">
              <ShieldCheck className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold font-heading">Visa & Health</div>
              <div className="text-xs sm:text-sm text-white/60">Fully Company Covered</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-5 backdrop-blur-sm">
              <TrendingUp className="h-6 w-6 text-amber-400 mx-auto mb-2" />
              <div className="text-2xl sm:text-3xl font-bold font-heading">Growth Track</div>
              <div className="text-xs sm:text-sm text-white/60">Internal Promotions</div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          SEARCH & FILTER BAR
      ========================================== */}
      <section className="relative -mt-8 mx-auto max-w-7xl px-5 lg:px-8 z-20">
        <div className="rounded-3xl bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/60 border border-slate-200">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Search Input */}
            <div className="md:col-span-4 relative">
              <label htmlFor="career-search" className="sr-only">
                Search job openings
              </label>
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="career-search"
                name="searchTerm"
                type="text"
                placeholder="Search job title, keyword..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search job title, keyword"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 py-3 text-sm focus:bg-white focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
              />
            </div>

            {/* Department Dropdown */}
            <div className="md:col-span-3">
              <label htmlFor="career-dept" className="sr-only">
                Filter by department
              </label>
              <select
                id="career-dept"
                name="department"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                aria-label="Filter by department"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-gray-700 focus:bg-white focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
              >
                <option value="All">All Departments</option>
                {dynamicDepartments.filter((d) => d !== "All").map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            {/* Location Dropdown */}
            <div className="md:col-span-3">
              <label htmlFor="career-location" className="sr-only">
                Filter by location
              </label>
              <select
                id="career-location"
                name="location"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                aria-label="Filter by location"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-gray-700 focus:bg-white focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
              >
                <option value="All">All Locations</option>
                {stores && stores.length > 0 && (
                  <optgroup label="Store Branches">
                    {stores.map((s) => (
                      <option key={s.id || s.slug} value={s.name}>
                        {s.name} {s.city ? `(${s.city})` : ""}
                      </option>
                    ))}
                  </optgroup>
                )}
                {/* Include any custom locations from existing jobs */}
                {Array.from(new Set(jobs.map((j) => j.location).filter(Boolean)))
                  .filter((loc) => !stores?.some((s) => loc?.includes(s.name)))
                  .length > 0 && (
                    <optgroup label="Other Locations">
                      {Array.from(new Set(jobs.map((j) => j.location).filter(Boolean)))
                        .filter((loc) => !stores?.some((s) => loc?.includes(s.name)))
                        .map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                    </optgroup>
                  )}
              </select>
            </div>

            {/* Reset / Clear Button */}
            <div className="md:col-span-2 flex items-center justify-end">
              {(searchTerm || selectedDept !== "All" || selectedLocation !== "All" || selectedType !== "All") ? (
                <button
                  onClick={clearFilters}
                  className="w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-100 transition-colors"
                >
                  Clear Filters
                </button>
              ) : (
                <div className="w-full text-center text-xs font-semibold text-gray-500 py-3">
                  Showing {jobs.length} roles
                </div>
              )}
            </div>
          </div>

          {/* Department Chips Filter */}
          {dynamicDepartments.length > 1 && (
            <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400 mr-2 flex items-center gap-1">
                <Filter className="h-3.5 w-3.5" /> Department:
              </span>
              {dynamicDepartments.map((dept) => (
                <button
                  key={dept}
                  onClick={() => setSelectedDept(dept)}
                  className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${selectedDept === dept
                      ? "bg-[#007BB5] text-white shadow-md shadow-[#007BB5]/25"
                      : "bg-slate-100 text-gray-600 hover:bg-slate-200"
                    }`}
                >
                  {dept}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ==========================================
          JOB LISTINGS SECTION
      ========================================== */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900">
              Current Openings ({jobs.length})
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Click any position to review detailed responsibilities and apply directly.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-24 text-center">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#007BB5]" />
            <p className="mt-4 text-sm font-semibold text-gray-500">Loading open positions...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-4 text-lg font-bold text-gray-800 font-heading">
              No matching job openings found
            </h3>
            <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
              We couldn't find any positions matching your selected filters. Try broadening your keywords or clearing the filters.
            </p>
            <button
              onClick={clearFilters}
              className="mt-6 rounded-full bg-[#007BB5] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#006699] transition-all"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-[#007BB5]/30"
              >
                <div>
                  {/* Department & Type Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-[#007BB5] border border-sky-100">
                      {job.department}
                    </span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 border border-emerald-100">
                      {job.job_type}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold font-heading text-gray-900 group-hover:text-[#007BB5] transition-colors leading-snug">
                    <Link to={`/careers/${job.slug || job.id}`}>{job.title}</Link>
                  </h3>

                  {/* Location & Details */}
                  <div className="mt-4 space-y-2 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#E65100] flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                      <span>Experience: <strong>{job.experience_level || "1-2 Years"}</strong></span>
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center gap-2 text-gray-700 font-medium">
                        <span className="h-2 w-2 rounded-full bg-[#E65100]" />
                        <span>{job.salary_range}</span>
                      </div>
                    )}
                  </div>

                  {/* Excerpt */}
                  <p className="mt-4 text-xs sm:text-sm text-gray-500 line-clamp-3 leading-relaxed">
                    {job.description}
                  </p>
                </div>

                {/* Footer Buttons */}
                <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
                  <Link
                    to={`/careers/${job.slug || job.id}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#007BB5] hover:text-[#005a85] transition-colors"
                  >
                    View Details <ChevronRight className="h-4 w-4" />
                  </Link>

                  <button
                    onClick={() => handleOpenApply(job)}
                    className="rounded-full bg-[#E65100] px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-md shadow-[#E65100]/25 hover:bg-[#CC4700] hover:-translate-y-0.5 transition-all"
                  >
                    Apply Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==========================================
          WHY WORK AT GATE HYPERMARKET?
      ========================================== */}
      <section className="bg-white border-y border-slate-200 py-20">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#007BB5]">
              Culture & Values
            </span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-extrabold font-heading text-gray-900">
              Why build your career at Gate?
            </h2>
            <p className="mt-4 text-gray-600 text-sm sm:text-base">
              At Gate Hypermarket, our people are the core of every customer smile and every fresh crate on the shelf.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-7 transition-all hover:bg-white hover:shadow-xl hover:border-slate-200">
              <div className="h-12 w-12 rounded-2xl bg-sky-100 text-[#007BB5] flex items-center justify-center mb-5">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-gray-900">Competitive Packages</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Punctual, tax-free monthly salaries, shift incentives, overtime benefits, and performance bonuses.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-7 transition-all hover:bg-white hover:shadow-xl hover:border-slate-200">
              <div className="h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-gray-900">Visa & Full Healthcare</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Complete UAE employment sponsorship, Emirates ID, medical insurance cards, and annual flight ticket allowances.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-7 transition-all hover:bg-white hover:shadow-xl hover:border-slate-200">
              <div className="h-12 w-12 rounded-2xl bg-amber-100 text-[#E65100] flex items-center justify-center mb-5">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-gray-900">Fast Career Growth</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                We believe in promoting from within. Our floor supervisors and store managers started right at our checkout lines.
              </p>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50/60 p-7 transition-all hover:bg-white hover:shadow-xl hover:border-slate-200">
              <div className="h-12 w-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-lg font-bold text-gray-900">Staff Grocery Perks</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Exclusive employee discount privileges across all fresh food, produce, bakery, and household products.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================
          OPEN APPLICATION / SPONTANEOUS RESUME DROP
      ========================================== */}
      <section className="mx-auto max-w-7xl px-5 lg:px-8 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-[#07131B] via-[#0B2230] to-[#007BB5] p-8 sm:p-12 lg:p-16 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-[#4CC9F0] uppercase tracking-wider mb-4">
              Didn't find your ideal role?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              Send us your open CV
            </h2>
            <p className="mt-4 text-white/70 text-sm sm:text-base leading-relaxed">
              We are constantly opening new sections and expanding across Dubai and the UAE. Submit your CV to our talent pool and our HR team will contact you whenever a suitable role matches your skills.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/contact"
                className="rounded-full bg-[#E65100] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-[#E65100]/30 hover:bg-[#CC4700] transition-all"
              >
                Contact HR Team
              </Link>
              <a
                href="mailto:hr@gateuae.com"
                className="rounded-full border border-white/20 bg-white/10 px-7 py-3 text-sm font-semibold text-white hover:bg-white/20 transition-all"
              >
                Email CV to hr@gateuae.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Apply Modal */}
      {selectedJobForModal && (
        <ApplyModal
          job={selectedJobForModal}
          isOpen={isApplyModalOpen}
          onClose={() => {
            setIsApplyModalOpen(false);
            setSelectedJobForModal(null);
          }}
          onApplySuccess={() => {
            fetchJobs();
          }}
        />
      )}
    </div>
  );
}
