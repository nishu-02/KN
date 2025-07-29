import { reportsApi } from './karunaApi';

export async function savePushToken(userId: string, token: string) {
  try {
    return await reportsApi.savePushToken(userId, token);
  } catch (error) {
    console.error('Error saving push token:', error);
    throw error;
  }
}
