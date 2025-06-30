import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function UploadRescueScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineLarge">Report a Rescue</Text>
      <Text>Use camera or upload photo to report a stray animal.</Text>
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