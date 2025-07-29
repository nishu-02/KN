import AsyncStorage from '@react-native-async-storage/async-storage';
import AppwriteService from '../appwrite/service';

const API_BASE = 'http://192.168.1.6:8000'; // Updated backend URL

interface LoginResponse {
  success: boolean;
  appwrite_jwt?: string;
  session?: {
    session_id: string;
    expires: string;
  };
  user_info?: {
    user_id: string;
    account_type: 'user' | 'ngo' | 'new';
    entity_id?: string;
    name: string;
    email: string;
    verified: boolean;
  };
  appwrite_user?: {
    $id: string;
    email: string;
    name: string;
  };
  error?: string;
}

interface RegisterResponse {
  success: boolean;
  appwrite_jwt?: string;
  user_info?: {
    user_id: string;
    account_type: 'user' | 'ngo' | 'new';
    entity_id?: string;
    name: string;
    email: string;
    verified: boolean;
  };
  error?: string;
}

class AuthService {
  private jwt: string | null = null;
  private accountType: string | null = null;
  private userInfo: any = null;

  constructor() {
    this.restoreAuth();
  }

  private async restoreAuth() {
    try {
      const [jwt, accountType, userInfo] = await Promise.all([
        AsyncStorage.getItem('appwrite_jwt'),
        AsyncStorage.getItem('account_type'),
        AsyncStorage.getItem('user_info')
      ]);
      
      if (jwt) this.jwt = jwt;
      if (accountType) this.accountType = accountType;
      if (userInfo) this.userInfo = JSON.parse(userInfo);
    } catch (e) {
      console.warn('Could not restore auth from AsyncStorage:', e);
    }
  }

  private async saveAuth(jwt: string, accountType: string, userInfo: any) {
    try {
      this.jwt = jwt;
      this.accountType = accountType;
      this.userInfo = userInfo;
      
      await Promise.all([
        AsyncStorage.setItem('appwrite_jwt', jwt),
        AsyncStorage.setItem('account_type', accountType),
        AsyncStorage.setItem('user_info', JSON.stringify(userInfo))
      ]);
    } catch (e) {
      console.warn('Could not save auth to AsyncStorage:', e);
    }
  }

  private async clearAuth() {
    try {
      this.jwt = null;
      this.accountType = null;
      this.userInfo = null;
      
      await Promise.all([
        AsyncStorage.removeItem('appwrite_jwt'),
        AsyncStorage.removeItem('account_type'),
        AsyncStorage.removeItem('user_info')
      ]);
    } catch (e) {
      console.warn('Could not clear auth from AsyncStorage:', e);
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Attempting login with backend...');
      const response = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim()
        })
      });

      console.log('Login response status:', response.status);
      const data: LoginResponse = await response.json();
      console.log('Login response data:', data);

      if (data.success && data.appwrite_jwt && data.user_info) {
        await this.saveAuth(data.appwrite_jwt, data.user_info.account_type, data.user_info);
        return data;
      } else {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }
    } catch (error: any) {
      console.error('AuthService :: login ::', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.'
      };
    }
  }

  async register(email: string, password: string, name: string, accountType: 'user' | 'ngo'): Promise<RegisterResponse> {
    try {
      // Step 1: Create Appwrite account
      console.log('Creating Appwrite account for:', email);
      await AppwriteService.createAccount({ email, password, name });
      
      // Step 2: Login through backend to get proper JWT
      console.log('Logging in through backend to get JWT...');
      const loginResult = await this.login(email, password);
      
      if (!loginResult.success) {
        return {
          success: false,
          error: loginResult.error || 'Failed to authenticate after account creation'
        };
      }

      // Step 3: If NGO, register with backend using the JWT from login
      if (accountType === 'ngo') {
        console.log('Registering NGO with backend...');
        
        const ngoResponse = await fetch(`${API_BASE}/ngo/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${loginResult.appwrite_jwt}`,
          },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            phone: "",
            description: "NGO registered through KarunaNidhan app",
            category: "animal",
            latitude: "0.0",
            longitude: "0.0",
            website: "",
          })
        });

        console.log('NGO registration response status:', ngoResponse.status);
        
        if (!ngoResponse.ok) {
          const errorData = await ngoResponse.json().catch(() => ({}));
          console.error('NGO registration error:', errorData);
          return {
            success: false,
            error: errorData.message || `NGO registration failed: ${ngoResponse.status}`
          };
        }

        // Return success with NGO account type
        const userInfo = {
          user_id: loginResult.user_info?.user_id || '',
          account_type: 'ngo' as const,
          name: name,
          email: email,
          verified: true
        };
        
        await this.saveAuth(loginResult.appwrite_jwt!, 'ngo', userInfo);
        
        return {
          success: true,
          appwrite_jwt: loginResult.appwrite_jwt,
          user_info: userInfo
        };
      } else {
        // For user registration, just return the login result
        const userInfo = {
          user_id: loginResult.user_info?.user_id || '',
          account_type: 'user' as const,
          name: name,
          email: email,
          verified: true
        };
        
        await this.saveAuth(loginResult.appwrite_jwt!, 'user', userInfo);
        
        return {
          success: true,
          appwrite_jwt: loginResult.appwrite_jwt,
          user_info: userInfo
        };
      }
    } catch (error: any) {
      console.error('AuthService :: register ::', error);
      return {
        success: false,
        error: error.message || 'Registration failed. Please try again.'
      };
    }
  }

  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint if needed
      if (this.jwt) {
        await fetch(`${API_BASE}/auth/logout/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.jwt}`,
            'Content-Type': 'application/json',
          }
        });
      }
    } catch (error) {
      console.warn('Logout API call failed, but clearing local auth:', error);
    } finally {
      await this.clearAuth();
    }
  }

  async makeAPICall(endpoint: string, options: RequestInit = {}): Promise<any> {
    try {
      if (!this.jwt) {
        throw new Error('No authentication token found');
      }

      console.log('Making API call to:', endpoint);
      console.log('Using JWT:', this.jwt.substring(0, 20) + '...');

      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.jwt}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });

      console.log('API call response status:', response.status);

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API call failed');
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('API call error:', error);
      return { success: false, error: error.message };
    }
  }

  get isLoggedIn(): boolean {
    return !!this.jwt && !!this.accountType;
  }

  get getAccountType(): string | null {
    return this.accountType;
  }

  get getUserInfo(): any {
    return this.userInfo;
  }

  get getJWT(): string | null {
    return this.jwt;
  }

  async checkAuthStatus(): Promise<{ isLoggedIn: boolean; accountType?: string; userInfo?: any }> {
    try {
      const jwt = await AsyncStorage.getItem('appwrite_jwt');
      const accountType = await AsyncStorage.getItem('account_type');
      const userInfo = await AsyncStorage.getItem('user_info');

      if (jwt && accountType) {
        return {
          isLoggedIn: true,
          accountType,
          userInfo: userInfo ? JSON.parse(userInfo) : null
        };
      }
      return { isLoggedIn: false };
    } catch (error) {
      return { isLoggedIn: false };
    }
  }
}

export default new AuthService(); 