// Notification API Service
import { API_BASE_URL } from './config';
import AuthService from './authService';

const getJWT = async () => AuthService.getJWT;

export const notificationApi = {
  async registerDevice(push_token, topics = ['general']) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/notifications/notifications/register_device/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify({ push_token, topics }),
    });
    if (!res.ok) {
      throw new Error(`Device registration failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async sendTestNotification() {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/notifications/notifications/send-test/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Test notification failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async getNotificationHistory() {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/notifications/notifications/history/`, {
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Notification history failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async markAsRead(notificationId) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/notifications/notifications/${notificationId}/mark-read/`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${jwt}` },
    });
    if (!res.ok) {
      throw new Error(`Mark as read failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
  async sendAnnouncement(data) {
    const jwt = await getJWT();
    const res = await fetch(`${API_BASE_URL}/notifications/notifications/send-announcement/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${jwt}` },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      throw new Error(`Send announcement failed: ${res.status} ${res.statusText}`);
    }
    return res.json();
  },
};
