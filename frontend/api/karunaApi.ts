import AuthService from './authService';
import { API_BASE_URL } from './config';

// Generic API request function using AuthService
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Get JWT from AuthService
  let jwt = AuthService.getJWT;
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
      console.log('Authentication failed (401), attempting token refresh');
      // Attempt to refresh the token
      jwt = await AuthService.refreshToken();
      if (!jwt) {
        console.error('Token refresh failed, logging out');
        await AuthService.logout();
        throw new Error('Authentication expired. Please login again.');
      }
      console.log('Token refreshed, retrying request with new JWT');
      // Retry the request with the new token
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwt}`,
          ...options.headers,
        },
      });
      
      console.log(`Retry API response status: ${retryResponse.status} for ${endpoint}`);
      
      if (!retryResponse.ok) {
        if (retryResponse.status === 401) {
          console.error('Authentication failed again after refresh (401), clearing auth');
          await AuthService.logout();
          throw new Error('Authentication expired after refresh. Please login again.');
        }
        const retryErrorText = await retryResponse.text();
        console.error(`Retry API request failed: ${retryResponse.status} ${retryResponse.statusText}`);
        console.error(`Retry error response: ${retryErrorText}`);
        throw new Error(`API request failed on retry: ${retryResponse.status} ${retryResponse.statusText}`);
      }
      
      return retryResponse.json();
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
    let jwt = AuthService.getJWT;
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
        console.log('Authentication failed for injury report creation, attempting token refresh');
        jwt = await AuthService.refreshToken();
        if (!jwt) {
          console.error('Token refresh failed for injury report, logging out');
          await AuthService.logout();
          throw new Error('Authentication expired. Please login again.');
        }
        console.log('Token refreshed, retrying injury report creation with new JWT');
        const retryResponse = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${jwt}`,
          },
          body: data,
        });
        
        console.log(`Retry injury report creation response status: ${retryResponse.status}`);
        
        if (!retryResponse.ok) {
          if (retryResponse.status === 401) {
            console.error('Authentication failed again after refresh for injury report');
            await AuthService.logout();
            throw new Error('Authentication expired after refresh. Please login again.');
          }
          const retryErrorText = await retryResponse.text();
          console.error(`Retry injury report creation failed: ${retryResponse.status} ${retryResponse.statusText}`);
          console.error(`Retry error response: ${retryErrorText}`);
          throw new Error(`API request failed on retry: ${retryResponse.status} ${retryResponse.statusText}`);
        }
        
        return retryResponse.json();
      }
      
      const errorText = await response.text();
      console.error(`Injury report creation failed: ${response.status} ${response.statusText}`);
      console.error(`Error response: ${errorText}`);
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
  },
};

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
