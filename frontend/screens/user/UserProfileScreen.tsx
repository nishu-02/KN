import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Avatar, Text, Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../../core/redux/slices/authSlice';

export default function UserProfileScreen() {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigation.replace('LoginScreen'); // 🔁 Adjust to your login screen name
  };

  return (
    <View style={styles.container}>
      <Avatar.Image size={100} source={{ uri: 'https://via.placeholder.com/100' }} />
      <Text variant="titleLarge" style={styles.name}>John Doe</Text>
      <Text>Email: johndoe@example.com</Text>
      <Text>Phone: +91-9876543210</Text>
      <Button mode="contained" style={styles.button}>Edit Profile</Button>
      <Button mode="outlined" style={styles.button} onPress={handleLogout}>
        Logout
      </Button>
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
