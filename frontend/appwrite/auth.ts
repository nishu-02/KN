import { account } from './config';
import { ID } from 'appwrite';

export async function registerUser(email: string, password: string) {
  return await account.create(ID.unique(), email, password);
}

export async function loginUser(email: string, password: string) {
  return await account.createSession(email, password);
}


export async function getCurrentUser() {
  return await account.get();
}

export async function logout() {
  return await account.deleteSession('current');
}
