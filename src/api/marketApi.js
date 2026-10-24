const envApiUrl = import.meta.env?.VITE_API_BASE_URL || import.meta.env?.VITE_API_URL;
export const API_BASE = (
  envApiUrl
    ? (envApiUrl.endsWith('/api') ? envApiUrl : `${envApiUrl.replace(/\/+$/, '')}/api`)
    : (import.meta.env?.PROD ? 'https://api.gateuae.com/api' : '/api')
).replace(/\/+$/, '');

const envAssetUrl = import.meta.env?.VITE_ASSET_BASE_URL;
export const SERVER_BASE_URL = (
  envAssetUrl ||
  (API_BASE.startsWith('http')
    ? API_BASE.replace(/\/api$/, '')
    : (import.meta.env?.PROD ? 'https://api.gateuae.com' : ''))
).replace(/\/+$/, '');

/**
 * Resolves static media URLs (like /uploads/...) so they point to the correct backend host
 * in production or local environments.
 */
export function resolveAssetUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const clean = url.trim().replace(/\\/g, '/');
  if (
    clean.startsWith('data:') ||
    clean.startsWith('blob:')
  ) {
    return clean;
  }

  if (clean.startsWith('http://') || clean.startsWith('https://')) {
    if (SERVER_BASE_URL && (clean.includes('localhost:') || clean.includes('127.0.0.1:')) && clean.includes('/uploads/')) {
      const uploadIdx = clean.indexOf('/uploads/');
      return `${SERVER_BASE_URL}${clean.substring(uploadIdx)}`;
    }
    return clean;
  }

  if (clean.startsWith('/uploads/') || clean.startsWith('uploads/')) {
    const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
    return SERVER_BASE_URL ? `${SERVER_BASE_URL}${cleanPath}` : cleanPath;
  }

  if (clean.includes('/uploads/')) {
    const uploadIdx = clean.indexOf('/uploads/');
    const cleanPath = clean.substring(uploadIdx);
    return SERVER_BASE_URL ? `${SERVER_BASE_URL}${cleanPath}` : cleanPath;
  }

  return clean;
}


export const ADMIN_TOKEN_KEY = 'gate_admin_token';
export const ADMIN_USER_KEY = 'gate_admin_user';

export function isTokenValid(token) {
  if (!token || typeof token !== 'string' || token === 'null' || token === 'undefined' || token.trim() === '') {
    return false;
  }
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function authHeaders() {
  const token = localStorage.getItem(ADMIN_TOKEN_KEY);
  if (!isTokenValid(token)) {
    return {};
  }
  return { Authorization: `Bearer ${token}` };
}

async function request(url, options = {}) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders(),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      marketApi.logout();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('market-admin-auth-expired', {
            detail: { message: data.message || 'Invalid or expired token.' },
          })
        );
      }
    }
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const marketApi = {
  // Admin Auth
  async login(email, password) {
    const data = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
    }
    return data;
  },

  logout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_USER_KEY);
  },

  async forgotPassword(email) {
    return await request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(email, token, newPassword) {
    return await request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, token, newPassword }),
    });
  },

  getAdminUser() {
    try {
      const u = localStorage.getItem(ADMIN_USER_KEY);
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },

  isAdminAuthenticated() {
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const valid = isTokenValid(token);
    if (!valid && token) {
      localStorage.removeItem(ADMIN_TOKEN_KEY);
      localStorage.removeItem(ADMIN_USER_KEY);
    }
    return valid;
  },

  async getAdminMe() {
    const data = await request('/auth/me');
    if (data?.token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
    }
    if (data?.admin) {
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(data.admin));
    }
    return data;
  },

  async updateAdminProfile(data) {
    const res = await request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (res?.success && res.admin) {
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(res.admin));
    }
    return res;
  },

  async changeAdminPassword(data) {
    return request('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Settings
  async getSettings() {
    return request('/settings');
  },

  async updateSettings(settings) {
    return request('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  // Stores
  async getStores() {
    return request('/stores');
  },

  async getStore(slug) {
    return request(`/stores/${slug}`);
  },

  async createStore(data) {
    return request('/stores', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStore(id, data) {
    return request(`/stores/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteStore(id) {
    return request(`/stores/${id}`, {
      method: 'DELETE',
    });
  },

  // Blogs
  async getBlogs() {
    return request('/blogs');
  },

  async getBlog(slug) {
    return request(`/blogs/${slug}`);
  },

  async createBlog(data) {
    return request('/blogs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateBlog(id, data) {
    return request(`/blogs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteBlog(id) {
    return request(`/blogs/${id}`, {
      method: 'DELETE',
    });
  },

  // Campaigns
  async getCampaigns(all = false) {
    return request(`/campaigns${all ? '?all=1' : ''}`);
  },

  async createCampaign(data) {
    return request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateCampaign(id, data) {
    return request(`/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteCampaign(id) {
    return request(`/campaigns/${id}`, {
      method: 'DELETE',
    });
  },

  // Pages CMS & SEO
  async getPages() {
    return request('/pages');
  },

  async getPage(pageName) {
    return request(`/pages/${pageName}`);
  },

  async updatePage(pageName, data) {
    return request(`/pages/${pageName}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Contact / Inquiries
  async submitContact(data) {
    return request('/contact', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getInquiries() {
    return request('/contact');
  },

  async updateInquiryStatus(id, status) {
    return request(`/contact/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteInquiry(id) {
    return request(`/contact/${id}`, {
      method: 'DELETE',
    });
  },

  // File Upload
  async uploadFile(file, folder = '') {
    const formData = new FormData();
    formData.append('image', file);

    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';
    const res = await fetch(`${API_BASE}/upload${query}`, {
      method: 'POST',
      headers: {
        ...(isTokenValid(token) ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      if (res.status === 401) {
        marketApi.logout();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('market-admin-auth-expired', {
              detail: { message: data.message || 'Invalid or expired token.' },
            })
          );
        }
      }
      throw new Error(data.message || 'Upload failed');
    }
    return data;
  },

  async uploadMultipleFiles(files, folder = 'flyers') {
    const fileList = Array.from(files || []);
    if (fileList.length === 0) return { success: true, files: [] };

    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const query = folder ? `?folder=${encodeURIComponent(folder)}` : '';

    // 1. Try batch endpoint first
    try {
      const formData = new FormData();
      for (const file of fileList) {
        formData.append('images', file);
      }

      const res = await fetch(`${API_BASE}/upload/multiple${query}`, {
        method: 'POST',
        headers: {
          ...(isTokenValid(token) ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data?.success && Array.isArray(data.files) && data.files.length > 0) {
        return data;
      }

      if (res.status === 401) {
        marketApi.logout();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('market-admin-auth-expired', {
              detail: { message: data.message || 'Admin session expired. Please log in again.' },
            })
          );
        }
        throw new Error(data.message || 'Admin session expired. Please log in again.');
      }
    } catch (err) {
      if (err.message?.includes('expired') || err.message?.includes('session') || err.message?.includes('token')) {
        throw err;
      }
      console.warn('Batch upload unavailable or errored, attempting single upload fallback:', err);
    }

    // 2. Reliable concurrent upload via /api/upload
    const uploaded = [];
    const errors = [];
    for (let i = 0; i < fileList.length; i++) {
      try {
        const singleRes = await marketApi.uploadFile(fileList[i], folder);
        if (singleRes?.success && singleRes.url) {
          uploaded.push({
            url: singleRes.url,
            filename: singleRes.filename || fileList[i].name,
            originalname: fileList[i].name,
            page_number: i + 1,
          });
        }
      } catch (e) {
        errors.push(`${fileList[i].name}: ${e.message}`);
      }
    }

    if (uploaded.length === 0) {
      throw new Error(errors.length > 0 ? errors.join(', ') : 'Failed to upload flyer images.');
    }

    return {
      success: true,
      message: `${uploaded.length} file(s) uploaded successfully.`,
      files: uploaded,
    };
  },

  // Resume Upload (Public for Applicants)
  async uploadResume(file) {
    const formData = new FormData();
    formData.append('resume', file);

    const res = await fetch(`${API_BASE}/jobs/upload-resume`, {
      method: 'POST',
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || 'Resume upload failed');
    }
    return data;
  },

  // Careers / Jobs (Public)
  async getJobs(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.department && params.department !== 'All') query.append('department', params.department);
    if (params.location && params.location !== 'All') query.append('location', params.location);
    if (params.job_type && params.job_type !== 'All') query.append('job_type', params.job_type);

    const qStr = query.toString();
    return request(`/jobs${qStr ? `?${qStr}` : ''}`);
  },

  async getJob(slugOrId) {
    return request(`/jobs/${slugOrId}`);
  },

  async applyForJob(jobId, applicationData) {
    return request(`/jobs/${jobId}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  },

  // Jobs Management (Admin)
  async adminGetJobs() {
    return request('/jobs/admin/all');
  },

  async adminCreateJob(jobData) {
    return request('/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  },

  async adminUpdateJob(id, jobData) {
    return request(`/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(jobData),
    });
  },

  async adminDeleteJob(id) {
    return request(`/jobs/${id}`, {
      method: 'DELETE',
    });
  },

  async adminToggleJob(id) {
    return request(`/jobs/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  // Job Applications (Admin)
  async adminGetApplications(params = {}) {
    const query = new URLSearchParams();
    if (params.job_id) query.append('job_id', params.job_id);
    if (params.status) query.append('status', params.status);
    if (params.search) query.append('search', params.search);

    const qStr = query.toString();
    return request(`/jobs/admin/applications${qStr ? `?${qStr}` : ''}`);
  },

  async adminGetApplication(id) {
    return request(`/jobs/admin/applications/${id}`);
  },

  async adminUpdateApplicationStatus(id, status, admin_notes) {
    return request(`/jobs/admin/applications/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_notes }),
    });
  },

  async adminDeleteApplication(id) {
    return request(`/jobs/admin/applications/${id}`, {
      method: 'DELETE',
    });
  },

  // SEO & Discoverability
  async regenerateSeoFiles() {
    return request('/seo/regenerate', {
      method: 'POST',
    });
  },

  // Hero Banners (Store-mapped Desktop & Mobile views)
  async getHeroBanners(params = {}) {
    const query = new URLSearchParams();
    if (params.store) query.append('store', params.store);
    if (params.active_only) query.append('active_only', params.active_only);
    const qStr = query.toString();
    return request(`/hero-banners${qStr ? `?${qStr}` : ''}`);
  },

  async getActiveHeroBanner(storeSlug = '') {
    const query = storeSlug ? `?store=${encodeURIComponent(storeSlug)}` : '';
    return request(`/hero-banners/active${query}`);
  },

  async getHeroBanner(id) {
    return request(`/hero-banners/${id}`);
  },

  async createHeroBanner(formDataOrData) {
    if (formDataOrData instanceof FormData) {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      const res = await fetch(`${API_BASE}/hero-banners`, {
        method: 'POST',
        headers: {
          ...(isTokenValid(token) ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formDataOrData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to create hero banner');
      }
      return data;
    }
    return request('/hero-banners', {
      method: 'POST',
      body: JSON.stringify(formDataOrData),
    });
  },

  async updateHeroBanner(id, formDataOrData) {
    if (formDataOrData instanceof FormData) {
      const token = localStorage.getItem(ADMIN_TOKEN_KEY);
      const res = await fetch(`${API_BASE}/hero-banners/${id}`, {
        method: 'PUT',
        headers: {
          ...(isTokenValid(token) ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formDataOrData,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update hero banner');
      }
      return data;
    }
    return request(`/hero-banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(formDataOrData),
    });
  },

  async deleteHeroBanner(id) {
    return request(`/hero-banners/${id}`, {
      method: 'DELETE',
    });
  },

  async toggleHeroBanner(id) {
    return request(`/hero-banners/${id}/toggle`, {
      method: 'PATCH',
    });
  },

  async uploadHeroImage(file) {
    const formData = new FormData();
    formData.append('image', file);
    const token = localStorage.getItem(ADMIN_TOKEN_KEY);
    const res = await fetch(`${API_BASE}/hero-banners/upload`, {
      method: 'POST',
      headers: {
        ...(isTokenValid(token) ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || 'Failed to upload hero image');
    }
    return data;
  },

  async checkHealth() {
    return request('/health');
  },

  resolveAssetUrl,
  API_BASE,
  SERVER_BASE_URL,
};

