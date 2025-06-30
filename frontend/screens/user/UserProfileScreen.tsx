import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, Button } from 'react-native-paper';

export default function UserProfileScreen() {
  return (
    <View style={styles.container}>
      <Avatar.Image size={100} source={{ uri: 'https://via.placeholder.com/100' }} />
      <Text variant="titleLarge" style={styles.name}>John Doe</Text>
      <Text>Email: johndoe@example.com</Text>
      <Text>Phone: +91-9876543210</Text>
      <Button mode="contained" style={styles.button}>Edit Profile</Button>
      <Button mode="outlined" style={styles.button}>Logout</Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  name: {
    marginVertical: 10,
  },
  button: {
    marginTop: 15,
    width: '80%',
  },
});