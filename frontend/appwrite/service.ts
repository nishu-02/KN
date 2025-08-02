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

function decodeJWT(token: string): { exp?: number } {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return decoded;
  } catch {
    return {};
  }
}

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

    // Use session ID if available (preferred for most operations after login)
    if (this.sessionId) {
      headers['X-Appwrite-Session'] = this.sessionId;
    } else if (this.jwt) {
      // Fallback to JWT if session ID is not available
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
        password, 
        options: { persistent: true }, // NEW LINE
      });
      console.log('Session created:', session);

      // Save session ID
      await this.saveSession(undefined, session.$id);
      console.log('Session ID saved:', session.$id);

      // Small delay to ensure session is fully established
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get JWT token for additional authentication with retry
      let jwtToken = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          console.log(`Attempting to get JWT token (attempt ${attempt})`);
          const jwtResponse = await this.request('/account/jwt', 'POST');
          console.log(`JWT response (attempt ${attempt}):`, jwtResponse);
          
          if (jwtResponse && jwtResponse.jwt) {
            jwtToken = jwtResponse.jwt;
            await this.saveSession(jwtResponse.jwt);
            console.log(`JWT token obtained on attempt ${attempt}`);
            break;
          } else {
            console.warn(`JWT response missing jwt field on attempt ${attempt}:`, jwtResponse);
          }
        } catch (jwtError) {
          console.warn(`JWT attempt ${attempt} failed:`, jwtError);
          if (attempt === 3) {
            console.warn('Could not get JWT token after 3 attempts, continuing with session only');
          }
          // Wait a bit before retrying
          if (attempt < 3) {
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        }
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

  private isJWTExpired(): boolean {
    if (!this.jwt) return true;
    const { exp } = decodeJWT(this.jwt);
    if (!exp) return true;
    // exp is in seconds, Date.now() in ms
    return Date.now() >= exp * 1000;
  }

  async getValidJWT(): Promise<string | null> {
    if (this.jwt && !this.isJWTExpired()) {
      console.log('Using existing valid JWT token');
      return this.jwt;
    }
    
    // Try to get a new JWT using current session
    try {
      // First, check if we have a valid session
      if (!this.sessionId) {
        console.log('No session ID available for JWT generation');
        return null;
      }
      
      console.log('Attempting to create JWT token with session ID:', this.sessionId);
      const jwtResponse = await this.request('/account/jwt', 'POST');
      console.log('JWT creation response:', jwtResponse);
      
      if (jwtResponse && jwtResponse.jwt) {
        await this.saveSession(jwtResponse.jwt);
        console.log('JWT token created and saved successfully');
        return jwtResponse.jwt;
      } else {
        console.log('JWT response did not contain jwt field:', jwtResponse);
        return null;
      }
    } catch (e) {
      console.error('Failed to get JWT token:', e);
      // Try to verify session is still valid
      try {
        const user = await this.getCurrentUser();
        console.log('Session is valid but JWT creation failed, user:', user);
      } catch (sessionError) {
        console.log('Session is invalid, clearing...', sessionError);
        await this.clearSession();
      }
      return null;
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