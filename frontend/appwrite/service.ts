import { Snackbar } from 'react-native-paper';
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

  constructor() {
    this.endpoint = appwriteConfig.endpoint;
    this.projectId = appwriteConfig.projectId;
  }

  private async request(path: string, method = 'GET', body?: object) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Appwrite-Project': this.projectId,
    };

    if (this.jwt) {
      headers['X-Appwrite-JWT'] = this.jwt;
    }

    try {
      const response = await fetch(`${this.endpoint}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Unknown error');
      }

      return data;
    } catch (error: any) {
      Snackbar.show({
        text: error.message || 'Something went wrong.',
        duration: Snackbar.LENGTH_LONG,
      });
      throw error;
    }
  }

  async createAccount({ email, password, name }: CreateUserAccount) {
    try {
      await this.request('/account', 'POST', {
        userId: 'unique()',
        email,
        password,
        name,
      });

      return await this.login({ email, password }); // auto-login after registration
    } catch (error) {
      console.error('AppwriteService :: createAccount ::', error);
      throw error;
    }
  }

  async login({ email, password }: LoginUserAccount) {
    try {
      // Create session first
      const session = await this.request('/account/sessions/email', 'POST', {
        email,
        password,
      });

      // Get JWT token for future requests
      const jwtResponse = await this.request('/account/jwt', 'POST');
      this.jwt = jwtResponse.jwt;

      return session;
    } catch (error) {
      console.error('AppwriteService :: login ::', error);
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
      await this.request('/account/sessions/current', 'DELETE');
      this.jwt = null;
    } catch (error) {
      console.error('AppwriteService :: logout ::', error);
      throw error;
    }
  }
}

export default new AppwriteService();
