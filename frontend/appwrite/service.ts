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
      console.error(`AppwriteService :: request (${method} ${path}) ::`, error);
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

      // Auto-login after registration
      return await this.login({ email, password });
    } catch (error) {
      console.error('AppwriteService :: createAccount ::', error);
      throw error;
    }
  }

  async login({ email, password }: LoginUserAccount) {
  try {
    const user = await this.getCurrentUser();
    if (user) throw new Error("Already logged in");

    const session = await this.request('/account/sessions/email', 'POST', { email, password });
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
