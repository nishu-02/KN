import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function DonationsScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge">Donation Requirements</Text>
      <Text>Explore all donation opportunities and requests.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
