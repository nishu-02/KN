import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { savePushToken } from './api/savePushToken';

export async function registerForPushNotificationsAsync(userId: string) {
  let token;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return null;
    }
    
    try {
      // Get the push notification token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'fb1290ad-0546-493d-a247-1fd3205e7f99', // Use the project ID from app.json
      });
      token = tokenData.data;
      
      // Save the token to your backend server
      await savePushToken(userId, token);
      console.log('Push token registered successfully:', token);
      
      return token;
    } catch (error) {
      console.error('Error getting push notification token:', error);
      
      // Check if it's an Expo Go limitation
      if (error instanceof Error && error.message.includes('Expo Go')) {
        console.warn('Push notifications are not supported in Expo Go. Use a development build instead.');
        return null;
      }
      
      // Check if it's a project ID error
      if (error instanceof Error && error.message.includes('projectId')) {
        console.error('Invalid project ID. Please check your app.json configuration.');
        return null;
      }
      
      throw error;
    }
  } else {
    console.warn('Must use physical device for Push Notifications');
    return null;
  }
}

// Function to send a test notification (useful for development)
export async function sendTestNotification() {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Test Notification",
      body: 'This is a test notification!',
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2 } as any,
  });
}