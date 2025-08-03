import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import NetInfo from '@react-native-community/netinfo'; // For offline detection; install via npm/yarn if needed
import { usersApi } from '../../api/usersApi';
import AuthService from '../../services/authService'; // Adjust path to your AuthService if needed
import UserBottomTabs from './UserBottomTabs';
import NGOBottomTabs from './NGOBottomTabs';

export default function MainNavigator({ navigation }: { navigation: any }) { // Add navigation prop if using React Navigation
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    checkAccountType();

    return () => unsubscribe();
  }, []);

  const checkAccountType = async () => {
    try {
      // Explicit auth check first
      const authStatus = await AuthService.checkAuthStatus();
      if (!authStatus.isLoggedIn) {
        navigation.navigate('Login'); // Redirect to login screen
        return;
      }

      const response = await usersApi.getProfile();
      setAccountType(response.account_type);
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      if (error.message?.includes('401')) {
        const newJwt = await AuthService.refreshToken();
        if (newJwt) {
          try {
            const retryResponse = await usersApi.getProfile();
            setAccountType(retryResponse.account_type);
            return;
          } catch (retryError) {
            console.error('Retry failed after token refresh:', retryError);
          }
        }
      }
      setAccountType('user'); // Safe fallback
      // Optional: Add user feedback, e.g., using react-native-toast-message
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" accessibilityLabel="Loading your dashboard" />
        <Text>Loading your dashboard...</Text>
      </View>
    );
  }

  if (isOffline) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No internet connection. Please check your network.</Text>
      </View>
    );
  }

  switch (accountType) {
    case 'ngo':
      return <NGOBottomTabs />;
    case 'user':
      return <UserBottomTabs />;
    default:
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Unknown account type. Please log in again.</Text>
        </View>
      );
  }
}
