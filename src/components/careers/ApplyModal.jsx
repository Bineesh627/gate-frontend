import React, { useState } from "react";
import {
  X,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  MapPin,
  Clock,
  Send,
  Loader2,
  Check,
} from "lucide-react";
import { marketApi } from "@/api/marketApi";

export default function ApplyModal({ job, isOpen, onClose, onApplySuccess }) {
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

  if (!isOpen || !job) return null;

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 15MB
    if (file.size > 15 * 1024 * 1024) {
      setUploadError("File size must be under 15MB.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError("");

    if (!formData.applicant_name.trim()) {
      setSubmitError("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setSubmitError("Please enter a valid email address.");
      return;
    }
    if (!formData.phone.trim()) {
      setSubmitError("Please enter your contact phone or WhatsApp number.");
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
        if (onApplySuccess) onApplySuccess(res.applicationId);
      } else {
        setSubmitError(res?.message || "Failed to submit application.");
      }
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitSuccess(false);
    setFormData({
      applicant_name: "",
      email: "",
      phone: "",
      current_city: "Dubai",
      experience_years: "1 - 2 Years",
      notice_period: "Immediate",
      cover_note: "",
      linkedin_url: "",
    });
    setResumeFile(null);
    setResumeUrl("");
    setSubmitError("");
    setUploadError("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-black/5 overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#07131B] via-[#0B2230] to-[#007BB5] p-6 text-white relative">
          <button
            onClick={handleResetAndClose}
            className="absolute top-5 right-5 h-9 w-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-white/15 text-[#4CC9F0] tracking-wide uppercase mb-2">
            Job Application
          </span>
          <h2 className="text-xl sm:text-2xl font-bold font-heading">{job.title}</h2>
          <div className="mt-2 flex flex-wrap gap-4 text-xs sm:text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <Briefcase className="h-4 w-4 text-[#E65100]" /> {job.department}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-[#4CC9F0]" /> {job.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-emerald-400" /> {job.job_type}
            </span>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 max-h-[75vh] overflow-y-auto">
          {submitSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 font-heading">
                Application Received!
              </h3>
              <p className="text-gray-600 max-w-md mx-auto text-sm sm:text-base">
                Thank you, <strong className="text-gray-900">{formData.applicant_name}</strong>! Your application for{" "}
                <strong className="text-[#007BB5]">{job.title}</strong> has been successfully submitted.
              </p>
              {applicationId && (
                <div className="inline-block bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-gray-500 font-mono">
                  Application Reference ID: #{applicationId}
                </div>
              )}
              <p className="text-xs text-gray-500">
                Our HR recruitment team will review your profile and reach out via email or phone if shortlisted for interviews.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="rounded-full bg-[#007BB5] px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-[#007BB5]/30 hover:bg-[#006699] transition-all"
                >
                  Done & Close
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Personal Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-applicant-name" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-applicant-name"
                    name="applicant_name"
                    type="text"
                    required
                    placeholder="e.g. Mohammed Rashid"
                    value={formData.applicant_name}
                    onChange={(e) => setFormData({ ...formData, applicant_name: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="modal-email" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-email"
                    name="email"
                    type="email"
                    required
                    placeholder="e.g. rashid@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-phone" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Phone / WhatsApp Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="modal-phone"
                    name="phone"
                    type="tel"
                    required
                    placeholder="+971 50 123 4567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="modal-city" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Current Location / City <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="modal-city"
                    name="current_city"
                    value={formData.current_city}
                    onChange={(e) => setFormData({ ...formData, current_city: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                  >
                    <option value="Dubai">Dubai, UAE</option>
                    <option value="Ajman">Ajman, UAE</option>
                    <option value="Sharjah">Sharjah, UAE</option>
                    <option value="Abu Dhabi">Abu Dhabi, UAE</option>
                    <option value="Ras Al Khaimah">Ras Al Khaimah, UAE</option>
                    <option value="Outside UAE / Relocating">Outside UAE / Ready to relocate</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="modal-experience" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Total Experience
                  </label>
                  <select
                    id="modal-experience"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={(e) => setFormData({ ...formData, experience_years: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                  >
                    <option value="Fresher / Entry Level">Fresher / Entry Level (0 - 1 Year)</option>
                    <option value="1 - 2 Years">1 - 2 Years</option>
                    <option value="3 - 5 Years">3 - 5 Years</option>
                    <option value="5 - 8 Years">5 - 8 Years</option>
                    <option value="8+ Years">8+ Years</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="modal-notice" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Notice Period / Availability
                  </label>
                  <select
                    id="modal-notice"
                    name="notice_period"
                    value={formData.notice_period}
                    onChange={(e) => setFormData({ ...formData, notice_period: e.target.value })}
                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm bg-white focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                  >
                    <option value="Immediate">Immediate / Ready to join</option>
                    <option value="15 Days">15 Days</option>
                    <option value="1 Month">1 Month</option>
                    <option value="2 Months">2 Months</option>
                  </select>
                </div>
              </div>

              {/* LinkedIn / Portfolio */}
              <div>
                <label htmlFor="modal-linkedin" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  LinkedIn or Portfolio URL <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  id="modal-linkedin"
                  name="linkedin_url"
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={formData.linkedin_url}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                />
              </div>

              {/* Resume Upload Box */}
              <div>
                <label htmlFor="modal-resume-upload" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Upload Resume / CV <span className="text-red-500">*</span>
                </label>
                <div
                  className={`border-2 border-dashed rounded-2xl p-5 text-center transition-all ${
                    resumeUrl
                      ? "border-emerald-500 bg-emerald-50/50"
                      : uploadError
                      ? "border-red-300 bg-red-50/30"
                      : "border-gray-300 hover:border-[#007BB5] bg-gray-50/50"
                  }`}
                >
                  {uploadingResume ? (
                    <div className="py-3 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 text-[#007BB5] animate-spin" />
                      <p className="text-xs font-medium text-gray-600">Uploading your document...</p>
                    </div>
                  ) : resumeUrl ? (
                    <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-emerald-200">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="h-10 w-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="text-left truncate">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {resumeFile?.name || "Resume document uploaded"}
                          </p>
                          <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
                            <Check className="h-3 w-3" /> Ready to submit
                          </span>
                        </div>
                      </div>
                      <label htmlFor="modal-resume-replace" className="cursor-pointer text-xs font-semibold text-[#007BB5] hover:underline px-3 py-1.5 rounded-lg hover:bg-slate-100 flex-shrink-0">
                        Replace
                        <input
                          id="modal-resume-replace"
                          name="resume_replace"
                          type="file"
                          accept=".pdf,.doc,.docx,.rtf"
                          className="hidden"
                          onChange={handleFileChange}
                          aria-label="Replace uploaded resume file"
                        />
                      </label>
                    </div>
                  ) : (
                    <div>
                      <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className="text-sm font-semibold text-gray-800">
                        Choose a resume file or drag & drop here
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX up to 15MB</p>
                      <label htmlFor="modal-resume-upload" className="mt-3 inline-block cursor-pointer rounded-full bg-[#007BB5] px-5 py-2 text-xs font-semibold text-white shadow hover:bg-[#006699] transition-all">
                        Browse Computer
                        <input
                          id="modal-resume-upload"
                          name="resume_file"
                          type="file"
                          accept=".pdf,.doc,.docx,.rtf"
                          className="hidden"
                          onChange={handleFileChange}
                          aria-label="Browse and upload resume file"
                        />
                      </label>
                    </div>
                  )}
                  {uploadError && <p className="mt-2 text-xs text-red-600">{uploadError}</p>}
                </div>
              </div>

              {/* Cover Note */}
              <div>
                <label htmlFor="modal-cover-note" className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                  Brief Note to Hiring Team <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <textarea
                  id="modal-cover-note"
                  name="cover_note"
                  rows={3}
                  placeholder="Share a short note about your experience and why you want to work at Gate Hypermarket..."
                  value={formData.cover_note}
                  onChange={(e) => setFormData({ ...formData, cover_note: e.target.value })}
                  className="w-full rounded-xl border border-gray-300 p-3.5 text-sm focus:border-[#007BB5] focus:ring-2 focus:ring-[#007BB5]/20 outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-gray-300 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingResume}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#E65100] px-8 py-3 text-sm font-bold text-white shadow-lg shadow-[#E65100]/30 hover:bg-[#CC4700] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Submit Application
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
