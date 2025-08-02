import { API_BASE_URL } from './config';
import AuthService from './authService';

const getJWT = () => AuthService.getJWT;

export const usersApi = {
  // Profile Management
  async getProfile() {
    const jwt = getJWT();
    const res = await fetch(`${API_BASE_URL}/users/profile/me/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Profile fetch failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async getAccountType() {
    const jwt = getJWT();
    const res = await fetch(`${API_BASE_URL}/users/profile/whoami/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Account type fetch failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async updateProfile(data) {
    const jwt = getJWT();
    const res = await fetch(`${API_BASE_URL}/users/profile/update/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Profile update failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async toggleVolunteerStatus(isVolunteer: boolean) {
    const jwt = getJWT();
    const res = await fetch(`${API_BASE_URL}/users/profile/toggle-volunteer/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify({ is_volunteer: isVolunteer }),
    });
    if (!res.ok) {
      throw new Error(`Toggle volunteer status failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async uploadAvatar(imageFile: File) {
    const jwt = getJWT();
    const formData = new FormData();
    formData.append('avatar', imageFile);
    const res = await fetch(`${API_BASE_URL}/users/profile/upload-avatar/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}` },
      body: formData,
    });
    if (!res.ok) {
      throw new Error(`Avatar upload failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async removeAvatar() {
    const jwt = getJWT();
    const res = await fetch(`${API_BASE_URL}/users/profile/remove-avatar/`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Avatar removal failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async updateNotificationPreferences(preferences) {
    const jwt = getJWT();
    const res = await fetch(`${API_BASE_URL}/users/profile/notification-preferences/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify(preferences),
    });
    if (!res.ok) {
      throw new Error(`Notification preferences update failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  
  // Reports Management
  async getUserReports() {
    const jwt = getJWT();
    const res = await fetch(`${API_BASE_URL}/users/reports/own/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`User reports fetch failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async getHelperReports() {
    const jwt = getJWT();
    const res = await fetch(`${API_BASE_URL}/users/reports/helped/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Helper reports fetch failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  
  // Volunteer Applications
  async listVolunteerApplications() {
    const jwt = getJWT();
    const res = await fetch(`${API_BASE_URL}/users/volunteer-applications/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Volunteer applications fetch failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async applyVolunteer(ngoId: string, message?: string) {
    const jwt = getJWT();
    const res = await fetch(`${API_BASE_URL}/users/volunteer-applications/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify({ ngo_id: ngoId, message }),
    });
    if (!res.ok) {
      throw new Error(`Volunteer application failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  
  // Auth endpoints
  async registerUser(data) {
    const res = await fetch(`${API_BASE_URL}/users/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
