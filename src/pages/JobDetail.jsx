import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Users,
  CheckCircle2,
  Gift,
  Share2,
  Check,
  Upload,
  FileText,
  AlertCircle,
  Loader2,
  Send,
  Phone,
  Mail,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { marketApi } from "@/api/marketApi";
import { useMarket } from "@/context/MarketContext";

export default function JobDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { stores } = useMarket();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Application Form state
  const [formData, setFormData] = useState({
    applicant_name: "",
    email: "",
    phone: "",
    current_city: "Dubai",
    experience_years: "1 - 2 Years",
    notice_period: "Immediate",
    cover_note: "",
    linkedin_url: "",
  });

  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [applicationId, setApplicationId] = useState(null);

  useEffect(() => {
    fetchJobDetail();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  const fetchJobDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await marketApi.getJob(slug);
      if (res?.success && res.job) {
        setJob(res.job);
      } else {
        setError("Job opening not found or has been removed.");
      }
    } catch (err) {
      console.error("Error loading job:", err);
      setError("Unable to retrieve job information.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      setUploadError("File size exceeds 15MB limit.");
      return;
    }

    setResumeFile(file);
    setUploadError("");
    setUploadingResume(true);

    try {
      const res = await marketApi.uploadResume(file);
      if (res?.success && res.url) {
        setResumeUrl(res.url);
      } else {
        setUploadError(res?.message || "Failed to upload resume.");
      }
    } catch (err) {
      setUploadError(err.message || "Failed to upload resume.");
    } finally {
      setUploadingResume(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.applicant_name.trim()) {
      setSubmitError("Please provide your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setSubmitError("Please enter a valid email address.");
      return;
    }
    if (!formData.phone.trim()) {
      setSubmitError("Please provide a contact phone number.");
      return;
    }
    if (!resumeUrl) {
      setSubmitError("Please upload your CV / resume before submitting.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await marketApi.applyForJob(job.id, {
        applicant_name: formData.applicant_name,
        email: formData.email,
        phone: formData.phone,
        current_city: formData.current_city,
        experience_years: formData.experience_years,
        notice_period: formData.notice_period,
        resume_url: resumeUrl,
        cover_note: formData.cover_note,
        linkedin_url: formData.linkedin_url,
      });

      if (res?.success) {
        setSubmitSuccess(true);
        setApplicationId(res.applicationId);
        // Scroll to success banner
        document.getElementById("apply-form-section")?.scrollIntoView({ behavior: "smooth" });
      } else {
        setSubmitError(res?.message || "Application submission failed.");
      }
    } catch (err) {
      setSubmitError(err.message || "Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-24">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#007BB5]" />
          <p className="mt-4 text-sm font-semibold text-gray-500">Loading position details...</p>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-lg border border-slate-200">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-bold font-heading text-gray-900">Job Not Found</h2>
          <p className="mt-2 text-sm text-gray-600">
            {error || "The job posting you are looking for is no longer available."}
          </p>
          <Link
            to="/careers"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#007BB5] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#006699] transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Careers
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Breadcrumbs & Back */}
      <div className="bg-white border-b border-slate-200 py-3.5">
        <div className="mx-auto max-w-7xl px-5 lg:px-8 flex items-center justify-between text-xs sm:text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Link to="/" className="hover:text-gray-900">Home</Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <Link to="/careers" className="hover:text-gray-900">Careers</Link>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="font-semibold text-gray-800 truncate max-w-[200px] sm:max-w-xs">
              {job.title}
            </span>
          </div>

          <Link
            to="/careers"
            className="inline-flex items-center gap-1.5 font-semibold text-[#007BB5] hover:text-[#005a85] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> All Roles
          </Link>
        </div>
      </div>

      {/* ==========================================
          HEADER SECTION
      ========================================== */}
      <div className="bg-gradient-to-r from-[#07131B] via-[#0B202D] to-[#0E2C3D] py-14 text-white">
        <div className="mx-auto max-w-7xl px-5 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-[#4CC9F0] border border-white/10">
                  {job.department}
                </span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/30">
                  {job.job_type}
                </span>
                {job.deadline && (
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200 border border-amber-500/30">
                    Apply by {job.deadline}
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-heading text-white leading-tight">
                {job.title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-5 text-xs sm:text-sm text-white/80">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-[#E65100]" /> {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-[#4CC9F0]" /> Exp: {job.experience_level || "1 - 2 Years"}
                </span>
                {job.openings > 1 && (
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-emerald-400" /> {job.openings} Vacancies
                  </span>
                )}
                {job.salary_range && (
                  <span className="font-semibold text-white bg-white/10 px-3 py-1 rounded-full">
                    {job.salary_range}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="#apply-form-section"
                className="rounded-full bg-[#E65100] px-8 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-[#E65100]/30 hover:bg-[#CC4700] hover:-translate-y-0.5 active:translate-y-0 transition-all text-center"
              >
                Apply for this Position
              </a>
              <button
                onClick={handleCopyLink}
                className="h-12 w-12 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
                title="Copy Job Link"
              >
                {copiedLink ? <Check className="h-5 w-5 text-emerald-400" /> : <Share2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          MAIN BODY: 2 COLUMNS
      ========================================== */}
      <div className="mx-auto max-w-7xl px-5 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Job description & Application Form */}
          <div className="lg:col-span-8 space-y-8">
            {/* Overview Card */}
            <div className="rounded-3xl bg-white p-7 sm:p-9 shadow-sm border border-slate-200">
              <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 mb-4">
                Role Overview
              </h2>
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Responsibilities */}
            {Array.isArray(job.responsibilities) && job.responsibilities.length > 0 && (
              <div className="rounded-3xl bg-white p-7 sm:p-9 shadow-sm border border-slate-200">
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 mb-5 flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-[#007BB5]" /> Key Responsibilities & Duties
                </h2>
                <ul className="space-y-3.5">
                  {job.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-[#007BB5] mt-2 flex-shrink-0" />
                      <span>{resp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Requirements & Qualifications */}
            {Array.isArray(job.requirements) && job.requirements.length > 0 && (
              <div className="rounded-3xl bg-white p-7 sm:p-9 shadow-sm border border-slate-200">
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 mb-5 flex items-center gap-2">
                  <ShieldCheck className="h-6 w-6 text-[#E65100]" /> Requirements & Qualifications
                </h2>
                <ul className="space-y-3.5">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                      <span className="h-2 w-2 rounded-full bg-[#E65100] mt-2 flex-shrink-0" />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits & Perks */}
            {Array.isArray(job.benefits) && job.benefits.length > 0 && (
              <div className="rounded-3xl bg-white p-7 sm:p-9 shadow-sm border border-slate-200">
                <h2 className="text-xl sm:text-2xl font-bold font-heading text-gray-900 mb-5 flex items-center gap-2">
                  <Gift className="h-6 w-6 text-emerald-600" /> What We Offer (Employee Benefits)
                </h2>
                <ul className="space-y-3.5">
                  {job.benefits.map((ben, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                      <Check className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span>{ben}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* ==========================================
                APPLICATION FORM (INLINE & INTUITIVE)
            ========================================== */}
            <div
              id="apply-form-section"
              className="rounded-3xl bg-white p-7 sm:p-10 shadow-lg border border-slate-200 scroll-mt-24"
            >
              <div className="border-b border-slate-100 pb-5 mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#007BB5]">
                  Step 2 of 2
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-gray-900 mt-1">
                  Apply for this position
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Please complete the form below and attach your CV. Our hiring managers review all candidates.
                </p>
              </div>

              {submitSuccess ? (
                <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-4">
                  <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="h-10 w-10" />
                  </div>
                  <h3 className="text-2xl font-bold font-heading text-gray-900">
                    Application Successfully Submitted!
                  </h3>
                  <p className="text-gray-700 max-w-lg mx-auto text-sm sm:text-base">
                    Thank you, <strong>{formData.applicant_name}</strong>! We have received your application for the{" "}
                    <strong>{job.title}</strong> role at Gate Hypermarket.
                  </p>
                  {applicationId && (
                    <div className="inline-block bg-white border border-emerald-200 rounded-xl px-4 py-2 text-xs font-mono text-emerald-800">
                      Application ID: #{applicationId}
                    </div>
                  )}
                  <p className="text-xs text-gray-500">
                    A confirmation has been recorded. Our team will review your profile and reach out via phone or email for interview scheduling.
                  </p>
                  <div className="pt-4 flex items-center justify-center gap-4">
                    <Link
                      to="/careers"
                      className="rounded-full bg-[#007BB5] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-[#006699] transition-all"
                    >
                      Browse More Jobs
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  {submitError && (
                    <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  {/* Name & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="applicant_name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="applicant_name"
                        name="applicant_name"
                        type="text"
                        required
                        placeholder="e.g. Rahul Sharma / Fatima Al Zaabi"
                        value={formData.applicant_name}
                        onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="applicant_email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="applicant_email"
                        name="email"
                        type="email"
                        required
                        placeholder="e.g. candidate@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Phone & Current City */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="applicant_phone" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="applicant_phone"
                        name="phone"
                        type="tel"
                        required
                        placeholder="+971 50 000 0000"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label htmlFor="applicant_current_city" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Current City <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="applicant_current_city"
                        name="current_city"
                        value={formData.current_city}
                        onChange={(e) => setFormData({ ...formData, current_city: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm bg-white focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                      >
                        <option value="Dubai">Dubai, UAE</option>
                        <option value="Ajman">Ajman, UAE</option>
                        <option value="Sharjah">Sharjah, UAE</option>
                        <option value="Abu Dhabi">Abu Dhabi, UAE</option>
                        <option value="Other UAE">Other UAE Emirate</option>
                        <option value="Outside UAE">Outside UAE (Ready to relocate)</option>
                      </select>
                    </div>
                  </div>

                  {/* Experience & Notice Period */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="applicant_experience_years" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Total Experience
                      </label>
                      <select
                        id="applicant_experience_years"
                        name="experience_years"
                        value={formData.experience_years}
                        onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm bg-white focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                      >
                        <option value="Fresher / Entry Level">Fresher / Entry Level (0-1 yr)</option>
                        <option value="1 - 2 Years">1 - 2 Years</option>
                        <option value="3 - 5 Years">3 - 5 Years</option>
                        <option value="5 - 8 Years">5 - 8 Years</option>
                        <option value="8+ Years">8+ Years</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="applicant_notice_period" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                        Availability / Notice Period
                      </label>
                      <select
                        id="applicant_notice_period"
                        name="notice_period"
                        value={formData.notice_period}
                        onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
                        className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm bg-white focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                      >
                        <option value="Immediate">Immediate / Within 1 week</option>
                        <option value="15 Days">15 Days</option>
                        <option value="30 Days">30 Days</option>
                        <option value="60 Days">60 Days</option>
                      </select>
                    </div>
                  </div>

                  {/* LinkedIn / Portfolio */}
                  <div>
                    <label htmlFor="applicant_linkedin_url" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      LinkedIn / Portfolio URL <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <input
                      id="applicant_linkedin_url"
                      name="linkedin_url"
                      type="url"
                      placeholder="https://linkedin.com/in/username"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                    />
                  </div>

                  {/* Resume Upload Box */}
                  <div>
                    <label htmlFor="job-resume-upload" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Upload Resume / CV <span className="text-red-500">*</span>
                    </label>
                    <div
                      className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all ${resumeUrl
                          ? "border-emerald-500 bg-emerald-50/40"
                          : uploadError
                            ? "border-red-300 bg-red-50/30"
                            : "border-slate-300 hover:border-[#007BB5] bg-slate-50/50"
                        }`}
                    >
                      {uploadingResume ? (
                        <div className="py-4 flex flex-col items-center justify-center gap-2">
                          <Loader2 className="h-8 w-8 text-[#007BB5] animate-spin" />
                          <p className="text-xs font-semibold text-gray-600">Uploading resume document...</p>
                        </div>
                      ) : resumeUrl ? (
                        <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-emerald-200">
                          <div className="flex items-center gap-3 overflow-hidden text-left">
                            <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5" />
                            </div>
                            <div className="truncate">
                              <p className="text-sm font-bold text-gray-900 truncate">
                                {resumeFile?.name || "Uploaded Resume Document"}
                              </p>
                              <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1">
                                <Check className="h-3 w-3" /> Ready for submission
                              </span>
                            </div>
                          </div>
                          <label htmlFor="job-resume-change" className="cursor-pointer text-xs font-bold text-[#007BB5] hover:underline px-3 py-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0">
                            Change File
                            <input
                              id="job-resume-change"
                              name="resume_change"
                              type="file"
                              accept=".pdf,.doc,.docx,.rtf"
                              className="hidden"
                              onChange={handleFileChange}
                              aria-label="Change uploaded resume file"
                            />
                          </label>
                        </div>
                      ) : (
                        <div>
                          <Upload className="mx-auto h-9 w-9 text-gray-400 mb-2" />
                          <p className="text-sm font-bold text-gray-800">
                            Attach your resume file
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX up to 15MB</p>
                          <label htmlFor="job-resume-upload" className="mt-4 inline-block cursor-pointer rounded-full bg-[#007BB5] px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-[#006699] transition-all">
                            Browse File
                            <input
                              id="job-resume-upload"
                              name="resume_file"
                              type="file"
                              accept=".pdf,.doc,.docx,.rtf"
                              className="hidden"
                              onChange={handleFileChange}
                              aria-label="Upload resume file"
                            />
                          </label>
                        </div>
                      )}
                      {uploadError && <p className="mt-2 text-xs text-red-600 font-medium">{uploadError}</p>}
                    </div>
                  </div>

                  {/* Cover Note */}
                  <div>
                    <label htmlFor="applicant_cover_note" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                      Cover Note / Personal Statement <span className="text-gray-400 font-normal lowercase">(optional)</span>
                    </label>
                    <textarea
                      id="applicant_cover_note"
                      name="cover_note"
                      rows={4}
                      placeholder="Why do you think you are a great match for this role at Gate Hypermarket?"
                      value={formData.cover_note}
                      onChange={(e) => setFormData({ ...formData, cover_note: e.target.value })}
                      className="w-full rounded-2xl border border-slate-300 p-4 text-sm focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={submitting || uploadingResume}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#E65100] px-10 py-4 text-base font-bold text-white shadow-xl shadow-[#E65100]/30 hover:bg-[#CC4700] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" /> Processing Submission...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" /> Submit Application Now
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Job Summary & Store Snapshot */}
          <div className="lg:col-span-4 space-y-6">
            {/* Job Summary Card */}
            <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-sm border border-slate-200">
              <h3 className="text-base font-bold uppercase tracking-wider text-gray-900 mb-5 pb-3 border-b border-slate-100">
                Job Overview Snapshot
              </h3>
              <div className="space-y-4 text-sm">
                <div>
                  <span className="block text-xs text-gray-400 font-medium">Department</span>
                  <span className="font-semibold text-gray-800">{job.department}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-medium">Location</span>
                  <span className="font-semibold text-gray-800">{job.location}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-medium">Employment Type</span>
                  <span className="font-semibold text-gray-800">{job.job_type}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-medium">Required Experience</span>
                  <span className="font-semibold text-gray-800">{job.experience_level || "1 - 2 Years"}</span>
                </div>
                {job.salary_range && (
                  <div>
                    <span className="block text-xs text-gray-400 font-medium">Salary Package</span>
                    <span className="font-bold text-[#E65100]">{job.salary_range}</span>
                  </div>
                )}
                {job.openings > 0 && (
                  <div>
                    <span className="block text-xs text-gray-400 font-medium">Open Positions</span>
                    <span className="font-semibold text-gray-800">{job.openings} Openings</span>
                  </div>
                )}
                {job.deadline && (
                  <div>
                    <span className="block text-xs text-gray-400 font-medium">Application Deadline</span>
                    <span className="font-semibold text-gray-800">{job.deadline}</span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-slate-100">
                <a
                  href="#apply-form-section"
                  className="block w-full rounded-2xl bg-[#007BB5] py-3 text-center text-sm font-bold text-white shadow-md shadow-[#007BB5]/20 hover:bg-[#006699] transition-all"
                >
                  Apply Directly
                </a>
              </div>
            </div>

            {/* Share this role */}
            <div className="rounded-3xl bg-white p-6 shadow-sm border border-slate-200">
              <h3 className="text-sm font-bold text-gray-900 mb-3">Know someone suitable?</h3>
              <p className="text-xs text-gray-500 mb-4">
                Share this job opening with your network or send directly via WhatsApp.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyLink}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-semibold text-gray-700 hover:bg-slate-100 transition-colors"
                >
                  {copiedLink ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
                  {copiedLink ? "Link Copied!" : "Copy Link"}
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Check out this job opening at Gate Hypermarket: ${job.title} - ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 py-2.5 text-xs font-bold text-white shadow hover:bg-emerald-600 transition-colors"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            {/* Support / Help */}
            <div className="rounded-3xl bg-[#0B1A22] p-6 text-white shadow-lg">
              <h3 className="text-base font-bold font-heading text-white">Questions about careers?</h3>
              <p className="mt-2 text-xs text-white/60 leading-relaxed">
                Contact our HR operations team directly for questions regarding visas, interview processes, or branch locations.
              </p>
              <div className="mt-4 space-y-2 text-xs">
                <a
                  href="mailto:hr@gateuae.com"
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <Mail className="h-4 w-4 text-[#4CC9F0]" /> hr@gateuae.com
                </a>
                <Link
                  to="/contact"
                  className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
                >
                  <Phone className="h-4 w-4 text-[#E65100]" /> Contact Customer Care
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
