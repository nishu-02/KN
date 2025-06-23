import AsyncStorage from '@react-native-async-storage/async-storage';
import { appwriteConfig } from './env';

type CreateUserAccount = {
  email: string;
  password: string;
  name: string;
};

type LoginUserAccount = {
  email: string;
  password: string;
};

class AppwriteService {
  private endpoint: string;
  private projectId: string;
  private jwt: string | null = null;
  private sessionId: string | null = null;

  constructor() {
    this.endpoint = appwriteConfig.endpoint;
    this.projectId = appwriteConfig.projectId;
    
    // Try to restore session from storage on initialization
    this.restoreSession();
  }

  private async request(path: string, method = 'GET', body?: object) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': this.projectId,
    };

    // Use JWT if available
    if (this.jwt) {
      headers['X-Appwrite-JWT'] = this.jwt;
    }

    try {
      const response = await fetch(`${this.endpoint}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      // Handle empty responses (like successful DELETE requests)
      const contentType = response.headers.get('content-type');
      let data;
      
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
      } else {
        data = {};
      }

      if (!response.ok) {
        // If unauthorized, clear stored session
        if (response.status === 401) {
          await this.clearSession();
        }
        
        throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      return data;
    } catch (error: any) {
      console.error(`AppwriteService :: request (${method} ${path}) ::`, error);
      
      // If it's a network error or 401, clear session
      if (error.message?.includes('401') || error.message?.includes('missing scope')) {
        await this.clearSession();
      }
      
      throw error;
    }
  }

  private async saveSession(jwt?: string, sessionId?: string) {
    try {
      if (jwt) {
        this.jwt = jwt;
        await AsyncStorage.setItem('appwrite_jwt', jwt);
      }
      if (sessionId) {
        this.sessionId = sessionId;
        await AsyncStorage.setItem('appwrite_session_id', sessionId);
      }
    } catch (e) {
      console.warn('Could not save session to AsyncStorage:', e);
    }
  }

  private async restoreSession() {
    try {
      const [savedJwt, savedSessionId] = await Promise.all([
        AsyncStorage.getItem('appwrite_jwt'),
        AsyncStorage.getItem('appwrite_session_id')
      ]);
      
      if (savedJwt) {
        this.jwt = savedJwt;
      }
      if (savedSessionId) {
        this.sessionId = savedSessionId;
      }
    } catch (e) {
      console.warn('Could not restore session from AsyncStorage:', e);
    }
  }

  private async clearSession() {
    this.jwt = null;
    this.sessionId = null;
    try {
      await Promise.all([
        AsyncStorage.removeItem('appwrite_jwt'),
        AsyncStorage.removeItem('appwrite_session_id')
      ]);
    } catch (e) {
      console.warn('Could not clear session from AsyncStorage:', e);
    }
  }

  async createAccount({ email, password, name }: CreateUserAccount) {
    try {
      const account = await this.request('/account', 'POST', {
        userId: 'unique()',
        email,
        password,
        name,
      });
      
      return account;
    } catch (error) {
      console.error('AppwriteService :: createAccount ::', error);
      throw error;
    }
  }

  async login({ email, password }: LoginUserAccount) {
    try {
      // Check if already logged in with same email
      try {
        const currentUser = await this.getCurrentUser();
        if (currentUser && currentUser.email === email) {
          console.log('User already logged in with same email');
          return currentUser;
        } else if (currentUser) {
          // Different user is logged in, logout first
          await this.logout();
        }
      } catch (e) {
        // No current session or error, proceed with login
        await this.clearSession();
      }

      // Create session
      const session = await this.request('/account/sessions/email', 'POST', { 
        email, 
        password 
      });

      // Save session ID
      await this.saveSession(undefined, session.$id);

      // Get JWT token for additional authentication
      try {
        const jwtResponse = await this.request('/account/jwt', 'POST');
        await this.saveSession(jwtResponse.jwt);
      } catch (jwtError) {
        console.warn('Could not get JWT token:', jwtError);
        // Continue without JWT - session should still work
      }

      // Return user data instead of session
      return await this.getCurrentUser();
    } catch (error) {
      console.error('AppwriteService :: login ::', error);
      await this.clearSession();
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      return await this.request('/account', 'GET');
    } catch (error) {
      console.error('AppwriteService :: getCurrentUser ::', error);
      throw error;
    }
  }

  async logout() {
    try {
      // Always attempt to delete current session
      await this.request('/account/sessions/current', 'DELETE');
    } catch (error: any) {
      console.warn('AppwriteService :: logout API call failed:', error);
      
      // Don't throw error for common logout scenarios
      const isExpectedLogoutError = 
        error.message?.includes('missing scope') || 
        error.message?.includes('User (role: guests)') ||
        error.message?.includes('401');
      
      if (!isExpectedLogoutError) {
        console.error('Unexpected logout error:', error);
      }
    } finally {
      // Always clear local session regardless of API call result
      await this.clearSession();
    }
  }

  async forceLogout() {
    // Clear local state without making API calls
    await this.clearSession();
  }

  // Session validation method
  async validateSession(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch (error) {
      await this.clearSession();
      return false;
    }
  }

  get hasJWT() {
    return !!this.jwt;
  }

  get jwtToken() {
    return this.jwt;
  }

  get hasSession() {
    return !!this.jwt || !!this.sessionId;
  }
}

export default new AppwriteService();