
import AuthService from './authService';
import { API_BASE_URL } from './config';

// Generic API request function using AuthService
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get JWT from AuthService
  const jwt = AuthService.getJWT;
  if (!jwt) {
    console.error('No JWT token available for API call');
    throw new Error('No authentication token found. Please login again.');
  }

  console.log(`Making API request to: ${url}`);
  console.log(`Using JWT: ${jwt.substring(0, 20)}...`);

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`,
      ...options.headers,
    },
  });

  console.log(`API response status: ${response.status} for ${endpoint}`);

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, clear auth
      console.error('Authentication failed (401), clearing auth');
      await AuthService.logout();
      throw new Error('Authentication expired. Please login again.');
    }
    
    const errorText = await response.text();
    console.error(`API request failed: ${response.status} ${response.statusText}`);
    console.error(`Error response: ${errorText}`);
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}



// Notification API functions
export const notificationApi = {
  // Register device for push notifications
  registerDevice: async (pushToken: string, topics: string[] = ['general']) => {
    return apiRequest('/notifications/register_device/', {
      method: 'POST',
      body: JSON.stringify({
        push_token: pushToken,
        topics: topics,
      }),
    });
  },

  // Send test notification
  sendTestNotification: async () => {
    return apiRequest('/notifications/send-test/', {
      method: 'POST',
    });
  },

  // Get notification history
  getNotificationHistory: async () => {
    return apiRequest('/notifications/history/');
  },

  // Mark notification as read
  markAsRead: async (notificationId: string) => {
    return apiRequest(`/notifications/${notificationId}/mark_read/`, {
      method: 'PATCH',
    });
  },

  // Send announcement (admin only)
  sendAnnouncement: async (title: string, body: string, topic: string = 'general', userIds?: string[]) => {
    return apiRequest('/notifications/send-announcement/', {
      method: 'POST',
      body: JSON.stringify({
        title,
        body,
        topic,
        user_ids: userIds,
      }),
    });
  },
};




// Reports API functions
export const reportsApi = {
  // Save push token
  savePushToken: async (userId: string, token: string) => {
    return apiRequest('/reports/save-push-token/', {
      method: 'POST',
      body: JSON.stringify({
        user_id: userId,
        token: token,
      }),
    });
  },

  // Get injury reports
  getInjuryReports: async () => {
    return apiRequest('/reports/');
  },

  // Create injury report
  createInjuryReport: async (data: FormData) => {
    const url = `${API_BASE_URL}/reports/`;
    const jwt = AuthService.getJWT;
    if (!jwt) {
      console.error('No JWT token available for injury report creation');
      throw new Error('No authentication token found. Please login again.');
    }

    console.log(`Creating injury report with JWT: ${jwt.substring(0, 20)}...`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
      body: data, // FormData doesn't need Content-Type header
    });

    console.log(`Injury report creation response status: ${response.status}`);

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Authentication failed for injury report creation');
        await AuthService.logout();
        throw new Error('Authentication expired. Please login again.');
      }
      
      const errorText = await response.text();
      console.error(`Injury report creation failed: ${response.status} ${response.statusText}`);
      console.error(`Error response: ${errorText}`);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};



// User API functions - Updated to use the new userApi.ts file
// These functions are now available in the separate userApi.ts file
// import { userApi } from './userApi';




// NGO API functions
export const ngoApi = {
  // Get NGO list
  getNGOList: async () => {
    return apiRequest('/ngo/');
  },

  // Get NGO details
  getNGODetails: async (ngoId: string) => {
    return apiRequest(`/ngo/${ngoId}/`);
  },

  // Get NGO dashboard stats
  getNGODashboardStats: async (ngoId: string) => {
    return apiRequest(`/ngo/${ngoId}/dashboard-stats/`);
  },

  // Create NGO (for registration)
  createNGO: async (data: any) => {
    console.log('Creating NGO with data:', data);
    return apiRequest('/ngo/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export default {
  notificationApi,
  reportsApi,
  ngoApi,
}; 