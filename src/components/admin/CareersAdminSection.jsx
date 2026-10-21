import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Users,
  Plus,
  Search,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  FileText,
  Download,
  ExternalLink,
  Check,
  X,
  Loader2,
  Mail,
  Phone,
  Award,
} from "lucide-react";
import { marketApi } from "@/api/marketApi";


const STATUS_OPTIONS = [
  { value: "pending", label: "Pending Review", color: "bg-amber-100 text-amber-800 border-amber-300" },
  { value: "reviewed", label: "Reviewed", color: "bg-blue-100 text-blue-800 border-blue-300" },
  { value: "shortlisted", label: "Shortlisted", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  { value: "rejected", label: "Rejected", color: "bg-rose-100 text-rose-800 border-rose-300" },
  { value: "hired", label: "Hired", color: "bg-purple-100 text-purple-800 border-purple-300" },
];

export default function CareersAdminSection({
  showToast,
  onPendingCountChange,
  currentSubTab = "jobs",
  onSubTabChange,
}) {
  // Navigation inside Careers: "jobs" or "applications"
  const [subTab, setSubTab] = useState(currentSubTab || "jobs");

  useEffect(() => {
    if (currentSubTab && currentSubTab !== subTab) {
      setSubTab(currentSubTab);
    }
  }, [currentSubTab]);

  const handleTabChange = (newTab) => {
    setSubTab(newTab);
    if (onSubTabChange) onSubTabChange(newTab);
  };

  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [jobSearch, setJobSearch] = useState("");
  const [jobDeptFilter, setJobDeptFilter] = useState("all");
  const [jobStatusFilter, setJobStatusFilter] = useState("all");

  // Stores state for real-time location selection
  const [stores, setStores] = useState([]);
  const [loadingStores, setLoadingStores] = useState(false);

  // Department and Location custom/manual entry toggles
  const [isAddingNewDept, setIsAddingNewDept] = useState(false);
  const [isCustomLocation, setIsCustomLocation] = useState(false);

  // Dynamic departments derived from existing jobs in the database
  const allDepartments = Array.from(
    new Set(
      jobs
        .map((j) => j.department?.trim())
        .filter(Boolean)
    )
  ).sort();

  // Job Modal state (Create / Edit)
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [savingJob, setSavingJob] = useState(false);
  const [jobForm, setJobForm] = useState({
    title: "",
    slug: "",
    department: "",
    location: "",
    job_type: "Full-Time",
    experience_level: "1 - 2 Years",
    salary_range: "",
    openings: 1,
    deadline: "",
    description: "",
    responsibilitiesText: "",
    requirementsText: "",
    benefitsText: "",
    is_active: true,
  });

  // Applications state
  const [applications, setApplications] = useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [appSearch, setAppSearch] = useState("");
  const [appJobFilter, setAppJobFilter] = useState("all");
  const [appStatusFilter, setAppStatusFilter] = useState("all");

  // Detailed Applicant View Modal
  const [selectedApp, setSelectedApp] = useState(null);
  const [appDetailModalOpen, setAppDetailModalOpen] = useState(false);
  const [updatingAppStatus, setUpdatingAppStatus] = useState(false);
  const [adminNotesInput, setAdminNotesInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);

  // Initial load
  useEffect(() => {
    loadJobs();
    loadApplications();
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      setLoadingStores(true);
      const res = await marketApi.getStores();
      if (res?.success) {
        setStores(res.stores || []);
      }
    } catch (err) {
      console.error("Error loading stores in CareersAdminSection:", err);
    } finally {
      setLoadingStores(false);
    }
  };

  const loadJobs = async () => {
    try {
      setLoadingJobs(true);
      const res = await marketApi.adminGetJobs();
      if (res?.success) {
        setJobs(res.jobs || []);
      }
    } catch (err) {
      console.error("Error fetching admin jobs:", err);
      showToast?.("Failed to load jobs list.");
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadApplications = async () => {
    try {
      setLoadingApps(true);
      const res = await marketApi.adminGetApplications();
      if (res?.success) {
        const apps = res.applications || [];
        setApplications(apps);
        // Calculate pending count
        const pendingCount = apps.filter((a) => a.status === "pending").length;
        if (onPendingCountChange) onPendingCountChange(pendingCount);
      }
    } catch (err) {
      console.error("Error fetching admin applications:", err);
      showToast?.("Failed to load applications list.");
    } finally {
      setLoadingApps(false);
    }
  };

  // ==========================================
  // JOBS ACTIONS
  // ==========================================
  const openNewJobModal = () => {
    setEditingJob(null);
    setIsAddingNewDept(allDepartments.length === 0);
    setIsCustomLocation(false);
    const defaultLocation = stores[0]?.name
      ? `${stores[0].name}${stores[0].city ? `, ${stores[0].city}` : ""}`
      : "";
    setJobForm({
      title: "",
      slug: "",
      department: allDepartments[0] || "",
      location: defaultLocation,
      job_type: "Full-Time",
      experience_level: "1 - 2 Years",
      salary_range: "",
      openings: 1,
      deadline: "",
      description: "",
      responsibilitiesText: "",
      requirementsText: "",
      benefitsText: "",
      is_active: true,
    });
    setJobModalOpen(true);
  };

  const openEditJobModal = (j) => {
    setEditingJob(j);
    const resp = Array.isArray(j.responsibilities) ? j.responsibilities.join("\n") : (j.responsibilities || "");
    const req = Array.isArray(j.requirements) ? j.requirements.join("\n") : (j.requirements || "");
    const ben = Array.isArray(j.benefits) ? j.benefits.join("\n") : (j.benefits || "");

    const knownStoreNames = stores.map((s) => s.name + (s.city ? `, ${s.city}` : ""));
    const isCustom =
      j.location &&
      !knownStoreNames.includes(j.location) &&
      j.location !== "Corporate Head Office — Dubai" &&
      j.location !== "All Branches / Multiple Locations";
    setIsCustomLocation(Boolean(isCustom));

    const isKnownDept = allDepartments.includes(j.department?.trim());
    setIsAddingNewDept(Boolean(!isKnownDept && j.department));

    setJobForm({
      title: j.title || "",
      slug: j.slug || "",
      department: j.department || "",
      location: j.location || "",
      job_type: j.job_type || "Full-Time",
      experience_level: j.experience_level || "1 - 2 Years",
      salary_range: j.salary_range || "",
      openings: j.openings || 1,
      deadline: j.deadline || "",
      description: j.description || "",
      responsibilitiesText: resp,
      requirementsText: req,
      benefitsText: ben,
      is_active: Boolean(j.is_active),
    });
    setJobModalOpen(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title.trim() || !jobForm.description.trim()) {
      alert("Job Title and Description are required.");
      return;
    }

    setSavingJob(true);
    try {
      const payload = {
        title: jobForm.title,
        slug: jobForm.slug,
        department: jobForm.department,
        location: jobForm.location,
        job_type: jobForm.job_type,
        experience_level: jobForm.experience_level,
        salary_range: jobForm.salary_range,
        openings: Number(jobForm.openings) || 1,
        deadline: jobForm.deadline,
        description: jobForm.description,
        responsibilities: jobForm.responsibilitiesText.split("\n").map((s) => s.trim()).filter(Boolean),
        requirements: jobForm.requirementsText.split("\n").map((s) => s.trim()).filter(Boolean),
        benefits: jobForm.benefitsText.split("\n").map((s) => s.trim()).filter(Boolean),
        is_active: jobForm.is_active,
      };

      if (editingJob) {
        await marketApi.adminUpdateJob(editingJob.id, payload);
        showToast?.(`Job "${jobForm.title}" updated successfully.`);
      } else {
        await marketApi.adminCreateJob(payload);
        showToast?.(`New job posting "${jobForm.title}" created.`);
      }

      setJobModalOpen(false);
      loadJobs();
    } catch (err) {
      alert(err.message || "Failed to save job posting.");
    } finally {
      setSavingJob(false);
    }
  };

  const handleToggleJob = async (jobId) => {
    try {
      const res = await marketApi.adminToggleJob(jobId);
      if (res?.success) {
        showToast?.(res.message);
        setJobs((prev) =>
          prev.map((j) => (j.id === jobId ? { ...j, is_active: res.is_active ? 1 : 0 } : j))
        );
      }
    } catch (err) {
      alert(err.message || "Failed to toggle status.");
    }
  };

  const handleDeleteJob = async (jobId, title) => {
    if (!window.confirm(`Are you sure you want to delete the job "${title}" and all its submitted applications?`)) {
      return;
    }

    try {
      await marketApi.adminDeleteJob(jobId);
      showToast?.(`Job "${title}" deleted.`);
      loadJobs();
      loadApplications();
    } catch (err) {
      alert(err.message || "Failed to delete job.");
    }
  };

  // Jump to applications filtered by this job
  const handleViewJobApplications = (jobId) => {
    setAppJobFilter(String(jobId));
    handleTabChange("applications");
  };

  // ==========================================
  // APPLICATIONS ACTIONS
  // ==========================================
  const openApplicantDetailModal = (app) => {
    setSelectedApp(app);
    setAdminNotesInput(app.admin_notes || "");
    setAppDetailModalOpen(true);
  };

  const handleUpdateStatus = async (appId, newStatus) => {
    try {
      setUpdatingAppStatus(true);
      await marketApi.adminUpdateApplicationStatus(appId, newStatus, adminNotesInput);
      showToast?.(`Application status updated to "${newStatus}".`);
      
      // Update local state
      setApplications((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus, admin_notes: adminNotesInput } : a))
      );
      if (selectedApp?.id === appId) {
        setSelectedApp((prev) => ({ ...prev, status: newStatus, admin_notes: adminNotesInput }));
      }
      // Re-calculate pending count
      const updatedApps = applications.map((a) => (a.id === appId ? { ...a, status: newStatus } : a));
      const pendingCount = updatedApps.filter((a) => a.status === "pending").length;
      if (onPendingCountChange) onPendingCountChange(pendingCount);
    } catch (err) {
      alert(err.message || "Failed to update status.");
    } finally {
      setUpdatingAppStatus(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedApp) return;
    try {
      setSavingNotes(true);
      await marketApi.adminUpdateApplicationStatus(selectedApp.id, selectedApp.status, adminNotesInput);
      showToast?.("Internal recruitment notes saved.");
      setApplications((prev) =>
        prev.map((a) => (a.id === selectedApp.id ? { ...a, admin_notes: adminNotesInput } : a))
      );
      setSelectedApp((prev) => ({ ...prev, admin_notes: adminNotesInput }));
    } catch (err) {
      alert(err.message || "Failed to save notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDeleteApplication = async (appId, name) => {
    if (!window.confirm(`Delete application submitted by "${name}"?`)) return;

    try {
      await marketApi.adminDeleteApplication(appId);
      showToast?.(`Application of "${name}" deleted.`);
      if (selectedApp?.id === appId) {
        setAppDetailModalOpen(false);
        setSelectedApp(null);
      }
      loadApplications();
    } catch (err) {
      alert(err.message || "Failed to delete application.");
    }
  };

  // Filtered jobs
  const filteredJobs = jobs.filter((j) => {
    const matchSearch =
      !jobSearch.trim() ||
      j.title.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.department.toLowerCase().includes(jobSearch.toLowerCase()) ||
      j.location.toLowerCase().includes(jobSearch.toLowerCase());

    const matchDept = jobDeptFilter === "all" || j.department === jobDeptFilter;
    const matchStatus =
      jobStatusFilter === "all" ||
      (jobStatusFilter === "active" && j.is_active) ||
      (jobStatusFilter === "inactive" && !j.is_active);

    return matchSearch && matchDept && matchStatus;
  });

  // Filtered applications
  const filteredApps = applications.filter((a) => {
    const matchSearch =
      !appSearch.trim() ||
      a.applicant_name.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.email.toLowerCase().includes(appSearch.toLowerCase()) ||
      a.phone.includes(appSearch) ||
      a.job_title.toLowerCase().includes(appSearch.toLowerCase());

    const matchJob = appJobFilter === "all" || String(a.job_id) === String(appJobFilter);
    const matchStatus = appStatusFilter === "all" || a.status === appStatusFilter;

    return matchSearch && matchJob && matchStatus;
  });

  const pendingAppsCount = applications.filter((a) => a.status === "pending").length;
  const shortlistedCount = applications.filter((a) => a.status === "shortlisted").length;
  const activeJobsCount = jobs.filter((j) => j.is_active).length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-6 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#007BB5]/10 px-3 py-1 text-xs font-bold text-[#007BB5] mb-2">
              <Briefcase className="h-3.5 w-3.5" /> HR &amp; Recruitment Management
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-slate-900">
              Careers &amp; Job Applications
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Create and manage job postings, review applicant CVs, and track candidate interview statuses.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={openNewJobModal}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#E65100] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#E65100]/25 hover:bg-[#CC4700] hover:-translate-y-0.5 transition-all"
            >
              <Plus className="h-4 w-4" /> Post New Job
            </button>
          </div>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Total Positions</span>
              <Briefcase className="h-4 w-4 text-[#007BB5]" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{jobs.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">{activeJobsCount} Active Postings</div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-slate-400">Total Applicants</span>
              <Users className="h-4 w-4 text-[#E65100]" />
            </div>
            <div className="mt-2 text-2xl font-black text-slate-900">{applications.length}</div>
            <div className="text-xs text-slate-500 mt-0.5">Across all departments</div>
          </div>

          <div className="rounded-2xl border border-amber-200/80 bg-amber-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-amber-700">Pending Review</span>
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-amber-900">{pendingAppsCount}</div>
            <div className="text-xs text-amber-700 mt-0.5">Awaiting initial check</div>
          </div>

          <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/60 p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-emerald-700">Shortlisted</span>
              <Award className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 text-2xl font-black text-emerald-900">{shortlistedCount}</div>
            <div className="text-xs text-emerald-700 mt-0.5">For interview rounds</div>
          </div>
        </div>

        {/* Sub-tabs Toggle */}
        <div className="mt-8 flex border-b border-slate-200">
          <button
            onClick={() => handleTabChange("jobs")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all ${
              subTab === "jobs"
                ? "border-[#007BB5] text-[#007BB5]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Briefcase className="h-4 w-4" />
            Job Openings ({jobs.length})
          </button>
          <button
            onClick={() => handleTabChange("applications")}
            className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold border-b-2 transition-all relative ${
              subTab === "applications"
                ? "border-[#007BB5] text-[#007BB5]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Users className="h-4 w-4" />
            Job Applications ({applications.length})
            {pendingAppsCount > 0 && (
              <span className="ml-1 rounded-full bg-amber-500 px-2 py-0.5 text-[11px] font-bold text-white">
                {pendingAppsCount} new
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================
          SUB-TAB 1: JOB OPENINGS MANAGEMENT
      ======================================================== */}
      {subTab === "jobs" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <label htmlFor="admin-job-search" className="sr-only">
                Search jobs
              </label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="admin-job-search"
                name="jobSearch"
                type="text"
                placeholder="Search job title, location, department..."
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                aria-label="Search job title, location, department"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-[#007BB5]"
              />
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="admin-job-dept-filter" className="sr-only">
                Filter by department
              </label>
              <select
                id="admin-job-dept-filter"
                name="jobDeptFilter"
                value={jobDeptFilter}
                onChange={(e) => setJobDeptFilter(e.target.value)}
                aria-label="Filter by department"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-white text-slate-700 outline-none focus:border-[#007BB5]"
              >
                <option value="all">All Departments</option>
                {allDepartments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>

              <label htmlFor="admin-job-status-filter" className="sr-only">
                Filter by status
              </label>
              <select
                id="admin-job-status-filter"
                name="jobStatusFilter"
                value={jobStatusFilter}
                onChange={(e) => setJobStatusFilter(e.target.value)}
                aria-label="Filter by status"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-white text-slate-700 outline-none focus:border-[#007BB5]"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>

          {/* Jobs Table */}
          {loadingJobs ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#007BB5] mb-2" />
              Loading job postings...
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-400">
              <Briefcase className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No jobs found matching criteria</p>
              <button
                onClick={openNewJobModal}
                className="mt-3 text-xs font-bold text-[#007BB5] hover:underline"
              >
                + Create New Job Opening
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
                    <th className="pb-3 pr-4">Job Title &amp; Dept</th>
                    <th className="pb-3 pr-4">Branch Location</th>
                    <th className="pb-3 pr-4">Type / Exp</th>
                    <th className="pb-3 pr-4">Salary Package</th>
                    <th className="pb-3 pr-4 text-center">Applicants</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredJobs.map((j) => (
                    <tr key={j.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 pr-4">
                        <span className="font-bold text-slate-900 block">{j.title}</span>
                        <span className="inline-block mt-0.5 text-xs text-[#007BB5] font-semibold">
                          {j.department}
                        </span>
                      </td>

                      <td className="py-4 pr-4 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-[#E65100]" />
                          {j.location}
                        </span>
                        {j.deadline && (
                          <span className="text-[11px] text-slate-400 block mt-0.5">
                            Due: {j.deadline}
                          </span>
                        )}
                      </td>

                      <td className="py-4 pr-4 text-xs text-slate-600">
                        <span className="font-semibold block text-slate-800">{j.job_type}</span>
                        <span className="text-slate-400 text-[11px]">Exp: {j.experience_level}</span>
                      </td>

                      <td className="py-4 pr-4 text-xs font-medium text-slate-700">
                        {j.salary_range || <span className="text-slate-400 italic">Not specified</span>}
                      </td>

                      <td className="py-4 pr-4 text-center">
                        <button
                          onClick={() => handleViewJobApplications(j.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                            j.applications_count > 0
                              ? "bg-sky-100 text-[#007BB5] hover:bg-sky-200"
                              : "bg-slate-100 text-slate-500"
                          }`}
                          title="View applicants for this job"
                        >
                          <Users className="h-3.5 w-3.5" />
                          {j.applications_count}
                          {j.pending_count > 0 && (
                            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                          )}
                        </button>
                      </td>

                      <td className="py-4 pr-4">
                        <button
                          onClick={() => handleToggleJob(j.id)}
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            j.is_active
                              ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                          }`}
                          title="Click to toggle active status"
                        >
                          {j.is_active ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Active
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 text-slate-400" /> Inactive
                            </>
                          )}
                        </button>
                      </td>

                      <td className="py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => openEditJobModal(j)}
                          className="rounded-xl border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 hover:text-[#007BB5]"
                          title="Edit Job"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteJob(j.id, j.title)}
                          className="rounded-xl border border-red-200 p-2 text-red-600 hover:bg-red-50"
                          title="Delete Job"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: CANDIDATE APPLICATIONS VIEWER
      ======================================================== */}
      {subTab === "applications" && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <label htmlFor="admin-app-search" className="sr-only">
                Search candidates
              </label>
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                id="admin-app-search"
                name="appSearch"
                type="text"
                placeholder="Search candidate name, email, phone, role..."
                value={appSearch}
                onChange={(e) => setAppSearch(e.target.value)}
                aria-label="Search candidate name, email, phone, role"
                className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-xs sm:text-sm outline-none focus:border-[#007BB5]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label htmlFor="admin-app-job-filter" className="sr-only">
                Filter by job
              </label>
              <select
                id="admin-app-job-filter"
                name="appJobFilter"
                value={appJobFilter}
                onChange={(e) => setAppJobFilter(e.target.value)}
                aria-label="Filter by job"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-white text-slate-700 outline-none focus:border-[#007BB5]"
              >
                <option value="all">All Jobs</option>
                {jobs.map((j) => (
                  <option key={j.id} value={String(j.id)}>
                    {j.title}
                  </option>
                ))}
              </select>

              <label htmlFor="admin-app-status-filter" className="sr-only">
                Filter by application status
              </label>
              <select
                id="admin-app-status-filter"
                name="appStatusFilter"
                value={appStatusFilter}
                onChange={(e) => setAppStatusFilter(e.target.value)}
                aria-label="Filter by application status"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-xs bg-white text-slate-700 outline-none focus:border-[#007BB5]"
              >
                <option value="all">All Statuses</option>
                {STATUS_OPTIONS.map((st) => (
                  <option key={st.value} value={st.value}>
                    {st.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Applications Table */}
          {loadingApps ? (
            <div className="py-16 text-center text-slate-400">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#007BB5] mb-2" />
              Loading applicant records...
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 py-12 text-center text-slate-400">
              <Users className="h-10 w-10 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-semibold text-slate-600">No applications match the filters</p>
              <p className="text-xs text-slate-400 mt-1">
                Applicants who apply from the front-end will appear here in real-time.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold uppercase text-slate-400">
                    <th className="pb-3 pr-4">Applicant</th>
                    <th className="pb-3 pr-4">Applied Position</th>
                    <th className="pb-3 pr-4">Experience / City</th>
                    <th className="pb-3 pr-4">Date Applied</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Resume</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredApps.map((a) => {
                    const statusObj = STATUS_OPTIONS.find((s) => s.value === a.status) || STATUS_OPTIONS[0];

                    return (
                      <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 pr-4">
                          <span className="font-bold text-slate-900 block">{a.applicant_name}</span>
                          <div className="flex flex-col text-xs text-slate-500">
                            <a href={`mailto:${a.email}`} className="text-[#007BB5] hover:underline">
                              {a.email}
                            </a>
                            <a href={`tel:${a.phone}`} className="text-slate-600 hover:text-slate-900">
                              {a.phone}
                            </a>
                          </div>
                        </td>

                        <td className="py-4 pr-4 text-xs">
                          <span className="font-bold text-slate-800 block">{a.job_title}</span>
                          <span className="text-slate-400">{a.job_department || "Department"}</span>
                        </td>

                        <td className="py-4 pr-4 text-xs text-slate-600">
                          <span className="block font-semibold">{a.experience_years || "Not specified"}</span>
                          <span className="text-slate-400">{a.current_city || "Dubai"}</span>
                        </td>

                        <td className="py-4 pr-4 text-xs text-slate-500 whitespace-nowrap">
                          {new Date(a.created_at).toLocaleDateString()}
                        </td>

                        <td className="py-4 pr-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${statusObj.color}`}
                          >
                            {statusObj.label}
                          </span>
                        </td>

                        <td className="py-4 pr-4">
                          {a.resume_url ? (
                            <a
                              href={marketApi.resolveAssetUrl(a.resume_url)}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-bold text-[#007BB5] hover:underline bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100"
                            >
                              <FileText className="h-3.5 w-3.5" /> View CV
                            </a>
                          ) : (
                            <span className="text-xs text-slate-400 italic">No CV</span>
                          )}
                        </td>

                        <td className="py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => openApplicantDetailModal(a)}
                            className="rounded-xl bg-[#007BB5] px-3.5 py-1.5 text-xs font-bold text-white shadow hover:bg-[#006699] transition-all inline-flex items-center gap-1"
                          >
                            <Eye className="h-3.5 w-3.5" /> Details
                          </button>
                          <button
                            onClick={() => handleDeleteApplication(a.id, a.applicant_name)}
                            className="rounded-xl border border-red-200 p-1.5 text-red-600 hover:bg-red-50"
                            title="Delete Application"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT JOB OPENING
      ======================================================== */}
      {jobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
            <button
              onClick={() => setJobModalOpen(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="font-heading text-2xl font-black text-slate-900 mb-1">
              {editingJob ? "Edit Job Posting" : "Create New Job Opening"}
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Configure job title, department, duties, requirements, and compensation details.
            </p>

            <form onSubmit={handleSaveJob} className="space-y-5">
              {/* Title & Slug */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="admin-job-title" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="admin-job-title"
                    name="title"
                    type="text"
                    required
                    placeholder="e.g. Fresh Produce Section Supervisor"
                    value={jobForm.title}
                    onChange={(e) => {
                      const title = e.target.value;
                      const slug = title
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, "-")
                        .replace(/(^-|-$)/g, "");
                      setJobForm({
                        ...jobForm,
                        title,
                        slug: editingJob ? jobForm.slug : slug,
                      });
                    }}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#007BB5]"
                  />
                </div>

                <div>
                  <label htmlFor="admin-job-slug" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    URL Slug
                  </label>
                  <input
                    id="admin-job-slug"
                    name="slug"
                    type="text"
                    placeholder="fresh-produce-supervisor"
                    value={jobForm.slug}
                    onChange={(e) => setJobForm({ ...jobForm, slug: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#007BB5] font-mono text-xs"
                  />
                </div>
              </div>

              {/* Department & Location */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor={isAddingNewDept || allDepartments.length === 0 ? "admin-job-dept-input" : "admin-job-dept-select"} className="block text-xs font-bold uppercase text-slate-600">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsAddingNewDept(!isAddingNewDept);
                        if (!isAddingNewDept) {
                          setJobForm({ ...jobForm, department: "" });
                        }
                      }}
                      className="text-xs font-semibold text-[#007BB5] hover:underline"
                    >
                      {isAddingNewDept ? (allDepartments.length > 0 ? "← Select Existing" : "") : "+ Add New Role/Dept"}
                    </button>
                  </div>

                  {isAddingNewDept || allDepartments.length === 0 ? (
                    <div>
                      <input
                        id="admin-job-dept-input"
                        name="department"
                        type="text"
                        required
                        placeholder="Type department/role name (e.g. Fresh Produce, Bakery, Cashier)"
                        value={jobForm.department}
                        onChange={(e) => setJobForm({ ...jobForm, department: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#007BB5]"
                      />
                      {allDepartments.length > 0 && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          Or click "Select Existing" above to pick from current roles.
                        </p>
                      )}
                    </div>
                  ) : (
                    <select
                      id="admin-job-dept-select"
                      name="department"
                      required
                      value={jobForm.department}
                      onChange={(e) => {
                        if (e.target.value === "__new__") {
                          setIsAddingNewDept(true);
                          setJobForm({ ...jobForm, department: "" });
                        } else {
                          setJobForm({ ...jobForm, department: e.target.value });
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#007BB5] bg-white text-slate-700"
                    >
                      <option value="">-- Select Department --</option>
                      {allDepartments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      <option value="__new__">+ Add New Department / Role...</option>
                    </select>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label htmlFor={isCustomLocation ? "admin-job-loc-input" : "admin-job-loc-select"} className="block text-xs font-bold uppercase text-slate-600">
                      Location / Store Branch <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomLocation(!isCustomLocation);
                        if (!isCustomLocation) {
                          setJobForm({ ...jobForm, location: "" });
                        }
                      }}
                      className="text-xs font-semibold text-[#007BB5] hover:underline"
                    >
                      {isCustomLocation ? "← Select Store Branch" : "+ Custom Location"}
                    </button>
                  </div>

                  {isCustomLocation ? (
                    <input
                      id="admin-job-loc-input"
                      name="location"
                      type="text"
                      required
                      placeholder="Type custom location (e.g. Central Warehouse, Al Quoz)"
                      value={jobForm.location}
                      onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#007BB5]"
                    />
                  ) : (
                    <select
                      id="admin-job-loc-select"
                      name="location"
                      required
                      value={jobForm.location}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomLocation(true);
                          setJobForm({ ...jobForm, location: "" });
                        } else {
                          setJobForm({ ...jobForm, location: e.target.value });
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none focus:border-[#007BB5] bg-white text-slate-700"
                    >
                      <option value="">-- Select Store Branch --</option>
                      {stores.length > 0 && (
                        <optgroup label="Real-time Store Branches">
                          {stores.map((s) => {
                            const val = s.name + (s.city ? `, ${s.city}` : "");
                            return (
                              <option key={s.id || s.slug} value={val}>
                                {s.name} {s.city ? `— ${s.city}` : ""}
                              </option>
                            );
                          })}
                        </optgroup>
                      )}
                      <optgroup label="General / Corporate">
                        <option value="Corporate Head Office — Dubai">Corporate Head Office — Dubai</option>
                        <option value="All Branches / Multiple Locations">All Branches / Multiple Locations</option>
                      </optgroup>
                      <option value="__custom__">+ Enter Custom Location...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Job Type, Experience, Salary */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label htmlFor="admin-job-type" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Employment Type
                  </label>
                  <select
                    id="admin-job-type"
                    name="job_type"
                    value={jobForm.job_type}
                    onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none bg-white"
                  >
                    <option value="">Select Employment Type</option>
                    <option value="Full-Time">Full-Time</option>
                    <option value="Part-Time">Part-Time</option>
                    <option value="Shift-Based">Shift-Based</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="admin-job-experience" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Required Experience
                  </label>
                  <input
                    id="admin-job-experience"
                    name="experience_level"
                    type="text"
                    placeholder="e.g. 1 - 2 Years"
                    value={jobForm.experience_level}
                    onChange={(e) => setJobForm({ ...jobForm, experience_level: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="admin-job-salary" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Salary Range (Monthly)
                  </label>
                  <input
                    id="admin-job-salary"
                    name="salary_range"
                    type="text"
                    placeholder="AED 3,500 – 4,500 / month"
                    value={jobForm.salary_range}
                    onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Openings & Deadline */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="admin-job-openings" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Number of Open Positions
                  </label>
                  <input
                    id="admin-job-openings"
                    name="openings"
                    type="number"
                    min="1"
                    value={jobForm.openings}
                    onChange={(e) => setJobForm({ ...jobForm, openings: parseInt(e.target.value, 10) || 1 })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="admin-job-deadline" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                    Application Deadline
                  </label>
                  <input
                    id="admin-job-deadline"
                    name="deadline"
                    type="date"
                    value={jobForm.deadline}
                    onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="admin-job-description" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Job Description / Role Overview <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="admin-job-description"
                  name="description"
                  rows={4}
                  required
                  placeholder="Describe the main purpose of this position, department mission, and working hours..."
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none focus:border-[#007BB5]"
                />
              </div>

              {/* Responsibilities */}
              <div>
                <label htmlFor="admin-job-responsibilities" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Key Responsibilities &amp; Duties (One per line)
                </label>
                <textarea
                  id="admin-job-responsibilities"
                  name="responsibilitiesText"
                  rows={4}
                  placeholder="Process customer purchases through POS&#10;Maintain freshness and clean display bays&#10;Coordinate with store team leaders"
                  value={jobForm.responsibilitiesText}
                  onChange={(e) => setJobForm({ ...jobForm, responsibilitiesText: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none font-mono text-xs"
                />
              </div>

              {/* Requirements */}
              <div>
                <label htmlFor="admin-job-requirements" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Candidate Requirements &amp; Skills (One per line)
                </label>
                <textarea
                  id="admin-job-requirements"
                  name="requirementsText"
                  rows={4}
                  placeholder="High school diploma or degree&#10;1+ year experience in retail or supermarket&#10;Fluency in English (Arabic is a plus)"
                  value={jobForm.requirementsText}
                  onChange={(e) => setJobForm({ ...jobForm, requirementsText: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none font-mono text-xs"
                />
              </div>

              {/* Benefits */}
              <div>
                <label htmlFor="admin-job-benefits" className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Benefits &amp; Perks (One per line)
                </label>
                <textarea
                  id="admin-job-benefits"
                  name="benefitsText"
                  rows={3}
                  placeholder="Company employment visa & medical insurance&#10;Annual leave with flight ticket allowance&#10;Staff store grocery discounts"
                  value={jobForm.benefitsText}
                  onChange={(e) => setJobForm({ ...jobForm, benefitsText: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 p-3.5 text-sm outline-none font-mono text-xs"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="job-active"
                  name="is_active"
                  checked={jobForm.is_active}
                  onChange={(e) => setJobForm({ ...jobForm, is_active: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-[#007BB5] focus:ring-[#007BB5]"
                />
                <label htmlFor="job-active" className="text-xs font-bold text-slate-700 cursor-pointer">
                  Publish Job Posting as Active on Public Careers Page
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setJobModalOpen(false)}
                  className="rounded-2xl border border-slate-200 px-6 py-2.5 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingJob}
                  className="rounded-2xl bg-[#E65100] px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-[#E65100]/25 hover:bg-[#CC4700] disabled:opacity-60 flex items-center gap-2"
                >
                  {savingJob && <Loader2 className="h-4 w-4 animate-spin" />}
                  {editingJob ? "Save Changes" : "Post Job Opening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DETAILED APPLICANT REVIEW & STATUS UPDATE
      ======================================================== */}
      {appDetailModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto border border-slate-200">
            <button
              onClick={() => {
                setAppDetailModalOpen(false);
                setSelectedApp(null);
              }}
              className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-slate-100"
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Candidate Header */}
            <div className="border-b border-slate-100 pb-5 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider text-[#007BB5]">
                Candidate Application Review
              </span>
              <h3 className="font-heading text-2xl font-black text-slate-900 mt-1">
                {selectedApp.applicant_name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Applied for <strong>{selectedApp.job_title}</strong> on{" "}
                {new Date(selectedApp.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-6">
              {/* Contact Information */}
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Contact Information
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 block">Email Address</span>
                    <a
                      href={`mailto:${selectedApp.email}`}
                      className="font-semibold text-[#007BB5] hover:underline inline-flex items-center gap-1.5"
                    >
                      <Mail className="h-3.5 w-3.5" /> {selectedApp.email}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Phone Number</span>
                    <a
                      href={`tel:${selectedApp.phone}`}
                      className="font-semibold text-slate-800 hover:text-[#007BB5] inline-flex items-center gap-1.5"
                    >
                      <Phone className="h-3.5 w-3.5" /> {selectedApp.phone}
                    </a>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Current City</span>
                    <span className="font-semibold text-slate-800">{selectedApp.current_city || "Dubai"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Total Experience</span>
                    <span className="font-semibold text-slate-800">{selectedApp.experience_years || "1 - 2 Years"}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Notice Period / Availability</span>
                    <span className="font-semibold text-slate-800">{selectedApp.notice_period || "Immediate"}</span>
                  </div>
                  {selectedApp.linkedin_url && (
                    <div>
                      <span className="text-xs text-slate-400 block">LinkedIn Profile</span>
                      <a
                        href={selectedApp.linkedin_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold text-[#007BB5] hover:underline inline-flex items-center gap-1"
                      >
                        <ExternalLink className="h-3 w-3" /> View LinkedIn
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Cover Note */}
              {selectedApp.cover_note && (
                <div className="rounded-2xl bg-white p-5 border border-slate-200">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Applicant Cover Note / Statement
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed italic bg-slate-50 p-4 rounded-xl">
                    "{selectedApp.cover_note}"
                  </p>
                </div>
              )}

              {/* Resume / Document File */}
              <div className="rounded-2xl border border-slate-200 p-5 bg-white">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Resume / CV Document
                </h4>
                {selectedApp.resume_url ? (
                  <div className="flex items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="h-10 w-10 rounded-lg bg-[#007BB5]/10 text-[#007BB5] flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {selectedApp.applicant_name}_Resume
                        </p>
                        <span className="text-xs text-slate-500">Document file uploaded</span>
                      </div>
                    </div>
                    <a
                      href={marketApi.resolveAssetUrl(selectedApp.resume_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-full bg-[#007BB5] px-4 py-2 text-xs font-bold text-white shadow hover:bg-[#006699] transition-all flex-shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" /> Download / View CV
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No resume file was attached.</p>
                )}
              </div>

              {/* Hiring Status Selector */}
              <div className="rounded-2xl bg-slate-50 p-5 border border-slate-200/80">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Candidate Hiring Status
                </h4>
                <div className="flex flex-wrap gap-2">
                  {STATUS_OPTIONS.map((st) => {
                    const isSelected = selectedApp.status === st.value;
                    return (
                      <button
                        key={st.value}
                        type="button"
                        disabled={updatingAppStatus}
                        onClick={() => handleUpdateStatus(selectedApp.id, st.value)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          isSelected
                            ? `${st.color} shadow-sm ring-2 ring-slate-900/10`
                            : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 inline mr-1" />}
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div>
                <label htmlFor="admin-candidate-notes" className="block text-xs font-bold uppercase text-slate-700 mb-1.5">
                  Internal HR / Interview Notes
                </label>
                <textarea
                  id="admin-candidate-notes"
                  name="adminNotes"
                  rows={3}
                  placeholder="Record interviewer remarks, telephone screening notes, salary expectations, interview schedule..."
                  value={adminNotesInput}
                  onChange={(e) => setAdminNotesInput(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 p-3.5 text-xs sm:text-sm outline-none focus:border-[#007BB5]"
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="rounded-xl bg-slate-800 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 disabled:opacity-50"
                  >
                    {savingNotes ? "Saving..." : "Save Notes"}
                  </button>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleDeleteApplication(selectedApp.id, selectedApp.applicant_name)}
                  className="text-xs font-semibold text-red-600 hover:underline inline-flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Application
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAppDetailModalOpen(false);
                    setSelectedApp(null);
                  }}
                  className="rounded-2xl border border-slate-200 px-6 py-2 text-xs sm:text-sm font-semibold hover:bg-slate-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
