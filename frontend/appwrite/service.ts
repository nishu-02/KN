import { ID, Account, Client } from 'appwrite';
import { Snackbar } from 'react-native-paper';

import { env } from './env';

const APPWRITE_ENDPOINT: string = env.APPWRITE_ENDPOINT!;
const APPWRITE_PROJECT_ID: string = env.APPWRITE_PROJECT_ID!;

type CreateUserAccount = {
  email: string;
  password: string;
  name: string;
};

type LoginUserAccount = {
  email: string;
  password: string;
};

const client = new Client();

client
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

class AppwriteService {
  private account: Account;

  constructor() {
    this.account = new Account(client);
  }

  async createAccount({ email, password, name }: CreateUserAccount) {
    try {
      const userAccount = await this.account.create(
        ID.unique(),
        email,
        password,
        name
      );
      if (userAccount) {
        return await this.login({ email, password });
      }
      return userAccount;
    } catch (error: any) {
      Snackbar.show({
        text: error.message || 'Account creation failed.',
        duration: Snackbar.LENGTH_LONG,
      });
      console.error('Appwrite Service :: createAccount ::', error);
    }
  }

  async login({ email, password }: LoginUserAccount) {
    try {
      return await this.account.createEmailSession(email, password);
    } catch (error: any) {
      Snackbar.show({
        text: error.message || 'Login failed.',
        duration: Snackbar.LENGTH_LONG,
      });
      console.error('Appwrite Service :: login ::', error);
    }
  }

  async getCurrentUser() {
    try {
      return await this.account.get();
    } catch (error: any) {
      Snackbar.show({
        text: error.message || 'Could not fetch user.',
        duration: Snackbar.LENGTH_LONG,
      });
      console.error('Appwrite Service :: getCurrentUser ::', error);
    }
  }

  async logout() {
    try {
      return await this.account.deleteSession('current');
    } catch (error: any) {
      Snackbar.show({
        text: error.message || 'Logout failed.',
        duration: Snackbar.LENGTH_LONG,
      });
      console.error('Appwrite Service :: logout ::', error);
    }
  }
}

export default new AppwriteService();
