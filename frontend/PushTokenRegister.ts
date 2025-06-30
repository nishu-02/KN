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
      alert('Failed to get push token for push notification!');
      return;
    }
    
    try {
      // Get the push notification token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-expo-project-id', // Replace with your actual project ID
      });
      token = tokenData.data;
      
      // Save the token to your backend server
      await savePushToken(userId, token);
      console.log('Push token registered successfully:', token);
      
      return token;
    } catch (error) {
      console.error('Error getting push notification token:', error);
      throw error;
    }
  } else {
    alert('Must use physical device for Push Notifications');
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
    trigger: { seconds: 2 },
  });
}