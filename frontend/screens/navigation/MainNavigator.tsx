import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { usersApi } from '../../api/usersApi';
import UserBottomTabs from './UserBottomTabs';
import NGOBottomTabs from './NGOBottomTabs';

export default function MainNavigator() {
  const [accountType, setAccountType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAccountType();
  }, []);

  const checkAccountType = async () => {
    try {
      const response = await usersApi.getProfile();
      setAccountType(response.account_type);
    } catch (error) {
      setAccountType('user'); // Default to user if error
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return accountType === 'ngo' ? <NGOBottomTabs /> : <UserBottomTabs />;
}
