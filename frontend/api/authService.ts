import AsyncStorage from '@react-native-async-storage/async-storage';
import AppwriteService from '../appwrite/service';
import { API_BASE_URL } from './config';

interface LoginResponse {
  success: boolean;
  appwrite_jwt?: string;
  session?: {
    session_id: string;
    expires: string;
  };
  user_info?: {
    user_id: string;
    account_type: 'user' | 'ngo' | 'new_user';
    entity_id?: string;
    name: string;
    email: string;
    verified: boolean;
  };
  appwrite_user?: {
    $id: string;
    email: string;
    name: string;
    emailVerification?: boolean;
  };
  error?: string;
}

interface RegisterResponse {
  success: boolean;
  appwrite_jwt?: string;
  user_info?: {
    user_id: string;
    account_type: 'user' | 'ngo' | 'new_user';
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

  /**
   * Login user with Appwrite and get account type from Django
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      console.log('Starting login process for:', email);
      
      // Step 1: Authenticate with Appwrite directly
      const userData = await AppwriteService.login({ email, password });
      console.log('Appwrite login successful:', userData);
      
      // Step 2: Get JWT token for API authentication with retry logic
      let jwtToken = null;
      let lastError = null;
      
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          jwtToken = await AppwriteService.getValidJWT();
          if (jwtToken) {
            console.log(`JWT token retrieved on attempt ${attempt}`);
            break;
          }
        } catch (error) {
          lastError = error;
          console.warn(`JWT retrieval attempt ${attempt} failed:`, error);
          if (attempt < 3) {
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      if (!jwtToken) {
        console.error('Failed to get JWT token after multiple attempts:', lastError);
        throw new Error(`Failed to get authentication token: ${lastError?.message || 'Unknown error'}`);
      }
      
      // Step 3: Query Django backend for account type using appwrite_user_id
      const accountTypeResponse = await fetch(`${API_BASE_URL}/users/auth/get_type`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          appwrite_user_id: userData.$id
        })
      });
      
      const accountData = await accountTypeResponse.json();
      console.log('Django account type response:', accountData);
      
      if (!accountTypeResponse.ok) {
        throw new Error(accountData.error || 'Failed to determine account type');
      }
      
      // Step 4: Prepare user info object
      const userInfo = {
        user_id: userData.$id,
        account_type: accountData.account_type || 'new_user',
        entity_id: accountData.entity_id,
        name: userData.name || accountData.name,
        email: userData.email,
        verified: userData.emailVerification || false,
        ...accountData.entity_data
      };
      
      // Step 5: Save authentication state
      await this.saveAuth(jwtToken, userInfo.account_type, userInfo);
      
      return {
        success: true,
        appwrite_jwt: jwtToken,
        session: {
          session_id: 'current',
          expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
        },
        user_info: userInfo,
        appwrite_user: userData
      };
      
    } catch (error: any) {
      console.error('Login error:', error);
      console.error('Login error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    }
  }

  /**
   * Register new user with Appwrite and create profile in Django
   */
  async register(email: string, password: string, name: string, accountType: 'user' | 'ngo'): Promise<RegisterResponse> {
    try {
      console.log('Starting registration process for:', email, accountType);
      
      // Step 1: Create Appwrite account
      const user = await AppwriteService.createAccount({ email, password, name });
      console.log('Appwrite account created:', user);
      
      // Step 2: Login to create session and get JWT
      const userData = await AppwriteService.login({ email, password });
      console.log('Session created for new user');
      
      // Step 3: Get JWT token
      const jwtToken = await AppwriteService.getValidJWT();
      if (!jwtToken) {
        throw new Error('Failed to get authentication token');
      }
      console.log('JWT token created for new user');
      
      // Step 4: Register minimal profile data with Django backend
      const registrationResponse = await fetch(`${API_BASE_URL}/users/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`,
        },
        body: JSON.stringify({
          appwrite_user_id: userData.$id,
          email: userData.email,
          name: userData.name,
          account_type: accountType
        })
      });
      
      const registrationData = await registrationResponse.json();
      console.log('Django registration response:', registrationData);
      
      if (!registrationResponse.ok) {
        // If Django registration fails, we should clean up the Appwrite session
        try {
          await AppwriteService.logout();
        } catch (cleanupError) {
          console.warn('Failed to cleanup Appwrite session after Django registration failure:', cleanupError);
        }
        throw new Error(registrationData.error || 'Profile creation failed');
      }
      
      // Step 5: Prepare user info object
      const userInfo = {
        user_id: userData.$id,
        account_type: accountType,
        entity_id: registrationData.entity_id,
        name: userData.name,
        email: userData.email,
        verified: false
      };
      
      // Step 6: Save authentication state
      await this.saveAuth(jwtToken, accountType, userInfo);
      
      return {
        success: true,
        appwrite_jwt: jwtToken,
        user_info: userInfo,
        appwrite_user: userData
      };
      
    } catch (error: any) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    }
  }

  /**
   * Logout user and clear all stored data
   */
  async logout(): Promise<void> {
    try {
      // Logout from Appwrite
      await AppwriteService.logout();
    } catch (error) {
      console.warn('Appwrite logout failed:', error);
    } finally {
      // Always clear local auth data
      await this.clearAuth();
    }
  }

  /**
   * Check if user is currently authenticated
   */
  async checkAuthStatus(): Promise<{
    isLoggedIn: boolean;
    userInfo?: any;
    accountType?: string;
  }> {
    try {
      // Check if we have local auth data
      if (!this.jwt || !this.userInfo) {
        return { isLoggedIn: false };
      }

      // Verify session with Appwrite
      const currentUser = await AppwriteService.getCurrentUser();
      if (!currentUser) {
        await this.clearAuth();
        return { isLoggedIn: false };
      }

      return {
        isLoggedIn: true,
        userInfo: this.userInfo,
        accountType: this.accountType
      };
    } catch (error) {
      console.warn('Auth status check failed:', error);
      await this.clearAuth();
      return { isLoggedIn: false };
    }
  }

  /**
   * Get current JWT token
   */
  get getJWT(): string | null {
    return this.jwt;
  }

  /**
   * Get current account type
   */
  get getAccountType(): string | null {
    return this.accountType;
  }

  /**
   * Get current user info
   */
  get getUserInfo(): any {
    return this.userInfo;
  }
}

export default new AuthService();
