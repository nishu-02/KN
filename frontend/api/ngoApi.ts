// NGO API Service
import { API_BASE_URL } from './config';
import AuthService from './authService';

const getJWT = async () => AuthService.getJWT;

export const ngoApi = {
  async registerNGO(data) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/ngo/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`NGO registration failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async listNGOs(params = {}) {
    const jwt = await getJWT();
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/ngo/?${query}`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`NGO list failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async getNGODetail(id) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/ngo/${id}/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`NGO detail failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async acceptReport(ngoId, data) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/ngo/${ngoId}/accept-report/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Accept report failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async getAssignedReports(ngoId) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/ngo/${ngoId}/assigned-reports/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Assigned reports failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async getDashboardStats(ngoId) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/ngo/${ngoId}/dashboard-stats/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Dashboard stats failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async getReportTimeline(ngoId) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/ngo/${ngoId}/report-timeline/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Report timeline failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async getVolunteerRequests(ngoId) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/ngo/${ngoId}/volunteer-requests/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Volunteer requests failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async updateApplicationStatus(ngoId, applicationId, status) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/ngo/${ngoId}/update-application-status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify({ application_id: applicationId, status }),
    });
    if (!res.ok) {
      throw new Error(`Application status update failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async updateReportStatus(ngoId, reportId, status, notes) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/ngo/${ngoId}/update-report-status/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify({ report_id: reportId, status, notes }),
    });
    if (!res.ok) {
      throw new Error(`Report status update failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  // Legacy method - keeping for backward compatibility
  async getVolunteerApplications(ngoId) {
    return this.getVolunteerRequests(ngoId);
  },
  async processVolunteerApplication(ngoId, applicationId, action) {
    return this.updateApplicationStatus(ngoId, applicationId, action);
  },
};
