// Reports API Service
import { API_BASE_URL } from './config';
import AuthService from './authService';

const getJWT = async () => AuthService.getJWT;

export const reportsApi = {
  async createReport(data) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/reports/reports/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Report creation failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async listReports(params = {}) {
    const jwt = await getJWT();
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE_URL}/reports/reports/?${query}`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Reports list failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async getReportDetail(id) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/reports/reports/${id}/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Report detail failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async updateReportStatus(id, status, notes) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/reports/reports/${id}/update-status/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify({ status, notes }),
    });
    if (!res.ok) {
      throw new Error(`Report status update failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async getNearbyReports(latitude, longitude, radius = 10) {
    const jwt = await getJWT();
    const params = new URLSearchParams({ 
      latitude: latitude.toString(), 
      longitude: longitude.toString(), 
      radius: radius.toString() 
    }).toString();
    const res = await fetch(`${API_BASE_URL}/reports/reports/nearby/?${params}`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Nearby reports failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async getNgoSpecificReports() {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/reports/reports/ngo-specific/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`NGO specific reports failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async savePushToken(userId, token) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/reports/save-push-token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify({ user_id: userId, push_token: token }),
    });
    return res.json();
  },
};
