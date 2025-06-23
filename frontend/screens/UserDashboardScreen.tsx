import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function UserDashboardScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge">User Dashboard</Text>
      <Text>Welcome, regular user!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
