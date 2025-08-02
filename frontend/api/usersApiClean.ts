import { API_BASE_URL } from './config';
import AuthService from './authService';

const getJWT = async () => AuthService.getJWT;

export const usersApi = {
  async getProfile() {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/users/profile/whoami/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    return res.json();
  },
  async updateProfile(data) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/users/profile/`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async listVolunteerApplications() {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/users/volunteer-applications/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    return res.json();
  },
  async applyVolunteer(data) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/users/volunteer-applications/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async getUserReports() {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/users/reports/own/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    return res.json();
  },
  async getHelperReports() {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/users/reports/helped/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    return res.json();
  },
  async registerUser(data) {
    const res = await fetch(`${API_BASE_URL}/users/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },
  async getAccountType() {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/users/auth/get_type`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    return res.json();
  },
};
